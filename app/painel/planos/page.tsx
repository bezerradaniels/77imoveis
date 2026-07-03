import Link from 'next/link';
import { ArrowLeft, Building2, CreditCard, ExternalLink, ReceiptText, Sparkles, Store } from 'lucide-react';
import { getMyBillingOverview, getMyProperties, getMyStorefront, getPlans, getSiteSetting } from '@/lib/data';
import { groupPlanPairs, listingLimit, money, oneTimeProductList, type PlanRow } from '@/lib/pricing';
import { trialDaysRemaining } from '@/lib/subscription';
import { PlanSelector } from '@/components/painel/PlanSelector';
import { AvulsoPurchase, type AvulsoProduct } from '@/components/painel/AvulsoPurchase';
import { VitrineActivation } from '@/components/painel/VitrineActivation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Assinatura e compras', robots: { index: false } };

const DEFAULT_VITRINE_PRECOS = [
  { dias: 30, preco: 49.9, label: '30 dias' },
  { dias: 90, preco: 119.9, label: '90 dias' },
  { dias: 365, preco: 399.9, label: '1 ano' },
];

const statusLabel: Record<string, string> = {
  ativa: 'Ativa',
  trial: 'Em teste',
  pendente: 'Pendente',
  inadimplente: 'Inadimplente',
  cancelada: 'Cancelada',
  pausado: 'Pausado',
  agendado: 'Agendado',
  expirado: 'Expirado',
};

const statusClass: Record<string, string> = {
  ativa: 'bg-success/15 text-success',
  trial: 'bg-primary/10 text-primary',
  pendente: 'bg-warning/15 text-warning',
  inadimplente: 'bg-danger/15 text-danger',
  cancelada: 'bg-border text-muted',
  pausado: 'bg-warning/20 text-warning',
  agendado: 'bg-primary/10 text-primary',
  expirado: 'bg-danger/15 text-danger',
};

const dateLabel = (value?: string | null) => (value ? new Date(value).toLocaleDateString('pt-BR') : null);

const avulsos = (prefix: string): AvulsoProduct[] =>
  oneTimeProductList
    .filter((p) => p.kind === 'listing_feature' && p.slug.startsWith(prefix))
    .map(({ slug, name, description, amount, days }) => ({ slug, name, description, amount, days }));

export default async function PlanosPage() {
  const [plans, billing, { storefront }, properties, precosSetting] = await Promise.all([
    getPlans(),
    getMyBillingOverview(),
    getMyStorefront(),
    getMyProperties(),
    getSiteSetting('vitrine_precos'),
  ]);

  const company = billing.company as any;
  const subscription = billing.subscription as any;
  const manualContract = billing.manualContract as any;
  const currentPlan = subscription?.plans;
  const latestPayment = billing.latestPayment as any;
  const companyAudience = company?.type === 'corretor_autonomo' ? 'corretor_autonomo' : 'b2b';
  const planPairs = company ? groupPlanPairs(plans as PlanRow[], companyAudience) : [];
  // Plano manual (criado pelo admin) tem prioridade de exibição.
  const currentPlanName = currentPlan?.name ?? subscription?.custom_plan_name ?? manualContract?.plan_name ?? null;
  const manualEffStatus =
    manualContract?.status === 'ativo' ? 'ativa'
    : manualContract?.status === 'pausado' ? 'pausado'
    : manualContract?.status === 'agendado' ? 'agendado'
    : manualContract?.status === 'expirado' ? 'expirado'
    : null;
  const effStatus = manualEffStatus ?? subscription?.status;
  const renewalDate = dateLabel(subscription?.current_period_end ?? manualContract?.ends_at);
  const isTrial = subscription?.status === 'trial' && !manualContract;
  const trialLeft = isTrial ? trialDaysRemaining(subscription?.current_period_end) : null;
  const baseLimit = company?.type === 'corretor_autonomo' ? 1 : 0;
  const maxActive = Number(
    subscription?.max_listings_override ?? currentPlan?.max_active_listings ?? manualContract?.max_active_listings ?? baseLimit,
  );
  const includedFeatured = Number(manualContract?.included_featured ?? currentPlan?.included_featured ?? 0);
  const hasPlan = !!currentPlanName;
  const limitText = hasPlan
    ? listingLimit(maxActive)
    : company?.type === 'corretor_autonomo'
      ? '1 imóvel ativo gratuito'
      : 'Sem plano profissional ativo';

  const activeProperties = properties
    .filter((p) => p.status === 'ativo')
    .map((p) => ({ id: p.id, title: p.title }));
  const vitrinePrecos = (precosSetting as typeof DEFAULT_VITRINE_PRECOS | null) ?? DEFAULT_VITRINE_PRECOS;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/painel" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Painel
      </Link>

      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assinatura e compras</h1>
          <p className="mt-1 text-sm text-muted">Plano, destaques, topo da busca e vitrine — tudo em um lugar.</p>
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
          <section className="mb-8 grid gap-4 lg:grid-cols-[1.4fr_.8fr]">
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">{manualContract ? 'Plano manual' : 'Assinatura atual'}</p>
                  <h2 className="mt-1 text-xl font-bold">{currentPlanName ?? 'Sem assinatura ativa'}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {company.trade_name ?? company.legal_name ?? 'Perfil profissional'} · {limitText}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[effStatus] ?? 'bg-border text-muted'}`}>
                  {statusLabel[effStatus] ?? 'Sem plano'}
                </span>
              </div>

              {isTrial && trialLeft !== null && (
                <p className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                  Teste grátis ativo — {trialLeft} {trialLeft === 1 ? 'dia restante' : 'dias restantes'}. Depois do teste,
                  será necessário concluir o pagamento para manter o plano ativo.
                </p>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-bg p-3">
                  <p className="text-xs text-muted">Imóveis ativos</p>
                  <p className="mt-1 text-lg font-extrabold tabular-nums">
                    {billing.activeProperties}{maxActive ? `/${maxActive}` : ''}
                  </p>
                </div>
                <div className="rounded-xl bg-bg p-3">
                  <p className="text-xs text-muted">Destaques inclusos</p>
                  <p className="mt-1 text-lg font-extrabold tabular-nums">{includedFeatured}</p>
                </div>
                <div className="rounded-xl bg-bg p-3">
                  <p className="text-xs text-muted">{isTrial ? 'Teste grátis até' : 'Renovação'}</p>
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
          <PlanSelector pairs={planPairs} currentSlug={currentPlan?.slug} />

          <div className="mb-4 mt-10 flex items-center gap-2">
            <Sparkles size={18} className="text-link" />
            <h2 className="text-lg font-bold">Impulsione um imóvel</h2>
          </div>
          <AvulsoPurchase properties={activeProperties} destaques={avulsos('destaque')} topos={avulsos('topo')} />

          <div className="mb-4 mt-10 flex items-center gap-2">
            <Store size={18} className="text-link" />
            <h2 className="text-lg font-bold">Vitrine</h2>
          </div>
          <VitrineActivation storefront={storefront} precos={vitrinePrecos} />
        </>
      )}
    </main>
  );
}
