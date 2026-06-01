# Centro de Ajuda (/ajuda) — Design Spec

**Data:** 2026-05-20
**Status:** Design — pronto pra implementação
**Plan:** `docs/superpowers/plans/2026-05-20-faq-ajuda.md`

## Problema

Hoje o app Pacto não tem ajuda contextual interna. Usuários precisam descobrir sozinhos:
- O que é "scope" (individual vs casal)
- A diferença entre gasto avulso, fixo e parcelado
- Como funciona o fechar mês
- Por que aparece "pedir editar" em vez de "editar" no gasto do parceiro
- O que significa o badge laranja na aba Casal

Isso causa fricção no onboarding e churn. A landing page já tem um FAQ de marketing (6 perguntas), mas é raso e está focado em vendas — não responde dúvidas operacionais de quem já está usando.

## Solução

Página dedicada `/ajuda` (rota Next.js App Router), acessível via:
1. Link "Ajuda" no topo do TabConfig
2. Botão "?" no header do app (canto direito, ao lado da engrenagem)
3. CTA direto da landing page ("Ver guia completo →")

Estrutura: ~10 seções temáticas em accordion, cada uma com 4-10 perguntas. Busca por texto (cliente-side). Mobile-first, sem dependências externas.

**Bônus arquitetural:** o conteúdo (perguntas + respostas) vive em `src/lib/faq/content.ts` como um array tipado. Isso permite:
- Reuso direto pelo gerador de PDF Hotmart (próxima entrega) — mesma fonte de verdade
- Search/filter trivial
- Atualizações sem mexer no JSX

## Não-objetivos (V1)

- Não tem vídeos embedded (link externo pra YouTube se necessário)
- Não tem chat de suporte
- Não tem busca server-side (tudo client-side, ~50 perguntas)
- Não tem deep-linking pra abrir o app em um estado específico (V2)

---

## Rota e arquitetura

```
src/app/ajuda/
├── page.tsx              # Page Server Component (metadata + render)
└── HelpClient.tsx        # Client component com busca + accordion

src/lib/faq/
└── content.ts            # Conteúdo (sections + items) tipado
```

**Routing:**
- `/ajuda` — página principal
- `/ajuda#secao-id` — scroll para seção específica (deep link via hash)
- `/ajuda?q=trial` — busca pre-filtrada via query param (V1.1, opcional)

**SEO:** metadata + structured data `FAQPage` (JSON-LD) — Google rich result pra perguntas comuns.

---

## Visual design

```
┌─────────────────────────────────────────────────┐
│ ← Voltar                                        │  ← Header fixo
│                                                 │
│  Central de Ajuda                               │
│  Tudo o que você precisa saber sobre o Pacto.   │
│                                                 │
│  [🔍 Buscar... (ex: "fechar o mês")          ] │
│                                                 │
├─────────────────────────────────────────────────┤
│ 📌 PRIMEIROS PASSOS                             │  ← Section header
├─────────────────────────────────────────────────┤
│ ▸ Como crio uma conta no Pacto?                 │
│ ▸ Como convido meu parceiro(a)?                 │
│ ▾ E se eu quiser usar sozinho(a)?               │  ← Aberto
│   Pode! Quando seu parceiro(a) entrar, ele(a)   │
│   verá tudo o que você já registrou. O conv-    │
│   vite pode ser feito a qualquer momento na     │
│   aba "Casal".                                  │
│ ▸ Posso trocar de parceiro(a) depois?           │
├─────────────────────────────────────────────────┤
│ 💰 GASTOS                                       │
├─────────────────────────────────────────────────┤
│ ▸ Qual a diferença entre avulso, fixo e parc..  │
│ ...                                             │
└─────────────────────────────────────────────────┘
```

**Estilos:**
- Background: `tokens.color.bg_app` (mesmo do app, dark mode automático)
- Section header: kicker uppercase + ícone emoji, separador `border_default`
- Item: `<details><summary>` nativo, sem JS extra (acessível por padrão)
- Busca: filtragem case-insensitive em pergunta + resposta; destaca matches; mostra "Nenhum resultado para X. [Limpar busca]"
- Footer: "Ainda tem dúvida? Fala com a gente: [WhatsApp link]" (placeholder, pode ficar TODO se não tiver canal de suporte ainda)

**Mobile:** padding lateral 16px, font-size 14-15px base, touch targets ≥44px, accordion fica de coluna única.

---

## Conteúdo — Seções e perguntas

Total: **10 seções, 56 perguntas.**

### 1. 📌 Primeiros passos (6)

**1.1 Como crio uma conta no Pacto?**
> Você baixa o app (ou abre no celular pelo navegador — funciona como um app), faz login com e-mail e cria um "pacto" novo. Aí gera um código que você compartilha com seu(sua) parceiro(a).

**1.2 Como convido meu parceiro(a)?**
> Na aba "Casal", você encontra seu código (formato PACTO-XXXX). Toca em "Compartilhar" e envia pelo WhatsApp ou copia direto. Seu parceiro abre o app, escolhe "Tenho um convite" e digita o código.

**1.3 E se eu quiser usar sozinho(a) por enquanto?**
> Pode. Quando o(a) parceiro(a) entrar, ele(a) verá todos os gastos que você já registrou. Você pode convidar a qualquer momento na aba "Casal" → "Convite".

**1.4 Posso trocar de parceiro(a) depois?**
> Atualmente não. Cada pacto é fixo entre as duas pessoas que se conectaram. Se precisar refazer, é melhor criar uma conta nova (e exportar o histórico do antigo em PDF antes).

**1.5 Tenho que pagar pra usar?**
> O Pacto tem um período grátis de teste (trial) para você experimentar tudo. Depois disso, vira assinatura mensal. Você vê os dias restantes no topo do app.

**1.6 Funciona no celular e no computador?**
> Funciona em qualquer lugar com navegador. No celular, dá pra "instalar" como um app (sem precisar da loja). No computador, abre normal pelo navegador. Os dados sincronizam entre os dispositivos em tempo real.

### 2. 🧭 Como funciona o app (5)

**2.1 O que é o "Pacto"?**
> É o nome do app — e também o "acordo" financeiro entre vocês dois. Cada casal tem seu pacto, seus dados, suas regras de divisão. Ninguém de fora vê.

**2.2 Quais são as 5 abas do app?**
> - **Visão**: gráficos do mês (gastos por categoria, por pessoa, por forma de pagamento)
> - **Mês**: lista detalhada de tudo o que rolou no mês
> - **Recorrentes**: seus custos fixos (aluguel, streaming) e parcelados (TV, geladeira)
> - **Metas**: o que vocês estão guardando dinheiro pra comprar/fazer
> - **Casal**: configurações, convite, histórico e ajustes

**2.3 O que é "Pessoa A" e "Pessoa B"?**
> São os dois membros do pacto — quem criou (A) e quem entrou pelo convite (B). Você pode renomear ambos com seus nomes reais na aba "Casal" (ex: Léo e Bia). As cores ajudam a identificar: vermelho pra A, verde-água pra B.

**2.4 Pra que serve cada cor no app?**
> - **Vermelho**: pessoa A
> - **Verde-água**: pessoa B
> - **Azul**: gastos do casal (compartilhados)
> - **Roxo**: custos fixos
> - **Laranja**: parcelamentos

**2.5 Por que tem um botão "+" flutuante no meio?**
> É pra adicionar um novo gasto rapidamente, de qualquer aba. Quando o mês está sem nenhum gasto, ele "pulsa" pra te lembrar.

### 3. 💰 Adicionando gastos (8)

**3.1 Qual a diferença entre avulso, fixo e parcelado?**
> - **Avulso**: gasto único de um mês específico (ex: jantar de domingo, R$ 80).
> - **Fixo**: aparece todo mês automaticamente (ex: Spotify, aluguel). Você pode pausar a qualquer momento.
> - **Parcelado**: dividido em N vezes (ex: TV em 12x). Cada parcela aparece todo mês até completar.

**3.2 Como adiciono um gasto?**
> Toca no botão "+" flutuante. Preenche descrição, valor, escolhe o tipo, a categoria, quem pagou e o escopo (individual ou do casal). Salva.

**3.3 O que é "escopo"?**
> O escopo diz se o gasto é **do casal** (vocês dividem) ou **pessoal** de um de vocês (só conta no individual de quem comprou). Ex: mercado é casal; corte de cabelo é pessoal.

**3.4 O que é "pago por"?**
> Quem efetivamente desembolsou o dinheiro. Mesmo gastos do casal precisam dizer quem pagou — é assim que o app sabe quem está "credor" ou "devedor" no fim do mês.

**3.5 E se a gente pagou junto, partido na hora?**
> Coloca como pago por uma pessoa (a que pagou a parte maior) e na descrição menciona o split. Ou faz dois lançamentos — cada um com a parte que pagou. O total fica certo nos dois casos.

**3.6 Pra que serve "Forma de pagamento"?**
> É opcional, mas ajuda a entender pra onde o dinheiro vai. Aparece no relatório "Visão → Por forma de pagamento". Útil pra ver, por exemplo, quanto está indo pro crédito ou Pix.

**3.7 Como funciona o vencimento (dueDay) dos fixos e parcelados?**
> É o dia do mês em que esse gasto cai. Serve só pra organizar (não cobra ninguém). Se o mês não tem aquele dia (ex: dia 31 em fevereiro), o app ajusta automaticamente.

**3.8 Posso definir um custo fixo que aparece a cada 6 meses (e não todo mês)?**
> Pode. Na hora de criar/editar, escolhe a frequência: mensal, bimestral, trimestral, semestral ou anual. Ele aparece automaticamente nos meses certos.

### 4. 📊 Renda e divisão (5)

**4.1 Por que o app pergunta minha renda?**
> Só é usado se vocês escolherem o método **"proporcional à renda"** de dividir os gastos do casal. Se escolherem 50/50, a renda não afeta nada — pode deixar em branco.

**4.2 Qual a diferença entre 50/50 e proporcional?**
> - **50/50**: cada um arca metade dos gastos do casal, independente da renda.
> - **Proporcional**: quem ganha mais arca uma fatia maior. Ex: A ganha R$ 6.000 e B ganha R$ 4.000 → A paga 60%, B paga 40% dos gastos compartilhados.

**4.3 Como mudo o método de divisão?**
> Aba "Casal" → "Como vocês dividem" → escolhe e salva. A mudança vale a partir do próximo "fechar mês" (não retroage).

**4.4 Posso mudar minha renda no meio do mês?**
> Pode, e o app usa o valor mais recente quando você fecha o mês. Se quiser ser justo, atualize ANTES de fechar.

**4.5 O que acontece se um dos dois não tem renda fixa (freela, autônomo)?**
> Funciona normal. Você pode atualizar a renda todo mês (na aba Casal) com o valor que ganhou naquele mês. Ou usar o método 50/50 e deixar renda em branco.

### 5. 📅 Fechando o mês (5)

**5.1 O que significa "fechar o mês"?**
> É consolidar tudo: somar quem pagou o quê, calcular quem deve pra quem, e marcar uma parcela a mais nos parcelamentos ativos. O mês fechado fica como histórico (read-only).

**5.2 Quando devo fechar o mês?**
> Quando tiver certeza de que todos os gastos do mês foram registrados — normalmente no último dia ou começo do mês seguinte. Não tem pressa.

**5.3 Como faço pra fechar?**
> Na aba "Mês", lá embaixo aparece um botão "Fechar mês". Toca, confirma, e pronto.

**5.4 Posso reabrir um mês fechado?**
> Atualmente não. Por isso confira tudo antes. Se errou alguma coisa depois de fechar, a saída é registrar um ajuste avulso no mês atual.

**5.5 Onde vejo o histórico de meses fechados?**
> Aba "Casal" → "Histórico de meses". Cada um tem um botão "Exportar PDF" se quiser guardar.

### 6. 🔐 Editar gastos do parceiro (autorização) (7)

**6.1 Por que aparece "pedir editar" em vez de "editar" no gasto do meu parceiro?**
> Porque o gasto foi registrado por ele(a) e a edição precisa de aprovação. Isso evita que um mude dados do outro sem o outro saber.

**6.2 Mas se for só corrigir uma vírgula na descrição, vai precisar aprovar?**
> Não. Mudanças pequenas (descrição, forma de pagamento, vencimento, e variações de valor menores que 10%) aplicam direto e ficam no histórico — com opção de desfazer em até 24h.

**6.3 O que precisa de aprovação então?**
> Mudanças "sérias": categoria, escopo (de casal pra individual ou vice-versa), pessoa que pagou, mês, ou variação de valor de 10% ou mais. Também apagar.

**6.4 Como vejo os pedidos pendentes?**
> Aba "Casal" — se tem pedido endereçado a você, aparece um card laranja no topo com "Aprovar" / "Negar". Você também vê um pontinho vermelho no ícone "Casal" no rodapé.

**6.5 Quanto tempo o pedido fica aberto?**
> 7 dias. Depois disso, expira automaticamente (vira "expired") e o gasto fica como estava antes.

**6.6 Posso editar/apagar meus próprios gastos sem aprovação?**
> Pode. Os seus gastos são livres pra você. A regra só vale quando você quer mexer no que o outro registrou.

**6.7 Tem como desfazer uma alteração "leve" depois?**
> Sim — dentro de 24h da mudança. O histórico de mudanças (não exposto em V1 da UI, mas disponível via API) guarda o valor anterior. Em V1 você pede pro parceiro registrar o ajuste manualmente.

### 7. 🎯 Metas (4)

**7.1 O que são metas?**
> São objetivos de poupança do casal: "Viagem pra Caldas Novas R$ 3.000", "Reserva de emergência R$ 10.000", etc. Você acompanha o quanto já guardou e quanto falta.

**7.2 Como crio uma meta?**
> Aba "Metas" → botão "+". Preenche nome, valor que quer atingir e (opcional) valor inicial guardado.

**7.3 Como adiciono dinheiro a uma meta?**
> Toca na meta na aba "Metas" e edita o "valor guardado". Você não precisa lançar como gasto separado — meta é um cofrinho à parte, só pra acompanhamento.

**7.4 O que acontece quando bate 100%?**
> Aparece uma celebração visual e a meta fica como "concluída". Você pode arquivar ou usar como referência futura.

### 8. 📈 Visão e relatórios (4)

**8.1 O que cada gráfico da Visão mostra?**
> - **Por categoria**: pra onde foi o dinheiro (mercado, transporte, etc.)
> - **Por pessoa**: quanto cada um gastou (individual + parte do casal)
> - **Por forma de pagamento**: Pix, crédito, débito, dinheiro, etc.

**8.2 Posso clicar nos gráficos pra detalhar?**
> Pode. Tocar em uma fatia ou item do gráfico abre a aba "Mês" já filtrada por aquela categoria/pessoa/forma.

**8.3 Como filtro a lista da aba Mês?**
> No topo da aba tem: busca por descrição, dropdown de pessoa, dropdown de categoria, dropdown de forma de pagamento. Todos combinam.

**8.4 Como exporto o relatório do mês em PDF?**
> Aba "Casal" → "Histórico de meses" → botão "Exportar PDF" do lado do mês desejado. Gera um relatório completo (gastos, divisão, balanceamento).

### 9. 💳 Assinatura, trial e pagamento (5)

**9.1 Quanto custa o Pacto?**
> O valor está sempre atualizado na tela de assinatura — toca no banner amarelo/laranja no topo (durante o trial) ou em "Assinar" no PaywallScreen.

**9.2 O que tá incluso no trial?**
> Tudo. Sem limite de gastos, sem feature bloqueada. É só pra você experimentar de verdade antes de decidir.

**9.3 Como assino?**
> Banner amarelo no topo do app → botão "Assinar agora" → te leva pro checkout da Hotmart. Após o pagamento, libera automaticamente.

**9.4 O que acontece se o trial acabar e eu não assinar?**
> O app continua acessível pra ver e exportar seus dados, mas adicionar/editar fica bloqueado. Você não perde nada — é só assinar depois pra reativar.

**9.5 Posso cancelar a assinatura?**
> Pode, a qualquer momento, na Hotmart. Você mantém acesso até o fim do período já pago.

### 10. ⚙️ Sincronização, instalação e privacidade (7)

**10.1 Onde meus dados ficam guardados?**
> Em nossos servidores (criptografados). Cada casal tem um espaço privado, protegido por permissões a nível de banco — ninguém de fora consegue ver. Você também tem uma cópia local no aparelho, pra funcionar offline.

**10.2 Funciona offline?**
> Funciona. Você consegue adicionar, editar e ver tudo sem internet. Quando voltar a conectar, sincroniza com o outro celular automaticamente.

**10.3 Como instalo como aplicativo no celular?**
> No Chrome (Android) ou Safari (iPhone), abre o site, e o próprio navegador sugere "Adicionar à tela inicial". Depois de instalado, abre como qualquer outro app (sem barra de navegador).

**10.4 As mudanças aparecem na hora pro meu parceiro(a)?**
> Aparecem. A sincronização é em tempo real — assim que você salva um gasto, ele vê no celular dele em poucos segundos.

**10.5 Se eu trocar de celular, os dados vão junto?**
> Vão. Você faz login com o mesmo e-mail no novo aparelho e tudo aparece. Os dados não estão "no celular" — estão na sua conta.

**10.6 Posso exportar tudo se quiser sair?**
> Pode. Cada mês fechado tem botão "Exportar PDF". A qualquer momento, você baixa o histórico que quiser. Em V1 não tem export de banco completo (JSON/CSV), mas tá no roadmap.

**10.7 E se a gente terminar?**
> Cada um pode exportar o histórico em PDF e zerar o app, sem custo. Esperamos que não precise.

---

## Componentes

### 1. `src/app/ajuda/page.tsx`
Server Component. Renderiza metadata (incluindo JSON-LD `FAQPage`) e passa o conteúdo como prop pro client component.

### 2. `src/app/ajuda/HelpClient.tsx`
Client component (`'use client'`). Estado:
- `query: string` — texto da busca
- `expandedIds: Set<string>` — IDs dos itens abertos (opcional; se usar `<details>` nativo, navegador gerencia)

UI:
- Header com botão "← Voltar" (`router.back()` ou link pro `/app`)
- H1 + subtitle
- Search input (auto-focus em desktop, não em mobile pra não abrir teclado direto)
- Lista de sections com items filtrados
- Se `query.length > 0`: mostra apenas items que casam (em pergunta OU resposta, case-insensitive)
- Se 0 results: empty state com "Limpar busca"
- Footer

### 3. `src/lib/faq/content.ts`
```ts
export interface FAQItem {
  id: string         // slug, ex: 'como-crio-conta'
  question: string
  answer: string     // pode ter \n; renderiza com white-space: pre-wrap
}

export interface FAQSection {
  id: string         // slug, ex: 'primeiros-passos'
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
      { id: 'criar-conta', question: 'Como crio uma conta no Pacto?', answer: '...' },
      ...
    ],
  },
  ...
]
```

### 4. Entradas de navegação
- `TabConfig.tsx`: novo bloco "Ajuda" com link `Link href="/ajuda"` → "Centro de ajuda →"
- `MonthHeader.tsx` (header sticky): botão `?` ao lado da engrenagem, link pra `/ajuda`
- `src/app/page.tsx` (landing): no final do FAQ existente, adicionar "Já é usuário? [Ver guia completo →](/ajuda)"

---

## Estados e edge cases

| Estado | Comportamento |
|---|---|
| Sem busca | Mostra todas as 10 seções, todas colapsadas |
| Busca com matches | Mostra apenas items que casam, com seções header visíveis se tiverem pelo menos 1 match |
| Busca sem matches | Empty state: "Nenhum resultado para 'X'. Veja todas as perguntas →" |
| Deep link `#secao-id` | Scrolla até a seção e expande primeiro item (opcional) |
| Mobile | Layout single-column, touch targets 44px+, search com `autocomplete="off"`, `inputMode="search"` |
| Acessibilidade | `<details>` nativo (já é acessível); search input com `aria-label`; foco visível |

---

## Acessibilidade

- Markup semântico: `<main>`, `<section>`, `<h1>`, `<h2>`, `<details><summary>`
- Search input com `aria-label="Buscar na ajuda"`
- Botão "Voltar" com `aria-label="Voltar"` (se for só ícone)
- Contraste mínimo AA (tokens já garantem)
- Funciona sem JS (details/summary é nativo; search degrada graciosamente)

---

## Métricas (opcional, V1.1)

- `helpcenter_open` — abertura da página
- `helpcenter_search` — busca executada (com query truncada)
- `helpcenter_item_expanded` — qual item foi expandido (mais clicados → revisar conteúdo)
- `helpcenter_no_results` — buscas sem resultado (gap de conteúdo)

---

## Reuso para PDF Hotmart (próxima entrega)

O `src/lib/faq/content.ts` é a fonte de verdade. O gerador de PDF para a Hotmart vai consumir o mesmo array e renderizar com `jspdf` (já é dependência do projeto, usado em `src/lib/pdf.ts`).

**Layout do PDF (próxima spec):**
- Capa
- Sumário (uma página)
- Por seção: título + Q&A em formato de manual
- Screenshots de cada aba (precisarão ser capturadas — TODO no plan do PDF)
- Final: dicas + suporte

**Vantagem:** quando atualizar uma pergunta, atualiza no único lugar. App e PDF ficam consistentes.

---

## Out of scope (V1)

- Vídeos embedded (V1.1: links externos pra YouTube)
- Chat de suporte (V2: integração com WhatsApp Business)
- Tradução pra outras línguas (V2)
- Deep-link `pacto://open?tab=mes` (V2)
- Sugestões de perguntas relacionadas (V2)
- Versionamento do conteúdo (V2)

---

## Critérios de aceite

- [ ] `/ajuda` carrega em <500ms
- [ ] Search filtra ao digitar, sem flicker
- [ ] Funciona em iOS Safari, Android Chrome, Desktop (Chrome/Firefox/Safari)
- [ ] Acessível por teclado (Tab navega, Enter expande)
- [ ] Mobile: touch targets ≥44px
- [ ] Sem regressão de performance no app principal (não importa nenhum lib novo)
- [ ] Conteúdo das 10 seções/56 perguntas conforme acima
- [ ] Entradas de navegação no TabConfig + MonthHeader + landing
- [ ] JSON-LD `FAQPage` no `<head>` da rota `/ajuda` (SEO)
