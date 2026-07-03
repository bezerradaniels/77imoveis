# Testes E2E (Playwright)

Rodar tudo:

```bash
npm run test:e2e            # sobe `npm run dev` e roda contra localhost:3000
```

Opções úteis:

```bash
npx playwright test --project=chromium        # só desktop
npx playwright test e2e/public.spec.ts        # um arquivo
E2E_BASE_URL=https://staging.exemplo.com npx playwright test  # contra outro host (não sobe dev server)
```

## O que roda sem configuração

- **`public.spec.ts`** — home, `/imoveis`, redirects de `/painel` e `/admin`, login inválido e o label de senha (a11y). Não precisa de sessão nem banco.
- **`webhook-stripe.spec.ts`** — valida `400` (sem header `stripe-signature` / assinatura inválida). Não precisa de credenciais: a verificação da assinatura acontece antes de qualquer escrita.

## Fluxos autenticados (auto-skip sem credenciais)

`authenticated.spec.ts` faz login pela UI real. Sem as variáveis abaixo, os testes ficam **skipped** (a suíte continua verde). Defina no ambiente antes de rodar:

```bash
export E2E_USER_EMAIL=...        # conta anunciante (profissional) de teste
export E2E_USER_PASSWORD=...
export E2E_ADMIN_EMAIL=...       # conta admin/moderador de teste
export E2E_ADMIN_PASSWORD=...
```

Use um **projeto Supabase de teste/staging**, nunca produção — os fluxos criam e removem dados.

### Cenários marcados com `test.fixme`

Criar/publicar/editar/remover imóvel, salvar empresa + corretores e remoção via admin
estão como `fixme` com o passo a passo comentado. Eles dependem de **seed estável**
(tipo de imóvel, cidade, bairro, e idealmente `data-testid` nos formulários) para não
virarem testes frágeis. Preencha-os contra o ambiente de teste quando o seed existir.
