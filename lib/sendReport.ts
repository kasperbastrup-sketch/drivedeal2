export async function sendWeeklyReport(dealer: Record<string, string>, stats: Record<string, number>, accessToken: string) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })
  const subject = `DriveDeal AI — Månedlig rapport — ${dateStr}`
  const openRate = stats.emailsSent > 0 ? Math.round((stats.emailsOpened / stats.emailsSent) * 100) : 0
  const name = dealer.name || dealer.dealer_name || 'der'

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px;overflow:hidden;border:1px solid #1a1a1a;">
        
        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1100,#0a0a0a);padding:32px 40px;border-bottom:1px solid #1a1a1a;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:24px;margin-bottom:4px;">🚗</div>
                  <div style="color:#c9a96e;font-size:22px;font-weight:700;letter-spacing:-0.5px;">DriveDeal AI</div>
                  <div style="color:#555;font-size:13px;margin-top:4px;">Månedlig rapport — ${dateStr}</div>
                </td>
                <td align="right" style="vertical-align:top;">
                  <div style="background:#1a1100;border:1px solid rgba(201,169,110,0.3);border-radius:8px;padding:8px 16px;color:#c9a96e;font-size:12px;font-weight:600;">
                    📊 Månedlig rapport
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- HILSEN -->
        <tr>
          <td style="padding:32px 40px 0;">
            <div style="color:#ffffff;font-size:18px;font-weight:600;margin-bottom:8px;">Hej ${name} 👋</div>
            <div style="color:#888;font-size:14px;line-height:1.6;">Her er din månedlige oversigt fra DriveDeal AI. Systemet har arbejdet for dig hele måneden — her er resultaterne.</div>
          </td>
        </tr>

        <!-- KPI KORT -->
        <tr>
          <td style="padding:24px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="48%" style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #222;">
                  <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Emails sendt</div>
                  <div style="color:#c9a96e;font-size:32px;font-weight:700;line-height:1;">${stats.emailsSent}</div>
                  <div style="color:#555;font-size:12px;margin-top:4px;">AI-genererede emails</div>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #222;">
                  <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Åbningsrate</div>
                  <div style="color:#4caf82;font-size:32px;font-weight:700;line-height:1;">${openRate}%</div>
                  <div style="color:#555;font-size:12px;margin-top:4px;">${stats.emailsOpened} emails åbnet</div>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
              <tr>
                <td width="48%" style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #222;">
                  <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Svar modtaget</div>
                  <div style="color:#a78bfa;font-size:32px;font-weight:700;line-height:1;">${stats.replies}</div>
                  <div style="color:#555;font-size:12px;margin-top:4px;">Leads der svarede</div>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #222;">
                  <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Bookinger</div>
                  <div style="color:#4caf82;font-size:32px;font-weight:700;line-height:1;">${stats.bookings}</div>
                  <div style="color:#555;font-size:12px;margin-top:4px;">Prøveture booket</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- DATABASE STATUS -->
        <tr>
          <td style="padding:0 40px 24px;">
            <div style="background:#1a1a1a;border-radius:12px;padding:20px;border:1px solid #222;">
              <div style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Database status</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#ccc;font-size:14px;">🚗 Leads i database</td>
                  <td align="right" style="color:#c9a96e;font-size:14px;font-weight:600;">${stats.totalLeads}</td>
                </tr>
              </table>
            </div>
          </td>
        </tr>

        <!-- BESKED -->
        <tr>
          <td style="padding:0 40px 24px;">
            <div style="background:${stats.bookings > 0 ? 'rgba(76,175,130,0.1)' : 'rgba(201,169,110,0.05)'};border:1px solid ${stats.bookings > 0 ? 'rgba(76,175,130,0.3)' : 'rgba(201,169,110,0.2)'};border-radius:12px;padding:20px;">
              <div style="color:${stats.bookings > 0 ? '#4caf82' : '#c9a96e'};font-size:14px;line-height:1.6;">
                ${stats.bookings > 0
                  ? `🎉 Tillykke med ${stats.bookings} booking${stats.bookings > 1 ? 'er' : ''} denne måned! Systemet leverer resultater.`
                  : '⚡ Systemet arbejder kontinuerligt på at varme dine leads op. Resultater bygges over tid — hold fast.'}
              </div>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 32px;" align="center">
            <a href="https://drivedeal.live/analytics" style="display:inline-block;background:linear-gradient(135deg,#c9a96e,#b8860b);color:#1a1100;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;">
              Se alle detaljer i appen →
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #1a1a1a;">
            <div style="color:#444;font-size:12px;text-align:center;line-height:1.6;">
              Du modtager denne rapport fordi du er tilmeldt DriveDeal AI.<br>
              Du kan slå rapporten fra under <a href="https://drivedeal.live/integrations" style="color:#c9a96e;text-decoration:none;">Integrationer</a> i appen.
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const email = [
    `From: ${dealer.gmail_email}`,
    `To: ${dealer.gmail_email}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    htmlBody,
  ].join('\r\n')

  const raw = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || 'Report send failed')
  }
}
