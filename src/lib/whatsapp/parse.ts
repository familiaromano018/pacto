/**
 * Parser de mensagens do WhatsApp → intenção estruturada, via Claude Haiku.
 * Usa tool-use forçado pra SEMPRE devolver JSON válido (sem texto solto).
 */
import type { PaymentMethod } from '@/lib/supabase/database.types'

export type WhatsappAction = 'lancar' | 'corrigir' | 'apagar' | 'consultar' | 'ajuda' | 'outro'

export interface ParsedIntent {
  action: WhatsappAction
  tipo?: 'expense' | 'income'
  valor?: number
  descricao?: string
  categoria?: string
  escopo?: 'casal' | 'meu' | 'do_parceiro'
  forma_pagamento?: PaymentMethod | null
  confianca?: number
}

export interface ParseContext {
  nameA: string
  nameB: string
  senderName: string
  senderRole: 'A' | 'B'
  expenseCategories: string[]
  incomeCategories: string[]
  /** data de hoje no fuso do casal, ex "2026-06-12 (quinta)" */
  hoje: string
}

const TOOL = {
  name: 'registrar_intencao',
  description: 'Interpreta a mensagem do usuário do app de finanças de casal e estrutura a intenção.',
  input_schema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['lancar', 'corrigir', 'apagar', 'consultar', 'ajuda', 'outro'],
        description:
          'lancar = registrar um gasto/receita; corrigir = mudar o último; apagar = remover o último; consultar = perguntar valores; ajuda = pedir instruções; outro = não se encaixa.',
      },
      tipo: { type: 'string', enum: ['expense', 'income'], description: 'expense = gasto, income = receita. Default expense.' },
      valor: { type: 'number', description: 'Valor em reais como número decimal. Ex: "100" -> 100, "R$ 1.250,90" -> 1250.9' },
      descricao: { type: 'string', description: 'Descrição curta do que foi. Ex: "gasolina", "almoço com a sogra".' },
      categoria: { type: 'string', description: 'A categoria MAIS próxima da lista fornecida. Se nada encaixar, "Outros".' },
      escopo: {
        type: 'string',
        enum: ['casal', 'meu', 'do_parceiro'],
        description: 'casal = conta dividida (default); meu = gasto pessoal de quem mandou; do_parceiro = pessoal do parceiro.',
      },
      forma_pagamento: {
        type: ['string', 'null'],
        enum: ['pix', 'debito', 'credito', 'dinheiro', 'boleto', 'transferencia', null],
        description: 'Forma de pagamento se mencionada, senão null.',
      },
      confianca: { type: 'number', description: 'Sua confiança de 0 a 1 na interpretação.' },
    },
    required: ['action'],
  },
} as const

export async function parseMessage(text: string, ctx: ParseContext): Promise<ParsedIntent | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.warn('[whatsapp] ANTHROPIC_API_KEY ausente — não dá pra parsear')
    return null
  }

  const system = [
    `Você é o assistente do Pacto, um app de finanças para casais. Interpreta mensagens curtas de WhatsApp e estrutura a intenção chamando a ferramenta registrar_intencao.`,
    `Hoje é ${ctx.hoje}. Quem mandou a mensagem é ${ctx.senderName} (pessoa ${ctx.senderRole}). O casal é ${ctx.nameA} (A) e ${ctx.nameB} (B).`,
    `Categorias de GASTO disponíveis: ${ctx.expenseCategories.join(', ')}.`,
    `Categorias de RECEITA disponíveis: ${ctx.incomeCategories.join(', ')}.`,
    `Regras:`,
    `- "gastei/paguei/comprei X de Y" -> action=lancar, tipo=expense.`,
    `- "recebi/ganhei/caiu X" (salário, freela, etc) -> action=lancar, tipo=income.`,
    `- valor SEMPRE em reais como número (ponto decimal). Sem valor num lançamento -> ainda action=lancar mas sem o campo valor.`,
    `- categoria: escolha a mais próxima da lista do tipo certo; se nada servir, "Outros".`,
    `- escopo: default "casal". Só use "meu"/"do_parceiro" se a pessoa deixar claro que é pessoal.`,
    `- Pergunta tipo "quanto gastei?", "qual o saldo?" -> action=consultar.`,
    `- "corrige", "tava errado", "muda pra X" -> action=corrigir. "apaga", "cancela o último" -> action=apagar.`,
    `- Saudação/dúvida de como usar -> action=ajuda. Qualquer coisa fora disso -> action=outro.`,
  ].join('\n')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 500,
        system,
        tools: [TOOL],
        tool_choice: { type: 'tool', name: 'registrar_intencao' },
        messages: [{ role: 'user', content: text }],
      }),
    })
    if (!res.ok) {
      console.error('[whatsapp] Anthropic', res.status, (await res.text().catch(() => '')).slice(0, 200))
      return null
    }
    const data = await res.json()
    const toolUse = (data.content || []).find((c: any) => c.type === 'tool_use')
    if (!toolUse?.input) return null
    return toolUse.input as ParsedIntent
  } catch (err) {
    console.error('[whatsapp] parseMessage erro', err)
    return null
  }
}
