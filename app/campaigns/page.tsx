'use client'
import { useToast } from '@/components/Toast'

interface Kpi { val: string; lbl: string; c?: string }
interface Camp { icon: string; bg: string; name: string; meta: string; status: string; statusCls: string; kpis: Kpi[]; inactive?: boolean }

const camps: Camp[] = [
  {icon:'📧',bg:'var(--goldglow)',name:'Sommer Reactivation 2025',meta:'BMW, Mercedes, Audi · 90+ dage · Startet 3. juli 2025',status:'Aktiv',statusCls:'pill-green',kpis:[{val:'247',lbl:'Sendt'},{val:'38%',lbl:'Åbnet',c:'var(--gold)'},{val:'26%',lbl:'Klikket',c:'var(--amber)'},{val:'14',lbl:'Bookede',c:'var(--green)'},{val:'€ 84k',lbl:'Omsætning',c:'var(--green)'}]},
  {icon:'⚡',bg:'var(--bluebg)',name:'EV Interesse Follow-up',meta:'Tesla, Audi e-tron, Mercedes EQ · 3-step sekvens · Auto-kørende',status:'Aktiv',statusCls:'pill-green',kpis:[{val:'92',lbl:'Sendt'},{val:'51%',lbl:'Åbnet',c:'var(--gold)'},{val:'34%',lbl:'Klikket',c:'var(--amber)'},{val:'9',lbl:'Bookede',c:'var(--green)'},{val:'€ 52k',lbl:'Omsætning',c:'var(--green)'}]},
  {icon:'❄️',bg:'var(--surface2)',name:'Vinter Udsalg 2025',meta:'Alle segmenter · Planlagt november · Sat på pause',status:'Inaktiv',statusCls:'',kpis:[{val:'—',lbl:'Sendt'},{val:'—',lbl:'Åbnet'},{val:'—',lbl:'Klikket'},{val:'—',lbl:'Bookede'},{val:'—',lbl:'Omsætning'}],inactive:true},
]

export default function Campaigns() {
  const { show } = useToast()
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div className="font-head" style={{fontSize:14,fontWeight:700}}>AI kampagner</div>
        <button className="btn btn-gold" onClick={()=>show('✨','Ny kampagne','Brug knappen "Kør AI kampagne" i topbaren')}>+ Ny kampagne</button>
      </div>
      {camps.map((c,i)=>(
        <div key={i} className="campaign-row" style={{opacity:c.inactive?0.5:1}}>
          <div style={{width:42,height:42,borderRadius:10,background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{c.icon}</div>
          <div style={{flex:1}}>
            <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:2}}>{c.name}</div>
            <div style={{fontSize:11,color:'var(--text2)',marginBottom:5}}>{c.meta}</div>
            <span className={`pill ${c.statusCls}`} style={!c.statusCls?{background:'var(--surface2)',color:'var(--text2)'}:{}}>{c.status}</span>
          </div>
          <div style={{display:'flex',gap:20}}>
            {c.kpis.map(k=>(
              <div key={k.lbl} style={{textAlign:'right'}}>
                <div className="font-head" style={{fontSize:15,fontWeight:700,color:k.c||'var(--text)'}}>{k.val}</div>
                <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.8px'}}>{k.lbl}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:6,marginLeft:14}}>
            {c.inactive
              ? <button className="btn btn-gold btn-sm" onClick={()=>show('▶',`${c.name} aktiveret`,'')}>Aktivér</button>
              : <><button className="btn btn-ghost btn-sm" onClick={()=>show('📊','Kampagne rapport','')}>Rapport</button>
                 <button className="btn btn-red btn-sm" onClick={()=>show('⏸','Kampagne sat på pause','')}>Pause</button></>
            }
          </div>
        </div>
      ))}
    </div>
  )
}
