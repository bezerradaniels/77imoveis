# 77Imóveis — Estratégia de SEO e GEO

Objetivo: dominar as buscas regionais do DDD 77 ("casa à venda em Barreiras", "apartamento para alugar em Vitória da Conquista", "terreno em Guanambi") no Google **e** ser citado por buscadores de IA (ChatGPT, Gemini, Perplexity).

## 1. Arquitetura de URLs (slugs limpos)

```
/                                         → home
/{cidade}                                 → /vitoria-da-conquista
/{cidade}/{tipo}                          → /barreiras/casas
/{cidade}/{bairro}                        → /guanambi/centro
/{cidade}/{bairro}/{tipo}                 → /brumado/centro/apartamentos
/imovel/{slug}                            → /imovel/casa-3-quartos-recreio-vitoria-da-conquista
/profissionais/{tipo?}                    → /profissionais/construtoras
/empresa/{slug}
/blog/{slug}
```
Filtros adicionais como query string indexável com `canonical` controlado (ex.: `?quartos=3&preco_max=500000`).

## 2. Páginas programáticas (SEO em escala)

Geradas automaticamente no build a partir do banco:
- **Cidade × Tipo** (7 cidades × 12 tipos ≈ 84 páginas só de lançamento).
- **Bairro × Tipo** (dezenas de bairros × tipos = centenas de páginas).
- **Empresa** e **Profissional × Cidade**.
- **Blog** por categoria.

Cada página tem H1 único, texto introdutório próprio (campo `intro_text`/`seo_pages.intro_html`), lista de imóveis e **links internos** para cidades/bairros/tipos relacionados (autoridade tópica).

## 3. Tags e dados estruturados (por página)

- **Semântica:** HTML5 (`header/nav/main/article/section/footer`), 1 `h1` por página.
- **Metadata dinâmica:** `generateMetadata` por rota (title, description, canonical).
- **Open Graph + Twitter Cards:** imagem do imóvel/cidade.
- **JSON-LD / Schema.org:**
  - `RealEstateListing` + `Offer` + `Place`/`GeoCoordinates` na página do imóvel.
  - `Organization`/`LocalBusiness` na página da empresa.
  - `BreadcrumbList` em todas.
  - `FAQPage` nas landings de cidade e nos posts (campo `faq`).
  - `BlogPosting` nos artigos.
- **Sitemap dinâmico** (`sitemap.ts`) com cidades, bairros, tipos, imóveis ativos, empresas e blog; **robots.txt** liberando o público e bloqueando `/painel` e `/admin`.

Exemplo de JSON-LD (imóvel):
```json
{
  "@context":"https://schema.org",
  "@type":"RealEstateListing",
  "name":"Casa 3 quartos no Recreio, Vitória da Conquista",
  "url":"https://77imoveis.com.br/imovel/...",
  "image":["..."],
  "offers":{"@type":"Offer","price":450000,"priceCurrency":"BRL"},
  "address":{"@type":"PostalAddress","addressLocality":"Vitória da Conquista","addressRegion":"BA","addressCountry":"BR"},
  "geo":{"@type":"GeoCoordinates","latitude":-14.86,"longitude":-40.84}
}
```

## 4. Performance (entra direto no SEO)

- HTML pré-gerado (SSG) → resposta instantânea via CDN.
- Imagens em **WebP/AVIF**, `loading="lazy"`, `width/height` definidos (sem layout shift), `srcset` responsivo.
- Code splitting por rota; JS mínimo nas páginas públicas; fontes locais com `swap`.
- Cache agressivo no Cloudflare; **meta Lighthouse ≥ 95** e Core Web Vitals "bom" (LCP < 2,5s, INP < 200ms, CLS < 0,1).

## 5. GEO — Generative Engine Optimization (buscas por IA)

Para ser **citado** por ChatGPT/Gemini/Perplexity:
- **Resumos legíveis por máquina:** cada landing começa com um parágrafo objetivo respondendo "o que/onde/quanto" (ex.: faixa de preço média de casas no bairro).
- **FAQs estruturadas** (`FAQPage`) com perguntas conversacionais: *"Quanto custa um apartamento no Centro de Barreiras?"*, *"Quais bairros são mais procurados em Vitória da Conquista?"*.
- **Entidades e relações claras:** cidade → bairros → tipos → imóveis; nomes oficiais e consistentes (ajuda o grafo de conhecimento).
- **Autoridade tópica:** blog cobrindo financiamento, documentação, custo de vida, bairros — interligado às landings.
- **Dados estruturados ricos** e **conteúdo factual atualizado** (preços agregados por cidade/bairro recalculados no build).
- **Hierarquia semântica** (H1→H2→H3) e listas claras que LLMs extraem bem.
- `llms.txt` na raiz descrevendo o site e as seções principais para crawlers de IA.

## 6. Conteúdo local (autoridade regional)

Guias por cidade ("Morar em Vitória da Conquista", "Melhores bairros de Barreiras"), comparativos de bairros e posts de mercado — reforçam que o 77Imóveis é **a** referência do DDD 77.
