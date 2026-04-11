'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dealer, setDealer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, dealer_name: dealer }
        }
      })

      if (signUpError) throw signUpError

      if (data.user) {
        await supabase.from('dealers').insert({
          id: data.user.id,
          name,
          email,
          dealer_name: dealer,
        })
      }

      router.push('/login?signup=success')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Noget gik galt. Prøv igen.')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:440,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:16,padding:36,boxShadow:'0 40px 80px rgba(0,0,0,.6)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:28}}>
          <div style={{width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,var(--gold3),var(--gold))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🚗</div>
          <div>
            <div className="font-head" style={{fontSize:17,fontWeight:700,color:'var(--text)'}}>DriveDeal AI</div>
            <div style={{fontSize:10,color:'var(--gold)',letterSpacing:2,textTransform:'uppercase'}}>Lead Engine</div>
          </div>
        </div>

        <div className="font-head" style={{fontSize:20,fontWeight:700,marginBottom:4}}>Opret konto</div>
        <div style={{fontSize:12,color:'var(--text2)',marginBottom:24}}>Kom i gang på under 2 minutter</div>

        <form onSubmit={handleSubmit}>
          <div className="label" style={{marginTop:0}}>Forhandlernavn</div>
          <input className="field-input" value={dealer} onChange={e=>setDealer(e.target.value)} placeholder="Mercedes-Benz Madrid" style={{width:'100%'}} required/>

          <div className="label">Dit navn</div>
          <input className="field-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Carlos Fernández" style={{width:'100%'}} required/>

          <div className="label">Email</div>
          <input className="field-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="carlos@mercedesimadrid.es" style={{width:'100%'}} required/>

          <div className="label">Password</div>
          <input className="field-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 6 tegn" style={{width:'100%',marginBottom:20}} required minLength={6}/>

          {error && <div style={{fontSize:12,color:'var(--red)',marginBottom:12,padding:'8px 12px',background:'var(--redbg)',borderRadius:7}}>{error}</div>}

          <div style={{background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.2)',borderRadius:8,padding:12,marginBottom:20,fontSize:11,color:'var(--text2)'}}>
            <div style={{color:'var(--gold)',fontWeight:600,marginBottom:4}}>✓ 14 dages gratis prøveperiode</div>
            <div>✓ Ingen kreditkort påkrævet</div>
            <div>✓ Opsætning tager under 20 minutter</div>
          </div>

          <button type="submit" className="btn btn-gold" style={{width:'100%',justifyContent:'center',padding:'10px 20px',fontSize:14}} disabled={loading}>
            {loading ? 'Opretter konto...' : 'Opret gratis konto →'}
          </button>
        </form>

        <div style={{marginTop:20,textAlign:'center',fontSize:12,color:'var(--text2)'}}><a href="/privacy" style={{color:'var(--text3)',textDecoration:'none',fontSize:11}}>Privatlivspolitik</a><br/><br/>
          Har du allerede en konto? <a href="/login" style={{color:'var(--gold)'}}>Log ind</a>
        </div>
      </div>
    </div>
  )
}
