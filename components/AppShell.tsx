'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { ToastProvider } from './Toast'
import CampaignModal from './CampaignModal'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showCampaign, setShowCampaign] = useState(false)

  return (
    <ToastProvider>
      {showCampaign && <CampaignModal onClose={() => setShowCampaign(false)} />}
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
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
  )
}
