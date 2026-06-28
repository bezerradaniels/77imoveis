# 🗺️ Mapa do código — 77Imóveis

Guia rápido de **onde mexer** para cada tipo de alteração. A regra de ouro:
cada coisa tem **um lugar só**. Mudou ali, mudou no site todo.

---

## Estrutura das pastas

```
app/                      → as páginas (cada pasta = uma rota/URL)
  layout.tsx              → moldura do site (tema, fonte, cabeçalho e rodapé)
  globals.css             → CORES e tema (identidade VERDE #0E9D74, claro/escuro)
  (public)/               → páginas públicas (aparecem no Google)
    page.tsx              → a HOME
    [cidade]/[[...rest]]/ → listagem/busca: /cidade e /cidade/tipo
    imovel/[slug]/        → página de um imóvel
  (auth)/entrar, cadastro → login e criação de conta
  painel/                 → área logada (imóveis, contatos, criar/editar)
  anunciar/               → atalho: vai p/ cadastro ou novo anúncio
middleware.ts             → renova sessão e protege /painel e /admin
components/               → peças reutilizáveis
  layout/   Header, Footer, ThemeToggle
  ui/       Button, Dropdown (peças genéricas)
  property/ PropertyCard, FilterBar (filtros da busca), Gallery (fotos)
  home/     HomeSearch (card de busca da home)
  seo/      JsonLd (dados para Google/IA)
lib/                      → lógica e dados (sem visual)
  data.ts                → TODAS as consultas ao banco
  format.ts              → formatação (preço em R$, etc.)
  cn.ts                  → junta classes de estilo
  supabase/              → conexão com o banco
database/                → scripts SQL do banco (01 a 06)
docs/                    → documentação do projeto
```

---

## "Quero mudar..." → vá em:

| O que você quer mudar | Onde mexer |
|---|---|
| **Cores** do site (cyan/sky, claro/escuro) | `app/globals.css` (variáveis no topo) |
| Fonte | `app/layout.tsx` |
| **Links do menu** do topo | `components/layout/Header.tsx` (lista `nav`) |
| Rodapé (cidades, links) | `components/layout/Footer.tsx` |
| **O que aparece na home** (quais imóveis, ordem) | `lib/data.ts` + `app/(public)/page.tsx` |
| **Listagem/busca** (resultados, paginação, SEO) | `app/(public)/[cidade]/[[...rest]]/page.tsx` |
| **Filtros da busca** (modalidade, preço, quartos, ordem) | `components/property/FilterBar.tsx` |
| **Página do imóvel** (galeria, contato, modalidades) | `app/(public)/imovel/[slug]/page.tsx` |
| **Login / cadastro** | `app/(auth)/` + `components/auth/` + `lib/auth.ts` |
| **Painel** (imóveis, contatos) | `app/painel/` + `components/painel/` |
| **Criar/editar anúncio** (form, fotos, modalidades) | `components/painel/PropertyForm.tsx` + `app/painel/actions.ts` |
| Como o **card de imóvel** se parece | `components/property/PropertyCard.tsx` |
| **Consulta ao banco** (buscar mais/menos dados) | `lib/data.ts` |
| Formato do **preço** | `lib/format.ts` |
| O **dropdown** (visual) | `components/ui/Dropdown.tsx` |
| Botões | `components/ui/Button.tsx` |
| **Estrutura do banco** (tabelas, colunas) | `database/*.sql` + aplicar no Supabase |

---

## Receitas rápidas

**Criar uma página nova** (ex.: `/sobre`): crie `app/(public)/sobre/page.tsx` com
uma função que retorna o conteúdo. A URL vira o caminho da pasta.

**Adicionar uma seção na home**: abra `app/(public)/page.tsx` e adicione um
`<section>`. Se precisar de dados do banco, crie a consulta em `lib/data.ts`
e use `await` no topo da função `HomePage`.

**Mudar um texto/cor**: cores em `app/globals.css`; textos direto na página/componente.

**Mexer no banco**: edite/crie um arquivo em `database/`, rode no Supabase
(SQL Editor) e rode `npm run db:types` para atualizar os tipos no código.

---

## Princípios mantidos

- **Server Components** buscam os dados (bom para SEO e velocidade); só o que
  precisa de clique vira `'use client'` (Dropdown, ThemeToggle, SearchBar).
- **Uma fonte de verdade**: dados em `lib/data.ts`, cores em `globals.css`.
- **Componentes pequenos** e reutilizados (menos código, menos bug).
- **Tailwind** para estilo (classes no próprio elemento, sem CSS espalhado).

---

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves do Supabase
npm run dev                  # abre em http://localhost:3000
```

Publicar: basta enviar para o GitHub (`git push`) — a Hostinger reconstrói e
publica sozinha.
