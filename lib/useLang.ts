'use client'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { Lang, getTranslations } from './i18n'

export function useLang() {
  const [lang, setLang] = useState<Lang>('da')
  const [tr, setTr] = useState(getTranslations('da'))

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('dealers').select('app_language').eq('id', user.id).single()
      if (data?.app_language) {
        const l = data.app_language as Lang
        setLang(l)
        setTr(getTranslations(l))
      }
    }
    load()
  }, [])

  return { lang, tr }
}
