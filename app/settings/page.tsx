'use client'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'
import { supabase } from '@/lib/supabase'

export default function Settings() {
  const [tab, setTab] = useState('general')
  const { show } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    dealer_name: '',
    name: '',
    sender_name: '',
    booking_link: '',
    phone: '',
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('dealers').select('*').eq('id', user.id).single()
      if (data) setForm({
        dealer_name: data.dealer_name || '',
        name: data.name || '',
        sender_name: data.sender_name || '',
        booking_link: data.booking_link || '',
        phone: data.phone || '',
      })
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('dealers').update(form).eq('id', user.id)
    if (error) { show('❌', 'Fejl ved gemning', error.message); setSaving(false); return }
    show('💾', 'Indstillinger gemt', 'Alle ændringer er gemt')
    setSaving(false)
  }

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const b = e.currentTarget; b.className=`toggle ${b.classList.contains('on')?'off':'on'}`
  }

  return (
    <div>
      <div className="tab-bar">
        {[['general','Forhandler'],['ai','AI indstillinger'],['email','Email'],['plan','Plan & fakturering']].map(([k,l])=>(
          <button key={k} className={`tab${tab===k?' active':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab==='general'&&(
        <div>
          <div style={{marginBottom:28}}>
            <div className="font-head" style={{fontSize:13,fontWeight:700,paddingBottom:10,borderBottom:'1px solid var(--border)',marginBottom:14}}>Forhandler information</div>
            {[
              ['Forhandlernavn','dealer_name','Mercedes-Benz Madrid'],
              ['Dit navn','name','Carlos Fernández'],
              ['Afsendernavn','sender_name','Carlos · Mercedes-Benz Madrid'],
              ['Booking link','booking_link','calendly.com/mercedes-madrid'],
              ['Telefonnummer','phone','+34 93 123 45 67'],
            ].map(([label, key, placeholder])=>(
              <div key={key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:13,fontWeight:500}}>{label}</div>
                <input
                  className="field-input"
                  value={form[key as keyof typeof form]}
                  onChange={e=>setForm(prev=>({...prev,[key]:e.target.value}))}
                  placeholder={placeholder}
                  style={{width:260}}
                />
              </div>
            ))}
          </div>
          <button className="btn btn-gold" onClick={save} disabled={saving}>
            {saving ? 'Gemmer...' : 'Gem indstillinger'}
          </button>
        </div>
      )}

      {tab==='ai'&&(
        <div>
          <div className="font-head" style={{fontSize:13,fontWeight:700,paddingBottom:10,borderBottom:'1px solid var(--border)',marginBottom:14}}>AI personlighed</div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>Email tone</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>Påvirker AI's skrivestil</div></div>
            <select className="field-select"><option>Varm og personlig</option><option>Professionel og formel</option><option>Direkte og salgsrettet</option></select>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>Primært email-sprog</div></div>
            <select className="field-select"><option>Spansk</option><option>Dansk</option><option>Engelsk</option><option>Tysk</option></select>
          </div>
          {[['Auto-personalisering','Brug navn, bil og tidspunkt i emails',true],['AI-genereret emne-linje','AI vælger bedst mulig',true],['Urgency-trigger','Tidsbegrænset tilbud i email 3',true],['Auto-stop ved booking','Stop sekvens når lead booker',true]].map(([l,d,on])=>(
            <div key={l as string} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
              <div><div style={{fontSize:13,fontWeight:500}}>{l}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{d}</div></div>
              <button className={`toggle ${on?'on':'off'}`} onClick={toggle}></button>
            </div>
          ))}
          <button className="btn btn-gold" style={{marginTop:16}} onClick={()=>show('💾','AI indstillinger gemt','')}>Gem AI indstillinger</button>
        </div>
      )}

      {tab==='email'&&(
        <div>
          <div className="font-head" style={{fontSize:13,fontWeight:700,paddingBottom:10,borderBottom:'1px solid var(--border)',marginBottom:14}}>Email signatur</div>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>HTML signatur</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>Vises i bunden af alle emails</div></div>
            <textarea className="field-textarea" style={{width:340,minHeight:100}} defaultValue={`Med venlig hilsen,\n${form.sender_name || form.name}\n${form.dealer_name}\n${form.phone}`}/>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>Afmeldingslink</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>Inkluderes automatisk (GDPR)</div></div>
            <button className="toggle on" onClick={toggle}></button>
          </div>
          <button className="btn btn-gold" onClick={()=>show('💾','Email indstillinger gemt','')}>Gem email indstillinger</button>
        </div>
      )}

      {tab==='plan'&&(
        <div>
          <div style={{background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',borderRadius:10,padding:18,marginBottom:14}}>
            <div className="font-head" style={{fontSize:18,fontWeight:800,color:'var(--gold)'}}>Pro Plan</div>
            <div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>€ 299/måned</div>
            <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:12}}>
              {['Ubegrænsede leads','AI email generering','Supabase database','Sekvens-automatisering','CRM integrationer','Analytics dashboard'].map(f=><div key={f} style={{color:'var(--green)'}}>✓ {f}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
