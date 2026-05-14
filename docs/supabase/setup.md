# Pacto — Setup Supabase passo a passo

Esse documento é self-service. Siga na ordem. Ao final, me devolva **URL** e **anon key**.

---

## 1. Criar projeto Supabase (5min)

1. Acesse https://supabase.com → **Sign in / Sign up** (Google é mais rápido).
2. Click **"New project"**.
3. Preencha:
   - **Name:** `pacto`
   - **Database Password:** gere uma forte e **GUARDE** (não vou precisar dela, é só pra você ter acesso ao DB direto)
   - **Region:** `South America (São Paulo)` — latência baixa pro Brasil
   - **Plan:** Free (basta pra começar)
4. Aguarde ~1min ele provisionar.

---

## 2. Pegar credenciais (1min)

1. Com projeto criado, vá em **Project Settings → API**.
2. Copie:
   - **Project URL** (algo como `https://abcxyz.supabase.co`)
   - **anon public key** (chave longa que começa com `eyJ...`)
3. **Me devolva esses dois valores** — vou colocar em `.env.local`.

---

## 3. Configurar Google OAuth (10min)

### 3.1. Criar OAuth Client no Google Cloud

1. Acesse https://console.cloud.google.com → crie projeto novo "Pacto" (ou use um que já tem).
2. Vá em **APIs & Services → OAuth consent screen** → tipo **External** → preencha:
   - App name: **Pacto**
   - User support email: seu email
   - Authorized domains: `supabase.co` (e seu domínio futuro: `pacto.fin.br`)
   - Developer contact: seu email
3. Vá em **APIs & Services → Credentials → + CREATE CREDENTIALS → OAuth client ID**.
   - Application type: **Web application**
   - Name: `Pacto Web`
   - **Authorized redirect URIs:**
     - `https://[SEU-PROJECT-REF].supabase.co/auth/v1/callback`
     - (substitua [SEU-PROJECT-REF] pelo seu — ex: `abcxyz.supabase.co`)
4. Copie **Client ID** e **Client Secret**.

### 3.2. Plugar no Supabase

1. No dashboard Supabase → **Authentication → Providers → Google**.
2. Toggle **Enable**.
3. Cole **Client ID** e **Client Secret**.
4. Save.

✅ Login com Google funcionando.

> **Apple OAuth fica pra depois** — exige Apple Developer ($99/ano + 1 service ID + 1 key file). Pro MVP, Google só basta. Quando ativar Apple, faz processo similar em https://developer.apple.com.

---

## 4. Rodar o schema SQL (3min)

1. No dashboard Supabase → **SQL Editor** → **+ New query**.
2. Cole o conteúdo de **`docs/supabase/schema.sql`** (próximo arquivo deste projeto) e click **Run**.
3. Deve aparecer "Success. No rows returned" em cada bloco.

✅ Tabelas, RLS e funções criadas.

---

## 5. Verificar configuração final

1. **Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:3737` (vai trocar pra `https://pacto.fin.br` depois)
   - **Redirect URLs:** adicionar `http://localhost:3737/**` (autoriza qualquer subrota local)

---

## ✅ Pronto. Me devolve:

```
SUPABASE_URL: https://...
SUPABASE_ANON_KEY: eyJ...
```

Daí eu plugo o cliente Supabase no app, monto a tela de auth com botão Google, e implemento o conceito de Casal + Membro com código de convite.

---

## 📋 Cheat Sheet — onde clicar

| Faz isso | Lugar |
|---|---|
| Criar projeto | https://supabase.com/dashboard |
| Ver URL + anon key | Project Settings → API |
| Plugar Google OAuth | Authentication → Providers → Google |
| Rodar SQL | SQL Editor → New query |
| Ver usuários cadastrados | Authentication → Users |
| Ver dados das tabelas | Table Editor |
| Logs em tempo real | Logs → Auth logs |
