# Pacto — Resumo do Projeto

> App de finanças para casais. Atualizado em 21/06/2026.

## O que é
App brasileiro de gestão de contas compartilhadas para casais ("feito por um casal, pra casais"). Dois usuários (papéis **A** e **B**) formam um **casal** e gerenciam gastos, custos fixos, parcelas e metas juntos, com rateio automático.

- **Produção:** https://pacto-app.tec.br
- **Repo:** github.com/familiaromano018/pacto (branch `main`)
- **Vercel:** conta `familiaromano018` (NÃO a `vittaxtecnologia-sudo`)
- **App Android:** wrapper Capacitor (`br.tec.pactoapp`) que carrega a URL de produção em webview

## Stack
Next.js 14.2.5 (App Router) · React 18 · Supabase (Postgres + Auth + Realtime) · Capacitor 8 (Android) · jsPDF (relatórios) · Vercel (deploy + Analytics) · pnpm.

## Funcionalidades (telas)
- **Login** — Google ou e-mail/senha (+ reset de senha)
- **Setup** — criar casal ou entrar por código de convite (`PACTO-XXXX`); define nomes, rendas e método de rateio
- **Aba Mês** — lança/edita/remove gastos do mês (avulsos, fixos, parcelas); filtros por escopo/categoria/forma de pagamento; fechar mês; exportar PDF
- **Aba Visão** — gráficos por categoria, saldo entre parceiros ("quem deve quanto")
- **Aba Recorrentes** — custos fixos (com frequência) e parcelas
- **Aba Metas** — objetivos de poupança com progresso
- **Aba Casal (Config)** — código de convite, editar dados, categorias custom, tema, **card WhatsApp**, autorizações pendentes, logout
- **Paywall / Trial** — 14 dias grátis; bloqueia se assinatura expira

## Modelo de dados (Supabase)
Tabelas: `couples`, `members` (A/B), `expenses`, `fixed_costs`, `installments`, `goals`, `subscriptions`, `custom_categories`, `closed_months`, `user_whatsapp`, `change_requests` + `change_history` (autorização e auditoria entre parceiros).

Conceitos: **scope** (casal/pessoal A/B), **paid_by** (quem desembolsou), **method** (50/50, proporcional, unificada, por categoria). RPCs: `create_couple_for_current_user`, `join_couple_with_code`, `couple_has_access`, `get_my_subscription`, `find_couple_by_buyer_email`.

## Integrações
### Autenticação + Admin
Auth via Supabase (Google / e-mail-senha). **Admin** = e-mail na env `ADMIN_EMAILS` (whitelist) + usuário logado existente no Supabase Auth. Painel em `/admin`: dashboard de casais, métricas, MRR, e **troca manual de plano** (botão ⚙️ Plano → trial/premium/cancelar; registra `ADMIN_MANUAL` no log). 404 no `/admin` sem login é proteção, não bug.

### Pagamento (Hotmart)
Webhook `/api/hotmart/webhook` (valida Hottok). Eventos → status da `subscriptions`: aprovado→`active`, atrasado→`past_due`, cancelado/reembolso→`canceled`. Idempotente (transactionId no log).

### WhatsApp (Evolution API) — código pronto, falta config
Webhook `/api/whatsapp?secret=...` recebe mensagens e o bot **responde** (`sendText` via Evolution). Capacidades implementadas:
- **Fase 0:** verificar número (código 6 dígitos no card do app)
- **Fase 1:** lançar gasto/receita por texto (parser Claude Haiku, tool-use)
- **Fase 2:** corrigir/apagar lançamento + "quem pagou"
- **Fase 2.5:** lançar por **nota de voz** (transcrição Groq Whisper)
- **Fase 3:** consultas ("quem deve quanto", "quanto gastei", "quanto sobrou")
- **Fase 4:** lançar por **foto/PDF de nota fiscal** (Claude Vision)

## Estado atual (21/06/2026)
- ✅ App, auth, pagamento, admin e painel de troca de plano: **no ar e funcionando**
- ✅ Build/deploy de produção passando; `main` sincronizada
- ⚠️ **WhatsApp bloqueado SÓ por configuração** — faltam 7 env vars na Vercel:
  `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`,
  `EVOLUTION_INSTANCE`, `WHATSAPP_WEBHOOK_SECRET`, `NEXT_PUBLIC_PACTO_WHATSAPP`
  → depois: apontar webhook **MESSAGES_UPSERT** da Evolution para
  `https://pacto-app.tec.br/api/whatsapp?secret=<WHATSAPP_WEBHOOK_SECRET>`
- 🧹 Nit: comentário em `src/app/api/whatsapp/route.ts` ainda cita domínio antigo `pacto-beta.vercel.app`

## Gotchas (pra não repetir dor de cabeça)
- A pasta local `/Volumes/HD NATHAN /PROJETOS IA/casal-no-azul` é um clone que já ficou **atrás do remote** — sempre `git pull` + `pnpm install` antes de mexer.
- Env vars de produção são "sensitive": `vercel env pull` traz o nome mas valor vazio (não dá pra ler de volta, só regravar).
- Rodar `/admin` em localhost exige colar `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` (não está no repo).
