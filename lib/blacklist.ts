import { supabase } from './supabase'

export async function isBlacklisted(userId: string, email: string): Promise<boolean> {
  const { data } = await supabase
    .from('blacklist')
    .select('id')
    .eq('dealer_id', userId)
    .eq('email', email.toLowerCase().trim())
    .single()
  return !!data
}

export async function getBlacklistedEmails(userId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from('blacklist')
    .select('email')
    .eq('dealer_id', userId)
  return new Set((data || []).map(b => b.email.toLowerCase()))
}
