// =====================================================================
// ANÚNCIOS DO HERO (carrossel de publicidade)
// Dados de exemplo usando as fotos das cidades já em /public.
// Substitua por uma consulta ao banco quando os anúncios pagos existirem
// (ex.: getHeroAds() em lib/data.ts → tabela de campanhas/banners).
// =====================================================================

export type HeroAd = {
  /** Caminho da imagem (16:9 recomendado). Pode ser URL externa de campanha. */
  img: string;
  /** Selo curto: Patrocinado, Lançamento, Destaque, etc. */
  tag: string;
  title: string;
  sub: string;
  /** Texto alternativo da imagem (acessibilidade). */
  alt: string;
  /** aria-label descritivo do anúncio clicável. */
  aria: string;
  /** Destino do clique (página do imóvel, campanha, anunciante…). */
  href: string;
  /** true = abre em nova aba (anúncio externo). */
  external?: boolean;
};

export const heroAds: HeroAd[] = [
  {
    img: '/vitoria da conquista.jpg',
    tag: 'Patrocinado',
    title: 'Apartamentos no Centro',
    sub: 'Vitória da Conquista · a partir de R$ 320 mil',
    alt: 'Vista de Vitória da Conquista',
    aria: 'Anúncio: Apartamentos no Centro de Vitória da Conquista',
    href: '/vitoria-da-conquista/apartamentos',
  },
  {
    img: '/barreiras.jpg',
    tag: 'Lançamento',
    title: 'Residencial Cerrado',
    sub: 'Barreiras · casas em condomínio fechado',
    alt: 'Vista de Barreiras',
    aria: 'Anúncio: Residencial Cerrado em Barreiras',
    href: '/barreiras/casas?modalidade=lancamento',
  },
  {
    img: '/luis eduardo magalhaes.jpg',
    tag: 'Destaque',
    title: 'Condomínio Agro Vale',
    sub: 'Luís Eduardo Magalhães · lotes e casas',
    alt: 'Vista de Luís Eduardo Magalhães',
    aria: 'Anúncio: Condomínio Agro Vale em Luís Eduardo Magalhães',
    href: '/luis-eduardo-magalhaes',
  },
  {
    img: '/guanambi.jpg',
    tag: 'Patrocinado',
    title: 'Casas em bairro nobre',
    sub: 'Guanambi · 3 e 4 quartos',
    alt: 'Vista de Guanambi',
    aria: 'Anúncio: Casas em bairro nobre de Guanambi',
    href: '/guanambi/casas?quartos=3',
  },
  {
    img: '/bom jesus da lapa.jpg',
    tag: 'Oportunidade',
    title: 'Terrenos à venda',
    sub: 'Bom Jesus da Lapa · próximo ao centro',
    alt: 'Vista de Bom Jesus da Lapa',
    aria: 'Anúncio: Terrenos à venda em Bom Jesus da Lapa',
    href: '/bom-jesus-da-lapa/terrenos',
  },
  {
    img: '/brumado.jpg',
    tag: 'Comercial',
    title: 'Imóveis comerciais',
    sub: 'Brumado · salas e lojas',
    alt: 'Vista de Brumado',
    aria: 'Anúncio: Imóveis comerciais em Brumado',
    href: '/brumado/sala-comercials',
  },
];
