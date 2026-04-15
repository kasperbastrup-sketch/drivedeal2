'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'
import { useLang } from '@/lib/useLang'

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
  const { tr } = useLang()
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
    show('🗑️', 'Slettet', '')
  }

  async function toggleStatus(id: string, current: string) {
    const newStatus = current === 'active' ? 'paused' : 'active'
    await supabase.from('campaigns').update({ status: newStatus }).eq('id', id)
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    show(newStatus === 'active' ? '▶' : '⏸', newStatus === 'active' ? tr.active : tr.paused, '')
  }

  const statusIcon: Record<string,string> = { active:'📧', paused:'⏸', draft:'📝' }
  const statusBg: Record<string,string> = { active:'var(--goldglow)', paused:'var(--surface2)', draft:'var(--bluebg)' }
  const statusLabel: Record<string,string> = { active: tr.active, paused: tr.paused, draft: tr.draft }

  return (
    <div>
      <div style={{background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.2)',borderRadius:10,padding:'12px 16px',marginBottom:16,display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:16}}>⏰</span>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:'var(--gold)'}}>Kampagner kører via den daglige AI-scheduler</div>
          <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>Emails sendes automatisk kl. 07:00 hver morgen — ikke med det samme. Aktivér en kampagne og systemet håndterer resten.</div>
        </div>
      </div>
      {showReport && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setShowReport(null)}}>
          <div className="modal modal-sm">
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div className="font-head" style={{fontSize:17,fontWeight:700}}>{showReport.name}</div>
              <button onClick={()=>setShowReport(null)} style={{background:'var(--surface2)',border:'1px solid var(--border)',color:'var(--text2)',cursor:'pointer',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>✕</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
              {[
                [tr.sent, showReport.emails_sent.toString()],
                [tr.opened, showReport.emails_opened.toString()],
                [tr.bookings, showReport.bookings.toString()],
                [tr.status, statusLabel[showReport.status] || showReport.status],
              ].map(([l,v])=>(
                <div key={l} style={{background:'var(--surface2)',borderRadius:8,padding:12}}>
                  <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:.8,marginBottom:4}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:'var(--font-head)',color:'var(--gold)'}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <button className="btn btn-ghost" onClick={()=>setShowReport(null)}>✕</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <div className="font-head" style={{fontSize:14,fontWeight:700}}>{tr.aiCampaigns}</div>
        <button className="btn btn-gold" onClick={()=>{
          const btn = document.querySelector('[data-campaign-trigger]') as HTMLButtonElement
          if (btn) btn.click()
        }}>{tr.newCampaign}</button>
      </div>

      {loading && <div style={{textAlign:'center',padding:40,color:'var(--text3)'}}>...</div>}

      {!loading && campaigns.length === 0 && (
        <div style={{textAlign:'center',padding:60,color:'var(--text3)'}}>
          <div style={{fontSize:36,marginBottom:10}}>📧</div>
          <div style={{fontSize:14,fontWeight:600,color:'var(--text)',marginBottom:6}}>{tr.noCampaigns}</div>
          <div style={{fontSize:12,marginBottom:20}}>{tr.noCampaignsDesc}</div>
        </div>
      )}

      {campaigns.map(c=>(
        <div key={c.id} className="campaign-row">
          <div style={{width:42,height:42,borderRadius:10,background:statusBg[c.status]||'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{statusIcon[c.status]||'📧'}</div>
          <div style={{flex:1}}>
            <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:2}}>{c.name}</div>
            <div style={{fontSize:11,color:'var(--text2)',marginBottom:5}}>{c.segment} · {c.template} · {new Date(c.created_at).toLocaleDateString('da-DK')}</div>
            <span className={`pill ${c.status==='active'?'pill-green':''}`} style={c.status!=='active'?{background:'var(--surface2)',color:'var(--text2)'}:{}}>
              {statusLabel[c.status] || c.status}
            </span>
          </div>
          <div style={{display:'flex',gap:20}}>
            {[{val:c.emails_sent,lbl:tr.sent},{val:c.emails_opened,lbl:tr.opened,c:'var(--gold)'},{val:c.bookings,lbl:tr.bookings,c:'var(--green)'}].map(k=>(
              <div key={k.lbl} style={{textAlign:'right'}}>
                <div className="font-head" style={{fontSize:15,fontWeight:700,color:k.c||'var(--text)'}}>{k.val}</div>
                <div style={{fontSize:10,color:'var(--text3)',textTransform:'uppercase',letterSpacing:'.8px'}}>{k.lbl}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:6,marginLeft:14}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowReport(c)}>{tr.report}</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>toggleStatus(c.id,c.status)}>
              {c.status==='active'?tr.pause:tr.activate}
            </button>
            <button className="btn btn-red btn-sm" onClick={()=>deleteCampaign(c.id)}>{tr.delete}</button>
          </div>
        </div>
      ))}
    </div>
  )
}
