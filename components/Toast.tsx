'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ToastItem { id: number; icon: string; title: string; sub?: string }
interface ToastCtx { show: (icon: string, title: string, sub?: string) => void }

const Ctx = createContext<ToastCtx>({ show: () => {} })
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const show = useCallback((icon: string, title: string, sub?: string) => {
    const id = Date.now()
    setToasts(p => [...p, { id, icon, title, sub }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }, [])

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div style={{position:'fixed',bottom:22,right:22,zIndex:500,display:'flex',flexDirection:'column',gap:8}}>
        {toasts.map(t => (
          <div key={t.id} className="toast toast-in">
            <span style={{fontSize:16,flexShrink:0}}>{t.icon}</span>
            <div>
              <div style={{fontWeight:600,fontSize:12}}>{t.title}</div>
              {t.sub && <div style={{fontSize:11,color:'var(--text2)'}}>{t.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
