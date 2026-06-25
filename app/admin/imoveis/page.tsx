import Link from 'next/link';
import { adminListProperties } from '@/lib/data';
import { priceLabel } from '@/lib/format';
import { PropertyModeration } from '@/components/admin/PropertyModeration';

export const dynamic = 'force-dynamic';

const statusOpts = [
  { v: '', l: 'Todos' },
  { v: 'em_moderacao', l: 'Em moderação' },
  { v: 'ativo', l: 'Ativos' },
  { v: 'rascunho', l: 'Rascunhos' },
  { v: 'pausado', l: 'Pausados' },
  { v: 'reprovado', l: 'Reprovados' },
];

export default async function AdminImoveis({ searchParams }: { searchParams: { status?: string } }) {
  const status = searchParams.status || '';
  const items = await adminListProperties(status || undefined);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {statusOpts.map((s) => (
          <Link
            key={s.v || 'all'}
            href={s.v ? `/admin/imoveis?status=${s.v}` : '/admin/imoveis'}
            className={status === s.v ? 'rounded-full bg-primary px-3 py-1 text-sm text-white' : 'rounded-full border border-border px-3 py-1 text-sm hover:bg-surface'}
          >
            {s.l}
          </Link>
        ))}
      </div>

      <ul className="space-y-2">
        {items.map((p: any) => (
          <li key={p.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="rounded bg-bg px-1.5 py-0.5">{p.status}</span>
                <span>{priceLabel(p)}</span>
                <span>· {p.cities?.name}</span>
              </div>
              <Link href={`/imovel/${p.slug}`} className="line-clamp-1 text-sm font-medium hover:text-primary">{p.title}</Link>
              <p className="text-xs text-muted">por {p.profiles?.full_name ?? '—'}</p>
            </div>
            <PropertyModeration id={p.id} status={p.status} featured={p.is_featured} />
          </li>
        ))}
        {!items.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nada aqui.</p>}
      </ul>
    </div>
  );
}
