import { test, expect } from '@playwright/test';

// Webhook Stripe. Estes testes batem direto no endpoint HTTP e não precisam de
// sessão de usuário. A verificação da assinatura acontece ANTES de qualquer
// escrita no banco, então não geram dados de teste.

const ENDPOINT = '/api/webhooks/stripe';

test('sem header stripe-signature retorna 400', async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    data: { id: 'evt_test', type: 'invoice.paid' },
  });
  expect(res.status()).toBe(400);
});

test('assinatura inválida retorna 400', async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    headers: { 'stripe-signature': 't=1,v1=assinatura-obviamente-errada' },
    data: { id: 'evt_test', type: 'invoice.paid' },
  });
  expect(res.status()).toBe(400);
});
