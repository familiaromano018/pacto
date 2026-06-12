/**
 * Lógica de uma mensagem de WhatsApp de um número JÁ verificado.
 * Carrega o contexto do casal, parseia com o Haiku e age conforme a intenção.
 *
 * Fase 1: lancar (gasto/receita).
 * Fase 2: corrigir/apagar o último lançamento do usuário + "quem pagou"/rateio.
 * Fase 3 (consultar) ainda responde um aviso.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { CATEGORIES, INCOME_CATEGORIES, EMOJIS, INCOME_EMOJIS } from '@/components/constants'
import { newId } from '@/lib/id'
import { parseMessage } from './parse'
import type { ParsedIntent } from './parse'
import type { ExpenseRow, PaidBy, PaymentMethod, Scope } from '@/lib/supabase/database.types'

const PAYMENT_METHODS: PaymentMethod[] = ['pix', 'debito', 'credito', 'dinheiro', 'boleto', 'transferencia']

function brl(n: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n))
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

/** Data legível "12/06/2026 (quinta-feira)" no fuso BR, pro contexto do parser. */
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
  return available.find((c) => norm(c) === norm(suggested)) ?? 'Outros'
}

function emojiFor(cat: string, customEmojis: Record<string, string>): string {
  return EMOJIS[cat] ?? INCOME_EMOJIS[cat] ?? customEmojis[cat] ?? '📦'
}

interface Ctx {
  sb: SupabaseClient
  coupleId: string
  userId: string
  role: PaidBy
  nameA: string
  nameB: string
  expenseCategories: string[]
  incomeCategories: string[]
  customEmojis: Record<string, string>
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

  const ctx: Ctx = { sb, coupleId, userId, role, nameA, nameB, expenseCategories, incomeCategories, customEmojis }

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
      return doLancar(ctx, intent)
    case 'corrigir':
      return doCorrigir(ctx, intent)
    case 'apagar':
      return doApagar(ctx)
    case 'consultar':
      return '📊 Consultas pelo WhatsApp ("quanto gastei esse mês?") estão chegando! Por ora, dá uma olhada no app.'
    case 'ajuda':
      return [
        '💛 *Como usar o Pacto no WhatsApp:*',
        '',
        '• Lançar gasto: *"gastei 100 de gasolina"*',
        '• Lançar receita: *"recebi 3000 de salário"*',
        '• Gasto pessoal: *"almoço 35, foi meu"*',
        '• Quem pagou: *"mercado 200, a ' + (role === 'A' ? nameB : nameA) + ' pagou"*',
        '• Corrigir: *"era 120"* / *"muda pra mercado"*',
        '• Apagar: *"apaga o último"*',
        '',
        'Eu anoto na hora e te confirmo. 🙌',
      ].join('\n')
    default:
      return 'Manda tipo *"gastei 50 no mercado"* que eu lanço pra vocês. 💛'
  }
}

/** Resolve quem desembolsou: default quem mandou; "parceiro" inverte. */
function resolvePaidBy(intent: ParsedIntent, role: PaidBy): PaidBy {
  const other: PaidBy = role === 'A' ? 'B' : 'A'
  if (intent.quem_pagou === 'parceiro') return other
  return role
}

/** Resolve o escopo (divisão): default casal; meu/do_parceiro viram pessoal. */
function resolveScope(intent: ParsedIntent, role: PaidBy): Scope {
  const other: PaidBy = role === 'A' ? 'B' : 'A'
  if (intent.escopo === 'meu') return role
  if (intent.escopo === 'do_parceiro') return other
  return 'casal'
}

function resolvePayment(intent: ParsedIntent): PaymentMethod | null {
  return intent.forma_pagamento && PAYMENT_METHODS.includes(intent.forma_pagamento)
    ? intent.forma_pagamento
    : null
}

async function doLancar(ctx: Ctx, intent: ParsedIntent): Promise<string> {
  const valor = typeof intent.valor === 'number' ? intent.valor : NaN
  if (!(valor > 0)) {
    return 'Quase! Faltou o valor 🤔. Manda de novo com o valor, tipo *"gastei 90 de farmácia"*.'
  }

  const type: 'expense' | 'income' = intent.tipo === 'income' ? 'income' : 'expense'
  const available = type === 'income' ? ctx.incomeCategories : ctx.expenseCategories
  const category = matchCategory(intent.categoria, available)
  const scope = resolveScope(intent, ctx.role)
  const paidBy = resolvePaidBy(intent, ctx.role)
  const descricao = (intent.descricao || category).trim().slice(0, 120)

  const row = {
    id: newId(),
    couple_id: ctx.coupleId,
    created_by: ctx.userId,
    desc_text: descricao,
    amount: Math.round(valor * 100) / 100,
    paid_by: paidBy,
    scope,
    category,
    payment_method: resolvePayment(intent),
    month_key: spMonthKey(),
    type,
  }

  const { error } = await ctx.sb.from('expenses').insert(row)
  if (error) {
    console.error('[whatsapp] insert expense falhou', JSON.stringify(error))
    return 'Ops, não consegui salvar agora 😞. Tenta de novo em instantes?'
  }

  const verbo = type === 'income' ? 'Receita anotada' : 'Anotei'
  return `✅ ${verbo}: ${lineFor(ctx, row.amount, category, scope, paidBy)}\n_${descricao}_`
}

/** Pega o último lançamento feito por este usuário (qualquer fonte). */
async function lastExpense(ctx: Ctx): Promise<ExpenseRow | null> {
  const { data } = await ctx.sb
    .from('expenses')
    .select('*')
    .eq('couple_id', ctx.coupleId)
    .eq('created_by', ctx.userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data as ExpenseRow) ?? null
}

async function doCorrigir(ctx: Ctx, intent: ParsedIntent): Promise<string> {
  const last = await lastExpense(ctx)
  if (!last) return 'Não achei nenhum lançamento seu pra corrigir 🤔.'

  const type = last.type === 'income' ? 'income' : 'expense'
  const available = type === 'income' ? ctx.incomeCategories : ctx.expenseCategories

  const patch: Partial<ExpenseRow> = {}
  if (typeof intent.valor === 'number' && intent.valor > 0) patch.amount = Math.round(intent.valor * 100) / 100
  if (intent.categoria) patch.category = matchCategory(intent.categoria, available)
  if (intent.descricao) patch.desc_text = intent.descricao.trim().slice(0, 120)
  if (intent.escopo) patch.scope = resolveScope(intent, ctx.role)
  if (intent.quem_pagou) patch.paid_by = resolvePaidBy(intent, ctx.role)
  if (intent.forma_pagamento !== undefined) patch.payment_method = resolvePayment(intent)

  if (Object.keys(patch).length === 0) {
    return 'Não entendi o que mudar 🤔. Diz tipo *"era 120"* ou *"muda pra mercado"*.'
  }

  const { error } = await ctx.sb.from('expenses').update(patch).eq('id', last.id)
  if (error) {
    console.error('[whatsapp] update expense falhou', JSON.stringify(error))
    return 'Ops, não consegui corrigir agora 😞. Tenta de novo?'
  }

  const amount = patch.amount ?? last.amount
  const category = patch.category ?? last.category
  const scope = (patch.scope ?? last.scope) as Scope
  const paidBy = (patch.paid_by ?? last.paid_by) as PaidBy
  const desc = patch.desc_text ?? last.desc_text
  return `✏️ Corrigido: ${lineFor(ctx, amount, category, scope, paidBy)}\n_${desc}_`
}

async function doApagar(ctx: Ctx): Promise<string> {
  const last = await lastExpense(ctx)
  if (!last) return 'Não achei nenhum lançamento seu pra apagar 🤔.'

  const { error } = await ctx.sb.from('expenses').delete().eq('id', last.id)
  if (error) {
    console.error('[whatsapp] delete expense falhou', JSON.stringify(error))
    return 'Ops, não consegui apagar agora 😞. Tenta de novo?'
  }
  const emoji = emojiFor(last.category, ctx.customEmojis)
  return `🗑️ Apaguei: *${brl(Number(last.amount))}* · ${emoji} ${last.category}\n_${last.desc_text}_`
}

/** Monta "R$ X · 🛒 Categoria (· pessoal | · pagou Nome)". */
function lineFor(ctx: Ctx, amount: number, category: string, scope: Scope, paidBy: PaidBy): string {
  const emoji = emojiFor(category, ctx.customEmojis)
  let tag = ''
  if (scope !== 'casal') tag = ' · pessoal'
  // mostra quem pagou só quando não é quem mandou (caso interessante)
  if (paidBy !== ctx.role) tag += ` · pagou ${paidBy === 'A' ? ctx.nameA : ctx.nameB}`
  return `*${brl(amount)}* · ${emoji} ${category}${tag}`
}
