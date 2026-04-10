'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ComposeModal from '@/components/ComposeModal'
import { useToast } from '@/components/Toast'
import { useRefresh } from "@/components/AppShell"
import { autoMarkColdLeads } from "@/lib/autoMarkCold"

type LeadStatus = 'cold' | 'warm' | 'sent' | 'booked' | 'replied'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  car: string
  days_since_contact: number
  source: string
  status: LeadStatus
  score: number
}

const statusBadge: Record<LeadStatus, React.ReactNode> = {
  cold: <span className="badge badge-cold"><span className="badge-dot"></span>Kold</span>,
  warm: <span className="badge badge-warm"><span className="badge-dot"></span>Varm</span>,
  sent: <span className="badge badge-sent"><span className="badge-dot"></span>AI sendt</span>,
  booked: <span className="badge badge-booked"><span className="badge-dot"></span>Booket ✓</span>,
  replied: <span className="badge badge-replied"><span className="badge-dot"></span>Svarede</span>,
}

function scoreColor(s: number) { return s>=80?'var(--green)':s>=60?'var(--gold)':'var(--text2)' }

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [composeLead, setComposeLead] = useState<Lead|null>(null)
  const [editLead, setEditLead] = useState<Lead|null>(null)
  const [editForm, setEditForm] = useState<Partial<Lead>>({})
  const { show } = useToast()
  const { refresh } = useRefresh()

  useEffect(() => { loadLeads() }, [])

  async function loadLeads() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    await autoMarkColdLeads(user.id)
    const { data } = await supabase.from("leads").select('*').eq('dealer_id', user.id).order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  async function deleteLead(id: string) {
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (error) { show('❌', 'Fejl ved sletning', ''); return }
    setLeads(prev => prev.filter(l => l.id !== id))
    refresh()
    show('🗑️', 'Lead slettet', '')
  }

  async function deleteSelected() {
    const ids = Array.from(selected)
    const { error } = await supabase.from('leads').delete().in('id', ids)
    if (error) { show('❌', 'Fejl ved sletning', ''); return }
    setLeads(prev => prev.filter(l => !selected.has(l.id)))
    setSelected(new Set())
    refresh()
    show('🗑️', `${ids.length} leads slettet`, '')
  }

  async function saveEdit() {
    if (!editLead) return
    const { error } = await supabase.from('leads').update(editForm).eq('id', editLead.id)
    if (error) { show('❌', 'Fejl ved gemning', ''); return }
    setLeads(prev => prev.map(l => l.id === editLead.id ? { ...l, ...editForm } : l))
    setEditLead(null)
    show('💾', 'Lead opdateret', '')
  }

  async function onSent(id: string) {
    await supabase.from('leads').update({ status: 'sent' }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'sent' as LeadStatus } : l))
  }

  const counts: Record<string,number> = { all: leads.length, cold:0, warm:0, sent:0, replied:0, booked:0 }
  leads.forEach(l => counts[l.status] = (counts[l.status]||0) + 1)

  const visible = leads.filter(l => {
    const mf = filter==='all'||l.status===filter
    const q = search.toLowerCase()
    const ms = !q||l.name.toLowerCase().includes(q)||l.email.toLowerCase().includes(q)||(l.car||'').toLowerCase().includes(q)
    return mf&&ms
  })

  function toggleSelect(id: string, checked: boolean) {
    setSelected(prev => { const s = new Set(prev); checked ? s.add(id) : s.delete(id); return s })
  }

  const dataForCompose = composeLead ? {
    id: 0, name: composeLead.name, email: composeLead.email,
    phone: composeLead.phone || '', car: composeLead.car || '',
    days: composeLead.days_since_contact || 0, source: composeLead.source || '',
    status: composeLead.status, score: composeLead.score || 50,
  } : null

  return (
    <div>
      {composeLead && dataForCompose && (
        <ComposeModal lead={dataForCompose} onClose={()=>setComposeLead(null)} onSent={()=>onSent(composeLead.id)}/>
      )}

      {/* Edit modal */}
      {editLead && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setEditLead(null)}}>
          <div className="modal modal-sm">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div className="font-head" style={{fontSize:17,fontWeight:700}}>Rediger lead</div>
              <button onClick={()=>setEditLead(null)} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✕</button>
            </div>
            <div className="label" style={{marginTop:0}}>Navn</div>
            <input className="field-input" value={editForm.name||''} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))} style={{width:'100%'}}/>
            <div className="label">Email</div>
            <input className="field-input" type="email" value={editForm.email||''} onChange={e=>setEditForm(p=>({...p,email:e.target.value}))} style={{width:'100%'}}/>
            <div className="label">Telefon</div>
            <input className="field-input" value={editForm.phone||''} onChange={e=>setEditForm(p=>({...p,phone:e.target.value}))} style={{width:'100%'}}/>
            <div className="label">Bil interesse</div>
            <input className="field-input" value={editForm.car||''} onChange={e=>setEditForm(p=>({...p,car:e.target.value}))} style={{width:'100%'}}/>
            <div className="label">Status</div>
            <select className="field-select" value={editForm.status||'cold'} onChange={e=>setEditForm(p=>({...p,status:e.target.value as LeadStatus}))} style={{width:'100%'}}>
              <option value="cold">Kold</option>
              <option value="warm">Varm</option>
              <option value="sent">AI sendt</option>
              <option value="replied">Svarede</option>
              <option value="booked">Booket</option>
            </select>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20,paddingTop:16,borderTop:'1px solid var(--border)'}}>
              <button className="btn btn-ghost" onClick={()=>setEditLead(null)}>Annuller</button>
              <button className="btn btn-gold" onClick={saveEdit}>Gem ændringer</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {['all','cold','warm','sent','replied','booked'].map(f=>(
          <button key={f} className={`filter-chip${filter===f?' active':''}`} onClick={()=>setFilter(f)}>
            {({all:'Alle',cold:'Kolde',warm:'Varme',sent:'AI sendt',replied:'Svarede',booked:'Booket'} as Record<string,string>)[f]} <span style={{opacity:.5}}>({counts[f]||0})</span>
          </button>
        ))}
        <div style={{display:'flex',alignItems:'center',gap:7,background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,padding:'6px 11px',marginLeft:'auto'}}>
          <input placeholder="Søg navn, email, bil..." value={search} onChange={e=>setSearch(e.target.value)} style={{background:'none',border:'none',outline:'none',color:'var(--text)',fontSize:12,fontFamily:'var(--font-body)',width:180}}/>
        </div>
        {selected.size>0&&(
          <button className="btn btn-red btn-sm" onClick={deleteSelected}>🗑 Slet {selected.size} valgte</button>
        )}
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr>
            <th style={{width:32}}><input type="checkbox" style={{accentColor:'var(--gold)'}} onChange={e=>{if(e.target.checked)setSelected(new Set(visible.map(l=>l.id)));else setSelected(new Set())}}/></th>
            <th>Kontakt</th><th>Bil interesse</th><th>Sidst kontaktet</th><th>Kilde</th><th>Status</th><th>AI score</th><th></th>
          </tr></thead>
          <tbody>
            {loading&&<tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'var(--text3)'}}>Henter leads...</td></tr>}
            {!loading&&visible.length===0&&(
              <tr><td colSpan={8} style={{textAlign:'center',padding:60,color:'var(--text3)'}}>
                <div style={{fontSize:32,marginBottom:10}}>📭</div>
                <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:6}}>Ingen leads endnu</div>
                <div style={{fontSize:12}}>Gå til "Importer leads" for at tilføje dine første leads</div>
              </td></tr>
            )}
            {visible.map(l=>(
              <tr key={l.id}>
                <td><input type="checkbox" checked={selected.has(l.id)} onChange={e=>toggleSelect(l.id,e.target.checked)} style={{accentColor:'var(--gold)'}}/></td>
                <td><div style={{fontWeight:500}}>{l.name}</div><div style={{fontSize:11,color:'var(--text2)'}}>{l.email}</div></td>
                <td style={{fontSize:12}}>{l.car}</td>
                <td style={{fontSize:12,color:'var(--text2)'}}>{l.days_since_contact} dage siden</td>
                <td style={{fontSize:11,color:'var(--text3)'}}>{l.source}</td>
                <td>{statusBadge[l.status]}</td>
                <td><div style={{display:'flex',alignItems:'center',gap:8}}><div className="score-bar"><div className="score-fill" style={{width:l.score+'%',background:scoreColor(l.score)}}></div></div><span style={{fontSize:11,fontWeight:600,fontFamily:'var(--font-mono)',color:scoreColor(l.score)}}>{l.score}</span></div></td>
                <td>
                  <div style={{display:'flex',gap:5}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setComposeLead(l)}>AI Email →</button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>{setEditLead(l);setEditForm({name:l.name,email:l.email,phone:l.phone,car:l.car,status:l.status})}}>✏️</button>
                    <button className="btn btn-red btn-sm" onClick={()=>deleteLead(l.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
