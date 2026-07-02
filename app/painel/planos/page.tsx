import Link from 'next/link';
import { ArrowLeft, Building2, Check, CreditCard, ExternalLink, ReceiptText } from 'lucide-react';
import { getMyBillingOverview, getPlans } from '@/lib/data';
import {
  annualDiscount,
  groupPlanPairs,
  listingLimit,
  money,
  monthlyEquivalent,
  planBenefits,
  type PlanPair,
  type PlanRow,
} from '@/lib/pricing';
import { startPlanCheckout } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Assinatura e planos', robots: { index: false } };

const statusLabel: Record<string, string> = {
  ativa: 'Ativa',
  trial: 'Em teste',
  pendente: 'Pendente',
  inadimplente: 'Inadimplente',
  cancelada: 'Cancelada',
};

const statusClass: Record<string, string> = {
  ativa: 'bg-success/15 text-success',
  trial: 'bg-primary/10 text-primary',
  pendente: 'bg-warning/15 text-warning',
  inadimplente: 'bg-danger/15 text-danger',
  cancelada: 'bg-border text-muted',
};

const dateLabel = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : null;

function PlanCard({ pair, currentSlug }: { pair: PlanPair; currentSlug?: string }) {
  const { monthly, annual } = pair;
  const discount = annualDiscount(monthly, annual);
  const isCurrentMonthly = currentSlug === monthly.slug;
  const isCurrentAnnual = annual && currentSlug === annual.slug;

  return (
    <article className={`flex h-full flex-col rounded-xl border bg-surface p-5 ${monthly.highlight ? 'border-primary shadow-sm' : 'border-border'}`}>
      {monthly.highlight && <p className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-link">Mais escolhido</p>}
      <h2 className="text-lg font-bold">{monthly.name}</h2>
      <p className="mt-1 text-sm text-muted">{listingLimit(monthly.max_active_listings)}</p>

      <p className="mt-4 text-3xl font-extrabold">{money(monthly.price)}</p>
      <p className="text-sm text-muted">por mês</p>

      {annual && (
        <div className="mt-3 rounded-xl bg-primary-soft p-3 text-sm text-link">
          <p className="font-bold">{money(annual.price)} no plano anual</p>
          <p className="mt-0.5 text-xs font-semibold text-link/80">
            {money(monthlyEquivalent(annual))}/mês equivalente{discount ? ` · ${discount}% off` : ''}
          </p>
        </div>
      )}

      <ul className="mt-4 space-y-2 text-sm">
        {planBenefits(monthly).map((benefit) => (
          <li key={benefit} className="flex gap-2">
            <Check size={15} className="mt-0.5 shrink-0 text-success" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto grid gap-2 pt-5 sm:grid-cols-2">
        <form action={startPlanCheckout}>
          <input type="hidden" name="planSlug" value={monthly.slug} />
          <button
            disabled={isCurrentMonthly}
            className="h-10 w-full rounded-full bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border disabled:text-muted"
          >
            {isCurrentMonthly ? 'Plano atual' : 'Mensal'}
          </button>
        </form>
        {annual && (
          <form action={startPlanCheckout}>
            <input type="hidden" name="planSlug" value={annual.slug} />
            <button
              disabled={!!isCurrentAnnual}
              className="h-10 w-full rounded-full border border-primary px-4 text-sm font-bold text-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:border-border disabled:text-muted"
            >
              {isCurrentAnnual ? 'Plano atual' : 'Anual'}
            </button>
          </form>
        )}
      </div>
    </article>
  );
}

export default async function PlanosPage() {
  const [plans, billing] = await Promise.all([getPlans(), getMyBillingOverview()]);
  const company = billing.company as any;
  const subscription = billing.subscription as any;
  const currentPlan = subscription?.plans;
  const latestPayment = billing.latestPayment as any;
  const companyAudience = company?.type === 'corretor_autonomo' ? 'corretor_autonomo' : 'b2b';
  const planPairs = company ? groupPlanPairs(plans as PlanRow[], companyAudience) : [];
  const renewalDate = dateLabel(subscription?.current_period_end);
  const baseLimit = company?.type === 'corretor_autonomo' ? 1 : 0;
  const maxActive = Number(currentPlan?.max_active_listings ?? baseLimit);
  const limitText = currentPlan ? listingLimit(maxActive) : company?.type === 'corretor_autonomo' ? '1 imóvel ativo gratuito' : 'Sem plano profissional ativo';

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/painel" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Painel
      </Link>

      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assinatura e planos</h1>
          <p className="mt-1 text-sm text-muted">Gerencie limites, destaques e cobrança da empresa em foco.</p>
        </div>
        <Link href="/planos-e-precos" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-bold text-text hover:bg-bg">
          Ver página pública <ExternalLink size={15} />
        </Link>
      </div>

      {!company ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
          <div className="flex items-center gap-3">
            <Building2 className="text-link" />
            <p className="text-sm">Crie um perfil profissional para acessar assinaturas, vitrine e planos.</p>
          </div>
          <Link href="/painel/empresa" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary">
            Atuar profissionalmente
          </Link>
        </div>
      ) : (
        <>
          <section className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_.8fr]">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">Assinatura atual</p>
                  <h2 className="mt-1 text-xl font-bold">{currentPlan?.name ?? 'Sem assinatura ativa'}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {company.trade_name ?? company.legal_name ?? 'Perfil profissional'} · {limitText}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[subscription?.status] ?? 'bg-border text-muted'}`}>
                  {statusLabel[subscription?.status] ?? 'Sem plano'}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-bg p-3">
                  <p className="text-xs text-muted">Imóveis ativos</p>
                  <p className="mt-1 text-lg font-extrabold tabular-nums">
                    {billing.activeProperties}{maxActive ? `/${maxActive}` : ''}
                  </p>
                </div>
                <div className="rounded-xl bg-bg p-3">
                  <p className="text-xs text-muted">Destaques inclusos</p>
                  <p className="mt-1 text-lg font-extrabold tabular-nums">{Number(currentPlan?.included_featured ?? 0)}</p>
                </div>
                <div className="rounded-xl bg-bg p-3">
                  <p className="text-xs text-muted">Renovação</p>
                  <p className="mt-1 text-lg font-extrabold">{renewalDate ?? 'A definir'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center gap-2">
                <ReceiptText size={18} className="text-link" />
                <h2 className="font-bold">Última cobrança</h2>
              </div>
              {latestPayment ? (
                <div className="mt-4 space-y-2 text-sm">
                  <p className="font-semibold">{money(Number(latestPayment.amount ?? 0))}</p>
                  <p className="text-muted">
                    Status: {latestPayment.status}
                    {latestPayment.created_at ? ` · ${dateLabel(latestPayment.created_at)}` : ''}
                  </p>
                  {latestPayment.invoice_url && (
                    <Link href={latestPayment.invoice_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary-soft px-4 text-sm font-bold text-link hover:bg-primary-soft-hover">
                      Abrir cobrança <ExternalLink size={14} />
                    </Link>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted">Nenhuma cobrança registrada ainda.</p>
              )}
            </div>
          </section>

          <div className="mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-link" />
            <h2 className="text-lg font-bold">Escolha seu plano</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {planPairs.map((pair) => (
              <PlanCard key={pair.key} pair={pair} currentSlug={currentPlan?.slug} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
