# Onboarding e Registro de Gastos via WhatsApp (Pacto Premium)

**Data**: 2026-05-19
**Projeto**: casal-no-azul (produto: Pacto)
**Status**: design aprovado, aguardando revisão da spec

## Contexto

O Pacto é um PWA mobile-first pra casais brasileiros organizarem despesas
sem brigar. Hoje o onboarding inteiro acontece no app (LoginScreen → Setup
→ couple code → adicionar gastos). O canal dominante de comunicação no
Brasil é WhatsApp — incorporar ele como **UI alternativa** elimina fricção
de instalação e cria um diferencial competitivo forte. Splitwise não tem.
Mobills não tem. Apps brasileiros não têm.

A campanha de marketing ("Casa do Léo e da Bia") aposta em narrativa de
casal real. Onboarding via WhatsApp é o complemento natural: o Reel que
viraliza leva pro número do Pacto no WhatsApp, não pra App Store ou
landing page com formulário.

## Objetivo

Permitir que um casal:
1. Faça **cadastro completo** no Pacto via WhatsApp (sem precisar abrir o app).
2. **Registre gastos** mandando texto ou áudio.
3. Receba **confirmação** de cada gasto + possibilidade de correção.
4. Faça o **fluxo de conversão de trial → Premium** todo pelo WhatsApp.

## Modelo de assinatura

| Tier | Preço | Acesso WhatsApp | App |
|---|---|---|---|
| Trial 14d | R$0 | ✅ (com wow factor) | ✅ |
| Básico (existente) | R$ TBD | ❌ | ✅ |
| **Premium (NOVO)** | **R$45/casal/mês** | ✅ | ✅ |

Premium = WhatsApp + features futuras (OCR de nota fiscal, voice command
avançado, etc). Trial dá WhatsApp pra criar dependência — quem testou não
quer largar.

Pricing do tier Básico permanece em aberto fora do escopo desta spec
(provavelmente R$14.90-19.90/mês, decidido em outra sessão).

## Não-objetivos (YAGNI)

- Comandos "saldo" / "fechar mês" / "lista de gastos" — só no app.
- Multi-expense numa mensagem ("30 no mercado E 15 na padaria") — v1.1.
- Parcelado / fixo via WhatsApp — v1.1.
- Edição de gasto fora da janela de 5min — só no app.
- Foto de nota fiscal (OCR) — feature futura, escopo separado.
- Idiomas além do pt-BR.
- Comandos para criar/editar metas — só no app.
- Chat humano de suporte — futuro.

## Decisões de design

### Provider: Meta WhatsApp Business Cloud API (oficial)

- Oficial, escalável, mais legítimo.
- Mensagens inbound (user → bot) dentro de 24h: free.
- Outbound (templates) pagos: R$0.08-0.30 por disparo.
- Setup: ~2-3 semanas de burocracia Meta em paralelo ao desenvolvimento.
- Requer CNPJ + Meta Business Verification + número dedicado + templates
  aprovados.

Alternativas descartadas:
- **GPTMaker** — fast track mas vendor lock-in.
- **Z-API** — não-oficial, risco de bloqueio Meta.

### Stack de parsing

| Tarefa | Serviço | Custo |
|---|---|---|
| Transcrição de áudio | OpenAI Whisper API | ~R$0.006/min |
| Parse de intenção | Anthropic Claude Haiku 4.5 | ~R$0.005/mensagem |
| Persistência | Supabase (existente) | marginal |

### Identificação

- Phone number é primary key na tabela `wa_users` (formato E.164).
- Lookup: `phone → wa_users.user_id → members.couple_id`.
- Cada membro do casal tem seu próprio número. **1 assinatura Premium =
  até 2 phones registrados** (não tem upsell por usuário).

### Defaults inteligentes ao criar gasto

Quando o user não diz o campo na mensagem:

| Campo | Default | Justificativa |
|---|---|---|
| `paidBy` | sender | Quem mandou pagou. Sempre. |
| `scope` | `casal` | Maioria dos gastos casal-app é compartilhado. |
| `paymentMethod` | método mais usado pelo user nos últimos 30 dias (fallback `pix`) | Aprende com histórico. |
| `category` | classificação da Haiku contra lista existente | "mercado" → Mercado, "ifood" → Restaurante, etc. |
| `monthKey` | mês corrente | Não permite mês passado/futuro via WhatsApp. |
| `createdAt` | timestamp da mensagem | Não permite datar gasto antigo. |

### Correção pós-confirmação (janela de 5 min)

Após bot confirmar um gasto, user tem 5min pra responder com correção
("foi crédito", "foi pessoal", "muda pra 57"). O bot identifica que a
mensagem **não é gasto novo** mas correção do último, via heurística +
prompt no Haiku (`isCorrection: true`).

Após 5min, edição = só pelo app. Limite previne ambiguidade de
"foi crédito" virar gasto novo confuso 2 dias depois.

## Arquitetura

```
┌──────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│ User no      │◄──►│ Meta WhatsApp       │◄──►│ Pacto API       │
│ WhatsApp     │    │ Business Cloud API  │    │ (Next.js)       │
└──────────────┘    └─────────────────────┘    └─────────────────┘
                                                       │
                              ┌────────────────────────┼────────────────────────┐
                              ▼                        ▼                        ▼
                    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
                    │ Claude Haiku 4.5 │    │ Whisper API      │    │ Supabase         │
                    │ (parse intent)   │    │ (transcrever     │    │ (couples,        │
                    │                  │    │  áudio)          │    │  expenses, etc.) │
                    └──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Endpoints novos

**`GET /api/whatsapp/webhook`** — Verificação inicial exigida pelo Meta.
Responde com `hub.challenge` se o `hub.verify_token` bater com env var.

**`POST /api/whatsapp/webhook`** — Recebe TODA mensagem do Meta. Pipeline:

1. Valida assinatura `X-Hub-Signature-256` (HMAC com `WHATSAPP_APP_SECRET`).
2. Extrai phone, tipo (text/audio), conteúdo.
3. Lookup `wa_users` → `user_id` + `couple_id`. Se não existe → onboarding state.
4. Se áudio: baixa via Meta API, manda pro Whisper, recebe texto.
5. Determina contexto: onboarding ativo OU operação normal (gasto/correção).
6. Roteia pra `state-machine.ts` (onboarding) OU `expense-from-message.ts`.
7. Persiste estado + cria expense/user/couple conforme o caso.
8. Envia resposta via Meta WA API.
9. Loga em `wa_messages` (auditoria).

### Arquivos novos (`src/lib/whatsapp/`)

| Arquivo | Responsabilidade |
|---|---|
| `meta-client.ts` | Wrapper da WA Cloud API: `sendText()`, `sendTemplate()`, `getMedia()`, `verifySignature()` |
| `parser.ts` | Chama Claude Haiku 4.5 com system prompt estruturado, valida JSON com Zod |
| `transcribe.ts` | Chama OpenAI Whisper API, retorna texto |
| `state-machine.ts` | State machine do onboarding (steps: `waiting_name`, `waiting_email`, `waiting_partner_phone`, `waiting_split_method`, `waiting_income`, `waiting_partner_accept`, `active`) |
| `expense-from-message.ts` | Orquestra parse + create expense + reply |
| `templates.ts` | Definições dos templates Meta com placeholders type-safe |
| `defaults.ts` | Helper `mostUsedPaymentMethodLast30d(userId)` etc |

### Schema do banco (`docs/supabase/04_whatsapp.sql`)

```sql
-- Mapeia phone → user
create table public.wa_users (
  phone_e164 text primary key,           -- '+5511999991234'
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
create index wa_users_user_id_idx on public.wa_users(user_id);

-- Estado de conversa (onboarding + last_expense pra correção)
create table public.wa_conversations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  step text not null default 'waiting_name'
    check (step in ('waiting_name','waiting_email','waiting_partner_phone',
                    'waiting_split_method','waiting_income','waiting_partner_accept',
                    'active')),
  context jsonb not null default '{}'::jsonb,  -- guarda valores em progresso
  last_expense_id uuid references public.expenses(id) on delete set null,
  last_msg_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Log de mensagens (90d retention)
create table public.wa_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  phone_e164 text not null,
  direction text not null check (direction in ('inbound','outbound')),
  message_type text not null check (message_type in ('text','audio','template')),
  content text,
  audio_meta_id text,
  parsed_intent jsonb,
  raw_meta_payload jsonb,
  created_at timestamptz default now()
);
create index wa_messages_user_created_idx on public.wa_messages(user_id, created_at desc);

-- Adicionar tier em subscriptions
alter table public.subscriptions
  add column if not exists tier text not null default 'basic'
    check (tier in ('basic','premium'));

-- RPC pra linkar phone → user
create or replace function public.link_phone_to_user(p_phone text)
returns void language sql security definer set search_path = public as $func$
  insert into public.wa_users (phone_e164, user_id)
  values (p_phone, auth.uid())
  on conflict (phone_e164) do update set user_id = excluded.user_id;
$func$;

-- Cron de purge (90d)
-- Schedulado via Supabase Cron Extension:
-- delete from public.wa_messages where created_at < now() - interval '90 days';

-- RLS
alter table public.wa_users enable row level security;
alter table public.wa_conversations enable row level security;
alter table public.wa_messages enable row level security;

create policy "wa_users_self" on public.wa_users
  for all using (user_id = auth.uid());
create policy "wa_conversations_self" on public.wa_conversations
  for all using (user_id = auth.uid());
create policy "wa_messages_self" on public.wa_messages
  for select using (user_id = auth.uid());
```

### Fluxo de onboarding (state machine)

```
[novo phone manda "oi"]
  ↓ cria wa_users + wa_conversations (step=waiting_name)
[waiting_name]    → bot: "Qual seu nome?"
  ↓ user responde nome
[waiting_email]   → bot: "E seu email?"
  ↓ valida email + cria auth user via service_role
[waiting_partner_phone] → bot: "WhatsApp do parceiro? (opcional, manda 'pular')"
  ↓ envia template `partner_invite_pt_br` se número informado
[waiting_split_method] → bot: "Como dividem? 1=50/50 2=proporcional"
  ↓
[waiting_income]  → bot: "Sua renda mensal?" (só se proporcional)
  ↓ cria couple + member
[active]          → bot: "Pronto! Manda seu primeiro gasto."

Parceiro recebe template → responde SIM → entra no MESMO fluxo a partir
de waiting_name, mas no final é associado ao MESMO couple_id.
```

### Fluxo de registro de gasto (usuário ativo)

```
1. User manda mensagem (texto ou áudio)
2. Webhook recebe
3. Se áudio → Whisper → texto
4. Lookup mais-usado paymentMethod (últimos 30d) → contexto pro prompt
5. Claude Haiku parseia → JSON {amount, category, paymentMethod, scope, isExpense, isCorrection}
6. Se isCorrection && last_expense_id recente → UPDATE expense
   Senão se isExpense → INSERT expense
   Senão → bot responde "não entendi"
7. UPDATE wa_conversations.last_expense_id + last_msg_at
8. Bot envia confirmação
```

### Templates Meta (precisam de aprovação prévia)

| Nome | Categoria Meta | Variáveis | Uso |
|---|---|---|---|
| `partner_invite_pt_br` | MARKETING | `{1}=nome_inviter`, `{2}=email_inviter` | Convite ao parceiro |
| `trial_reminder_pt_br` | UTILITY | `{1}=dias_restantes`, `{2}=link_hotmart` | Lembretes do trial |
| `premium_expired_pt_br` | UTILITY | `{1}=link_hotmart` | Trial encerrado sem conversão |
| `welcome_back_pt_br` | UTILITY | `{1}=nome` | Após pagamento, reativação |

## Conversão Trial → Premium

| Dia trial | Disparo |
|---|---|
| 7 | `trial_reminder_pt_br` (versão "metade do trial") |
| 11 | `trial_reminder_pt_br` (versão "faltam 3 dias") |
| 13 | `trial_reminder_pt_br` (versão "amanhã acaba") |
| 14+1 (apenas se não converteu) | `premium_expired_pt_br` |

Cron job (Supabase Edge Function ou Vercel Cron, 1× por dia) varre
`subscriptions` com `status='trial'` e dispara templates conforme dias
restantes.

### Integração Hotmart

Hotmart webhook chega em `POST /api/hotmart/webhook` (já existe). Estende
pra:

1. Identifica produto comprado (existing OU novo "Pacto Premium R$45").
2. Se Premium: `UPDATE subscriptions SET tier='premium', status='active',
   current_period_end=NOW()+30d WHERE couple_id=...`
3. Dispara template `welcome_back_pt_br` pros dois números do casal.

Configurar **novo produto "Pacto Premium" no Hotmart** com preço R$45/mês
recorrente. SKU mapping no env.

## Edge cases

1. **24h window Meta:** bot só responde livre se user falou nas últimas
   24h. Pra dispararoutbound proativo, só via template. Já contemplado no
   design.

2. **Troca de número:** Settings → WhatsApp → editar (pelo app). Atualiza
   `wa_users.phone_e164`. App fora de escopo desta spec — feature de
   gerenciar phone via app é v1.1.

3. **Casal se separa:** member soft-delete pelo app → cascata em
   `wa_users` (mantém phone mas remove `couple_id` virtual). Bot do
   ex-member: "Você saiu do casal. Quer criar novo? {link}".

4. **Bot offline / API down:** retry com backoff em queue (Supabase
   Queues ou Vercel KV). Após 3 falhas, registra `wa_messages.parsed_intent
   = {error: ...}` e responde "Tive problema. Tenta de novo em 1min."

5. **Spam/abuse:** rate limit per phone: 30 mensagens/min e 100 gastos
   criados/dia. Acima disso, ignora silenciosamente + loga.

6. **LGPD:** `wa_messages` retém 90 dias (auditoria + treinamento de
   prompt). Depois purga via cron. User pode pedir export completo (já
   existe export PDF — estende pra incluir log WhatsApp).

7. **Confusão de identidade:** Bia manda do celular do Léo. Bot registra
   como Léo (phone = identidade). Documentado, suporte humano se virar
   problema recorrente.

8. **Mensagem em outro idioma:** Haiku detecta non-pt-BR → bot responde
   "Por enquanto eu só entendo português 🇧🇷".

9. **Phone de país não-Brasil:** bot aceita (E.164 é universal) mas
   templates Meta podem custar diferente. MVP: aceita todos mas marketing
   foca pt-BR.

10. **Trial expirado:** bot responde "Seu Pacto Premium tá expirado.
    Manda upgrade: {link}. Seus dados estão salvos no app."

## Variáveis de ambiente novas

```bash
WHATSAPP_VERIFY_TOKEN=...           # token random pra GET webhook
WHATSAPP_APP_SECRET=...             # do Meta App Settings
WHATSAPP_PHONE_NUMBER_ID=...        # do número Meta
WHATSAPP_BUSINESS_ACCOUNT_ID=...
WHATSAPP_ACCESS_TOKEN=...           # permanent token Meta
ANTHROPIC_API_KEY=...               # pra Haiku
OPENAI_API_KEY=...                  # pra Whisper
HOTMART_PREMIUM_PRODUCT_ID=...      # SKU do novo produto Premium
NEXT_PUBLIC_HOTMART_PREMIUM_URL=... # URL de checkout Premium
```

## Custos por casal/mês (Premium ativo)

| Item | Volume médio | Unitário | Custo |
|---|---|---|---|
| Claude Haiku parsing | 60 msgs | R$0.005 | R$0.30 |
| Whisper transcrição | 20 áudios | R$0.02 | R$0.40 |
| Templates outbound | 3-5 | R$0.30 | R$1.00 |
| Inbound (free) | ∞ | R$0 | R$0 |
| Supabase incremental | — | — | R$0.10 |
| **Total infra** | | | **~R$1.80** |
| **Receita Premium** | | | **R$45** |
| **Margem bruta** | | | **96%** |

Onboarding novo casal custa **~R$0.30 uma vez** (template `partner_invite_pt_br`).

## Métricas (dashboard interno)

| Métrica | Como medir | Meta sem 4 / sem 12 |
|---|---|---|
| Onboarding completion rate | % phones que terminam setup vs abandonam | 50% / 70% |
| Partner activation rate | % convites que viram cadastro do parceiro | 40% / 55% |
| Engagement: gastos/casal/semana | count(expenses) origin=whatsapp | 8 / 18 |
| Audio share | % gastos via áudio | 30% / 50% |
| Parse correction rate | % msgs que precisam de correção | <15% / <8% |
| p95 latency | tempo user→bot reply | <3s / <2s |
| Trial → Premium conversion | % trials que viram pagantes | 18% / 25% |
| Premium retention M3 | % ainda pagando após 90d | 75% / 80% |

## Setup operacional (não-código)

Tarefas que o user precisa fazer em paralelo ao desenvolvimento:

1. **Criar/verificar Meta Business Account** com CNPJ. (~3-5 dias)
2. **Registrar/portar número dedicado** pro Pacto no Meta WA. (~2 dias)
3. **Submeter 4 templates** pra aprovação Meta. (~3-5 dias úteis)
4. **Criar produto "Pacto Premium R$45/mês"** no Hotmart + webhook URL.
5. **Configurar webhook callback URL** no painel Meta apontando pra
   `https://pacto-beta.vercel.app/api/whatsapp/webhook`.
6. **Provisionar Anthropic API key** (Claude Haiku 4.5).
7. **Provisionar OpenAI API key** (apenas Whisper).

## Testes / verificação

Sem suite automatizada hoje. Verificação manual estruturada:

1. Smoke test onboarding completo (Léo + Bia em dois celulares).
2. 10 mensagens texto variadas → confirma parse correto.
3. 10 mensagens áudio → confirma transcrição + parse.
4. Correção dentro da janela 5min → expense atualizado.
5. Correção fora da janela → bot trata como novo gasto.
6. Trial expirando → templates disparam nas datas certas.
7. Premium ativado via Hotmart → bot volta a aceitar mensagens.
8. Spam (30+ msgs/min) → rate limit silencia.
9. Áudio em outro idioma → mensagem de fallback.
10. Casal saindo (member delete) → bot responde corretamente.

## Riscos / aberto

- **Aprovação Meta** pode levar mais que 3 semanas. Cronograma assume
  caminho feliz. Plano B se atrasar: lançar com Z-API temporário e
  migrar quando aprovado. (Decisão a tomar se atrasar.)

- **Pricing R$45** pode ser alto demais pro mercado. Validar com primeiros
  20 usuários — se >50% acharem caro, considerar R$29.90 + ajuste de
  margem.

- **Tier "Básico"** existente ainda precisa de pricing definido. Fora
  do escopo desta spec. Pode ser feito em paralelo.

- **Confusão entre tiers:** UX pra explicar "Básico vs Premium" no app
  + paywall — fora desta spec. Outra tarefa.
