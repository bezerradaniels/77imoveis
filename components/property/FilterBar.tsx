'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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
// Server Component lê esses parâmetros e refaz a consulta no banco.
export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Atualiza um parâmetro na URL, sempre voltando à 1ª página.
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    value ? next.set(key, value) : next.delete(key);
    next.delete('pagina');
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-3 shadow-card">
      <div className="flex flex-wrap gap-2">
        {modalidades.map((m) => {
          const active = (params.get('modalidade') ?? '') === m.value;
          return (
            <button
              key={m.value || 'todas'}
              onClick={() => setParam('modalidade', m.value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm',
                active ? 'bg-primary text-white' : 'border border-border text-muted hover:bg-bg',
              )}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        <Dropdown
          options={quartos}
          value={params.get('quartos') ?? ''}
          onChange={(v) => setParam('quartos', v)}
          placeholder="Quartos"
        />
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
        <Dropdown
          options={ordens}
          value={params.get('ordem') ?? 'recentes'}
          onChange={(v) => setParam('ordem', v)}
          placeholder="Ordenar"
        />
      </div>
    </div>
  );
}
