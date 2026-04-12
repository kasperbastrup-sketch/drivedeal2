'use client'
import { useEffect } from 'react'

export default function Privacy() {
  useEffect(() => {
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  return (
    <div style={{maxWidth:720,margin:'0 auto',padding:'60px 24px',fontFamily:'Arial,sans-serif',color:'#ffffff',lineHeight:1.7,background:'#0a0a0a',minHeight:'100vh'}}>
      
      <div style={{marginBottom:48}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
          <div style={{width:36,height:36,borderRadius:8,background:'linear-gradient(135deg,#c9a96e,#b8860b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🚗</div>
          <span style={{fontSize:20,fontWeight:700,color:'#ffffff'}}>DriveDeal AI</span>
        </div>
        <div style={{display:'flex',gap:8}}>
          <a href="#privacy" style={{padding:'6px 16px',borderRadius:20,background:'#1a1a1a',border:'1px solid #c9a96e',color:'#c9a96e',textDecoration:'none',fontSize:13}}>Privatlivspolitik</a>
          <a href="#terms" style={{padding:'6px 16px',borderRadius:20,background:'#1a1a1a',border:'1px solid #333',color:'#aaa',textDecoration:'none',fontSize:13}}>Vilkår</a>
        </div>
      </div>

      {/* PRIVATLIVSPOLITIK */}
      <div id="privacy">
        <h1 style={{fontSize:28,fontWeight:700,marginBottom:8,color:'#ffffff'}}>Privatlivspolitik</h1>
        <p style={{color:'#aaaaaa',marginBottom:40}}>Sidst opdateret: April 2026</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>1. Hvem vi er</h2>
        <p>DriveDeal AI er en SaaS-platform der hjælper bilforhandlere med at genoplive kolde leads via AI-genererede emails. Denne privatlivspolitik beskriver hvordan vi indsamler, bruger og beskytter dine data.</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>2. Data vi indsamler</h2>
        <p>Vi indsamler følgende data når du opretter en konto og bruger vores platform:</p>
        <ul style={{paddingLeft:24,marginTop:8}}>
          <li>Navn og email-adresse</li>
          <li>Forhandlernavn og kontaktoplysninger</li>
          <li>Lead-data som du selv importerer (navne, emails, telefonnumre)</li>
          <li>Gmail OAuth token til afsendelse af emails på dine vegne</li>
          <li>Kampagne- og email-statistik</li>
        </ul>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>3. Hvordan vi bruger dine data</h2>
        <ul style={{paddingLeft:24,marginTop:8}}>
          <li>At levere og forbedre vores service</li>
          <li>At sende AI-genererede emails til dine leads på dine vegne</li>
          <li>At vise statistik og analyser i dit dashboard</li>
          <li>At kontakte dig om din konto og vores service</li>
        </ul>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>4. Gmail API og Google data</h2>
        <p>DriveDeal AI bruger Gmail API til at sende emails på vegne af brugeren. Vi:</p>
        <ul style={{paddingLeft:24,marginTop:8}}>
          <li>Sender kun emails som brugeren har godkendt via vores platform</li>
          <li>Læser ikke brugerens eksisterende emails eller andre Gmail-data</li>
          <li>Deler ikke Gmail-adgang med tredjepart</li>
          <li>Gemmer kun det OAuth token der er nødvendigt for at sende emails</li>
        </ul>
        <p style={{marginTop:8}}>DriveDeal AIs brug af Google APIs overholder <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" style={{color:'#c9a96e'}}>Googles API Services User Data Policy</a>, herunder Limited Use kravene.</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>5. GDPR og dine rettigheder</h2>
        <p>Vi overholder GDPR. Du har ret til at:</p>
        <ul style={{paddingLeft:24,marginTop:8}}>
          <li>Få indsigt i hvilke data vi har om dig</li>
          <li>Få dine data slettet</li>
          <li>Trække dit samtykke tilbage når som helst</li>
          <li>Klage til Datatilsynet</li>
        </ul>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>6. Datadeling</h2>
        <p>Vi deler ikke dine data med tredjepart undtagen:</p>
        <ul style={{paddingLeft:24,marginTop:8}}>
          <li>Supabase — til databaselagring (EU-servere)</li>
          <li>Anthropic — til AI email-generering (ingen persondata sendes)</li>
          <li>Stripe — til betalingshåndtering</li>
        </ul>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>7. Datasikkerhed</h2>
        <p>Vi bruger kryptering og sikre forbindelser til at beskytte dine data. Alle data gemmes på EU-baserede servere.</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>8. Kontakt</h2>
        <p>Har du spørgsmål til vores privatlivspolitik, kontakt os på:</p>
        <p style={{marginTop:8}}><strong>Email:</strong> kasperbastrup@gmail.com</p>
      </div>

      {/* DIVIDER */}
      <div style={{margin:'60px 0',borderTop:'1px solid #222'}}></div>

      {/* VILKÅR */}
      <div id="terms">
        <h1 style={{fontSize:28,fontWeight:700,marginBottom:8,color:'#ffffff'}}>Vilkår og betingelser</h1>
        <p style={{color:'#aaaaaa',marginBottom:40}}>Sidst opdateret: April 2026</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>1. Accept af vilkår</h2>
        <p>Ved at oprette en konto og bruge DriveDeal AI accepterer du disse vilkår og betingelser. Hvis du ikke accepterer vilkårene, må du ikke bruge tjenesten.</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>2. Beskrivelse af tjenesten</h2>
        <p>DriveDeal AI er en SaaS-platform der hjælper bilforhandlere med at genoplive kolde leads via AI-genererede og automatiserede emails. Tjenesten inkluderer et dashboard, lead-management, email-skabeloner og kampagnestyring.</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>3. Abonnement og betaling</h2>
        <p>DriveDeal AI tilbyder en 14-dages gratis prøveperiode. Efter prøveperioden faktureres du månedligt. Du kan opsige dit abonnement når som helst — opsigelsen træder i kraft ved udgangen af den aktuelle betalingsperiode.</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>4. Brug af Gmail API</h2>
        <p>DriveDeal AI bruger Gmail API til at sende emails på vegne af brugeren. Du giver os tilladelse til at sende emails fra din Gmail-konto udelukkende til de leads du har importeret til platformen. Vi læser, gemmer eller deler ikke indholdet af dine eksisterende emails.</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>5. Brugerens ansvar</h2>
        <p>Du er ansvarlig for at:</p>
        <ul style={{paddingLeft:24,marginTop:8}}>
          <li>Overholde GDPR og gældende lovgivning ved brug af platformen</li>
          <li>Kun importere leads der har givet samtykke til at modtage markedsføring</li>
          <li>Sikre at dine emails overholder relevant lovgivning</li>
          <li>Holde dine loginoplysninger fortrolige</li>
        </ul>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>6. Immaterielle rettigheder</h2>
        <p>DriveDeal AI og alt indhold på platformen tilhører DriveDeal AI. Du må ikke kopiere, distribuere eller modificere nogen del af tjenesten uden skriftlig tilladelse.</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>7. Ansvarsbegrænsning</h2>
        <p>DriveDeal AI er ikke ansvarlig for tab eller skader der opstår som følge af brug af platformen, herunder men ikke begrænset til tab af data, indtægter eller forretningsmuligheder.</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>8. Opsigelse</h2>
        <p>Vi forbeholder os retten til at opsige eller suspendere din konto uden varsel hvis du overtræder disse vilkår. Du kan til enhver tid slette din konto ved at kontakte os.</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>9. Ændringer af vilkår</h2>
        <p>Vi forbeholder os retten til at ændre disse vilkår. Ved væsentlige ændringer vil du blive informeret via email. Fortsat brug af tjenesten efter ændringer udgør accept af de nye vilkår.</p>

        <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32,color:'#ffffff'}}>10. Kontakt</h2>
        <p>Har du spørgsmål til vores vilkår, kontakt os på:</p>
        <p style={{marginTop:8}}><strong>Email:</strong> kasperbastrup@gmail.com</p>
      </div>

      <div style={{marginTop:60,paddingTop:24,borderTop:'1px solid #222',fontSize:13,color:'#555',display:'flex',justifyContent:'space-between'}}>
        <span>© 2026 DriveDeal AI</span>
        <a href="/" style={{color:'#c9a96e',textDecoration:'none',fontSize:13}}>← Tilbage til app</a>
      </div>
    </div>
  )
}
