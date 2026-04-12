export async function sendWeeklyReport(dealer: Record<string, string>, stats: Record<string, number>, accessToken: string) {
  const subject = `DriveDeal rapport — ${new Date().toLocaleDateString('da-DK', { day: 'numeric', month: 'long' })}`
  
  const body = `Hej ${dealer.name || dealer.dealer_name},

Her er din ${dealer.report_frequency === 'monthly' ? 'månedlige' : 'ugentlige'} rapport fra DriveDeal AI.

📧 Emails sendt: ${stats.emailsSent}
👀 Emails åbnet: ${stats.emailsOpened} (${stats.emailsSent > 0 ? Math.round((stats.emailsOpened / stats.emailsSent) * 100) : 0}%)
💬 Svar modtaget: ${stats.replies}
📅 Bookinger: ${stats.bookings}
🚗 Leads i database: ${stats.totalLeads}

${stats.bookings > 0 ? `Tillykke med ${stats.bookings} booking${stats.bookings > 1 ? 'er' : ''}! 🎉` : 'Systemet arbejder på at varme dine leads op — resultater kommer snart.'}

Log ind på drivedeal.live for at se alle detaljer.

Med venlig hilsen,
DriveDeal AI

---
Du modtager denne rapport fordi du er tilmeldt DriveDeal AI. 
Ønsker du ikke at modtage rapporter, kan du ændre det i dine indstillinger på drivedeal.live/settings.`

  const email = [
    `From: ${dealer.gmail_email}`,
    `To: ${dealer.gmail_email}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body,
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
