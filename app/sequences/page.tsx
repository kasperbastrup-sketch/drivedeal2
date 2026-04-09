'use client'
import { useToast } from '@/components/Toast'

export default function Sequences() {
  const { show } = useToast()
  const seqs = [
    {name:'Standard Reactivation — 3 emails',rate:'7,4%',active:false,steps:[{day:'Dag 0',name:'Personlig check-in email',desc:'Sendes straks ved kampagnestart'},{day:'Dag 5',name:'Blid opfølgning',desc:'Kun hvis email 1 ikke er besvaret'},{day:'Dag 12',name:'Eksklusivt tilbud',desc:'Sidste chance med personlig rabat'}]},
    {name:'EV Interesse — 4 emails',rate:'9,8%',active:true,steps:[{day:'Dag 0',name:'EV fordele intro',desc:'Nysgerrighed-drevet åbning'},{day:'Dag 3',name:'Specifik model info',desc:'Personaliseret til bil-interesse'},{day:'Dag 8',name:'Prøvekørsel invitation',desc:'Med booking link'},{day:'Dag 18',name:'Tidsbegrænset tilbud',desc:'Urgency-trigger med deadline'}]},
  ]
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div className="font-head" style={{fontSize:14,fontWeight:700}}>Email sekvenser</div>
        <button className="btn btn-gold" onClick={()=>show('✨','Ny sekvens','')}>+ Ny sekvens</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        {seqs.map(seq=>(
          <div key={seq.name} className="panel">
            <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>{seq.name}</div>
            {seq.steps.map((s,i)=>(
              <div key={i}>
                <div className="seq-step">
                  <div className="seq-num">{i+1}</div>
                  <div style={{flex:1}}><div style={{fontWeight:500,fontSize:12}}>{s.day} — {s.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>{s.desc}</div></div>
                  <button className="btn btn-ghost btn-sm" onClick={()=>show('✏️',`Rediger: ${s.name}`,'')}>Rediger</button>
                </div>
                {i<seq.steps.length-1&&<div style={{width:1,height:12,background:'var(--border2)',margin:'0 auto 0 18px'}}></div>}
              </div>
            ))}
            <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:11,color:'var(--text2)'}}>Gns. konvertering: <strong style={{color:'var(--green)'}}>{seq.rate}</strong></div>
              {seq.active?<span className="pill pill-green"><span className="plan-dot"></span> Kørende</span>:<button className="btn btn-gold btn-sm" onClick={()=>show('▶','Sekvens aktiv','')}>Aktivér</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
