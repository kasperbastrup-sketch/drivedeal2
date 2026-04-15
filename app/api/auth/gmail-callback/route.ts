import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // userId sendt fra gmail/route.ts

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/integrations?error=no_code`)
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/gmail-callback`,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (!tokens.access_token) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/integrations?error=no_token`)
    }

    // Hent brugerens Gmail email
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const userInfo = await userRes.json()

    // Brug state (userId) til at finde dealer
    let userId = state || ''

    // Fallback: find dealer via gmail email
    if (!userId) {
      const { data: dealer } = await supabase
        .from('dealers')
        .select('id')
        .eq('email', userInfo.email)
        .single()
      userId = dealer?.id || ''
    }

    if (!userId) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?error=session_expired`)
    }

    const { error } = await supabase.from('dealers').update({
      gmail_access_token: tokens.access_token,
      gmail_refresh_token: tokens.refresh_token,
      gmail_email: userInfo.email,
      gmail_connected: true,
    }).eq('id', userId)

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/integrations?error=db_error`)
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/integrations?gmail=connected`)

  } catch (err) {
    console.error('Gmail OAuth error:', err)
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/integrations?error=oauth_failed`)
  }
}
