import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'

export function supabaseServer(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ausentes')
  }
  const store = cookies()
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return store.getAll()
      },
      setAll() {
        // server components não escrevem cookies; refresh fica pro client
      },
    },
  })
}
