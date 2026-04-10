'use client'
import { useState } from 'react'
import { useToast } from '@/components/Toast'
import { supabase } from '@/lib/supabase'

export default function Import() {
  const { show } = useToast()
  const [dragging, setDragging] = useState(false)
  const [importing, setImporting] = useState(false)

  async function processFile(file: File) {
    setImporting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { show('❌', 'Ikke logget ind', ''); setImporting(false); return }

    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    const leads = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
      const obj: Record<string,string> = {}
      headers.forEach((h, i) => obj[h] = values[i] || '')
      return {
        dealer_id: user.id,
        name: obj['navn'] || obj['name'] || obj['nombre'] || values[0] || 'Ukendt',
        email: obj['email'] || obj['correo'] || values[1] || '',
        phone: obj['telefon'] || obj['phone'] || obj['telefono'] || values[2] || '',
        car: obj['bil'] || obj['car'] || obj['coche'] || obj['interesse'] || values[3] || '',
        days_since_contact: parseInt(obj['dage'] || obj['days'] || obj['dias'] || '90') || 90,
        source: obj['kilde'] || obj['source'] || 'CSV Import',
        status: 'cold',
        score: Math.floor(Math.random() * 40) + 40,
      }
    }).filter(l => l.email)

    if (leads.length === 0) { show('⚠️', 'Ingen leads fundet', 'Tjek at CSV filen har de rigtige kolonner'); setImporting(false); return }

    const { error } = await supabase.from('leads').insert(leads)
    if (error) { show('❌', 'Fejl ved import', error.message); setImporting(false); return }

    show('✅', `${leads.length} leads importeret!`, 'Gå til "Alle leads" for at se dem')
    setImporting(false)
  }

  async function addManualLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { show('❌', 'Ikke logget ind', ''); return }

    const { error } = await supabase.from('leads').insert({
      dealer_id: user.id,
      name: data.get('name') as string,
      email: data.get('email') as string,
      phone: data.get('phone') as string,
      car: data.get('car') as string,
      source: data.get('source') as string,
      days_since_contact: 0,
      status: 'warm',
      score: 65,
    })

    if (error) { show('❌', 'Fejl', error.message); return }
    show('✅', 'Lead tilføjet!', 'Klar til AI outreach')
    form.reset()
  }

  function connectCRM(name: string) {
    show('🔗', `${name} integration`, 'Åbner OAuth forbindelsesflow...')
    setTimeout(() => show('✅', `${name} forbundet!`, ''), 2500)
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <div>
        <div className="panel" style={{marginBottom:14}}>
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Upload CSV fil</div>
          <div className="drop-zone"
            style={{borderColor:dragging?'var(--gold)':undefined,background:dragging?'var(--goldglow)':undefined,opacity:importing?.6:1}}
            onDragOver={e=>{e.preventDefault();setDragging(true)}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);if(e.dataTransfer.files[0])processFile(e.dataTransfer.files[0])}}
            onClick={()=>!importing&&document.getElementById('csv-input')?.click()}>
            <div style={{fontSize:32,marginBottom:10}}>{importing?'⏳':'📁'}</div>
            <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{importing?'Importerer...':'Træk CSV fil her'}</div>
            <div style={{fontSize:12,color:'var(--text2)'}}>eller klik for at vælge fil</div>
            <div style={{fontSize:10,color:'var(--text3)',marginTop:8}}>Kolonner: Navn, Email, Telefon, Bil, Dage siden kontakt</div>
          </div>
          <input id="csv-input" type="file" accept=".csv" style={{display:'none'}} onChange={e=>{if(e.target.files?.[0])processFile(e.target.files[0])}}/>
        </div>

        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Tilføj lead manuelt</div>
          <form onSubmit={addManualLead}>
            <div className="label" style={{marginTop:0}}>Fuldt navn</div>
            <input name="name" className="field-input" placeholder="Carlos Mendez" style={{width:'100%'}} required/>
            <div className="label">Email</div>
            <input name="email" type="email" className="field-input" placeholder="carlos@gmail.com" style={{width:'100%'}} required/>
            <div className="label">Telefon</div>
            <input name="phone" className="field-input" placeholder="+34 612 345 678" style={{width:'100%'}}/>
            <div className="label">Bil interesse</div>
            <input name="car" className="field-input" placeholder="BMW 520d" style={{width:'100%'}}/>
            <div className="label">Kilde</div>
            <select name="source" className="field-select" style={{width:'100%'}}>
              {['Manuelt tilføjet','Hjemmeside formular','Telefonopkald','Showroom besøg','Social media'].map(o=><option key={o}>{o}</option>)}
            </select>
            <button type="submit" className="btn btn-gold" style={{width:'100%',marginTop:14,justifyContent:'center'}}>+ Tilføj lead</button>
          </form>
        </div>
      </div>

      <div>
        <div className="panel" style={{marginBottom:14}}>
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Synkroniser fra CRM</div>
          {[{name:'Gmail',desc:'ventas@mercedesbcn.com',done:true},{name:'HubSpot CRM',desc:'Synkroniser leads automatisk'},{name:'Salesforce',desc:'Enterprise CRM integration'},{name:'Calendly',desc:'Sync bookinger til leads'},{name:'WhatsApp Business',desc:'Send via WhatsApp'}].map(item=>(
            <div key={item.name} className={`onboard-step${item.done?' done':''}`}>
              <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,border:`2px solid ${item.done?'var(--green)':'var(--border2)'}`,color:item.done?'var(--green)':'var(--text2)',background:item.done?'var(--greenbg)':'none'}}>{item.done?'✓':null}</div>
              <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13}}>{item.name}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{item.desc}</div></div>
              {item.done?<span className="pill pill-green">Aktiv</span>:<button className="btn btn-ghost btn-sm" onClick={()=>connectCRM(item.name)}>Forbind</button>}
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:4}}>CSV format eksempel</div>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:10}}>Din CSV fil skal se sådan ud:</div>
          <div style={{background:'var(--surface2)',borderRadius:8,padding:12,fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text)',lineHeight:1.8}}>
            Navn,Email,Telefon,Bil,Dage<br/>
            Carlos Mendez,carlos@gmail.com,+34612001001,BMW 520d,127<br/>
            María González,maria@hotmail.com,+34612002002,Mercedes GLC,94
          </div>
          <div style={{fontSize:11,color:'var(--text2)',marginTop:10}}>Systemet genkender automatisk dansk, spansk og engelsk kolonnenavne.</div>
        </div>
      </div>
    </div>
  )
}
