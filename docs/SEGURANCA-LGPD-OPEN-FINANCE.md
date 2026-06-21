# Pacto — Checklist de Segurança & LGPD (Open Finance / Fase 2)

> Gate obrigatório **antes de conectar a primeira conta bancária real**.
> Contexto: Next.js + Supabase + agregador autorizado (Pluggy/Belvo), modo **somente leitura** de dados (sem iniciação de pagamento).
> Princípio-mestre: o Open Finance é seguro por design (sem senha no app, read-only, sem mover dinheiro). **O risco real é o Pacto virar custódio de dado financeiro sensível** — então a segurança do Open Finance = a segurança do Pacto.

---

## 0. Decisões de escopo (definir antes de tudo)
- [ ] **Somente leitura de dados** — NÃO habilitar iniciação de pagamento (ITP).
- [ ] Listar exatamente quais dados serão puxados (ex.: transações de conta + cartão). Nada além disso.
- [ ] Definir por quanto tempo o dado fica armazenado (retenção) e o que é descartado.
- [ ] Definir se entra como recurso incluso ou **plano premium** (impacta custo por conta conectada).

## 1. Chaves & segredos (a lição da service-role)
- [ ] Chaves do agregador (API key/secret) **só no servidor** (env da Vercel), nunca no bundle do client.
- [ ] Nenhuma chave/segredo no git — confirmar `.gitignore` cobre `.env*` (já cobre).
- [ ] Tokens de conexão por usuário (item/access tokens do Pluggy) guardados **criptografados** e acessíveis só server-side.
- [ ] Webhooks do agregador autenticados (segredo/assinatura validada), como já é feito no webhook da Hotmart/WhatsApp (`?secret=` / hottok).
- [ ] Rotação de chaves documentada (como trocar se vazar).

## 2. Banco de dados (Supabase) — o ativo mais crítico
- [ ] **RLS rígido** em toda tabela que guardar dado bancário (couple_id, como as demais). Testar que um casal NUNCA lê dados de outro.
- [ ] Acesso service-role **só** em rotas server-side (route handlers/server actions) — nunca no client.
- [ ] Avaliar **criptografia em repouso** de campos sensíveis (ex.: número de conta, tokens).
- [ ] Backups protegidos e com acesso restrito (lembrar: Supabase Free não tem backup automático — ver `scripts/backup.mjs` do padrão JHC).
- [ ] Princípio do menor privilégio nas policies (só o necessário pra ler/escrever).

## 3. Minimização & retenção de dados
- [ ] Puxar **só** as transações que o app usa (não baldear histórico inteiro "porque dá").
- [ ] Não duplicar dado sensível desnecessário (ex.: não guardar payload bruto do banco se já mapeou pra expense).
- [ ] Política de retenção: apagar dado bruto após processar; manter só o mínimo (valor, categoria, data).
- [ ] Job de limpeza de dados de consentimentos expirados/revogados.

## 4. Consentimento (UX + registro)
- [ ] Conexão sempre pelo **widget oficial do agregador** — NUNCA tela própria pedindo dados do banco (isso é phishing).
- [ ] Cada pessoa conecta a **própria** conta com o **próprio** consentimento (A e B independentes).
- [ ] Tela clara antes de conectar: o que será compartilhado, por quê, por quanto tempo.
- [ ] **Revogar consentimento** fácil dentro do app (1-2 toques) + revogação efetiva no agregador.
- [ ] Renovação de consentimento tratada (consentimento expira — máx ~12 meses; avisar antes de expirar).
- [ ] Registro/log de quando o consentimento foi dado, escopo e validade.

## 5. Segurança da conta Pacto (vira porta de entrada do financeiro)
- [ ] Reforçar login: senha forte; avaliar **2FA opcional** (passa a fazer sentido com dado bancário dentro).
- [ ] Sessões: expiração razoável, logout efetivo.
- [ ] Proteção contra brute force no login (rate limit).
- [ ] E-mail de alerta em evento sensível (nova conexão bancária, novo login de dispositivo).

## 6. LGPD (dado financeiro = dado sensível → obrigações reais)
- [ ] **Base legal** definida e registrada (consentimento explícito do titular para os dados de Open Finance).
- [ ] **Política de Privacidade** atualizada: quais dados, finalidade, com quem compartilha (agregador), tempo de retenção, direitos do titular. (já existe rota `/privacidade` — atualizar.)
- [ ] **Termo de consentimento** específico pra conexão bancária (separado do aceite geral).
- [ ] Direitos do titular implementados: **acesso, correção, exclusão (esquecimento) e portabilidade** dos dados.
- [ ] **Exclusão de conta = apagar dados financeiros** (e revogar consentimentos no agregador).
- [ ] Encarregado (DPO) / canal de contato pra titular exercer direitos (e-mail de privacidade).
- [ ] Registro do **agregador como operador/suboperador** (contrato/DPA com Pluggy/Belvo).
- [ ] Avaliar necessidade de **RIPD** (Relatório de Impacto à Proteção de Dados) — recomendável dado o volume de dado sensível.
- [ ] Plano de resposta e **notificação de incidente** (ANPD + titulares) em caso de vazamento.

## 7. Observabilidade & operação (ver [[feedback_observability_standards]])
- [ ] Logs estruturados (JSON) das chamadas ao agregador, **sem logar dado sensível** (mascarar conta/valor).
- [ ] Métricas de conexões ativas, falhas de sync, consentimentos a expirar.
- [ ] Alertas: falha de webhook, pico de erro, conexão quebrada em massa.
- [ ] Health check da integração; rollback documentado se algo der errado.
- [ ] Teste de regressão do RLS (garantir isolamento entre casais) no CI.

## 8. Terceiros
- [ ] Due diligence do agregador: autorização BACEN, certificações (ISO 27001/SOC 2 se houver), histórico de incidentes.
- [ ] DPA (acordo de tratamento de dados) assinado com o agregador.
- [ ] Saber onde os dados trafegam/ficam (residência de dados no Brasil).

---

## ✅ Gate final (Go / No-Go antes da 1ª conta real)
Só conectar uma conta REAL quando TODOS estiverem ✔:
- [ ] Chaves server-side, fora do git, com rotação documentada
- [ ] RLS testado (isolamento entre casais comprovado)
- [ ] Somente leitura, escopo mínimo, retenção definida
- [ ] Widget oficial + consentimento claro + revogação funcionando
- [ ] Política de Privacidade + termo de consentimento atualizados (`/privacidade`)
- [ ] Exclusão de dados a pedido funcionando
- [ ] DPA com o agregador assinado
- [ ] Plano de resposta a incidente pronto
- [ ] Logs sem dado sensível + alertas básicos no ar

> Lembrete honesto: o pior cenário de um vazamento aqui é **expor histórico financeiro** (não roubar dinheiro — é read-only, sem senha, sem pagamento). Mesmo assim, é dado sensível sob LGPD — tratar com o mesmo rigor de senha.
