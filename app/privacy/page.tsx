export default function Privacy() {
  return (
    <div style={{maxWidth:720,margin:'0 auto',padding:'60px 24px',fontFamily:'Arial,sans-serif',color:'#ffffff',lineHeight:1.7}}>
      <h1 style={{fontSize:28,fontWeight:700,marginBottom:8}}>Privatlivspolitik</h1>
      <p style={{color:'#aaaaaa',marginBottom:40}}>Sidst opdateret: April 2026</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>1. Hvem vi er</h2>
      <p>DriveDeal AI er en SaaS-platform der hjælper bilforhandlere med at genoplive kolde leads via AI-genererede emails. Denne privatlivspolitik beskriver hvordan vi indsamler, bruger og beskytter dine data.</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>2. Data vi indsamler</h2>
      <p>Vi indsamler følgende data når du opretter en konto og bruger vores platform:</p>
      <ul style={{paddingLeft:24,marginTop:8}}>
        <li>Navn og email-adresse</li>
        <li>Forhandlernavn og kontaktoplysninger</li>
        <li>Lead-data som du selv importerer (navne, emails, telefonnumre)</li>
        <li>Gmail OAuth token til afsendelse af emails på dine vegne</li>
        <li>Kampagne- og email-statistik</li>
      </ul>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>3. Hvordan vi bruger dine data</h2>
      <ul style={{paddingLeft:24,marginTop:8}}>
        <li>At levere og forbedre vores service</li>
        <li>At sende AI-genererede emails til dine leads på dine vegne</li>
        <li>At vise statistik og analyser i dit dashboard</li>
        <li>At kontakte dig om din konto og vores service</li>
      </ul>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>4. Gmail API og Google data</h2>
      <p>DriveDeal AI bruger Gmail API til at sende emails på vegne af brugeren. Vi:</p>
      <ul style={{paddingLeft:24,marginTop:8}}>
        <li>Sender kun emails som brugeren har godkendt via vores platform</li>
        <li>Læser ikke brugerens eksisterende emails eller andre Gmail-data</li>
        <li>Deler ikke Gmail-adgang med tredjepart</li>
        <li>Gemmer kun det OAuth token der er nødvendigt for at sende emails</li>
      </ul>
      <p style={{marginTop:8}}>DriveDeal AIs brug af Google APIs overholder <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" style={{color:'#1a73e8'}}>Googles API Services User Data Policy</a>, herunder Limited Use kravene.</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>5. GDPR og dine rettigheder</h2>
      <p>Vi overholder GDPR. Du har ret til at:</p>
      <ul style={{paddingLeft:24,marginTop:8}}>
        <li>Få indsigt i hvilke data vi har om dig</li>
        <li>Få dine data slettet</li>
        <li>Trække dit samtykke tilbage når som helst</li>
        <li>Klage til Datatilsynet</li>
      </ul>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>6. Datadeling</h2>
      <p>Vi deler ikke dine data med tredjepart undtagen:</p>
      <ul style={{paddingLeft:24,marginTop:8}}>
        <li>Supabase — til databaselagring (EU-servere)</li>
        <li>Anthropic — til AI email-generering (ingen persondata sendes)</li>
        <li>Stripe — til betalingshåndtering</li>
      </ul>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>7. Datasikkerhed</h2>
      <p>Vi bruger kryptering og sikre forbindelser til at beskytte dine data. Alle data gemmes på EU-baserede servere.</p>

      <h2 style={{fontSize:18,fontWeight:600,marginBottom:8,marginTop:32}}>8. Kontakt</h2>
      <p>Har du spørgsmål til vores privatlivspolitik, kontakt os på:</p>
      <p style={{marginTop:8}}><strong>Email:</strong> kasperbastrup@gmail.com</p>

      <div style={{marginTop:60,paddingTop:24,borderTop:'1px solid #eee',fontSize:13,color:'#666666'}}>
        © 2026 DriveDeal AI. Alle rettigheder forbeholdes.
      </div>
    </div>
  )
}
