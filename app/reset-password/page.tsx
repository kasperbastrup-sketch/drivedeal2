'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://drivedeal2.vercel.app/update-password',
    })
    setSent(true)
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

        {sent ? (
          <div>
            <div className="font-head" style={{fontSize:20,fontWeight:700,marginBottom:8}}>Email sendt ✓</div>
            <div style={{fontSize:13,color:'var(--text2)',marginBottom:24,lineHeight:1.6}}>Tjek din indbakke og klik linket for at nulstille dit password. Tjek også din spam-mappe.</div>
            <a href="/login"><button className="btn btn-gold" style={{width:'100%',justifyContent:'center'}}>Tilbage til login</button></a>
          </div>
        ) : (
          <div>
            <div className="font-head" style={{fontSize:20,fontWeight:700,marginBottom:4}}>Glemt password?</div>
            <div style={{fontSize:12,color:'var(--text2)',marginBottom:24}}>Skriv din email og vi sender dig et link</div>
            <form onSubmit={handleSubmit}>
              <div className="label" style={{marginTop:0}}>Email</div>
              <input className="field-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="din@email.com" style={{width:'100%',marginBottom:20}} required/>
              <button type="submit" className="btn btn-gold" style={{width:'100%',justifyContent:'center',padding:'10px 20px'}} disabled={loading}>
                {loading ? 'Sender...' : 'Send nulstillingslink →'}
              </button>
            </form>
            <div style={{marginTop:20,textAlign:'center',fontSize:12,color:'var(--text2)'}}>
              <a href="/login" style={{color:'var(--gold)'}}>← Tilbage til login</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
