'use client'
import { useState } from 'react'
import { useToast } from '@/components/Toast'

export default function Settings() {
  const [tab, setTab] = useState('general')
  const { show } = useToast()
  function toggle(e: React.MouseEvent<HTMLButtonElement>){const b=e.currentTarget;b.className=`toggle ${b.classList.contains('on')?'off':'on'}`}

  return (
    <div>
      <div className="tab-bar">
        {[['general','Forhandler'],['ai','AI indstillinger'],['email','Email'],['plan','Plan & fakturering']].map(([k,l])=>(
          <button key={k} className={`tab${tab===k?' active':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>
      {tab==='general'&&<div>
        {[['Forhandlernavn','Mercedes-Benz Barcelona'],['By / marked','Barcelona, Spanien'],['Afsendernavn','Carlos · Mercedes-Benz Barcelona'],['Booking link','calendly.com/mercedes-bcn'],['Telefonnummer','+34 93 123 45 67']].map(([l,v])=>(
          <div key={l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}><div style={{fontSize:13,fontWeight:500}}>{l}</div><input className="field-input" defaultValue={v as string} style={{width:260}}/></div>
        ))}
        <button className="btn btn-gold" style={{marginTop:16}} onClick={()=>show('💾','Indstillinger gemt','')}>Gem indstillinger</button>
      </div>}
      {tab==='ai'&&<div>
        {[['Auto-personalisering','Brug navn, bil og tidspunkt',true],['AI-genereret emne-linje','AI vælger bedst mulig',true],['Urgency-trigger','Tidsbegrænset tilbud i email 3',true],['Auto-stop ved booking','Stop sekvens når lead booker',true]].map(([l,d,on])=>(
          <div key={l as string} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}><div><div style={{fontSize:13,fontWeight:500}}>{l}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{d}</div></div><button className={`toggle ${on?'on':'off'}`} onClick={toggle}></button></div>
        ))}
        <button className="btn btn-gold" style={{marginTop:16}} onClick={()=>show('💾','AI indstillinger gemt','')}>Gem AI indstillinger</button>
      </div>}
      {tab==='email'&&<div>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}><div><div style={{fontSize:13,fontWeight:500}}>HTML signatur</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>Vises i bunden af alle emails</div></div><textarea className="field-textarea" style={{width:340,minHeight:100}} defaultValue={'Med venlig hilsen,\nCarlos Fernández\nMercedes-Benz Barcelona\n+34 93 123 45 67'}/></div>
        <button className="btn btn-gold" style={{marginTop:16}} onClick={()=>show('💾','Email indstillinger gemt','')}>Gem email indstillinger</button>
      </div>}
      {tab==='plan'&&<div>
        <div style={{background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',borderRadius:10,padding:18,marginBottom:14}}>
          <div className="font-head" style={{fontSize:18,fontWeight:800,color:'var(--gold)'}}>Pro Plan</div>
          <div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>€ 299/måned · Fornyes 1. august 2025</div>
          <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:12}}>
            {['Ubegrænsede leads','AI email generering','Gmail integration','Sekvens-automatisering','CRM integrationer','Analytics dashboard'].map(f=><div key={f} style={{color:'var(--green)'}}>✓ {f}</div>)}
          </div>
        </div>
        {[['Næste faktura','€ 299,00 · 1. aug. 2025'],['Betalingsmetode','Visa ·· 4242']].map(([l,v])=>(
          <div key={l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}><div style={{fontSize:13,fontWeight:500}}>{l}</div><div style={{fontSize:13,color:'var(--text2)'}}>{v}</div></div>
        ))}
      </div>}
    </div>
  )
}
