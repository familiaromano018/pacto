// Gera o Manual do Usuário do Pacto em PDF.
// Uso: node scripts/gen-manual-pdf.mjs
// Saída: docs/marketing/Pacto-Manual-do-Usuario.pdf

import { jsPDF } from 'jspdf'
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname } from 'node:path'

const LOGO_PATH = '/Volumes/PortableSSD/PACTO/ChatGPT Image 19 de mai. de 2026, 17_06_17.png'
const logoDataUrl = existsSync(LOGO_PATH)
  ? `data:image/png;base64,${readFileSync(LOGO_PATH).toString('base64')}`
  : null
if (!logoDataUrl) console.warn('⚠️  Logo não encontrado em ' + LOGO_PATH + ' — capa usará texto.')

// ============ COLOR PALETTE ============
const COLORS = {
  navy:        [11, 21, 56],     // #0b1538 — header/brand
  navyDark:    [7, 14, 38],
  blue:        [91, 141, 255],   // #5b8dff — accent
  white:       [255, 255, 255],
  bgLight:     [248, 249, 252],
  text:        [30, 32, 40],
  textMuted:   [120, 124, 135],
  textHeading: [11, 21, 56],
  separator:   [220, 224, 232],
  pink:        [255, 107, 107],
  teal:        [78, 205, 196],
  orange:      [245, 124, 0],
}

// ============ CONTEÚDO (10 seções, 56 perguntas) ============
const FAQ = [
  {
    emoji: '📌',
    title: 'Primeiros passos',
    items: [
      { q: 'Como crio uma conta no Pacto?',
        a: 'Você abre o app no celular ou navegador, faz login com e-mail e cria um "pacto" novo. Aí gera um código que você compartilha com seu(sua) parceiro(a).' },
      { q: 'Como convido meu parceiro(a)?',
        a: 'Na aba "Casal", você encontra seu código (formato PACTO-XXXX). Toca em "Compartilhar" e envia pelo WhatsApp ou copia direto. Seu parceiro abre o app, escolhe "Tenho um convite" e digita o código.' },
      { q: 'E se eu quiser usar sozinho(a) por enquanto?',
        a: 'Pode. Quando o(a) parceiro(a) entrar, ele(a) verá todos os gastos que você já registrou. Você pode convidar a qualquer momento na aba "Casal" → "Convite".' },
      { q: 'Posso trocar de parceiro(a) depois?',
        a: 'Atualmente não. Cada pacto é fixo entre as duas pessoas que se conectaram. Se precisar refazer, é melhor criar uma conta nova (e exportar o histórico em PDF antes).' },
      { q: 'Tenho que pagar pra usar?',
        a: 'O Pacto tem um período grátis de teste para você experimentar tudo. Depois disso, vira assinatura mensal. Você vê os dias restantes no topo do app.' },
      { q: 'Funciona no celular e no computador?',
        a: 'Funciona em qualquer lugar com navegador. No celular, dá pra "instalar" como um app (sem precisar da loja). No computador, abre normal pelo navegador. Os dados sincronizam entre os dispositivos em tempo real.' },
    ],
  },
  {
    emoji: '🧭',
    title: 'Como funciona o app',
    items: [
      { q: 'O que é o "Pacto"?',
        a: 'É o nome do app — e também o "acordo" financeiro entre vocês dois. Cada casal tem seu pacto, seus dados, suas regras de divisão. Ninguém de fora vê.' },
      { q: 'Quais são as 5 abas do app?',
        a: 'Visão: gráficos do mês (gastos por categoria, por pessoa, por forma de pagamento). Mês: lista detalhada de tudo o que rolou no mês. Recorrentes: custos fixos (aluguel, streaming) e parcelados (TV, geladeira). Metas: o que vocês estão guardando dinheiro pra comprar/fazer. Casal: configurações, convite, histórico e ajustes.' },
      { q: 'O que é "Pessoa A" e "Pessoa B"?',
        a: 'São os dois membros do pacto — quem criou (A) e quem entrou pelo convite (B). Você pode renomear ambos com seus nomes reais na aba "Casal". As cores ajudam a identificar: vermelho pra A, verde-água pra B.' },
      { q: 'Pra que serve cada cor no app?',
        a: 'Vermelho: pessoa A. Verde-água: pessoa B. Azul: gastos do casal (compartilhados). Roxo: custos fixos. Laranja: parcelamentos.' },
      { q: 'Por que tem um botão "+" flutuante no meio?',
        a: 'É pra adicionar um novo gasto rapidamente, de qualquer aba. Quando o mês está sem nenhum gasto, ele "pulsa" pra te lembrar.' },
    ],
  },
  {
    emoji: '💰',
    title: 'Adicionando gastos',
    items: [
      { q: 'Qual a diferença entre avulso, fixo e parcelado?',
        a: 'Avulso: gasto único de um mês específico (ex: jantar de domingo, R$ 80). Fixo: aparece todo mês automaticamente (ex: Spotify, aluguel). Você pode pausar a qualquer momento. Parcelado: dividido em N vezes (ex: TV em 12x). Cada parcela aparece todo mês até completar.' },
      { q: 'Como adiciono um gasto?',
        a: 'Toca no botão "+" flutuante. Preenche descrição, valor, escolhe o tipo, a categoria, quem pagou e o escopo (individual ou do casal). Salva.' },
      { q: 'O que é "escopo"?',
        a: 'O escopo diz se o gasto é DO CASAL (vocês dividem) ou PESSOAL de um de vocês (só conta no individual de quem comprou). Ex: mercado é casal; corte de cabelo é pessoal.' },
      { q: 'O que é "pago por"?',
        a: 'Quem efetivamente desembolsou o dinheiro. Mesmo gastos do casal precisam dizer quem pagou — é assim que o app sabe quem está "credor" ou "devedor" no fim do mês.' },
      { q: 'E se a gente pagou junto, partido na hora?',
        a: 'Coloca como pago por uma pessoa (a que pagou a parte maior) e na descrição menciona o split. Ou faz dois lançamentos — cada um com a parte que pagou. O total fica certo nos dois casos.' },
      { q: 'Pra que serve "Forma de pagamento"?',
        a: 'É opcional, mas ajuda a entender pra onde o dinheiro vai. Aparece no relatório "Visão → Por forma de pagamento". Útil pra ver, por exemplo, quanto está indo pro crédito ou Pix.' },
      { q: 'Como funciona o vencimento (dueDay) dos fixos e parcelados?',
        a: 'É o dia do mês em que esse gasto cai. Serve só pra organizar (não cobra ninguém). Se o mês não tem aquele dia (ex: dia 31 em fevereiro), o app ajusta automaticamente.' },
      { q: 'Posso definir um custo fixo que aparece a cada 6 meses (e não todo mês)?',
        a: 'Pode. Na hora de criar/editar, escolhe a frequência: mensal, bimestral, trimestral, semestral ou anual. Ele aparece automaticamente nos meses certos.' },
    ],
  },
  {
    emoji: '📊',
    title: 'Renda e divisão',
    items: [
      { q: 'Por que o app pergunta minha renda?',
        a: 'Só é usado se vocês escolherem o método "proporcional à renda" de dividir os gastos do casal. Se escolherem 50/50, a renda não afeta nada — pode deixar em branco.' },
      { q: 'Qual a diferença entre 50/50 e proporcional?',
        a: '50/50: cada um arca metade dos gastos do casal, independente da renda. Proporcional: quem ganha mais arca uma fatia maior. Ex: A ganha R$ 6.000 e B ganha R$ 4.000 → A paga 60%, B paga 40% dos gastos compartilhados.' },
      { q: 'Como mudo o método de divisão?',
        a: 'Aba "Casal" → "Como vocês dividem" → escolhe e salva. A mudança vale a partir do próximo "fechar mês" (não retroage).' },
      { q: 'Posso mudar minha renda no meio do mês?',
        a: 'Pode, e o app usa o valor mais recente quando você fecha o mês. Se quiser ser justo, atualize ANTES de fechar.' },
      { q: 'O que acontece se um dos dois não tem renda fixa (freela, autônomo)?',
        a: 'Funciona normal. Você pode atualizar a renda todo mês com o valor que ganhou naquele mês. Ou usar o método 50/50 e deixar renda em branco.' },
    ],
  },
  {
    emoji: '📅',
    title: 'Fechando o mês',
    items: [
      { q: 'O que significa "fechar o mês"?',
        a: 'É consolidar tudo: somar quem pagou o quê, calcular quem deve pra quem, e marcar uma parcela a mais nos parcelamentos ativos. O mês fechado fica como histórico (read-only).' },
      { q: 'Quando devo fechar o mês?',
        a: 'Quando tiver certeza de que todos os gastos do mês foram registrados — normalmente no último dia ou começo do mês seguinte. Não tem pressa.' },
      { q: 'Como faço pra fechar?',
        a: 'Na aba "Mês", lá embaixo aparece um botão "Fechar mês". Toca, confirma, e pronto.' },
      { q: 'Posso reabrir um mês fechado?',
        a: 'Atualmente não. Por isso confira tudo antes. Se errou alguma coisa depois de fechar, a saída é registrar um ajuste avulso no mês atual.' },
      { q: 'Onde vejo o histórico de meses fechados?',
        a: 'Aba "Casal" → "Histórico de meses". Cada um tem um botão "Exportar PDF" se quiser guardar.' },
    ],
  },
  {
    emoji: '🔐',
    title: 'Editar gastos do parceiro (autorização)',
    items: [
      { q: 'Por que aparece "pedir editar" em vez de "editar" no gasto do meu parceiro?',
        a: 'Porque o gasto foi registrado por ele(a) e a edição precisa de aprovação. Isso evita que um mude dados do outro sem o outro saber.' },
      { q: 'Mas se for só corrigir uma vírgula na descrição, vai precisar aprovar?',
        a: 'Não. Mudanças pequenas (descrição, forma de pagamento, vencimento, e variações de valor menores que 10%) aplicam direto e ficam no histórico — com opção de desfazer em até 24h.' },
      { q: 'O que precisa de aprovação então?',
        a: 'Mudanças "sérias": categoria, escopo (de casal pra individual ou vice-versa), pessoa que pagou, mês, ou variação de valor de 10% ou mais. Também apagar.' },
      { q: 'Como vejo os pedidos pendentes?',
        a: 'Aba "Casal" — se tem pedido endereçado a você, aparece um card laranja no topo com "Aprovar" / "Negar". Você também vê um pontinho vermelho no ícone "Casal" no rodapé.' },
      { q: 'Quanto tempo o pedido fica aberto?',
        a: '7 dias. Depois disso, expira automaticamente e o gasto fica como estava antes.' },
      { q: 'Posso editar/apagar meus próprios gastos sem aprovação?',
        a: 'Pode. Os seus gastos são livres pra você. A regra só vale quando você quer mexer no que o outro registrou.' },
      { q: 'Tem como desfazer uma alteração "leve" depois?',
        a: 'Sim — dentro de 24h da mudança. O histórico de mudanças guarda o valor anterior pra restauração.' },
    ],
  },
  {
    emoji: '🎯',
    title: 'Metas',
    items: [
      { q: 'O que são metas?',
        a: 'São objetivos de poupança do casal: "Viagem pra Caldas Novas R$ 3.000", "Reserva de emergência R$ 10.000", etc. Você acompanha o quanto já guardou e quanto falta.' },
      { q: 'Como crio uma meta?',
        a: 'Aba "Metas" → botão "+". Preenche nome, valor que quer atingir e (opcional) valor inicial guardado.' },
      { q: 'Como adiciono dinheiro a uma meta?',
        a: 'Toca na meta na aba "Metas" e edita o "valor guardado". Você não precisa lançar como gasto separado — meta é um cofrinho à parte, só pra acompanhamento.' },
      { q: 'O que acontece quando bate 100%?',
        a: 'Aparece uma celebração visual e a meta fica como "concluída". Você pode arquivar ou usar como referência futura.' },
    ],
  },
  {
    emoji: '📈',
    title: 'Visão e relatórios',
    items: [
      { q: 'O que cada gráfico da Visão mostra?',
        a: 'Por categoria: pra onde foi o dinheiro (mercado, transporte, etc.). Por pessoa: quanto cada um gastou (individual + parte do casal). Por forma de pagamento: Pix, crédito, débito, dinheiro, etc.' },
      { q: 'Posso clicar nos gráficos pra detalhar?',
        a: 'Pode. Tocar em uma fatia ou item do gráfico abre a aba "Mês" já filtrada por aquela categoria/pessoa/forma.' },
      { q: 'Como filtro a lista da aba Mês?',
        a: 'No topo da aba tem: busca por descrição, dropdown de pessoa, dropdown de categoria, dropdown de forma de pagamento. Todos combinam.' },
      { q: 'Como exporto o relatório do mês em PDF?',
        a: 'Aba "Casal" → "Histórico de meses" → botão "Exportar PDF" do lado do mês desejado. Gera um relatório completo (gastos, divisão, balanceamento).' },
    ],
  },
  {
    emoji: '💳',
    title: 'Assinatura, trial e pagamento',
    items: [
      { q: 'Quanto custa o Pacto?',
        a: 'O valor está sempre atualizado na tela de assinatura — toca no banner amarelo/laranja no topo (durante o trial) ou em "Assinar" no PaywallScreen.' },
      { q: 'O que tá incluso no trial?',
        a: 'Tudo. Sem limite de gastos, sem feature bloqueada. É só pra você experimentar de verdade antes de decidir.' },
      { q: 'Como assino?',
        a: 'Banner amarelo no topo do app → botão "Assinar agora" → te leva pro checkout da Hotmart. Após o pagamento, libera automaticamente.' },
      { q: 'O que acontece se o trial acabar e eu não assinar?',
        a: 'O app continua acessível pra ver e exportar seus dados, mas adicionar/editar fica bloqueado. Você não perde nada — é só assinar depois pra reativar.' },
      { q: 'Posso cancelar a assinatura?',
        a: 'Pode, a qualquer momento, na Hotmart. Você mantém acesso até o fim do período já pago.' },
    ],
  },
  {
    emoji: '⚙️',
    title: 'Sincronização, instalação e privacidade',
    items: [
      { q: 'Onde meus dados ficam guardados?',
        a: 'Em nossos servidores (criptografados). Cada casal tem um espaço privado, protegido por permissões a nível de banco — ninguém de fora consegue ver. Você também tem uma cópia local no aparelho, pra funcionar offline.' },
      { q: 'Funciona offline?',
        a: 'Funciona. Você consegue adicionar, editar e ver tudo sem internet. Quando voltar a conectar, sincroniza com o outro celular automaticamente.' },
      { q: 'Como instalo como aplicativo no celular?',
        a: 'No Chrome (Android) ou Safari (iPhone), abre o site, e o próprio navegador sugere "Adicionar à tela inicial". Depois de instalado, abre como qualquer outro app (sem barra de navegador).' },
      { q: 'As mudanças aparecem na hora pro meu parceiro(a)?',
        a: 'Aparecem. A sincronização é em tempo real — assim que você salva um gasto, ele vê no celular dele em poucos segundos.' },
      { q: 'Se eu trocar de celular, os dados vão junto?',
        a: 'Vão. Você faz login com o mesmo e-mail no novo aparelho e tudo aparece. Os dados não estão "no celular" — estão na sua conta.' },
      { q: 'Posso exportar tudo se quiser sair?',
        a: 'Pode. Cada mês fechado tem botão "Exportar PDF". A qualquer momento, você baixa o histórico que quiser.' },
      { q: 'E se a gente terminar?',
        a: 'Cada um pode exportar o histórico em PDF e zerar o app, sem custo. Esperamos que não precise.' },
    ],
  },
]

// ============ PDF SETUP ============
const PAGE_W = 210   // A4 mm
const PAGE_H = 297
const MARGIN_X = 20
const MARGIN_Y = 25
const CONTENT_W = PAGE_W - MARGIN_X * 2

const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })

let pageNum = 0
let toc = []

function setColor(rgb, type = 'text') {
  if (type === 'text') doc.setTextColor(rgb[0], rgb[1], rgb[2])
  else if (type === 'fill') doc.setFillColor(rgb[0], rgb[1], rgb[2])
  else if (type === 'draw') doc.setDrawColor(rgb[0], rgb[1], rgb[2])
}

function drawFooter() {
  setColor(COLORS.textMuted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Pacto — Manual do Usuário', MARGIN_X, PAGE_H - 12)
  doc.text(`${pageNum}`, PAGE_W - MARGIN_X, PAGE_H - 12, { align: 'right' })
  doc.text('pacto-beta.vercel.app', PAGE_W / 2, PAGE_H - 12, { align: 'center' })
}

function newPage() {
  if (pageNum > 0) drawFooter()
  doc.addPage()
  pageNum += 1
}

// ============ PAGE 1: CAPA ============
pageNum = 1
setColor(COLORS.navy, 'fill')
doc.rect(0, 0, PAGE_W, PAGE_H, 'F')

// Logo — imagem real (com fallback pra texto)
if (logoDataUrl) {
  const logoSize = 70 // mm
  doc.addImage(logoDataUrl, 'PNG', (PAGE_W - logoSize) / 2, 50, logoSize, logoSize, undefined, 'FAST')
} else {
  setColor(COLORS.blue)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(56)
  doc.text('Pacto', PAGE_W / 2, 90, { align: 'center' })
}

setColor(COLORS.white)
doc.setFont('helvetica', 'normal')
doc.setFontSize(14)
doc.text('Uma casa merece paz.', PAGE_W / 2, 135, { align: 'center' })

// Decoração — linha
setColor(COLORS.blue, 'draw')
doc.setLineWidth(0.5)
doc.line(PAGE_W / 2 - 30, 145, PAGE_W / 2 + 30, 145)

// Título do manual
setColor(COLORS.white)
doc.setFont('helvetica', 'bold')
doc.setFontSize(28)
doc.text('Manual do Usuário', PAGE_W / 2, 170, { align: 'center' })

doc.setFont('helvetica', 'normal')
doc.setFontSize(13)
setColor([180, 190, 220])
doc.text('Tudo o que você precisa saber pra organizar', PAGE_W / 2, 185, { align: 'center' })
doc.text('as finanças do casal sem briga.', PAGE_W / 2, 193, { align: 'center' })

// Footer da capa
setColor(COLORS.blue)
doc.setFontSize(10)
doc.setFont('helvetica', 'bold')
doc.text('pacto-beta.vercel.app', PAGE_W / 2, PAGE_H - 30, { align: 'center' })

setColor([130, 140, 170])
doc.setFont('helvetica', 'normal')
doc.setFontSize(9)
doc.text(`Edição ${new Date().toISOString().slice(0, 10)} · v1.0`, PAGE_W / 2, PAGE_H - 22, { align: 'center' })

// ============ PAGE 2: BEM-VINDO + COMO ACESSAR ============
newPage()
let y = MARGIN_Y

setColor(COLORS.textHeading)
doc.setFont('helvetica', 'bold')
doc.setFontSize(22)
doc.text('Bem-vindo ao Pacto.', MARGIN_X, y)
y += 12

setColor(COLORS.text)
doc.setFont('helvetica', 'normal')
doc.setFontSize(11)
const welcomeText = `Parabéns pela decisão de organizar a vida financeira do casal de um jeito mais leve.

O Pacto foi feito pra resolver o problema mais comum de quem mora junto: a briga sobre quem paga o quê. Em vez de planilha, conversa difícil ou abrir mão da divisão justa, vocês têm um app que faz a conta por você — e mostra, todo mês, exatamente quem deve quanto pra quem (ou se ninguém deve nada).

Este manual cobre tudo o que você precisa saber pra começar e tirar o máximo do app. Pode ler do começo ao fim, ou pular direto pra seção que te interessa pelo sumário da próxima página.`

const wrapped = doc.splitTextToSize(welcomeText, CONTENT_W)
doc.text(wrapped, MARGIN_X, y)
y += wrapped.length * 5.5 + 8

// Bloco "Como acessar"
setColor(COLORS.bgLight, 'fill')
doc.roundedRect(MARGIN_X, y, CONTENT_W, 75, 3, 3, 'F')
y += 8

setColor(COLORS.navy)
doc.setFont('helvetica', 'bold')
doc.setFontSize(14)
doc.text('Como acessar', MARGIN_X + 8, y)
y += 8

setColor(COLORS.text)
doc.setFont('helvetica', 'normal')
doc.setFontSize(10)

const steps = [
  ['1.', 'Abra o site no celular ou computador:', 'pacto-beta.vercel.app'],
  ['2.', 'Faça login com seu e-mail.', ''],
  ['3.', 'Crie um pacto novo (ou entre num existente com o código).', ''],
  ['4.', 'Compartilhe o código com seu(sua) parceiro(a).', ''],
  ['5.', 'Comecem a registrar os gastos. Pronto.', ''],
]

for (const [num, line, link] of steps) {
  setColor(COLORS.blue)
  doc.setFont('helvetica', 'bold')
  doc.text(num, MARGIN_X + 8, y)
  setColor(COLORS.text)
  doc.setFont('helvetica', 'normal')
  doc.text(line, MARGIN_X + 16, y)
  if (link) {
    setColor(COLORS.blue)
    doc.setFont('helvetica', 'bold')
    doc.text(link, MARGIN_X + 16 + doc.getTextWidth(line) + 2, y)
  }
  y += 7
}

y += 8

setColor(COLORS.textHeading)
doc.setFont('helvetica', 'bold')
doc.setFontSize(13)
doc.text('💡 Dica de instalação', MARGIN_X, y)
y += 6

setColor(COLORS.text)
doc.setFont('helvetica', 'normal')
doc.setFontSize(10)
const installTip = `No celular, depois de abrir o site, seu navegador (Chrome no Android ou Safari no iPhone) vai sugerir "Adicionar à tela inicial". Aceite. O Pacto vira um ícone como qualquer outro app, abre em tela cheia, e funciona offline.`
const tipWrapped = doc.splitTextToSize(installTip, CONTENT_W)
doc.text(tipWrapped, MARGIN_X, y)
y += tipWrapped.length * 5

// ============ PAGE 3: SUMÁRIO ============
newPage()
y = MARGIN_Y

setColor(COLORS.textHeading)
doc.setFont('helvetica', 'bold')
doc.setFontSize(22)
doc.text('Sumário', MARGIN_X, y)
y += 14

// Será preenchido com TOC após gerar conteúdo (reservar página agora)
const tocStartY = y
const tocPageNum = pageNum

// Pula pra primeiro conteúdo
newPage()

// ============ PÁGINAS DE CONTEÚDO (10 seções) ============
let firstContentPage = pageNum

function renderSection(section, idx) {
  // Header da seção
  if (y > PAGE_H - 60) {
    newPage()
    y = MARGIN_Y
  }

  toc.push({ title: section.title, emoji: section.emoji, page: pageNum, count: section.items.length })

  // Section header banner
  setColor(COLORS.navy, 'fill')
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 14, 2, 2, 'F')
  setColor(COLORS.white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`${section.emoji}  ${idx + 1}. ${section.title}`, MARGIN_X + 4, y + 9)
  y += 22

  // Items
  for (const item of section.items) {
    // Estimate space needed (rough)
    const qLines = doc.splitTextToSize(item.q, CONTENT_W - 10).length
    const aLines = doc.splitTextToSize(item.a, CONTENT_W - 10).length
    const needed = qLines * 5.5 + aLines * 5 + 12

    if (y + needed > PAGE_H - 25) {
      newPage()
      y = MARGIN_Y
    }

    // Pergunta
    setColor(COLORS.blue)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    const qWrapped = doc.splitTextToSize(item.q, CONTENT_W - 6)
    doc.text(qWrapped, MARGIN_X + 4, y)
    y += qWrapped.length * 5.5 + 1

    // Resposta
    setColor(COLORS.text)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const aWrapped = doc.splitTextToSize(item.a, CONTENT_W - 6)
    doc.text(aWrapped, MARGIN_X + 4, y)
    y += aWrapped.length * 5 + 7
  }

  y += 4
}

y = MARGIN_Y
FAQ.forEach((section, idx) => renderSection(section, idx))

// ============ PÁGINA FINAL: SUPORTE ============
if (y > PAGE_H - 80) {
  newPage()
  y = MARGIN_Y
} else {
  y += 12
}

setColor(COLORS.navy, 'fill')
doc.roundedRect(MARGIN_X, y, CONTENT_W, 60, 3, 3, 'F')

setColor(COLORS.white)
doc.setFont('helvetica', 'bold')
doc.setFontSize(16)
doc.text('Precisa de ajuda?', MARGIN_X + 10, y + 14)

doc.setFont('helvetica', 'normal')
doc.setFontSize(11)
doc.text('Se tiver qualquer dúvida que este manual não respondeu, fala com a gente:', MARGIN_X + 10, y + 24)

setColor([180, 200, 240])
doc.setFontSize(10)
doc.text('• Acesse o app: pacto-beta.vercel.app', MARGIN_X + 10, y + 35)
doc.text('• Central de ajuda dentro do app: aba Casal → Centro de ajuda', MARGIN_X + 10, y + 42)
doc.text('• Suporte direto: pelo canal de atendimento da Hotmart', MARGIN_X + 10, y + 49)

// Footer da última página
drawFooter()

// ============ VOLTA E PREENCHE O SUMÁRIO ============
doc.setPage(tocPageNum)
y = tocStartY

setColor(COLORS.text)
doc.setFontSize(11)
doc.setFont('helvetica', 'normal')

for (const entry of toc) {
  // emoji + título
  setColor(COLORS.textHeading)
  doc.setFont('helvetica', 'bold')
  doc.text(`${entry.emoji}  ${entry.title}`, MARGIN_X, y)

  // dots e página
  setColor(COLORS.textMuted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(`${entry.count} ${entry.count === 1 ? 'item' : 'itens'}`, MARGIN_X + 110, y)

  setColor(COLORS.blue)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`${entry.page}`, PAGE_W - MARGIN_X, y, { align: 'right' })

  y += 8

  setColor(COLORS.separator, 'draw')
  doc.setLineWidth(0.2)
  doc.line(MARGIN_X, y - 4, PAGE_W - MARGIN_X, y - 4)
}

// Footer também na página do sumário
drawFooter()

// ============ SALVAR ============
const outPath = '/Volumes/Projetos/TESTE DE IA/casal-no-azul/docs/marketing/Pacto-Manual-do-Usuario.pdf'
mkdirSync(dirname(outPath), { recursive: true })
const pdfBytes = doc.output('arraybuffer')
writeFileSync(outPath, Buffer.from(pdfBytes))

console.log(`✓ PDF gerado: ${outPath}`)
console.log(`  ${pageNum} páginas, ${FAQ.length} seções, ${FAQ.reduce((acc, s) => acc + s.items.length, 0)} perguntas`)
