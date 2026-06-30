'use client';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { adminBulkDeleteNeighborhoods, adminBulkToggleCityFeatured } from '@/app/admin/actions';
import { CityFeatured } from './CityAdmin';

export function CityNeighborhoodBulkList({ cities, neighborhoods }: { cities: any[]; neighborhoods: any[] }) {
  const router = useRouter();
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [cityAction, setCityAction] = useState('');
  const [neighborhoodAction, setNeighborhoodAction] = useState('');
  const [message, setMessage] = useState('');
  const [pending, start] = useTransition();
  const cityIds = useMemo(() => cities.map((item) => item.id), [cities]);
  const neighborhoodIds = useMemo(() => neighborhoods.map((item) => item.id), [neighborhoods]);

  const runCities = () => start(async () => {
    setMessage('');
    const r = await adminBulkToggleCityFeatured(selectedCities, cityAction === 'feature');
    setMessage(r?.error || 'Ação aplicada.');
    if (!r?.error) {
      setSelectedCities([]);
      setCityAction('');
      router.refresh();
    }
  });

  const runNeighborhoods = () => start(async () => {
    setMessage('');
    if (!confirm('Excluir os bairros selecionados? A ação só será aplicada em bairros sem imóveis ou empresas vinculados.')) return;
    const r = await adminBulkDeleteNeighborhoods(selectedNeighborhoods);
    setMessage(r?.error || 'Ação aplicada.');
    if (!r?.error) {
      setSelectedNeighborhoods([]);
      setNeighborhoodAction('');
      router.refresh();
    }
  });

  const toggle = (ids: string[], setIds: (ids: string[]) => void, id: string) =>
    setIds(ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold">Cidades ({cities.length})</h2>
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={cityIds.length > 0 && selectedCities.length === cityIds.length} onChange={(e) => setSelectedCities(e.target.checked ? cityIds : [])} />
            {selectedCities.length ? `${selectedCities.length} selecionada(s)` : 'Selecionar cidades'}
          </label>
          <select value={cityAction} onChange={(e) => setCityAction(e.target.value)} className="h-9 rounded-md border border-border bg-bg px-2 text-sm">
            <option value="">Ação em lote</option>
            <option value="feature">Destacar</option>
            <option value="unfeature">Remover destaque</option>
          </select>
          <button disabled={pending || !selectedCities.length || !cityAction} onClick={runCities} className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-on-primary disabled:opacity-50">Aplicar</button>
        </div>
        <ul className="space-y-2">
          {cities.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3">
              <div className="flex min-w-0 gap-3">
                <input aria-label={`Selecionar ${c.name}`} type="checkbox" checked={selectedCities.includes(c.id)} onChange={() => toggle(selectedCities, setSelectedCities, c.id)} className="mt-1" />
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted">/{c.slug} · {c.neighborhoods?.[0]?.count ?? 0} bairros{c.population ? ` · ${c.population.toLocaleString('pt-BR')} hab.` : ''}</p>
                </div>
              </div>
              <CityFeatured id={c.id} featured={c.is_featured} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Bairros ({neighborhoods.length})</h2>
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
          <label className="inline-flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={neighborhoodIds.length > 0 && selectedNeighborhoods.length === neighborhoodIds.length} onChange={(e) => setSelectedNeighborhoods(e.target.checked ? neighborhoodIds : [])} />
            {selectedNeighborhoods.length ? `${selectedNeighborhoods.length} selecionado(s)` : 'Selecionar bairros'}
          </label>
          <select value={neighborhoodAction} onChange={(e) => setNeighborhoodAction(e.target.value)} className="h-9 rounded-md border border-border bg-bg px-2 text-sm">
            <option value="">Ação em lote</option>
            <option value="delete">Excluir sem vínculos</option>
          </select>
          <button disabled={pending || !selectedNeighborhoods.length || neighborhoodAction !== 'delete'} onClick={runNeighborhoods} className="h-9 rounded-md bg-danger px-3 text-sm font-medium text-on-primary disabled:opacity-50">Aplicar</button>
        </div>
        <ul className="grid gap-2 lg:grid-cols-2">
          {neighborhoods.map((n) => (
            <li key={n.id} className="flex gap-3 rounded-xl border border-border bg-surface p-3">
              <input aria-label={`Selecionar ${n.name}`} type="checkbox" checked={selectedNeighborhoods.includes(n.id)} onChange={() => toggle(selectedNeighborhoods, setSelectedNeighborhoods, n.id)} className="mt-1" />
              <div>
                <p className="text-sm font-medium">{n.name}</p>
                <p className="text-xs text-muted">{n.cities?.name ?? '—'} · /{n.slug} · Imóveis: {n.properties?.[0]?.count ?? 0} · Empresas: {n.companies?.[0]?.count ?? 0}</p>
              </div>
            </li>
          ))}
          {!neighborhoods.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted lg:col-span-2">Nenhum bairro.</p>}
        </ul>
      </section>
      {message && <p className={message === 'Ação aplicada.' ? 'text-sm text-success' : 'text-sm text-danger'}>{message}</p>}
    </div>
  );
}
