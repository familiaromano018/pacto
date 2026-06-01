# Hotmart — passo a passo pra ativar a cobrança

Esse documento é o que falta pra começar a receber pagamentos. Você cuida disso na sua conta Hotmart, eu já deixei o webhook e o paywall prontos no código.

---

## 1. Criar o produto na Hotmart (15 min)

1. Entra em https://app.hotmart.com → **Produtos → Novo produto**
2. Tipo: **Serviço de assinatura**
3. Categoria: **Negócios e Carreira** (ou Finanças)
4. Nome: **Pacto** (ou "	")
5. Tipo de serviço: **Digital**
6. **Preço:** R$ 29,90/mês (combina com o que tá na landing — "menos de R$ 1/dia"). Sugiro também criar plano anual com desconto (ex: R$ 239/ano = R$ 19,90/mês).
7. **Recorrência:** Mensal (e/ou Anual). NÃO marca "produto único".
8. Trial gratuito da Hotmart: **deixa desligado** (a gente já dá 14 dias direto no app, não precisa do trial do Hotmart).
9. Forma de pagamento: Cartão + PIX + Boleto (todos)
10. Salvar e publicar

---

## 2. Configurar o Webhook (5 min)

Esse é o passo CRÍTICO — sem isso o pagamento não destrava o app.

1. Na Hotmart, vai em **Ferramentas → Webhook**
2. Clica em **Adicionar URL**
3. URL: `https://pacto-beta.vercel.app/api/hotmart/webhook`
4. Versão: **v2.0.0** (a mais nova)
5. Eventos a marcar:
   - ✅ Compra aprovada (`PURCHASE_APPROVED`)
   - ✅ Compra concluída (`PURCHASE_COMPLETE`)
   - ✅ Compra cancelada (`PURCHASE_CANCELED`)
   - ✅ Compra reembolsada (`PURCHASE_REFUNDED`)
   - ✅ Chargeback (`PURCHASE_CHARGEBACK`)
   - ✅ Pagamento atrasado (`PURCHASE_DELAYED`)
   - ✅ Cancelamento de assinatura (`SUBSCRIPTION_CANCELLATION`)
6. **Hottok** (token de validação): a Hotmart vai gerar OU permitir você definir. **Anota esse valor** — vai pra variável de ambiente.
7. Salvar.

---

## 3. Configurar as env vars na Vercel (3 min)

1. https://vercel.com → seu projeto Pacto → **Settings → Environment Variables**
2. Adiciona DUAS novas variáveis:

**Variável 1 — token do webhook:**
- Name: `HOTMART_HOTTOK`
- Value: o token que você anotou no passo 2.6
- Environments: **Production**, **Preview**, **Development** (marca os 3)

**Variável 2 — service role key do Supabase:**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: pega no Supabase Dashboard → Project Settings → API → **service_role secret** (é uma chave que começa com `eyJ...`, MAIS LONGA que a publishable)
- ⚠️ Essa chave é SECRETA — não compartilhe nunca.
- Environments: **Production**, **Preview**, **Development**

**Variável 3 — URL do checkout pro app abrir:**
- Name: `NEXT_PUBLIC_HOTMART_CHECKOUT_URL`
- Value: a URL do checkout do produto que você criou. Pega na Hotmart em **Produtos → seu produto → Links → Página de Vendas** ou **Checkout direto**. Algo tipo `https://pay.hotmart.com/X1234567Y`.
- Environments: **Production**, **Preview**, **Development**

3. Depois de salvar, vai em **Deployments → 3 pontinhos do último deploy → Redeploy**. As env vars novas só valem após redeploy.

---

## 4. Testar com pagamento real (10 min)

1. Abre https://pacto-beta.vercel.app numa janela anônima
2. **Entrar com Google** com uma conta de teste
3. **Criar pacto novo**
4. Vai ver banner "Faltam 14 dias do trial" (porque você acabou de criar)
5. Clica em **Assinar agora** no banner → abre Hotmart
6. Compra usando cartão real OU cupom de 100% se você criou um pra teste
7. Espera 30-60 segundos
8. Volta no app — o banner some, status vira "active"

Se algo não funcionar:
- Checa o webhook na Hotmart: **Ferramentas → Webhook → Logs**. Vê se a chamada saiu e qual foi a resposta.
- Checa Vercel Logs: **seu projeto → Logs → filtra "hotmart"**. Vê se a função recebeu.

---

## 5. Eventos que o webhook trata

| Evento Hotmart | O que acontece no Pacto |
|---|---|
| PURCHASE_APPROVED | Subscription vira `active`, libera o app |
| PURCHASE_COMPLETE | (alias) Mesma coisa |
| PURCHASE_DELAYED | Subscription vira `past_due`, paywall com aviso |
| PURCHASE_CANCELED | Subscription vira `canceled`, paywall |
| PURCHASE_REFUNDED | Subscription vira `canceled` |
| PURCHASE_CHARGEBACK | Subscription vira `canceled` |
| SUBSCRIPTION_CANCELLATION | Subscription vira `canceled` |

Todos os eventos ficam logados em `subscriptions.hotmart_event_log` (jsonb) — auditoria completa por casal.

---

## 6. FAQ rápido

**Q: O que acontece se o user pagar com email diferente do Google que ele logou?**
A: O webhook não acha o couple e ignora silenciosamente. Solução: instruir o cliente a usar o mesmo email no Hotmart e no Pacto. Posso evoluir isso depois pra ter um campo "código do pacto" no checkout.

**Q: Quantos celulares uma assinatura libera?**
A: Os 2 do casal. A subscription é por `couple_id`, não por usuário. Quem entrar pelo código de convite herda o acesso.

**Q: Como dar acesso de graça pra alguém (família, amigos)?**
A: No Supabase Dashboard → Table Editor → `subscriptions` → edita a row do couple → muda `status` pra `active` e seta `current_period_end` pra uma data bem no futuro (tipo 2099-01-01).
