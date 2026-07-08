import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, BadgeCheck, Gift } from 'lucide-react';
import { adminGetCompany } from '@/lib/data';
import { FreeForeverToggle } from '@/components/admin/FreeForeverToggle';

export const dynamic = 'force-dynamic';

const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString('pt-BR') : '—');
const typeLabel: Record<string, string> = {
  corretor_autonomo: 'Corretor autônomo',
  imobiliaria: 'Imobiliária',
  construtora: 'Construtora',
  incorporadora: 'Incorporadora',
};

export default async function CompanyDetail({ params }: { params: { id: string } }) {
  const company = await adminGetCompany(params.id);
  if (!company) notFound();
  const c = company as any;
  const sub = c.subscriptions?.[0];
  const propertyCount = c.properties?.[0]?.count ?? 0;
  const storefront = c.storefronts?.[0];

  const facts: [string, string][] = [
    ['Nome fantasia', c.trade_name ?? '—'],
    ['Razão social', c.legal_name ?? '—'],
    ['Tipo', typeLabel[c.type] ?? c.type],
    ['Status', c.status],
    ['CNPJ', c.cnpj ?? '—'],
    ['CRECI', c.creci ?? '—'],
    ['Cidade', c.cities?.name ?? '—'],
    ['Responsável', c.owner?.full_name ?? '—'],
    ['E-mail', c.email ?? c.owner?.email ?? '—'],
    ['Telefone', c.phone ?? c.owner?.phone ?? '—'],
    ['WhatsApp', c.whatsapp ?? '—'],
    ['Website', c.website ?? '—'],
    ['Imóveis', String(propertyCount)],
    ['Cadastrada em', fmtDate(c.created_at)],
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/empresas" className="inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Empresas
      </Link>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold">{c.trade_name ?? 'Empresa'}</h1>
              <span className="rounded bg-bg px-1.5 py-0.5 text-xs">{typeLabel[c.type] ?? c.type}</span>
              {c.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  <BadgeCheck size={12} /> Verificada
                </span>
              )}
              {c.free_forever && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                  <Gift size={12} /> Cortesia vitalícia
                </span>
              )}
            </div>
            {c.slug && (
              <Link href={`/empresa/${c.slug}`} target="_blank" className="mt-1 inline-flex items-center gap-1 text-sm text-link hover:underline">
                /empresa/{c.slug} <ExternalLink size={12} />
              </Link>
            )}
          </div>
          <FreeForeverToggle entity="company" id={c.id} active={!!c.free_forever} />
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {c.description && (
          <div className="mt-5">
            <p className="text-xs text-muted">Descrição</p>
            <p className="whitespace-pre-wrap text-sm">{c.description}</p>
          </div>
        )}
        {c.free_forever && (
          <p className="mt-4 rounded-lg bg-success/10 p-3 text-xs text-success">
            Cortesia vitalícia concedida em {fmtDate(c.free_forever_since)} — imóveis ilimitados, assinatura ativa, vitrine e selo, sem cobrança.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plano / assinatura */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-bold">Plano / assinatura</h2>
          {c.free_forever ? (
            <p className="text-sm">Cortesia vitalícia — acesso profissional ativo, sem cobrança.</p>
          ) : sub ? (
            <p className="text-sm">
              {sub.custom_plan_name ?? sub.plans?.name ?? 'Plano'} · <span className="font-medium">{sub.status}</span>
              {sub.current_period_end ? ` · até ${fmtDate(sub.current_period_end)}` : ''}
            </p>
          ) : (
            <p className="text-sm text-muted">Sem assinatura ativa.</p>
          )}
          {!!c.manual_contracts?.length && (
            <ul className="mt-3 space-y-1 text-xs text-muted">
              {c.manual_contracts.map((m: any) => (
                <li key={m.id}>
                  <Link href={`/admin/contratos/${m.id}`} className="text-link hover:underline">{m.plan_name}</Link> · {m.status} · {fmtDate(m.starts_at)}→{fmtDate(m.ends_at)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Vitrine */}
        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-sm font-bold">Vitrine</h2>
          {storefront ? (
            <p className="text-sm">
              Status: <span className="font-medium">{storefront.status}</span>
              {storefront.expires_at ? ` · expira ${fmtDate(storefront.expires_at)}` : ' · sem expiração'}
              {' · '}{storefront.views_count ?? 0} visitas
            </p>
          ) : (
            <p className="text-sm text-muted">Vitrine não criada.</p>
          )}
        </div>
      </div>

      {/* Corretores */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-bold">Corretores ({c.brokers?.length ?? 0})</h2>
        {c.brokers?.length ? (
          <ul className="divide-y divide-border">
            {c.brokers.map((b: any) => (
              <li key={b.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/admin/corretores/${b.id}`} className="text-link hover:underline">{b.name}</Link>
                <span className="flex items-center gap-2 text-xs text-muted">
                  {b.free_forever && <Gift size={12} className="text-success" />}
                  {b.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nenhum corretor vinculado.</p>
        )}
      </div>
    </div>
  );
}
