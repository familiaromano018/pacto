/**
 * Webhook WhatsApp (Evolution API) — entrada de mensagens.
 *
 * Configurar na Evolution (Webhook da instância):
 *   URL:    https://pacto-beta.vercel.app/api/whatsapp?secret=<WHATSAPP_WEBHOOK_SECRET>
 *   Evento: MESSAGES_UPSERT
 *
 * Fase 0: trata só a VERIFICAÇÃO de número. Quando o usuário manda o código de
 * 6 dígitos que apareceu no app, casamos com a linha pendente em user_whatsapp,
 * gravamos o telefone do remetente e marcamos verified = true.
 *
 * Fases 1-3 (lançar / corrigir / consultar) entram depois, abaixo do bloco de
 * verificação, reusando o mesmo lookup de número → usuário → casal.
 */
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendText, getMediaBase64 } from '@/lib/whatsapp/evolution'
import { transcribeAudio } from '@/lib/whatsapp/transcribe'
import { phoneFromJid, normalizePhone } from '@/lib/whatsapp/phone'
import { handleVerifiedMessage, handleReceipt } from '@/lib/whatsapp/handlers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface EvoMessage {
  key?: { remoteJid?: string; fromMe?: boolean; id?: string }
  message?: {
    conversation?: string
    extendedTextMessage?: { text?: string }
    audioMessage?: { mimetype?: string }
    imageMessage?: { mimetype?: string; caption?: string }
    documentMessage?: { mimetype?: string; fileName?: string; caption?: string }
    base64?: string // quando WEBHOOK_BASE64 está ligado na Evolution
  }
  base64?: string
  pushName?: string
}

interface EvoPayload {
  event?: string
  instance?: string
  data?: EvoMessage | EvoMessage[]
}

function extractText(m: EvoMessage): string {
  return (m.message?.conversation ?? m.message?.extendedTextMessage?.text ?? '').trim()
}

export async function POST(req: NextRequest) {
  // ── 1. Auth: secret na query string (Evolution não manda header custom fácil)
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET
  if (secret) {
    const got = req.nextUrl.searchParams.get('secret')
    if (got !== secret) {
      console.warn('[whatsapp-webhook] secret inválido')
      return NextResponse.json({ error: 'invalid secret' }, { status: 401 })
    }
  }

  // ── 2. Parse
  let body: EvoPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const msg = Array.isArray(body.data) ? body.data[0] : body.data
  if (!msg || msg.key?.fromMe) {
    return NextResponse.json({ ok: true, ignored: 'no message or self' })
  }

  const phone = phoneFromJid(msg.key?.remoteJid)
  if (!phone) {
    return NextResponse.json({ ok: true, ignored: 'no phone' })
  }

  const sb = supabaseAdmin()

  // Número já verificado? (preciso cedo: só transcrevo áudio de quem é do Pacto, pra não gastar à toa)
  const { data: verifiedUser } = await sb
    .from('user_whatsapp')
    .select('user_id')
    .eq('phone', normalizePhone(phone))
    .eq('verified', true)
    .maybeSingle()

  const m = msg.message

  // ── Nota fiscal: foto (imageMessage) ou PDF (documentMessage) — só número verificado.
  const isPdf = !!m?.documentMessage && (m.documentMessage.mimetype || '').includes('pdf')
  if (verifiedUser && (m?.imageMessage || isPdf)) {
    const mime = isPdf ? 'application/pdf' : (m?.imageMessage?.mimetype || 'image/jpeg')
    const caption = m?.imageMessage?.caption ?? m?.documentMessage?.caption
    const media = await getMediaBase64(msg.key || {}, m?.base64 ?? msg.base64, mime)
    if (media?.base64) {
      try {
        const reply = await handleReceipt(sb, verifiedUser.user_id, media.base64, media.mimetype || mime, caption)
        if (reply) await sendText(phone, reply)
        return NextResponse.json({ ok: true, stage: 'receipt' })
      } catch (err) {
        console.error('[whatsapp-webhook] handleReceipt erro', err)
        await sendText(phone, 'Não consegui ler a nota agora 😞. Tenta de novo ou manda o valor no texto?')
        return NextResponse.json({ ok: true, stage: 'receipt-error' })
      }
    }
  }

  // Texto: da mensagem, ou transcrito do áudio (nota de voz).
  let text = extractText(msg)
  if (!text && m?.audioMessage && verifiedUser) {
    const media = await getMediaBase64(
      msg.key || {},
      m.base64 ?? msg.base64,
      m.audioMessage.mimetype,
    )
    if (media?.base64) {
      const t = await transcribeAudio(media.base64, media.mimetype)
      if (t) text = t
    }
  }
  if (!text) {
    return NextResponse.json({ ok: true, ignored: 'no text' })
  }

  // ── 3. É uma VERIFICAÇÃO de número? (mensagem contém um código de 6 dígitos pendente)
  const codeMatch = text.replace(/\s/g, '').match(/\b(\d{6})\b/)
  if (codeMatch) {
    const code = codeMatch[1]
    const { data: pending } = await sb
      .from('user_whatsapp')
      .select('user_id, verify_expires_at')
      .eq('verify_code', code)
      .eq('verified', false)
      .order('verify_expires_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (pending) {
      const expired = pending.verify_expires_at && new Date(pending.verify_expires_at) < new Date()
      if (expired) {
        await sendText(phone, '⏰ Esse código expirou. Gera um novo lá no app, em Configurações → WhatsApp.')
        return NextResponse.json({ ok: true, verify: 'expired' })
      }
      await sb
        .from('user_whatsapp')
        .update({ phone: normalizePhone(phone), verified: true, verify_code: null, verify_expires_at: null })
        .eq('user_id', pending.user_id)

      await sendText(
        phone,
        '✅ WhatsApp conectado ao Pacto!\n\nEm breve você vai poder lançar gastos por aqui — tipo "gastei 100 de gasolina". Te aviso quando ligar. 💛',
      )
      return NextResponse.json({ ok: true, verify: 'done' })
    }
    // 6 dígitos mas sem código pendente: cai pro fluxo normal abaixo.
  }

  // ── 4. Número já verificado? → parseia e lança (Fases 1-2)
  if (verifiedUser) {
    try {
      const reply = await handleVerifiedMessage(sb, verifiedUser.user_id, text)
      if (reply) await sendText(phone, reply)
      return NextResponse.json({ ok: true, stage: 'handled' })
    } catch (err) {
      console.error('[whatsapp-webhook] handler erro', err)
      await sendText(phone, 'Ops, deu um errinho aqui 😞. Tenta de novo daqui a pouco?')
      return NextResponse.json({ ok: true, stage: 'handler-error' })
    }
  }

  // ── 5. Número desconhecido: ignora em silêncio (não respondemos a quem não é do Pacto).
  return NextResponse.json({ ok: true, ignored: 'unknown number' })
}

// Health check
export async function GET() {
  return NextResponse.json({ ok: true, service: 'pacto-whatsapp-webhook' })
}
