# Asaas — Configuração de Webhook

Guia para registrar e testar o webhook de pagamentos do Asaas.

## 1. URL do Webhook

**Produção:**
```
https://77imoveis.com.br/functions/v1/handle-asaas-webhook
```

**Desenvolvimento (via ngrok ou tunnel):**
```
https://<seu-tunnel>.ngrok.io/functions/v1/handle-asaas-webhook
```

## 2. ⚠️ Atenção ao Token

**IMPORTANTE:** O token no `.env.local` começa com `whsec_`, que é o formato do Stripe, **não do Asaas**. Isso pode estar incorreto.

Ao registrar o webhook no Asaas, você receberá um **token de autenticação diferente** (gerado pelo Asaas). Substitua o valor em `.env.local` e nas secrets do Supabase pelo token real do Asaas.

A validação é feita no header `asaas-access-token` (enviado pelo Asaas em cada webhook).

## 2. Registrar no Painel do Asaas

1. Acesse https://app.asaas.com (ou sandbox em https://app-sandbox.asaas.com)
2. Vá para **Configurações → Webhooks**
3. Clique em **Novo Webhook**
4. Preencha:
   - **URL:** Cole a URL acima
   - **Token de autenticação:** Será gerado pelo Asaas (copie e salve em `.env.local`)
5. Selecione os eventos:
   - ✅ `PAYMENT_RECEIVED`
   - ✅ `PAYMENT_CONFIRMED`
   - ✅ `PAYMENT_DELETED`
   - ✅ `PAYMENT_CANCELLED`
   - ✅ `PAYMENT_REFUNDED`
   - ✅ `PAYMENT_CHARGEBACK_REQUESTED`
6. Clique em **Salvar**

## 3. Eventos Processados

O webhook processa **três tipos de referência externa**:

### 3.1 Assinaturas (`plan:company_id:plan_id:timestamp`)
- **Evento:** `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED`
- **Ação:** Atualiza `subscriptions.status = 'ativa'` e `payments.status = 'pago'`
- **Validade:** Define `current_period_end` conforme o intervalo (30 dias ou 1 ano)

### 3.2 Destaques de Imóvel (`propertyId-destaque_7/15/30`)
- **Evento:** Qualquer evento de pagamento
- **Ação:** Cria `listing_features` com `status='ativo'`
- **Duração:** Conforme o produto (7, 15 ou 30 dias)

### 3.3 Vitrine (`companyId-vitrine-{dias}`)
- **Evento:** `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED`
- **Ação:** Ativa `storefronts.status='ativo'` e registra em `storefront_activations`
- **Duração:** 30, 90 ou 365 dias

## 4. Mapeamento de Status

| Evento Asaas | Status Local |
|---|---|
| `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED` | `pago` |
| `PAYMENT_REFUNDED`, `PAYMENT_CHARGEBACK_REQUESTED` | `estornado` |
| `PAYMENT_DELETED`, `PAYMENT_CANCELLED` | `cancelado` |
| `OVERDUE` | `falhou` |
| Outros | `pendente` |

## 5. Testar o Webhook

### 5.1 Via Painel do Asaas
1. Acesse **Configurações → Webhooks**
2. Clique no webhook criado
3. Clique em **Testar**
4. Verifique os logs em **Supabase → Functions → Logs**

### 5.2 Via cURL (manual)
```bash
curl -X POST https://77imoveis.com.br/functions/v1/handle-asaas-webhook \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: $ASAAS_WEBHOOK_TOKEN" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "id": "pay_123456",
    "subscription": "sub_123456",
    "externalReference": "plan:company-id:plan-id:timestamp",
    "status": "RECEIVED",
    "value": 39.90
  }'
```

## 6. Fluxo Completo de Pagamento

```
1. Usuário clica em "Assinar plano"
   ↓
2. startPlanCheckout() cria:
   - Customer no Asaas
   - Subscription no Asaas
   - Subscription local (status='pendente')
   - Payment local (status='pendente')
   ↓
3. Redirecionado para /confirmacao-pagamento?status=pendente
   ↓
4. Usuário paga (Pix, boleto ou cartão)
   ↓
5. Asaas envia webhook PAYMENT_RECEIVED
   ↓
6. Edge Function handle-asaas-webhook:
   - Valida token
   - Atualiza payments.status = 'pago'
   - Atualiza subscriptions.status = 'ativa'
   - Define current_period_end
   ↓
7. (Futuro) Página de confirmação poll ou websocket mostra sucesso
```

## 7. Troubleshooting

### ⚠️ Erro 401 "Unauthorized" (fila pausada)
**Esta é a causa mais comum de falha!**

- ❌ Token inválido ou expirado
- ❌ Header errado (deve ser `asaas-access-token`, não `webhook-token`)
- ❌ Token do Stripe (começa com `whsec_`) ao invés do Asaas

**Solução:**
1. Acesse painel do Asaas → **Configurações → Webhooks**
2. Verifique o token gerado (será exibido apenas uma vez)
3. Copie e substitua em `.env.local`: `ASAAS_WEBHOOK_TOKEN=<token-novo>`
4. Atualize as secrets no Supabase
5. Clique em **Reprocessar** ou **Testar** novamente

**Cuidado:** Após 15 tentativas com 401, o Asaas pausa a fila automaticamente. Pode precisar ativar manualmente no painel.

### Webhook não dispara
- Verifique se a URL está correta e acessível
- Teste via cURL manualmente
- Verifique logs do Supabase: **Supabase → Functions → handle-asaas-webhook**

### Erro 401 "Unauthorized"
- Token inválido ou não enviado
- Verifique `ASAAS_WEBHOOK_TOKEN` no `.env.local` ou Supabase Secrets

### Pagamento não ativa assinatura
- Verifique se `externalReference` está correto
- Confirme se `subscription_id` foi criado localmente antes do webhook
- Verifique se o `event` está na lista de eventos processados

### Teste em Sandbox
```bash
# .env.local
ASAAS_ENV=sandbox
ASAAS_API_KEY=<chave-de-teste-do-asaas>
NEXT_PUBLIC_SUPABASE_URL=<url-projeto-teste>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<chave-anonima>
```

1. Registre webhook em https://app-sandbox.asaas.com
2. Crie um pagamento de teste
3. Confirme via painel sandbox
4. Verifique logs locais / Supabase

## 8. Variáveis de Ambiente

Adicionar no Supabase → Project Settings → Secrets:

```
ASAAS_WEBHOOK_TOKEN = (valor de .env.local)
ASAAS_API_KEY = (chave pública Asaas)
ASAAS_ENV = production (ou sandbox)
```

O webhook acessa `Deno.env.get()`, não `.env`, então as secrets precisam estar no Supabase.
