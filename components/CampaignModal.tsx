'use client'
import { useState } from 'react'
import { useToast } from './Toast'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Props { onClose: ()=>void }

const segments = [
  {label:'Alle kolde leads (90+ dage)',count:0},
  {label:'Kolde leads — kun BMW/Mercedes',count:0},
  {label:'EV-interesserede leads',count:0},
  {label:'Alle leads uden svar',count:0},
  {label:'Leads der har åbnet men ikke svaret',count:0},
]

const templates = [
  '🚗 Prøvekørsel invitation',
  '💰 Personligt tilbud',
  '👋 Blød check-in',
  '⚡ EV konvertering',
]

const sequences = [
  '3-email sekvens (dag 0, 5, 12)',
  'Enkelt email — ingen follow-up',
  '4-email sekvens (dag 0, 3, 8, 18)',
]

const sendTimes = [
  'Straks',
  'I dag kl. 10:00',
  'I morgen kl. 09:00',
  'Tirsdag kl. 10:00 (anbefalet)',
]

export default function CampaignModal({ onClose }: Props) {
  const [name, setName] = useState('Efterår Reactivation 2025')
  const [segIdx, setSegIdx] = useState(0)
  const [template, setTemplate] = useState(templates[0])
  const [sequence, setSequence] = useState(sequences[0])
  const [loading, setLoading] = useState(false)
  const { show } = useToast()
  const router = useRouter()

  async function launch() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { show('❌', 'Ikke logget ind', ''); setLoading(false); return }

    const { error } = await supabase.from('campaigns').insert({
      dealer_id: user.id,
      name,
      segment: segments[segIdx].label,
      template,
      status: 'active',
      emails_sent: 0,
      emails_opened: 0,
      bookings: 0,
    })

    if (error) { show('❌', 'Fejl ved oprettelse', error.message); setLoading(false); return }

    onClose()
    show('🚀', `Kampagne "${name}" startet!`, 'Gå til Kampagner for at se den')
    router.push('/campaigns')
    setLoading(false)
  }

  return (
    <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div className="modal">
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
          <div>
            <div className="font-head" style={{fontSize:17,fontWeight:700}}>Start ny AI kampagne</div>
            <div style={{fontSize:12,color:'var(--text2)',marginTop:3}}>AI genererer og sender personaliserede emails til dit segment</div>
          </div>
          <button onClick={onClose} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✕</button>
        </div>

        <div className="label" style={{marginTop:0}}>Kampagnenavn</div>
        <input className="field-input" value={name} onChange={e=>setName(e.target.value)} style={{width:'100%'}} />

        <div className="label">Målgruppe</div>
        <select className="field-select" value={segIdx} onChange={e=>setSegIdx(Number(e.target.value))} style={{width:'100%'}}>
          {segments.map((s,i)=><option key={i} value={i}>{s.label}</option>)}
        </select>

        <div className="label">Email skabelon</div>
        <select className="field-select" value={template} onChange={e=>setTemplate(e.target.value)} style={{width:'100%'}}>
          {templates.map(t=><option key={t}>{t}</option>)}
        </select>

        <div className="label">Sekvens</div>
        <select className="field-select" value={sequence} onChange={e=>setSequence(e.target.value)} style={{width:'100%'}}>
          {sequences.map(s=><option key={s}>{s}</option>)}
        </select>

        <div className="label">Send-tidspunkt</div>
        <select className="field-select" style={{width:'100%'}}>
          {sendTimes.map(s=><option key={s}>{s}</option>)}
        </select>

        <div style={{background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.2)',borderRadius:9,padding:14,marginTop:16}}>
          <div style={{fontSize:11,color:'var(--gold)',fontWeight:600,marginBottom:6,textTransform:'uppercase',letterSpacing:'.8px'}}>Hvad sker der nu</div>
          <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.7}}>
            AI'en genererer en personaliseret email til hvert lead i segmentet med deres navn og bil-interesse. Emails sendes automatisk med 30-90 sekunders forsinkelse.
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:22,paddingTop:16,borderTop:'1px solid var(--border)'}}>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Annuller</button>
          <button className="btn btn-gold btn-lg" onClick={launch} disabled={loading}>
            {loading ? 'Opretter...' : '🚀 Start AI kampagne'}
          </button>
        </div>
      </div>
    </div>
  )
}
