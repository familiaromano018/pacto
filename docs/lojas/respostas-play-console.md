# Play Console — Respostas prontas (Pacto)

App: **Pacto** · pacote `br.tec.pactoapp` · app ID `4975895244559721747`
Conta: org **Turbo M Tecnologia** (`9214656999343178226`)

---

## 🔑 Conta de teste (para o review do Google)
```
E-mail: review.google@pacto-app.tec.br
Senha:  PactoTeste2026!
```
Casal "Ana & Bruno" (código `REVIEW26`), assinatura **active até 17/07/2027**, com 5 lançamentos, conta fixa, parcela e meta. Login verificado ✅

---

## Configurar o app — respostas por tarefa

### 1. Política de privacidade
```
https://pacto-app.tec.br/privacidade
```

### 2. Acesso ao app
- Marcar: **"Todas ou algumas funcionalidades são restritas"**
- Adicionar instruções de acesso:
  - Nome: `Conta de teste`
  - Nome de usuário: `review.google@pacto-app.tec.br`
  - Senha: `PactoTeste2026!`
  - Instruções: `Faça login com e-mail e senha na tela inicial. A conta já vem com um casal e lançamentos de exemplo. Sem login não há dados a exibir.`

### 3. Anúncios
- **Não**, o app não contém anúncios.

### 4. Classificação de conteúdo
- E-mail: `familiaromano018@gmail.com`
- Categoria: **Finanças** (ou "Utilitários/Produtividade" se Finanças não aparecer)
- Questionário: **Não** para tudo (sem violência, sexo, drogas, linguagem, jogos de azar, conteúdo de usuário)
- Resultado esperado: **Livre / L**

### 5. Público-alvo e conteúdo
- Faixa etária: **18 anos ou mais** (app financeiro; evita as regras extras da política Famílias)
- O app atrai crianças? **Não**

### 6. App de notícias
- **Não** é um app de notícias.

### 7. Recursos financeiros (declaração)
- O Pacto é só **controle de gastos pessoais**: não faz empréstimo, não é banco, não é investimento, não mexe com cripto, não inicia pagamento.
- Marcar: **"Meu app não oferece nenhum desses recursos financeiros"** / "Nenhuma dessas opções".

### 8. Saúde / Governo
- **Não** para ambos.

### 9. Segurança de dados (Data safety)
- **Coleta dados?** Sim
- **Tipos coletados:**
  - E-mail (obrigatório) — para login/conta
  - Nome (opcional) — exibir no app
  - **Informações financeiras → "Outras informações financeiras do usuário"** (os gastos/receitas que o próprio usuário lança) — obrigatório, para funcionamento do app
- **Compartilha com terceiros?** Não
- **Criptografia em trânsito?** Sim
- **Usuário pode pedir exclusão dos dados?** Sim → `https://pacto-app.tec.br/privacidade`
- **Dados coletados são obrigatórios** (não opcionais) para usar o app
- Finalidade de todos: **Funcionalidade do app** / gerenciamento de conta (NÃO marcar publicidade)

---

## Ficha da Play Store (Presença na loja → Listagem principal)

- **Nome do app:** `Pacto: Contas do Casal`
- **Descrição curta / completa:** ver `ficha-lojas.md` (seção Google Play)
- **Ícone 512×512:** `assets/icon-512.png`
- **Feature graphic 1024×500:** `assets/feature-graphic-1024x500.png`
- **Screenshots (mín. 2, subir os 6):** `public/screens/`
  1. `app-saldo.png` · 2. `app-visao.png` · 3. `app-lancar.png`
  4. `app-divisao.png` · 5. `app-lista.png` · 6. `app-metas.png`
- **Categoria:** Finanças · **E-mail de contato:** `familiaromano018@gmail.com`
- **Site:** `https://pacto-app.tec.br`

---

## Versão de produção
- **Versões → Produção → Criar nova versão**
- **Assinatura do app:** deixar o **Google gerenciar** (Play App Signing) — o `.aab` já está assinado com a chave de upload.
- Subir: `pacto-release.aab` (na raiz do repo; regenerável, não está no git)
- **Notas da versão (pt-BR):**
```
Primeira versão do Pacto. As contas do casal em tempo real nos dois celulares: quem deve quanto, rateio do jeito que vocês combinarem, contas fixas, parcelas, orçamento por categoria e metas.
```

---

## ⚠️ Notas importantes
- **App é GRÁTIS** — a assinatura acontece fora da loja (Rota B). O app nativo esconde os botões de "Assinar" (`html.is-native`), então o review não vê checkout externo.
- **Keystore:** `/Volumes/HD NATHAN /android-toolchain/keys/pacto-upload.jks` (alias `pacto-upload`, senha em `keys/CREDENCIAIS-LEIA.txt`). **Perder isso = não conseguir atualizar o app.** Fazer backup.
