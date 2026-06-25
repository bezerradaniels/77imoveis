# 77Imóveis — Deploy na Hostinger

Arquitetura econômica: **site estático (SSG)** servido pela Hostinger, com Supabase na nuvem e Cloudflare na frente.

## 1. Pré-requisitos

- Conta Hostinger (hospedagem com domínio `77imoveis.com.br`).
- Projeto Supabase criado (banco + auth + storage).
- Conta no gateway (Asaas/Mercado Pago).
- Conta Cloudflare (gratuita) para CDN/cache/SSL/WAF.
- Repositório GitHub.

## 2. Variáveis de ambiente

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # só no CI / Edge Functions
NEXT_PUBLIC_SITE_URL=https://77imoveis.com.br
NEXT_PUBLIC_MAPTILER_KEY=...
PAYMENT_PROVIDER=asaas
ASAAS_API_KEY=...                    # só no servidor/Edge
ASAAS_WEBHOOK_TOKEN=...
TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...             # só no servidor
```

## 3. Build estático

`next.config.js` com `output: 'export'`. O build gera a pasta `out/` com HTML/CSS/JS + sitemap.

```bash
npm ci
npm run build         # gera ./out
```

## 4. Deploy automático (GitHub Actions → Hostinger)

```yaml
# .github/workflows/deploy.yml (resumo)
on:
  push: { branches: [main] }
  workflow_dispatch:           # permite rebuild manual / via webhook
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build      # env vars vêm dos GitHub Secrets
      - name: Upload via FTP/SSH
        uses: SamKirkland/FTP-Deploy-Action@v4
        with:
          server: ${{ secrets.HOSTINGER_FTP_HOST }}
          username: ${{ secrets.HOSTINGER_FTP_USER }}
          password: ${{ secrets.HOSTINGER_FTP_PASS }}
          local-dir: ./out/
          server-dir: /public_html/
```

## 5. Rebuild incremental (frescor do conteúdo)

Quando um anúncio muda, uma Edge Function chama o **`workflow_dispatch`** do GitHub (repository_dispatch) para refazer o build e reenviar. Há também um **cron noturno** de segurança (GitHub Actions schedule). Assim o conteúdo novo entra no ar sem servidor Node pago.

## 6. Configuração Hostinger

- Apontar domínio para a Hostinger (ou usar Cloudflare como DNS/proxy — recomendado).
- `.htaccess` para: forçar HTTPS, gzip/brotli, cache de assets, e rotas amigáveis (fallback para páginas exportadas).
- SSL ativo (Hostinger + Cloudflare).

## 7. Cloudflare (recomendado)

- DNS proxied (laranja) → CDN global + cache.
- Regras de cache para `/_next/static/*` (imutável) e HTML (revalidação).
- WAF + rate limiting + Turnstile (CAPTCHA).

## 8. Supabase em produção

- Aplicar `01_schema.sql`, `02_rls.sql`, `03_seed.sql`.
- Configurar Auth (e-mail, redirect URLs, templates em pt-BR).
- Criar buckets de Storage + políticas.
- Publicar Edge Functions (webhooks, expire-features, rebuild-trigger).
- Backups automáticos (plano Supabase) + export periódico.

## 9. Caminho de upgrade (se crescer)

Trocar `output: export` por **SSR/ISR** rodando Node em **VPS Hostinger (KVM) + PM2 + Nginx** (ou Vercel). Como a separação Camada A/B já existe, é só mudar o modo de renderização das rotas públicas — sem reescrever o app. Resultado: conteúdo em tempo real e SEO ainda melhor.
