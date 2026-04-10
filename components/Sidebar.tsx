'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const navItems = [
  { group: 'Overblik', items: [
    { label: 'Dashboard', path: '/', icon: 'grid' },
    { label: 'Analyser', path: '/analytics', icon: 'chart' },
  ]},
  { group: 'Leads', items: [
    { label: 'Alle leads', path: '/leads', icon: 'users', badge: '847' },
    { label: 'Importer leads', path: '/import', icon: 'download' },
  ]},
  { group: 'Outreach', items: [
    { label: 'Kampagner', path: '/campaigns', icon: 'mail', badge: '3' },
    { label: 'Sekvenser', path: '/sequences', icon: 'layers' },
    { label: 'Email skabeloner', path: '/templates', icon: 'file' },
  ]},
  { group: 'System', items: [
    { label: 'Integrationer', path: '/integrations', icon: 'plug' },
    { label: 'Indstillinger', path: '/settings', icon: 'settings' },
  ]},
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [dealerName, setDealerName] = useState('Min forhandler')
  const [initials, setInitials] = useState('DD')

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('dealers').select('dealer_name, name').eq('id', user.id).single()
        if (data) {
          const name = data.dealer_name || data.name || 'Min forhandler'
          setDealerName(name)
          const parts = name.split(' ')
          setInitials((parts[0][0] + (parts[1]?.[0] || '')).toUpperCase())
        }
      }
    }
    loadUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="sidebar">
      <div style={{padding:'18px 16px 14px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,var(--gold3),var(--gold))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,boxShadow:'0 0 20px rgba(201,169,110,.3)'}}>🚗</div>
        <div>
          <div className="font-head" style={{fontSize:16,fontWeight:700,letterSpacing:'-0.3px',color:'var(--text)'}}>DriveDeal</div>
          <div style={{fontSize:9,color:'var(--gold)',letterSpacing:2,textTransform:'uppercase',fontWeight:500}}>AI Lead Engine</div>
        </div>
      </div>

      <nav style={{flex:1,padding:'10px 8px',overflowY:'auto'}}>
        {navItems.map(group => (
          <div key={group.group}>
            <div style={{fontSize:9,color:'var(--text3)',letterSpacing:'1.8px',textTransform:'uppercase',padding:'12px 10px 5px',fontWeight:600}}>{group.group}</div>
            {group.items.map(item => (
              <button
                key={item.path}
                className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                onClick={() => router.push(item.path)}
              >
                {item.label}
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div style={{padding:'10px 8px',borderTop:'1px solid var(--border)'}}>
        <div style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:9,padding:'10px 12px',display:'flex',alignItems:'center',gap:10,cursor:'pointer'}} onClick={handleLogout}>
          <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--gold3),var(--gold))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-head)',fontSize:11,fontWeight:700,color:'#1a1100',flexShrink:0}}>{initials}</div>
          <div>
            <div style={{fontSize:12,fontWeight:600}}>{dealerName}</div>
            <div style={{fontSize:10,color:'var(--gold)',display:'flex',alignItems:'center',gap:4}}><span className="plan-dot"></span>Log ud</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
