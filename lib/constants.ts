// Constantes compartilhadas (rótulos de enums do banco em pt-BR).

// Tipos de empresa/profissional (enum company_type). value = valor no banco.
export const companyTypes = [
  { value: 'imobiliaria', label: 'Imobiliária' },
  { value: 'construtora', label: 'Construtora' },
  { value: 'incorporadora', label: 'Incorporadora' },
  { value: 'corretor_autonomo', label: 'Corretor autônomo' },
] as const;

export const companyTypeLabel = (v: string) =>
  companyTypes.find((t) => t.value === v)?.label ?? v;

export const publicCompanyTypeValues = companyTypes.map((t) => t.value);

// Emoji por cidade + paleta de tiles suaves (toque de cor, estilo Airbnb).
export const cityEmoji: Record<string, string> = {
  'vitoria-da-conquista': '🏙️',
  barreiras: '🌾',
  'luis-eduardo-magalhaes': '🚜',
  guanambi: '☀️',
  brumado: '⛏️',
  'bom-jesus-da-lapa': '⛪',
  'santa-maria-da-vitoria': '🌅',
};
export const cityEmojiFor = (slug: string) => cityEmoji[slug] ?? '📍';

export const cityTagline: Record<string, string> = {
  'vitoria-da-conquista': 'A Suíça Baiana',
  barreiras: 'A capital do oeste baiano',
  'luis-eduardo-magalhaes': 'Polo do agronegócio baiano',
  guanambi: 'Cidade luz do sertão',
  brumado: 'A capital do minério',
  'bom-jesus-da-lapa': 'A capital baiana da fé',
  'santa-maria-da-vitoria': 'Portal do vale do Corrente',
};
export const cityTaglineFor = (slug: string) => cityTagline[slug] ?? 'Oeste da Bahia';

export const cityImages: Record<string, string> = {
  'bom-jesus-da-lapa': '/bom jesus da lapa.jpg',
  'vitoria-da-conquista': '/vitoria da conquista.jpg',
  barreiras: '/barreiras.jpg',
  'luis-eduardo-magalhaes': '/luis eduardo magalhaes.jpg',
  guanambi: '/guanambi.jpg',
  brumado: '/brumado.jpg',
  'santa-maria-da-vitoria': '/santa maria da vitoria.jpg',
};

export const cityImageFor = (slug: string) => cityImages[slug] ?? '/search-city-hero.jpg';
