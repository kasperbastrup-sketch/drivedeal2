'use client'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/useLang'

export default function Integrations() {
  const { show } = useToast()
  const { tr } = useLang()
  const [antispam, setAntispam] = useState(true)
  const [tracking, setTracking] = useState(true)
  const [dailyLimit, setDailyLimit] = useState('100')
  const [saving, setSaving] = useState(false)
  const [gmailConnected, setGmailConnected] = useState(false)
  const [gmailEmail, setGmailEmail] = useState('')
  const [reportFrequency, setReportFrequency] = useState('weekly')
  const [sendToSegments, setSendToSegments] = useState('all')
  const [notifyOnReply, setNotifyOnReply] = useState(true)
  const [notifyOnBooking, setNotifyOnBooking] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('dealers').select('antispam, email_tracking, daily_limit, gmail_connected, gmail_email, report_frequency, send_to_segments').eq('id', user.id).single()
      if (data) {
        setAntispam(data.antispam ?? true)
        setTracking(data.email_tracking ?? true)
        setDailyLimit(data.daily_limit?.toString() || '100')
        setGmailConnected(data.gmail_connected ?? false)
        setGmailEmail(data.gmail_email || '')
        setReportFrequency(data.report_frequency || 'weekly')
        setSendToSegments(data.send_to_segments || 'all')
      }
    }
    load()

    const params = new URLSearchParams(window.location.search)
    if (params.get('gmail') === 'connected') {
      show('✅', 'Gmail forbundet!', 'Systemet kan nu sende emails på dine vegne')
      window.history.replaceState({}, '', '/integrations')
      load()
    }
    if (params.get('error')) {
      show('❌', 'Gmail fejl', 'Prøv igen eller kontakt support')
      window.history.replaceState({}, '', '/integrations')
    }
  }, [])

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    await supabase.from('dealers').update({
      antispam,
      email_tracking: tracking,
      daily_limit: parseInt(dailyLimit),
      report_frequency: reportFrequency,
      send_to_segments: sendToSegments,
    }).eq('id', user.id)
    show('💾', tr.saveSettings, '')
    setSaving(false)
  }

  async function disconnectGmail() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('dealers').update({
      gmail_access_token: null,
      gmail_refresh_token: null,
      gmail_email: null,
      gmail_connected: false,
    }).eq('id', user.id)
    setGmailConnected(false)
    setGmailEmail('')
    show('✓', 'Gmail afbrudt', '')
  }

  function connectCRM(name: string) {
    show('🔗', name, '...')
    setTimeout(() => show('✅', name, ''), 2500)
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <div className="panel">
        <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>{tr.emailSending}</div>

        {/* Gmail */}
        <div style={{padding:'14px 0',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>Gmail</div>
              <div style={{fontSize:11,color:'var(--text2)',lineHeight:1.6,marginBottom:8}}>
                {gmailConnected ? `Forbundet som ${gmailEmail}` : 'Forbind din Gmail-konto så systemet kan sende emails automatisk'}
              </div>
              {gmailConnected ? (
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'var(--greenbg)',border:'1px solid rgba(76,175,130,.2)',borderRadius:6,padding:'4px 10px'}}>
                    <span style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',display:'inline-block'}}></span>
                    <span style={{fontSize:11,color:'var(--green)',fontWeight:500}}>Forbundet</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={disconnectGmail}>Afbryd</button>
                </div>
              ) : (
                <a href="/api/auth/gmail">
                  <button className="btn btn-gold btn-sm">🔗 Forbind Gmail</button>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Anti-spam */}
        <div style={{padding:'14px 0',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{tr.antispamFilter}</div>
              <div style={{fontSize:11,color:'var(--text2)',lineHeight:1.6}}>{antispam ? tr.antispamOn : tr.antispamOff}</div>
              {antispam ? (
                <div style={{marginTop:8,display:'inline-flex',alignItems:'center',gap:6,background:'var(--greenbg)',border:'1px solid rgba(76,175,130,.2)',borderRadius:6,padding:'4px 10px'}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',display:'inline-block'}}></span>
                  <span style={{fontSize:11,color:'var(--green)',fontWeight:500}}>{tr.protectedFromSpam}</span>
                </div>
              ) : (
                <div style={{marginTop:8,display:'inline-flex',alignItems:'center',gap:6,background:'var(--redbg)',border:'1px solid rgba(224,85,85,.2)',borderRadius:6,padding:'4px 10px'}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'var(--red)',display:'inline-block'}}></span>
                  <span style={{fontSize:11,color:'var(--red)',fontWeight:500}}>{tr.noSpamProtection}</span>
                </div>
              )}
            </div>
            <button className={`toggle ${antispam?'on':'off'}`} onClick={()=>setAntispam(p=>!p)} style={{marginTop:2}}></button>
          </div>
        </div>

        {/* Send-grænse */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
          <div>
            <div style={{fontSize:13,fontWeight:500}}>{tr.dailyLimit}</div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{tr.dailyLimitDesc}</div>
          </div>
          <input className="field-input" type="number" value={dailyLimit} onChange={e=>{const v=parseInt(e.target.value);if(v>200)setDailyLimit('200');else if(v<1)setDailyLimit('1');else setDailyLimit(e.target.value)}} style={{width:80,textAlign:'center'}} max="200"/>
        </div>

        {/* Email tracking */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
          <div>
            <div style={{fontSize:13,fontWeight:500}}>{tr.emailTracking}</div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{tr.emailTrackingDesc}</div>
          </div>
          <button className={`toggle ${tracking?'on':'off'}`} onClick={()=>setTracking(p=>!p)}></button>
        </div>

        <button className="btn btn-gold" style={{marginTop:14,width:'100%',justifyContent:'center'}} onClick={save} disabled={saving}>
          {saving?tr.saving:tr.saveSettings}
        </button>
      </div>

      <div className="panel">
        <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>{tr.crmSystems}</div>
        {tr.crmItems.map(item=>(
          <div key={item.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{item.name}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{item.desc}</div></div>
            <span style={{fontSize:10,color:'var(--text3)',fontWeight:500,background:'var(--surface2)',padding:'3px 8px',borderRadius:6,border:'1px solid var(--border)'}}>Kommer snart</span>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>{tr.bookingCalendar}</div>
        {[
          {l:'Calendly',d:'Booking link',n:<button className="btn btn-ghost btn-sm" onClick={()=>connectCRM('Calendly')}>{tr.connect}</button>},
          {l:'Google Kalender',d:'Sync',n:<span className="pill pill-green">● {tr.active}</span>},
          {l:'Booking link',d:'Email',n:<input className="field-input" placeholder="calendly.com/..." style={{width:180}}/>},
        ].map(r=>(
          <div key={r.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{r.l}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{r.d}</div></div>
            {r.n}
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>{tr.notifications}</div>

        {/* Notifikationer */}
        {[
          {label:'Email ved lead-svar', desc:'Straks notifikation', state:notifyOnReply, set:setNotifyOnReply},
          {label:'Booking notifikation', desc:'Ved prøvetur', state:notifyOnBooking, set:setNotifyOnBooking},
        ].map(item=>(
          <div key={item.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{item.label}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{item.desc}</div></div>
            <button className={`toggle ${item.state?'on':'off'}`} onClick={()=>item.set(p=>!p)}></button>
          </div>
        ))}

        {/* Send til segment */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
          <div>
            <div style={{fontSize:13,fontWeight:500}}>Send daglige emails til</div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>Vælg hvilke leads systemet kontakter automatisk</div>
          </div>
          <select className="field-select" value={sendToSegments} onChange={e=>setSendToSegments(e.target.value)}>
            <option value="all">Alle leads (kolde + varme)</option>
            <option value="cold">Kun kolde leads</option>
            <option value="warm">Kun varme leads</option>
          </select>
        </div>
        {/* Rapport frekvens */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
          <div>
            <div style={{fontSize:13,fontWeight:500}}>Rapport frekvens</div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>Hvor tit vil du modtage resultatrapport</div>
          </div>
          <select className="field-select" value={reportFrequency} onChange={e=>setReportFrequency(e.target.value)}>
            <option value="weekly">Ugentlig (hver mandag)</option>
            <option value="monthly">Månedlig (første dag i måneden)</option>
          </select>
        </div>

        <button className="btn btn-gold" style={{marginTop:14,width:'100%',justifyContent:'center'}} onClick={save} disabled={saving}>
          {saving?tr.saving:tr.saveSettings}
        </button>
      </div>
    </div>
  )
}
// segment filter already in main file
