'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AppShell from './AppShell'

const publicPaths = ['/login', '/signup', '/reset-password', '/update-password', '/home', '/privacy', '/terms', '/api/cron', '/api/auth', '/unsubscribe']

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'checking'|'public'|'authed'>('checking')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function check() {
      const isPublic = publicPaths.some(p => pathname.startsWith(p))
      const { data: { session } } = await supabase.auth.getSession()

      if (!session && !isPublic) {
        router.push('/login')
        return
      }

      if (session && (pathname === '/login' || pathname === '/signup')) {
        router.push('/')
        return
      }

      setStatus(isPublic ? 'public' : 'authed')
    }
    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const isPublic = publicPaths.some(p => pathname.startsWith(p))
      if (!session && !isPublic) router.push('/login')
    })

    return () => subscription.unsubscribe()
  }, [pathname])

  if (status === 'checking') {
    return (
      <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,#c9a96e,#b8860b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,margin:'0 auto 16px'}}>🚗</div>
          <div style={{fontSize:13,color:'#555'}}>Indlæser...</div>
        </div>
      </div>
    )
  }

  if (status === 'public') return <>{children}</>

  return <AppShell>{children}</AppShell>
}
