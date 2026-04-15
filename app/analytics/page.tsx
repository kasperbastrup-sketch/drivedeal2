'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/useLang'

export default function Analytics() {
  const { tr } = useLang()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSent: 0,
    totalOpened: 0,
    totalLeads: 0,
    coldLeads: 0,
    warmLeads: 0,
    sentLeads: 0,
    repliedLeads: 0,
    bookedLeads: 0,
    symbol: '€',
    avgCarPrice: 35000,
  })
  const [monthlyData, setMonthlyData] = useState<{month: string, sent: number, opened: number}[]>([])
  const [recentLogs, setRecentLogs] = useState<any[]>([])

  const symbols: Record<string,string> = { EUR:'€', DKK:'kr', SEK:'kr', NOK:'kr', GBP:'£', USD:'$', CHF:'CHF', PLN:'zł' }

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [dealerRes, leadsRes, logsRes] = await Promise.all([
      supabase.from('dealers').select('currency, avg_car_price').eq('id', user.id).single(),
      supabase.from('leads').select('status').eq('dealer_id', user.id),
      supabase.from('email_logs').select('*').eq('dealer_id', user.id).order('created_at', { ascending: false }),
    ])

    const dealer = dealerRes.data
    const leads = leadsRes.data || []
    const logs = logsRes.data || []

    const symbol = symbols[dealer?.currency || 'EUR'] || '€'
    const avgPrice = dealer?.avg_car_price || 35000

    setStats({
      totalSent: logs.length,
      totalOpened: logs.filter(l => l.opened).length,
      totalLeads: leads.length,
      coldLeads: leads.filter(l => l.status === 'cold').length,
      warmLeads: leads.filter(l => l.status === 'warm').length,
      sentLeads: leads.filter(l => l.status === 'sent').length,
      repliedLeads: leads.filter(l => l.status === 'replied').length,
      bookedLeads: leads.filter(l => l.status === 'booked').length,
      symbol,
      avgCarPrice: avgPrice,
    })

    setRecentLogs(logs.slice(0, 10))

    // Byg månedlig data fra logs
    const monthMap: Record<string, {sent: number, opened: number}> = {}
    logs.forEach(log => {
      const month = new Date(log.created_at).toLocaleDateString('da-DK', { month: 'short', year: '2-digit' })
      if (!monthMap[month]) monthMap[month] = { sent: 0, opened: 0 }
      monthMap[month].sent++
      if (log.opened) monthMap[month].opened++
    })

    const monthly = Object.entries(monthMap).slice(-6).map(([month, data]) => ({
      month,
      sent: data.sent,
      opened: data.opened,
    }))

    setMonthlyData(monthly)
    setLoading(false)
  }

  const openRate = stats.totalSent > 0 ? Math.round((stats.totalOpened / stats.totalSent) * 100) : 0
  const conversionRate = stats.totalLeads > 0 ? Math.round((stats.bookedLeads / stats.totalLeads) * 100) : 0
  const estimatedRevenue = Math.round(stats.bookedLeads * stats.avgCarPrice * 0.4)

  function formatRevenue(amount: number) {
    if (amount >= 1000000) return `${(amount/1000000).toFixed(1)}M`
    if (amount >= 1000) return `${Math.round(amount/1000)}k`
    return amount.toString()
  }

  function formatCurrency(amount: number) {
    return stats.symbol === '€' || stats.symbol === '£' || stats.symbol === '$'
      ? `${stats.symbol}${formatRevenue(amount)}`
      : `${formatRevenue(amount)} ${stats.symbol}`
  }

  if (loading) return <div style={{textAlign:'center',padding:60,color:'var(--text3)'}}>Henter data...</div>

  return (
    <div>
      {/* KPI KORT */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {label:'Emails sendt', val:stats.totalSent.toString(), color:'var(--gold)', sub:'Totalt via AI'},
          {label:'Åbningsrate', val:`${openRate}%`, color:'var(--green)', sub:`${stats.totalOpened} af ${stats.totalSent} åbnet`},
          {label:'Bookinger', val:stats.bookedLeads.toString(), color:'var(--blue)', sub:'Leads der har booket'},
          {label:'Est. omsætning', val:formatCurrency(estimatedRevenue), color:'var(--gold)', sub:'Baseret på bookinger'},
        ].map(k => (
          <div key={k.label} className="kpi-card gold">
            <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'1.2px',fontWeight:600,marginBottom:10}}>{k.label}</div>
            <div style={{fontSize:32,fontWeight:800,color:k.color,marginBottom:4,lineHeight:1}}>{k.val}</div>
            <div style={{fontSize:11,color:'var(--text2)'}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        {/* LEAD STATUS */}
        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:16}}>Lead oversigt</div>
          {[
            {label:'Kolde leads', val:stats.coldLeads, color:'var(--blue)'},
            {label:'Varme leads', val:stats.warmLeads, color:'var(--gold)'},
            {label:'AI sendt', val:stats.sentLeads, color:'var(--green)'},
            {label:'Svarede', val:stats.repliedLeads, color:'#a78bfa'},
            {label:'Booket', val:stats.bookedLeads, color:'var(--green)'},
          ].map(s => (
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{fontSize:12,color:'var(--text2)',width:110,flexShrink:0}}>{s.label}</div>
              <div style={{flex:1,height:6,background:'var(--surface3)',borderRadius:3,overflow:'hidden'}}>
                <div style={{width:stats.totalLeads > 0 ? `${(s.val/stats.totalLeads)*100}%` : '0%',height:'100%',background:s.color,borderRadius:3}}></div>
              </div>
              <div style={{fontSize:12,fontWeight:700,color:s.color,width:30,textAlign:'right'}}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* KONVERTERINGSTRAGT */}
        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:16}}>Konverteringstragt</div>
          {[
            {label:'Emails sendt', val:stats.totalSent, color:'var(--text2)'},
            {label:'Åbnet', val:stats.totalOpened, color:'var(--gold)'},
            {label:'Svarede', val:stats.repliedLeads, color:'#a78bfa'},
            {label:'Booket', val:stats.bookedLeads, color:'var(--green)'},
          ].map((s,i) => (
            <div key={s.label} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{fontSize:12,color:'var(--text2)',width:110,flexShrink:0}}>{s.label}</div>
              <div style={{flex:1,height:8,background:'var(--surface3)',borderRadius:4,overflow:'hidden'}}>
                <div style={{width:stats.totalSent > 0 ? `${(s.val/stats.totalSent)*100}%` : '0%',height:'100%',background:s.color,borderRadius:4}}></div>
              </div>
              <div style={{fontSize:12,fontWeight:700,color:s.color,width:40,textAlign:'right'}}>{s.val}</div>
            </div>
          ))}
          <div style={{marginTop:16,paddingTop:12,borderTop:'1px solid var(--border)',fontSize:11,color:'var(--text2)'}}>
            Konverteringsrate: <strong style={{color:'var(--green)'}}>{conversionRate}%</strong>
          </div>
        </div>
      </div>

      {/* MÅNEDLIG PRÆSTATION */}
      {monthlyData.length > 0 && (
        <div className="panel" style={{marginBottom:14}}>
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:16}}>Månedlig aktivitet</div>
          <div style={{display:'grid',gridTemplateColumns:`repeat(${monthlyData.length},1fr)`,gap:8}}>
            {monthlyData.map((m,i) => (
              <div key={m.month} style={{background:i===monthlyData.length-1?'var(--goldglow)':'var(--surface2)',border:`1px solid ${i===monthlyData.length-1?'rgba(201,169,110,.3)':'var(--border)'}`,borderRadius:8,padding:'12px 10px',textAlign:'center'}}>
                <div style={{fontSize:11,color:'var(--text3)',marginBottom:6}}>{m.month}</div>
                <div style={{fontSize:18,fontWeight:800,color:'var(--gold)'}}>{m.sent}</div>
                <div style={{fontSize:10,color:'var(--text2)',marginTop:4}}>sendt</div>
                {m.opened > 0 && <div style={{fontSize:10,color:'var(--green)',marginTop:2}}>{Math.round((m.opened/m.sent)*100)}% åbnet</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SENESTE EMAILS */}
      {recentLogs.length > 0 && (
        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Seneste sendte emails</div>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                {['Emne','Status','Sendt','Åbnet'].map(h => (
                  <th key={h} style={{padding:'8px 12px',textAlign:'left',fontSize:10,color:'var(--text3)',fontWeight:600,textTransform:'uppercase',letterSpacing:.8}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLogs.map(log => (
                <tr key={log.id} style={{borderBottom:'1px solid var(--border)'}}>
                  <td style={{padding:'10px 12px',fontSize:12}}>{log.subject}</td>
                  <td style={{padding:'10px 12px'}}>
                    <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:10,background:'var(--greenbg)',color:'var(--green)'}}>Sendt</span>
                  </td>
                  <td style={{padding:'10px 12px',fontSize:11,color:'var(--text3)'}}>
                    {new Date(log.created_at).toLocaleDateString('da-DK', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                  </td>
                  <td style={{padding:'10px 12px'}}>
                    {log.opened
                      ? <span style={{fontSize:11,color:'var(--green)'}}>✓ Åbnet</span>
                      : <span style={{fontSize:11,color:'var(--text3)'}}>—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* INGEN DATA ENDNU */}
      {stats.totalSent === 0 && (
        <div className="panel" style={{textAlign:'center',padding:60}}>
          <div style={{fontSize:36,marginBottom:10}}>📊</div>
          <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:6}}>Ingen data endnu</div>
          <div style={{fontSize:12,color:'var(--text3)'}}>Data vises her automatisk når systemet begynder at sende emails til dine leads.</div>
        </div>
      )}
    </div>
  )
}
