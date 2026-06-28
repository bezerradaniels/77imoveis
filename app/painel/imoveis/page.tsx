import Image from 'next/image';
import Link from 'next/link';
import { Plus, Eye, MessageSquare, ArrowLeft } from 'lucide-react';
import { getMyProperties } from '@/lib/data';
import { priceLabel } from '@/lib/format';
import { PropertyActions } from '@/components/painel/PropertyActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Meus imóveis', robots: { index: false } };

const statusBadge: Record<string, { label: string; cls: string }> = {
  ativo: { label: 'Ativo', cls: 'bg-success/15 text-success' },
  pausado: { label: 'Pausado', cls: 'bg-warning/15 text-warning' },
  rascunho: { label: 'Rascunho', cls: 'bg-border text-muted' },
  arquivado: { label: 'Arquivado', cls: 'bg-border text-muted' },
  em_moderacao: { label: 'Em moderação', cls: 'bg-accent/15 text-accent' },
  reprovado: { label: 'Reprovado', cls: 'bg-danger/15 text-danger' },
};
const shouldUnoptimize = (src: string) => src.endsWith('.svg') || (/^https?:\/\//.test(src) && !src.includes('.supabase.co'));

export default async function MeusImoveisPage() {
  const items = await getMyProperties();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/painel" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Painel
      </Link>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meus imóveis</h1>
        <Link
          href="/painel/imoveis/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary"
        >
          <Plus size={18} /> Novo
        </Link>
      </div>

      {items.length ? (
        <ul className="space-y-3">
          {items.map((p) => {
            const b = statusBadge[p.status] ?? statusBadge.rascunho;
            return (
              <li
                key={p.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center"
              >
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-subtle">
                  <Image
                    src={p.coverUrl}
                    alt=""
                    fill
                    sizes="112px"
                    unoptimized={shouldUnoptimize(p.coverUrl)}
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.cls}`}>{b.label}</span>
                    <span className="text-sm font-semibold tabular-nums">{priceLabel(p)}</span>
                  </div>
                  <h2 className="mt-1 line-clamp-1 text-sm font-medium">{p.title}</h2>
                  <p className="mt-0.5 flex gap-4 text-xs text-muted">
                    <span className="inline-flex items-center gap-1"><Eye size={13} /> {p.views}</span>
                    <span className="inline-flex items-center gap-1"><MessageSquare size={13} /> {p.leads}</span>
                    <span>{p.cityName}</span>
                  </p>
                </div>
                <PropertyActions id={p.id} slug={p.slug} status={p.status} />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted">Você ainda não tem anúncios.</p>
          <Link
            href="/painel/imoveis/novo"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary"
          >
            <Plus size={18} /> Criar meu primeiro anúncio
          </Link>
        </div>
      )}
    </main>
  );
}
