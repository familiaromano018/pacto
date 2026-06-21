# Pacto — Onde Paramos (retomar aqui)

> Última atualização: **21/06/2026**. Abra este arquivo ao retomar o projeto.
> Docs irmãos: `RESUMO-PROJETO.md` (visão geral), `SEGURANCA-LGPD-OPEN-FINANCE.md` (gate da Fase 2).

---

## ✅ No ar em produção (pacto-app.tec.br)
- **Admin** (`/admin`) — dashboard de casais + **troca manual de plano** (botão ⚙️ Plano: trial / premium / cancelar).
  - Acesso por `ADMIN_EMAILS` (Vercel): `familiaromano018@gmail.com`, `turbomusicbr@gmail.com`, `nathan@3000psi.com.br`.
  - 404 no /admin sem login é proteção, não bug.
- **Orçamento por categoria** — define limite por categoria na aba Config; barra de progresso na Visão (verde→amarelo≥80%→vermelho).
  - Coluna `category_budgets` (jsonb) em `couples`. Migração `docs/supabase/10_category_budgets.sql` **já rodada** no Supabase.
- **Central de avisos no app** — banner na Visão (orçamento perto/estourado + contas fixas/parcelas vencendo em ≤5 dias).
  - Lógica pura e reaproveitável em `src/lib/alerts.ts`.

## ⏸️ Pausado
- **WhatsApp (Evolution)** — código 100% pronto (texto, voz, foto/nota, consultas, envio), mas:
  - **UI escondida** atrás de flag: `NEXT_PUBLIC_WHATSAPP_ENABLED` (desligado por padrão).
  - **Bloqueado por config + chip**: falta o chip e 7 variáveis na Vercel:
    `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`,
    `EVOLUTION_INSTANCE`, `WHATSAPP_WEBHOOK_SECRET`, `NEXT_PUBLIC_PACTO_WHATSAPP`.
  - **Pra reativar:** conseguir o chip → setar as 7 vars + `NEXT_PUBLIC_WHATSAPP_ENABLED=true` → redeploy → apontar webhook MESSAGES_UPSERT da Evolution pra `https://pacto-app.tec.br/api/whatsapp?secret=<WHATSAPP_WEBHOOK_SECRET>`.
  - Quando ligar: os MESMOS avisos do app (`alerts.ts`) passam a ir também pro WhatsApp.
  - 🧹 Nit: comentário em `src/app/api/whatsapp/route.ts` ainda cita domínio antigo `pacto-beta.vercel.app`.

---

## 🎯 Próximos passos (prioridade)

### 1. Reativar WhatsApp (quando o chip chegar)
Plugar chip + 7 vars + flag → testar ponta a ponta → ligar pra todos.

### 2. Open Finance / sincronização bancária (Fase 2 — a maior bola perdida do mercado BR)
- **O que é:** conectar contas dos dois (marido + esposa, cada um com seu consentimento) via agregador autorizado (**Pluggy** ou Belvo) e importar transações **automaticamente** → vira gasto no app (paid_by A/B automático).
- **Read-only, sem senha no app, não move dinheiro** (não habilitar iniciação de pagamento).
- **Maior risco:** Pacto vira custódio de dado financeiro sensível → segurança do Open Finance = segurança do nosso banco/chaves.
- **Antes de conectar 1ª conta real:** seguir `docs/SEGURANCA-LGPD-OPEN-FINANCE.md` (gate Go/No-Go).
- **Decisões pendentes:**
  - [ ] Modelar números: custo por conta conectada (Pluggy) × média de contas por casal vs assinatura (R$29,90) → incluso ou plano premium?
  - [ ] Prototipar no **sandbox do Pluggy** (grátis) pra ver transação caindo como gasto.

### 3. Outros gaps de mercado mapeados (depois)
- Lembretes proativos via WhatsApp (já meio caminho andado com `alerts.ts`).
- (Pacto JÁ está na frente em lançamento por WhatsApp/voz/foto — Mobills/Organizze não têm.)

---

## 🔑 Referências rápidas (infra)
- **Repo:** github.com/familiaromano018/pacto (branch `main`).
- **Vercel:** conta **`familiaromano018`** (NÃO a `vittaxtecnologia-sudo`). Deploy = push no main OU `vercel --prod`.
- **Pasta local:** `/Volumes/HD NATHAN /PROJETOS IA/casal-no-azul` — pode ficar atrás do remote: **sempre `git pull` + `pnpm install` (CI=true) antes de mexer.**
- **Supabase:** env vars de prod são "sensitive" → `vercel env pull` traz nome mas valor vazio (só regravar, não dá pra ler).
- **Local `/admin`:** precisa colar `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` (não está no repo).
