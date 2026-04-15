'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/useLang'

export default function Analytics() {
  const { tr } = useLang()
  const [symbol, setSymbol] = useState('€')

  const symbols: Record<string,string> = { EUR:'€', DKK:'kr', SEK:'kr', NOK:'kr', GBP:'£', USD:'$', CHF:'CHF', PLN:'zł' }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('dealers').select('currency').eq('id', user.id).single()
      if (data?.currency) setSymbol(symbols[data.currency] || '€')
    }
    load()
  }, [])

  const subjectTypes = [
    { label: tr.personalized, pct: 58, color: 'var(--green)' },
    { label: tr.carSpecific, pct: 43, color: 'var(--gold)' },
    { label: tr.curious, pct: 35, color: 'var(--amber)' },
    { label: tr.offer, pct: 25, color: 'var(--blue)' },
    { label: tr.generic, pct: 12, color: 'var(--text3)' },
  ]

  const segments = [
    { label: tr.luxury, pct: 8.2, color: 'var(--gold)' },
    { label: tr.suv, pct: 6.6, color: 'var(--green)' },
    { label: tr.ev, pct: 9.1, color: 'var(--blue)' },
    { label: tr.compact, pct: 3.8, color: 'var(--text3)' },
  ]

  const months = ['Feb','Mar','Apr','Maj','Jun']
  const monthData = [
    { revenue: 42, sales: 5 }, { revenue: 67, sales: 8 },
    { revenue: 88, sales: 11 }, { revenue: 112, sales: 14 },
    { revenue: 134, sales: 16 },
  ]

  function formatRevenue(k: number) {
    return symbol === '€' || symbol === '£' || symbol === '$'
      ? `${symbol}${k}k`
      : `${k}k ${symbol}`
  }

  return (
    <div>
      <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:16}}>📊</span>
        <div style={{fontSize:11,color:'var(--text2)'}}>Tallene herunder er estimerede og baseret på branchegennemsnit. Præcise tal fra dine egne kampagner vises automatisk når Gmail er forbundet og systemet har sendt de første emails.</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {label:tr.totalRoi,val:'1.840%',color:'var(--gold)',sub:tr.subVsSales},
          {label:tr.avgResponseTime,val:'4,2t',color:'var(--green)',sub:tr.fromSendToReply},
          {label:tr.bestDay,val:'Tirs',color:'var(--blue)',sub:tr.openRateByType},
          {label:tr.bestTime,val:'10:00',color:'var(--gold)',sub:tr.mostRepliesAt},
        ].map(k=>(
          <div key={k.label} className="kpi-card gold">
            <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'1.2px',fontWeight:600,marginBottom:10}}>{k.label}</div>
            <div style={{fontSize:36,fontWeight:800,letterSpacing:'-1.5px',color:k.color,marginBottom:4,lineHeight:1}}>{k.val}</div>
            <div style={{fontSize:11,color:'var(--text2)'}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:16}}>{tr.openRateBySubject}</div>
          {subjectTypes.map(s=>(
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{fontSize:12,color:'var(--text2)',width:120,flexShrink:0}}>{s.label}</div>
              <div style={{flex:1,height:6,background:'var(--surface3)',borderRadius:3,overflow:'hidden'}}>
                <div style={{width:s.pct+'%',height:'100%',background:s.color,borderRadius:3}}></div>
              </div>
              <div style={{fontSize:12,fontWeight:700,color:s.color,width:40,textAlign:'right'}}>{s.pct}%</div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:16}}>{tr.conversionBySegment}</div>
          {segments.map(s=>(
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{fontSize:12,color:'var(--text2)',width:130,flexShrink:0}}>{s.label}</div>
              <div style={{flex:1,height:6,background:'var(--surface3)',borderRadius:3,overflow:'hidden'}}>
                <div style={{width:(s.pct*10)+'%',height:'100%',background:s.color,borderRadius:3}}></div>
              </div>
              <div style={{fontSize:12,fontWeight:700,color:s.color,width:40,textAlign:'right'}}>{s.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:16}}>{tr.monthlyPerformance}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8}}>
          {months.map((m,i)=>(
            <div key={m} style={{background:'var(--surface2)',borderRadius:8,padding:'12px 10px',textAlign:'center'}}>
              <div style={{fontSize:11,color:'var(--text3)',marginBottom:6}}>{m}</div>
              <div style={{fontSize:18,fontWeight:800,color:'var(--gold)'}}>{formatRevenue(monthData[i].revenue)}</div>
              <div style={{fontSize:11,color:'var(--text2)',marginTop:4}}>{monthData[i].sales} {tr.sales}</div>
            </div>
          ))}
          <div style={{background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',borderRadius:8,padding:'12px 10px',textAlign:'center'}}>
            <div style={{fontSize:11,color:'var(--gold)',marginBottom:6}}>Jul ←</div>
            <div style={{fontSize:18,fontWeight:800,color:'var(--gold)'}}>{formatRevenue(94)}</div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:4}}>9 {tr.sales}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
