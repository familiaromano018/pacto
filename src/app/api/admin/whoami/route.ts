/**
 * Diagnóstico temporário: revela ao próprio user logado quem o servidor
 * está vendo + se o ADMIN_EMAILS está configurado. Não revela o conteúdo
 * de ADMIN_EMAILS, só se está vazio ou não, e se o email do user bate.
 *
 * TODO: remover quando o /admin estiver funcionando.
 */
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const adminEmailsRaw = process.env.ADMIN_EMAILS || ''
  const adminEmailsCount = adminEmailsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean).length

  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  let userEmail: string | null = null
  let userId: string | null = null
  let authError: string | null = null
  try {
    const sb = supabaseServer()
    const { data, error } = await sb.auth.getUser()
    if (error) authError = error.message
    userEmail = data.user?.email ?? null
    userId = data.user?.id ?? null
  } catch (e: any) {
    authError = e?.message || String(e)
  }

  return NextResponse.json({
    server_sees: {
      ADMIN_EMAILS_set: adminEmailsCount > 0,
      ADMIN_EMAILS_count: adminEmailsCount,
      SUPABASE_SERVICE_ROLE_KEY_set: hasServiceRole,
    },
    your_session: {
      logged_in: !!userId,
      email: userEmail,
      user_id: userId,
      auth_error: authError,
    },
    decision: {
      is_admin: isAdminEmail(userEmail),
      would_redirect_to_404: !userId || !isAdminEmail(userEmail),
    },
  })
}
