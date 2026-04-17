'use client'
import { useState, useEffect } from 'react'
import { Lead } from '@/lib/data'
import { useToast } from './Toast'
import { supabase } from '@/lib/supabase'

interface Props { lead: Lead | null; onClose: ()=>void; onSent?: (id:string)=>void }

export default function ComposeModal({ lead, onClose, onSent }: Props) {
  const [purpose, setPurpose] = useState('proevekoer')
  const [language, setLanguage] = useState('spansk')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const { show } = useToast()

  useEffect(() => { if (lead) generate() }, [lead, purpose, language])

  async function generate() {
    if (!lead) return
    setLoading(true)
    setSubject('')
    setBody('')
    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead, purpose, language }),
      })
      const data = await res.json()
      setSubject(data.subject || '')
      setBody(data.body || '')
    } catch {
      setBody('Fejl ved generering. Prøv igen.')
    }
    setLoading(false)
  }

  async function send() {
    if (!lead) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { show('❌', 'Ikke logget ind', ''); setLoading(false); return }

      const { data: dealer } = await supabase.from('dealers').select('gmail_access_token, gmail_refresh_token, gmail_email, gmail_connected').eq('id', user.id).single()

      if (!dealer?.gmail_connected || !dealer?.gmail_access_token) {
        show('⚠️', 'Gmail ikke forbundet', 'Gå til Integrationer og forbind Gmail')
        setLoading(false)
        return
      }

      // Refresh token hvis det er udløbet
      let accessToken = dealer.gmail_access_token
      if (dealer.gmail_refresh_token) {
        try {
          const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
              refresh_token: dealer.gmail_refresh_token,
              grant_type: 'refresh_token',
            }),
          })
          const refreshData = await refreshRes.json()
          if (refreshData.access_token) {
            accessToken = refreshData.access_token
            await supabase.from('dealers').update({ gmail_access_token: accessToken }).eq('id', user.id)
          }
        } catch {}
      }

      // Send via Gmail API
      const unsubscribeLink = `\nØnsker du ikke at modtage flere emails: https://drivedeal.live/unsubscribe?email=${lead.email}&dealer=${user.id}`
      const bodyWithUnsubscribe = body + unsubscribeLink
      const emailContent = [
        `From: ${dealer.gmail_email}`,
        `To: ${lead.email}`,
        `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        '',
        bodyWithUnsubscribe,
      ].join('\r\n')

      const raw = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

      const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      })

      if (!gmailRes.ok) {
        const err = await gmailRes.json()
        show('❌', 'Gmail fejl', err.error?.message || 'Kunne ikke sende')
        setLoading(false)
        return
      }

      // Log til email_logs
      await supabase.from('email_logs').insert({
        dealer_id: user.id,
        lead_id: lead.id,
        subject,
        body,
        status: 'sent',
      })

      // Opdater lead status
      await supabase.from('leads').update({
        status: 'sent',
        last_contacted_at: new Date().toISOString(),
      }).eq('id', lead.id)

      onSent?.(lead.id)
      onClose()
      show('📤', `Email sendt til ${lead.name}`, subject)
    } catch (err) {
      show('❌', 'Fejl', 'Kunne ikke sende email')
    }
    setLoading(false)
  }

  if (!lead) return null
  const scoreColor = lead.score >= 80 ? 'var(--green)' : lead.score >= 60 ? 'var(--gold)' : 'var(--text2)'

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="modal modal-lg">
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
          <div>
            <div className="font-head" style={{fontSize:17,fontWeight:700}}>AI Email Composer</div>
            <div style={{fontSize:12,color:'var(--text2)',marginTop:3}}>Personaliseret email til {lead.name}</div>
          </div>
          <button onClick={onClose} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✕</button>
        </div>

        <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:9,padding:14,display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
          {([['Navn',lead.name,'var(--text)'],['Email',lead.email,'var(--blue)'],['Bil interesse',lead.car,'var(--text)'],['Sidst kontaktet',`${lead.days} dage siden`,'var(--amber)'],['AI score',`${lead.score}/100`,scoreColor],['Status',lead.status,'var(--text)']] as [string,string,string][]).map(([l,v,c])=>(
            <div key={l}><div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.8px'}}>{l}</div><div style={{fontSize:13,fontWeight:500,marginTop:2,color:c}}>{v}</div></div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
          <div>
            <div className="label" style={{marginTop:0}}>Email formål</div>
            <select className="field-select" value={purpose} onChange={e=>setPurpose(e.target.value)} style={{width:'100%'}}>
              <option value="proevekoer">🚗 Book prøvekørsel</option>
              <option value="tilbud">💰 Personligt tilbud</option>
              <option value="ny_model">✨ Ny model lancering</option>
              <option value="check_in">👋 Blød check-in</option>
              <option value="ev">⚡ EV konvertering</option>
              <option value="urgency">⏰ Tidsbegrænset tilbud</option>
            </select>
          </div>
          <div>
            <div className="label" style={{marginTop:0}}>Sprog</div>
            <select className="field-select" value={language} onChange={e=>setLanguage(e.target.value)} style={{width:'100%'}}>
              <option value="spansk">Spansk</option>
              <option value="dansk">Dansk</option>
              <option value="engelsk">Engelsk</option>
            </select>
          </div>
        </div>

        <div className="label">AI-genereret emne-linje</div>
        <input className="field-input" value={subject} onChange={e=>setSubject(e.target.value)} style={{width:'100%',marginBottom:12}} placeholder={loading?'Genererer...':'Emne linje...'} />

        <div className="label">Email tekst (redigérbar)</div>
        <textarea className="ai-box" value={body} onChange={e=>setBody(e.target.value)} disabled={loading} style={{width:'100%',opacity:loading?.5:1}}/>

        {loading && (
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:11,color:'var(--gold)',marginTop:8}}>
            <div style={{display:'flex',gap:3}}><span className="dot" style={{animationDelay:'0s'}}></span><span className="dot" style={{animationDelay:'.2s'}}></span><span className="dot" style={{animationDelay:'.4s'}}></span></div>
            AI genererer personaliseret email...
          </div>
        )}

        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:22,paddingTop:16,borderTop:'1px solid var(--border)'}}>
          <button className="btn btn-ghost" onClick={generate} disabled={loading}>↻ Regenerer</button>
          <button className="btn btn-ghost" onClick={onClose}>Annuller</button>
          <button className="btn btn-gold" onClick={send} disabled={loading||!body}>Send via Gmail</button>
        </div>
      </div>
    </div>
  )
}
