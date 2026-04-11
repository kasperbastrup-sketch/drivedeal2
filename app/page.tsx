'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const chartData = [22,38,44,31,55,42,67,58,72,48,83,91,77,124]
const maxChart = Math.max(...chartData)

const funnelLabels = ['Sendt','Åbnet','Klikket','Svarede','Booket','Salg']
const funnelColors = ['var(--blue)','var(--gold)','var(--amber)','var(--gold3)','var(--green)','var(--gold)']

export default function Dashboard() {
  const [stats, setStats] = useState({ cold:0, total:0, sent:0, booked:0 })
  const [activity, setActivity] = useState<{color:string;text:string;time:string}[]>([])
  const [currency, setCurrency] = useState('EUR')
  const [symbol, setSymbol] = useState('€')
  const [avgPrice, setAvgPrice] = useState(35000)

  const symbols: Record<string,string> = { EUR:'€',DKK:'kr',SEK:'kr',NOK:'kr',GBP:'£',USD:'$',CHF:'CHF',PLN:'zł' }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: dealer } = await supabase.from('dealers').select('currency, avg_car_price').eq('id', user.id).single()
      if (dealer) {
        const curr = dealer.currency || 'EUR'
        setCurrency(curr)
        setSymbol(symbols[curr] || '€')
        setAvgPrice(dealer.avg_car_price || 35000)
      }
      const { data: leads } = await supabase.from('leads').select('status, name, car, created_at').eq('dealer_id', user.id)
      if (!leads) return
      const cold = leads.filter(l => l.status === 'cold').length
      const sent = leads.filter(l => l.status === 'sent').length
      const booked = leads.filter(l => l.status === 'booked').length
      setStats({ cold, total: leads.length, sent, booked })
      setActivity(leads.slice(0,6).map(l => ({
        color: l.status==='booked'?'var(--green)':l.status==='sent'?'var(--gold)':'var(--blue)',
        text: l.status==='booked'?`${l.name} bookede prøvekørsel — ${l.car}`:l.status==='sent'?`AI email sendt til ${l.name} — ${l.car}`:`${l.name} tilføjet som lead — ${l.car}`,
        time: new Date(l.created_at).toLocaleDateString('da-DK'),
      })))
    }
    load()
  }, [])

  const estimatedRevenue = Math.round(stats.booked * avgPrice * 0.4)
  const funnelVals = [stats.sent, Math.round(stats.sent*.43), Math.round(stats.sent*.22), Math.round(stats.sent*.14), stats.booked, Math.round(stats.booked*.4)]

  return (
    <div>
      {/* AI STATUS BANNER */}
      <div style={{display:'flex',alignItems:'center',gap:10,background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,padding:'10px 16px',marginBottom:16}}>
        <div style={{width:8,height:8,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 6px var(--green)',flexShrink:0}}></div>
        <div style={{fontSize:12,color:'var(--text2)'}}>
          <span style={{fontWeight:600,color:'var(--text)'}}>AI sender automatisk</span>
          {' — '}hvert lead med høj score modtager en personaliseret email dagligt. Ingen handling påkrævet.
        </div>
        <a href="/integrations" style={{marginLeft:'auto',fontSize:11,color:'var(--gold)',textDecoration:'none',flexShrink:0}}>Juster indstillinger →</a>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {cls:'gold',label:'Kolde leads',val:stats.cold.toString(),color:'var(--gold)',sub:'Ikke kontaktet 90+ dage',trend:'⏸ Klar til reactivation',tc:'var(--text3)'},
          {cls:'green',label:'Emails sendt',val:stats.sent.toString(),color:'var(--green)',sub:'Via AI kampagner',trend:'AI-genererede emails',tc:'var(--text2)'},
          {cls:'blue',label:'Alle leads',val:stats.total.toString(),color:'var(--blue)',sub:'I din database',trend:'Importeret og klar',tc:'var(--text2)'},
          {cls:'amber',label:'Bookinger',val:stats.booked.toString(),color:'var(--amber)',sub:'Prøveture booket',trend:'Via AI outreach',tc:'var(--text2)'},
        ].map(k=>(
          <div key={k.label} className={`kpi-card ${k.cls}`}>
            <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'1.2px',fontWeight:600,marginBottom:10}}>{k.label}</div>
            <div style={{fontSize:36,fontWeight:800,letterSpacing:'-1.5px',color:k.color,marginBottom:4,fontFamily:'var(--font-head)',lineHeight:1}}>{k.val}</div>
            <div style={{fontSize:11,color:'var(--text2)',marginBottom:4}}>{k.sub}</div>
            <div style={{fontSize:11,color:k.tc}}>{k.trend}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:14}}>
        <div>
          <div className="panel" style={{marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div className="font-head" style={{fontSize:13,fontWeight:600}}>AI aktivitet — live</div>
              <div className="pill pill-green" style={{fontSize:10}}><span className="plan-dot"></span>Auto-kørende</div>
            </div>
            {activity.length === 0 ? (
              <div style={{textAlign:'center',padding:'30px 0',color:'var(--text3)'}}>
                <div style={{fontSize:24,marginBottom:8}}>📭</div>
                <div style={{fontSize:13}}>Ingen aktivitet endnu — importer leads for at komme i gang</div>
              </div>
            ) : activity.map((a,i)=>(
              <div key={i} style={{display:'flex',gap:12,padding:'9px 0',borderBottom:i<activity.length-1?'1px solid var(--border)':'none'}}>
                <div className="act-dot" style={{background:a.color}}></div>
                <div>
                  <div style={{fontSize:12}}>{a.text}</div>
                  <div style={{fontSize:10,color:'var(--text3)',marginTop:2,fontFamily:'var(--font-mono)'}}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Emails sendt — seneste 14 dage</div>
            <div style={{height:70,display:'flex',alignItems:'flex-end',gap:3}}>
              {chartData.map((v,i)=>(
                <div key={i} className={`chart-bar${i===chartData.length-1?' today':''}`} style={{flex:1,height:Math.round((v/maxChart)*65)+5+'px'}}></div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:5}}>
              <span style={{fontSize:10,color:'var(--text3)'}}>14 dage siden</span>
              <span style={{fontSize:10,color:'var(--text3)'}}>I dag</span>
            </div>
          </div>
        </div>

        <div>
          <div className="panel" style={{marginBottom:14}}>
            <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Konverteringstragt</div>
            {funnelLabels.map((label,i)=>{
              const val = funnelVals[i] || 0
              const pct = funnelVals[0] > 0 ? (val/funnelVals[0])*100 : 0
              return (
                <div key={label} style={{display:'flex',alignItems:'center',gap:10,marginBottom:9}}>
                  <div style={{fontSize:11,color:'var(--text2)',width:72,flexShrink:0}}>{label}</div>
                  <div style={{flex:1,height:5,background:'var(--surface3)',borderRadius:3,overflow:'hidden'}}>
                    <div style={{width:Math.max(pct,val>0?3:0)+'%',height:'100%',background:funnelColors[i],borderRadius:3}}></div>
                  </div>
                  <div style={{fontSize:12,fontWeight:700,fontFamily:'var(--font-head)',width:32,textAlign:'right',color:funnelColors[i]}}>{val}</div>
                </div>
              )
            })}
            <div style={{marginTop:16,paddingTop:14,borderTop:'1px solid var(--border)'}}>
              <div style={{fontSize:10,color:'var(--text3)',marginBottom:4,textTransform:'uppercase',letterSpacing:'1px',fontWeight:600}}>Estimeret omsætning</div>
              <div style={{fontSize:11,color:'var(--text2)',marginBottom:6}}>{stats.booked} bookinger × {avgPrice.toLocaleString('da')} {symbol} × 40%</div>
              <div style={{fontSize:38,fontWeight:800,color:'var(--gold)',letterSpacing:'-2px',fontFamily:'var(--font-head)',lineHeight:1}}>
                {currency==='EUR'?'€':''}{estimatedRevenue.toLocaleString('da')}{currency!=='EUR'?' '+symbol:''}
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Hurtig handling</div>
            <a href="/leads" style={{display:'block',marginBottom:7}}><button className="btn btn-ghost" style={{width:'100%',justifyContent:'center'}}>Gennemgå leads →</button></a>
            <a href="/import" style={{display:'block'}}><button className="btn btn-ghost" style={{width:'100%',justifyContent:'center'}}>+ Importer leads</button></a>
          </div>
        </div>
      </div>
    </div>
  )
}
