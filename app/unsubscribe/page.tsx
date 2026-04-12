'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Unsubscribe() {
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading')

  useEffect(() => {
    async function unsubscribe() {
      const params = new URLSearchParams(window.location.search)
      const email = params.get('email')
      const dealerId = params.get('dealer')

      if (!email || !dealerId) { setStatus('error'); return }

      const { error } = await supabase.from('blacklist').insert({
        dealer_id: dealerId,
        email: email.toLowerCase().trim(),
        reason: 'Afmeldt via email link',
      })

      if (error && error.code !== '23505') { setStatus('error'); return }
      setStatus('success')
    }
    unsubscribe()
  }, [])

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{textAlign:'center',maxWidth:480,padding:40}}>
        <div style={{fontSize:48,marginBottom:20}}>
          {status === 'loading' ? '⏳' : status === 'success' ? '✓' : '❌'}
        </div>
        <h1 style={{fontSize:24,fontWeight:700,color:'#fff',marginBottom:12}}>
          {status === 'loading' ? 'Behandler...' : status === 'success' ? 'Du er afmeldt' : 'Noget gik galt'}
        </h1>
        <p style={{fontSize:14,color:'#888',lineHeight:1.6}}>
          {status === 'loading' ? 'Vent venligst...'
            : status === 'success' ? 'Din email er fjernet fra listen. Du vil ikke modtage flere emails fra denne forhandler.'
            : 'Prøv igen eller kontakt forhandleren direkte.'}
        </p>
      </div>
    </div>
  )
}
