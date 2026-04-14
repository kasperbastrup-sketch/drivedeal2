import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { refreshGmailToken } from '@/lib/refreshGmailToken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
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
        let accessToken = dealer.gmail_access_token
        if (dealer.gmail_refresh_token) {
          const newToken = await refreshGmailToken(dealer.gmail_refresh_token)
          if (newToken) {
            accessToken = newToken
            await supabase.from('dealers').update({ gmail_access_token: newToken }).eq('id', dealer.id)
          }
        }

        const segments = dealer.send_to_segments || 'all'
        const statusFilter = segments === 'cold' ? ['cold'] : segments === 'warm' ? ['warm'] : ['cold', 'warm']

        const today = new Date().toISOString().split('T')[0]
        const { data: leads } = await supabase
          .from('leads')
          .select('*')
          .eq('dealer_id', dealer.id)
          .in('status', statusFilter)
          .or(`last_contacted_at.is.null,last_contacted_at.lt.${today}`)
          .order('score', { ascending: false })
          .limit(dealer.daily_limit || 100)

        if (!leads || leads.length === 0) continue

        for (let i = 0; i < leads.length; i++) {
          const lead = leads[i]

          if (dealer.antispam) {
            const delay = Math.floor(Math.random() * 60 + 30) * 1000
            await new Promise(resolve => setTimeout(resolve, Math.min(delay, 5000)))
          }

          try {
            await sendEmail({ ...dealer, gmail_access_token: accessToken }, lead)
            totalSent++
          } catch (err) {
            console.error(`Failed to send to ${lead.email}:`, err)
            totalFailed++
          }
        }

        await supabase.from('dealers').update({ last_sent_at: new Date().toISOString() }).eq('id', dealer.id)

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

async function sendEmail(dealer: Record<string, string>, lead: Record<string, string>) {
  const isWarm = lead.status === 'warm'
  const daysNum = parseInt(lead.days_since_contact) || 0
  const senderName = dealer.sender_name || dealer.name || 'dit team'
  const dealerName = dealer.dealer_name || ''
  const leadName = lead.name ? lead.name.split(' ')[0] : 'dig'
  const language = dealer.ai_language || 'dansk'
  const tone = dealer.ai_tone || 'warm'

  const toneDesc = tone === 'professional'
    ? 'professionel og høflig'
    : tone === 'direct'
    ? 'direkte og venlig'
    : 'varm og personlig'

  const prompt = `Du er en bilsælger ved ${dealerName}. Skriv en kort, naturlig og ${toneDesc} email på ${language} til ${leadName}.

Regler du SKAL følge:
- Emailen må IKKE nævne specifikke biler som tilgængelige, priser eller tilbud
- Emailen må IKKE opfordre til prøvekørsel eller booking
- Emailen skal blot åbne en samtale og vise at du husker personen
- Max 4 korte sætninger
- Lyd som et menneske, ikke en robot
- Afslut med dit navn: ${senderName}${dealerName ? `, ${dealerName}` : ''}

${isWarm
  ? `Dette lead viste interesse for nylig. Skriv en venlig check-in der spørger om de stadig overvejer en ny bil.`
  : `Dette lead har ikke hørt fra os i ${daysNum} dage. Skriv en naturlig genoptagelse af kontakten uden at nævne hvor lang tid der er gået.`
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

  const rawEmail = createRawEmail(dealer.gmail_email, lead.email, subject, emailBody)

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

  await supabase.from('email_logs').insert({
    dealer_id: dealer.id,
    lead_id: lead.id,
    subject,
    body: emailBody,
    status: 'sent',
  })
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
