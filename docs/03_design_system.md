# 77Imóveis — Design System e UX

Estilo: **moderno, minimalista, premium e confiável**. Mobile-first. Cards com cantos arredondados, sombras suaves e bastante espaço.

## 1. Cores (tokens)

Paleta base **Slate** + acentos **Cyan/Sky**. Definidas como variáveis CSS para suportar modo claro e escuro.

```css
:root {
  --bg: #f8fafc;            /* slate-50  */
  --surface: #ffffff;
  --border: #e2e8f0;       /* slate-200 */
  --text: #0f172a;         /* slate-900 */
  --text-muted: #64748b;   /* slate-500 */
  --primary: #0891b2;      /* cyan-600  */
  --primary-hover: #0e7490;/* cyan-700  */
  --accent: #0ea5e9;       /* sky-500   */
  --success: #16a34a;
  --warning: #f59e0b;
  --danger: #dc2626;
  --radius: 1rem;
}
.dark {
  --bg: #0f172a;           /* slate-900 */
  --surface: #1e293b;      /* slate-800 */
  --border: #334155;       /* slate-700 */
  --text: #f1f5f9;         /* slate-100 */
  --text-muted: #94a3b8;   /* slate-400 */
  --primary: #22d3ee;      /* cyan-400  */
  --accent: #38bdf8;       /* sky-400   */
}
```

## 2. Tipografia

- Fonte: **Inter** (ou Geist), `font-display: swap`, servida localmente (performance + LGPD-friendly, sem Google Fonts CDN).
- Escala: 12 / 14 / 16 (base) / 18 / 20 / 24 / 30 / 36 / 48.
- Peso: 400 corpo, 500 rótulos, 600/700 títulos.
- Números de preço com `tabular-nums`.

## 3. Espaçamento e raios

- Grid base 4px. Espaçamentos 4/8/12/16/24/32/48/64.
- Raio: `--radius` (16px) em cards; 8px em inputs/botões; full em chips/avatars.
- Sombra: `0 1px 2px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.06)`.

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

- **Mobile:** topo enxuto (logo + busca + menu) e **barra inferior fixa** (Início, Buscar, Anunciar, Favoritos, Painel).
- **Desktop:** header com busca central, menu de cidades, "Anunciar", login/painel.

## 6. Home

Busca em destaque (cidade + tipo + negociação) → atalhos das cidades em destaque (VC, Barreiras, LEM, Guanambi, Brumado, Bom Jesus, Santa Maria) → imóveis em destaque → tipos de imóvel → diretório de profissionais → blog → rodapé rico em links internos (SEO).

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
