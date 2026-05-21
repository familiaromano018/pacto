export interface FAQItem {
  id: string
  question: string
  answer: string
}

export interface FAQSection {
  id: string
  title: string
  emoji: string
  items: FAQItem[]
}

export const faqContent: FAQSection[] = [
  {
    id: 'primeiros-passos',
    title: 'Primeiros passos',
    emoji: '📌',
    items: [
      {
        id: 'criar-conta',
        question: 'Como crio uma conta no Pacto?',
        answer: 'Você abre o app no celular ou navegador, faz login com e-mail e cria um "pacto" novo. Aí gera um código que você compartilha com seu(sua) parceiro(a).',
      },
      {
        id: 'convidar-parceiro',
        question: 'Como convido meu parceiro(a)?',
        answer: 'Na aba "Casal", você encontra seu código (formato PACTO-XXXX). Toca em "Compartilhar" e envia pelo WhatsApp ou copia direto. Seu parceiro abre o app, escolhe "Tenho um convite" e digita o código.',
      },
      {
        id: 'usar-sozinho',
        question: 'E se eu quiser usar sozinho(a) por enquanto?',
        answer: 'Pode. Quando o(a) parceiro(a) entrar, ele(a) verá todos os gastos que você já registrou. Você pode convidar a qualquer momento na aba "Casal" → "Convite".',
      },
      {
        id: 'trocar-parceiro',
        question: 'Posso trocar de parceiro(a) depois?',
        answer: 'Atualmente não. Cada pacto é fixo entre as duas pessoas que se conectaram. Se precisar refazer, é melhor criar uma conta nova (e exportar o histórico em PDF antes).',
      },
      {
        id: 'precisa-pagar',
        question: 'Tenho que pagar pra usar?',
        answer: 'O Pacto tem um período grátis de teste para você experimentar tudo. Depois disso, vira assinatura mensal. Você vê os dias restantes no topo do app.',
      },
      {
        id: 'celular-computador',
        question: 'Funciona no celular e no computador?',
        answer: 'Funciona em qualquer lugar com navegador. No celular, dá pra "instalar" como um app (sem precisar da loja). No computador, abre normal pelo navegador. Os dados sincronizam entre os dispositivos em tempo real.',
      },
    ],
  },
  {
    id: 'como-funciona',
    title: 'Como funciona o app',
    emoji: '🧭',
    items: [
      {
        id: 'o-que-e-pacto',
        question: 'O que é o "Pacto"?',
        answer: 'É o nome do app — e também o "acordo" financeiro entre vocês dois. Cada casal tem seu pacto, seus dados, suas regras de divisão. Ninguém de fora vê.',
      },
      {
        id: 'cinco-abas',
        question: 'Quais são as 5 abas do app?',
        answer: 'Visão: gráficos do mês (gastos por categoria, por pessoa, por forma de pagamento). Mês: lista detalhada de tudo o que rolou no mês. Recorrentes: custos fixos (aluguel, streaming) e parcelados (TV, geladeira). Metas: o que vocês estão guardando dinheiro pra comprar/fazer. Casal: configurações, convite, histórico e ajustes.',
      },
      {
        id: 'pessoa-a-b',
        question: 'O que é "Pessoa A" e "Pessoa B"?',
        answer: 'São os dois membros do pacto — quem criou (A) e quem entrou pelo convite (B). Você pode renomear ambos com seus nomes reais na aba "Casal". As cores ajudam a identificar: vermelho pra A, verde-água pra B.',
      },
      {
        id: 'cores',
        question: 'Pra que serve cada cor no app?',
        answer: 'Vermelho: pessoa A. Verde-água: pessoa B. Azul: gastos do casal (compartilhados). Roxo: custos fixos. Laranja: parcelamentos.',
      },
      {
        id: 'botao-mais',
        question: 'Por que tem um botão "+" flutuante no meio?',
        answer: 'É pra adicionar um novo gasto rapidamente, de qualquer aba. Quando o mês está sem nenhum gasto, ele "pulsa" pra te lembrar.',
      },
    ],
  },
  {
    id: 'gastos',
    title: 'Adicionando gastos',
    emoji: '💰',
    items: [
      {
        id: 'avulso-fixo-parcelado',
        question: 'Qual a diferença entre avulso, fixo e parcelado?',
        answer: 'Avulso: gasto único de um mês específico (ex: jantar de domingo, R$ 80). Fixo: aparece todo mês automaticamente (ex: Spotify, aluguel). Você pode pausar a qualquer momento. Parcelado: dividido em N vezes (ex: TV em 12x). Cada parcela aparece todo mês até completar.',
      },
      {
        id: 'como-adicionar',
        question: 'Como adiciono um gasto?',
        answer: 'Toca no botão "+" flutuante. Preenche descrição, valor, escolhe o tipo, a categoria, quem pagou e o escopo (individual ou do casal). Salva.',
      },
      {
        id: 'escopo',
        question: 'O que é "escopo"?',
        answer: 'O escopo diz se o gasto é DO CASAL (vocês dividem) ou PESSOAL de um de vocês (só conta no individual de quem comprou). Ex: mercado é casal; corte de cabelo é pessoal.',
      },
      {
        id: 'pago-por',
        question: 'O que é "pago por"?',
        answer: 'Quem efetivamente desembolsou o dinheiro. Mesmo gastos do casal precisam dizer quem pagou — é assim que o app sabe quem está "credor" ou "devedor" no fim do mês.',
      },
      {
        id: 'pago-junto',
        question: 'E se a gente pagou junto, partido na hora?',
        answer: 'Coloca como pago por uma pessoa (a que pagou a parte maior) e na descrição menciona o split. Ou faz dois lançamentos — cada um com a parte que pagou. O total fica certo nos dois casos.',
      },
      {
        id: 'forma-pagamento',
        question: 'Pra que serve "Forma de pagamento"?',
        answer: 'É opcional, mas ajuda a entender pra onde o dinheiro vai. Aparece no relatório "Visão → Por forma de pagamento". Útil pra ver, por exemplo, quanto está indo pro crédito ou Pix.',
      },
      {
        id: 'vencimento',
        question: 'Como funciona o vencimento (dueDay) dos fixos e parcelados?',
        answer: 'É o dia do mês em que esse gasto cai. Serve só pra organizar (não cobra ninguém). Se o mês não tem aquele dia (ex: dia 31 em fevereiro), o app ajusta automaticamente.',
      },
      {
        id: 'frequencia',
        question: 'Posso definir um custo fixo que aparece a cada 6 meses (e não todo mês)?',
        answer: 'Pode. Na hora de criar/editar, escolhe a frequência: mensal, bimestral, trimestral, semestral ou anual. Ele aparece automaticamente nos meses certos.',
      },
    ],
  },
  {
    id: 'renda-divisao',
    title: 'Renda e divisão',
    emoji: '📊',
    items: [
      {
        id: 'porque-renda',
        question: 'Por que o app pergunta minha renda?',
        answer: 'Só é usado se vocês escolherem o método "proporcional à renda" de dividir os gastos do casal. Se escolherem 50/50, a renda não afeta nada — pode deixar em branco.',
      },
      {
        id: 'metodos-divisao',
        question: 'Qual a diferença entre 50/50 e proporcional?',
        answer: '50/50: cada um arca metade dos gastos do casal, independente da renda. Proporcional: quem ganha mais arca uma fatia maior. Ex: A ganha R$ 6.000 e B ganha R$ 4.000 → A paga 60%, B paga 40% dos gastos compartilhados.',
      },
      {
        id: 'mudar-metodo',
        question: 'Como mudo o método de divisão?',
        answer: 'Aba "Casal" → "Como vocês dividem" → escolhe e salva. A mudança vale a partir do próximo "fechar mês" (não retroage).',
      },
      {
        id: 'mudar-renda',
        question: 'Posso mudar minha renda no meio do mês?',
        answer: 'Pode, e o app usa o valor mais recente quando você fecha o mês. Se quiser ser justo, atualize ANTES de fechar.',
      },
      {
        id: 'sem-renda-fixa',
        question: 'O que acontece se um dos dois não tem renda fixa (freela, autônomo)?',
        answer: 'Funciona normal. Você pode atualizar a renda todo mês com o valor que ganhou naquele mês. Ou usar o método 50/50 e deixar renda em branco.',
      },
    ],
  },
  {
    id: 'fechar-mes',
    title: 'Fechando o mês',
    emoji: '📅',
    items: [
      {
        id: 'o-que-fechar',
        question: 'O que significa "fechar o mês"?',
        answer: 'É consolidar tudo: somar quem pagou o quê, calcular quem deve pra quem, e marcar uma parcela a mais nos parcelamentos ativos. O mês fechado fica como histórico (read-only).',
      },
      {
        id: 'quando-fechar',
        question: 'Quando devo fechar o mês?',
        answer: 'Quando tiver certeza de que todos os gastos do mês foram registrados — normalmente no último dia ou começo do mês seguinte. Não tem pressa.',
      },
      {
        id: 'como-fechar',
        question: 'Como faço pra fechar?',
        answer: 'Na aba "Mês", lá embaixo aparece um botão "Fechar mês". Toca, confirma, e pronto.',
      },
      {
        id: 'reabrir',
        question: 'Posso reabrir um mês fechado?',
        answer: 'Atualmente não. Por isso confira tudo antes. Se errou alguma coisa depois de fechar, a saída é registrar um ajuste avulso no mês atual.',
      },
      {
        id: 'historico-meses',
        question: 'Onde vejo o histórico de meses fechados?',
        answer: 'Aba "Casal" → "Histórico de meses". Cada um tem um botão "Exportar PDF" se quiser guardar.',
      },
    ],
  },
  {
    id: 'autorizacao',
    title: 'Editar gastos do parceiro (autorização)',
    emoji: '🔐',
    items: [
      {
        id: 'pedir-editar',
        question: 'Por que aparece "pedir editar" em vez de "editar" no gasto do meu parceiro?',
        answer: 'Porque o gasto foi registrado por ele(a) e a edição precisa de aprovação. Isso evita que um mude dados do outro sem o outro saber.',
      },
      {
        id: 'mudanca-pequena',
        question: 'Mas se for só corrigir uma vírgula na descrição, vai precisar aprovar?',
        answer: 'Não. Mudanças pequenas (descrição, forma de pagamento, vencimento, e variações de valor menores que 10%) aplicam direto e ficam no histórico — com opção de desfazer em até 24h.',
      },
      {
        id: 'precisa-aprovacao',
        question: 'O que precisa de aprovação então?',
        answer: 'Mudanças "sérias": categoria, escopo (de casal pra individual ou vice-versa), pessoa que pagou, mês, ou variação de valor de 10% ou mais. Também apagar.',
      },
      {
        id: 'pedidos-pendentes',
        question: 'Como vejo os pedidos pendentes?',
        answer: 'Aba "Casal" — se tem pedido endereçado a você, aparece um card laranja no topo com "Aprovar" / "Negar". Você também vê um pontinho vermelho no ícone "Casal" no rodapé.',
      },
      {
        id: 'tempo-pedido',
        question: 'Quanto tempo o pedido fica aberto?',
        answer: '7 dias. Depois disso, expira automaticamente e o gasto fica como estava antes.',
      },
      {
        id: 'meus-gastos',
        question: 'Posso editar/apagar meus próprios gastos sem aprovação?',
        answer: 'Pode. Os seus gastos são livres pra você. A regra só vale quando você quer mexer no que o outro registrou.',
      },
      {
        id: 'desfazer-leve',
        question: 'Tem como desfazer uma alteração "leve" depois?',
        answer: 'Sim — dentro de 24h da mudança. O histórico de mudanças guarda o valor anterior pra restauração.',
      },
    ],
  },
  {
    id: 'metas',
    title: 'Metas',
    emoji: '🎯',
    items: [
      {
        id: 'o-que-metas',
        question: 'O que são metas?',
        answer: 'São objetivos de poupança do casal: "Viagem pra Caldas Novas R$ 3.000", "Reserva de emergência R$ 10.000", etc. Você acompanha o quanto já guardou e quanto falta.',
      },
      {
        id: 'criar-meta',
        question: 'Como crio uma meta?',
        answer: 'Aba "Metas" → botão "+". Preenche nome, valor que quer atingir e (opcional) valor inicial guardado.',
      },
      {
        id: 'adicionar-dinheiro-meta',
        question: 'Como adiciono dinheiro a uma meta?',
        answer: 'Toca na meta na aba "Metas" e edita o "valor guardado". Você não precisa lançar como gasto separado — meta é um cofrinho à parte, só pra acompanhamento.',
      },
      {
        id: 'meta-completa',
        question: 'O que acontece quando bate 100%?',
        answer: 'Aparece uma celebração visual e a meta fica como "concluída". Você pode arquivar ou usar como referência futura.',
      },
    ],
  },
  {
    id: 'visao',
    title: 'Visão e relatórios',
    emoji: '📈',
    items: [
      {
        id: 'graficos-visao',
        question: 'O que cada gráfico da Visão mostra?',
        answer: 'Por categoria: pra onde foi o dinheiro (mercado, transporte, etc.). Por pessoa: quanto cada um gastou (individual + parte do casal). Por forma de pagamento: Pix, crédito, débito, dinheiro, etc.',
      },
      {
        id: 'clicar-graficos',
        question: 'Posso clicar nos gráficos pra detalhar?',
        answer: 'Pode. Tocar em uma fatia ou item do gráfico abre a aba "Mês" já filtrada por aquela categoria/pessoa/forma.',
      },
      {
        id: 'filtrar-mes',
        question: 'Como filtro a lista da aba Mês?',
        answer: 'No topo da aba tem: busca por descrição, dropdown de pessoa, dropdown de categoria, dropdown de forma de pagamento. Todos combinam.',
      },
      {
        id: 'exportar-pdf',
        question: 'Como exporto o relatório do mês em PDF?',
        answer: 'Aba "Casal" → "Histórico de meses" → botão "Exportar PDF" do lado do mês desejado. Gera um relatório completo (gastos, divisão, balanceamento).',
      },
    ],
  },
  {
    id: 'assinatura',
    title: 'Assinatura, trial e pagamento',
    emoji: '💳',
    items: [
      {
        id: 'preco',
        question: 'Quanto custa o Pacto?',
        answer: 'O valor está sempre atualizado na tela de assinatura — toca no banner amarelo/laranja no topo (durante o trial) ou em "Assinar" no PaywallScreen.',
      },
      {
        id: 'trial-incluso',
        question: 'O que tá incluso no trial?',
        answer: 'Tudo. Sem limite de gastos, sem feature bloqueada. É só pra você experimentar de verdade antes de decidir.',
      },
      {
        id: 'como-assinar',
        question: 'Como assino?',
        answer: 'Banner amarelo no topo do app → botão "Assinar agora" → te leva pro checkout da Hotmart. Após o pagamento, libera automaticamente.',
      },
      {
        id: 'trial-acaba',
        question: 'O que acontece se o trial acabar e eu não assinar?',
        answer: 'O app continua acessível pra ver e exportar seus dados, mas adicionar/editar fica bloqueado. Você não perde nada — é só assinar depois pra reativar.',
      },
      {
        id: 'cancelar',
        question: 'Posso cancelar a assinatura?',
        answer: 'Pode, a qualquer momento, na Hotmart. Você mantém acesso até o fim do período já pago.',
      },
    ],
  },
  {
    id: 'sync-privacidade',
    title: 'Sincronização, instalação e privacidade',
    emoji: '⚙️',
    items: [
      {
        id: 'onde-dados',
        question: 'Onde meus dados ficam guardados?',
        answer: 'Em nossos servidores (criptografados). Cada casal tem um espaço privado, protegido por permissões a nível de banco — ninguém de fora consegue ver. Você também tem uma cópia local no aparelho, pra funcionar offline.',
      },
      {
        id: 'offline',
        question: 'Funciona offline?',
        answer: 'Funciona. Você consegue adicionar, editar e ver tudo sem internet. Quando voltar a conectar, sincroniza com o outro celular automaticamente.',
      },
      {
        id: 'instalar-app',
        question: 'Como instalo como aplicativo no celular?',
        answer: 'No Chrome (Android) ou Safari (iPhone), abre o site, e o próprio navegador sugere "Adicionar à tela inicial". Depois de instalado, abre como qualquer outro app (sem barra de navegador).',
      },
      {
        id: 'tempo-real',
        question: 'As mudanças aparecem na hora pro meu parceiro(a)?',
        answer: 'Aparecem. A sincronização é em tempo real — assim que você salva um gasto, ele vê no celular dele em poucos segundos.',
      },
      {
        id: 'trocar-celular',
        question: 'Se eu trocar de celular, os dados vão junto?',
        answer: 'Vão. Você faz login com o mesmo e-mail no novo aparelho e tudo aparece. Os dados não estão "no celular" — estão na sua conta.',
      },
      {
        id: 'exportar-tudo',
        question: 'Posso exportar tudo se quiser sair?',
        answer: 'Pode. Cada mês fechado tem botão "Exportar PDF". A qualquer momento, você baixa o histórico que quiser.',
      },
      {
        id: 'terminar',
        question: 'E se a gente terminar?',
        answer: 'Cada um pode exportar o histórico em PDF e zerar o app, sem custo. Esperamos que não precise.',
      },
    ],
  },
]
