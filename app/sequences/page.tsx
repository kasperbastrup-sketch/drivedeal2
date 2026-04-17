'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useLang } from '@/lib/useLang'

interface Step { day: string; name: string; desc: string }
interface Sequence { id: string; dealer_id: string; name: string; status: string; steps: Step[]; created_at: string }

export default function Sequences() {
  const { show } = useToast()
  const { tr } = useLang()
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [showEdit, setShowEdit] = useState<Sequence|null>(null)
  const [showReport, setShowReport] = useState<Sequence|null>(null)
  const [newName, setNewName] = useState('')
  const [seqType, setSeqType] = useState<'recommended'|'intensive'|'custom'>('recommended')
  const [customSteps, setCustomSteps] = useState<Step[]>([{ day: 'Dag 0', name: 'Email 1', desc: 'Beskrivelse' }])
  const [editSteps, setEditSteps] = useState<Step[]>([])

  const recommended: Step[] = [
    { day: 'Dag 0', name: 'Personlig check-in email', desc: 'Sendes straks ved kampagnestart' },
    { day: 'Dag 10', name: 'Blid opfølgning', desc: 'Kun hvis email 1 ikke er besvaret' },
    { day: 'Dag 20', name: 'Eksklusivt tilbud', desc: 'Sidste chance med personlig rabat' },
  ]

  const intensive: Step[] = [
    { day: 'Dag 0', name: 'Intro email', desc: 'Nysgerrighed-drevet åbning' },
    { day: 'Dag 7', name: 'Specifik model info', desc: 'Personaliseret til bil-interesse' },
    { day: 'Dag 14', name: 'Prøvekørsel invitation', desc: 'Med booking link' },
    { day: 'Dag 21', name: 'Tidsbegrænset tilbud', desc: 'Urgency-trigger med deadline' },
  ]

  useEffect(() => { loadSequences() }, [])

  async function loadSequences() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase.from('sequences').select('*').eq('dealer_id', user.id).order('created_at', { ascending: false })
    setSequences(data || [])
    setLoading(false)
  }

  function addCustomStep() {
    if (customSteps.length >= 6) { show('⚠️', 'Maksimum 6', ''); return }
    setCustomSteps(prev => [...prev, { day: `Dag ${prev.length * 7}`, name: `Email ${prev.length + 1}`, desc: '' }])
  }

  function removeCustomStep(i: number) {
    if (customSteps.length <= 1) return
    setCustomSteps(prev => prev.filter((_, j) => j !== i))
  }

  async function createSequence() {
    if (!newName.trim()) { show('⚠️', 'Skriv et navn', ''); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const steps = seqType === 'recommended' ? recommended : seqType === 'intensive' ? intensive : customSteps
    const { error } = await supabase.from('sequences').insert({ dealer_id: user.id, name: newName, status: 'inactive', steps })
    if (error) { show('❌', 'Fejl', error.message); return }
    show('✅', `"${newName}" oprettet`, '')
    setShowNew(false)
    setNewName('')
    setSeqType('recommended')
    setCustomSteps([{ day: 'Dag 0', name: 'Email 1', desc: '' }])
    loadSequences()
  }

  async function toggleStatus(seq: Sequence) {
    const newStatus = seq.status === 'active' ? 'inactive' : 'active'

    // Flere sekvenser kan køre samtidig — leads beskyttes af sequence_id

    await supabase.from('sequences').update({ status: newStatus }).eq('id', seq.id)
    setSequences(prev => prev.map(s => s.id === seq.id ? { ...s, status: newStatus } : s))
    show(newStatus === 'active' ? '▶' : '⏸', newStatus === 'active' ? tr.active : tr.inactive, '')
  }

  async function deleteSequence(id: string) {
    await supabase.from('sequences').delete().eq('id', id)
    setSequences(prev => prev.filter(s => s.id !== id))
    show('🗑️', 'Slettet', '')
  }

  async function saveEdit() {
    if (!showEdit) return
    await supabase.from('sequences').update({ steps: editSteps }).eq('id', showEdit.id)
    setSequences(prev => prev.map(s => s.id === showEdit.id ? { ...s, steps: editSteps } : s))
    setShowEdit(null)
    show('💾', tr.saveSettings, '')
  }

  const previewSteps = seqType === 'recommended' ? recommended : seqType === 'intensive' ? intensive : customSteps

  return (
    <div>
      {/* NY SEKVENS MODAL */}
      {showNew && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setShowNew(false)}}>
          <div className="modal" style={{maxWidth:580}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div className="font-head" style={{fontSize:17,fontWeight:700}}>{tr.newSequence}</div>
              <button onClick={()=>setShowNew(false)} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✕</button>
            </div>
            <div className="label" style={{marginTop:0}}>Navn</div>
            <input className="field-input" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Fx: Standard Reactivation" style={{width:'100%'}}/>
            <div className="label">Type</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:16}}>
              {[
                { key:'recommended', label:`⭐ ${tr.recommended}`, sub:'3 emails · dag 0, 10, 20', badge:true },
                { key:'intensive', label:`🔥 ${tr.intensive}`, sub:'4 emails · dag 0, 7, 14, 21', badge:false },
                { key:'custom', label:`⚙️ ${tr.customSeq}`, sub:'', badge:false },
              ].map(opt=>(
                <div key={opt.key} onClick={()=>setSeqType(opt.key as typeof seqType)} style={{border:`2px solid ${seqType===opt.key?'var(--gold)':'var(--border)'}`,borderRadius:9,padding:'12px 10px',cursor:'pointer',background:seqType===opt.key?'var(--goldglow)':'var(--surface2)',position:'relative'}}>
                  {opt.badge&&<div style={{position:'absolute',top:-8,right:8,background:'var(--gold)',color:'#1a1100',fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:4}}>{tr.recommended.toUpperCase()}</div>}
                  <div style={{fontSize:12,fontWeight:600,marginBottom:4}}>{opt.label}</div>
                  <div style={{fontSize:10,color:'var(--text2)'}}>{opt.sub}</div>
                </div>
              ))}
            </div>

            {seqType === 'custom' && (
              <div style={{marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <div style={{fontSize:12,fontWeight:600}}>Emails ({customSteps.length}/6)</div>
                  <button className="btn btn-ghost btn-sm" onClick={addCustomStep}>{tr.addEmail}</button>
                </div>
                {customSteps.map((step,i)=>(
                  <div key={i} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,padding:12,marginBottom:8}}>
                    <div style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
                      <div style={{width:24,height:24,borderRadius:'50%',background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'var(--gold)',flexShrink:0}}>{i+1}</div>
                      <input className="field-input" value={step.day} onChange={e=>setCustomSteps(prev=>prev.map((s,j)=>j===i?{...s,day:e.target.value}:s))} placeholder="Dag 0" style={{width:100,flexShrink:0}}/>
                      <input className="field-input" value={step.name} onChange={e=>setCustomSteps(prev=>prev.map((s,j)=>j===i?{...s,name:e.target.value}:s))} placeholder="Navn" style={{flex:1}}/>
                      <button onClick={()=>removeCustomStep(i)} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:16}}>✕</button>
                    </div>
                    <input className="field-input" value={step.desc} onChange={e=>setCustomSteps(prev=>prev.map((s,j)=>j===i?{...s,desc:e.target.value}:s))} placeholder="Beskrivelse" style={{width:'100%'}}/>
                  </div>
                ))}
              </div>
            )}

            {seqType !== 'custom' && (
              <div style={{background:'var(--surface2)',borderRadius:8,padding:12,marginBottom:16}}>
                <div style={{fontSize:11,color:'var(--gold)',fontWeight:600,marginBottom:8,textTransform:'uppercase',letterSpacing:.8}}>{tr.preview}</div>
                {previewSteps.map((s,i)=>(
                  <div key={i} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:i<previewSteps.length-1?'1px solid var(--border)':'none'}}>
                    <div style={{width:20,height:20,borderRadius:'50%',background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'var(--gold)',flexShrink:0}}>{i+1}</div>
                    <div><div style={{fontSize:12,fontWeight:500}}>{s.day} — {s.name}</div><div style={{fontSize:10,color:'var(--text2)'}}>{s.desc}</div></div>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:'flex',justifyContent:'flex-end',gap:8,paddingTop:16,borderTop:'1px solid var(--border)'}}>
              <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Annuller</button>
              <button className="btn btn-gold" onClick={createSequence}>{tr.createSequence}</button>
            </div>
          </div>
        </div>
      )}

      {/* REDIGER MODAL */}
      {showEdit && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setShowEdit(null)}}>
          <div className="modal">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div className="font-head" style={{fontSize:17,fontWeight:700}}>{tr.editSequence}: {showEdit.name}</div>
              <button onClick={()=>setShowEdit(null)} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✕</button>
            </div>
            {editSteps.map((step,i)=>(
              <div key={i} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:8,padding:14,marginBottom:10}}>
                <div style={{fontSize:11,color:'var(--gold)',fontWeight:600,marginBottom:8}}>{step.day}</div>
                <div className="label" style={{marginTop:0}}>Navn</div>
                <input className="field-input" value={step.name} onChange={e=>setEditSteps(prev=>prev.map((s,j)=>j===i?{...s,name:e.target.value}:s))} style={{width:'100%'}}/>
                <div className="label">Beskrivelse</div>
                <input className="field-input" value={step.desc} onChange={e=>setEditSteps(prev=>prev.map((s,j)=>j===i?{...s,desc:e.target.value}:s))} style={{width:'100%'}}/>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20,paddingTop:16,borderTop:'1px solid var(--border)'}}>
              <button className="btn btn-ghost" onClick={()=>setShowEdit(null)}>Annuller</button>
              <button className="btn btn-gold" onClick={saveEdit}>{tr.saveSettings}</button>
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
              {[['Trin', showReport.steps.length.toString()],[tr.status, showReport.status==='active'?tr.active:tr.inactive],[tr.avgConversion, showReport.steps.length<=3?'7,4%':'9,8%']].map(([l,v])=>(
                <div key={l} style={{background:'var(--surface2)',borderRadius:8,padding:12}}>
                  <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:4}}>{l}</div>
                  <div style={{fontSize:16,fontWeight:700,fontFamily:'var(--font-head)',color:'var(--gold)'}}>{v}</div>
                </div>
              ))}
            </div>
            {showReport.steps.map((s,i)=>(
              <div key={i} style={{display:'flex',gap:10,padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:24,height:24,borderRadius:'50%',background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'var(--gold)',flexShrink:0}}>{i+1}</div>
                <div><div style={{fontSize:12,fontWeight:500}}>{s.day} — {s.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>{s.desc}</div></div>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
              <button className="btn btn-ghost" onClick={()=>setShowReport(null)}>✕</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div className="font-head" style={{fontSize:14,fontWeight:700}}>{tr.emailSequences}</div>
        <button className="btn btn-gold" onClick={()=>setShowNew(true)}>{tr.newSequence}</button>
      </div>
      <div style={{background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.2)',borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:11,color:'var(--text2)',display:'flex',alignItems:'center',gap:8}}>
        <span>⚡</span>
        <span>Flere sekvenser kan køre samtidig. Et lead kan kun være i én sekvens ad gangen og kontaktes maksimalt én gang per dag.</span>
      </div>

      {loading && <div style={{textAlign:'center',padding:40,color:'var(--text3)'}}>...</div>}

      {!loading && sequences.length === 0 && (
        <div style={{textAlign:'center',padding:60,color:'var(--text3)'}}>
          <div style={{fontSize:36,marginBottom:10}}>📧</div>
          <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:6}}>{tr.noSequences}</div>
          <div style={{fontSize:12,marginBottom:20}}>{tr.noSequencesDesc}</div>
          <button className="btn btn-gold" onClick={()=>setShowNew(true)}>{tr.createFirstSequence}</button>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {sequences.map(seq=>(
          <div key={seq.id} className="panel">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div className="font-head" style={{fontSize:13,fontWeight:600}}>{seq.name}</div>
              <span className={`pill ${seq.status==='active'?'pill-green':''}`} style={seq.status!=='active'?{background:'var(--surface2)',color:'var(--text2)'}:{}}>
                {seq.status==='active'?tr.active:tr.inactive}
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
              <div style={{fontSize:11,color:'var(--text2)'}}>{tr.avgConversion}: <strong style={{color:'var(--green)'}}>{seq.steps.length<=3?'7,4%':'9,8%'}</strong></div>
              <div style={{display:'flex',gap:6}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>setShowReport(seq)}>{tr.report}</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>{setShowEdit(seq);setEditSteps([...seq.steps])}}>{tr.editSequence}</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>toggleStatus(seq)}>
                  {seq.status==='active'?tr.pause:tr.activate}
                </button>
                <button className="btn btn-red btn-sm" onClick={()=>deleteSequence(seq.id)}>{tr.delete}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
