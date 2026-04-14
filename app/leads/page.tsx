'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import ComposeModal from '@/components/ComposeModal'
import { useLang } from '@/lib/useLang'
import { useRefresh } from '@/components/AppShell'

interface Lead {
  id: string; dealer_id: string; name: string; email: string; phone: string;
  car: string; days_since_contact: number; source: string; status: string;
  score: number; last_contacted_at: string; created_at: string; days?: number;
}

interface EmailLog {
  id: string; subject: string; body: string; status: string; created_at: string;
}

export default function Leads() {
  const { tr } = useLang()
  const { show } = useToast()
  const { refresh } = useRefresh()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [composeLead, setComposeLead] = useState<Lead|null>(null)
  const [editLead, setEditLead] = useState<Lead|null>(null)
  const [emailLogLead, setEmailLogLead] = useState<Lead|null>(null)
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  useEffect(() => { loadLeads() }, [])

  async function loadLeads() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase.from('leads').select('*').eq('dealer_id', user.id).order('score', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  async function loadEmailLogs(lead: Lead) {
    setEmailLogLead(lead)
    setLogsLoading(true)
    const { data } = await supabase.from('email_logs').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false })
    setEmailLogs(data || [])
    setLogsLoading(false)
  }

  async function deleteLead(id: string) {
    await supabase.from('leads').delete().eq('id', id)
    setLeads(prev => prev.filter(l => l.id !== id))
    show('🗑️', 'Slettet', '')
  }

  async function deleteSelected() {
    await Promise.all(selected.map(id => supabase.from('leads').delete().eq('id', id)))
    setLeads(prev => prev.filter(l => !selected.includes(l.id)))
    setSelected([])
    show('🗑️', `${selected.length} slettet`, '')
  }

  async function saveEdit() {
    if (!editLead) return
    await supabase.from('leads').update({
      name: editLead.name, email: editLead.email, phone: editLead.phone,
      car: editLead.car, status: editLead.status,
    }).eq('id', editLead.id)
    setLeads(prev => prev.map(l => l.id === editLead.id ? editLead : l))
    setEditLead(null)
    show('💾', 'Gemt', '')
  }

  const filtered = leads.filter(l => {
    const matchFilter = filter === 'all' || l.status === filter
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()) || l.car?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    all: leads.length,
    cold: leads.filter(l => l.status === 'cold').length,
    warm: leads.filter(l => l.status === 'warm').length,
    sent: leads.filter(l => l.status === 'sent').length,
    replied: leads.filter(l => l.status === 'replied').length,
    booked: leads.filter(l => l.status === 'booked').length,
  }

  function statusPill(status: string) {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      cold: { label: tr.coldBadge, color: 'var(--blue)', bg: 'rgba(100,160,255,.1)' },
      warm: { label: tr.warmBadge, color: 'var(--gold)', bg: 'var(--goldglow)' },
      sent: { label: tr.sentBadge, color: 'var(--green)', bg: 'var(--greenbg)' },
      replied: { label: tr.repliedBadge, color: '#a78bfa', bg: 'rgba(167,139,250,.1)' },
      booked: { label: tr.bookedBadge, color: 'var(--green)', bg: 'var(--greenbg)' },
    }
    const s = map[status] || map.cold
    return <span style={{fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:10,color:s.color,background:s.bg}}>{s.label}</span>
  }

  function scoreBar(score: number) {
    const color = score >= 70 ? 'var(--green)' : score >= 40 ? 'var(--gold)' : 'var(--text3)'
    return (
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <div className="score-bar"><div style={{width:`${score}%`,height:'100%',background:color,borderRadius:2}}></div></div>
        <span style={{fontSize:10,color,fontWeight:600}}>{score}</span>
      </div>
    )
  }

  const filters = [
    { key: 'all', label: tr.all, count: counts.all },
    { key: 'cold', label: tr.cold, count: counts.cold },
    { key: 'warm', label: tr.warm, count: counts.warm },
    { key: 'sent', label: tr.aiSent, count: counts.sent },
    { key: 'replied', label: tr.replied, count: counts.replied },
    { key: 'booked', label: tr.booked, count: counts.booked },
  ]

  return (
    <div>
      {composeLead && <ComposeModal lead={composeLead} onClose={() => setComposeLead(null)} />}

      {/* REDIGER MODAL */}
      {editLead && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setEditLead(null) }}>
          <div className="modal modal-sm">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div className="font-head" style={{fontSize:16,fontWeight:700}}>Rediger lead</div>
              <button onClick={() => setEditLead(null)} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
            {[['Navn','name'],['Email','email'],['Telefon','phone'],['Bil interesse','car']].map(([label,key]) => (
              <div key={key}>
                <div className="label" style={{marginTop:key==='name'?0:undefined}}>{label}</div>
                <input className="field-input" value={editLead[key as keyof Lead] as string || ''} onChange={e => setEditLead({...editLead,[key]:e.target.value})} style={{width:'100%'}}/>
              </div>
            ))}
            <div className="label">Status</div>
            <select className="field-select" value={editLead.status} onChange={e => setEditLead({...editLead,status:e.target.value})} style={{width:'100%'}}>
              {['cold','warm','sent','replied','booked'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:20,paddingTop:16,borderTop:'1px solid var(--border)'}}>
              <button className="btn btn-ghost" onClick={() => setEditLead(null)}>Annuller</button>
              <button className="btn btn-gold" onClick={saveEdit}>Gem</button>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL LOG MODAL */}
      {emailLogLead && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) { setEmailLogLead(null); setEmailLogs([]) } }}>
          <div className="modal">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <div className="font-head" style={{fontSize:16,fontWeight:700}}>Sendte emails</div>
                <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{emailLogLead.name} · {emailLogLead.email}</div>
              </div>
              <button onClick={() => { setEmailLogLead(null); setEmailLogs([]) }} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>

            {logsLoading && <div style={{textAlign:'center',padding:30,color:'var(--text3)'}}>Henter emails...</div>}

            {!logsLoading && emailLogs.length === 0 && (
              <div style={{textAlign:'center',padding:40,color:'var(--text3)'}}>
                <div style={{fontSize:28,marginBottom:10}}>📭</div>
                <div>Ingen emails sendt til dette lead endnu</div>
              </div>
            )}

            {!logsLoading && emailLogs.map((log, i) => (
              <div key={log.id} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:10,padding:16,marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{log.subject}</div>
                  <div style={{fontSize:10,color:'var(--text3)'}}>{new Date(log.created_at).toLocaleDateString('da-DK', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>
                </div>
                <div style={{fontSize:11,color:'var(--text2)',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{log.body}</div>
              </div>
            ))}

            <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
              <button className="btn btn-ghost" onClick={() => { setEmailLogLead(null); setEmailLogs([]) }}>Luk</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {filters.map(f => (
            <button key={f.key} className={`filter-btn${filter===f.key?' active':''}`} onClick={() => setFilter(f.key)}>
              {f.label} <span style={{opacity:.6}}>({f.count})</span>
            </button>
          ))}
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {selected.length > 0 && (
            <button className="btn btn-red btn-sm" onClick={deleteSelected}>{tr.deleteSelected} ({selected.length})</button>
          )}
          <input className="field-input" placeholder={tr.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} style={{width:220}}/>
        </div>
      </div>

      {/* TABEL */}
      <div className="table-wrap">
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1px solid var(--border)'}}>
              <th style={{width:32,padding:'10px 12px'}}><input type="checkbox" onChange={e => setSelected(e.target.checked ? filtered.map(l => l.id) : [])} checked={selected.length === filtered.length && filtered.length > 0}/></th>
              {[tr.contact,tr.carInterest,tr.lastContacted,tr.source,tr.status,tr.aiScore,''].map((h,i) => (
                <th key={i} style={{padding:'10px 12px',textAlign:'left',fontSize:10,color:'var(--text3)',fontWeight:600,textTransform:'uppercase',letterSpacing:.8,whiteSpace:'nowrap'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'var(--text3)'}}>...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} style={{textAlign:'center',padding:60,color:'var(--text3)'}}>
                <div style={{fontSize:32,marginBottom:10}}>👥</div>
                <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:6}}>{tr.noLeadsYet}</div>
                <div style={{fontSize:12}}>{tr.goToImport}</div>
              </td></tr>
            )}
            {!loading && filtered.map(lead => (
              <tr key={lead.id} style={{borderBottom:'1px solid var(--border)',transition:'background .1s'}} onMouseEnter={e=>(e.currentTarget.style.background='var(--surface2)')} onMouseLeave={e=>(e.currentTarget.style.background='')}>
                <td style={{padding:'10px 12px'}}><input type="checkbox" checked={selected.includes(lead.id)} onChange={e => setSelected(e.target.checked ? [...selected,lead.id] : selected.filter(id => id !== lead.id))}/></td>
                <td style={{padding:'10px 12px'}}>
                  <div style={{fontWeight:500,fontSize:12}}>{lead.name}</div>
                  <div style={{fontSize:10,color:'var(--text3)'}}>{lead.email}</div>
                </td>
                <td style={{padding:'10px 12px',fontSize:12,color:'var(--text2)'}}>{lead.car || '—'}</td>
                <td style={{padding:'10px 12px',fontSize:11,color:'var(--text3)'}}>{lead.days_since_contact ? `${lead.days_since_contact} ${tr.daysSince}` : '—'}</td>
                <td style={{padding:'10px 12px',fontSize:11,color:'var(--text3)'}}>{lead.source || '—'}</td>
                <td style={{padding:'10px 12px'}}>{statusPill(lead.status)}</td>
                <td style={{padding:'10px 12px'}}>{scoreBar(lead.score || 0)}</td>
                <td style={{padding:'10px 12px'}}>
                  <div style={{display:'flex',gap:4,justifyContent:'flex-end'}}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setComposeLead(lead)}>{tr.aiEmail}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => loadEmailLogs(lead)} title="Se sendte emails">📬</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditLead(lead)}>✏️</button>
                    <button className="btn btn-red btn-sm" onClick={() => deleteLead(lead.id)}>🗑</button>
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
