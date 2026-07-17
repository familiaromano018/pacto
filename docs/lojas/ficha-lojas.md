# Ficha das Lojas — Pacto

Pacote pronto para colar no **Google Play Console** e no **App Store Connect**.
Todos os textos respeitam os limites de caractere de cada loja (contagem entre `[ ]`).

- **appId / Bundle ID:** `br.tec.pactoapp`
- **Nome do app:** Pacto
- **Categoria:** Finanças (Finance)
- **Idioma principal:** Português (Brasil) — pt-BR
- **Classificação etária:** Livre / 4+ (sem conteúdo sensível)
- **Site:** https://pacto-app.tec.br
- **Privacidade:** https://pacto-app.tec.br/privacidade
- **Termos:** https://pacto-app.tec.br/termos
- **Suporte / contato:** familiaromano018@gmail.com

---

## 🍎 Apple App Store

### Nome do app  `[≤30]`
```
Pacto: Contas do Casal
```
`[22]`

### Subtítulo  `[≤30]`
```
Quem deve quanto, na hora
```
`[25]`

### Texto promocional  `[≤170]` (editável a qualquer momento, sem review)
```
14 dias grátis, sem cartão. Cada um lança do próprio celular e o Pacto mostra na hora quem deve quanto. Rateio justo do jeito que o casal combinar.
```
`[145]`

### Palavras-chave  `[≤100, separadas por vírgula, sem espaço]`
```
contas,casal,dividir,despesas,financas,orcamento,dinheiro,gastos,rateio,juntos,namorados,divida
```
`[95]`

### Descrição  `[≤4000]`
```
O Pacto é o app das contas do casal — feito por um casal, pra casais.

Cada um lança do seu próprio celular e o Pacto mostra na hora quem deve quanto, sincronizado nos dois aparelhos em tempo real. Chega de planilha, de "quanto eu te devo?" e de briga por causa de quem pagou o quê.

COMO FUNCIONA
• Cada um anota seus gastos no próprio celular
• O saldo do mês aparece claro: quem deve quanto, agora
• Sincroniza automático nos dois celulares

DO JEITO QUE VOCÊS COMBINAREM
• 50/50
• Proporcional à renda de cada um
• Conta única (tudo junto)
• Divisão diferente por categoria (ex.: mercado 50/50, aluguel 70/30)

TUDO NUM LUGAR SÓ
• Extrato compartilhado do mês
• Contas fixas e parcelas que se repetem sozinhas
• Orçamento por categoria com barra de progresso
• Avisos quando o orçamento aperta ou uma conta está pra vencer
• Metas do casal (viagem, reserva, sonhos)

LANÇAR É RÁPIDO
Anote em segundos direto no app — e o Pacto organiza o resto.

FEITO PRA RELAÇÃO, NÃO SÓ PRAS CONTAS
Números claros, conversa fácil, relação forte. O Pacto tira o dinheiro do meio da briga e devolve a paz pra casa.

COMECE GRÁTIS
14 dias grátis, sem cartão. Namorados, noivos, casados, morando juntos ou não — se as contas se misturam, o Pacto resolve.
```

### Notas para o revisor (App Review Notes)
```
App de finanças compartilhadas para casais. Requer conta (e-mail e senha) para uso — sem login não há dados a exibir. Conta de teste:
  usuário: (preencher antes de submeter)
  senha: (preencher antes de submeter)
Assinatura opcional após 14 dias de teste. Suporte: familiaromano018@gmail.com
```
> ⚠️ Criar e preencher uma conta de teste com dados de exemplo antes de submeter — a Apple reprova se não conseguir entrar.

### Screenshots (usar `public/screens/`)
Ordem sugerida (Apple exige tela 6,7" e 6,5"):
1. `app-saldo.png` — "Quem deve quanto, na hora"
2. `app-visao.png` — "O mês do casal, claro"
3. `app-lancar.png` — "Lançar leva segundos"
4. `app-divisao.png` — "Do jeito que vocês combinarem"
5. `app-lista.png` — "Todo gasto num lugar só"
6. `app-metas.png` — "Sonhos do casal viram meta"

---

## 🤖 Google Play

### Título  `[≤30]`
```
Pacto: Contas do Casal
```
`[22]`

### Descrição curta  `[≤80]`
```
As contas do casal em tempo real nos dois celulares. Sem briga de quem pagou.
```
`[77]`

### Descrição completa  `[≤4000]`
```
O Pacto é o app das contas do casal — feito por um casal, pra casais.

Cada um lança do próprio celular e o Pacto mostra na hora quem deve quanto, sincronizado nos dois aparelhos em tempo real. Chega de planilha, de "quanto eu te devo?" e de discussão por causa de quem pagou o quê.

⚡ COMO FUNCIONA
• Cada um anota seus gastos no próprio celular
• O saldo do mês aparece claro: quem deve quanto, agora
• Sincroniza automático nos dois celulares

⚖️ DO JEITO QUE VOCÊS COMBINAREM
• 50/50
• Proporcional à renda de cada um
• Conta única (tudo junto)
• Divisão diferente por categoria (mercado 50/50, aluguel 70/30…)

📊 TUDO NUM LUGAR SÓ
• Extrato compartilhado do mês
• Contas fixas e parcelas que se repetem sozinhas
• Orçamento por categoria com barra de progresso
• Avisos quando o orçamento aperta ou uma conta vence
• Metas do casal (viagem, reserva de emergência, sonhos)

💬 FEITO PRA RELAÇÃO
Números claros, conversa fácil, relação forte. O Pacto tira o dinheiro do meio da briga e devolve a paz pra casa.

🎁 COMECE GRÁTIS
14 dias grátis, sem cartão. Namorados, noivos, casados, morando juntos ou não — se as contas se misturam, o Pacto resolve.
```

### Gráficos exigidos pelo Google Play
- **Ícone:** 512×512 PNG (32-bit, com alpha) — gerado na tarefa de ícones
- **Feature graphic:** 1024×500 — CRIAR (navy #0b1538 + logo + "As contas do casal, sem briga")
- **Screenshots de telefone:** mín. 2, usar `public/screens/` (mesma ordem da Apple)

### Data safety (formulário do Google) — respostas
- Coleta: e-mail, nome, dados financeiros lançados pelo usuário (gastos/receitas)
- Uso: funcionamento do app (mostrar saldo/divisão), não vendido a terceiros
- Criptografia em trânsito: sim
- Exclusão de conta: sim, o usuário pode solicitar/excluir → link em pacto-app.tec.br/privacidade

---

## ✅ Checklist antes de submeter
- [ ] Conta de teste criada e preenchida (Apple + Google exigem entrar no app)
- [ ] Screenshots exportados nos tamanhos certos de cada loja
- [ ] Feature graphic 1024×500 (só Google)
- [ ] Política de privacidade cobre exclusão de conta e dados financeiros
- [ ] Se houver assinatura in-app: usar billing da loja OU declarar que a compra é externa (regras diferem — validar antes)
```
