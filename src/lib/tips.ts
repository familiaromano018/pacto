export interface CoupleTip {
  id: string
  emoji: string
  title: string
  body: string
}

/**
 * Dicas pra casais — mistura de:
 *  - conversas estruturadas
 *  - combinados financeiros saudáveis
 *  - pequenos atos relacionais
 *  - hábitos de revisão financeira
 */
export const COUPLE_TIPS: CoupleTip[] = [
  // Conversas estruturadas
  { id: 't01', emoji: '💭', title: 'A pergunta da semana', body: 'Pergunta hoje pro seu parceiro: "Qual era o maior sonho seu aos 18 anos?". Vocês vão se descobrir de novo.' },
  { id: 't02', emoji: '🌱', title: 'Sonho de 5 anos', body: 'Reservem 15 minutos hoje pra falar como vocês imaginam a vida de vocês daqui a 5 anos. Sem julgamento, só ouvir.' },
  { id: 't03', emoji: '🗣️', title: 'O que te incomoda?', body: 'Pergunta direto: "Tem alguma coisa minha que tá te incomodando e você ainda não me falou?". E ouve sem se defender.' },
  { id: 't04', emoji: '🎯', title: 'Meta inesperada', body: 'Cada um escreve numa folha 3 metas pessoais (não financeiras) pro ano. Trocam. Conversam.' },
  { id: 't05', emoji: '💡', title: 'O que admiro em você', body: 'Hoje, conta pro seu parceiro 3 coisas específicas que você admira nele(a). Específicas mesmo, sem "você é incrível".' },

  // Combinados financeiros
  { id: 'f01', emoji: '🚧', title: 'Teto da liberdade', body: 'Definam um valor que cada um pode gastar individualmente sem precisar avisar o outro. Reduz atrito, aumenta liberdade.' },
  { id: 'f02', emoji: '📅', title: 'Reunião do pacto', body: 'Marquem 1h por mês (sempre o mesmo dia, tipo todo primeiro domingo) pra revisar gastos e metas juntos. Vira ritual.' },
  { id: 'f03', emoji: '⚖️', title: 'Quem cuida do quê', body: 'Decidam juntos quem é responsável por o quê: contas fixas, mercado, carro, lazer. Reduz "achismo".' },
  { id: 'f04', emoji: '🧊', title: 'Conta gelada', body: 'Façam uma "conta gelada": valor que NUNCA é tocado a não ser em emergência real (desemprego, doença). Comece com R$ 200/mês cada.' },
  { id: 'f05', emoji: '🎁', title: 'O presente certo', body: 'Pra próxima data importante, pergunta: "Prefere presente, experiência ou guardar pro nosso sonho?". Algumas vezes a resposta surpreende.' },
  { id: 'f06', emoji: '🚨', title: 'Alarme da imprevistos', body: 'Quanto guardado seria suficiente pra dormir tranquilo se um de vocês perdesse o emprego amanhã? Calculem juntos. Esse vira a meta.' },

  // Atos relacionais pequenos
  { id: 'r01', emoji: '☕', title: 'Café sem celular', body: 'Hoje, café da manhã sem celular nenhum dos dois. 15 minutos só. Veja o que aparece nessa conversa.' },
  { id: 'r02', emoji: '💌', title: 'Recadinho à mão', body: 'Esconda um bilhete escrito à mão no lugar que ele(a) vai abrir hoje (carteira, escova de dente, marmita). Custa zero.' },
  { id: 'r03', emoji: '🚶', title: 'Caminhada do alinhamento', body: 'Saiam pra caminhar 30 min HOJE sem destino. Caminhada solta na rua é o melhor lugar pra conversa difícil.' },
  { id: 'r04', emoji: '🍝', title: 'Jantar em casa = encontro', body: 'Hoje à noite tratem o jantar em casa como um encontro: mesa posta, sem TV, vinho ou suco bonito. 20 minutos só.' },
  { id: 'r05', emoji: '🤝', title: 'Pausa de 6 segundos', body: 'Toda vez que voltarem pra casa hoje, abracem por 6 segundos antes de qualquer "como foi seu dia?". Reseta o sistema.' },
  { id: 'r06', emoji: '📷', title: 'Foto sem motivo', body: 'Tirem uma selfie hoje só por tirar. Sem ocasião. Olha como o "isto agora" é raro.' },

  // Hábitos de revisão financeira
  { id: 'h01', emoji: '🧹', title: 'Faxina das assinaturas', body: 'Abra a aba Recorrentes e olhe os fixos: tem alguma assinatura que vocês NÃO usam mais? Cancela. R$ 30 economizado vira R$ 360/ano.' },
  { id: 'h02', emoji: '📊', title: 'Onde foi o dinheiro?', body: 'Vai na aba Visão e olhe categoria a categoria. Qual te surpreendeu? Conversem por que aquela tá grande.' },
  { id: 'h03', emoji: '✅', title: 'Feche o mês', body: 'Faltam poucos dias do mês. Lance os últimos gastos hoje pra fechar limpo. Dois minutos agora poupam meia hora depois.' },
  { id: 'h04', emoji: '🎯', title: 'Defina a meta', body: 'Vocês têm metas cadastradas? Se não, vão na aba Metas e escolham UMA. Pode ser pequena: viagem, jantar especial, fundo de ano.' },
  { id: 'h05', emoji: '💸', title: 'O gasto invisível', body: 'Quanto vocês gastaram só em delivery esse mês? Olhem agora. Se for mais que 10% da renda, vale uma conversa.' },
  { id: 'h06', emoji: '🪙', title: 'A sobra é meta', body: 'Ao fechar o mês, se sobrou dinheiro, transfiram HOJE pra meta. Não esperem "decidir o que fazer". Sobra parada vira gasto invisível.' },

  // Reflexões e perspectiva
  { id: 'p01', emoji: '🪞', title: 'O custo da paz', body: 'Pensa: qual a coisa mais barata que vocês discutiram nas últimas 4 semanas? Quase sempre não vale o estresse. Pacto serve pra evitar isso.' },
  { id: 'p02', emoji: '🧭', title: 'Direção, não destino', body: 'Vocês não precisam ter respostas perfeitas pra TODO o futuro financeiro. Precisam só estar indo pro mesmo lado. Vão.' },
  { id: 'p03', emoji: '🎲', title: 'O ritual da gratidão', body: 'Antes de dormir, cada um fala 1 coisa boa que aconteceu hoje. Levam 90 segundos. Mudam o tom da semana.' },
  { id: 'p04', emoji: '🛑', title: 'A pergunta da pausa', body: 'Antes de comprar algo acima de R$ 200 esse mês, pergunte ao parceiro: "Tô com vontade ou tá fazendo sentido pra gente?". Só esperar a resposta vira clareza.' },
  { id: 'p05', emoji: '🎈', title: 'O sonho engavetado', body: 'Cada casal tem 1 sonho que pararam de falar porque parecia "longe". Falem dele hoje. Talvez não esteja tão longe assim.' },

  // Comunicação saudável sobre dinheiro
  { id: 'c01', emoji: '🗨️', title: 'Sem "você sempre"', body: 'Em conversas sobre dinheiro hoje, troquem "você sempre gasta X" por "fico preocupado(a) quando isso acontece". Diferença gigante.' },
  { id: 'c02', emoji: '👂', title: 'Escuta sem solução', body: 'Se um de vocês reclamar de algo financeiro hoje, o outro escuta SEM oferecer solução. Só "entendi". Às vezes é só isso que precisava.' },
  { id: 'c03', emoji: '🚦', title: 'Sinais antes do estouro', body: 'Combinem um sinal: quando um de vocês tá ficando estressado com dinheiro, fala "vermelho". O outro pausa a conversa. Volta amanhã.' },
  { id: 'c04', emoji: '🎓', title: 'Dinheiro do passado', body: 'Pergunta hoje pro seu parceiro: "Como era a relação da sua família com dinheiro quando você era criança?". A resposta explica muita coisa.' },

  // Específicas pro app
  { id: 'a01', emoji: '🆕', title: 'Tem categoria nova?', body: 'Aposta: vocês têm um gasto recorrente que não se encaixa nas categorias padrão. Cria uma personalizada hoje (botão + na hora de adicionar).' },
  { id: 'a02', emoji: '🤳', title: 'Lance no momento', body: 'O segredo do Pacto não é ter relatórios bonitos. É lançar o gasto NA HORA. Faz isso hoje pelo menos 2 vezes.' },
  { id: 'a03', emoji: '📤', title: 'Exporte o extrato', body: 'Já gerou um PDF do extrato? Vai na aba Casal → mês fechado → ícone de download. Manda pra você por email pra ter backup.' },
]

/**
 * Retorna a dica do dia, deterministicamente baseada na data + couple_id
 * (pra que ambos do casal vejam a mesma dica no mesmo dia).
 */
export function tipForDay(coupleId: string | null, date = new Date()): CoupleTip {
  // hash leve de couple_id pra variar entre casais
  let coupleHash = 0
  if (coupleId) {
    for (let i = 0; i < coupleId.length; i++) {
      coupleHash = (coupleHash + coupleId.charCodeAt(i)) % 1000
    }
  }
  // dia do ano (1-366)
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
  const idx = (dayOfYear + coupleHash) % COUPLE_TIPS.length
  return COUPLE_TIPS[idx]
}

/** Chave do localStorage que marca "vi a dica de YYYY-MM-DD" */
export function tipSeenKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `casal-no-azul/v1/tip-seen-${y}-${m}-${d}`
}
