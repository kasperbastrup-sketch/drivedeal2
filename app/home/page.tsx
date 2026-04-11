export default function Home() {
  return (
    <div style={{background:'#0a0a0a',minHeight:'100vh',fontFamily:"'Inter','SF Pro Display',-apple-system,sans-serif",color:'#ffffff'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 48px',borderBottom:'1px solid #1a1a1a'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#c9a96e,#b8860b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🚗</div>
          <span style={{fontSize:18,fontWeight:700,letterSpacing:'-0.3px'}}>DriveDeal AI</span>
        </div>
        <div style={{display:'flex',gap:12}}>
          <a href="/login" style={{padding:'8px 20px',borderRadius:8,border:'1px solid #333',color:'#ccc',textDecoration:'none',fontSize:14}}>Log ind</a>
          <a href="/signup" style={{padding:'8px 20px',borderRadius:8,background:'linear-gradient(135deg,#c9a96e,#b8860b)',color:'#1a1100',textDecoration:'none',fontSize:14,fontWeight:600}}>Prøv gratis →</a>
        </div>
      </nav>

      <div style={{textAlign:'center',padding:'100px 48px 80px',maxWidth:800,margin:'0 auto'}}>
        <div style={{display:'inline-block',background:'#1a1a1a',border:'1px solid #333',borderRadius:20,padding:'6px 16px',fontSize:12,color:'#c9a96e',marginBottom:24,letterSpacing:1,textTransform:'uppercase'}}>
          AI-Drevet Lead Reactivation
        </div>
        <h1 style={{fontSize:56,fontWeight:800,letterSpacing:'-2px',lineHeight:1.1,marginBottom:20}}>
          Genopliv dine kolde leads<br/>
          <span style={{color:'#c9a96e'}}>automatisk med AI</span>
        </h1>
        <p style={{fontSize:18,color:'#888',lineHeight:1.7,marginBottom:40,maxWidth:600,margin:'0 auto 40px'}}>
          DriveDeal AI sender personaliserede emails til dine kolde billeads automatisk — uden at du løfter en finger. Mere bookinger, mindre manuelt arbejde.
        </p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <a href="/signup" style={{padding:'14px 32px',borderRadius:10,background:'linear-gradient(135deg,#c9a96e,#b8860b)',color:'#1a1100',textDecoration:'none',fontSize:16,fontWeight:700}}>Start 14 dages gratis prøve →</a>
          <a href="/login" style={{padding:'8px 20px',borderRadius:8,border:'1px solid #333',color:'#ccc',textDecoration:'none',fontSize:14}}>Log ind</a>
        </div>
        <p style={{fontSize:12,color:'#555',marginTop:16}}>Ingen kreditkort · Ingen binding · Opsætning på 20 minutter</p>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'0 48px 80px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
          {[
            {icon:'🤖',title:'AI skriver emailsene',desc:'Systemet genererer en unik, personaliseret email til hvert lead med deres navn og den bil de kiggede på.'},
            {icon:'⚡',title:'Automatisk udsendelse',desc:'Systemet sender automatisk op til 100 emails om dagen — med anti-spam beskyttelse så de lander i indbakken.'},
            {icon:'📊',title:'Live dashboard',desc:'Se præcis hvor mange emails der er sendt, åbnet og hvilke leads der har svaret — i realtid.'},
            {icon:'🔄',title:'Automatisk opfølgning',desc:'Systemet følger automatisk op 3 gange om måneden til leads der ikke har svaret.'},
            {icon:'🛡️',title:'GDPR compliant',desc:'Alle emails indeholder automatisk afmeldingslink. Leads der afmelder sig kontaktes aldrig igen.'},
            {icon:'🚀',title:'Klar på 20 minutter',desc:'Import dine leads som CSV, forbind Gmail og send første kampagne — alt på under 20 minutter.'},
          ].map(f=>(
            <div key={f.title} style={{background:'#111',border:'1px solid #1a1a1a',borderRadius:12,padding:24}}>
              <div style={{fontSize:28,marginBottom:12}}>{f.icon}</div>
              <div style={{fontSize:15,fontWeight:600,marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:13,color:'#666',lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{textAlign:'center',padding:'60px 48px 80px',borderTop:'1px solid #1a1a1a'}}>
        <h2 style={{fontSize:36,fontWeight:700,letterSpacing:'-1px',marginBottom:12}}>Klar til at komme i gang?</h2>
        <p style={{color:'#666',marginBottom:32}}>14 dages gratis prøveperiode · Ingen kreditkort påkrævet</p>
        <a href="/signup" style={{padding:'16px 40px',borderRadius:10,background:'linear-gradient(135deg,#c9a96e,#b8860b)',color:'#1a1100',textDecoration:'none',fontSize:18,fontWeight:700}}>Start gratis prøve →</a>
      </div>

      <div style={{borderTop:'1px solid #1a1a1a',padding:'24px 48px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:12,color:'#444'}}>© 2026 DriveDeal AI</div>
        <div style={{display:'flex',gap:24}}>
          <a href="/privacy" style={{fontSize:12,color:'#444',textDecoration:'none'}}>Privatlivspolitik</a>
          <a href="/terms" style={{fontSize:12,color:'#444',textDecoration:'none'}}>Vilkår</a>
          <a href="/login" style={{fontSize:12,color:'#444',textDecoration:'none'}}>Log ind</a>
        </div>
      </div>
    </div>
  )
}
