'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'

const translations = {
  da: {
    skip: 'Skip', of: 'af', back: '← Tilbage', start: 'Kom i gang 🚀', next: 'Næste →',
    done: 'Færdig ✓', step: 'Trin', guide: 'Opsætningsguide',
    steps: [
      { icon:'🚗', title:'Velkommen til DriveDeal AI', desc:'Du er klar til at genoplive kolde leads med AI. Lad os sætte det op — under 10 minutter.', path:null },
      { icon:'⚙️', title:'Udfyld din profil', desc:'Tilføj forhandlernavn, afsendernavn og booking link. Klik Gem når du er færdig.', path:'/settings' },
      { icon:'📁', title:'Importer dine leads', desc:'Upload en CSV-fil med kolde leads eller tilføj dem manuelt. Klik Næste når du er klar.', path:'/import' },
      { icon:'🚀', title:'Start din første kampagne', desc:'Klik på "Kør AI kampagne" øverst til højre for at sende din første AI-kampagne.', path:null },
    ]
  },
  es: {
    skip: 'Omitir', of: 'de', back: '← Atrás', start: 'Empezar 🚀', next: 'Siguiente →',
    done: 'Listo ✓', step: 'Paso', guide: 'Guía de configuración',
    steps: [
      { icon:'🚗', title:'Bienvenido a DriveDeal AI', desc:'Estás listo para reactivar leads fríos con IA. Vamos a configurarlo — menos de 10 minutos.', path:null },
      { icon:'⚙️', title:'Completa tu perfil', desc:'Añade nombre del concesionario, remitente y enlace de reserva. Haz clic en Guardar cuando termines.', path:'/settings' },
      { icon:'📁', title:'Importa tus leads', desc:'Sube un CSV con leads fríos o añádelos manualmente. Haz clic en Siguiente cuando estés listo.', path:'/import' },
      { icon:'🚀', title:'Inicia tu primera campaña', desc:'Haz clic en "Ejecutar campaña IA" arriba a la derecha para enviar tu primera campaña.', path:null },
    ]
  },
  en: {
    skip: 'Skip', of: 'of', back: '← Back', start: 'Get started 🚀', next: 'Next →',
    done: 'Done ✓', step: 'Step', guide: 'Setup guide',
    steps: [
      { icon:'🚗', title:'Welcome to DriveDeal AI', desc:'You\'re ready to reactivate cold leads with AI. Let\'s set it up — under 10 minutes.', path:null },
      { icon:'⚙️', title:'Complete your profile', desc:'Add dealership name, sender name and booking link. Click Save when you\'re done.', path:'/settings' },
      { icon:'📁', title:'Import your leads', desc:'Upload a CSV with cold leads or add them manually. Click Next when you\'re ready.', path:'/import' },
      { icon:'🚀', title:'Start your first campaign', desc:'Click "Run AI campaign" in the top right to send your first AI campaign.', path:null },
    ]
  }
}

function detectLanguage(): 'da'|'es'|'en' {
  if (typeof window === 'undefined') return 'es'
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('da')) return 'da'
  if (lang.startsWith('es')) return 'es'
  return 'en'
}

export default function OnboardingWizard({ onComplete }: { onComplete: ()=>void }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [lang, setLang] = useState<'da'|'es'|'en'>('es')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setLang(detectLanguage())
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('dealers').select('onboarding_completed, ai_language').eq('id', user.id).single()
      if (data) {
        if (data.ai_language === 'dansk') setLang('da')
        else if (data.ai_language === 'spansk') setLang('es')
        else if (data.ai_language === 'engelsk') setLang('en')
        if (!data.onboarding_completed) setVisible(true)
      }
    }
    check()
  }, [])

  async function dismiss() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('dealers').update({ onboarding_completed: true }).eq('id', user.id)
    setVisible(false)
    onComplete()
  }

  function next() {
    if (step < t.steps.length - 1) {
      const nextStep = step + 1
      setStep(nextStep)
      setExpanded(true)
      if (t.steps[nextStep].path) router.push(t.steps[nextStep].path!)
    } else {
      dismiss()
    }
  }

  function goBack() {
    if (step > 0) {
      const prevStep = step - 1
      setStep(prevStep)
      setExpanded(true)
      if (t.steps[prevStep].path) router.push(t.steps[prevStep].path!)
      else router.push('/')
    }
  }

  if (!visible) return null

  const t = translations[lang]
  const current = t.steps[step]
  const isFirst = step === 0
  const isLast = step === t.steps.length - 1

  // Minimeret version — guide-bar i bunden
  if (!expanded || !isFirst) {
    return (
      <div style={{
        position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)',
        zIndex:400, width:580, background:'var(--surface)',
        border:'1px solid var(--border2)', borderRadius:14,
        boxShadow:'0 8px 40px rgba(0,0,0,.5)',
        overflow:'hidden',
      }}>
        {/* Progress bar */}
        <div style={{height:3,background:'var(--surface3)'}}>
          <div style={{height:'100%',background:'var(--gold)',width:`${((step+1)/t.steps.length)*100}%`,transition:'width .3s'}}></div>
        </div>

        <div style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:9,background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
            {current.icon}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
              <span style={{fontSize:10,color:'var(--gold)',fontWeight:600,textTransform:'uppercase',letterSpacing:.8}}>{t.guide}</span>
              <span style={{fontSize:10,color:'var(--text3)'}}>{t.step} {step+1} {t.of} {t.steps.length}</span>
            </div>
            <div style={{fontFamily:'var(--font-head)',fontSize:13,fontWeight:600,marginBottom:2}}>{current.title}</div>
            <div style={{fontSize:11,color:'var(--text2)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{current.desc}</div>
          </div>
          <div style={{display:'flex',gap:6,flexShrink:0}}>
            {step > 0 && <button className="btn btn-ghost btn-sm" onClick={goBack}>{t.back}</button>}
            <button className="btn btn-gold btn-sm" onClick={next}>
              {isLast ? t.start : t.next}
            </button>
            <button onClick={dismiss} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:18,padding:'0 4px',lineHeight:1}}>✕</button>
          </div>
        </div>

        {/* Sprog vælger */}
        <div style={{padding:'0 18px 10px',display:'flex',gap:4}}>
          {(['da','es','en'] as const).map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{background:lang===l?'var(--goldglow)':'none',border:`1px solid ${lang===l?'rgba(201,169,110,.3)':'var(--border)'}`,borderRadius:5,padding:'2px 8px',fontSize:10,color:lang===l?'var(--gold)':'var(--text3)',cursor:'pointer',fontFamily:'var(--font-body)'}}>
              {l==='da'?'🇩🇰 DA':l==='es'?'🇪🇸 ES':'🇬🇧 EN'}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Fuld velkomst-modal — kun første trin
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:400,backdropFilter:'blur(8px)'}}>
      <div style={{width:520,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:20,padding:36,boxShadow:'0 40px 80px rgba(0,0,0,.6)',position:'relative'}}>

        <div style={{position:'absolute',top:16,right:16,display:'flex',alignItems:'center',gap:8}}>
          <select value={lang} onChange={e=>setLang(e.target.value as 'da'|'es'|'en')} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,padding:'3px 8px',color:'var(--text2)',fontSize:11,fontFamily:'var(--font-body)',cursor:'pointer',outline:'none'}}>
            <option value="da">🇩🇰 Dansk</option>
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇬🇧 English</option>
          </select>
          <button onClick={dismiss} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:12,fontFamily:'var(--font-body)',padding:'4px 8px',borderRadius:6}}>
            {t.skip}
          </button>
        </div>

        <div style={{display:'flex',gap:6,marginBottom:28}}>
          {t.steps.map((_,i)=>(
            <div key={i} style={{height:3,flex:1,borderRadius:3,background:i<=step?'var(--gold)':'var(--surface3)',transition:'background .3s'}}></div>
          ))}
        </div>

        <div style={{width:56,height:56,borderRadius:14,background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,marginBottom:20}}>
          {current.icon}
        </div>

        <div className="font-head" style={{fontSize:22,fontWeight:700,letterSpacing:'-0.5px',marginBottom:10}}>{current.title}</div>
        <div style={{fontSize:14,color:'var(--text2)',lineHeight:1.7,marginBottom:28}}>{current.desc}</div>
        <div style={{fontSize:11,color:'var(--text3)',marginBottom:20}}>{t.step} {step+1} {t.of} {t.steps.length}</div>

        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button className="btn btn-gold" style={{marginLeft:'auto'}} onClick={next}>
            {t.next}
          </button>
        </div>
      </div>
    </div>
  )
}
