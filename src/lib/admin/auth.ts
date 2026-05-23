import 'server-only'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

function adminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || ''
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return adminEmails().has(email.toLowerCase())
}

export async function requireAdmin(): Promise<{ email: string; userId: string }> {
  const sb = supabaseServer()
  const { data, error } = await sb.auth.getUser()
  if (error || !data.user) notFound()
  const email = data.user.email
  if (!isAdminEmail(email)) notFound()
  return { email: email!, userId: data.user.id }
}
