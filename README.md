# 77Imóveis 🏠

Portal imobiliário regional do **DDD 77** (oeste e sudoeste da Bahia). Mobile-first, otimizado para SEO e para buscas por IA (GEO), conteúdo 100% em **pt-BR**.

> Pacote de planejamento + fundação técnica gerado na fase de discovery. Use os documentos em `/docs` como a especificação do produto e os arquivos em `/database` e `/scaffold` como ponto de partida da construção.

---

## 📂 O que tem aqui

```
77imoveis/
├─ README.md                ← este arquivo (índice + decisões)
├─ docs/                     ← documentação do produto
│  ├─ 00_PRD.md                  Requisitos, escopo, regras de negócio
│  ├─ 01_arquitetura.md          Arquitetura, stack, estrutura de pastas, renderização
│  ├─ 02_banco_de_dados.md       ERD + explicação do banco
│  ├─ 03_design_system.md        Cores, tipografia, componentes, UX, acessibilidade
│  ├─ 04_seo_geo.md              Estratégia de SEO e GEO (buscas por IA)
│  ├─ 05_pagamentos_monetizacao.md  Planos, gateways (Pix/boleto/cartão), webhooks
│  ├─ 06_seguranca_testes.md     RBAC/RLS, anti-spam, LGPD, estratégia de testes
│  ├─ 07_deploy_hostinger.md     Build estático, CI/CD, Cloudflare
│  ├─ 08_roadmap_fluxos.md       Fluxos de usuário + roadmap em milestones
│  └─ 09_api_dados.md            Acesso a dados (Supabase) + Edge Functions
├─ database/                 ← banco PostgreSQL/Supabase (rodar nesta ordem)
│  ├─ 01_schema.sql              Tabelas, enums, índices, triggers, funções
│  ├─ 02_rls.sql                 Políticas de segurança por linha (RLS)
│  └─ 03_seed.sql                Catálogo + 7 cidades do DDD 77 + bairros + planos
└─ scaffold/                 ← fundação do app Next.js
   ├─ package.json, next.config.js, tailwind.config.ts
   ├─ public/logo.svg            Logo do 77Imóveis
   ├─ app/                       globals.css + página de imóvel (SSG + SEO de exemplo)
   ├─ components/                PropertyCard, JsonLd
   └─ lib/                       cliente Supabase, geradores de JSON-LD
```

## ✅ Decisões da discovery

| Tema | Decisão |
|---|---|
| Stack | Next.js + TypeScript + Tailwind, Supabase (banco/auth/storage) |
| Hospedagem | Hostinger econômica → **site estático (SSG)** com rebuild incremental para preservar SEO |
| Busca | PostgreSQL FTS + trigram (autocomplete) + PostGIS (raio no mapa) |
| Mapas | Leaflet + tiles OSM/MapTiler |
| Pagamentos | Gateway brasileiro (Asaas/Mercado Pago): **Pix + boleto + cartão**; Stripe futuro |
| Destaque de imóvel | Pagamento **avulso** (7/15/30 dias) |
| Planos | Particular grátis (1 imóvel) · Profissional grátis (10) · pagos acima |
| Contato | **WhatsApp + formulário**, com registro interno dos leads |
| Painel | Lista simples de contatos (mobile-first) |
| Fora do MVP | Simulador de financiamento e avaliações |
| Visual | Slate + cyan/sky, modo claro/escuro, logo criada |
| Cidades-foco | Vitória da Conquista, Barreiras, Guanambi, Brumado, Bom Jesus da Lapa, Santa Maria da Vitória (+ Luís Eduardo Magalhães) |

## 🚀 Como começar a construir

1. **Banco:** criar projeto no Supabase → rodar `database/01_schema.sql`, `02_rls.sql`, `03_seed.sql` no SQL Editor.
2. **App:** `cd scaffold` → `npm install` → copiar `.env.example` para `.env.local` e preencher → `npm run dev`.
3. **Tipos:** `npm run db:types` para gerar `lib/supabase/types.ts` a partir do banco.
4. Seguir o roadmap em `docs/08_roadmap_fluxos.md` (M0 → M6).

## ⚠️ Nota técnica importante

A hospedagem econômica escolhida exige o modo **estático (SSG)**. Isso preserva a maior parte do SEO (páginas pré-geradas), mas anúncios novos entram no Google após um **rebuild** (segundos a poucos minutos via webhook; senão, no rebuild noturno). Se a operação crescer, dá para migrar as páginas públicas para **SSR/ISR em VPS** sem reescrever o app — detalhes em `docs/01_arquitetura.md` e `docs/07_deploy_hostinger.md`.
