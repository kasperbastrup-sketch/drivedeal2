'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/Toast'

interface BlacklistEntry {
  id: string
  email: string
  reason: string
  created_at: string
}

export default function Blacklist() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('Afmeldt')
  const { show } = useToast()

  useEffect(() => { loadBlacklist() }, [])

  async function loadBlacklist() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    const { data } = await supabase.from('blacklist').select('*').eq('dealer_id', user.id).order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  async function addToBlacklist(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('blacklist').insert({
      dealer_id: user.id,
      email: email.toLowerCase().trim(),
      reason,
    })

    if (error) {
      if (error.code === '23505') show('⚠️', 'Email findes allerede på blacklisten', '')
      else show('❌', 'Fejl', error.message)
      return
    }

    show('✅', `${email} tilføjet til blacklist`, 'Vil aldrig modtage emails igen')
    setEmail('')
    loadBlacklist()
  }

  async function removeFromBlacklist(id: string, email: string) {
    await supabase.from('blacklist').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
    show('✓', `${email} fjernet fra blacklist`, '')
  }

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1.5fr',gap:14}}>
      <div className="panel">
        <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:4}}>Tilføj til blacklist</div>
        <div style={{fontSize:11,color:'var(--text2)',marginBottom:14}}>Emails på blacklisten modtager aldrig emails fra systemet</div>
        <form onSubmit={addToBlacklist}>
          <div className="label" style={{marginTop:0}}>Email adresse</div>
          <input className="field-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="carlos@gmail.com" style={{width:'100%'}} required/>
          <div className="label">Årsag</div>
          <select className="field-select" value={reason} onChange={e=>setReason(e.target.value)} style={{width:'100%'}}>
            <option>Afmeldt</option>
            <option>Kundens ønske</option>
            <option>Bil købt andetsteds</option>
            <option>Forkert kontakt</option>
            <option>GDPR anmodning</option>
          </select>
          <button type="submit" className="btn btn-red" style={{width:'100%',marginTop:14,justifyContent:'center'}}>
            + Tilføj til blacklist
          </button>
        </form>

        <div style={{marginTop:20,padding:12,background:'var(--surface2)',borderRadius:8,fontSize:11,color:'var(--text2)',lineHeight:1.7}}>
          <div style={{fontWeight:600,color:'var(--text)',marginBottom:4}}>Automatisk blacklist</div>
          Når en lead klikker "Afmeld" i en email tilføjes de automatisk til blacklisten. De vil aldrig modtage emails igen — heller ikke fra fremtidige kampagner.
        </div>
      </div>

      <div className="panel">
        <div className="font-head" style={{fontSize:13,fontWeight:600,marginBottom:14}}>
          Blacklist <span style={{fontSize:11,color:'var(--text2)',fontWeight:400}}>({entries.length} emails)</span>
        </div>

        {loading && <div style={{textAlign:'center',padding:40,color:'var(--text3)'}}>Henter...</div>}

        {!loading && entries.length === 0 && (
          <div style={{textAlign:'center',padding:40,color:'var(--text3)'}}>
            <div style={{fontSize:28,marginBottom:8}}>✓</div>
            <div style={{fontSize:13}}>Ingen emails på blacklisten endnu</div>
          </div>
        )}

        {entries.map(entry => (
          <div key={entry.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500}}>{entry.email}</div>
              <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>
                {entry.reason} · {new Date(entry.created_at).toLocaleDateString('da-DK')}
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={()=>removeFromBlacklist(entry.id, entry.email)}>
              Fjern
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
