'use client'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/Toast'
import { supabase } from '@/lib/supabase'

export default function Integrations() {
  const { show } = useToast()
  const [antispam, setAntispam] = useState(true)
  const [tracking, setTracking] = useState(true)
  const [dailyLimit, setDailyLimit] = useState('100')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('dealers').select('antispam, email_tracking, daily_limit').eq('id', user.id).single()
      if (data) {
        setAntispam(data.antispam ?? true)
        setTracking(data.email_tracking ?? true)
        setDailyLimit(data.daily_limit?.toString() || '100')
      }
    }
    load()
  }, [])

  async function save() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    await supabase.from('dealers').update({
      antispam,
      email_tracking: tracking,
      daily_limit: parseInt(dailyLimit),
    }).eq('id', user.id)
    show('💾', 'Indstillinger gemt', '')
    setSaving(false)
  }

  function connectCRM(name: string) {
    show('🔗', `${name} integration`, 'Åbner OAuth forbindelsesflow...')
    setTimeout(() => show('✅', `${name} forbundet!`, ''), 2500)
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      <div className="panel">
        <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Email udsendelse</div>

        {/* Anti-spam filter */}
        <div style={{padding:'14px 0',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>Anti-spam filter</div>
              <div style={{fontSize:11,color:'var(--text2)',lineHeight:1.6}}>
                {antispam
                  ? 'Slået til — systemet sender emails med varierende forsinkelse så de undgår spam-filtre og lander i indbakken.'
                  : 'Slået fra — emails sendes uden forsinkelse. Øget risiko for at lande i spam.'}
              </div>
              {antispam && (
                <div style={{marginTop:8,display:'inline-flex',alignItems:'center',gap:6,background:'var(--greenbg)',border:'1px solid rgba(76,175,130,.2)',borderRadius:6,padding:'4px 10px'}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'var(--green)',display:'inline-block'}}></span>
                  <span style={{fontSize:11,color:'var(--green)',fontWeight:500}}>Beskyttet mod spam-filtre</span>
                </div>
              )}
              {!antispam && (
                <div style={{marginTop:8,display:'inline-flex',alignItems:'center',gap:6,background:'var(--redbg)',border:'1px solid rgba(224,85,85,.2)',borderRadius:6,padding:'4px 10px'}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'var(--red)',display:'inline-block'}}></span>
                  <span style={{fontSize:11,color:'var(--red)',fontWeight:500}}>Ingen spam-beskyttelse</span>
                </div>
              )}
            </div>
            <button
              className={`toggle ${antispam?'on':'off'}`}
              onClick={()=>setAntispam(p=>!p)}
              style={{marginTop:2}}
            ></button>
          </div>
        </div>

        {/* Send-grænse */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
          <div>
            <div style={{fontSize:13,fontWeight:500}}>Send-grænse per dag</div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>Anbefalet: 80–100 emails om dagen</div>
          </div>
          <input
            className="field-input"
            type="number"
            value={dailyLimit}
            onChange={e=>{const v=parseInt(e.target.value);if(v>200)setDailyLimit("200");else if(v<1)setDailyLimit("1");else setDailyLimit(e.target.value)}}
            style={{width:80,textAlign:'center'}} max="200"
          />
        </div>

        {/* Email tracking */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
          <div>
            <div style={{fontSize:13,fontWeight:500}}>Email tracking</div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>Måler åbningsrate præcist</div>
          </div>
          <button className={`toggle ${tracking?'on':'off'}`} onClick={()=>setTracking(p=>!p)}></button>
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0'}}>
          <div>
            <div style={{fontSize:13,fontWeight:500}}>Gmail</div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>Forbundet og klar</div>
          </div>
          <span className="pill pill-green">● Forbundet</span>
        </div>

        <button className="btn btn-gold" style={{marginTop:14,width:'100%',justifyContent:'center'}} onClick={save} disabled={saving}>
          {saving?'Gemmer...':'Gem indstillinger'}
        </button>
      </div>

      <div className="panel">
        <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>CRM systemer</div>
        {[['HubSpot','Synk leads begge veje'],['Salesforce','Enterprise integration'],['Pipedrive','Pipeline synkronisering'],['AutoIt / CDK','Bil-specifik DMS']].map(([n,d])=>(
          <div key={n} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{n}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{d}</div></div>
            <button className="btn btn-ghost btn-sm" onClick={()=>connectCRM(n as string)}>Forbind</button>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Booking & kalender</div>
        {[
          {l:'Calendly',d:'Booking link',n:<button className="btn btn-ghost btn-sm" onClick={()=>connectCRM('Calendly')}>Forbind</button>},
          {l:'Google Kalender',d:'Sync prøveture',n:<span className="pill pill-green">● Forbundet</span>},
          {l:'Booking link',d:'Indsættes i emails',n:<input className="field-input" placeholder="calendly.com/..." style={{width:180}}/>},
        ].map(r=>(
          <div key={r.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{r.l}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{r.d}</div></div>
            {r.n}
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>Notifikationer</div>
        {[['Email ved lead-svar','Straks notifikation',true],['Daglig rapport','Kl. 08:00',true],['Booking notifikation','Ved prøvetur',true],['Ugentlig rapport','Fredag kl. 17:00',false]].map(([l,d,on])=>(
          <div key={l as string} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
            <div><div style={{fontSize:13,fontWeight:500}}>{l}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{d}</div></div>
            <button className={`toggle ${on?'on':'off'}`} onClick={e=>{const b=e.currentTarget;b.className=`toggle ${b.classList.contains('on')?'off':'on'}`}}></button>
          </div>
        ))}
      </div>
    </div>
  )
}
