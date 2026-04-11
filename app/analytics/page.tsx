'use client'
import { useLang } from '@/lib/useLang'

export default function Analytics() {
  const { tr } = useLang()

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
    { revenue: '€42k', sales: 5 }, { revenue: '€67k', sales: 8 },
    { revenue: '€88k', sales: 11 }, { revenue: '€112k', sales: 14 },
    { revenue: '€134k', sales: 16 },
  ]

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {label:tr.totalRoi,val:'1.840%',color:'var(--gold)',sub:tr.subVsSales},
          {label:tr.avgResponseTime,val:'4,2t',color:'var(--green)',sub:tr.fromSendToReply},
          {label:tr.bestDay,val:'Tirs',color:'var(--blue)',sub:tr.openRateByType},
          {label:tr.bestTime,val:'10:00',color:'var(--gold)',sub:tr.mostRepliesAt},
        ].map(k=>(
          <div key={k.label} className="kpi-card gold">
            <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'1.2px',fontWeight:600,marginBottom:10}}>{k.label}</div>
            <div style={{fontSize:36,fontWeight:800,letterSpacing:'-1.5px',color:k.color,marginBottom:4,fontFamily:'var(--font-head)',lineHeight:1}}>{k.val}</div>
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
              <div style={{fontSize:18,fontWeight:800,color:'var(--gold)',fontFamily:'var(--font-head)'}}>{monthData[i].revenue}</div>
              <div style={{fontSize:11,color:'var(--text2)',marginTop:4}}>{monthData[i].sales} {tr.sales}</div>
            </div>
          ))}
          <div style={{background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',borderRadius:8,padding:'12px 10px',textAlign:'center'}}>
            <div style={{fontSize:11,color:'var(--gold)',marginBottom:6}}>Jul ←</div>
            <div style={{fontSize:18,fontWeight:800,color:'var(--gold)',fontFamily:'var(--font-head)'}}>€94k</div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:4}}>9 {tr.sales}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
