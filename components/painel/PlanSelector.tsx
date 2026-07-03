'use client';
import { useState } from 'react';
import { Check, Gift } from 'lucide-react';
import {
  annualDiscount,
  listingLimit,
  money,
  monthlyEquivalent,
  planBenefits,
  planTagline,
  type PlanPair,
} from '@/lib/pricing';
import { TRIAL_DAYS } from '@/lib/subscription';
import { startPlanCheckout } from '@/app/painel/planos/actions';

export function PlanSelector({ pairs, currentSlug }: { pairs: PlanPair[]; currentSlug?: string }) {
  const [annual, setAnnual] = useState(false);
  const hasAnnual = pairs.some((p) => p.annual);

  const toggleBtn = (active: boolean) =>
    `rounded-full px-4 py-1.5 transition ${active ? 'bg-primary text-on-primary' : 'text-muted hover:text-text'}`;

  return (
    <div>
      {hasAnnual && (
        <div className="mb-4 inline-flex items-center rounded-full border border-border bg-surface p-1 text-sm font-bold">
          <button type="button" onClick={() => setAnnual(false)} className={toggleBtn(!annual)}>
            Mensal
          </button>
          <button type="button" onClick={() => setAnnual(true)} className={toggleBtn(annual)}>
            Anual <span className="ml-1 text-xs font-extrabold text-success">-20%</span>
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pairs.map((pair) => {
          const showAnnual = annual && !!pair.annual;
          const plan = showAnnual ? pair.annual! : pair.monthly;
          const isCurrent = currentSlug === plan.slug;
          const discount = annualDiscount(pair.monthly, pair.annual);

          return (
            <article
              key={pair.key}
              className={`flex h-full flex-col rounded-xl border bg-surface p-5 ${pair.monthly.highlight ? 'border-primary shadow-sm' : 'border-border'}`}
            >
              {pair.monthly.highlight && (
                <p className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-link">Mais escolhido</p>
              )}
              <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">
                <Gift size={13} /> {TRIAL_DAYS} dias grátis
              </span>
              <h3 className="text-lg font-bold">{pair.monthly.name}</h3>
              <p className="mt-1 text-sm text-muted">{listingLimit(pair.monthly.max_active_listings)}</p>
              {planTagline[pair.key] && (
                <p className="mt-1 text-sm text-text/80">{planTagline[pair.key]}</p>
              )}

              {showAnnual ? (
                <>
                  <p className="mt-4 text-3xl font-extrabold">
                    {money(monthlyEquivalent(pair.annual!))}
                    <span className="text-base font-semibold text-muted">/mês</span>
                  </p>
                  <p className="text-sm text-muted">
                    {money(pair.annual!.price)} por ano{discount ? ` · ${discount}% off` : ''}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-4 text-3xl font-extrabold">{money(pair.monthly.price)}</p>
                  <p className="text-sm text-muted">por mês</p>
                </>
              )}

              <ul className="mt-4 space-y-2 text-sm">
                {planBenefits(plan).map((benefit) => (
                  <li key={benefit} className="flex gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-success" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <form action={startPlanCheckout} className="mt-auto pt-5">
                <input type="hidden" name="planSlug" value={plan.slug} />
                <button
                  disabled={isCurrent}
                  className="h-10 w-full rounded-full bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-border disabled:text-muted"
                >
                  {isCurrent ? 'Plano atual' : 'Escolher este plano'}
                </button>
                {!isCurrent && (
                  <p className="mt-2 text-center text-xs text-muted">
                    {TRIAL_DAYS} dias grátis. Depois, {showAnnual ? money(pair.annual!.price) + '/ano' : money(pair.monthly.price) + '/mês'} para manter ativo.
                  </p>
                )}
              </form>
            </article>
          );
        })}
      </div>
    </div>
  );
}
