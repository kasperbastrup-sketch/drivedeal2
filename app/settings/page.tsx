'use client'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/useLang'

const currencies = [
  { code: 'EUR', symbol: '€', name: 'Euro (Spanien, Tyskland, Frankrig)' },
  { code: 'DKK', symbol: 'kr', name: 'Danske kroner' },
  { code: 'SEK', symbol: 'kr', name: 'Svenske kroner' },
  { code: 'NOK', symbol: 'kr', name: 'Norske kroner' },
  { code: 'GBP', symbol: '£', name: 'Britiske pund' },
  { code: 'USD', symbol: '$', name: 'Amerikanske dollars' },
  { code: 'CHF', symbol: 'CHF', name: 'Schweiziske franc' },
  { code: 'PLN', symbol: 'zł', name: 'Polske zloty' },
]

const avgCarPrices: Record<string,number> = {
  EUR:35000, DKK:260000, SEK:380000, NOK:350000,
  GBP:30000, USD:38000, CHF:42000, PLN:150000,
}

const toneValues = ['warm', 'professional', 'direct']

export default function Settings() {
  const [tab, setTab] = useState('general')
  const { show } = useToast()
  const { tr } = useLang()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    dealer_name:'', name:'', sender_name:'', booking_link:'', phone:'',
    currency:'EUR', avg_car_price:'35000',
  })
  const [aiForm, setAiForm] = useState({
    ai_tone:'warm', ai_language:'spansk', app_language:'da',
    auto_personalization:true, ai_subject:true, urgency_trigger:true, auto_stop:true,
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('dealers').select('*').eq('id', user.id).single()
      if (data) {
        setForm({ dealer_name:data.dealer_name||'', name:data.name||'', sender_name:data.sender_name||'', booking_link:data.booking_link||'', phone:data.phone||'', currency:data.currency||'EUR', avg_car_price:data.avg_car_price?.toString()||'35000' })
        setAiForm({ ai_tone:data.ai_tone||'warm', ai_language:data.ai_language||'spansk', app_language:data.app_language||'da', auto_personalization:data.auto_personalization??true, ai_subject:data.ai_subject??true, urgency_trigger:data.urgency_trigger??true, auto_stop:data.auto_stop??true })
      }
    }
    load()
  }, [])

  async function saveGeneral() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('dealers').update({ ...form, avg_car_price: parseInt(form.avg_car_price) }).eq('id', user.id)
    if (error) { show('❌', 'Error', error.message); setSaving(false); return }
    show('💾', tr.saveSettings, '')
    setSaving(false)
  }

  async function saveAI() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('dealers').update(aiForm).eq('id', user.id)
    if (error) { show('❌', 'Error', error.message); setSaving(false); return }
    show('💾', tr.saveAiSettings, 'Refresh siden for at se nyt sprog')
    setSaving(false)
  }

  const selectedCurrency = currencies.find(c => c.code === form.currency)

  const aiToggles = [
    ['auto_personalization','Auto-personalisering','Brug navn, bil og tidspunkt i emails'],
    ['ai_subject','AI-genereret emne-linje','AI vælger bedst mulig emne-linje'],
    ['urgency_trigger','Urgency-trigger','Tidsbegrænset tilbud i email 3'],
    ['auto_stop','Auto-stop ved booking','Stop sekvens når lead booker'],
  ]

  const emailLangs = [
    {val:'spansk',label:'Spansk'},{val:'dansk',label:'Dansk'},{val:'engelsk',label:'Engelsk'},
    {val:'norsk',label:'Norsk'},{val:'svensk',label:'Svensk'},{val:'tysk',label:'Tysk'},
    {val:'fransk',label:'Fransk'},{val:'nederlandsk',label:'Nederlandsk'},
  ]

  return (
    <div>
      <div className="tab-bar">
        {[[' general',tr.dealerInfo],['ai',tr.aiPersonality],['email',tr.emailSignature],['plan',tr.plan]].map(([k,l])=>(
          <button key={k} className={`tab${tab===k.trim()?' active':''}`} onClick={()=>setTab(k.trim())}>{l}</button>
        ))}
      </div>

      {tab==='general'&&(
        <div>
          <div style={{marginBottom:28}}>
            <div className="font-head" style={{fontSize:13,fontWeight:700,paddingBottom:10,borderBottom:'1px solid var(--border)',marginBottom:14}}>{tr.dealerInfo}</div>
            {[
              [tr.dealerName,'dealer_name','Mercedes-Benz Madrid'],
              [tr.yourName,'name','Carlos Fernández'],
              [tr.senderName,'sender_name','Carlos · Mercedes-Benz Madrid'],
              [tr.bookingLink,'booking_link','calendly.com/mercedes-madrid'],
              [tr.phoneNumber,'phone','+34 93 123 45 67'],
            ].map(([label,key,placeholder])=>(
              <div key={key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:13,fontWeight:500}}>{label}</div>
                <input className="field-input" value={form[key as keyof typeof form]} onChange={e=>setForm(prev=>({...prev,[key]:e.target.value}))} placeholder={placeholder} style={{width:260}}/>
              </div>
            ))}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
              <div><div style={{fontSize:13,fontWeight:500}}>{tr.currency}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{tr.currencyDesc}</div></div>
              <select className="field-select" value={form.currency} onChange={e=>{const c=e.target.value;setForm(prev=>({...prev,currency:c,avg_car_price:avgCarPrices[c].toString()}))}} style={{width:260}}>
                {currencies.map(c=><option key={c.code} value={c.code}>{c.symbol} — {c.name}</option>)}
              </select>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
              <div><div style={{fontSize:13,fontWeight:500}}>{tr.avgCarPrice}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{tr.avgCarPriceDesc}</div></div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:13,color:'var(--text2)'}}>{selectedCurrency?.symbol}</span>
                <input className="field-input" type="number" value={form.avg_car_price} onChange={e=>setForm(prev=>({...prev,avg_car_price:e.target.value}))} style={{width:140,textAlign:'right'}}/>
              </div>
            </div>
          </div>
          <button className="btn btn-gold" onClick={saveGeneral} disabled={saving}>{saving?tr.saving:tr.saveSettings}</button>
        </div>
      )}

      {tab==='ai'&&(
        <div>
          <div className="font-head" style={{fontSize:13,fontWeight:700,paddingBottom:10,borderBottom:'1px solid var(--border)',marginBottom:14}}>{tr.aiPersonality}</div>

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{tr.appLanguage}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{tr.appLanguageDesc}</div></div>
            <select className="field-select" value={aiForm.app_language} onChange={e=>setAiForm(prev=>({...prev,app_language:e.target.value}))}>
              <option value="da">🇩🇰 Dansk</option>
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇬🇧 English</option>
            </select>
          </div>

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{tr.emailTone}</div></div>
            <select className="field-select" value={aiForm.ai_tone} onChange={e=>setAiForm(prev=>({...prev,ai_tone:e.target.value}))}>
              {tr.toneOptions.map((label,i)=><option key={i} value={toneValues[i]}>{label}</option>)}
            </select>
          </div>

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{tr.primaryLanguage}</div></div>
            <select className="field-select" value={aiForm.ai_language} onChange={e=>setAiForm(prev=>({...prev,ai_language:e.target.value}))}>
              {emailLangs.map(l=><option key={l.val} value={l.val}>{l.label}</option>)}
            </select>
          </div>

          {aiToggles.map(([key,label,desc])=>(
            <div key={key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
              <div><div style={{fontSize:13,fontWeight:500}}>{label}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{desc}</div></div>
              <button className={`toggle ${aiForm[key as keyof typeof aiForm]?'on':'off'}`} onClick={()=>setAiForm(prev=>({...prev,[key]:!prev[key as keyof typeof aiForm]}))}></button>
            </div>
          ))}
          <button className="btn btn-gold" style={{marginTop:16}} onClick={saveAI} disabled={saving}>{saving?tr.saving:tr.saveAiSettings}</button>
        </div>
      )}

      {tab==='email'&&(
        <div>
          <div className="font-head" style={{fontSize:13,fontWeight:700,paddingBottom:10,borderBottom:'1px solid var(--border)',marginBottom:14}}>{tr.emailSignature}</div>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{tr.htmlSignature}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{tr.signatureDesc}</div></div>
            <textarea className="field-textarea" style={{width:340,minHeight:100}} defaultValue={`${form.sender_name||form.name}\n${form.dealer_name}\n${form.phone}`}/>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{tr.unsubscribeLink}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{tr.unsubscribeLinkDesc}</div></div>
            <button className="toggle on" onClick={e=>{const b=e.currentTarget;b.className=`toggle ${b.classList.contains('on')?'off':'on'}`}}></button>
          </div>
          <button className="btn btn-gold" style={{marginTop:16}} onClick={()=>show('💾',tr.saveEmailSettings,'')}>{tr.saveEmailSettings}</button>
        </div>
      )}

      {tab==='plan'&&(
        <div>
          <div style={{background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',borderRadius:10,padding:18}}>
            <div className="font-head" style={{fontSize:18,fontWeight:800,color:'var(--gold)'}}>Pro Plan</div>
            <div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>3.999 kr/md ekskl. moms</div>
            <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:12}}>
              {['Ubegrænsede leads','AI email generering','Supabase database','Sekvens-automatisering','CRM integrationer','Analytics dashboard'].map(f=><div key={f} style={{color:'var(--green)'}}>✓ {f}</div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
