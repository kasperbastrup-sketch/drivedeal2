export function calculateScore(car: string, daysSinceContact: number, source: string): number {
  let score = 0

  // Dage siden kontakt (max 40)
  if (daysSinceContact <= 30) score += 40
  else if (daysSinceContact <= 90) score += 25
  else if (daysSinceContact <= 180) score += 15
  else score += 5

  // Bil-kategori (max 30)
  const carLower = (car || '').toLowerCase()
  const luxury = ['bmw','mercedes','porsche','audi','lexus','jaguar','maserati','bentley','ferrari','lamborghini']
  const ev = ['tesla','electric','elbil','ev','e-tron','ioniq','polestar','rivian']
  const suv = ['suv','x5','q7','glc','gle','cayenne','macan','touareg','xc90','discovery']

  if (ev.some(k => carLower.includes(k))) score += 30
  else if (luxury.some(k => carLower.includes(k))) score += 28
  else if (suv.some(k => carLower.includes(k))) score += 20
  else score += 10

  // Kilde (max 30)
  const sourceLower = (source || '').toLowerCase()
  if (sourceLower.includes('showroom')) score += 30
  else if (sourceLower.includes('telefon')) score += 25
  else if (sourceLower.includes('web') || sourceLower.includes('formular')) score += 15
  else score += 10

  return Math.min(score, 100)
}
