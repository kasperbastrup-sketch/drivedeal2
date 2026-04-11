'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useLang } from '@/lib/useLang'

export default function Topbar({ onCampaign, onImport }: { onCampaign: ()=>void; onImport: ()=>void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { tr } = useLang()

  const titles: Record<string,string> = {
    '/': tr.dashboard,
    '/analytics': tr.analytics,
    '/leads': tr.allLeads,
    '/import': tr.importLeads,
    '/campaigns': tr.campaigns,
    '/sequences': tr.sequences,
    '/templates': tr.templates,
    '/integrations': tr.integrations,
    '/settings': tr.settings,
    '/blacklist': tr.blacklist,
  }

  const title = titles[pathname] || tr.dashboard

  return (
    <div style={{height:58,background:'var(--surface)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',padding:'0 24px',gap:16,flexShrink:0}}>
      <div className="font-head" style={{fontSize:15,fontWeight:700,letterSpacing:'-0.2px'}}>{title}</div>
      <div style={{marginLeft:'auto',display:'flex',gap:8,alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:7,padding:'6px 11px'}}>
          <input placeholder={tr.searchPlaceholder} style={{background:'none',border:'none',outline:'none',color:'var(--text)',fontFamily:'var(--font-body)',fontSize:12,width:160}} onKeyDown={e=>{if(e.key==='Enter')router.push('/leads')}}/>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onImport}>+ Import</button>
        <button className="btn btn-gold" data-campaign-trigger onClick={onCampaign}>▶ {tr.campaigns}</button>
      </div>
    </div>
  )
}
