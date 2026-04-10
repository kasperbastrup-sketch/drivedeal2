'use client'

const chartData = [22,38,44,31,55,42,67,58,72,48,83,91,77,124]
const maxChart = Math.max(...chartData)

const activity = [
  {color:'var(--green)',text:'Carlos Mendez bookede prøvekørsel — BMW 520d',time:'I dag · 14:32'},
  {color:'var(--gold)',text:'AI sendte 47 emails — "Sommer Reactivation"',time:'I dag · 10:00'},
  {color:'var(--green)',text:'María González svarede: "Hvornår kan jeg komme ind?"',time:'I går · 16:18'},
  {color:'var(--blue)',text:'82 leads importeret fra HubSpot CRM',time:'I går · 09:00'},
  {color:'var(--green)',text:'Antonio Ruiz besøgte forhandleren — bil solgt ✓',time:'Mandag · 11:45'},
  {color:'var(--gold)',text:'AI genoplivede 12 leads over 180 dage — 3 svarede',time:'Søndag · 08:00'},
]

const funnel = [
  {label:'Sendt',val:312,pct:100,color:'var(--blue)'},
  {label:'Åbnet',val:134,pct:43,color:'var(--gold)'},
  {label:'Klikket',val:68,pct:22,color:'var(--amber)'},
  {label:'Svarede',val:44,pct:14,color:'var(--gold3)'},
  {label:'Booket',val:22,pct:7,color:'var(--green)'},
  {label:'Salg',val:9,pct:3,color:'var(--gold)'},
]

export default function Dashboard() {
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {cls:'gold',label:'Kolde leads',val:'847',color:'var(--gold)',sub:'Ikke kontaktet 90+ dage',trend:'⏸ Klar til reactivation',tc:'var(--text3)'},
          {cls:'green',label:'Emails sendt i dag',val:'124',color:'var(--green)',sub:'Via Gmail integration',trend:'↑ +31 fra i går',tc:'var(--green)'},
          {cls:'blue',label:'Åbningsrate',val:'43%',color:'var(--blue)',sub:'Branche snit: 22%',trend:'↑ +21pp over snit',tc:'var(--green)'},
          {cls:'amber',label:'Bookinger',val:'22',color:'var(--amber)',sub:'Prøveture denne måned',trend:'↑ +6 fra forrige måned',tc:'var(--green)'},
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
              <div style={{fontFamily:'var(--font-head)',fontSize:13,fontWeight:600}}>AI aktivitet — live</div>
              <div className="pill pill-green" style={{fontSize:10}}><span className="plan-dot"></span> Auto-kørende</div>
            </div>
            {activity.map((a,i)=>(
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
            <div style={{fontFamily:'var(--font-head)',fontSize:13,fontWeight:600,marginBottom:14}}>Emails sendt — seneste 14 dage</div>
            <div style={{height:70,display:'flex',alignItems:'flex-end',gap:3}}>
              {chartData.map((v,i)=>(
                <div key={i} className={`chart-bar${i===chartData.length-1?' today':''}`} style={{flex:1,height:Math.round((v/maxChart)*65)+5+'px'}} title={`${v} emails`}></div>
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
            <div style={{fontFamily:'var(--font-head)',fontSize:13,fontWeight:600,marginBottom:14}}>Konverteringstragt</div>
            {funnel.map(f=>(
              <div key={f.label} style={{display:'flex',alignItems:'center',gap:10,marginBottom:9}}>
                <div style={{fontSize:11,color:'var(--text2)',width:72,flexShrink:0}}>{f.label}</div>
                <div style={{flex:1,height:5,background:'var(--surface3)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{width:f.pct+'%',height:'100%',background:f.color,borderRadius:3}}></div>
                </div>
                <div style={{fontSize:12,fontWeight:700,fontFamily:'var(--font-head)',width:32,textAlign:'right',color:f.color}}>{f.val}</div>
              </div>
            ))}
            <div style={{marginTop:16,paddingTop:14,borderTop:'1px solid var(--border)'}}>
              <div style={{fontSize:10,color:'var(--text3)',marginBottom:8,textTransform:'uppercase',letterSpacing:'1px',fontWeight:600}}>AI-genereret omsætning (est.)</div>
              <div style={{fontSize:38,fontWeight:800,color:'var(--gold)',letterSpacing:'-2px',fontFamily:'var(--font-head)',lineHeight:1}}>€ 243.600</div>
            </div>
          </div>

          <div className="panel">
            <div style={{fontFamily:'var(--font-head)',fontSize:13,fontWeight:600,marginBottom:14}}>Hurtig handling</div>
            <a href="/leads" style={{display:'block',marginBottom:7}}><button className="btn btn-ghost" style={{width:'100%',justifyContent:'center'}}>Gennemgå kolde leads →</button></a>
            <a href="/import" style={{display:'block'}}><button className="btn btn-ghost" style={{width:'100%',justifyContent:'center'}}>+ Importer leads fra CRM</button></a>
          </div>
        </div>
      </div>
    </div>
  )
}
