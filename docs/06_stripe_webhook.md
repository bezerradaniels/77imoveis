# Stripe — Configuração de Webhook

Guia para registrar e testar o webhook de pagamentos do Stripe (assinaturas e compras avulsas).

## 1. URL do Webhook

**Produção:**
```
https://77imoveis.com.br/api/webhooks/stripe
```

**Desenvolvimento (via Stripe CLI):**
```
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
O `stripe listen` imprime um **signing secret** temporário (`whsec_...`) — use-o como `STRIPE_WEBHOOK_SECRET` local.

## 2. Registrar no Dashboard do Stripe

1. Acesse **Developers → Webhooks → Add endpoint** (modo **live**).
2. **Endpoint URL:** a URL de produção acima.
3. Selecione os eventos:
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `customer.subscription.deleted`
4. Salve e copie o **Signing secret** (`whsec_...`) → variável `STRIPE_WEBHOOK_SECRET`.

> Também ative **Pix** e **Boleto** em **Settings → Payment methods** (live), além de cartão.

## 3. Eventos processados (`app/api/webhooks/stripe/route.ts`)

| Evento Stripe | Ação |
|---|---|
| `invoice.paid` | Assinatura da fatura → `payments.status='pago'`; `subscriptions.status='ativa'` + período (achado por `gateway_subscription_id`) |
| `invoice.payment_failed` | `subscriptions.status='inadimplente'`; `payments.status='falhou'` |
| `payment_intent.succeeded` | Compra avulsa paga (via `metadata.payment_id`) → `payments.status='pago'` + ativa `listing_features` e `properties.is_featured` |
| `payment_intent.payment_failed` | `payments.status='falhou'` |
| `checkout.session.completed` | (compras avulsas) sessão concluída — a confirmação real de Pix/boleto chega depois via `payment_intent.succeeded` |
| `customer.subscription.deleted` | `subscriptions.status='cancelada'` |

Segurança/robustez:
- **Verificação da assinatura** via `stripe.webhooks.constructEvent` com `STRIPE_WEBHOOK_SECRET` (header `stripe-signature`). Assinatura ausente/ inválida → **400**.
- **Idempotência** por `event.id` em `payment_webhook_events` (só marca `processed_at` quando tudo persistiu; senão retorna **5xx** e o Stripe reenvia).

## 4. Modelo de cobrança

- **Assinaturas de planos:** `collection_method='send_invoice'` (fatura por ciclo). A cada período o Stripe emite uma **fatura hospedada** paga por cartão/boleto/Pix. Não há cobrança automática no cartão (espelha o comportamento anterior do Asaas). *Obs.: Pix recorrente/Automático não existe em conta BR — por isso o modelo por fatura.*
- **Compras avulsas (destaques):** **Stripe Checkout** (`mode='payment'`) com cartão + Pix + boleto.

## 5. Fluxo completo (assinatura)

```
1. Usuário clica em "Assinar plano"
   ↓
2. startPlanCheckout():
   - getOrCreateStripeCustomer (companies.gateway_customer_id)
   - subscriptions.create (send_invoice) → 1ª fatura hospedada
   - subscription local (status 'pendente'/'trial') + payment local ('pendente')
   ↓
3. Redireciona para a fatura hospedada do Stripe
   ↓
4. Usuário paga (Pix, boleto ou cartão)
   ↓
5. Stripe envia invoice.paid (header stripe-signature)
   ↓
6. Webhook: valida assinatura → payments 'pago' → subscriptions 'ativa' + período
```

## 6. Testar

**Via Stripe CLI (recomendado):**
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
stripe trigger invoice.paid
```

**e2e (rejeição de assinatura):**
```bash
npm run test:e2e -- webhook-stripe
```

## 7. Configuração de preços dos planos

Cada plano precisa de um **Price** recorrente no Stripe, guardado em `plans.stripe_price_id`.
Após as chaves live estarem no ambiente:
```bash
npm run stripe:setup-plans   # cria Product+Price (BRL) para cada plano ativo
```

## 8. Variáveis de ambiente

```
STRIPE_SECRET_KEY = sk_live_...
STRIPE_WEBHOOK_SECRET = whsec_...   (do endpoint criado no Dashboard)
```
No Hostinger, adicionar via painel de Variáveis de Ambiente da aplicação Node.js.

## 9. Troubleshooting

- **400 na entrega:** `STRIPE_WEBHOOK_SECRET` não bate com o do endpoint, ou o corpo foi alterado por proxy (a rota lê o corpo cru via `request.text()` e roda em `runtime='nodejs'`).
- **Assinatura não ativa:** confirme que a `subscriptions` local foi criada antes do webhook e que `gateway_subscription_id` bate com o `invoice.subscription`.
- **Avulso não ativa destaque:** confirme `metadata.payment_id` no PaymentIntent e o vínculo em `listing_features.payment_id`.
- **Pix/boleto demoram:** são assíncronos; a confirmação chega depois via `invoice.paid`/`payment_intent.succeeded`. A tela de confirmação já trata `status=pendente`.
