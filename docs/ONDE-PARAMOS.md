# Pacto — Onde Paramos (retomar aqui)

> Última atualização: **06/07/2026**. Abra este arquivo ao retomar o projeto.
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

## 🟡 WhatsApp — ATIVADO e configurado, PROVADO funcionando (06/07/2026)
Reativado e testado ponta a ponta. **Tudo funciona** — o único bloqueio atual é o número estar em **throttle temporário** do WhatsApp.

- **Config em produção (Vercel, projeto pacto):** as 7 vars setadas + flag `NEXT_PUBLIC_WHATSAPP_ENABLED=true` (card WhatsApp aparece no app).
- **Instância Evolution:** servidor **`https://evo.ai.saramonic.com.br`** (do Saramonic, compartilhado), instância **`PACTO`**, número **5511913339948** (perfil "Turbo"). `EVOLUTION_INSTANCE=PACTO`.
- **Webhook Evolution:** apontado (via API) pra `https://pacto-app.tec.br/api/whatsapp?secret=<WHATSAPP_WEBHOOK_SECRET>`, evento `MESSAGES_UPSERT`, `webhookByEvents:false`. Secret guardado nas env vars da Vercel.
- **Provado no debug:** número verifica ✅, webhook recebe ✅, parser lança gasto no app ✅ (R$15 farmácia entrou), `sendText` retorna 201 ✅, todas as env presentes no runtime ✅.
- **⚠️ Bloqueio atual = THROTTLE do número:** mandamos dezenas de msgs de teste em minutos → WhatsApp soft-bloqueou a ENTREGA (msgs ficam PENDING). **Não é bug.** Restart não resolve na hora. **Resolver = esperar 30min–horas SEM enviar**, depois testar UMA msg. Uso real (baixo volume) não dispara isso.
- **Gotchas Evolution v2.3.7 descobertos:** (1) o `webhook/set` faz MERGE (pra limpar headers, mandar `headers:{}`); (2) `webhookBase64` não persistiu por webhook — áudio usa fallback `getMediaBase64`. Áudio/foto ainda NÃO validados na prática (parar no throttle).
- Quando entregar de novo: os MESMOS avisos do app (`alerts.ts`) podem passar a ir pro WhatsApp (ainda não implementado o disparo proativo).
- **Reabrir teste:** depois do número esfriar, mandar "gastei 20 no mercado" pro **5511 91333-9948** e ver se responde. Se quiser testar muito, usar **chip dedicado** (não o do Saramonic).

---

## 🎯 Próximos passos (prioridade)

### 1. Terminar validação do WhatsApp (esperar throttle destravar)
Já ativado e provado. Falta só: esperar o número esfriar → testar 1 msg de texto → validar áudio e foto de nota → então liberar/divulgar pros casais. Se o Saramonic reclamar do número compartilhado, migrar pra chip dedicado.

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
