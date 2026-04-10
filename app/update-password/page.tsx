'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords matcher ikke'); return }
    if (password.length < 6) { setError('Password skal være mindst 6 tegn'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/?password=updated')
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

        <div className="font-head" style={{fontSize:20,fontWeight:700,marginBottom:4}}>Nyt password</div>
        <div style={{fontSize:12,color:'var(--text2)',marginBottom:24}}>Vælg et nyt password til din konto</div>

        <form onSubmit={handleSubmit}>
          <div className="label" style={{marginTop:0}}>Nyt password</div>
          <input className="field-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 6 tegn" style={{width:'100%',marginBottom:12}} required/>

          <div className="label">Bekræft password</div>
          <input className="field-input" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Gentag password" style={{width:'100%',marginBottom:20}} required/>

          {error && <div style={{fontSize:12,color:'var(--red)',marginBottom:12,padding:'8px 12px',background:'var(--redbg)',borderRadius:7}}>{error}</div>}

          <button type="submit" className="btn btn-gold" style={{width:'100%',justifyContent:'center',padding:'10px 20px'}} disabled={loading}>
            {loading ? 'Gemmer...' : 'Gem nyt password →'}
          </button>
        </form>
      </div>
    </div>
  )
}
