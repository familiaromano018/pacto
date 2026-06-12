/**
 * Lógica de uma mensagem de WhatsApp de um número JÁ verificado.
 * Carrega o contexto do casal, parseia com o Haiku e age conforme a intenção.
 * Fase 1: implementa "lancar" (gasto/receita). corrigir/apagar/consultar ficam
 * pra Fases 2-3 — por ora respondem um aviso amigável.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { CATEGORIES, INCOME_CATEGORIES, EMOJIS, INCOME_EMOJIS } from '@/components/constants'
import { newId } from '@/lib/id'
import { parseMessage } from './parse'
import type { ParsedIntent } from './parse'
import type { PaidBy, PaymentMethod, Scope } from '@/lib/supabase/database.types'

const PAYMENT_METHODS: PaymentMethod[] = ['pix', 'debito', 'credito', 'dinheiro', 'boleto', 'transferencia']

function brl(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
}

/** "YYYY-MM" no fuso de São Paulo. */
function spMonthKey(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date())
  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  return `${y}-${m}`
}

/** Data legível "12/06/2026 (quinta)" no fuso BR, pro contexto do parser. */
function spToday(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    weekday: 'long',
  }).format(new Date())
}

/** Casa a categoria sugerida pela IA com uma da lista (case-insensitive). Fallback "Outros". */
function matchCategory(suggested: string | undefined, available: string[]): string {
  if (!suggested) return 'Outros'
  const norm = (s: string) => s.trim().toLowerCase()
  const hit = available.find((c) => norm(c) === norm(suggested))
  return hit ?? 'Outros'
}

function emojiFor(cat: string, customEmojis: Record<string, string>): string {
  return EMOJIS[cat] ?? INCOME_EMOJIS[cat] ?? customEmojis[cat] ?? '📦'
}

export async function handleVerifiedMessage(
  sb: SupabaseClient,
  userId: string,
  text: string,
): Promise<string | null> {
  // ── contexto: casal + papel + categorias custom
  const { data: member } = await sb
    .from('members')
    .select('couple_id, role')
    .eq('user_id', userId)
    .maybeSingle()
  if (!member) return null
  const coupleId: string = member.couple_id
  const role = member.role as PaidBy

  const { data: hasAccess } = await sb.rpc('couple_has_access', { target_couple: coupleId })
  if (!hasAccess) {
    return '⚠️ A assinatura do Pacto está inativa. Reative no app pra continuar lançando por aqui.'
  }

  const { data: couple } = await sb
    .from('couples')
    .select('name_a, name_b')
    .eq('id', coupleId)
    .maybeSingle()
  const nameA = couple?.name_a || 'A'
  const nameB = couple?.name_b || 'B'
  const senderName = role === 'A' ? nameA : nameB

  const { data: customs } = await sb
    .from('custom_categories')
    .select('name, emoji')
    .eq('couple_id', coupleId)
  const customNames = (customs || []).map((c: any) => c.name as string)
  const customEmojis: Record<string, string> = {}
  for (const c of customs || []) customEmojis[(c as any).name] = (c as any).emoji

  const expenseCategories = Array.from(new Set([...CATEGORIES.filter((c) => c !== 'Outros'), ...customNames, 'Outros']))
  const incomeCategories = [...INCOME_CATEGORIES]

  // ── parse
  const intent = await parseMessage(text, {
    nameA,
    nameB,
    senderName,
    senderRole: role,
    expenseCategories,
    incomeCategories,
    hoje: spToday(),
  })
  if (!intent) {
    return 'Não consegui entender 😅. Tenta assim: *"gastei 80 de uber"* ou *"paguei 250 no mercado"*.'
  }

  switch (intent.action) {
    case 'lancar':
      return doLancar(sb, { coupleId, userId, role, expenseCategories, incomeCategories, customEmojis }, intent)
    case 'corrigir':
    case 'apagar':
      return '🛠️ Corrigir e apagar pelo WhatsApp tá quase pronto. Por enquanto, ajusta direto no app.'
    case 'consultar':
      return '📊 Consultas pelo WhatsApp ("quanto gastei esse mês?") estão chegando! Por ora, dá uma olhada no app.'
    case 'ajuda':
      return [
        '💛 *Como usar o Pacto no WhatsApp:*',
        '',
        '• Lançar gasto: *"gastei 100 de gasolina"*',
        '• Lançar receita: *"recebi 3000 de salário"*',
        '• Gasto pessoal: *"almoço 35, foi meu"*',
        '',
        'Eu anoto na hora e te confirmo. 🙌',
      ].join('\n')
    default:
      return 'Manda tipo *"gastei 50 no mercado"* que eu lanço pra vocês. 💛'
  }
}

interface LancarCtx {
  coupleId: string
  userId: string
  role: PaidBy
  expenseCategories: string[]
  incomeCategories: string[]
  customEmojis: Record<string, string>
}

async function doLancar(sb: SupabaseClient, ctx: LancarCtx, intent: ParsedIntent): Promise<string> {
  const valor = typeof intent.valor === 'number' ? intent.valor : NaN
  if (!(valor > 0)) {
    return 'Quase! Faltou o valor 🤔. Manda de novo com o valor, tipo *"gastei 90 de farmácia"*.'
  }

  const type: 'expense' | 'income' = intent.tipo === 'income' ? 'income' : 'expense'
  const available = type === 'income' ? ctx.incomeCategories : ctx.expenseCategories
  const category = matchCategory(intent.categoria, available)

  // escopo → scope ('casal' | 'A' | 'B'); paid_by = quem mandou (Fase 1)
  const other: PaidBy = ctx.role === 'A' ? 'B' : 'A'
  let scope: Scope = 'casal'
  if (intent.escopo === 'meu') scope = ctx.role
  else if (intent.escopo === 'do_parceiro') scope = other

  const paymentMethod: PaymentMethod | null =
    intent.forma_pagamento && PAYMENT_METHODS.includes(intent.forma_pagamento)
      ? intent.forma_pagamento
      : null

  const descricao = (intent.descricao || category).trim().slice(0, 120)

  const row = {
    id: newId(),
    couple_id: ctx.coupleId,
    created_by: ctx.userId,
    desc_text: descricao,
    amount: Math.round(valor * 100) / 100,
    paid_by: ctx.role,
    scope,
    category,
    payment_method: paymentMethod,
    month_key: spMonthKey(),
    type,
  }

  const { error } = await sb.from('expenses').insert(row)
  if (error) {
    console.error('[whatsapp] insert expense falhou', JSON.stringify(error))
    return 'Ops, não consegui salvar agora 😞. Tenta de novo em instantes?'
  }

  const emoji = emojiFor(category, ctx.customEmojis)
  const verbo = type === 'income' ? 'Receita anotada' : 'Anotei'
  const scopeTag = scope === 'casal' ? '' : ' · pessoal'
  return `✅ ${verbo}: *${brl(row.amount)}* · ${emoji} ${category}${scopeTag}\n_${descricao}_`
}
