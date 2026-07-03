'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Star, ArrowUpNarrowWide } from 'lucide-react';
import { money } from '@/lib/pricing';
import { startListingFeatureCheckout } from '@/app/painel/imoveis/actions';

export type AvulsoProduct = { slug: string; name: string; description: string; amount: number; days: number };
type Prop = { id: string; title: string };

// Compra centralizada de destaque/topo: escolhe o imóvel + tipo + duração.
export function AvulsoPurchase({
  properties,
  destaques,
  topos,
}: {
  properties: Prop[];
  destaques: AvulsoProduct[];
  topos: AvulsoProduct[];
}) {
  const [type, setType] = useState<'destaque' | 'topo'>('destaque');
  const [days, setDays] = useState<number>(7);
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? '');

  const list = type === 'destaque' ? destaques : topos;
  const product = list.find((p) => p.days === days) ?? list[0];
  const durations = list.map((p) => p.days).sort((a, b) => a - b);

  if (properties.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-center">
        <p className="text-sm text-muted">Você precisa de um imóvel ativo para comprar destaque ou topo da busca.</p>
        <Link href="/painel/imoveis" className="mt-3 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary">
          Meus imóveis
        </Link>
      </div>
    );
  }

  const typeBtn = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
      active ? 'border-primary bg-primary-soft text-link' : 'border-border text-muted hover:text-text'
    }`;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => setType('destaque')} className={typeBtn(type === 'destaque')}>
              <Star size={15} /> Destaque
            </button>
            <button type="button" onClick={() => setType('topo')} className={typeBtn(type === 'topo')}>
              <ArrowUpNarrowWide size={15} /> Topo da busca
            </button>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-muted">Imóvel</span>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm outline-none focus:border-primary"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-semibold text-muted">Duração</span>
            <div className="flex gap-2">
              {durations.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                    days === d ? 'border-primary bg-primary-soft text-link' : 'border-border text-muted hover:text-text'
                  }`}
                >
                  {d} dias
                </button>
              ))}
            </div>
          </label>
        </div>

        <div className="flex flex-col justify-between rounded-lg bg-bg p-4">
          <div>
            <p className="text-sm font-bold">{product?.name}</p>
            <p className="mt-1 text-sm text-muted">{product?.description}</p>
            <p className="mt-3 text-2xl font-extrabold">{money(product?.amount ?? 0)}</p>
            <p className="text-xs text-muted">pagamento único</p>
          </div>
          <form action={startListingFeatureCheckout} className="mt-4">
            <input type="hidden" name="propertyId" value={propertyId} />
            <input type="hidden" name="productSlug" value={product?.slug ?? ''} />
            <button className="h-10 w-full rounded-full bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover">
              Comprar {type === 'destaque' ? 'destaque' : 'topo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
