'use client'
import { useState } from 'react'
import { useToast } from '@/components/Toast'
import { supabase } from '@/lib/supabase'
import { useRefresh } from '@/components/AppShell'
import { getBlacklistedEmails } from '@/lib/blacklist'
import { calculateScore } from '@/lib/scoreLeads'
import { useLang } from '@/lib/useLang'

export default function Import() {
  const { show } = useToast()
  const { refresh } = useRefresh()
  const { tr } = useLang()
  const [dragging, setDragging] = useState(false)
  const [importing, setImporting] = useState(false)

  async function processFile(file: File) {
    setImporting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { show('❌', 'Error', ''); setImporting(false); return }

    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

    const parsed = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      const obj: Record<string,string> = {}
      headers.forEach((h, i) => obj[h] = values[i] || '')
      const car = obj['bil'] || obj['car'] || obj['coche'] || obj['interesse'] || values[3] || ''
      const days = parseInt(obj['dage'] || obj['days'] || obj['dias'] || '90') || 90
      const source = obj['kilde'] || obj['source'] || 'CSV Import'
      return {
        dealer_id: user.id,
        name: obj['navn'] || obj['name'] || obj['nombre'] || values[0] || 'Ukendt',
        email: (obj['email'] || obj['correo'] || values[1] || '').toLowerCase().trim(),
        phone: obj['telefon'] || obj['phone'] || obj['telefono'] || values[2] || '',
        car, days_since_contact: days, source, status: 'cold',
        score: calculateScore(car, days, source),
      }
    }).filter(l => l.email)

    if (parsed.length === 0) { show('⚠️', 'Error', ''); setImporting(false); return }

    const [blacklisted, existing] = await Promise.all([
      getBlacklistedEmails(user.id),
      supabase.from('leads').select('email').eq('dealer_id', user.id)
    ])

    const existingEmails = new Set((existing.data || []).map(l => l.email.toLowerCase()))
    const duplicates = parsed.filter(l => existingEmails.has(l.email))
    const blacklistedCount = parsed.filter(l => blacklisted.has(l.email)).length
    const unique = parsed.filter(l => !existingEmails.has(l.email) && !blacklisted.has(l.email))

    if (unique.length === 0) { show('⚠️', `${duplicates.length} dup · ${blacklistedCount} blacklist`, ''); setImporting(false); return }

    const { error } = await supabase.from('leads').insert(unique)
    if (error) { show('❌', 'Error', error.message); setImporting(false); return }

    const parts = []
    if (duplicates.length > 0) parts.push(`${duplicates.length} dup`)
    if (blacklistedCount > 0) parts.push(`${blacklistedCount} blacklist`)
    show('✅', `${unique.length} leads!`, parts.join(' · '))
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
    if (blacklisted.has(email)) { show('🚫', 'Blacklist', ''); return }

    const { data: existing } = await supabase.from('leads').select('id').eq('dealer_id', user.id).eq('email', email).single()
    if (existing) { show('⚠️', 'Duplicate', ''); return }

    const car = data.get('car') as string
    const source = data.get('source') as string

    const { error } = await supabase.from('leads').insert({
      dealer_id: user.id, name: data.get('name') as string,
      email, phone: data.get('phone') as string, car, source,
      days_since_contact: 0, status: 'warm', score: calculateScore(car, 0, source),
    })

    if (error) { show('❌', 'Error', error.message); return }
    show('✅', 'Lead!', '')
    refresh()
    form.reset()
  }

  function connectCRM(name: string) {
    show('🔗', name, '...')
    setTimeout(() => show('✅', name, ''), 2500)
  }

  const crmList = [
    {name:'Gmail', desc:'ventas@mercedesbcn.com', done:true},
    {name:'HubSpot CRM', desc: tr.crmItems[0].desc},
    {name:'Salesforce', desc: tr.crmItems[1].desc},
    {name:'Calendly', desc:'Sync'},
    {name:'WhatsApp Business', desc:'WhatsApp'},
  ]

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <div>
        <div className="panel" style={{marginBottom:14}}>
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>{tr.uploadCsv}</div>
          <div className="drop-zone"
            style={{borderColor:dragging?'var(--gold)':undefined,background:dragging?'var(--goldglow)':undefined,opacity:importing?.6:1}}
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);if(e.dataTransfer.files[0])processFile(e.dataTransfer.files[0])}}
            onClick={()=>!importing&&document.getElementById('csv-input')?.click()}>
            <div style={{fontSize:32,marginBottom:10}}>{importing?'⏳':'📁'}</div>
            <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{importing?tr.importing:tr.dragHere}</div>
            <div style={{fontSize:12,color:'var(--text2)'}}>{tr.orClick}</div>
            <div style={{fontSize:10,color:'var(--text3)',marginTop:8}}>{tr.csvColumns}</div>
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
            <input name="phone" className="field-input" placeholder="+34 612 345 678" style={{width:'100%'}}/>
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
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{item.name}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{item.desc}</div></div>
              {item.done?<span className="pill pill-green">{tr.connected}</span>:<button className="btn btn-ghost btn-sm" onClick={()=>connectCRM(item.name)}>{tr.connect}</button>}
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:4}}>{tr.csvExample}</div>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:10}}>{tr.csvExampleDesc}</div>
          <div style={{background:'var(--surface2)',borderRadius:8,padding:12,fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text)',lineHeight:1.8}}>
            Navn,Email,Telefon,Bil,Dage<br/>
            Carlos Mendez,carlos@gmail.com,+34612001001,BMW 520d,127<br/>
            María González,maria@hotmail.com,+34612002002,Mercedes GLC,94
          </div>
          <div style={{fontSize:11,color:'var(--text2)',marginTop:10}}>{tr.duplicatesSkipped}</div>
        </div>
      </div>
    </div>
  )
}
