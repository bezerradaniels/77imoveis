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

## 2. Planos (sugestão — ajustável no admin)

| Plano | Público | Imóveis ativos | Destaques/mês | Preço/mês |
|---|---|---|---|---|
| Particular | B2C | 1 | 0 | Grátis |
| Profissional Free | B2B | 10 | 0 | Grátis |
| Profissional 30 | B2B | 30 | 2 | R$ 99,90 |
| Profissional 80 | B2B | 80 | 5 | R$ 199,90 |
| Imobiliária Ilimitada | B2B | ilimitado | 12 | R$ 399,90 |

Destaque avulso (sugestão): 7 dias R$ 19,90 · 15 dias R$ 34,90 · 30 dias R$ 59,90.

> Regra: ao tentar ativar acima do limite do plano, o app oferece upgrade. Para `particular` no 2º imóvel: *"Gostaria de migrar para um plano profissional (B2B)?"*.

## 3. Gateway de pagamento (Brasil)

**Recomendado: Asaas** (ou **Mercado Pago**) — aceitam **Pix, boleto e cartão**, têm assinaturas recorrentes e webhooks, e cobram em BRL. Stripe fica como integração futura para cartão internacional.

Comparativo rápido:

| | Asaas | Mercado Pago | Stripe |
|---|---|---|---|
| Pix | ✅ nativo | ✅ nativo | ⚠️ limitado no BR |
| Boleto | ✅ | ✅ | ⚠️ |
| Cartão | ✅ | ✅ | ✅ |
| Assinatura recorrente | ✅ | ✅ | ✅ |
| Conhecido pelo público local | médio | **alto** | baixo |

A camada de pagamento é abstraída em `lib/payments` (interface `PaymentProvider`), então trocar/empilhar gateways no futuro não afeta o resto do app.

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

## 5. Webhooks (Edge Functions)

```
supabase/functions/
├─ asaas-webhook/        # PAYMENT_CONFIRMED, PAYMENT_RECEIVED, SUBSCRIPTION_*
├─ expire-features/      # cron diário: expira destaques vencidos
└─ rebuild-trigger/      # dispara rebuild SSG ao mudar anúncios
```
Segurança: validar assinatura/`access_token` do webhook; idempotência por `gateway_payment_id`; tudo registrado em `audit_logs`.

## 6. Relatórios de receita (admin)

MRR, assinaturas ativas por plano, destaques vendidos, receita por cidade, inadimplência, banners (impressões/cliques/CTR).
