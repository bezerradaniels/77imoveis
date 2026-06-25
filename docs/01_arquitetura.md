# 77Imóveis — Arquitetura do Sistema

## 1. Visão geral

```
┌──────────────────────────────────────────────────────────────┐
│                     NAVEGADOR (mobile-first)                   │
│   Páginas públicas (HTML pré-gerado)  +  Painéis (client-side) │
└───────────────┬───────────────────────────────┬──────────────┘
                │ HTML estático/SSG              │ chamadas autenticadas
                ▼                                ▼
┌───────────────────────────┐      ┌──────────────────────────────┐
│  HOSTINGER (CDN/Nginx)     │      │  SUPABASE                    │
│  Build Next.js exportado   │      │  - PostgreSQL + PostGIS      │
│  (HTML/CSS/JS + sitemap)   │      │  - Auth (JWT)                │
│  Cloudflare na frente      │      │  - Storage (fotos/logos)     │
└───────────────────────────┘      │  - RLS (segurança por linha) │
                ▲                   │  - Edge Functions (webhooks) │
                │ rebuild           └───────────┬──────────────────┘
                │ (ISR via webhook)             │
┌───────────────┴────────────┐                  ▼
│  Pipeline de build/deploy  │      ┌──────────────────────────────┐
│  GitHub Actions → Hostinger│      │  GATEWAY DE PAGAMENTO (Asaas/ │
└────────────────────────────┘      │  Mercado Pago) — Pix/boleto   │
                                     └──────────────────────────────┘
```

## 2. Estratégia de renderização (a decisão mais importante)

Você escolheu a hospedagem mais econômica. Para não perder SEO, a arquitetura separa o site em duas camadas:

### Camada A — Páginas públicas (precisam de SEO) → **SSG (pré-geradas)**
São geradas como **HTML real no momento do build** com `generateStaticParams`, então o Google e os robôs de IA recebem a página completa, não uma tela em branco.

Páginas SSG:
- Home
- `/{cidade}` (ex.: `/vitoria-da-conquista`)
- `/{cidade}/{tipo}` (ex.: `/vitoria-da-conquista/casas`)
- `/{cidade}/{bairro}` e `/{cidade}/{bairro}/{tipo}`
- `/imovel/{slug}` (cada anúncio ativo)
- `/profissionais` e `/empresa/{slug}`
- `/blog` e `/blog/{slug}`

**Atualização do conteúdo:** quando um anúncio é criado/editado/ativado, uma **Edge Function** dispara um *rebuild incremental* via webhook no GitHub Actions (apenas as rotas afetadas + sitemap). Resultado: SEO de site estático com frescor próximo de tempo real, sem precisar de servidor Node caro. Há também um rebuild noturno de segurança.

### Camada B — Áreas logadas (não precisam de SEO) → **client-side + Supabase**
Painel da empresa, painel do particular, admin, criação/edição de anúncio. Renderizam no navegador e falam direto com o Supabase usando o token do usuário (protegido por RLS). Não são indexadas.

> **Trade-off assumido:** anúncios novos só aparecem para o Google após o rebuild (segundos a poucos minutos via webhook; no pior caso, no rebuild noturno). É o melhor SEO possível dentro de hospedagem econômica. Caso a operação cresça, migra-se a Camada A para SSR/ISR em VPS sem reescrever o app (ver Roadmap).

## 3. Stack

| Camada | Tecnologia |
|---|---|
| Framework | **Next.js (App Router)** com `output: export` para as rotas públicas |
| Linguagem | **TypeScript** |
| Estilo | **Tailwind CSS** + design tokens (slate/cyan/sky) + modo escuro |
| UI | Componentes próprios no padrão shadcn/ui (Radix + Tailwind) |
| Banco | **PostgreSQL** (Supabase) + **PostGIS** + **pg_trgm** |
| Auth | **Supabase Auth** (e-mail/senha + Google opcional) |
| Arquivos | **Supabase Storage** (buckets: `property-images`, `company-logos`, `company-covers`, `blog`) |
| Busca | Postgres FTS (`tsvector` português) + trigram (autocomplete) + PostGIS (raio) |
| Mapas | **Leaflet** + tiles OSM/MapTiler |
| Pagamentos | **Asaas** ou **Mercado Pago** (Pix/boleto/cartão) via Edge Functions + webhooks |
| Hospedagem | **Hostinger** (build estático) + **Cloudflare** (CDN/cache/segurança) |
| CI/CD | **GitHub Actions** → deploy por FTP/SSH na Hostinger |
| Monitoramento | Vercel Analytics alternativo: **Plausible** (leve) + Supabase Logs + Sentry |

## 4. Estrutura de pastas

```
77imoveis/
├─ app/
│  ├─ (public)/                 # rotas SSG (indexáveis)
│  │  ├─ page.tsx               # home
│  │  ├─ [cidade]/
│  │  │  ├─ page.tsx            # imóveis da cidade
│  │  │  ├─ [tipoOuBairro]/page.tsx
│  │  ├─ imovel/[slug]/page.tsx
│  │  ├─ profissionais/page.tsx
│  │  ├─ empresa/[slug]/page.tsx
│  │  ├─ blog/[slug]/page.tsx
│  │  ├─ sitemap.ts
│  │  └─ robots.ts
│  ├─ (auth)/login | cadastro | onboarding/
│  ├─ (app)/painel/             # área logada (client-side)
│  │  ├─ imoveis | contatos | empresa | planos | financeiro/
│  ├─ (admin)/admin/            # painel administrativo
│  └─ layout.tsx
├─ components/
│  ├─ ui/                       # Button, Card, Input, Dialog, Badge...
│  ├─ property/                 # PropertyCard, Gallery, FilterBar, LeadForm...
│  ├─ map/                      # MapView, RadiusSearch
│  ├─ layout/                   # Header, Footer, MobileNav, ThemeToggle
│  └─ seo/                      # JsonLd, Breadcrumbs, MetaTags
├─ lib/
│  ├─ supabase/                 # client.ts, server.ts, types.ts (gerado)
│  ├─ search/                   # parse de filtros da URL
│  ├─ seo/                      # geradores de metadata e JSON-LD
│  └─ payments/                 # cliente do gateway
├─ database/                    # 01_schema.sql, 02_rls.sql, 03_seed.sql
├─ supabase/functions/          # webhooks de pagamento, rebuild-trigger
├─ public/                      # logo, og-images, ícones
└─ styles/ tailwind.config.ts
```

## 5. Acesso a dados (resumo)

- **Rotas públicas (build):** usam o cliente Supabase com a **anon key** e RLS para ler só conteúdo público (`status='ativo'`). Rodam no `generateStaticParams`/server build.
- **Painéis:** cliente Supabase no navegador com o **JWT do usuário**; RLS garante que cada um só vê o que é seu.
- **Webhooks/admin sensível:** Edge Functions com **service_role key** (nunca exposta ao navegador).

## 6. Buckets de Storage e uploads seguros

- Upload assinado (signed URL) gerado pelo backend; validação de tipo/tamanho (máx. ~5 MB/imagem, JPG/PNG/WebP).
- Conversão para **WebP** e geração de tamanhos (thumb/card/full) no upload.
- Política de Storage espelha a RLS: só o dono escreve no caminho `company-{id}/...`.
