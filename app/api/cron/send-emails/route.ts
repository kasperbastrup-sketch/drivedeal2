import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { refreshGmailToken } from '@/lib/refreshGmailToken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || `Bearer ${new URL(req.url).searchParams.get('secret')}`
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: dealers } = await supabase
      .from('dealers')
      .select('*')
      .eq('gmail_connected', true)
      .not('gmail_access_token', 'is', null)

    if (!dealers || dealers.length === 0) {
      return NextResponse.json({ message: 'No connected dealers' })
    }

    let totalSent = 0
    let totalFailed = 0

    for (const dealer of dealers) {
      try {
        // Refresh token
        let accessToken = dealer.gmail_access_token
        if (dealer.gmail_refresh_token) {
          const newToken = await refreshGmailToken(dealer.gmail_refresh_token)
          if (newToken) {
            accessToken = newToken
            await supabase.from('dealers').update({ gmail_access_token: newToken }).eq('id', dealer.id)
          }
        }

        const dealerWithToken = { ...dealer, gmail_access_token: accessToken }
        const now = new Date()
        const today = now.toISOString().split('T')[0]
        const segments = dealer.send_to_segments || 'all'

        // FASE 1: Genaktiver leads der har ventet 6 måneder (unresponsive → cold)
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
        await supabase
          .from('leads')
          .update({ status: 'cold', contact_count: 0, reactivation_date: null })
          .eq('dealer_id', dealer.id)
          .eq('status', 'unresponsive')
          .lt('reactivation_date', sixMonthsAgo.toISOString())

        // FASE 2: Sæt leads til unresponsive efter 90 dage uden svar (sent → unresponsive)
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
        const reactivateAt = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
        await supabase
          .from('leads')
          .update({ status: 'unresponsive', reactivation_date: reactivateAt })
          .eq('dealer_id', dealer.id)
          .eq('status', 'sent')
          .lt('last_contacted_at', ninetyDaysAgo.toISOString())

        // Håndter aktive sekvenser
        const { data: activeSequences } = await supabase
          .from('sequences')
          .select('*')
          .eq('dealer_id', dealer.id)
          .eq('status', 'active')

        if (activeSequences && activeSequences.length > 0) {
          for (const seq of activeSequences) {
            const steps = seq.steps || []

            // Leads der er i sekvensen — tjek om næste email skal sendes
            const { data: seqLeads } = await supabase
              .from('leads')
              .select('*')
              .eq('dealer_id', dealer.id)
              .eq('sequence_id', seq.id)
              .not('status', 'eq', 'booked')
              .not('status', 'eq', 'replied')

            for (const lead of (seqLeads || [])) {
              if (lead.last_contacted_at && lead.last_contacted_at.startsWith(today)) continue

              const currentStep = lead.sequence_step || 0
              const nextStep = currentStep + 1
              if (nextStep >= steps.length) continue

              const nextStepData = steps[nextStep]
              const dayDelay = parseInt(nextStepData.day?.replace(/[^0-9]/g, '') || '7')
              const startedAt = new Date(lead.sequence_started_at || lead.created_at)
              const daysSinceStart = Math.floor((Date.now() - startedAt.getTime()) / (1000 * 60 * 60 * 24))

              if (daysSinceStart >= dayDelay) {
                try {
                  await sendSequenceEmail(dealerWithToken, lead, seq, nextStep, steps[nextStep])
                  totalSent++
                } catch (err) {
                  console.error(`Sequence email failed for ${lead.email}:`, err)
                  totalFailed++
                }
                if (dealer.antispam) {
                  await new Promise(r => setTimeout(r, Math.floor(Math.random() * 60 + 30) * 1000))
                }
              }
            }

            // Nye leads der skal starte i sekvensen
            const activeFilter = segments === 'cold' ? ['cold'] : segments === 'warm' ? ['warm'] : ['cold', 'warm']
            const { data: newLeads } = await supabase
              .from('leads')
              .select('*')
              .eq('dealer_id', dealer.id)
              .in('status', activeFilter)
              .is('sequence_id', null)
              .or(`last_contacted_at.is.null,last_contacted_at.lt.${today}`)
              .order('score', { ascending: false })
              .limit(dealer.daily_limit || 100)

            for (const lead of (newLeads || [])) {
              if (steps.length === 0) continue
              try {
                await sendSequenceEmail(dealerWithToken, lead, seq, 0, steps[0])
                totalSent++
              } catch (err) {
                console.error(`Sequence start failed for ${lead.email}:`, err)
                totalFailed++
              }
              if (dealer.antispam) {
                await new Promise(r => setTimeout(r, Math.floor(Math.random() * 60 + 30) * 1000))
              }
            }
          }
        } else {
          // FASE 3: Ingen aktive sekvenser — send standard daglig email
          const activeFilter = segments === 'cold' ? ['cold'] : segments === 'warm' ? ['warm'] : ['cold', 'warm']
          const { data: leads } = await supabase
            .from('leads')
            .select('*')
            .eq('dealer_id', dealer.id)
            .in('status', activeFilter)
            .or(`last_contacted_at.is.null,last_contacted_at.lt.${today}`)
            .order('score', { ascending: false })
            .limit(dealer.daily_limit || 100)

          for (const lead of (leads || [])) {
            if (dealer.antispam) {
              await new Promise(r => setTimeout(r, Math.floor(Math.random() * 60 + 30) * 1000))
            }
            try {
              await sendStandardEmail(dealerWithToken, lead)
              await supabase.from('leads').update({
                contact_count: (parseInt(lead.contact_count) || 0) + 1
              }).eq('id', lead.id)
              totalSent++
            } catch (err) {
              console.error(`Standard email failed for ${lead.email}:`, err)
              totalFailed++
            }
          }
        }

        await supabase.from('dealers').update({ last_sent_at: now.toISOString() }).eq('id', dealer.id)

      } catch (err) {
        console.error(`Failed for dealer ${dealer.id}:`, err)
      }
    }

    return NextResponse.json({ success: true, totalSent, totalFailed })
  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function sendSequenceEmail(
  dealer: Record<string, string>,
  lead: Record<string, string>,
  sequence: Record<string, any>,
  stepIndex: number,
  stepData: Record<string, string>
) {
  const senderName = dealer.sender_name || dealer.name || 'dit team'
  const dealerName = dealer.dealer_name || ''
  const leadName = lead.name ? lead.name.split(' ')[0] : 'dig'
  const language = dealer.ai_language || 'dansk'
  const tone = dealer.ai_tone || 'warm'
  const isFirst = stepIndex === 0
  const isLast = stepIndex === (sequence.steps?.length || 1) - 1
  const toneDesc = tone === 'professional' ? 'professionel og høflig' : tone === 'direct' ? 'direkte og venlig' : 'varm og personlig'

  const contextDesc = isFirst
    ? 'Dette er den første kontakt. Åbn samtalen naturligt uden at nævne tidligere kontakt.'
    : isLast
    ? 'Dette er den sidste email. Skriv en afrunding der lader døren stå åben uden pres.'
    : `Dette er opfølgning nr. ${stepIndex + 1}. Leadet har ikke svaret endnu. Vær kort og naturlig.`

  const openingVariations = [
    'Start med en uformel personlig hilsen',
    'Start med et åbent spørgsmål',
    'Start direkte og kort uden indledning',
    'Start med noget generelt om at finde den rigtige bil',
    'Start med at sige du ville høre hvordan det går',
  ]
  const randomOpening = openingVariations[Math.floor(Math.random() * openingVariations.length)]

  const prompt = `Du er en bilsælger ved ${dealerName}. Skriv en naturlig og ${toneDesc} email på ${language} til ${leadName}.

Regler du SKAL følge:
- Emailen må IKKE nævne specifikke biler som tilgængelige, priser eller tilbud
- Emailen må IKKE opfordre til prøvekørsel eller booking
- Nævn IKKE tidligere samtaler eller møder
- Max 4 korte sætninger
- ${randomOpening}
- Lyd som et rigtigt menneske — ikke en robot
- Afslut med: ${senderName}${dealerName ? `, ${dealerName}` : ''}

${contextDesc}

Tilføj til sidst på en ny linje: "Ønsker du ikke at modtage flere emails: https://drivedeal.live/unsubscribe?email=${lead.email}&dealer=${dealer.id}"`

  const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const aiData = await aiRes.json()
  const emailBody = aiData.content?.[0]?.text || ''
  if (!emailBody) throw new Error('AI generated empty email')

  const subjectOptions = [
    `Hej ${leadName} — er du stadig på udkig?`,
    `Hej ${leadName} — jeg tænkte på dig`,
    `Hej ${leadName} — bare en hurtig hilsen`,
  ]
  const subject = subjectOptions[stepIndex % subjectOptions.length]

  const { data: logEntry } = await supabase.from('email_logs').insert({
    dealer_id: dealer.id,
    lead_id: lead.id,
    subject,
    body: emailBody,
    status: 'sent',
  }).select().single()

  const trackingPixel = logEntry ? `\n\n<img src="https://drivedeal.live/api/track/open?id=${logEntry.id}" width="1" height="1" style="display:none"/>` : ''
  const rawEmail = createRawEmail(dealer.gmail_email, lead.email, subject, emailBody + trackingPixel)

  const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${dealer.gmail_access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawEmail }),
  })

  if (!gmailRes.ok) {
    const err = await gmailRes.json()
    throw new Error(err.error?.message || 'Gmail send failed')
  }

  await supabase.from('leads').update({
    status: 'sent',
    last_contacted_at: new Date().toISOString(),
    sequence_id: sequence.id,
    sequence_step: stepIndex,
    sequence_started_at: stepIndex === 0 ? new Date().toISOString() : lead.sequence_started_at,
  }).eq('id', lead.id)
}

async function sendStandardEmail(dealer: Record<string, string>, lead: Record<string, string>) {
  const isWarm = lead.status === 'warm'
  const daysNum = parseInt(lead.days_since_contact) || 0
  const senderName = dealer.sender_name || dealer.name || 'dit team'
  const dealerName = dealer.dealer_name || ''
  const leadName = lead.name ? lead.name.split(' ')[0] : 'dig'
  const language = dealer.ai_language || 'dansk'
  const tone = dealer.ai_tone || 'warm'
  const toneDesc = tone === 'professional' ? 'professionel og høflig' : tone === 'direct' ? 'direkte og venlig' : 'varm og personlig'

  const openingStyles = [
    'Start med at nævne noget generelt om bilmarkedet lige nu',
    'Start med en personlig og uformel hilsen',
    'Start direkte med dit ærinde uden small talk',
    'Start med et spørgsmål der inviterer til svar',
    'Start med at sige at du tænkte på personen uden grund',
  ]
  const lengthStyles = [
    'Skriv 2 meget korte sætninger',
    'Skriv 3 sætninger i naturligt tempo',
    'Skriv 4 sætninger — den ene må gerne være meget kort',
  ]
  const randomOpening = openingStyles[Math.floor(Math.random() * openingStyles.length)]
  const randomLength = lengthStyles[Math.floor(Math.random() * lengthStyles.length)]

  const prompt = `Du er en bilsælger ved ${dealerName}. Skriv en naturlig og ${toneDesc} email på ${language} til ${leadName}.

Regler du SKAL følge:
- Emailen må IKKE nævne specifikke biler som tilgængelige, priser eller tilbud
- Emailen må IKKE opfordre til prøvekørsel eller booking
- Nævn IKKE tidligere samtaler, møder eller kontakt
- ${randomLength}
- ${randomOpening}
- Lyd som et rigtigt menneske — ikke en robot eller sælger
- Afslut med: ${senderName}${dealerName ? `, ${dealerName}` : ''}

${isWarm
    ? 'Dette lead har vist interesse for en bil. Åbn samtalen naturligt uden pres.'
    : 'Åbn en samtale naturligt. Skriv som om du bare ville sige hej og høre om de stadig overvejer en ny bil.'
  }

Tilføj til sidst på en ny linje: "Ønsker du ikke at modtage flere emails: https://drivedeal.live/unsubscribe?email=${lead.email}&dealer=${dealer.id}"`

  const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const aiData = await aiRes.json()
  const emailBody = aiData.content?.[0]?.text || ''
  if (!emailBody) throw new Error('AI generated empty email')

  const subject = isWarm
    ? `Hej ${leadName} — er du stadig på udkig?`
    : `Hej ${leadName} — jeg tænkte på dig`

  const { data: logEntry } = await supabase.from('email_logs').insert({
    dealer_id: dealer.id,
    lead_id: lead.id,
    subject,
    body: emailBody,
    status: 'sent',
  }).select().single()

  const trackingPixel = logEntry ? `\n\n<img src="https://drivedeal.live/api/track/open?id=${logEntry.id}" width="1" height="1" style="display:none"/>` : ''
  const rawEmail = createRawEmail(dealer.gmail_email, lead.email, subject, emailBody + trackingPixel)

  const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${dealer.gmail_access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawEmail }),
  })

  if (!gmailRes.ok) {
    const err = await gmailRes.json()
    throw new Error(err.error?.message || 'Gmail send failed')
  }

  await supabase.from('leads').update({
    status: 'sent',
    last_contacted_at: new Date().toISOString(),
  }).eq('id', lead.id)
}

function createRawEmail(from: string, to: string, subject: string, body: string): string {
  const email = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body,
  ].join('\r\n')

  return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
