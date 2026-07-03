import { test, expect } from '@playwright/test';
import {
  loginAs,
  hasUserCreds,
  hasAdminCreds,
  USER_EMAIL,
  USER_PASSWORD,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} from './helpers';

// Fluxos autenticados (Fase 5, itens 5–12). Precisam de contas de teste no
// Supabase correto — auto-skip quando as credenciais não estão configuradas,
// para o `npx playwright test` continuar verde por padrão. Ver e2e/README.md.

test.describe('painel do anunciante', () => {
  test.skip(!hasUserCreds(), 'defina E2E_USER_EMAIL / E2E_USER_PASSWORD');

  test('login leva a "Meus imóveis"', async ({ page }) => {
    await loginAs(page, USER_EMAIL, USER_PASSWORD, '/painel/imoveis');
    await expect(page).toHaveURL(/\/painel\/imoveis/);
    await expect(page.getByRole('heading', { name: 'Meus imóveis' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Novo' })).toBeVisible();
  });

  test('abre o formulário de novo anúncio', async ({ page }) => {
    await loginAs(page, USER_EMAIL, USER_PASSWORD, '/painel/imoveis');
    await page.getByRole('link', { name: 'Novo' }).click();
    await expect(page).toHaveURL(/\/painel\/imoveis\/novo/);
  });

  // Fluxo completo de criação: depende de dados de referência (tipo, cidade,
  // bairro) e de upload de fotos. Fica documentado para ser preenchido contra
  // um ambiente com seed estável — evita seletores adivinhados e frágeis.
  test.fixme('cria rascunho, publica, edita e remove um imóvel', async ({ page }) => {
    // 1. loginAs(user) → /painel/imoveis/novo
    // 2. Preencher título, descrição, tipo, cidade, bairro, ao menos 1 modalidade
    //    com preço, e adicionar 1 foto (input file).
    // 3. Salvar como rascunho → conferir status "Rascunho" na lista.
    // 4. Publicar → conferir status "Ativo" e visita a /imovel/[slug] (200).
    // 5. Editar um campo, salvar, recarregar e conferir persistência.
    // 6. Remover (PropertyActions) → conferir sumiço da vitrine pública.
  });

  // Empresa + corretores (achados críticos #2/#3). Requer conta profissional.
  test.fixme('salva empresa com cidades/especialidades e gerencia corretores', async ({ page }) => {
    // 1. loginAs(user) → /painel/empresa
    // 2. Preencher dados, marcar 2 cidades de atuação e 2 especialidades → salvar.
    // 3. Recarregar e conferir que cidades/especialidades persistiram.
    // 4. /painel/corretores → salvar 2 corretores, recarregar, conferir persistência.
    // 5. Editar para 3 corretores, recarregar, conferir os 3.
  });
});

test.describe('painel admin', () => {
  test.skip(!hasAdminCreds(), 'defina E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD');

  test('admin acessa /admin/imoveis sem ser redirecionado', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD, '/admin/imoveis');
    // O layout de /admin manda não-admin para /painel; admin permanece.
    await expect(page).toHaveURL(/\/admin\/imoveis/);
  });

  // Remoção via admin (achado #4): a action agora confirma linha afetada.
  test.fixme('admin remove imóvel e ele some das telas públicas', async ({ page }) => {
    // 1. loginAs(admin) → /admin/imoveis
    // 2. Localizar uma linha de imóvel ativo (idealmente semeado para o teste).
    // 3. Clicar "Remover" e aceitar o confirm() (page.on('dialog', d => d.accept())).
    // 4. Conferir que o imóvel deixou de aparecer em /imoveis e /imovel/[slug].
  });
});
