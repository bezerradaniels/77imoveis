# 77Imóveis — Monetização e Pagamentos

## 1. Fontes de receita

1. **Assinaturas profissionais (B2B)** — limite de imóveis ativos por plano.
2. **Destaque de imóvel** — pagamento avulso (7/15/30 dias).
3. **Empresa em destaque** — visibilidade premium no diretório.
4. **Banners** — home, busca, imóvel, empresa, blog (com segmentação por cidade).
5. **Vitrine (catálogo próprio)** — página exclusiva da imobiliária/corretor, ativação avulsa por período.
6. **Cupons/promoções** e **programa de indicação** (fase futura).

## 1.1 Vitrine — catálogo próprio da imobiliária

Cada empresa pode ativar uma **Vitrine**: uma página exclusiva com link próprio (`/vitrine/{slug}`) e a marca dela (logo, cor de destaque e capa), reunindo **todos os imóveis ativos** da empresa em um só lugar — ideal para divulgar no Instagram e WhatsApp. Funciona como um mini-site dentro do 77Imóveis.

**Cobrança avulsa por período (ativação):** a empresa paga uma vez e a vitrine fica no ar por um prazo. Quando vence, sai do ar até renovar. Preços sugeridos (editáveis no admin, em `site_settings.vitrine_precos`):

| Período | Preço sugerido |
|---|---|
| 30 dias | R$ 49,90 |
| 90 dias | R$ 119,90 |
| 1 ano | R$ 399,90 |

**Como funciona (banco de dados — ver `database/05_vitrine.sql`):**

- Tabela `storefronts` (1 por empresa): slug, headline, sobre, `accent_color`, logo/capa, `status`, `activated_at`, `expires_at`.
- Tabela `storefront_activations`: histórico de cada compra/renovação (dias, valor, `payment_id`, início/fim).
- **Segurança:** a vitrine só aparece publicamente se `status='ativo'` **e** não expirada. Um gatilho (`guard_storefront_status`) garante que **só o pagamento** (webhook via service role) consegue ativar/definir validade — o dono edita a aparência, mas não consegue "se ativar" sozinho.
- A página da vitrine lista `properties` da empresa com `status='ativo'` (sem mudança no catálogo de imóveis).

**Fluxo:** empresa monta a vitrine no painel (marca + textos) → escolhe o período → paga (Pix/boleto/cartão) → webhook confirma → `storefronts.status='ativo'` e `expires_at` definido → vitrine no ar. Job diário marca como `expirado` quando vence.

## 2. Planos (catálogo atual)

Planos mensais fixos, com opção anual com desconto. Corretores autônomos têm uma régua mais barata; imobiliárias, construtoras e empresas usam os planos B2B.

| Plano | Público | Imóveis ativos | Destaques inclusos | Mensal | Anual |
|---|---|---:|---:|---:|---:|
| Particular Gratuito | proprietário | 1 | 0 | Grátis | - |
| Corretor Essencial | corretor autônomo | 10 | 0/mês | R$ 19,90 | R$ 190,80 |
| Corretor Pro | corretor autônomo | 30 | 2/mês | R$ 39,90 | R$ 382,80 |
| Corretor Max | corretor autônomo | 80 | 5/mês | R$ 69,90 | R$ 670,80 |
| Empresa Start | B2B | 50 | 0/mês | R$ 79,90 | R$ 766,80 |
| Empresa Pro | B2B | 150 | 10/mês | R$ 149,90 | R$ 1.438,80 |
| Empresa Líder | B2B | 400 | 20/mês | R$ 249,90 | R$ 2.398,80 |

Compras avulsas:

| Produto | Duração | Valor |
|---|---:|---:|
| Destaque simples | 7 dias | R$ 9,90 |
| Destaque forte | 15 dias | R$ 19,90 |
| Super destaque | 30 dias | R$ 34,90 |
| Topo cidade + tipo | 7 dias | R$ 49,90 |
| Topo cidade + tipo | 15 dias | R$ 89,90 |
| Topo cidade + tipo | 30 dias | R$ 149,90 |
| Vitrine avulsa | 30 dias | R$ 49,90 |
| Vitrine avulsa | 90 dias | R$ 119,90 |
| Vitrine avulsa | 1 ano | R$ 399,90 |
| Banner cidade | 7 dias | R$ 74,90 |
| Banner cidade | 30 dias | R$ 249,90 |
| Banner home/regional | 7 dias | R$ 199,90 |
| Banner home/regional | 30 dias | R$ 649,90 |
| Banner romaria/temporada | 30 dias | R$ 299,90 |

> Regra: ao tentar ativar acima do limite do plano, o app oferece upgrade. Para `particular` no 2º imóvel: *"Gostaria de migrar para um plano profissional (B2B)?"*.

## 3. Gateway de pagamento — Stripe

Gateway atual: **Stripe** (conta BR, BRL). Aceita **cartão, Pix e boleto**.

- **Assinaturas de planos:** modelo **fatura por ciclo** (`collection_method='send_invoice'`). A cada período o Stripe emite uma **fatura hospedada** paga por cartão/boleto/Pix — sem cobrança automática no cartão. *Pix recorrente/Automático não existe em conta BR, por isso o modelo por fatura.*
- **Compras avulsas (destaques):** **Stripe Checkout** (`mode='payment'`) com cartão + Pix + boleto.

Client em `lib/payments/stripe.ts`; webhook em `app/api/webhooks/stripe/route.ts` (ver `docs/06_stripe_webhook.md`). Preço recorrente por plano em `plans.stripe_price_id` (populado por `npm run stripe:setup-plans`).

## 4. Fluxos

### Assinatura
1. Empresa escolhe plano → cria/obtém `customer` no gateway.
2. Gateway gera cobrança (Pix QR / boleto / cartão).
3. **Webhook** (Edge Function, service_role) confirma pagamento → grava em `payments`, ativa `subscriptions`, atualiza limite de imóveis.
4. Página de "financeiro" mostra histórico, faturas, status, upgrade/downgrade e cancelamento (`cancel_at_period_end`).

### Destaque avulso
1. No card do imóvel: "Destacar" → escolhe 7/15/30 dias.
2. Gera `payment` + `listing_features` (status `pendente_pagamento`).
3. Webhook confirma → `listing_features.status='ativo'`, define `starts_at/ends_at` e marca `properties.is_featured=true` até expirar (job diário expira).

## 5. Webhook

Rota Next.js `app/api/webhooks/stripe/route.ts` — eventos `invoice.paid` / `invoice.payment_failed` (assinaturas), `payment_intent.succeeded` / `payment_intent.payment_failed` e `checkout.session.completed` (avulsos), `customer.subscription.deleted`. Detalhes em `docs/06_stripe_webhook.md`.

Segurança: verificação da assinatura (`stripe-signature` + `STRIPE_WEBHOOK_SECRET`); idempotência por `event.id` em `payment_webhook_events` (retorna 5xx para o Stripe reenviar se algo falhar).

## 6. Relatórios de receita (admin)

MRR, assinaturas ativas por plano, destaques vendidos, receita por cidade, inadimplência, banners (impressões/cliques/CTR).
