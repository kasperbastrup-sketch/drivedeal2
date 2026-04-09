'use client'

export default function Analytics() {
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {cls:'gold',label:'Total ROI',val:'1.840%',color:'var(--gold)',sub:'Abonnement vs. salg'},
          {cls:'green',label:'Gns. svartid',val:'4,2t',color:'var(--green)',sub:'Fra send → svar'},
          {cls:'blue',label:'Bedste dag',val:'Tirs',color:'var(--blue)',sub:'47% åbningsrate'},
          {cls:'amber',label:'Bedste tid',val:'10:00',color:'var(--amber)',sub:'Mest svar kl. 10-11'},
        ].map(k=>(
          <div key={k.label} className={`kpi-card ${k.cls}`}>
            <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'1.2px',fontWeight:600,marginBottom:10}}>{k.label}</div>
            <div className="font-head" style={{fontSize:28,fontWeight:700,letterSpacing:'-1px',color:k.color,marginBottom:4}}>{k.val}</div>
            <div style={{fontSize:11,color:'var(--text2)'}}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Åbningsrate per emne-linje type</div>
          {[['Personaliseret',87,'var(--green)','58%'],['Bil-specifik',65,'var(--gold)','43%'],['Nysgerrig',52,'var(--amber)','35%'],['Tilbud',38,'var(--blue)','25%'],['Generisk',18,'var(--text3)','12%']].map(([l,p,c,v])=>(
            <div key={l as string} style={{display:'flex',alignItems:'center',gap:10,marginBottom:9}}>
              <div style={{fontSize:11,color:'var(--text2)',width:130,flexShrink:0}}>{l}</div>
              <div style={{flex:1,height:5,background:'var(--surface3)',borderRadius:3,overflow:'hidden'}}><div style={{width:p+'%',height:'100%',background:c as string,borderRadius:3}}></div></div>
              <div style={{fontSize:11,fontWeight:600,width:32,textAlign:'right',color:c as string}}>{v}</div>
            </div>
          ))}
        </div>
        <div className="panel">
          <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Konvertering per bil-segment</div>
          {[['Luxury (BMW/Merc)',72,'var(--gold)','8,2%'],['SUV/Familievan',58,'var(--green)','6,6%'],['Elbil (EV)',80,'var(--blue)','9,1%'],['Kompakt',33,'var(--text2)','3,8%']].map(([l,p,c,v])=>(
            <div key={l as string} style={{display:'flex',alignItems:'center',gap:10,marginBottom:9}}>
              <div style={{fontSize:11,color:'var(--text2)',width:130,flexShrink:0}}>{l}</div>
              <div style={{flex:1,height:5,background:'var(--surface3)',borderRadius:3,overflow:'hidden'}}><div style={{width:p+'%',height:'100%',background:c as string,borderRadius:3}}></div></div>
              <div style={{fontSize:11,fontWeight:600,width:32,textAlign:'right',color:c as string}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Månedlig præstation</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,textAlign:'center'}}>
          {[{m:'Feb',rev:'€42k',sales:5,c:'var(--text2)',h:false},{m:'Mar',rev:'€67k',sales:8,c:'var(--green)',h:false},{m:'Apr',rev:'€88k',sales:11,c:'var(--green)',h:false},{m:'Maj',rev:'€112k',sales:14,c:'var(--green)',h:false},{m:'Jun',rev:'€134k',sales:16,c:'var(--green)',h:false},{m:'Jul',rev:'€94k',sales:9,c:'var(--gold)',h:true}].map(m=>(
            <div key={m.m} style={m.h?{background:'var(--goldglow)',borderRadius:8,border:'1px solid rgba(201,169,110,.3)',padding:'8px 4px'}:{padding:'8px 4px'}}>
              <div style={{fontSize:10,color:m.h?'var(--gold)':'var(--text3)',marginBottom:6}}>{m.m}{m.h?' ←':''}</div>
              <div className="font-head" style={{fontSize:16,fontWeight:700,color:m.h?'var(--gold)':'var(--text)'}}>{m.rev}</div>
              <div style={{fontSize:10,color:m.c}}>{m.sales} salg</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
