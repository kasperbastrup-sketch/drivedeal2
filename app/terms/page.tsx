'use client'
import { useEffect } from 'react'

export default function Terms() {
  useEffect(() => {
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  return (
    <div style={{maxWidth:720,margin:'0 auto',padding:'60px 24px',fontFamily:'Arial,sans-serif',color:'#ffffff',lineHeight:1.7}}>
      <h1 style={{fontSize:28,fontWeight:700,marginBottom:8}}>Vilkår og betingelser</h1>
      <p style={{color:'#aaaaaa',marginBottom:40}}>Sidst opdateret: April 2026</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>1. Accept af vilkår</h2>
      <p>Ved at oprette en konto og bruge DriveDeal AI accepterer du disse vilkår og betingelser. Hvis du ikke accepterer vilkårene, må du ikke bruge tjenesten.</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>2. Beskrivelse af tjenesten</h2>
      <p>DriveDeal AI er en SaaS-platform der hjælper bilforhandlere med at genoplive kolde leads via AI-genererede og automatiserede emails. Tjenesten inkluderer et dashboard, lead-management, email-skabeloner og kampagnestyring.</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>3. Abonnement og betaling</h2>
      <p>DriveDeal AI tilbyder en 14-dages gratis prøveperiode. Efter prøveperioden faktureres du månedligt. Du kan opsige dit abonnement når som helst — opsigelsen træder i kraft ved udgangen af den aktuelle betalingsperiode.</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>4. Brug af Gmail API</h2>
      <p>DriveDeal AI bruger Gmail API til at sende emails på vegne af brugeren. Du giver os tilladelse til at sende emails fra din Gmail-konto udelukkende til de leads du har importeret til platformen. Vi læser, gemmer eller deler ikke indholdet af dine eksisterende emails.</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>5. Brugerens ansvar</h2>
      <p>Du er ansvarlig for at:</p>
      <ul style={{paddingLeft:24,marginTop:8}}>
        <li>Overholde GDPR og gældende lovgivning ved brug af platformen</li>
        <li>Kun importere leads der har givet samtykke til at modtage markedsføring</li>
        <li>Sikre at dine emails overholder relevant lovgivning</li>
        <li>Holde dine loginoplysninger fortrolige</li>
      </ul>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>6. Immaterielle rettigheder</h2>
      <p>DriveDeal AI og alt indhold på platformen tilhører DriveDeal AI. Du må ikke kopiere, distribuere eller modificere nogen del af tjenesten uden skriftlig tilladelse.</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>7. Ansvarsbegrænsning</h2>
      <p>DriveDeal AI er ikke ansvarlig for tab eller skader der opstår som følge af brug af platformen, herunder men ikke begrænset til tab af data, indtægter eller forretningsmuligheder.</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>8. Opsigelse</h2>
      <p>Vi forbeholder os retten til at opsige eller suspendere din konto uden varsel hvis du overtræder disse vilkår. Du kan til enhver tid slette din konto ved at kontakte os.</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>9. Ændringer af vilkår</h2>
      <p>Vi forbeholder os retten til at ændre disse vilkår. Ved væsentlige ændringer vil du blive informeret via email. Fortsat brug af tjenesten efter ændringer udgør accept af de nye vilkår.</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>10. Kontakt</h2>
      <p>Har du spørgsmål til vores vilkår, kontakt os på:</p>
      <p style={{marginTop:8}}><strong>Email:</strong> kasperbastrup@gmail.com</p>

      <div style={{marginTop:60,paddingTop:24,borderTop:'1px solid #333',fontSize:13,color:'#666'}}>
        © 2026 DriveDeal AI. Alle rettigheder forbeholdes.
      </div>
    </div>
  )
}
