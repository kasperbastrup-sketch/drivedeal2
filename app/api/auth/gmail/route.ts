import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/gmail-callback`

  // Hent bruger fra cookie
  const cookieHeader = req.headers.get('cookie') || ''
  
  // Prøv alle mulige Supabase cookie formater
  let userId = ''
  
  // Format 1: sb-xxx-auth-token
  const match1 = cookieHeader.match(/sb-[^=]+-auth-token=([^;]+)/)
  if (match1) {
    try {
      const decoded = decodeURIComponent(match1[1])
      const data = JSON.parse(decoded)
      userId = data?.user?.id || data?.[0]?.user?.id || ''
    } catch {}
  }

  // Format 2: supabase-auth-token
  if (!userId) {
    const match2 = cookieHeader.match(/supabase-auth-token=([^;]+)/)
    if (match2) {
      try {
        const decoded = decodeURIComponent(match2[1])
        const data = JSON.parse(decoded)
        userId = data?.user?.id || ''
      } catch {}
    }
  }

  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
  ].join(' ')

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', clientId!)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scopes)
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  // Send userId med som state så vi kan hente det i callback
  url.searchParams.set('state', userId)

  return NextResponse.redirect(url.toString())
}
