'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [dealerName, setDealerName] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!accepted) { setError('Du skal acceptere vilkår og privatlivspolitik for at fortsætte.'); return }
    setLoading(true)
    setError('')

    const { data, error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError) { setError(signupError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('dealers').insert({
        id: data.user.id,
        email,
        name,
        dealer_name: dealerName,
        currency: 'DKK',
        avg_car_price: 260000,
        ai_language: 'dansk',
        app_language: 'da',
        antispam: true,
        daily_limit: 100,
        report_frequency: 'weekly',
      })
    }

    router.push('/')
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,#c9a96e,#b8860b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,margin:'0 auto 16px'}}>🚗</div>
          <div style={{fontSize:22,fontWeight:700,color:'#fff',marginBottom:6}}>Opret konto</div>
          <div style={{fontSize:13,color:'#666'}}>14 dages gratis prøveperiode · Intet kreditkort</div>
        </div>

        <form onSubmit={handleSignup} style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:16,padding:28}}>
          {error && (
            <div style={{background:'rgba(224,85,85,.1)',border:'1px solid rgba(224,85,85,.3)',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#e05555',marginBottom:16}}>
              {error}
            </div>
          )}

          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,color:'#888',textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6}}>Dit navn</label>
            <input className="field-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Lars Jensen" style={{width:'100%'}} required/>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,color:'#888',textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6}}>Forhandlernavn</label>
            <input className="field-input" value={dealerName} onChange={e=>setDealerName(e.target.value)} placeholder="Jensen Biler ApS" style={{width:'100%'}} required/>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,color:'#888',textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6}}>Email</label>
            <input className="field-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="lars@jensenbiler.dk" style={{width:'100%'}} required/>
          </div>

          <div style={{marginBottom:20}}>
            <label style={{fontSize:11,color:'#888',textTransform:'uppercase',letterSpacing:1,display:'block',marginBottom:6}}>Password</label>
            <input className="field-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 6 tegn" style={{width:'100%'}} required minLength={6}/>
          </div>

          <div style={{marginBottom:20,display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer'}} onClick={()=>setAccepted(p=>!p)}>
            <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${accepted?'#c9a96e':'#333'}`,background:accepted?'#c9a96e':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1,transition:'all .15s'}}>
              {accepted && <span style={{color:'#1a1100',fontSize:11,fontWeight:700}}>✓</span>}
            </div>
            <div style={{fontSize:12,color:'#888',lineHeight:1.6,userSelect:'none'}}>
              Jeg accepterer DriveDeal AIs{' '}
              <a href="/privacy#terms" target="_blank" onClick={e=>e.stopPropagation()} style={{color:'#c9a96e',textDecoration:'none'}}>vilkår og betingelser</a>
              {' '}og{' '}
              <a href="/privacy" target="_blank" onClick={e=>e.stopPropagation()} style={{color:'#c9a96e',textDecoration:'none'}}>privatlivspolitik</a>
            </div>
          </div>

          <button type="submit" disabled={loading || !accepted} className="btn btn-gold" style={{width:'100%',justifyContent:'center',opacity:(!accepted||loading)?0.5:1}}>
            {loading ? 'Opretter...' : 'Opret gratis konto →'}
          </button>
        </form>

        <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'#555'}}>
          Har du allerede en konto?{' '}
          <a href="/login" style={{color:'#c9a96e',textDecoration:'none'}}>Log ind</a>
        </div>
      </div>
    </div>
  )
}
