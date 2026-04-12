export async function refreshGmailToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    const data = await res.json()

    if (!data.access_token) {
      console.error('Token refresh failed:', data)
      return null
    }

    return data.access_token
  } catch (err) {
    console.error('Token refresh error:', err)
    return null
  }
}
