'use client'
import { useState } from 'react'
import { useToast } from '@/components/Toast'

export default function Import() {
  const { show } = useToast()
  const [dragging, setDragging] = useState(false)

  function processFile(file: File) {
    const count = Math.floor(Math.random()*150)+50
    show('📁', `${count} leads importeret fra ${file.name}`, `${Math.floor(count*.6)} kolde leads klar til reactivation`)
  }

  function connectCRM(name: string) {
    show('🔗', `${name} integration`, 'Åbner OAuth forbindelsesflow...')
    setTimeout(() => show('✅', `${name} forbundet!`, '82 leads synkroniseret'), 2500)
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <div>
        <div className="panel" style={{marginBottom:14}}>
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Upload CSV / Excel</div>
          <div className="drop-zone" style={{borderColor:dragging?'var(--gold)':undefined,background:dragging?'var(--goldglow)':undefined}}
            onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);if(e.dataTransfer.files[0])processFile(e.dataTransfer.files[0])}}
            onClick={()=>document.getElementById('csv-input')?.click()}>
            <div style={{fontSize:32,marginBottom:10}}>📁</div>
            <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>Træk CSV / Excel fil her</div>
            <div style={{fontSize:12,color:'var(--text2)'}}>eller klik for at vælge fil</div>
            <div style={{fontSize:10,color:'var(--text3)',marginTop:8}}>Kolonner: Navn, Email, Telefon, Bil, Sidst kontaktet</div>
          </div>
          <input id="csv-input" type="file" accept=".csv,.xlsx,.xls" style={{display:'none'}} onChange={e=>{if(e.target.files?.[0])processFile(e.target.files[0])}}/>
        </div>
        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Manuelt tilføj lead</div>
          {[['Fuldt navn','text','Carlos Mendez'],['Email','email','carlos@gmail.com'],['Telefon','tel','+34 612 345 678'],['Bil interesse','text','BMW 520d']].map(([l,t,p])=>(
            <div key={l as string}><div className="label">{l}</div><input className="field-input" type={t as string} placeholder={p as string} style={{width:'100%'}}/></div>
          ))}
          <div className="label">Kilde</div>
          <select className="field-select" style={{width:'100%'}}>{['Manuelt tilføjet','Hjemmeside formular','Telefonopkald','Showroom besøg'].map(o=><option key={o}>{o}</option>)}</select>
          <button className="btn btn-gold" style={{width:'100%',marginTop:14,justifyContent:'center'}} onClick={()=>show('✅','Lead tilføjet','Klar til AI outreach')}>+ Tilføj lead</button>
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
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Auto-import regler</div>
          {[['Importer alle leads fra CRM','Daglig synkronisering',true],['Markér kolde leads automatisk','Leads uden svar 90+ dage',true],['Deduplikering','Fjern dubletter automatisk',true]].map(([l,d,on])=>(
            <div key={l as string} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
              <div><div style={{fontSize:13,fontWeight:500}}>{l}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{d}</div></div>
              <button className={`toggle ${on?'on':'off'}`} onClick={e=>{const b=e.currentTarget;b.className=`toggle ${b.classList.contains('on')?'off':'on'}`}}></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
