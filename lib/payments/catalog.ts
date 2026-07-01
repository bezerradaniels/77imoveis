export const COMPANY_TRIAL_DAYS = 60;

export const oneTimeProducts = {
  destaque_7: {
    name: 'Destaque simples',
    description: 'Destaque do imóvel por 7 dias',
    amount: 9.9,
    days: 7,
    kind: 'listing_feature',
  },
  destaque_15: {
    name: 'Destaque forte',
    description: 'Destaque do imóvel por 15 dias',
    amount: 19.9,
    days: 15,
    kind: 'listing_feature',
  },
  destaque_30: {
    name: 'Super destaque',
    description: 'Destaque do imóvel por 30 dias',
    amount: 34.9,
    days: 30,
    kind: 'listing_feature',
  },
  topo_cidade_tipo_7: {
    name: 'Topo da cidade + tipo',
    description: 'Prioridade no topo da busca por cidade e tipo durante 7 dias',
    amount: 49.9,
    days: 7,
    kind: 'listing_feature',
  },
  vitrine_simples_30: {
    name: 'Vitrine personalizada simples',
    description: 'Vitrine personalizada por 30 dias',
    amount: 24.9,
    days: 30,
    kind: 'storefront',
  },
  vitrine_premium_30: {
    name: 'Vitrine premium personalizada',
    description: 'Vitrine premium personalizada por 30 dias',
    amount: 49.9,
    days: 30,
    kind: 'storefront',
  },
  banner_cidade_7: {
    name: 'Banner cidade',
    description: 'Anúncio publicitário por cidade durante 7 dias',
    amount: 74.9,
    days: 7,
    kind: 'banner',
  },
  banner_home_7: {
    name: 'Banner regional/home',
    description: 'Anúncio publicitário regional na home por 7 dias',
    amount: 199.9,
    days: 7,
    kind: 'banner',
  },
  banner_romaria_30: {
    name: 'Banner romaria/temporada',
    description: 'Campanha sazonal de romaria/temporada',
    amount: 299.9,
    days: 30,
    kind: 'banner',
  },
} as const;

export type OneTimeProductSlug = keyof typeof oneTimeProducts;
