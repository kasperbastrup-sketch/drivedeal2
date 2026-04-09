'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dealer, setDealer] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      router.push('/login?signup=success')
    }, 1000)
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
          <input className="field-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 8 tegn" style={{width:'100%',marginBottom:20}} required minLength={8}/>

          <div style={{background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.2)',borderRadius:8,padding:12,marginBottom:20,fontSize:11,color:'var(--text2)'}}>
            <div style={{color:'var(--gold)',fontWeight:600,marginBottom:4}}>✓ 14 dages gratis prøveperiode</div>
            <div>✓ Ingen kreditkort påkrævet</div>
            <div>✓ Opsætning tager under 20 minutter</div>
          </div>

          <button type="submit" className="btn btn-gold" style={{width:'100%',justifyContent:'center',padding:'10px 20px',fontSize:14}} disabled={loading}>
            {loading ? 'Opretter konto...' : 'Opret gratis konto →'}
          </button>
        </form>

        <div style={{marginTop:20,textAlign:'center',fontSize:12,color:'var(--text2)'}}>
          Har du allerede en konto? <a href="/login" style={{color:'var(--gold)'}}>Log ind</a>
        </div>
      </div>
    </div>
  )
}
