'use client'
import { useState } from 'react'
import { leadsData, Lead, LeadStatus } from '@/lib/data'
import ComposeModal from '@/components/ComposeModal'

const statusBadge: Record<LeadStatus, React.ReactNode> = {
  cold: <span className="badge badge-cold"><span className="badge-dot"></span>Kold</span>,
  warm: <span className="badge badge-warm"><span className="badge-dot"></span>Varm</span>,
  sent: <span className="badge badge-sent"><span className="badge-dot"></span>AI sendt</span>,
  booked: <span className="badge badge-booked"><span className="badge-dot"></span>Booket ✓</span>,
  replied: <span className="badge badge-replied"><span className="badge-dot"></span>Svarede</span>,
}

function scoreColor(s: number) { return s>=80?'var(--green)':s>=60?'var(--gold)':'var(--text2)' }

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>(leadsData)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [composeLead, setComposeLead] = useState<Lead|null>(null)

  const counts: Record<string,number> = {all:leads.length,cold:0,warm:0,sent:0,replied:0,booked:0}
  leads.forEach(l => counts[l.status]++)

  const visible = leads.filter(l => {
    const mf = filter==='all'||l.status===filter
    const q = search.toLowerCase()
    const ms = !q||l.name.toLowerCase().includes(q)||l.email.toLowerCase().includes(q)||l.car.toLowerCase().includes(q)
    return mf&&ms
  })

  function toggleSelect(id:number,checked:boolean){setSelected(prev=>{const s=new Set(prev);checked?s.add(id):s.delete(id);return s})}
  function onSent(id:number){setLeads(prev=>prev.map(l=>l.id===id?{...l,status:'sent' as LeadStatus}:l))}

  return (
    <div>
      {composeLead&&<ComposeModal lead={composeLead} onClose={()=>setComposeLead(null)} onSent={onSent}/>}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {['all','cold','warm','sent','replied','booked'].map(f=>(
          <button key={f} className={`filter-chip${filter===f?' active':''}`} onClick={()=>setFilter(f)}>
            {({all:'Alle',cold:'Kolde',warm:'Varme',sent:'AI sendt',replied:'Svarede',booked:'Booket'} as Record<string,string>)[f]} <span style={{opacity:.5}}>({counts[f]||0})</span>
          </button>
        ))}
        <div style={{display:'flex',alignItems:'center',gap:7,background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,padding:'6px 11px',marginLeft:'auto'}}>
          <input placeholder="Søg navn, email, bil..." value={search} onChange={e=>setSearch(e.target.value)} style={{background:'none',border:'none',outline:'none',color:'var(--text)',fontSize:12,fontFamily:'var(--font-body)',width:180}}/>
        </div>
        {selected.size>0&&<button className="btn btn-gold btn-sm">AI send til {selected.size} valgte →</button>}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr>
            <th style={{width:32}}><input type="checkbox" style={{accentColor:'var(--gold)'}} onChange={e=>{if(e.target.checked)setSelected(new Set(visible.map(l=>l.id)));else setSelected(new Set())}}/></th>
            <th>Kontakt</th><th>Bil interesse</th><th>Sidst kontaktet</th><th>Kilde</th><th>Status</th><th>AI score</th><th></th>
          </tr></thead>
          <tbody>
            {visible.length===0&&<tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'var(--text3)'}}>Ingen leads fundet</td></tr>}
            {visible.map(l=>(
              <tr key={l.id}>
                <td><input type="checkbox" checked={selected.has(l.id)} onChange={e=>toggleSelect(l.id,e.target.checked)} style={{accentColor:'var(--gold)'}}/></td>
                <td><div style={{fontWeight:500}}>{l.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>{l.email}</div></td>
                <td style={{fontSize:12}}>{l.car}</td>
                <td style={{fontSize:12,color:'var(--text2)'}}>{l.days} dage siden</td>
                <td style={{fontSize:11,color:'var(--text3)'}}>{l.source}</td>
                <td>{statusBadge[l.status]}</td>
                <td><div style={{display:'flex',alignItems:'center',gap:8}}><div className="score-bar"><div className="score-fill" style={{width:l.score+'%',background:scoreColor(l.score)}}></div></div><span style={{fontSize:11,fontWeight:600,fontFamily:'var(--font-mono)',color:scoreColor(l.score)}}>{l.score}</span></div></td>
                <td><button className="btn btn-ghost btn-sm" onClick={()=>setComposeLead(l)}>AI Email →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
