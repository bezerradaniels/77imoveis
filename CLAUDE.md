# 77Imóveis — contexto para o Claude Code

Portal imobiliário regional do **DDD 77** (oeste/sudoeste da Bahia). Conteúdo 100% em **pt-BR**, mobile-first, com SEO/GEO como prioridade.

## Stack
- **Next.js (App Router) + TypeScript + Tailwind** — modo SSR (Node) na Hostinger.
- **Supabase** (PostgreSQL + Auth + Storage) — banco **já criado e populado** (ver `/database`).
- Pagamentos: gateway brasileiro (Asaas/Mercado Pago) — Pix/boleto/cartão (fase futura).
- Publica via GitHub → Hostinger (Aplicativo Node.js conectado ao repo).

## Convenções (IMPORTANTES — manter)
- **Código enxuto e simples** (menos linhas, menos arquivos). Sem over-engineering.
- **Toda consulta ao banco fica em `lib/data.ts`** (uma fonte de verdade).
- **Cores/tema só em `app/globals.css`** (variáveis CSS) + `tailwind.config.ts`.
- Server Components buscam dados (SEO/perf); só vira `'use client'` o que precisa de clique.
- Componentes pequenos e reutilizáveis em `components/`.
- Veja **`MAPA.md`** para "onde mexer para cada coisa".

## Banco de dados (NÃO recriar — já existe no Supabase)
- Migrações versionadas em `/database` (01→06). Para mudanças, criar novo arquivo e aplicar.
- Tabelas-chave: `properties` (+ `property_images`, `property_features`, `property_negotiations`,
  `property_availabilities`), `cities`/`neighborhoods` (PostGIS + autocomplete), `companies`/`brokers`,
  `leads`, `plans`/`subscriptions`/`payments`/`listing_features`, `storefronts` (vitrine), `banners`, `blog_posts`.
- Regras no banco (triggers): limite de 1 imóvel ativo p/ Particular; sincronização da modalidade
  principal (`property_negotiations` → `properties`); vitrine só ativa via pagamento; RLS em tudo.
- Modalidades de negociação: venda, aluguel, temporada, **romaria**, lançamento — um imóvel pode ter
  **várias ao mesmo tempo**, cada uma com seu preço (`property_negotiations`).
- Após mudar o schema, rodar `npm run db:types` para atualizar `lib/supabase/types.ts`.

## O que já está pronto
- Banco completo (schema, RLS, seed das 7 cidades + bairros, catálogo, planos, vitrine, merge/romaria).
- Base do app: tema claro/escuro, `Header`, `Footer`, `Button`, `Dropdown`, `PropertyCard`, `SearchBar`.
- **Home** (`app/(public)/page.tsx`) ligada ao banco (cidades, tipos, imóveis em destaque).
- Documentação completa em `/docs` (PRD, arquitetura, SEO/GEO, monetização, segurança, deploy, roadmap).
- Telas desenhadas e aprovadas (referência visual): Home, Página do imóvel, Listagem/busca,
  Painel do corretor, Cadastro/onboarding, Vitrine, Criar/editar anúncio (com merge + dropdowns), Admin.

## Próximos passos (roadmap de implementação)
3. **Listagem/busca** (`/[cidade]/[tipo]`) + **Página do imóvel** (`/imovel/[slug]`) — ligadas ao banco, com
   filtros na URL, JSON-LD, breadcrumbs, metadata dinâmica. (maior prioridade: tráfego e leads)
4. **Cadastro** (2 etapas) + **Criar/editar anúncio** (merge de modalidades, dropdowns estilizados, upload de fotos).
5. **Painel do corretor** (mobile-first, lista de contatos), depois **Vitrine** e **Admin**.
6. Pagamentos (Asaas/Mercado Pago), leads/anti-spam, blog/CMS, performance e LGPD.

## Comandos
```bash
npm install
npm run dev        # desenvolvimento (localhost:3000)
npm run build      # build de produção
npm run typecheck  # checagem de tipos
npm run db:types   # regenera os tipos do Supabase
```
Publicar = `git push` na branch `main` (a Hostinger reconstrói e publica).

## Segurança
RLS em todas as tabelas; `service_role` só no servidor/webhooks. Validar entradas (Zod),
anti-spam nos leads (Turnstile + honeypot), uploads validados. Rodar o advisor do Supabase após mudanças no schema.
