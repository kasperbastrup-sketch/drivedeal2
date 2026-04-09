import type { Metadata } from 'next'
import './globals.css'
import AppShell from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'DriveDeal AI — Lead Reactivation',
  description: 'AI-powered lead reactivation for car dealerships',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
