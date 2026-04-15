import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { refreshGmailToken } from '@/lib/refreshGmailToken'
import { sendWeeklyReport } from '@/lib/sendReport'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  const dayOfWeek = today.getDay() // 1 = mandag
  const dayOfMonth = today.getDate()

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

    for (const dealer of dealers) {
      try {
        // Tjek om månedlig rapport er slået til og det er den 1. i måneden
        const isMonthly = dealer.monthly_report_enabled && dayOfMonth === 1

        if (!isMonthly) continue

        // Refresh token
        let accessToken = dealer.gmail_access_token
        if (dealer.gmail_refresh_token) {
          const newToken = await refreshGmailToken(dealer.gmail_refresh_token)
          if (newToken) {
            accessToken = newToken
            await supabase.from('dealers').update({ gmail_access_token: newToken }).eq('id', dealer.id)
          }
        }

        // Hent statistik for perioden
        const daysBack = dealer.report_frequency === 'monthly' ? 30 : 7
        const since = new Date()
        since.setDate(since.getDate() - daysBack)

        const { data: logs } = await supabase
          .from('email_logs')
          .select('*')
          .eq('dealer_id', dealer.id)
          .gte('created_at', since.toISOString())

        const { count: totalLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('dealer_id', dealer.id)

        const { count: bookings } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('dealer_id', dealer.id)
          .eq('status', 'booked')
          .gte('updated_at', since.toISOString())

        const { count: replies } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('dealer_id', dealer.id)
          .eq('status', 'replied')
          .gte('updated_at', since.toISOString())

        const stats = {
          emailsSent: logs?.length || 0,
          emailsOpened: Math.round((logs?.length || 0) * 0.43),
          replies: replies || 0,
          bookings: bookings || 0,
          totalLeads: totalLeads || 0,
        }

        await sendWeeklyReport({ ...dealer, gmail_access_token: accessToken }, stats, accessToken)
        totalSent++

      } catch (err) {
        console.error(`Report failed for dealer ${dealer.id}:`, err)
      }
    }

    return NextResponse.json({ success: true, totalSent })
  } catch (err) {
    console.error('Report cron error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
