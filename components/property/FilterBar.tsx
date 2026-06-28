'use client';
import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import { Autocomplete } from '@/components/ui/Autocomplete';
import { cn } from '@/lib/cn';

const modalidades = [
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
  { value: 'temporada', label: 'Temporada' },
  { value: 'romaria', label: 'Romaria' },
  { value: 'lancamento', label: 'Lançamento' },
];

const countOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4+', label: '4+' },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex w-full items-center justify-center gap-1 rounded-[10px] px-2 py-1.5 text-[13px] font-medium transition-colors',
        active ? 'bg-primary text-white' : 'border border-border text-slate-900 hover:bg-bg dark:text-white',
      )}
    >
      {active && <Check size={13} />}
      {children}
    </button>
  );
}

// Filtros de refinamento da busca — escrevem na URL (?modalidade, ?troca,
// ?bairro, ?quartos, ?banheiros, ?vagas, ?min, ?max). No desktop fica sempre
// visível como sidebar; no mobile fica recolhido atrás do botão "Filtros".
// Modalidade, Quartos, Banheiros e Vagas aceitam múltipla escolha (lista
// separada por vírgula na URL).
export function FilterBar({
  neighborhoods = [],
  cities = [],
  types = [],
  hideNeighborhoods = false,
}: {
  neighborhoods?: { value: string; label: string }[];
  cities?: { value: string; label: string }[];
  types?: { value: string; label: string }[];
  hideNeighborhoods?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    value ? next.set(key, value) : next.delete(key);
    next.delete('pagina');
    router.push(`${pathname}?${next.toString()}`);
  };

  const listParam = (key: string) => (params.get(key) ?? '').split(',').filter(Boolean);

  const toggleInList = (key: string, value: string) => {
    const current = listParam(key);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setParam(key, next.join(','));
  };

  const selectedModalidades = listParam('modalidade');
  const selectedQuartos = listParam('quartos');
  const selectedBanheiros = listParam('banheiros');
  const selectedVagas = listParam('vagas');
  const acceptsExchange = params.get('troca') === '1';

  const activeCount =
    selectedModalidades.length +
    selectedQuartos.length +
    selectedBanheiros.length +
    selectedVagas.length +
    (acceptsExchange ? 1 : 0) +
    ['min', 'max', 'bairro', 'cidade', 'tipo'].filter((k) => params.get(k)).length;

  const clearAll = () => router.push(pathname);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-sm lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal size={15} /> Filtros{activeCount ? ` (${activeCount})` : ''}
        </span>
        <ChevronDown size={16} className={cn('text-muted transition', open && 'rotate-180')} />
      </button>

      <div
        className={cn(
          'mt-2 space-y-4 rounded-xl bg-surface p-3 sm:p-4 lg:sticky lg:top-20 lg:mt-0',
          open ? 'block' : 'hidden',
          'lg:block',
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text">Filtros</span>
          {!!activeCount && (
            <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-muted hover:text-primary">
              <X size={13} /> Limpar
            </button>
          )}
        </div>

        {!!cities.length && (
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-muted">Cidade</span>
            <Dropdown
              options={[{ value: '', label: 'Todas as cidades' }, ...cities]}
              value={params.get('cidade') ?? ''}
              onChange={(v) => setParam('cidade', v)}
              placeholder="Todas as cidades"
            />
          </div>
        )}

        {!hideNeighborhoods && (
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-muted">Bairro</span>
            <Autocomplete
              options={neighborhoods}
              value={params.get('bairro') ?? ''}
              onChange={(v) => setParam('bairro', v)}
              placeholder={neighborhoods.length ? 'Digite o bairro' : 'Selecione uma cidade primeiro'}
              disabled={!neighborhoods.length}
            />
          </div>
        )}

        {!!types.length && (
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-muted">Tipo</span>
            <Dropdown
              options={[{ value: '', label: 'Todos os tipos' }, ...types]}
              value={params.get('tipo') ?? ''}
              onChange={(v) => setParam('tipo', v)}
              placeholder="Todos os tipos"
            />
          </div>
        )}

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-muted">Modalidade</span>
          <div className="grid grid-cols-2 gap-2">
            {modalidades.map((m) => (
              <Chip key={m.value} active={selectedModalidades.includes(m.value)} onClick={() => toggleInList('modalidade', m.value)}>
                {m.label}
              </Chip>
            ))}
            <Chip active={acceptsExchange} onClick={() => setParam('troca', acceptsExchange ? '' : '1')}>
              Trocar
            </Chip>
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-muted">Quartos</span>
          <div className="grid grid-cols-4 gap-2">
            {countOptions.map((q) => (
              <Chip key={q.value} active={selectedQuartos.includes(q.value)} onClick={() => toggleInList('quartos', q.value)}>
                {q.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-muted">Banheiros</span>
          <div className="grid grid-cols-4 gap-2">
            {countOptions.map((b) => (
              <Chip key={b.value} active={selectedBanheiros.includes(b.value)} onClick={() => toggleInList('banheiros', b.value)}>
                {b.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-muted">Vagas (estacionamento)</span>
          <div className="grid grid-cols-4 gap-2">
            {countOptions.map((v) => (
              <Chip key={v.value} active={selectedVagas.includes(v.value)} onClick={() => toggleInList('vagas', v.value)}>
                {v.label}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-muted">Valor (R$)</span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="numeric"
              defaultValue={params.get('min') ?? ''}
              placeholder="Mín."
              onBlur={(e) => setParam('min', e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-2.5 text-sm font-medium text-slate-900 dark:text-white"
            />
            <input
              type="number"
              inputMode="numeric"
              defaultValue={params.get('max') ?? ''}
              placeholder="Máx."
              onBlur={(e) => setParam('max', e.target.value)}
              className="h-9 rounded-lg border border-border bg-surface px-2.5 text-sm font-medium text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </>
  );
}
