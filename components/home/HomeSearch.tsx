'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import type { Option } from '@/components/ui/Dropdown';
import { cn } from '@/lib/cn';

const faixasVenda = [
  { value: '', label: 'Qualquer valor' },
  { value: '0-150000', label: 'Até R$ 150 mil' },
  { value: '150000-300000', label: 'R$ 150 – 300 mil' },
  { value: '300000-600000', label: 'R$ 300 – 600 mil' },
  { value: '600000-1000000', label: 'R$ 600 mil – 1 mi' },
  { value: '1000000-', label: 'Acima de R$ 1 mi' },
];

const faixasAluguel = [
  { value: '', label: 'Qualquer valor' },
  { value: '0-1000', label: 'Até R$ 1.000/mês' },
  { value: '1000-2000', label: 'R$ 1.000 – 2.000/mês' },
  { value: '2000-3500', label: 'R$ 2.000 – 3.500/mês' },
  { value: '3500-6000', label: 'R$ 3.500 – 6.000/mês' },
  { value: '6000-', label: 'Acima de R$ 6.000/mês' },
];

const quartosOpts = [
  { value: '', label: 'Indiferente' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

function FieldShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <label className="text-xs font-bold text-muted">{label}</label>
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <FieldShell label={label}>
      <div ref={ref} className="relative">
        <button
          type="button"
          aria-expanded={open}
          aria-label={label}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            'flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 text-left text-sm font-medium text-text shadow-[0_1px_0_rgba(8,30,22,.04)] outline-none transition-all',
            'hover:border-primary/45 focus:border-primary focus:ring-4 focus:ring-primary/10',
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown size={16} className={cn('shrink-0 text-muted transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_18px_42px_-18px_rgba(8,30,22,.38)]">
            <div className="max-h-64 overflow-auto p-1.5">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm font-semibold text-text transition-colors hover:bg-primary/10',
                    value === option.value && 'bg-primary text-white hover:bg-primary',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </FieldShell>
  );
}

function CityField({ cities, value, onChange }: { cities: Option[]; value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const selected = cities.find((city) => city.value === value);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return cities.slice(0, 8);
    return cities.filter((city) => city.label.toLowerCase().includes(term)).slice(0, 8);
  }, [cities, query]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <FieldShell label="Cidade">
      <div ref={ref} className="relative">
        <input
          aria-label="Cidade"
          value={open ? query : selected?.label ?? query}
          onFocus={() => {
            setQuery(selected?.label ?? '');
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange('');
            setOpen(true);
          }}
          placeholder="Digite uma cidade"
          className="h-12 w-full rounded-xl border border-border bg-surface px-3.5 pr-9 text-sm font-medium text-text shadow-[0_1px_0_rgba(8,30,22,.04)] outline-none transition-all placeholder:text-muted hover:border-primary/45 focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        <ChevronDown size={16} className={cn('pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-transform', open && 'rotate-180')} />
        {open && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_18px_42px_-18px_rgba(8,30,22,.38)]">
            <div className="max-h-64 overflow-auto p-1.5">
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setQuery('');
                  setOpen(false);
                }}
                className={cn(
                  'flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm font-semibold transition-colors hover:bg-primary/10',
                  !value && !query ? 'bg-primary text-white hover:bg-primary' : 'text-text',
                )}
              >
                Todas as cidades
              </button>
              {filtered.map((city) => (
                <button
                  key={city.value}
                  type="button"
                  onClick={() => {
                    onChange(city.value);
                    setQuery(city.label);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm font-semibold text-text transition-colors hover:bg-primary/10',
                    value === city.value && 'bg-primary text-white hover:bg-primary',
                  )}
                >
                  {city.label}
                </button>
              ))}
              {!filtered.length && (
                <div className="px-3 py-3 text-sm font-medium text-muted">Nenhuma cidade encontrada</div>
              )}
            </div>
          </div>
        )}
      </div>
    </FieldShell>
  );
}

// Card de busca da home: aba Comprar/Alugar + cidade/tipo/preço/quartos → navega.
export function HomeSearch({ cities, types }: { cities: Option[]; types: Option[] }) {
  const router = useRouter();
  const [purpose, setPurpose] = useState<'venda' | 'aluguel'>('venda');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [faixa, setFaixa] = useState('');
  const [quartos, setQuartos] = useState('');
  const faixas = purpose === 'aluguel' ? faixasAluguel : faixasVenda;

  const buscar = () => {
    const dest = city || cities[0]?.value || 'vitoria-da-conquista';
    const base = type ? `/${dest}/${type}s` : `/${dest}`;
    const sp = new URLSearchParams({ modalidade: purpose });
    if (quartos) sp.set('quartos', quartos);
    if (faixa) {
      const [min, max] = faixa.split('-');
      if (min) sp.set('min', min);
      if (max) sp.set('max', max);
    }
    router.push(`${base}?${sp.toString()}`);
  };

  return (
    <div className="rounded-[20px] border border-[#eceeec] bg-surface p-4 shadow-[0_26px_60px_-28px_rgba(8,30,22,.4)] sm:p-5">
      <div className="mb-4 flex w-fit gap-1.5 rounded-[13px] bg-subtle p-1.5">
        <button
          type="button"
          onClick={() => {
            setPurpose('venda');
            setFaixa('');
          }}
          className={cn(
            'rounded-[9px] px-[22px] py-2.5 text-sm font-bold transition-all',
            purpose === 'venda' ? 'bg-primary text-white shadow-sm' : 'text-muted',
          )}
        >
          Comprar
        </button>
        <button
          type="button"
          onClick={() => {
            setPurpose('aluguel');
            setFaixa('');
          }}
          className={cn(
            'rounded-[9px] px-[22px] py-2.5 text-sm font-bold transition-all',
            purpose === 'aluguel' ? 'bg-primary text-white shadow-sm' : 'text-muted',
          )}
        >
          Alugar
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-[2_1_200px]">
          <CityField cities={cities} value={city} onChange={setCity} />
        </div>
        <div className="flex-[1_1_150px]">
          <SelectField
            label="Tipo de imóvel"
            value={type}
            onChange={setType}
            placeholder="Todos os tipos"
            options={[{ value: '', label: 'Todos os tipos' }, ...types]}
          />
        </div>
        <div className="flex-[1_1_140px]">
          <SelectField label="Faixa de preço" value={faixa} onChange={setFaixa} placeholder="Qualquer valor" options={faixas} />
        </div>
        <div className="flex-[1_1_120px]">
          <SelectField label="Quartos" value={quartos} onChange={setQuartos} placeholder="Indiferente" options={quartosOpts} />
        </div>
        <button
          type="button"
          onClick={buscar}
          className="flex h-12 flex-[1_1_150px] items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[15px] font-bold text-white shadow-[0_10px_22px_-10px_rgba(14,157,116,.7)] transition-colors hover:bg-primary-hover"
        >
          <Search size={17} /> Buscar imóveis
        </button>
      </div>
    </div>
  );
}
