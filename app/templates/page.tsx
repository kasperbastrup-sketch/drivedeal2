'use client'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'
import { supabase } from '@/lib/supabase'

const defaultTemplates = [
  {key:'proeve',icon:'🚗',name:'Prøvekørsel invitation',rate:'Åbningsrate: 52% · Booking-rate: 8.2%',
   subject:'{{fornavn}}, din {{bil}} venter på dig 🚗',
   body:`Hej {{fornavn}},\n\nDet er nu {{dage_siden}} dage siden du kiggede på en {{bil}} hos os, og jeg ville høre om du stadig overvejer det?\n\nVi har faktisk en rigtig flot {{bil}} klar til prøvekørsel denne uge — helt uforpligtende.\n\nHar du 20 minutter til en prøvetur?\n\nMed venlig hilsen,\n{{afsender}}\n{{forhandler}}`},
  {key:'tilbud',icon:'💰',name:'Personligt tilbud',rate:'Åbningsrate: 48% · Booking-rate: 6.8%',
   subject:'Et særligt tilbud til dig, {{fornavn}}',
   body:`Hej {{fornavn}},\n\nJeg har et eksklusivt tilbud til dig på den {{bil}} du kiggede på.\n\nDette tilbud er kun tilgængeligt denne uge — vil du høre mere?\n\nMed venlig hilsen,\n{{afsender}}\n{{forhandler}}`},
  {key:'check_in',icon:'🤔',name:'Blød check-in',rate:'Åbningsrate: 61% · Svar-rate: 14%',
   subject:'Hej {{fornavn}} — finder du stadig drømmebilen?',
   body:`Hej {{fornavn}},\n\nJeg tænkte på dig og ville bare høre om du stadig leder efter en {{bil}}?\n\nIngen forpligtelse — jeg er bare her hvis du har spørgsmål.\n\nMed venlig hilsen,\n{{afsender}}\n{{forhandler}}`},
  {key:'ny_model',icon:'✨',name:'Ny model lancering',rate:'Åbningsrate: 44% · Booking-rate: 5.1%',
   subject:'Ny model er ankommet — jeg tænkte på dig, {{fornavn}}',
   body:`Hej {{fornavn}},\n\nVi har netop fået en spændende ny {{bil}} ind, og jeg tænkte straks på dig.\n\nKunne du tænke dig at komme og se den?\n\nMed venlig hilsen,\n{{afsender}}\n{{forhandler}}`},
  {key:'ev',icon:'⚡',name:'EV konvertering',rate:'Åbningsrate: 58% · Booking-rate: 9.8%',
   subject:'{{fornavn}}, er du klar til fremtiden? ⚡',
   body:`Hej {{fornavn}},\n\nElbiler er ikke længere fremtiden — de er nutiden. Og jeg tror en el-version af din drømmebil kunne overraske dig.\n\nVil du prøve en gratis testtur?\n\nMed venlig hilsen,\n{{afsender}}\n{{forhandler}}`},
]

export default function Templates() {
  const [selected, setSelected] = useState('proeve')
  const [templates, setTemplates] = useState<Record<string,{subject:string;body:string}>>({})
  const [saving, setSaving] = useState(false)
  const { show } = useToast()

  useEffect(() => { loadTemplates() }, [])

  async function loadTemplates() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('templates').select('*').eq('dealer_id', user.id)
    if (data && data.length > 0) {
      const map: Record<string,{subject:string;body:string}> = {}
      data.forEach(t => { map[t.key] = { subject: t.subject || '', body: t.body || '' } })
      setTemplates(map)
    } else {
      const map: Record<string,{subject:string;body:string}> = {}
      defaultTemplates.forEach(t => { map[t.key] = { subject: t.subject, body: t.body } })
      setTemplates(map)
    }
  }

  async function saveTemplate() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const tpl = defaultTemplates.find(t => t.key === selected)
    const current = templates[selected]

    const { error } = await supabase.from('templates').upsert({
      dealer_id: user.id,
      key: selected,
      name: tpl?.name || selected,
      subject: current?.subject || '',
      body: current?.body || '',
    }, { onConflict: 'dealer_id,key' })

    if (error) { show('❌', 'Fejl ved gemning', error.message); setSaving(false); return }
    show('💾', 'Skabelon gemt!', 'Bruges automatisk af AI ved næste kampagne')
    setSaving(false)
  }

  const current = templates[selected] || { subject: '', body: '' }
  const selectedTpl = defaultTemplates.find(t => t.key === selected)

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div className="font-head" style={{fontSize:14,fontWeight:700}}>Email skabeloner</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr',gap:14}}>
        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Vælg skabelon</div>
          {defaultTemplates.map(t=>(
            <div key={t.key} className={`template-card${selected===t.key?' selected':''}`} onClick={()=>setSelected(t.key)}>
              <div style={{fontWeight:600,fontSize:12,marginBottom:3}}>{t.icon} {t.name}</div>
              <div style={{fontSize:10,color:'var(--green)',marginTop:4}}>{t.rate}</div>
              {templates[t.key] && <div style={{fontSize:10,color:'var(--gold)',marginTop:3}}>✓ Tilpasset og gemt</div>}
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:4}}>{selectedTpl?.icon} {selectedTpl?.name}</div>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:14}}>{selectedTpl?.rate}</div>

          <div className="label" style={{marginTop:0}}>Emne-linje</div>
          <input
            className="field-input"
            value={current.subject}
            onChange={e=>setTemplates(prev=>({...prev,[selected]:{...prev[selected],subject:e.target.value}}))}
            style={{width:'100%'}}
          />

          <div className="label">Email tekst</div>
          <textarea
            className="field-textarea"
            value={current.body}
            onChange={e=>setTemplates(prev=>({...prev,[selected]:{...prev[selected],body:e.target.value}}))}
            style={{minHeight:260}}
          />

          <div style={{marginTop:8,fontSize:11,color:'var(--text2)'}}>
            Variabler: {['{{fornavn}}','{{bil}}','{{dage_siden}}','{{afsender}}','{{forhandler}}'].map(v=>(
              <code key={v} style={{fontFamily:'var(--font-mono)',fontSize:10,background:'var(--surface2)',padding:'1px 5px',borderRadius:3,marginRight:4}}>{v}</code>
            ))}
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:14}}>
            <button className="btn btn-ghost" onClick={()=>{
              const def = defaultTemplates.find(t=>t.key===selected)
              if(def) setTemplates(prev=>({...prev,[selected]:{subject:def.subject,body:def.body}}))
              show('↩️','Nulstillet til standard','')
            }}>Nulstil</button>
            <button className="btn btn-gold" onClick={saveTemplate} disabled={saving}>
              {saving?'Gemmer...':'💾 Gem skabelon'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
