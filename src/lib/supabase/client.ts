'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase tipado como `any` schema. Os tipos da tabela vivem em
 * `database.types.ts` e são aplicados manualmente nos mappers/repositories.
 * Deixar o generic schema livre evita brigas com mudanças de generics do
 * supabase-js entre versões.
 */
let _client: SupabaseClient | null = null

export function supabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error(
      'Faltam variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Veja .env.local.',
    )
  }
  _client = createBrowserClient(url, key)
  return _client
}
