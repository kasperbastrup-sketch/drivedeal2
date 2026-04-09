'use client'
import { useState } from 'react'
import { useToast } from './Toast'

interface Props { onClose: ()=>void }

const segments = [
  {label:'Alle kolde leads (90+ dage)',count:847},
  {label:'Kolde leads — kun BMW/Mercedes',count:412},
  {label:'EV-interesserede leads',count:198},
  {label:'Alle leads uden svar',count:312},
  {label:'Leads der har åbnet men ikke svaret',count:44},
]

export default function CampaignModal({ onClose }: Props) {
  const [name, setName] = useState('Efterår Reactivation 2025')
  const [segIdx, setSegIdx] = useState(0)
  const { show } = useToast()
  const seg = segments[segIdx]

  function launch() {
    onClose()
    show('🚀', `Kampagne "${name}" startet!`, `AI sender til ${seg.count} leads`)
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
        <div style={{fontSize:12,color:'var(--text2)',marginTop:6}}>Estimeret målgruppe: <strong style={{color:'var(--gold)'}}>{seg.count} leads</strong></div>

        <div className="label">Email skabelon</div>
        <select className="field-select" style={{width:'100%'}}>
          <option>🚗 Prøvekørsel invitation (åbningsrate: 52%)</option>
          <option>💰 Personligt tilbud (åbningsrate: 48%)</option>
          <option>👋 Blød check-in (åbningsrate: 61%)</option>
          <option>⚡ EV konvertering (åbningsrate: 58%)</option>
        </select>

        <div className="label">Sekvens</div>
        <select className="field-select" style={{width:'100%'}}>
          <option>3-email sekvens (dag 0, 5, 12)</option>
          <option>Enkelt email — ingen follow-up</option>
          <option>4-email sekvens (dag 0, 3, 8, 18)</option>
        </select>

        <div className="label">Send-tidspunkt</div>
        <select className="field-select" style={{width:'100%'}}>
          <option>Straks</option>
          <option>I dag kl. 10:00</option>
          <option>I morgen kl. 09:00</option>
          <option>Tirsdag kl. 10:00 (anbefalet)</option>
        </select>

        <div style={{background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.2)',borderRadius:9,padding:14,marginTop:16}}>
          <div style={{fontSize:11,color:'var(--gold)',fontWeight:600,marginBottom:6,textTransform:'uppercase',letterSpacing:'.8px'}}>Estimeret resultat</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,textAlign:'center'}}>
            <div><div className="font-head" style={{fontSize:18,fontWeight:800,color:'var(--gold)'}}>{Math.round(seg.count*.43)}</div><div style={{fontSize:10,color:'var(--text2)'}}>Åbner (43%)</div></div>
            <div><div className="font-head" style={{fontSize:18,fontWeight:800,color:'var(--green)'}}>{Math.round(seg.count*.07)}</div><div style={{fontSize:10,color:'var(--text2)'}}>Bookinger (7%)</div></div>
            <div><div className="font-head" style={{fontSize:18,fontWeight:800,color:'var(--gold)'}}>€ {(Math.round(seg.count*.07)*12000).toLocaleString('da')}</div><div style={{fontSize:10,color:'var(--text2)'}}>Est. omsætning</div></div>
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:22,paddingTop:16,borderTop:'1px solid var(--border)'}}>
          <button className="btn btn-ghost" onClick={onClose}>Annuller</button>
          <button className="btn btn-gold btn-lg" onClick={launch}>🚀 Start AI kampagne</button>
        </div>
      </div>
    </div>
  )
}
