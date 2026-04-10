'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const publicPaths = ['/login', '/signup', '/reset-password', '/update-password']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession()
      const isPublic = publicPaths.some(p => pathname.startsWith(p))

      if (!session && !isPublic) {
        router.push('/login')
        return
      }

      if (session && isPublic) {
        router.push('/')
        return
      }

      setChecking(false)
    }
    check()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const isPublic = publicPaths.some(p => pathname.startsWith(p))
      if (!session && !isPublic) router.push('/login')
      if (session && isPublic) router.push('/')
    })

    return () => subscription.unsubscribe()
  }, [pathname])

  if (checking) {
    return (
      <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,var(--gold3),var(--gold))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,margin:'0 auto 16px'}}>🚗</div>
          <div style={{fontSize:13,color:'var(--text3)'}}>Indlæser...</div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
