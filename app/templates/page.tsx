'use client'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/useLang'

interface Template {
  key: string
  name: string
  icon: string
  rate: string
  subject: string
  body: string
  custom?: boolean
}

export default function Templates() {
  const [selected, setSelected] = useState('proeve')
  const [templates, setTemplates] = useState<Template[]>([])
  const [saving, setSaving] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')
  const { show } = useToast()
  const { tr } = useLang()

  const defaultTemplates: Template[] = [
    {key:'proeve',icon:'🚗',name:tr.tpl1Name,rate:tr.tpl1Rate,
     subject:'{{fornavn}}, din {{bil}} venter på dig 🚗',
     body:`Hej {{fornavn}},\n\nDet er nu {{dage_siden}} dage siden du kiggede på en {{bil}} hos os, og jeg ville høre om du stadig overvejer det?\n\nVi har faktisk en rigtig flot {{bil}} klar til prøvekørsel denne uge — helt uforpligtende.\n\nHar du 20 minutter til en prøvetur?\n\nMed venlig hilsen,\n{{afsender}}\n{{forhandler}}`},
    {key:'tilbud',icon:'💰',name:tr.tpl2Name,rate:tr.tpl2Rate,
     subject:'Et særligt tilbud til dig, {{fornavn}}',
     body:`Hej {{fornavn}},\n\nJeg har et eksklusivt tilbud til dig på den {{bil}} du kiggede på.\n\nDette tilbud er kun tilgængeligt denne uge — vil du høre mere?\n\nMed venlig hilsen,\n{{afsender}}\n{{forhandler}}`},
    {key:'check_in',icon:'🤔',name:tr.tpl3Name,rate:tr.tpl3Rate,
     subject:'Hej {{fornavn}} — finder du stadig drømmebilen?',
     body:`Hej {{fornavn}},\n\nJeg tænkte på dig og ville bare høre om du stadig leder efter en {{bil}}?\n\nIngen forpligtelse — jeg er bare her hvis du har spørgsmål.\n\nMed venlig hilsen,\n{{afsender}}\n{{forhandler}}`},
    {key:'ny_model',icon:'✨',name:tr.tpl4Name,rate:tr.tpl4Rate,
     subject:'Ny model er ankommet — jeg tænkte på dig, {{fornavn}}',
     body:`Hej {{fornavn}},\n\nVi har netop fået en spændende ny {{bil}} ind, og jeg tænkte straks på dig.\n\nKunne du tænke dig at komme og se den?\n\nMed venlig hilsen,\n{{afsender}}\n{{forhandler}}`},
    {key:'ev',icon:'⚡',name:tr.tpl5Name,rate:tr.tpl5Rate,
     subject:'{{fornavn}}, er du klar til fremtiden? ⚡',
     body:`Hej {{fornavn}},\n\nElbiler er ikke længere fremtiden — de er nutiden. Og jeg tror en el-version af din drømmebil kunne overraske dig.\n\nVil du prøve en gratis testtur?\n\nMed venlig hilsen,\n{{afsender}}\n{{forhandler}}`},
  ]

  useEffect(() => { loadTemplates() }, [])

  async function loadTemplates() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('templates').select('*').eq('dealer_id', user.id)

    if (data && data.length > 0) {
      const savedKeys = new Set(data.map((t:any) => t.key))
      const customTemplates: Template[] = data
        .filter((t:any) => !defaultTemplates.find(d => d.key === t.key))
        .map((t:any) => ({
          key: t.key,
          icon: '📝',
          name: t.name,
          rate: 'Tilpasset skabelon',
          subject: t.subject || '',
          body: t.body || '',
          custom: true,
        }))

      const merged = defaultTemplates.map(d => {
        const saved = data.find((t:any) => t.key === d.key)
        return saved ? { ...d, subject: saved.subject, body: saved.body } : d
      })

      setTemplates([...merged, ...customTemplates])
    } else {
      setTemplates(defaultTemplates)
    }
  }

  async function saveTemplate() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const tpl = templates.find(t => t.key === selected)
    if (!tpl) { setSaving(false); return }

    const { error } = await supabase.from('templates').upsert({
      dealer_id: user.id,
      key: selected,
      name: tpl.name,
      subject: tpl.subject,
      body: tpl.body,
    }, { onConflict: 'dealer_id,key' })

    if (error) { show('❌', 'Fejl', error.message); setSaving(false); return }
    show('💾', tr.saveTemplate, '')
    setSaving(false)
  }

  async function createCustomTemplate() {
    if (!newName.trim()) { show('⚠️', 'Skriv et navn', ''); return }
    if (!newSubject.trim()) { show('⚠️', 'Skriv en emne-linje', ''); return }
    if (!newBody.trim()) { show('⚠️', 'Skriv email tekst', ''); return }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const key = `custom_${Date.now()}`
    const { error } = await supabase.from('templates').insert({
      dealer_id: user.id,
      key,
      name: newName,
      subject: newSubject,
      body: newBody,
    })

    if (error) { show('❌', 'Fejl', error.message); return }

    const newTpl: Template = {
      key, icon: '📝', name: newName,
      rate: 'Tilpasset skabelon',
      subject: newSubject, body: newBody, custom: true,
    }

    setTemplates(prev => [...prev, newTpl])
    setSelected(key)
    setShowNew(false)
    setNewName('')
    setNewSubject('')
    setNewBody('')
    show('✅', `"${newName}" oprettet`, '')
  }

  async function deleteCustomTemplate(key: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('templates').delete().eq('dealer_id', user.id).eq('key', key)
    setTemplates(prev => prev.filter(t => t.key !== key))
    setSelected('proeve')
    show('🗑️', 'Slettet', '')
  }

  const currentTpl = templates.find(t => t.key === selected)

  return (
    <div>
      {/* NY SKABELON MODAL */}
      {showNew && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setShowNew(false)}}>
          <div className="modal" style={{maxWidth:560}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div className="font-head" style={{fontSize:17,fontWeight:700}}>Ny skabelon</div>
              <button onClick={()=>setShowNew(false)} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✕</button>
            </div>

            <div className="label" style={{marginTop:0}}>Navn på skabelon</div>
            <input className="field-input" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Fx: Min BMW kampagne" style={{width:'100%'}}/>

            <div className="label">Emne-linje</div>
            <input className="field-input" value={newSubject} onChange={e=>setNewSubject(e.target.value)} placeholder="Fx: Hej {{fornavn}}, vi har noget til dig" style={{width:'100%'}}/>

            <div className="label">Email tekst</div>
            <textarea className="field-textarea" value={newBody} onChange={e=>setNewBody(e.target.value)} placeholder="Skriv din email her..." style={{minHeight:200,width:'100%'}}/>

            <div style={{marginTop:8,fontSize:11,color:'var(--text2)'}}>
              Variabler: {['{{fornavn}}','{{bil}}','{{dage_siden}}','{{afsender}}','{{forhandler}}'].map(v=>(
                <code key={v} style={{fontFamily:'var(--font-mono)',fontSize:10,background:'var(--surface2)',padding:'1px 5px',borderRadius:3,marginRight:4}}>{v}</code>
              ))}
            </div>

            <div style={{display:'flex',justifyContent:'flex-end',gap:8,paddingTop:16,marginTop:12,borderTop:'1px solid var(--border)'}}>
              <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Annuller</button>
              <button className="btn btn-gold" onClick={createCustomTemplate}>Opret skabelon</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div className="font-head" style={{fontSize:14,fontWeight:700}}>{tr.emailTemplates}</div>
        <button className="btn btn-gold" onClick={()=>setShowNew(true)}>+ Ny skabelon</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr',gap:14}}>
        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>{tr.selectTemplate}</div>
          {templates.map(t=>(
            <div key={t.key} className={`template-card${selected===t.key?' selected':''}`} onClick={()=>setSelected(t.key)}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{fontWeight:600,fontSize:12,marginBottom:3}}>{t.icon} {t.name}</div>
                {t.custom && (
                  <button onClick={e=>{e.stopPropagation();deleteCustomTemplate(t.key)}} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:12,padding:'0 4px'}}>🗑</button>
                )}
              </div>
              <div style={{fontSize:10,color:t.custom?'var(--gold)':'var(--green)',marginTop:4}}>{t.rate}</div>
            </div>
          ))}
        </div>

        <div className="panel">
          {currentTpl && (
            <>
              <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:4}}>{currentTpl.icon} {currentTpl.name}</div>
              <div style={{fontSize:11,color:'var(--text2)',marginBottom:14}}>{currentTpl.rate}</div>

              <div className="label" style={{marginTop:0}}>{tr.subjectLine}</div>
              <input className="field-input" value={currentTpl.subject}
                onChange={e=>setTemplates(prev=>prev.map(t=>t.key===selected?{...t,subject:e.target.value}:t))}
                style={{width:'100%'}}/>

              <div className="label">{tr.emailText}</div>
              <textarea className="field-textarea" value={currentTpl.body}
                onChange={e=>setTemplates(prev=>prev.map(t=>t.key===selected?{...t,body:e.target.value}:t))}
                style={{minHeight:260}}/>

              <div style={{marginTop:8,fontSize:11,color:'var(--text2)'}}>
                {tr.variables}: {['{{fornavn}}','{{bil}}','{{dage_siden}}','{{afsender}}','{{forhandler}}'].map(v=>(
                  <code key={v} style={{fontFamily:'var(--font-mono)',fontSize:10,background:'var(--surface2)',padding:'1px 5px',borderRadius:3,marginRight:4}}>{v}</code>
                ))}
              </div>

              <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:14}}>
                {!currentTpl.custom && (
                  <button className="btn btn-ghost" onClick={()=>{
                    const def = defaultTemplates.find(t=>t.key===selected)
                    if (def) setTemplates(prev=>prev.map(t=>t.key===selected?{...t,subject:def.subject,body:def.body}:t))
                    show('↩️', tr.reset, '')
                  }}>{tr.reset}</button>
                )}
                <button className="btn btn-gold" onClick={saveTemplate} disabled={saving}>
                  {saving?tr.saving:tr.saveTemplate}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
