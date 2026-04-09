'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email, password, redirect: false
    })
    if (res?.ok) {
      router.push('/')
    } else {
      setError('Forkert email eller password')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:400,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:16,padding:36,boxShadow:'0 40px 80px rgba(0,0,0,.6)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:28}}>
          <div style={{width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,var(--gold3),var(--gold))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🚗</div>
          <div>
            <div className="font-head" style={{fontSize:17,fontWeight:700,color:'var(--text)'}}>DriveDeal AI</div>
            <div style={{fontSize:10,color:'var(--gold)',letterSpacing:2,textTransform:'uppercase'}}>Lead Engine</div>
          </div>
        </div>

        <div className="font-head" style={{fontSize:20,fontWeight:700,marginBottom:4}}>Log ind</div>
        <div style={{fontSize:12,color:'var(--text2)',marginBottom:24}}>Velkommen tilbage</div>

        <form onSubmit={handleSubmit}>
          <div className="label" style={{marginTop:0}}>Email</div>
          <input className="field-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="din@email.com" style={{width:'100%',marginBottom:12}} required/>

          <div className="label">Password</div>
          <input className="field-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={{width:'100%',marginBottom:20}} required/>

          {error && <div style={{fontSize:12,color:'var(--red)',marginBottom:12}}>{error}</div>}

          <button type="submit" className="btn btn-gold" style={{width:'100%',justifyContent:'center',padding:'10px 20px',fontSize:14}} disabled={loading}>
            {loading ? 'Logger ind...' : 'Log ind →'}
          </button>
        </form>

        <div style={{marginTop:20,textAlign:'center',fontSize:12,color:'var(--text2)'}}>
          Har du ikke en konto? <a href="/signup" style={{color:'var(--gold)'}}>Opret konto</a>
        </div>

        <div style={{marginTop:24,padding:12,background:'var(--surface2)',borderRadius:8,fontSize:11,color:'var(--text2)'}}>
          <div style={{marginBottom:4,fontWeight:600,color:'var(--text)'}}>Demo login:</div>
          <div>Email: demo@drivedeal.io</div>
          <div>Password: demo1234</div>
        </div>
      </div>
    </div>
  )
}
