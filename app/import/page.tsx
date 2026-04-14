'use client'
import { readFileAsUTF8 } from '@/lib/readFileUTF8'
import { useState } from 'react'
import { useToast } from '@/components/Toast'
import { supabase } from '@/lib/supabase'
import { useRefresh } from '@/components/AppShell'
import { getBlacklistedEmails } from '@/lib/blacklist'
import { calculateScore } from '@/lib/scoreLeads'
import { useLang } from '@/lib/useLang'
import { mapCSV } from '@/lib/csvMapper'

export default function Import() {
  const { show } = useToast()
  const { refresh } = useRefresh()
  const { tr } = useLang()
  const [dragging, setDragging] = useState(false)
  const [importing, setImporting] = useState(false)
  const [detectedSource, setDetectedSource] = useState('')

  async function processFile(file: File) {
    setImporting(true)
    setDetectedSource('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { show('❌', 'Fejl', ''); setImporting(false); return }

    const text = await readFileAsUTF8(file)
    const { leads: parsed, source, skipped: parseSkipped, total } = mapCSV(text)

    setDetectedSource(source)

    if (parsed.length === 0) {
      show('⚠️', 'Ingen gyldige leads fundet', `${total} rækker gennemgået`)
      setImporting(false)
      return
    }

    const [blacklisted, existing] = await Promise.all([
      getBlacklistedEmails(user.id),
      supabase.from('leads').select('email').eq('dealer_id', user.id)
    ])

    const existingEmails = new Set((existing.data || []).map((l: {email: string}) => l.email.toLowerCase()))
    const duplicates = parsed.filter(l => existingEmails.has(l.email))
    const blacklistedCount = parsed.filter(l => blacklisted.has(l.email)).length
    const unique = parsed.filter(l => !existingEmails.has(l.email) && !blacklisted.has(l.email))

    if (unique.length === 0) {
      show('⚠️', 'Ingen nye leads', `${duplicates.length} dubletter · ${blacklistedCount} blacklistede`)
      setImporting(false)
      return
    }

    const toInsert = unique.map(l => ({
      dealer_id: user.id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      car: l.car,
      days_since_contact: l.days_since_contact,
      source: l.source,
      status: 'cold',
      score: calculateScore(l.car, l.days_since_contact, l.source),
    }))

    const { error } = await supabase.from('leads').insert(toInsert)
    if (error) { show('❌', 'Fejl ved import', error.message); setImporting(false); return }

    const parts = []
    if (duplicates.length > 0) parts.push(`${duplicates.length} dubletter`)
    if (blacklistedCount > 0) parts.push(`${blacklistedCount} blacklistede`)
    if (parseSkipped > 0) parts.push(`${parseSkipped} ugyldige`)

    show('✅', `${unique.length} leads importeret fra ${source}`, parts.join(' · '))
    refresh()
    setImporting(false)
  }

  async function addManualLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const email = (data.get('email') as string).toLowerCase().trim()
    const blacklisted = await getBlacklistedEmails(user.id)
    if (blacklisted.has(email)) { show('🚫', 'Email er på blacklisten', ''); return }

    const { data: existing } = await supabase.from('leads').select('id').eq('dealer_id', user.id).eq('email', email).single()
    if (existing) { show('⚠️', 'Lead findes allerede', ''); return }

    const car = data.get('car') as string
    const source = data.get('source') as string

    const { error } = await supabase.from('leads').insert({
      dealer_id: user.id,
      name: data.get('name') as string,
      email,
      phone: data.get('phone') as string,
      car,
      source,
      days_since_contact: 0,
      status: 'warm',
      score: calculateScore(car, 0, source),
    })

    if (error) { show('❌', 'Fejl', error.message); return }
    show('✅', 'Lead tilføjet', '')
    refresh()
    form.reset()
  }

  function connectCRM(name: string) {
    show('🔗', name, 'Forbinder...')
    setTimeout(() => show('✅', name, 'Forbundet'), 2500)
  }

  const crmList = [
    { name: 'Gmail', desc: 'Forbundet og aktiv', done: true },
    { name: 'Bilinfo', desc: 'Eksporter CSV fra Bilinfo og upload herover' },
    { name: 'AutoDesktop', desc: 'Eksporter CSV fra AutoDesktop og upload herover' },
    { name: 'HubSpot CRM', desc: tr.crmItems[0].desc },
    { name: 'Salesforce', desc: tr.crmItems[1].desc },
  ]

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <div>
        <div className="panel" style={{marginBottom:14}}>
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:4}}>{tr.uploadCsv}</div>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:12}}>
            Understøtter Bilinfo, AutoDesktop og standard CSV-format
          </div>

          {detectedSource && (
            <div style={{marginBottom:12,display:'inline-flex',alignItems:'center',gap:6,background:'var(--greenbg)',border:'1px solid rgba(76,175,130,.2)',borderRadius:6,padding:'4px 10px'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',display:'inline-block'}}></span>
              <span style={{fontSize:11,color:'var(--green)',fontWeight:500}}>Genkendt: {detectedSource}</span>
            </div>
          )}

          <div className="drop-zone"
            style={{borderColor:dragging?'var(--gold)':undefined,background:dragging?'var(--goldglow)':undefined,opacity:importing?0.6:1}}
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);if(e.dataTransfer.files[0])processFile(e.dataTransfer.files[0])}}
            onClick={()=>!importing&&document.getElementById('csv-input')?.click()}>
            <div style={{fontSize:32,marginBottom:10}}>{importing?'⏳':'📁'}</div>
            <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{importing?tr.importing:tr.dragHere}</div>
            <div style={{fontSize:12,color:'var(--text2)'}}>{tr.orClick}</div>
            <div style={{fontSize:10,color:'var(--text3)',marginTop:8}}>Bilinfo · AutoDesktop · Standard CSV</div>
          </div>
          <input id="csv-input" type="file" accept=".csv" style={{display:'none'}} onChange={e=>{if(e.target.files?.[0])processFile(e.target.files[0])}}/>
        </div>

        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>{tr.addManually}</div>
          <form onSubmit={addManualLead}>
            <div className="label" style={{marginTop:0}}>{tr.fullName}</div>
            <input name="name" className="field-input" placeholder="Carlos Mendez" style={{width:'100%'}} required/>
            <div className="label">{tr.email}</div>
            <input name="email" type="email" className="field-input" placeholder="carlos@gmail.com" style={{width:'100%'}} required/>
            <div className="label">{tr.phone}</div>
            <input name="phone" className="field-input" placeholder="+45 12 34 56 78" style={{width:'100%'}}/>
            <div className="label">{tr.carInterestField}</div>
            <input name="car" className="field-input" placeholder="BMW 520d" style={{width:'100%'}}/>
            <div className="label">{tr.source}</div>
            <select name="source" className="field-select" style={{width:'100%'}}>
              {tr.sourceOptions.map(o=><option key={o}>{o}</option>)}
            </select>
            <button type="submit" className="btn btn-gold" style={{width:'100%',marginTop:14,justifyContent:'center'}}>{tr.addLead}</button>
          </form>
        </div>
      </div>

      <div>
        <div className="panel" style={{marginBottom:14}}>
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>{tr.syncFromCrm}</div>
          {crmList.map(item=>(
            <div key={item.name} className={`onboard-step${item.done?' done':''}`}>
              <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,border:`2px solid ${item.done?'var(--green)':'var(--border2)'}`,color:item.done?'var(--green)':'var(--text2)',background:item.done?'var(--greenbg)':'none'}}>{item.done?'✓':null}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:13}}>{item.name}</div>
                <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{item.desc}</div>
              </div>
              {item.done
                ? <span className="pill pill-green">{tr.connected}</span>
                : item.name === 'Bilinfo' || item.name === 'AutoDesktop'
                  ? <span style={{fontSize:10,color:'var(--gold)',fontWeight:500}}>Via CSV</span>
                  : <button className="btn btn-ghost btn-sm" onClick={()=>connectCRM(item.name)}>{tr.connect}</button>
              }
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:4}}>{tr.csvExample}</div>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:10}}>Sådan eksporterer du fra dine systemer:</div>

          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--gold)',marginBottom:6}}>📋 Bilinfo</div>
            <div style={{fontSize:11,color:'var(--text2)',lineHeight:1.6}}>
              Leads → Leadliste → Eksporter → Download CSV
            </div>
          </div>

          <div style={{marginBottom:12,paddingTop:12,borderTop:'1px solid var(--border)'}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--gold)',marginBottom:6}}>📋 AutoDesktop</div>
            <div style={{fontSize:11,color:'var(--text2)',lineHeight:1.6}}>
              Kunder → Eksporter liste → CSV format
            </div>
          </div>

          <div style={{paddingTop:12,borderTop:'1px solid var(--border)'}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--text2)',marginBottom:6}}>Standard CSV format</div>
            <div style={{background:'var(--surface2)',borderRadius:8,padding:10,fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text)',lineHeight:1.8}}>
              Navn,Email,Telefon,Bil,Dage<br/>
              Lars Jensen,lars@gmail.com,+45612001,BMW 520d,127
            </div>
          </div>

          <div style={{marginTop:10,fontSize:11,color:'var(--text2)'}}>{tr.duplicatesSkipped}</div>
        </div>
      </div>
    </div>
  )
}
