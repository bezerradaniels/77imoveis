'use client';
import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import { cn } from '@/lib/cn';

const modalidades = [
  { value: '', label: 'Todas' },
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
  { value: 'temporada', label: 'Temporada' },
  { value: 'romaria', label: 'Romaria' },
  { value: 'lancamento', label: 'Lançamento' },
];

const ordens = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
];

const quartos = [
  { value: '', label: 'Quartos' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

// Filtros da busca — escrevem na URL (?modalidade, ?quartos, ?min, ?max, ?ordem).
// No mobile os filtros secundários ficam recolhidos para mostrar resultados antes.
export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [more, setMore] = useState(false);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    value ? next.set(key, value) : next.delete(key);
    next.delete('pagina');
    router.push(`${pathname}?${next.toString()}`);
  };

  const ativos = ['quartos', 'min', 'max'].filter((k) => params.get(k)).length + (params.get('ordem') && params.get('ordem') !== 'recentes' ? 1 : 0);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-3">
      {/* modalidade — rolagem horizontal */}
      <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3">
        {modalidades.map((m) => {
          const active = (params.get('modalidade') ?? '') === m.value;
          return (
            <button
              key={m.value || 'todas'}
              onClick={() => setParam('modalidade', m.value)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors',
                active ? 'bg-primary text-white' : 'border border-border text-muted hover:bg-bg',
              )}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* botão recolher/expandir (mobile) */}
      <button
        onClick={() => setMore((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-border px-3 py-2 text-sm sm:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal size={15} /> Filtros{ativos ? ` (${ativos})` : ''}
        </span>
        <ChevronDown size={16} className={cn('text-muted transition', more && 'rotate-180')} />
      </button>

      {/* filtros secundários — sempre visíveis no desktop, recolhíveis no mobile */}
      <div className={cn('gap-2 sm:grid sm:grid-cols-4', more ? 'grid grid-cols-1' : 'hidden')}>
        <Dropdown options={quartos} value={params.get('quartos') ?? ''} onChange={(v) => setParam('quartos', v)} placeholder="Quartos" />
        <input
          type="number"
          inputMode="numeric"
          defaultValue={params.get('min') ?? ''}
          placeholder="Preço mín."
          onBlur={(e) => setParam('min', e.target.value)}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm"
        />
        <input
          type="number"
          inputMode="numeric"
          defaultValue={params.get('max') ?? ''}
          placeholder="Preço máx."
          onBlur={(e) => setParam('max', e.target.value)}
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm"
        />
        <Dropdown options={ordens} value={params.get('ordem') ?? 'recentes'} onChange={(v) => setParam('ordem', v)} placeholder="Ordenar" />
      </div>
    </div>
  );
}
