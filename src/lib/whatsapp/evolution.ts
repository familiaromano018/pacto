/**
 * Cliente mínimo da Evolution API (WhatsApp não-oficial, self-hosted).
 * Só o necessário pra Fase 0: enviar texto. Config por env (server-only):
 *   EVOLUTION_API_URL   ex: https://evo.seudominio.com.br
 *   EVOLUTION_API_KEY   apikey global ou da instância
 *   EVOLUTION_INSTANCE  nome da instância conectada ao número do Pacto
 */

const BASE = process.env.EVOLUTION_API_URL
const KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = process.env.EVOLUTION_INSTANCE

export function evolutionConfigured(): boolean {
  return Boolean(BASE && KEY && INSTANCE)
}

export interface MediaBase64 {
  base64: string
  mimetype?: string
}

/**
 * Pega o base64 de uma mídia (áudio) de uma mensagem recebida.
 * Se o webhook já trouxe o base64 (WEBHOOK_BASE64 ligado), usa direto;
 * senão busca via getBase64FromMediaMessage usando a key da mensagem.
 */
export async function getMediaBase64(
  messageKey: { id?: string; remoteJid?: string; fromMe?: boolean },
  payloadBase64?: string,
  payloadMime?: string,
): Promise<MediaBase64 | null> {
  if (payloadBase64) return { base64: payloadBase64, mimetype: payloadMime }
  if (!evolutionConfigured()) return null
  const url = `${BASE!.replace(/\/$/, '')}/chat/getBase64FromMediaMessage/${INSTANCE}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: KEY! },
      body: JSON.stringify({ message: { key: messageKey }, convertToMp4: false }),
    })
    if (!res.ok) {
      console.error('[whatsapp] getBase64 falhou', res.status, (await res.text().catch(() => '')).slice(0, 200))
      return null
    }
    const data = await res.json()
    if (data?.base64) return { base64: data.base64, mimetype: data.mimetype }
    return null
  } catch (err) {
    console.error('[whatsapp] getMediaBase64 erro', err)
    return null
  }
}

/**
 * Envia uma mensagem de texto. Se a Evolution ainda não estiver configurada,
 * vira no-op (loga e não quebra) — assim a Fase 0 sobe sem as credenciais.
 * `phone` em dígitos E.164 (ex: 5511999998888).
 */
export async function sendText(phone: string, text: string): Promise<boolean> {
  if (!evolutionConfigured()) {
    console.warn('[whatsapp] Evolution não configurada — não enviei:', text.slice(0, 60))
    return false
  }
  const url = `${BASE!.replace(/\/$/, '')}/message/sendText/${INSTANCE}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: KEY! },
      // Formato Evolution API v2. Em v1 o corpo é { number, textMessage: { text } }.
      body: JSON.stringify({ number: phone, text }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[whatsapp] sendText falhou', res.status, body.slice(0, 200))
      return false
    }
    return true
  } catch (err) {
    console.error('[whatsapp] sendText erro de rede', err)
    return false
  }
}
