import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { lead, purpose, language } = await req.json()

  const purposeMap: Record<string,string> = {
    proevekoer: 'invitere til en gratis, uforpligtende prøvekørsel af deres drømmebil',
    tilbud: 'præsentere et eksklusivt personligt tilbud kun til dem',
    ny_model: 'fortælle om en spændende ny model der matcher deres interesser perfekt',
    check_in: 'tage en blød og nysgerrig check-in om de stadig leder efter bil',
    ev: 'vække interesse for elektriske biler og invitere til EV demonstration',
    urgency: 'skabe urgency med et tidsbegrænset tilbud der udløber om 48 timer',
  }

  const prompt = `Du er en erfaren og varm bilsælger hos en premium bilforhandler. Skriv en kort, personlig og engagerende salgs-email på ${language}.

Lead information:
- Navn: ${lead.name}
- Bil interesse: ${lead.car}
- Siden sidst kontaktet: ${lead.days} dage
- Kilde: ${lead.source}

Formål: ${purposeMap[purpose] || purposeMap.proevekoer}

Regler:
1. Max 4 korte afsnit
2. Brug kundens fornavn
3. Nævn specifikt bilmodellen
4. Én klar call-to-action
5. Afslut med: Carlos · Mercedes-Benz Barcelona · +34 93 123 45 67
6. Skriv varmt og autentisk
7. SVAR KUN med JSON: {"subject":"EMNE","body":"TEKST MED \\n FOR LINJESKIFT"}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = (message.content[0] as {type:string;text:string}).text
    const clean = raw.replace(/```json|```/g,'').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ subject: 'Email til ' + lead.name, body: 'Kunne ikke generere. Prøv igen.' })
  }
}
