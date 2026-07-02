# Asaas — Configuração de Webhook

Guia para registrar e testar o webhook de pagamentos do Asaas.

> **Status do registro (produção):** Webhook `77imoveis Pagamentos Producao` criado e **Ativado** em 02/07/2026 no painel https://www.asaas.com → Integrações → Webhooks.
> Versão da API `v3`, tipo de envio `Sequencial`, fila de sincronização ativa, e-mail de falhas `daniel.ddsb@gmail.com`.

## 1. URL do Webhook

**Produção:**
```
https://77imoveis.com.br/api/webhooks/asaas
```

**Desenvolvimento (localhost):**
```
http://localhost:3000/api/webhooks/asaas
```

**Desenvolvimento (via ngrok ou tunnel):**
```
https://<seu-tunnel>.ngrok.io/api/webhooks/asaas
```

## 2. Registrar no Painel do Asaas

1. Acesse https://app.asaas.com (ou sandbox em https://app-sandbox.asaas.com)
2. Vá para **Integrações → Webhooks** (menu Configurações da conta → aba Integração → Webhooks)
3. Clique em **Adicionar Webhook**
4. Preencha:
   - **Nome:** identificação livre (ex.: `77imoveis Pagamentos Producao`)
   - **URL:** Cole a URL acima
   - **E-mail:** endereço para notificação em caso de falhas
   - **Versão da API:** `v3`
   - **Token de autenticação:** Use o valor de `ASAAS_WEBHOOK_TOKEN` do `.env.local` / Supabase Secrets.
     Esse token é enviado pelo Asaas no header **`asaas-access-token`** de toda requisição.
   - **Tipo de envio:** `Sequencial` (garante ordem correta das transições de status)
   - **Este Webhook ficará ativo?** e **Fila de sincronização ativada?** → ambos **ligados**
     (se a fila ficar desativada, o webhook aparece como "Interrompido" e não entrega eventos)
5. Selecione os eventos:
   - ✅ `PAYMENT_RECEIVED`
   - ✅ `PAYMENT_CONFIRMED`
   - ✅ `PAYMENT_DELETED`
   - ✅ `PAYMENT_REFUNDED`
   - ✅ `PAYMENT_CHARGEBACK_REQUESTED`
6. Clique em **Salvar**

> ⚠️ **Correção:** o evento `PAYMENT_CANCELLED` **não existe no Asaas** e por isso não pode ser
> selecionado. Cancelamentos chegam como `PAYMENT_DELETED` (já incluído acima e mapeado para
> `cancelado`). São **5 eventos**, não 6.

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
| `PAYMENT_DELETED` | `cancelado` |
| `PAYMENT_OVERDUE` | `falhou` |
| Outros | `pendente` |

> `PAYMENT_CANCELLED` foi removido da tabela por não ser um evento válido do Asaas.

## 5. Testar o Webhook

### 5.1 Via Painel do Asaas
1. Acesse **Integrações → Webhooks**
2. Clique no webhook criado
3. Verifique as entregas na aba **Logs de Webhooks**
4. Verifique os logs em **Supabase → Functions → Logs**

### 5.2 Via cURL (manual)
```bash
curl -X POST https://77imoveis.com.br/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: $ASAAS_WEBHOOK_TOKEN" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "id": "pay_123456",
    "payment": {
      "id": "pay_123456",
      "subscription": "sub_123456",
      "externalReference": "plan:company-id:plan-id:timestamp",
      "status": "RECEIVED",
      "value": 39.90
    }
  }'
```

> ⚠️ **Validação:** o Asaas envia o token no header **`asaas-access-token`** (não `Webhook-Token`).
> A rota API `app/api/webhooks/asaas/route.ts` **valida esse header** — caso contrário os eventos
> reais do Asaas retornam 401 e a fila é pausada automaticamente após 15 tentativas.

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
5. Asaas envia webhook PAYMENT_RECEIVED (header asaas-access-token)
   ↓
6. Edge Function handle-asaas-webhook:
   - Valida token (asaas-access-token)
   - Atualiza payments.status = 'pago'
   - Atualiza subscriptions.status = 'ativa'
   - Define current_period_end
   ↓
7. (Futuro) Página de confirmação poll ou websocket mostra sucesso
```

## 7. Troubleshooting

### Webhook não dispara
- Verifique se a URL está correta e acessível (`https://77imoveis.com.br/api/webhooks/asaas`)
- Confirme que o webhook está **Ativado** e a **fila de sincronização** está ativa (status ≠ "Interrompido")
- Teste via cURL manualmente
- Verifique logs no Hostinger (aplicação Node.js) ou console local (`npm run dev`)

### Erro 401 "Unauthorized"
- Token inválido ou não enviado
- Confirme que a função lê o header **`asaas-access-token`** (nome exato usado pelo Asaas)
- Verifique `ASAAS_WEBHOOK_TOKEN` no `.env.local` ou Supabase Secrets e que o valor bate com o
  configurado no painel do Asaas

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

Configuradas em `.env.local` (desenvolvimento) e Hostinger (produção):

```
ASAAS_WEBHOOK_TOKEN = (token gerado no painel Asaas)
ASAAS_API_KEY = (chave de API do Asaas)
ASAAS_ENV = production (ou sandbox)
```

No Hostinger, adicionar via painel de Variáveis de Ambiente da aplicação Node.js.
