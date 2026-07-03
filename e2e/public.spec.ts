import { test, expect } from '@playwright/test';

// Regressão pública (Fase 5, itens 1–4): não exige sessão nem dados de conta.
// Os fluxos autenticados (criar/editar imóvel, empresa, admin, webhook) precisam
// de usuários de teste e ficam para uma suíte separada com seed dedicado.

test('home carrega sem erro de console', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  const response = await page.goto('/');
  expect(response?.status()).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
  expect(errors, `Erros de console: ${errors.join(' | ')}`).toHaveLength(0);
});

test('busca sem filtros leva para /imoveis', async ({ page }) => {
  const response = await page.goto('/imoveis');
  expect(response?.status()).toBeLessThan(400);
  await expect(page).toHaveURL(/\/imoveis/);
});

test('/painel sem sessão redireciona para o login', async ({ page }) => {
  await page.goto('/painel');
  await expect(page).toHaveURL(/\/entrar\?next=%2Fpainel/);
});

test('/admin sem sessão redireciona para o login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/entrar\?next=%2Fadmin/);
});

test('login inválido mostra mensagem de erro', async ({ page }) => {
  await page.goto('/entrar');
  await page.getByLabel('E-mail').fill('naoexiste@example.com');
  // Com o htmlFor, o label "Senha" (exato) resolve só o input — o botão de
  // mostrar senha tem seu próprio aria-label ("Mostrar senha") e não é capturado.
  await page.getByLabel('Senha', { exact: true }).fill('senha-invalida');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText('E-mail ou senha inválidos.')).toBeVisible();
});
