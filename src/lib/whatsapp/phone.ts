/**
 * Normalização de telefone brasileiro pra casar o número que o WhatsApp manda
 * com o que o usuário digitou no app.
 *
 * O WhatsApp entrega o JID tipo "5511999998888@s.whatsapp.net". O usuário pode
 * digitar "(11) 99999-8888", "+55 11 99999 8888", etc. Guardamos sempre só os
 * dígitos em E.164 (55 + DDD + número).
 */

/** Só dígitos, garantindo o país 55 quando vier um número local (10 ou 11 dígitos). */
export function normalizePhone(raw: string): string {
  let d = (raw || '').replace(/\D/g, '').replace(/^0+/, '')
  if (d.length === 10 || d.length === 11) d = '55' + d // DDD + número sem país
  return d
}

/**
 * Chave tolerante ao 9º dígito (alguns números antigos chegam sem o 9 do celular).
 * Compara país(2) + DDD(2) + últimos 8 dígitos. Use pra comparar dois números,
 * nunca pra armazenar.
 */
export function phoneMatchKey(raw: string): string {
  const n = normalizePhone(raw)
  if (n.length >= 12) return n.slice(0, 4) + n.slice(-8) // 55 + DDD + últimos 8
  return n
}

/** Extrai o JID do payload do WhatsApp em dígitos. Retorna null se for grupo/inválido. */
export function phoneFromJid(jid: string | undefined | null): string | null {
  if (!jid) return null
  if (jid.includes('@g.us')) return null // grupo, ignora
  const digits = jid.split('@')[0].split(':')[0].replace(/\D/g, '')
  return digits || null
}
