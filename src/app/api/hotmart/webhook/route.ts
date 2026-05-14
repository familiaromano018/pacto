/**
 * Webhook Hotmart — recebe eventos de compra e ativa/cancela subscription do couple.
 *
 * Configurar no Hotmart:
 *   URL:  https://pacto-beta.vercel.app/api/hotmart/webhook
 *   Token (Hottok): valor da env HOTMART_HOTTOK
 *
 * Eventos tratados:
 *   PURCHASE_APPROVED, PURCHASE_COMPLETE → active
 *   PURCHASE_DELAYED                     → past_due
 *   PURCHASE_CANCELED, PURCHASE_REFUNDED, PURCHASE_CHARGEBACK,
 *   SUBSCRIPTION_CANCELLATION            → canceled
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ACTIVATING_EVENTS = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE'])
const PAST_DUE_EVENTS = new Set(['PURCHASE_DELAYED'])
const CANCEL_EVENTS = new Set([
  'PURCHASE_CANCELED',
  'PURCHASE_REFUNDED',
  'PURCHASE_CHARGEBACK',
  'PURCHASE_PROTEST',
  'SUBSCRIPTION_CANCELLATION',
])

interface HotmartPayload {
  id?: string
  event?: string
  data?: {
    buyer?: { email?: string; name?: string }
    purchase?: {
      transaction?: string
      approved_date?: number | string
      date_next_charge?: number | string
      status?: string
      payment?: { type?: string }
    }
    subscription?: {
      subscriber?: { code?: string }
      status?: string
      plan?: { name?: string }
      date_next_charge?: number | string
    }
  }
}

function asDate(v: number | string | undefined): Date | null {
  if (v == null) return null
  if (typeof v === 'number') return new Date(v < 1e12 ? v * 1000 : v)
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

export async function POST(req: NextRequest) {
  // ── 1. Auth: Hotmart manda o Hottok no header
  const hottok = req.headers.get('x-hotmart-hottok') || req.headers.get('X-HOTMART-HOTTOK')
  if (!process.env.HOTMART_HOTTOK) {
    console.error('[hotmart-webhook] HOTMART_HOTTOK não configurado')
    return NextResponse.json({ error: 'webhook not configured' }, { status: 500 })
  }
  if (!hottok || hottok !== process.env.HOTMART_HOTTOK) {
    console.warn('[hotmart-webhook] hottok inválido')
    return NextResponse.json({ error: 'invalid hottok' }, { status: 401 })
  }

  // ── 2. Parse
  let body: HotmartPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const event = body.event
  const data = body.data
  const email = data?.buyer?.email?.toLowerCase()?.trim()
  const transactionId = data?.purchase?.transaction
  const subscriberCode = data?.subscription?.subscriber?.code

  if (!event) {
    return NextResponse.json({ error: 'missing event' }, { status: 400 })
  }
  if (!email) {
    return NextResponse.json({ error: 'missing buyer email' }, { status: 400 })
  }

  // ── 3. Service role client (bypassa RLS)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    console.error('[hotmart-webhook] supabase env vars ausentes')
    return NextResponse.json({ error: 'server misconfigured' }, { status: 500 })
  }
  const sb: any = createClient(url, serviceKey, { auth: { persistSession: false } })

  // ── 4. Lookup couple pelo email
  const { data: coupleId, error: lookupErr } = await sb.rpc('find_couple_by_buyer_email', {
    buyer_email: email,
  })
  if (lookupErr) {
    console.error('[hotmart-webhook] lookup error', lookupErr)
    return NextResponse.json({ error: 'lookup failed' }, { status: 500 })
  }
  if (!coupleId) {
    // Email não bateu com nenhum user/couple. Pode ser que o user ainda não fez login,
    // ou está usando email diferente do Google. Logamos e respondemos 200 pra Hotmart
    // não ficar reentregando.
    console.warn('[hotmart-webhook] couple não encontrado pra email', email, 'event', event)
    return NextResponse.json({ ok: true, ignored: 'couple not found for buyer email' })
  }

  // ── 5. Idempotência: ignora se transactionId já processado
  if (transactionId) {
    const { data: existing } = await sb
      .from('subscriptions')
      .select('hotmart_event_log')
      .eq('couple_id', coupleId)
      .maybeSingle()
    const log = (existing?.hotmart_event_log as Array<{ event: string; transaction?: string }>) || []
    const already = log.some((e) => e.event === event && e.transaction === transactionId)
    if (already) {
      return NextResponse.json({ ok: true, skipped: 'duplicate' })
    }
  }

  // ── 6. Decidir novo status
  let status: 'active' | 'past_due' | 'canceled' | null = null
  let currentPeriodEnd: Date | null = null

  if (ACTIVATING_EVENTS.has(event)) {
    status = 'active'
    currentPeriodEnd =
      asDate(data?.subscription?.date_next_charge) ??
      asDate(data?.purchase?.date_next_charge) ??
      // fallback: 30 dias a partir da aprovação
      (() => {
        const approved = asDate(data?.purchase?.approved_date) ?? new Date()
        return new Date(approved.getTime() + 30 * 24 * 60 * 60 * 1000)
      })()
  } else if (PAST_DUE_EVENTS.has(event)) {
    status = 'past_due'
  } else if (CANCEL_EVENTS.has(event)) {
    status = 'canceled'
  } else {
    // evento que não conhecemos — só registra no log
    await appendEventLog(sb, coupleId as string, { event, transaction: transactionId, raw: body })
    return NextResponse.json({ ok: true, noted: 'unhandled event' })
  }

  // ── 7. Update subscription
  const patch: Record<string, any> = { status }
  if (currentPeriodEnd) patch.current_period_end = currentPeriodEnd.toISOString()
  if (subscriberCode) patch.hotmart_subscriber_code = subscriberCode
  if (transactionId) patch.hotmart_transaction_id = transactionId

  // Garante a row (caso o trigger não tenha rolado por algum motivo)
  await sb.from('subscriptions').upsert(
    { couple_id: coupleId, ...patch },
    { onConflict: 'couple_id' },
  )

  // Append no log
  await appendEventLog(sb, coupleId as string, {
    event,
    transaction: transactionId,
    at: new Date().toISOString(),
    raw: body,
  })

  return NextResponse.json({ ok: true, status })
}

async function appendEventLog(sb: any, coupleId: string, entry: object) {
  const { data: row } = await sb
    .from('subscriptions')
    .select('hotmart_event_log')
    .eq('couple_id', coupleId)
    .maybeSingle()
  const log = (row?.hotmart_event_log as object[]) || []
  await sb
    .from('subscriptions')
    .update({ hotmart_event_log: [...log, entry] })
    .eq('couple_id', coupleId)
}

// GET pra health check (Hotmart às vezes faz ping)
export async function GET() {
  return NextResponse.json({ ok: true, service: 'pacto-hotmart-webhook' })
}
