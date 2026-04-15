'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const steps = {
  da: [
    {
      icon: '👋',
      title: 'Velkommen til DriveDeal AI',
      desc: 'Du er nu klar til at lade AI arbejde for dig. På de næste 7 trin sætter vi alt op — det tager under 10 minutter, og bagefter kører systemet automatisk.',
      action: null,
      tip: null,
    },
    {
      icon: '⚙️',
      title: 'Udfyld din forhandlerprofil',
      desc: 'Gå til Indstillinger og udfyld dit forhandlernavn, dit navn, afsendernavn og booking link. Dette bruges i alle emails systemet sender.',
      action: '/settings',
      actionLabel: 'Gå til Indstillinger →',
      tip: '💡 Afsendernavnet er det navn dine leads ser i indbakken — fx "Thomas, Jensen Biler"',
    },
    {
      icon: '🌍',
      title: 'Vælg sprog og tone',
      desc: 'Stadig i Indstillinger — klik på "AI indstillinger". Vælg det sprog AI\'en skal skrive emails på, og hvilken tone der passer til din forhandler.',
      action: '/settings',
      actionLabel: 'Gå til AI indstillinger →',
      tip: '💡 "Varm og personlig" fungerer bedst for de fleste bilforhandlere',
    },
    {
      icon: '📁',
      title: 'Importer dine leads',
      desc: 'Gå til "Importer leads" og upload en CSV-fil fra Bilinfo eller AutoDesktop — eller tilføj leads manuelt. Systemet genkender automatisk formatet.',
      action: '/import',
      actionLabel: 'Gå til Import →',
      tip: '💡 Du behøver kun email på hvert lead — alt andet er valgfrit',
    },
    {
      icon: '📧',
      title: 'Forbind din Gmail-konto',
      desc: 'Gå til Integrationer og klik "Forbind Gmail". Du godkender via Google, og systemet kan derefter sende emails direkte fra din konto — som om du selv har skrevet dem.',
      action: '/integrations',
      actionLabel: 'Gå til Integrationer →',
      tip: '💡 Systemet sender aldrig emails uden din godkendelse af Gmail-forbindelsen',
    },
    {
      icon: '⚡',
      title: 'Sæt din daglige send-grænse',
      desc: 'Stadig i Integrationer — vælg hvor mange emails systemet må sende per dag (anbefalet: 80-100), og om anti-spam filter skal være aktivt. Vælg også om du vil have ugentlig eller månedlig rapport.',
      action: '/integrations',
      actionLabel: 'Juster indstillinger →',
      tip: '💡 Anti-spam filter anbefales altid — det sikrer at dine emails lander i indbakken og ikke i spam',
    },
    {
      icon: '🚀',
      title: 'Du er klar!',
      desc: 'Systemet kører nu automatisk. Kl. 07:00 hver morgen finder det de leads med højest score og sender dem en personlig AI-email fra din Gmail. Du behøver ikke gøre noget.',
      action: null,
      tip: '💡 Gå til Dashboard for at følge med i realtid — og til Alle leads for at se hvad der er sendt til hvem',
    },
  ],
  es: [
    {
      icon: '👋',
      title: 'Bienvenido a DriveDeal AI',
      desc: 'Estás listo para dejar que la IA trabaje por ti. En los próximos 7 pasos lo configuramos todo — menos de 10 minutos, y luego el sistema funciona solo.',
      action: null,
      tip: null,
    },
    {
      icon: '⚙️',
      title: 'Completa tu perfil',
      desc: 'Ve a Configuración y rellena el nombre del concesionario, tu nombre, nombre del remitente y enlace de reserva. Esto se usa en todos los emails que envía el sistema.',
      action: '/settings',
      actionLabel: 'Ir a Configuración →',
      tip: '💡 El nombre del remitente es lo que tus leads ven en la bandeja de entrada — ej: "Carlos, Mercedes Madrid"',
    },
    {
      icon: '🌍',
      title: 'Elige idioma y tono',
      desc: 'Todavía en Configuración — haz clic en "Configuración IA". Elige el idioma en que la IA escribirá los emails y el tono que mejor se adapte a tu concesionario.',
      action: '/settings',
      actionLabel: 'Ir a configuración IA →',
      tip: '💡 "Cálido y personal" funciona mejor para la mayoría de concesionarios',
    },
    {
      icon: '📁',
      title: 'Importa tus leads',
      desc: 'Ve a "Importar leads" y sube un archivo CSV — o añade leads manualmente. El sistema reconoce automáticamente el formato.',
      action: '/import',
      actionLabel: 'Ir a Importar →',
      tip: '💡 Solo necesitas el email de cada lead — todo lo demás es opcional',
    },
    {
      icon: '📧',
      title: 'Conecta tu cuenta Gmail',
      desc: 'Ve a Integraciones y haz clic en "Conectar Gmail". Autorizas con Google y el sistema podrá enviar emails directamente desde tu cuenta.',
      action: '/integrations',
      actionLabel: 'Ir a Integraciones →',
      tip: '💡 El sistema nunca envía emails sin tu autorización de la conexión Gmail',
    },
    {
      icon: '⚡',
      title: 'Configura tu límite diario',
      desc: 'Todavía en Integraciones — elige cuántos emails puede enviar el sistema por día (recomendado: 80-100) y si el filtro anti-spam debe estar activo.',
      action: '/integrations',
      actionLabel: 'Ajustar configuración →',
      tip: '💡 El filtro anti-spam siempre es recomendable — garantiza que tus emails llegan a la bandeja de entrada',
    },
    {
      icon: '🚀',
      title: '¡Estás listo!',
      desc: 'El sistema funciona automáticamente. A las 07:00 cada mañana encuentra los leads con mayor puntuación y les envía un email personal desde tu Gmail.',
      action: null,
      tip: '💡 Ve al Panel para seguir los resultados en tiempo real',
    },
  ],
  en: [
    {
      icon: '👋',
      title: 'Welcome to DriveDeal AI',
      desc: 'You\'re ready to let AI work for you. In the next 7 steps we set everything up — under 10 minutes, and then the system runs automatically.',
      action: null,
      tip: null,
    },
    {
      icon: '⚙️',
      title: 'Complete your dealer profile',
      desc: 'Go to Settings and fill in your dealership name, your name, sender name and booking link. This is used in all emails the system sends.',
      action: '/settings',
      actionLabel: 'Go to Settings →',
      tip: '💡 The sender name is what your leads see in their inbox — e.g. "Thomas, Jensen Cars"',
    },
    {
      icon: '🌍',
      title: 'Choose language and tone',
      desc: 'Still in Settings — click "AI settings". Choose the language the AI will write emails in, and the tone that fits your dealership.',
      action: '/settings',
      actionLabel: 'Go to AI settings →',
      tip: '💡 "Warm and personal" works best for most car dealerships',
    },
    {
      icon: '📁',
      title: 'Import your leads',
      desc: 'Go to "Import leads" and upload a CSV file — or add leads manually. The system automatically recognises the format.',
      action: '/import',
      actionLabel: 'Go to Import →',
      tip: '💡 You only need an email for each lead — everything else is optional',
    },
    {
      icon: '📧',
      title: 'Connect your Gmail account',
      desc: 'Go to Integrations and click "Connect Gmail". You authorise via Google and the system can then send emails directly from your account.',
      action: '/integrations',
      actionLabel: 'Go to Integrations →',
      tip: '💡 The system never sends emails without your Gmail authorisation',
    },
    {
      icon: '⚡',
      title: 'Set your daily send limit',
      desc: 'Still in Integrations — choose how many emails the system may send per day (recommended: 80-100) and whether the anti-spam filter should be active.',
      action: '/integrations',
      actionLabel: 'Adjust settings →',
      tip: '💡 Anti-spam filter is always recommended — it ensures your emails land in the inbox',
    },
    {
      icon: '🚀',
      title: 'You\'re ready!',
      desc: 'The system now runs automatically. At 07:00 every morning it finds the highest-scoring leads and sends them a personal AI email from your Gmail.',
      action: null,
      tip: '💡 Go to Dashboard to follow results in real time',
    },
  ],
}

export default function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [lang, setLang] = useState<'da'|'es'|'en'>('da')
  const [isModal, setIsModal] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('dealers').select('onboarding_completed, app_language').eq('id', user.id).single()
      if (data) {
        const l = data.app_language === 'es' ? 'es' : data.app_language === 'en' ? 'en' : 'da'
        setLang(l)
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
    if (step < steps[lang].length - 1) {
      const nextStep = step + 1
      setStep(nextStep)
      setIsModal(nextStep === 0)
      const nextAction = steps[lang][nextStep].action
      if (nextAction) router.push(nextAction)
    } else {
      dismiss()
      router.push('/')
    }
  }

  function back() {
    if (step > 0) {
      const prevStep = step - 1
      setStep(prevStep)
      setIsModal(prevStep === 0)
      const prevAction = steps[lang][prevStep].action
      if (prevAction) router.push(prevAction)
      else router.push('/')
    }
  }

  if (!visible) return null

  const t = steps[lang]
  const current = t[step]
  const isFirst = step === 0
  const isLast = step === t.length - 1
  const progress = ((step + 1) / t.length) * 100

  // MODAL — første trin
  if (isFirst) {
    return (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:500,backdropFilter:'blur(8px)'}}>
        <div style={{width:520,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:20,padding:36,boxShadow:'0 40px 80px rgba(0,0,0,.6)',position:'relative'}}>

          <div style={{position:'absolute',top:16,right:16,display:'flex',gap:8,alignItems:'center'}}>
            <select value={lang} onChange={e=>setLang(e.target.value as 'da'|'es'|'en')} style={{background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,padding:'3px 8px',color:'var(--text2)',fontSize:11,cursor:'pointer',outline:'none',fontFamily:'var(--font-body)'}}>
              <option value="da">🇩🇰 Dansk</option>
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇬🇧 English</option>
            </select>
            <button onClick={dismiss} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:12,padding:'4px 8px',borderRadius:6,fontFamily:'var(--font-body)'}}>
              {lang === 'da' ? 'Skip' : lang === 'es' ? 'Omitir' : 'Skip'}
            </button>
          </div>

          {/* Progress dots */}
          <div style={{display:'flex',gap:6,marginBottom:28}}>
            {t.map((_,i) => (
              <div key={i} style={{height:3,flex:1,borderRadius:3,background:i<=step?'var(--gold)':'var(--surface3)',transition:'background .3s'}}></div>
            ))}
          </div>

          <div style={{width:60,height:60,borderRadius:16,background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,marginBottom:20}}>
            {current.icon}
          </div>

          <div style={{fontSize:22,fontWeight:700,letterSpacing:'-0.5px',marginBottom:12,fontFamily:'var(--font-head)'}}>{current.title}</div>
          <div style={{fontSize:14,color:'var(--text2)',lineHeight:1.8,marginBottom:28}}>{current.desc}</div>

          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:11,color:'var(--text3)'}}>
              {lang === 'da' ? `Trin 1 af ${t.length}` : lang === 'es' ? `Paso 1 de ${t.length}` : `Step 1 of ${t.length}`}
            </div>
            <button className="btn btn-gold" onClick={next}>
              {lang === 'da' ? 'Kom i gang 🚀' : lang === 'es' ? 'Empezar 🚀' : 'Get started 🚀'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // GUIDE BAR — trin 2-7
  return (
    <div style={{position:'fixed',bottom:20,left:'50%',transform:'translateX(-50%)',zIndex:400,width:620,background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:16,boxShadow:'0 8px 40px rgba(0,0,0,.5)',overflow:'hidden'}}>

      {/* Progress bar */}
      <div style={{height:3,background:'var(--surface3)'}}>
        <div style={{height:'100%',background:'var(--gold)',width:`${progress}%`,transition:'width .4s'}}></div>
      </div>

      <div style={{padding:'14px 18px'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>

          {/* Ikon */}
          <div style={{width:42,height:42,borderRadius:10,background:'var(--goldglow)',border:'1px solid rgba(201,169,110,.3)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>
            {current.icon}
          </div>

          {/* Tekst */}
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
              <span style={{fontSize:10,color:'var(--gold)',fontWeight:600,textTransform:'uppercase',letterSpacing:.8}}>
                {lang === 'da' ? 'Opsætningsguide' : lang === 'es' ? 'Guía de configuración' : 'Setup guide'}
              </span>
              <span style={{fontSize:10,color:'var(--text3)'}}>
                {lang === 'da' ? `Trin ${step+1} af ${t.length}` : lang === 'es' ? `Paso ${step+1} de ${t.length}` : `Step ${step+1} of ${t.length}`}
              </span>
            </div>
            <div style={{fontSize:13,fontWeight:600,marginBottom:2,fontFamily:'var(--font-head)'}}>{current.title}</div>
            <div style={{fontSize:11,color:'var(--text2)',lineHeight:1.5}}>{current.desc}</div>
          </div>

          {/* Knapper */}
          <div style={{display:'flex',gap:6,flexShrink:0,alignItems:'center'}}>
            {step > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={back}>
                {lang === 'da' ? '← Tilbage' : lang === 'es' ? '← Atrás' : '← Back'}
              </button>
            )}
            {current.action && (
              <button className="btn btn-ghost btn-sm" onClick={() => router.push(current.action!)}>
                {current.actionLabel}
              </button>
            )}
            <button className="btn btn-gold btn-sm" onClick={next}>
              {isLast
                ? (lang === 'da' ? 'Færdig ✓' : lang === 'es' ? 'Listo ✓' : 'Done ✓')
                : (lang === 'da' ? 'Næste →' : lang === 'es' ? 'Siguiente →' : 'Next →')}
            </button>
            <button onClick={dismiss} style={{background:'none',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:18,padding:'0 4px',lineHeight:1}}>✕</button>
          </div>
        </div>

        {/* Tip */}
        {current.tip && (
          <div style={{marginTop:10,padding:'8px 12px',background:'var(--surface2)',borderRadius:8,fontSize:11,color:'var(--text2)',borderLeft:'3px solid var(--gold)'}}>
            {current.tip}
          </div>
        )}
      </div>
    </div>
  )
}
