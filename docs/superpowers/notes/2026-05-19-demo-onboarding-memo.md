# Demo de Onboarding — Memo

**Status:** AGUARDANDO (vem depois de Autorização + WhatsApp)
**Decisão tomada em:** 2026-05-19

## Caminho escolhido

**Combo — Sandbox "Léo + Bia" com tooltips dentro**

- Primeiro login do user → vai pra rota `/demo` (não pro Setup).
- Demo carrega um **casal fake** com dados pré-populados:
  - 2 personagens: Léo e Bia (os mesmos da campanha publicitária)
  - ~15-20 gastos avulsos espalhados nos últimos 30 dias
  - 2-3 custos fixos (Spotify, Aluguel, Internet)
  - 1 parcelado (TV em 12×)
  - 1-2 metas (Viagem Praia, Reserva Emergência)
  - Renda configurada (Léo R$8000, Bia R$5500, método proporcional)
- User pode navegar livre — todas as abas funcionam.
- **4-5 tooltips contextuais** guiando:
  1. Visão: "Aqui vc vê tudo dividido por categoria, pessoa, forma de pagamento"
  2. Mês: "Lista do mês todo. Filtra por categoria ou forma de pagamento"
  3. Add gasto (FAB): "Toca aqui pra adicionar. Tem áudio também (Premium)"
  4. Fechar mês: "Fim do mês = saldo claro. Quem deve paga, quem não deve não cobra"
  5. Casal: "Conecta com seu(sua) parceiro(a). Tudo sincroniza em real-time"
- Cada tooltip tem "Próximo" e "Pular tour". Após o 5º, mostra CTA grande:
  - **"Começar pra valer →"** que limpa demo + abre Setup real

## Por que esse caminho

- **Imersão real** > telas estáticas. User SENTE o produto.
- **Reforça marca da campanha** — Léo e Bia já são personagens dos Reels, viram entidade reconhecível.
- **Conversão alta** — quem chega na demo via Reel orgânico já tá engajado; demo termina de fechar.
- **Reusável** — pode ser linkada na bio do Instagram como "experimente sem cadastrar".

## Implementação

- **~6-7 dias de trabalho** (escopo a refinar quando brainstormar)
- Arquivos prováveis:
  - `src/app/demo/page.tsx` — rota nova
  - `src/components/DemoApp.tsx` — wrapper que usa state fake em vez de Supabase
  - `src/lib/demo/seed.ts` — gerador dos dados fake (Léo + Bia + 15 gastos + ...)
  - `src/lib/demo/state.ts` — store local-only (zustand ou Context) que mimica os hooks de Supabase
  - `src/components/Tooltip.tsx` — componente reutilizável de tooltip ancorada
  - `src/components/DemoTour.tsx` — orchestra os 5 tooltips em sequência
- Riscos:
  - Manter paridade entre demo e app real conforme o produto evolui (cada feature nova precisa entrar no seed)
  - Performance: dados pré-populados precisam ser realistas mas leves

## Dependências

- **Bloqueado por:** autorização + WhatsApp (esses não bloqueiam tecnicamente, mas a ordem é estratégica)
- **Bloqueia:** lançamento da campanha publicitária com link na bio (sem demo, link vai direto pro Setup, que tem fricção)

## Próximos passos (quando chegar a hora)

1. Brainstorm de spec (decidir: tooltips skip-able? primeira visita só? cookie/localStorage?)
2. Definir dados seed exatos (~15 gastos com categorias variadas, valores realistas)
3. Definir copy dos 5 tooltips
4. Decidir se a demo permite escrita (adicionar/editar) ou é read-only
5. Spec + plan + execução
