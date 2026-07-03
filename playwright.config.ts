import { defineConfig, devices } from '@playwright/test';

// Config mínima para os testes de regressão públicos (sem sessão).
// Sobe o app em dev e reaproveita um servidor já rodando localmente.
const PORT = Number(process.env.PORT || 3000);
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Pixel 5 usa o mesmo engine (Chromium) — cobre o viewport mobile sem
    // exigir o binário do WebKit. Troque por 'iPhone 13' se rodar em ambiente
    // com `npx playwright install` completo.
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
