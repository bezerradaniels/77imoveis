import { type Page, expect } from '@playwright/test';

// Credenciais de teste vêm do ambiente — nunca commitadas. Configure antes de
// rodar os fluxos autenticados (ver e2e/README.md):
//   E2E_USER_EMAIL / E2E_USER_PASSWORD    → conta anunciante (profissional)
//   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD  → conta admin/moderador
export const USER_EMAIL = process.env.E2E_USER_EMAIL || '';
export const USER_PASSWORD = process.env.E2E_USER_PASSWORD || '';
export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || '';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || '';

export const hasUserCreds = () => Boolean(USER_EMAIL && USER_PASSWORD);
export const hasAdminCreds = () => Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);

// Faz login pela UI real e espera sair da tela de login. `next` controla para
// onde o formulário redireciona após autenticar.
export async function loginAs(page: Page, email: string, password: string, next = '/painel/imoveis') {
  await page.goto(`/entrar?next=${encodeURIComponent(next)}`);
  await page.getByLabel('E-mail').fill(email);
  // exact: o botão "Mostrar senha" também contém "senha" (ver correção de a11y).
  await page.getByLabel('Senha', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/entrar'), { timeout: 15_000 });
  await expect(page).not.toHaveURL(/\/entrar/);
}
