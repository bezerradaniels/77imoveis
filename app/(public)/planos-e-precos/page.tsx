import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgePercent, Check, Megaphone, ShieldCheck } from 'lucide-react';
import { getPlans } from '@/lib/data';
import {
  annualDiscount,
  groupPlanPairs,
  listingLimit,
  money,
  monthlyEquivalent,
  oneTimeProductList,
  planBenefits,
  publicPricingPlans,
  type PlanPair,
  type PlanRow,
} from '@/lib/pricing';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Planos e preços para anunciar imóveis',
  description: 'Planos para corretores autônomos, imobiliárias e construtoras anunciarem imóveis no 77Imóveis.',
  alternates: { canonical: '/planos-e-precos' },
};

function PlanCard({ pair }: { pair: PlanPair }) {
  const { monthly, annual } = pair;
  const discount = annualDiscount(monthly, annual);

  return (
    <article className={`flex h-full flex-col rounded-2xl border bg-surface p-5 ${monthly.highlight ? 'border-primary shadow-sm' : 'border-border'}`}>
      {monthly.highlight && <p className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-link">Mais escolhido</p>}
      <h3 className="text-lg font-extrabold text-text">{monthly.name}</h3>
      <p className="mt-1 text-sm text-muted">{listingLimit(monthly.max_active_listings)}</p>

      <div className="mt-5">
        <p className="text-3xl font-extrabold tracking-tight text-text">{money(monthly.price)}</p>
        <p className="text-sm font-medium text-muted">por mês</p>
      </div>

      {annual && (
        <div className="mt-3 rounded-xl bg-primary-soft p-3 text-sm text-link">
          <p className="font-bold">Anual por {money(annual.price)}</p>
          <p className="mt-0.5 text-xs font-semibold text-link/80">
            Equivale a {money(monthlyEquivalent(annual))}/mês{discount ? `, ${discount}% de desconto` : ''}
          </p>
        </div>
      )}

      <ul className="mt-5 space-y-2 text-sm">
        {planBenefits(monthly).map((benefit) => (
          <li key={benefit} className="flex gap-2">
            <Check size={16} className="mt-0.5 shrink-0 text-success" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/cadastro"
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-action px-4 py-2 text-sm font-bold text-on-action transition-colors hover:bg-action-hover"
      >
        Começar agora <ArrowRight size={16} />
      </Link>
    </article>
  );
}

function PlanSection({ title, subtitle, plans }: { title: string; subtitle: string; plans: PlanPair[] }) {
  if (!plans.length) return null;
  return (
    <section className="mt-8">
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-text">{title}</h2>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((pair) => <PlanCard key={pair.key} pair={pair} />)}
      </div>
    </section>
  );
}

export default async function PlanosPrecosPage() {
  const plans = publicPricingPlans((await getPlans()) as PlanRow[]);
  const brokerPlans = groupPlanPairs(plans, 'corretor_autonomo');
  const companyPlans = groupPlanPairs(plans, 'b2b');
  const listingProducts = oneTimeProductList.filter((product) => product.kind === 'listing_feature');
  const storefrontProducts = oneTimeProductList.filter((product) => product.kind === 'storefront');
  const bannerProducts = oneTimeProductList.filter((product) => product.kind === 'banner');

  return (
    <main className="bg-bg">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[1200px] px-6 py-[clamp(42px,6vw,72px)]">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-[.08em] text-link">
              <BadgePercent size={14} /> Planos e preços
            </p>
            <h1 className="text-[clamp(28px,5vw,48px)] font-extrabold leading-tight tracking-tight text-text">
              Anuncie imóveis no portal regional do DDD 77
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted md:text-base">
              Planos mensais fixos para corretores autônomos, imobiliárias e construtoras, com opção anual com desconto e compras avulsas para destacar imóveis, vitrines e banners.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/cadastro" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-action px-5 py-2 text-sm font-bold text-on-action hover:bg-action-hover">
                Criar conta <ArrowRight size={16} />
              </Link>
              <Link href="/anunciar" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2 text-sm font-bold text-text hover:bg-bg">
                Anunciar como particular
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-[clamp(36px,5vw,64px)]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-text">Particular continua grátis</h2>
              <p className="mt-1 text-sm text-muted">Proprietários anunciam 1 imóvel ativo sem mensalidade, com WhatsApp e formulário.</p>
            </div>
            <Link href="/anunciar" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-soft px-4 py-2 text-sm font-bold text-link hover:bg-primary-soft-hover">
              Publicar imóvel
            </Link>
          </div>
        </div>

        <PlanSection
          title="Corretores autônomos"
          subtitle="Planos mais baratos para começar com carteira própria e crescer sem depender de imobiliária."
          plans={brokerPlans}
        />

        <PlanSection
          title="Imobiliárias e empresas"
          subtitle="Mais limite, equipe, vitrine e destaques para operações com maior volume de imóveis."
          plans={companyPlans}
        />
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-[1200px] px-6 py-[clamp(36px,5vw,64px)]">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.08em] text-link">
                <Megaphone size={14} /> Compras avulsas
              </p>
              <h2 className="text-2xl font-extrabold text-text">Mais visibilidade quando precisar</h2>
              <p className="mt-1 text-sm text-muted">Avulsos não substituem a assinatura: eles entram como reforço para imóveis, vitrines e campanhas.</p>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
              <ShieldCheck size={16} className="text-success" /> Pix, boleto ou cartão via gateway brasileiro
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[
              ['Destaques de imóvel', listingProducts],
              ['Vitrine avulsa', storefrontProducts],
              ['Banners', bannerProducts],
            ].map(([title, products]) => (
              <article key={title as string} className="rounded-2xl border border-border bg-bg p-5">
                <h3 className="font-extrabold text-text">{title as string}</h3>
                <div className="mt-4 space-y-3">
                  {(products as typeof oneTimeProductList).map((product) => (
                    <div key={product.slug} className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-bold text-text">{product.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{product.days} dias</p>
                      </div>
                      <p className="shrink-0 text-sm font-extrabold tabular-nums text-primary">{money(product.amount)}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
