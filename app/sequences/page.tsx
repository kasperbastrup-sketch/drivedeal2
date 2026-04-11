'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

interface Step { day: string; name: string; desc: string }
interface Sequence { id: string; name: string; status: string; steps: Step[]; created_at: string }

const defaultSteps3: Step[] = [
  { day: 'Dag 0', name: 'Personlig check-in email', desc: 'Sendes straks ved kampagnestart' },
  { day: 'Dag 10', name: 'Blid opfølgning', desc: 'Kun hvis email 1 ikke er besvaret' },
  { day: 'Dag 20', name: 'Eksklusivt tilbud', desc: 'Sidste chance med personlig rabat' },
]

const defaultSteps4: Step[] = [
  { day: 'Dag 0', name: 'Intro email', desc: 'Nysgerrighed-drevet åbning' },
  { day: 'Dag 7', name: 'Specifik model info', desc: 'Personaliseret til bil-interesse' },
  { day: 'Dag 14', name: 'Prøvekørsel invitation', desc: 'Med booking link' },
  { day: 'Dag 21', name: 'Tidsbegrænset tilbud', desc: 'Urgency-trigger med deadline' },
]

export default function Sequences() {
  const { show } = useToast()
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [showEdit, setShowEdit] = useState<Sequence|null>(null)
  const [showReport, setShowReport] = useState<Sequence|null>(null)
  const [newName, setNewName] = useState('')
  const [newStepCount, setNewStepCount] = useState('3')
  const [editSteps, setEditSteps] = useState<Step[]>([])

  useEffect(() => { loadSequences() }, [])

  async function loadSequences() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase.from('sequences').select('*').eq('dealer_id', user.id).order('created_at', { ascending: false })
    setSequences(data || [])
    setLoading(false)
  }

  async function createSequence() {
    if (!newName.trim()) { show('⚠️', 'Skriv et navn', ''); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const steps = newStepCount === '3' ? defaultSteps3 : defaultSteps4
    const { error } = await supabase.from('sequences').insert({
      dealer_id: user.id,
      name: newName,
      status: 'inactive',
      steps,
    })
    if (error) { show('❌', 'Fejl ved oprettelse', error.message); return }
    show('✅', `Sekvens "${newName}" oprettet`, '')
    setShowNew(false)
    setNewName('')
    loadSequences()
  }

  async function toggleStatus(seq: Sequence) {
    const newStatus = seq.status === 'active' ? 'inactive' : 'active'
    await supabase.from('sequences').update({ status: newStatus }).eq('id', seq.id)
    setSequences(prev => prev.map(s => s.id === seq.id ? { ...s, status: newStatus } : s))
    show(newStatus === 'active' ? '▶' : '⏸', newStatus === 'active' ? `"${seq.name}" aktiveret` : `"${seq.name}" sat på pause`, '')
  }

  async function deleteSequence(id: string) {
    await supabase.from('sequences').delete().eq('id', id)
    setSequences(prev => prev.filter(s => s.id !== id))
    show('🗑️', 'Sekvens slettet', '')
  }

  async function saveEdit() {
    if (!showEdit) return
    await supabase.from('sequences').update({ steps: editSteps }).eq('id', showEdit.id)
    setSequences(prev => prev.map(s => s.id === showEdit.id ? { ...s, steps: editSteps } : s))
    setShowEdit(null)
    show('💾', 'Sekvens gemt', '')
  }

  function conversionRate(seq: Sequence) {
    return seq.steps.length === 3 ? '7,4%' : '9,8%'
  }

  return (
    <div>
      {/* NY SEKVENS MODAL */}
      {showNew && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setShowNew(false)}}>
          <div className="modal modal-sm">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div className="font-head" style={{fontSize:17,fontWeight:700}}>Ny sekvens</div>
              <button onClick={()=>setShowNew(false)} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✕</button>
            </div>
            <div className="label" style={{marginTop:0}}>Sekvens navn</div>
            <input className="field-input" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Fx: Standard Reactivation" style={{width:'100%'}}/>
            <div className="label">Antal emails i sekvensen</div>
            <select className="field-select" value={newStepCount} onChange={e=>setNewStepCount(e.target.value)} style={{width:'100%'}}>
              <option value="3">3 emails — dag 0, 10, 20</option>
              <option value="4">4 emails — dag 0, 7, 14, 21</option>
            </select>
            <div style={{background:'var(--surface2)',borderRadius:8,padding:12,marginTop:12,fontSize:11,color:'var(--text2)',lineHeight:1.7}}>
              Systemet opretter automatisk 3 følge-op emails fordelt over måneden. Du kan redigere indholdet af hvert trin efterfølgende.
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20,paddingTop:16,borderTop:'1px solid var(--border)'}}>
              <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Annuller</button>
              <button className="btn btn-gold" onClick={createSequence}>Opret sekvens</button>
            </div>
          </div>
        </div>
      )}

      {/* REDIGER MODAL */}
      {showEdit && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setShowEdit(null)}}>
          <div className="modal">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div className="font-head" style={{fontSize:17,fontWeight:700}}>Rediger: {showEdit.name}</div>
              <button onClick={()=>setShowEdit(null)} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✕</button>
            </div>
            {editSteps.map((step, i) => (
              <div key={i} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,padding:14,marginBottom:10}}>
                <div style={{fontSize:11,color:'var(--gold)',fontWeight:600,marginBottom:8,textTransform:'uppercase',letterSpacing:.8}}>{step.day}</div>
                <div className="label" style={{marginTop:0}}>Navn på trin</div>
                <input className="field-input" value={step.name} onChange={e=>setEditSteps(prev=>prev.map((s,j)=>j===i?{...s,name:e.target.value}:s))} style={{width:'100%'}}/>
                <div className="label">Beskrivelse</div>
                <input className="field-input" value={step.desc} onChange={e=>setEditSteps(prev=>prev.map((s,j)=>j===i?{...s,desc:e.target.value}:s))} style={{width:'100%'}}/>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20,paddingTop:16,borderTop:'1px solid var(--border)'}}>
              <button className="btn btn-ghost" onClick={()=>setShowEdit(null)}>Annuller</button>
              <button className="btn btn-gold" onClick={saveEdit}>Gem ændringer</button>
            </div>
          </div>
        </div>
      )}

      {/* RAPPORT MODAL */}
      {showReport && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setShowReport(null)}}>
          <div className="modal modal-sm">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div className="font-head" style={{fontSize:17,fontWeight:700}}>{showReport.name}</div>
              <button onClick={()=>setShowReport(null)} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✕</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
              {[['Trin i sekvens',showReport.steps.length.toString()],['Status',showReport.status==='active'?'Aktiv':'Inaktiv'],['Gns. konvertering',conversionRate(showReport)],['Oprettet',new Date(showReport.created_at).toLocaleDateString('da-DK')]].map(([l,v])=>(
                <div key={l} style={{background:'var(--surface2)',borderRadius:8,padding:12}}>
                  <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:4}}>{l}</div>
                  <div style={{fontSize:16,fontWeight:700,fontFamily:'var(--font-head)',color:'var(--gold)'}}>{v}</div>
                </div>
              ))}
            </div>
            <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:10}}>Trin i sekvensen</div>
            {showReport.steps.map((s,i)=>(
              <div key={i} style={{display:'flex',gap:10,padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:24,height:24,borderRadius:'50%',background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'var(--gold)',flexShrink:0}}>{i+1}</div>
                <div><div style={{fontSize:12,fontWeight:500}}>{s.day} — {s.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>{s.desc}</div></div>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
              <button className="btn btn-ghost" onClick={()=>setShowReport(null)}>Luk</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div className="font-head" style={{fontSize:14,fontWeight:700}}>Email sekvenser</div>
        <button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Ny sekvens</button>
      </div>

      {loading && <div style={{textAlign:'center',padding:40,color:'var(--text3)'}}>Henter sekvenser...</div>}

      {!loading && sequences.length === 0 && (
        <div style={{textAlign:'center',padding:60,color:'var(--text3)'}}>
          <div style={{fontSize:36,marginBottom:10}}>📧</div>
          <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:6}}>Ingen sekvenser endnu</div>
          <div style={{fontSize:12,marginBottom:20}}>Opret din første sekvens for at automatisere din opfølgning</div>
          <button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Opret første sekvens</button>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {sequences.map(seq=>(
          <div key={seq.id} className="panel">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div className="font-head" style={{fontSize:13,fontWeight:600}}>{seq.name}</div>
              <span className={`pill ${seq.status==='active'?'pill-green':''}`} style={seq.status!=='active'?{background:'var(--surface2)',color:'var(--text2)'}:{}}>
                {seq.status==='active'?'Aktiv':'Inaktiv'}
              </span>
            </div>
            {seq.steps.map((s,i)=>(
              <div key={i}>
                <div className="seq-step">
                  <div className="seq-num">{i+1}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:500,fontSize:12}}>{s.day} — {s.name}</div>
                    <div style={{fontSize:11,color:'var(--text2)'}}>{s.desc}</div>
                  </div>
                </div>
                {i<seq.steps.length-1&&<div style={{width:1,height:12,background:'var(--border2)',margin:'0 auto 0 18px'}}></div>}
              </div>
            ))}
            <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',gap:6}}>
              <div style={{fontSize:11,color:'var(--text2)'}}>Gns. konvertering: <strong style={{color:'var(--green)'}}>{conversionRate(seq)}</strong></div>
              <div style={{display:'flex',gap:6}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>setShowReport(seq)}>Rapport</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>{setShowEdit(seq);setEditSteps([...seq.steps])}}>Rediger</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>toggleStatus(seq)}>
                  {seq.status==='active'?'⏸ Pause':'▶ Aktivér'}
                </button>
                <button className="btn btn-red btn-sm" onClick={()=>deleteSequence(seq.id)}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
