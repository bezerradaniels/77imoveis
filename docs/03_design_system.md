# 77Imóveis — Design System e UX

Estilo: **moderno, confiável, regional** — identidade verde sobre base neutra clara,
muito espaço em branco e degradê sutil no header. Mobile-first. (Implementação do
handoff de design `Home 77imoveis.dc.html`.)

## 1. Cores (tokens)

Acento único **verde água** (`#69F1CF`) sobre base neutra. Definidas como variáveis CSS
em `app/globals.css` (claro/escuro) e mapeadas no `tailwind.config.ts`.

```css
:root {
  --bg: #ffffff;
  --surface: #ffffff;
  --subtle: #f6f8f7;        /* faixas/realces (cinza esverdeado) */
  --border: #e7eae7;
  --text: #1d2722;
  --text-muted: #6b756f;
  --primary: #69f1cf;       /* verde água 77imóveis */
  --primary-hover: #49d9b8;
  --on-primary: #10231d;    /* texto sobre fundo verde água */
  --link: #0ea5e9;          /* links sobre fundo claro */
  --link-hover: #0284c7;
  --accent: #69f1cf;
  --success: #15803d;
  --warning: #b45309;
  --danger: #c0392b;
  --radius: 0.75rem;        /* 12px (cards usam 16px = rounded-2xl) */
  --header-grad: linear-gradient(90deg, #e8f6ef 0%, #fbfcfb 46%, #fcefef 100%);
}
.dark {
  --bg: #0f1714;
  --surface: #15201b;
  --subtle: #15201b;
  --border: #2a352f;
  --text: #f1f5f3;
  --text-muted: #9aa6a0;
  --primary: #69f1cf;
  --primary-hover: #49d9b8;
  --on-primary: #10231d;
  --link: #38bdf8;
  --link-hover: #7dd3fc;
  --accent: #69f1cf;
  --header-grad: linear-gradient(90deg, #112019 0%, #0f1714 46%, #1a1614 100%);
}
```

Seleção de texto: `::selection { background:#bdeede }`.

## 2. Tipografia

- Fonte: **DM Sans**, `font-display: swap`, via `next/font`. (O mock usa Plus Jakarta
  Sans, mas optou-se por manter a DM Sans já em uso.)
- Ícones: **lucide-react** no código (o mock usa Phosphor — equivalência visual).
- Escala: 12 / 14 / 16 (base) / 18 / 20 / 24 / 30 / 36 / 48; títulos com `tracking` negativo.
- Peso: 400 corpo, 500 rótulos, 700/800 títulos.
- Números de preço com `tabular-nums`.

## 3. Espaçamento e raios

- Grid base 4px. Espaçamentos 4/8/12/16/24/32/48/64.
- Raio: cards `rounded-2xl` (16px), card de busca 20px; inputs/botões `--radius` (12px); full em chips/pílulas.
- **Sem sombra por padrão** — separação por borda (`--border`) e espaço. Sombra só
  pontual: card de busca, hover de cards e barra de contato.

## 4. Componentes (biblioteca)

| Componente | Notas |
|---|---|
| `Button` | variantes: primary, secondary, ghost, danger; tamanhos sm/md/lg; estado loading |
| `Input / Select / Textarea` | rótulo flutuante, mensagens de erro, ícone opcional |
| `PropertyCard` | foto (lazy), preço, cidade/bairro, ícones (quartos/banheiros/vagas/área), selo "Destaque", botão favoritar |
| `FilterBar` | mobile: bottom sheet; desktop: barra lateral. Reflete filtros na URL |
| `Gallery` | carrossel touch, miniaturas, tela cheia |
| `LeadForm` | nome, telefone, mensagem + botão WhatsApp |
| `MapView` | Leaflet, pino do imóvel ou raio |
| `Autocomplete` | cidade → bairro (trigram) |
| `Badge / Chip` | tipos, disponibilidade, características |
| `EmptyState` | ilustração + texto + CTA |
| `Skeleton` | loading de cards e listas |
| `ThemeToggle` | claro/escuro, persistido por `prefers-color-scheme` + escolha |
| `Sidebar` (admin/painel) | navegação com ícones |
| `StatCard / Chart` | KPIs e gráficos do dashboard |

## 5. Navegação

- **Header (global):** simples, com degradê verde (`--header-grad`) — logo `77imóveis`,
  "Anuncie seu imóvel", alternar tema e Entrar/Painel. A busca **não** fica no header;
  vive no card da home.
- **Mobile:** **barra inferior fixa** (Início, Buscar, Anunciar, Conta).
- **Footer:** escuro (`#0d1512`), colunas Cidades / Tipos / Profissionais / Institucional.

## 6. Home (handoff)

`app/(public)/page.tsx` segue o `Home 77imoveis.dc.html`:

1. **Hero** com foto de fundo (placeholder gradiente) + scrim, eyebrow "Portal imobiliário · DDD 77", H1 e dois CTAs.
2. **Card de busca** sobrepondo o hero (`HomeSearch`): abas Comprar/Alugar + Cidade/Tipo/Faixa de preço/Quartos → navega para `/[cidade]/[tipo]` com filtros na URL. Barra de confiança abaixo.
3. **Categorias** por tipo · **Cidades** (cards com gradiente + contagem real) · **Imóveis em destaque** (banco) · **Profissionais** (4) · **CTA anunciante** (faixa verde) · **Conteúdo SEO** + footer.

## 7. Estados (obrigatórios)

- **Loading:** skeletons (nunca spinner solitário em listas).
- **Empty:** ex. busca sem resultado → "Nenhum imóvel encontrado em {bairro}. Veja imóveis em {cidade}." + CTA.
- **Erro:** mensagem amigável + tentar novamente.
- **Sucesso:** toasts curtos.

## 8. Formulários

- Validação em tempo real (Zod), máscara de telefone/CEP/moeda (R$), passos no wizard com barra de progresso, autosave de rascunho do anúncio.

## 9. Acessibilidade (meta: WCAG 2.1 AA)

- Contraste mínimo 4.5:1; foco visível; navegação por teclado; `alt` em todas as imagens; áreas de toque ≥ 44px; labels associados; `aria-live` em toasts; respeita `prefers-reduced-motion`.

## 10. Animações

Sutis: fade/translate de 150–250ms, hover leve nos cards, transição suave de tema. Sem excessos.
