import { supabase } from './supabase'

export async function autoMarkColdLeads(userId: string) {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const { data: leads } = await supabase
    .from('leads')
    .select('id, days_since_contact, status')
    .eq('dealer_id', userId)
    .neq('status', 'cold')
    .neq('status', 'booked')

  if (!leads) return

  const toMarkCold = leads
    .filter(l => l.days_since_contact >= 90)
    .map(l => l.id)

  if (toMarkCold.length === 0) return

  await supabase
    .from('leads')
    .update({ status: 'cold' })
    .in('id', toMarkCold)

  return toMarkCold.length
}
