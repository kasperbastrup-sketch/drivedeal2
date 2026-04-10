'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { ToastProvider } from './Toast'
import CampaignModal from './CampaignModal'
import OnboardingWizard from './OnboardingWizard'
import { supabase } from '@/lib/supabase'

interface RefreshCtx { refresh: () => void }
const RefreshContext = createContext<RefreshCtx>({ refresh: () => {} })
export const useRefresh = () => useContext(RefreshContext)

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showCampaign, setShowCampaign] = useState(false)
  const [leadCount, setLeadCount] = useState(0)
  const [campaignCount, setCampaignCount] = useState(0)

  async function loadCounts() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { count: leads } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('dealer_id', user.id)
    const { count: campaigns } = await supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('dealer_id', user.id)
    setLeadCount(leads || 0)
    setCampaignCount(campaigns || 0)
  }

  useEffect(() => { loadCounts() }, [])

  return (
    <RefreshContext.Provider value={{ refresh: loadCounts }}>
      <ToastProvider>
        <OnboardingWizard onComplete={loadCounts} />
        {showCampaign && <CampaignModal onClose={() => { setShowCampaign(false); loadCounts() }} />}
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <Sidebar leadCount={leadCount} campaignCount={campaignCount} />
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Topbar
              onCampaign={() => setShowCampaign(true)}
              onImport={() => window.location.href = '/import'}
            />
            <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
              {children}
            </div>
          </main>
        </div>
      </ToastProvider>
    </RefreshContext.Provider>
  )
}
