import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BadgeCheck, Gift } from 'lucide-react';
import { adminGetBroker } from '@/lib/data';
import { FreeForeverToggle } from '@/components/admin/FreeForeverToggle';

export const dynamic = 'force-dynamic';

const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString('pt-BR') : '—');

export default async function BrokerDetail({ params }: { params: { id: string } }) {
  const broker = await adminGetBroker(params.id);
  if (!broker) notFound();
  const b = broker as any;
  const co = b.companies;
  const propertyCount = b.properties?.[0]?.count ?? 0;

  const facts: [string, string][] = [
    ['Nome', b.name ?? '—'],
    ['CRECI', b.creci ?? '—'],
    ['Status', b.status],
    ['E-mail', b.email ?? b.profiles?.email ?? '—'],
    ['Telefone', b.phone ?? b.profiles?.phone ?? '—'],
    ['WhatsApp', b.whatsapp ?? '—'],
    ['Empresa', co?.trade_name ?? '—'],
    ['Cidade', co?.cities?.name ?? '—'],
    ['Imóveis', String(propertyCount)],
    ['Verificado em', fmtDate(b.verified_at)],
    ['Aprovado em', fmtDate(b.approved_at)],
    ['Cadastrado em', fmtDate(b.created_at)],
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/corretores" className="inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Corretores
      </Link>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {b.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.photo_url} alt={b.name} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg text-lg font-bold text-muted">
                {(b.name ?? '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold">{b.name ?? 'Corretor'}</h1>
                {b.verified_at && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <BadgeCheck size={12} /> Verificado
                  </span>
                )}
                {b.free_forever && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                    <Gift size={12} /> Cortesia vitalícia
                  </span>
                )}
              </div>
              {co && (
                <Link href={`/admin/empresas/${co.id}`} className="mt-1 inline-block text-sm text-link hover:underline">
                  {co.trade_name}
                </Link>
              )}
            </div>
          </div>
          <FreeForeverToggle entity="broker" id={b.id} active={!!b.free_forever} />
        </div>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {b.free_forever && (
          <p className="mt-4 rounded-lg bg-success/10 p-3 text-xs text-success">
            Cortesia vitalícia concedida em {fmtDate(b.free_forever_since)} — selo verificado e acesso de cortesia permanente.
          </p>
        )}
      </div>
    </div>
  );
}
