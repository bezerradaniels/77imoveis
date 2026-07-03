import { oneTimeProducts } from './payments/catalog';

export type PlanRow = {
  name: string;
  slug: string;
  audience: string;
  max_active_listings: number;
  price: number;
  interval: 'mensal' | 'anual' | 'unico';
  included_featured: number;
  highlight: boolean;
  benefits: unknown;
};

export type PlanPair = {
  key: string;
  monthly: PlanRow;
  annual?: PlanRow;
};

export const currentPlanRows: PlanRow[] = [
  {
    name: 'Particular Gratuito',
    slug: 'particular-gratuito',
    audience: 'b2c',
    max_active_listings: 1,
    price: 0,
    interval: 'mensal',
    included_featured: 0,
    highlight: false,
    benefits: ['1 imóvel ativo gratuito', 'Botão de WhatsApp', 'Formulário de contato'],
  },
  {
    name: 'Corretor Essencial',
    slug: 'corretor-essencial-mensal',
    audience: 'corretor_autonomo',
    max_active_listings: 10,
    price: 19.9,
    interval: 'mensal',
    included_featured: 0,
    highlight: false,
    benefits: ['Até 10 imóveis ativos', 'Perfil profissional no portal', 'Leads por WhatsApp e formulário'],
  },
  {
    name: 'Corretor Essencial Anual',
    slug: 'corretor-essencial-anual',
    audience: 'corretor_autonomo',
    max_active_listings: 10,
    price: 190.8,
    interval: 'anual',
    included_featured: 0,
    highlight: false,
    benefits: ['Até 10 imóveis ativos', 'Perfil profissional no portal', 'Leads por WhatsApp e formulário', 'Desconto no pagamento anual'],
  },
  {
    name: 'Corretor Pro',
    slug: 'corretor-pro-mensal',
    audience: 'corretor_autonomo',
    max_active_listings: 30,
    price: 39.9,
    interval: 'mensal',
    included_featured: 2,
    highlight: true,
    benefits: ['Até 30 imóveis ativos', '2 destaques por mês', 'Vitrine do corretor', 'Prioridade na busca'],
  },
  {
    name: 'Corretor Pro Anual',
    slug: 'corretor-pro-anual',
    audience: 'corretor_autonomo',
    max_active_listings: 30,
    price: 382.8,
    interval: 'anual',
    included_featured: 24,
    highlight: false,
    benefits: ['Até 30 imóveis ativos', '24 destaques por ano', 'Vitrine do corretor', 'Prioridade na busca', 'Desconto no pagamento anual'],
  },
  {
    name: 'Corretor Max',
    slug: 'corretor-max-mensal',
    audience: 'corretor_autonomo',
    max_active_listings: 80,
    price: 69.9,
    interval: 'mensal',
    included_featured: 5,
    highlight: false,
    benefits: ['Até 80 imóveis ativos', '5 destaques por mês', 'Vitrine premium', 'Mais visibilidade regional'],
  },
  {
    name: 'Corretor Max Anual',
    slug: 'corretor-max-anual',
    audience: 'corretor_autonomo',
    max_active_listings: 80,
    price: 670.8,
    interval: 'anual',
    included_featured: 60,
    highlight: false,
    benefits: ['Até 80 imóveis ativos', '60 destaques por ano', 'Vitrine premium', 'Mais visibilidade regional', 'Desconto no pagamento anual'],
  },
  {
    name: 'Empresa Start',
    slug: 'empresa-start-mensal',
    audience: 'b2b',
    max_active_listings: 50,
    price: 79.9,
    interval: 'mensal',
    included_featured: 0,
    highlight: false,
    benefits: ['Até 50 imóveis ativos', 'Vitrine da empresa', 'Até 3 usuários', 'Leads por WhatsApp e formulário'],
  },
  {
    name: 'Empresa Start Anual',
    slug: 'empresa-start-anual',
    audience: 'b2b',
    max_active_listings: 50,
    price: 766.8,
    interval: 'anual',
    included_featured: 0,
    highlight: false,
    benefits: ['Até 50 imóveis ativos', 'Vitrine da empresa', 'Até 3 usuários', 'Leads por WhatsApp e formulário', 'Desconto no pagamento anual'],
  },
  {
    name: 'Empresa Pro',
    slug: 'empresa-pro-mensal',
    audience: 'b2b',
    max_active_listings: 150,
    price: 149.9,
    interval: 'mensal',
    included_featured: 10,
    highlight: true,
    benefits: ['Até 150 imóveis ativos', '10 destaques por mês', 'Equipe com corretores', 'Vitrine da empresa'],
  },
  {
    name: 'Empresa Pro Anual',
    slug: 'empresa-pro-anual',
    audience: 'b2b',
    max_active_listings: 150,
    price: 1438.8,
    interval: 'anual',
    included_featured: 120,
    highlight: false,
    benefits: ['Até 150 imóveis ativos', '120 destaques por ano', 'Equipe com corretores', 'Vitrine da empresa', 'Desconto no pagamento anual'],
  },
  {
    name: 'Empresa Líder',
    slug: 'empresa-lider-mensal',
    audience: 'b2b',
    max_active_listings: 400,
    price: 249.9,
    interval: 'mensal',
    included_featured: 20,
    highlight: false,
    benefits: ['Até 400 imóveis ativos', '20 destaques por mês', 'Vitrine premium', 'Prioridade regional'],
  },
  {
    name: 'Empresa Líder Anual',
    slug: 'empresa-lider-anual',
    audience: 'b2b',
    max_active_listings: 400,
    price: 2398.8,
    interval: 'anual',
    included_featured: 240,
    highlight: false,
    benefits: ['Até 400 imóveis ativos', '240 destaques por ano', 'Vitrine premium', 'Prioridade regional', 'Desconto no pagamento anual'],
  },
];

export const hasCurrentPricing = (plans: PlanRow[]) =>
  plans.some((plan) => plan.slug === 'corretor-essencial-mensal');

export const publicPricingPlans = (plans: PlanRow[]) =>
  hasCurrentPricing(plans) ? plans : currentPlanRows;

export const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

export const planBenefits = (plan: Pick<PlanRow, 'benefits'>) =>
  Array.isArray(plan.benefits) ? (plan.benefits as string[]) : [];

export const listingLimit = (limit: number) =>
  limit >= 100000 ? 'Imóveis ilimitados' : `${limit} imóveis ativos`;

// Recomendação curta ("melhor para") por família de plano — ajuda a escolher.
export const planTagline: Record<string, string> = {
  'corretor-essencial': 'Ideal para quem está começando a divulgar imóveis.',
  'corretor-pro': 'Para corretores que querem mais alcance e destaques.',
  'corretor-max': 'Para carteiras grandes e máxima visibilidade regional.',
  'empresa-start': 'Ideal para imobiliárias começando no portal.',
  'empresa-pro': 'Para equipes que querem crescer com destaques e vitrine.',
  'empresa-lider': 'Para imobiliárias líderes com alto volume de imóveis.',
};

export function groupPlanPairs(plans: PlanRow[], audience: string): PlanPair[] {
  const rows = plans
    .filter((plan) => plan.audience === audience && Number(plan.price) > 0)
    .map((plan) => ({ ...plan, price: Number(plan.price) }));

  return rows
    .filter((plan) => plan.interval === 'mensal')
    .map((monthly) => {
      const key = monthly.slug.replace(/-mensal$/, '');
      return {
        key,
        monthly,
        annual: rows.find((plan) => plan.interval === 'anual' && plan.slug === `${key}-anual`),
      };
    });
}

export function annualDiscount(monthly: PlanRow, annual?: PlanRow) {
  if (!annual) return 0;
  const fullYear = Number(monthly.price) * 12;
  if (!fullYear) return 0;
  return Math.round((1 - Number(annual.price) / fullYear) * 100);
}

export function monthlyEquivalent(annual: PlanRow) {
  return Number(annual.price) / 12;
}

export const oneTimeProductList = Object.entries(oneTimeProducts).map(([slug, product]) => ({
  slug,
  ...product,
}));
