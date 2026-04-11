'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

interface Campaign {
  id: string
  name: string
  segment: string
  template: string
  status: string
  emails_sent: number
  emails_opened: number
  bookings: number
  created_at: string
}

export default function Campaigns() {
  const { show } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showReport, setShowReport] = useState<Campaign|null>(null)

  useEffect(() => { loadCampaigns() }, [])

  async function loadCampaigns() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase.from('campaigns').select('*').eq('dealer_id', user.id).order('created_at', { ascending: false })
    setCampaigns(data || [])
    setLoading(false)
  }

  async function deleteCampaign(id: string) {
    await supabase.from('campaigns').delete().eq('id', id)
    setCampaigns(prev => prev.filter(c => c.id !== id))
    show('🗑️', 'Kampagne slettet', '')
  }

  async function toggleStatus(id: string, current: string) {
    const newStatus = current === 'active' ? 'paused' : 'active'
    await supabase.from('campaigns').update({ status: newStatus }).eq('id', id)
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    show(newStatus === 'active' ? '▶' : '⏸', newStatus === 'active' ? 'Kampagne aktiveret' : 'Kampagne sat på pause', '')
  }

  const statusIcon: Record<string,string> = { active: '📧', paused: '⏸', draft: '📝' }
  const statusBg: Record<string,string> = { active: 'var(--goldglow)', paused: 'var(--surface2)', draft: 'var(--bluebg)' }

  return (
    <div>
      {/* RAPPORT MODAL */}
      {showReport && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setShowReport(null)}}>
          <div className="modal modal-sm">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div className="font-head" style={{fontSize:17,fontWeight:700}}>{showReport.name}</div>
              <button onClick={()=>setShowReport(null)} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✕</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
              {[
                ['Emails sendt', showReport.emails_sent.toString()],
                ['Emails åbnet', showReport.emails_opened.toString()],
                ['Bookinger', showReport.bookings.toString()],
                ['Åbningsrate', showReport.emails_sent > 0 ? Math.round((showReport.emails_opened/showReport.emails_sent)*100)+'%' : '0%'],
                ['Skabelon', showReport.template],
                ['Oprettet', new Date(showReport.created_at).toLocaleDateString('da-DK')],
              ].map(([l,v])=>(
                <div key={l} style={{background:'var(--surface2)',borderRadius:8,padding:12}}>
                  <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:4}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:'var(--font-head)',color:'var(--gold)',wordBreak:'break-word'}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{background:'var(--surface2)',borderRadius:8,padding:12,marginBottom:16}}>
              <div style={{fontSize:11,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:4}}>Målgruppe</div>
              <div style={{fontSize:13,color:'var(--text)'}}>{showReport.segment}</div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <button className="btn btn-ghost" onClick={()=>setShowReport(null)}>Luk</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div className="font-head" style={{fontSize:14,fontWeight:700}}>AI kampagner — ekstra udsendelse ved særlige tilbud</div>
        <button className="btn btn-gold" onClick={()=>{
          const btn = document.querySelector('[data-campaign-trigger]') as HTMLButtonElement
          if (btn) btn.click()
          else show('✨','Brug "Kør AI kampagne" knappen øverst til højre','')
        }}>+ Ny kampagne</button>
      </div>

      {loading && <div style={{textAlign:'center',padding:40,color:'var(--text3)'}}>Henter kampagner...</div>}

      {!loading && campaigns.length === 0 && (
        <div style={{textAlign:'center',padding:60,color:'var(--text3)'}}>
          <div style={{fontSize:36,marginBottom:10}}>📧</div>
          <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:6}}>Ingen kampagner endnu</div>
          <div style={{fontSize:12,marginBottom:20}}>Klik "Kør AI kampagne" øverst til højre for at starte din første kampagne</div>
        </div>
      )}

      {campaigns.map(c=>(
        <div key={c.id} className="campaign-row">
          <div style={{width:42,height:42,borderRadius:10,background:statusBg[c.status]||'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{statusIcon[c.status]||'📧'}</div>
          <div style={{flex:1}}>
            <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:2}}>{c.name}</div>
            <div style={{fontSize:11,color:'var(--text2)',marginBottom:5}}>{c.segment} · {c.template} · {new Date(c.created_at).toLocaleDateString('da-DK')}</div>
            <span className={`pill ${c.status==='active'?'pill-green':''}`} style={c.status!=='active'?{background:'var(--surface2)',color:'var(--text2)'}:{}}>
              {c.status==='active'?'Aktiv':c.status==='paused'?'Sat på pause':'Kladde'}
            </span>
          </div>
          <div style={{display:'flex',gap:20}}>
            {[{val:c.emails_sent,lbl:'Sendt'},{val:c.emails_opened,lbl:'Åbnet',c:'var(--gold)'},{val:c.bookings,lbl:'Bookinger',c:'var(--green)'}].map(k=>(
              <div key={k.lbl} style={{textAlign:'right'}}>
                <div className="font-head" style={{fontSize:15,fontWeight:700,color:k.c||'var(--text)'}}>{k.val}</div>
                <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.8px'}}>{k.lbl}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:6,marginLeft:14}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowReport(c)}>Rapport</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>toggleStatus(c.id,c.status)}>
              {c.status==='active'?'⏸ Pause':'▶ Aktivér'}
            </button>
            <button className="btn btn-red btn-sm" onClick={()=>deleteCampaign(c.id)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  )
}
