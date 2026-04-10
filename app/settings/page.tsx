'use client'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'
import { supabase } from '@/lib/supabase'

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
  EUR: 35000, DKK: 260000, SEK: 380000, NOK: 350000,
  GBP: 30000, USD: 38000, CHF: 42000, PLN: 150000,
}

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
    currency: 'EUR',
    avg_car_price: '35000',
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
        currency: data.currency || 'EUR',
        avg_car_price: data.avg_car_price?.toString() || avgCarPrices[data.currency || 'EUR'].toString(),
      })
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    const { error } = await supabase.from('dealers').update({
      ...form,
      avg_car_price: parseInt(form.avg_car_price),
    }).eq('id', user.id)
    if (error) { show('❌', 'Fejl ved gemning', error.message); setSaving(false); return }
    show('💾', 'Indstillinger gemt', 'Dashboard opdaterer med din valuta')
    setSaving(false)
  }

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const b = e.currentTarget; b.className=`toggle ${b.classList.contains('on')?'off':'on'}`
  }

  const selectedCurrency = currencies.find(c => c.code === form.currency)

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

            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>Valuta</div>
                <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>Bruges til estimeret omsætning på dashboard</div>
              </div>
              <select
                className="field-select"
                value={form.currency}
                onChange={e=>{
                  const newCurrency = e.target.value
                  setForm(prev=>({
                    ...prev,
                    currency: newCurrency,
                    avg_car_price: avgCarPrices[newCurrency].toString()
                  }))
                }}
                style={{width:260}}
              >
                {currencies.map(c=><option key={c.code} value={c.code}>{c.symbol} — {c.name}</option>)}
              </select>
            </div>

            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>Gennemsnitlig bilpris</div>
                <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>Bruges til at beregne estimeret omsætning</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:13,color:'var(--text2)'}}>{selectedCurrency?.symbol}</span>
                <input
                  className="field-input"
                  type="number"
                  value={form.avg_car_price}
                  onChange={e=>setForm(prev=>({...prev,avg_car_price:e.target.value}))}
                  style={{width:140,textAlign:'right'}}
                />
              </div>
            </div>

            <div style={{background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.2)',borderRadius:9,padding:12,marginTop:14}}>
              <div style={{fontSize:11,color:'var(--gold)',fontWeight:600,marginBottom:4}}>Estimeringsformel</div>
              <div style={{fontSize:11,color:'var(--text2)',lineHeight:1.7}}>
                Estimeret omsætning = Bookinger × Gennemsnitlig bilpris × 40% konverteringsrate<br/>
                Eks: 10 bookinger × {parseInt(form.avg_car_price).toLocaleString('da')} {selectedCurrency?.symbol} × 40% = <strong style={{color:'var(--gold)'}}>{(10 * parseInt(form.avg_car_price||'0') * 0.4).toLocaleString('da')} {selectedCurrency?.symbol}</strong>
              </div>
            </div>
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
            <select className="field-select"><option>Spansk</option><option>Dansk</option><option>Engelsk</option><option>Norsk</option><option>Svensk</option><option>Tysk</option></select>
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
