import Link from 'next/link';
import { ArrowRight, BadgeCheck, CalendarClock, CreditCard, ShieldAlert, Sparkles } from 'lucide-react';
import type { SubscriptionSummary as Summary, SummaryTone } from '@/lib/subscription';

// Bloco de resumo da assinatura exibido logo abaixo da saudação do painel.
// Só exibe o estado real vindo do banco (ver lib/subscription.ts).

const toneCard: Record<SummaryTone, string> = {
  neutral: 'border-border bg-surface',
  info: 'border-primary/30 bg-primary/5',
  success: 'border-success/30 bg-success/10',
  warning: 'border-warning/40 bg-warning/10',
  danger: 'border-danger/40 bg-danger/10',
};

const toneBadge: Record<SummaryTone, string> = {
  neutral: 'bg-border text-muted',
  info: 'bg-primary/10 text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-danger/15 text-danger',
};

const iconFor = (kind: Summary['kind']) => {
  if (kind === 'trial') return Sparkles;
  if (kind === 'ativa') return BadgeCheck;
  if (kind === 'trial_expirado' || kind === 'pendente') return CalendarClock;
  if (kind === 'inadimplente') return ShieldAlert;
  return CreditCard;
};

export function SubscriptionSummary({ summary }: { summary: Summary }) {
  const Icon = iconFor(summary.kind);

  return (
    <section className={`rounded-xl border p-4 sm:p-5 ${toneCard[summary.tone]}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <Icon size={22} className="mt-0.5 shrink-0 text-link" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold">
                Plano atual: {summary.planName ?? 'Nenhum'}
              </p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${toneBadge[summary.tone]}`}>
                {summary.statusLabel}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted">Conta: {summary.accountLabel}</p>
            {summary.kind === 'trial' && summary.trialDaysRemaining !== null && (
              <p className="mt-2 text-sm font-semibold text-success">
                Teste grátis ativo — {summary.trialDaysRemaining}{' '}
                {summary.trialDaysRemaining === 1 ? 'dia restante' : 'dias restantes'}
              </p>
            )}
            <p className="mt-1.5 text-sm text-text/90">{summary.message}</p>
          </div>
        </div>

        {summary.cta && (
          <Link
            href={summary.cta.href}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:bg-primary-hover"
          >
            {summary.cta.label} <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </section>
  );
}
