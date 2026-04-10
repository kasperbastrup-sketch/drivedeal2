'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const translations = {
  da: {
    skip: 'Skip opsætning',
    step: 'Trin',
    of: 'af',
    back: '← Tilbage',
    start: 'Kom i gang 🚀',
    next: 'Næste →',
    steps: [
      { icon:'🚗', title:'Velkommen til DriveDeal AI', desc:'Du er nu klar til at genoplive dine kolde leads med AI. Lad os sætte det hele op — det tager under 10 minutter.', action:null, actionLabel:null },
      { icon:'⚙️', title:'Udfyld din forhandlerprofil', desc:'Tilføj dit forhandlernavn, afsendernavn og booking link. AI\'en bruger disse oplysninger i alle emails den skriver.', action:'/settings', actionLabel:'Gå til indstillinger →' },
      { icon:'📁', title:'Importer dine leads', desc:'Upload en CSV-fil med dine kolde leads — folk der har vist interesse men ikke købt. Jo flere leads, jo flere potentielle salg.', action:'/import', actionLabel:'Gå til import →' },
      { icon:'🚀', title:'Start din første AI kampagne', desc:'Klik på "Kør AI kampagne" øverst til højre. AI\'en genererer en personaliseret email til hvert lead og sender dem automatisk.', action:null, actionLabel:null },
    ]
  },
  es: {
    skip: 'Omitir configuración',
    step: 'Paso',
    of: 'de',
    back: '← Atrás',
    start: 'Empezar 🚀',
    next: 'Siguiente →',
    steps: [
      { icon:'🚗', title:'Bienvenido a DriveDeal AI', desc:'Estás listo para reactivar tus leads fríos con IA. Vamos a configurarlo todo — tarda menos de 10 minutos.', action:null, actionLabel:null },
      { icon:'⚙️', title:'Completa tu perfil de concesionario', desc:'Añade el nombre de tu concesionario, nombre del remitente y enlace de reserva. La IA usa esta información en todos los emails.', action:'/settings', actionLabel:'Ir a configuración →' },
      { icon:'📁', title:'Importa tus leads', desc:'Sube un archivo CSV con tus leads fríos — personas que mostraron interés pero no compraron. Más leads, más ventas potenciales.', action:'/import', actionLabel:'Ir a importar →' },
      { icon:'🚀', title:'Inicia tu primera campaña de IA', desc:'Haz clic en "Ejecutar campaña IA" arriba a la derecha. La IA generará un email personalizado para cada lead y los enviará automáticamente.', action:null, actionLabel:null },
    ]
  },
  en: {
    skip: 'Skip setup',
    step: 'Step',
    of: 'of',
    back: '← Back',
    start: 'Get started 🚀',
    next: 'Next →',
    steps: [
      { icon:'🚗', title:'Welcome to DriveDeal AI', desc:'You\'re ready to reactivate your cold leads with AI. Let\'s set everything up — it takes less than 10 minutes.', action:null, actionLabel:null },
      { icon:'⚙️', title:'Complete your dealer profile', desc:'Add your dealership name, sender name and booking link. The AI uses this information in all the emails it writes.', action:'/settings', actionLabel:'Go to settings →' },
      { icon:'📁', title:'Import your leads', desc:'Upload a CSV file with your cold leads — people who showed interest but didn\'t buy. More leads, more potential sales.', action:'/import', actionLabel:'Go to import →' },
      { icon:'🚀', title:'Start your first AI campaign', desc:'Click "Run AI campaign" in the top right. The AI will generate a personalised email for each lead and send them automatically.', action:null, actionLabel:null },
    ]
  }
}

function detectLanguage(): 'da' | 'es' | 'en' {
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('da')) return 'da'
  if (lang.startsWith('es')) return 'es'
  return 'en'
}

export default function OnboardingWizard({ onComplete }: { onComplete: ()=>void }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [lang, setLang] = useState<'da'|'es'|'en'>('es')
  const router = useRouter()

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
    if (step < t.steps.length - 1) setStep(s => s + 1)
    else dismiss()
  }

  function goToAction(action: string) {
    dismiss()
    router.push(action)
  }

  if (!visible) return null

  const t = translations[lang]
  const current = t.steps[step]

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:400,backdropFilter:'blur(8px)'}}>
      <div style={{width:520,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:20,padding:36,boxShadow:'0 40px 80px rgba(0,0,0,.6)',position:'relative'}}>

        {/* Sprog vælger + skip */}
        <div style={{position:'absolute',top:16,right:16,display:'flex',alignItems:'center',gap:8}}>
          <select
            value={lang}
            onChange={e=>setLang(e.target.value as 'da'|'es'|'en')}
            style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,padding:'3px 8px',color:'var(--text2)',fontSize:11,fontFamily:'var(--font-body)',cursor:'pointer',outline:'none'}}
          >
            <option value="da">🇩🇰 Dansk</option>
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇬🇧 English</option>
          </select>
          <button
            onClick={dismiss}
            style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:12,fontFamily:'var(--font-body)',padding:'4px 8px',borderRadius:6,transition:'color .15s'}}
            onMouseEnter={e=>(e.currentTarget.style.color='var(--text2)')}
            onMouseLeave={e=>(e.currentTarget.style.color='var(--text3)')}
          >
            {t.skip}
          </button>
        </div>

        {/* Progress bars */}
        <div style={{display:'flex',gap:6,marginBottom:28}}>
          {t.steps.map((_,i)=>(
            <div key={i} style={{height:3,flex:1,borderRadius:3,background:i<=step?'var(--gold)':'var(--surface3)',transition:'background .3s'}}></div>
          ))}
        </div>

        {/* Icon */}
        <div style={{width:56,height:56,borderRadius:14,background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,marginBottom:20}}>
          {current.icon}
        </div>

        {/* Content */}
        <div className="font-head" style={{fontSize:22,fontWeight:700,letterSpacing:'-0.5px',marginBottom:10}}>
          {current.title}
        </div>
        <div style={{fontSize:14,color:'var(--text2)',lineHeight:1.7,marginBottom:28}}>
          {current.desc}
        </div>

        {/* Step counter */}
        <div style={{fontSize:11,color:'var(--text3)',marginBottom:20}}>
          {t.step} {step+1} {t.of} {t.steps.length}
        </div>

        {/* Buttons */}
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          {step > 0 && (
            <button className="btn btn-ghost" onClick={()=>setStep(s=>s-1)}>{t.back}</button>
          )}
          {current.action && (
            <button className="btn btn-ghost" onClick={()=>goToAction(current.action!)}>
              {current.actionLabel}
            </button>
          )}
          <button className="btn btn-gold" style={{marginLeft:'auto'}} onClick={next}>
            {step === t.steps.length-1 ? t.start : t.next}
          </button>
        </div>
      </div>
    </div>
  )
}
