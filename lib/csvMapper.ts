export interface MappedLead {
  name: string
  email: string
  phone: string
  car: string
  days_since_contact: number
  source: string
}

const fieldMap: Record<string, string> = {
  'navn': 'name', 'name': 'name', 'nombre': 'name', 'kundenavn': 'name',
  'kunde': 'name', 'kontakt': 'name', 'fuldt navn': 'name', 'full name': 'name',
  'fornavn': 'name', 'efternavn': 'name',
  'email': 'email', 'e-mail': 'email', 'mail': 'email', 'correo': 'email',
  'emailadresse': 'email', 'e-mailadresse': 'email', 'kontaktemail': 'email',
  'telefon': 'phone', 'phone': 'phone', 'tlf': 'phone', 'mobil': 'phone',
  'telefonnr': 'phone', 'telefonnummer': 'phone', 'tlfnr': 'phone',
  'mobilnummer': 'phone', 'telefono': 'phone',
  'bil': 'car', 'car': 'car', 'coche': 'car', 'interesse': 'car',
  'bilmodel': 'car', 'model': 'car', 'mærke': 'car', 'bilmærke': 'car',
  'bilinteresse': 'car', 'ønsket bil': 'car', 'bil interesse': 'car',
  'varebetegnelse': 'car', 'beskrivelse': 'car', 'fabrikat': 'car',
  'modelnavn': 'car', 'biltype': 'car', 'vehicles': 'car', 'vehicle': 'car',
  'make': 'car', 'make/model': 'car', 'ønsket model': 'car', 'lead bil': 'car',
  'efterspurgt bil': 'car',
  'dage': 'days', 'days': 'days', 'dias': 'days', 'dage siden kontakt': 'days',
  'dage siden': 'days', 'inaktiv dage': 'days', 'antal dage': 'days',
  'sidst kontaktet': 'days', 'last contact': 'days', 'last contacted': 'days',
  'kontaktdato': 'days', 'seneste kontakt': 'days', 'oprettelsesdato': 'days',
  'days since last contact': 'days', 'inactive days': 'days',
  'dage siden henvendelse': 'days', 'leadalder': 'days', 'alder': 'days',
}

function detectSource(headers: string[]): string {
  const headerStr = headers.join(' ').toLowerCase()
  if (headerStr.includes('bilinfo') || headerStr.includes('lead bil') || headerStr.includes('leadalder') || headerStr.includes('henvendelse')) return 'Bilinfo'
  if (headerStr.includes('autodesktop') || headerStr.includes('inactive days') || headerStr.includes('days since last contact')) return 'AutoDesktop'
  return 'CSV Import'
}

function parseDate(dateStr: string): number {
  if (!dateStr) return 90
  const num = parseInt(dateStr)
  if (!isNaN(num)) return num
  try {
    const date = new Date(dateStr)
    if (!isNaN(date.getTime())) {
      const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
      return Math.max(0, diff)
    }
  } catch {}
  return 90
}

function cleanText(str: string): string {
  return str
    .replace(/\uFEFF/g, '')     // Remove BOM
    .replace(/\u00e6/g, 'æ')   // Ensure æ
    .replace(/\u00f8/g, 'ø')   // Ensure ø
    .replace(/\u00e5/g, 'å')   // Ensure å
    .replace(/\u00c6/g, 'Æ')
    .replace(/\u00d8/g, 'Ø')
    .replace(/\u00c5/g, 'Å')
    .replace(/\u00f6/g, 'ö')   // Swedish ö
    .replace(/\u00e4/g, 'ä')   // Swedish ä
    .replace(/\u00fc/g, 'ü')   // German ü
    .trim()
    .replace(/^"|"$/g, '')
}

export function mapCSV(csvText: string): { leads: MappedLead[], source: string, skipped: number, total: number } {
  // Remove BOM if present
  const cleanedText = csvText.replace(/^\uFEFF/, '')
  const lines = cleanedText.split('\n').filter(l => l.trim())
  if (lines.length < 2) return { leads: [], source: 'CSV Import', skipped: 0, total: 0 }

  const firstLine = lines[0]
  const separator = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ','

  const rawHeaders = lines[0].split(separator).map(h => cleanText(h).toLowerCase())
  const source = detectSource(rawHeaders)

  const columnMap: Record<number, string> = {}
  rawHeaders.forEach((header, i) => {
    const mapped = fieldMap[header]
    if (mapped && !Object.values(columnMap).includes(mapped)) {
      columnMap[i] = mapped
    }
  })

  const fornavnIdx = rawHeaders.findIndex(h => h === 'fornavn')
  const efternavnIdx = rawHeaders.findIndex(h => h === 'efternavn')
  const hasSplitName = fornavnIdx >= 0 && efternavnIdx >= 0

  const leads: MappedLead[] = []
  let skipped = 0

  lines.slice(1).forEach(line => {
    if (!line.trim()) return
    const values = line.split(separator).map(v => cleanText(v))

    const lead: Partial<MappedLead> = { source }

    if (hasSplitName) {
      lead.name = `${values[fornavnIdx] || ''} ${values[efternavnIdx] || ''}`.trim()
    }

    Object.entries(columnMap).forEach(([idx, field]) => {
      const val = values[parseInt(idx)] || ''
      if (field === 'name' && !hasSplitName) lead.name = val
      if (field === 'email') lead.email = val.toLowerCase().trim()
      if (field === 'phone') lead.phone = val
      if (field === 'car') lead.car = val
      if (field === 'days') lead.days_since_contact = parseDate(val)
    })

    if (!lead.email || !lead.email.includes('@')) {
      skipped++
      return
    }

    leads.push({
      name: lead.name || 'Ukendt',
      email: lead.email,
      phone: lead.phone || '',
      car: lead.car || '',
      days_since_contact: lead.days_since_contact ?? 90,
      source: lead.source || source,
    })
  })

  return { leads, source, skipped, total: lines.length - 1 }
}
