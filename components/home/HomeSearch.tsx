'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import type { Option } from '@/components/ui/Dropdown';
import { cn } from '@/lib/cn';

type PurposeValue = 'venda' | 'aluguel' | 'troca' | 'temporada' | 'romaria' | 'lancamento';

const purposeOptions: Option[] = [
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
  { value: 'troca', label: 'Trocar' },
  { value: 'temporada', label: 'Temporada' },
  { value: 'romaria', label: 'Romaria' },
  { value: 'lancamento', label: 'Lançamento' },
];

const quartosOpts = [
  { value: '', label: 'Indiferente' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

function FieldShell({
  label,
  children,
  heroStyle = false,
}: {
  label: string;
  children: React.ReactNode;
  heroStyle?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <label className={cn('text-xs font-bold', heroStyle ? 'text-slate-900' : 'text-muted')}>{label}</label>
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
  heroStyle,
}: {
  label: string;
  value: string;
  options: Option[];
  placeholder: string;
  onChange: (value: string) => void;
  heroStyle?: boolean;
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
    <FieldShell label={label} heroStyle={heroStyle}>
      <div ref={ref} className="relative">
        <button
          type="button"
          aria-expanded={open}
          aria-label={label}
          onClick={() => setOpen((current) => !current)}
          className={cn(
            'flex h-12 w-full items-center justify-between gap-3 rounded-xl border px-3.5 text-left text-sm font-medium shadow-[0_1px_0_rgba(8,30,22,.04)] outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10',
            heroStyle
              ? 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
              : 'border-border bg-surface text-text hover:border-primary/45',
          )}
        >
          <span className="truncate">{selected?.label ?? placeholder}</span>
          <ChevronDown size={16} className={cn('shrink-0 transition-transform', heroStyle ? 'text-slate-500' : 'text-muted', open && 'rotate-180')} />
        </button>
        {open && (
          <div className={cn('absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border shadow-[0_18px_42px_-18px_rgba(8,30,22,.38)]', heroStyle ? 'border-slate-200 bg-white' : 'border-border bg-surface')}>
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
                    'flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm font-semibold transition-colors hover:bg-primary/10',
                    heroStyle ? 'text-slate-900' : 'text-text',
                    value === option.value && 'bg-primary text-on-primary hover:bg-primary',
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

function CityField({
  cities,
  value,
  onChange,
  heroStyle,
}: {
  cities: Option[];
  value: string;
  onChange: (value: string) => void;
  heroStyle?: boolean;
}) {
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
    <FieldShell label="Cidade" heroStyle={heroStyle}>
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
          className={cn(
            'h-12 w-full rounded-xl border px-3.5 pr-9 text-sm font-medium shadow-[0_1px_0_rgba(8,30,22,.04)] outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10',
            heroStyle
              ? 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-500 hover:border-slate-300'
              : 'border-border bg-surface text-text placeholder:text-muted hover:border-primary/45',
          )}
        />
        <ChevronDown size={16} className={cn('pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-transform', heroStyle ? 'text-slate-500' : 'text-muted', open && 'rotate-180')} />
        {open && (
          <div className={cn('absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-xl border shadow-[0_18px_42px_-18px_rgba(8,30,22,.38)]', heroStyle ? 'border-slate-200 bg-white' : 'border-border bg-surface')}>
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
                  !value && !query ? 'bg-primary text-on-primary hover:bg-primary' : heroStyle ? 'text-slate-900' : 'text-text',
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
                    'flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm font-semibold transition-colors hover:bg-primary/10',
                    heroStyle ? 'text-slate-900' : 'text-text',
                    value === city.value && 'bg-primary text-on-primary hover:bg-primary',
                  )}
                >
                  {city.label}
                </button>
              ))}
              {!filtered.length && (
                <div className={cn('px-3 py-3 text-sm font-medium', heroStyle ? 'text-slate-500' : 'text-muted')}>Nenhuma cidade encontrada</div>
              )}
            </div>
          </div>
        )}
      </div>
    </FieldShell>
  );
}

// Busca da home: aba Comprar/Alugar + cidade/tipo/preço/quartos → navega.
export function HomeSearch({
  cities,
  types,
  variant = 'default',
}: {
  cities: Option[];
  types: Option[];
  variant?: 'default' | 'hero';
}) {
  const router = useRouter();
  const [purpose, setPurpose] = useState<PurposeValue>('venda');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [quartos, setQuartos] = useState('');
  const compact = variant === 'hero';

  const buscar = () => {
    const dest = city || cities[0]?.value || 'vitoria-da-conquista';
    const base = type ? `/${dest}/${type}s` : `/${dest}`;
    const sp = new URLSearchParams();
    if (purpose === 'troca') sp.set('troca', '1');
    else sp.set('modalidade', purpose);
    if (quartos) sp.set('quartos', quartos);
    router.push(`${base}?${sp.toString()}`);
  };

  const content = (
    <>
      <div className={compact ? 'grid gap-3' : 'flex flex-wrap items-end gap-3'}>
        <div className={compact ? '' : 'flex-[1_1_130px]'}>
          <SelectField
            label="Objetivo"
            value={purpose}
            onChange={(value) => setPurpose(value as PurposeValue)}
            placeholder="Comprar"
            options={purposeOptions}
            heroStyle={compact}
          />
        </div>
        <div className={compact ? '' : 'flex-[2_1_200px]'}>
          <CityField cities={cities} value={city} onChange={setCity} heroStyle={compact} />
        </div>
        <div className={compact ? '' : 'flex-[1_1_150px]'}>
          <SelectField
            label="Tipo de imóvel"
            value={type}
            onChange={setType}
            placeholder="Todos os tipos"
            options={[{ value: '', label: 'Todos os tipos' }, ...types]}
            heroStyle={compact}
          />
        </div>
        <div className={compact ? '' : 'flex-[1_1_120px]'}>
          <SelectField label="Quartos" value={quartos} onChange={setQuartos} placeholder="Indiferente" options={quartosOpts} heroStyle={compact} />
        </div>
        <button
          type="button"
          onClick={buscar}
          className={cn(
            'flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[15px] font-bold text-on-primary shadow-[0_10px_22px_-10px_rgba(14,165,233,.45)] transition-colors hover:bg-primary-hover',
            compact ? 'w-full' : 'flex-[1_1_150px]',
          )}
        >
          <Search size={17} /> Buscar imóveis
        </button>
      </div>
    </>
  );

  if (compact) return content;

  return (
    <div className="rounded-[20px] border border-[#eceeec] bg-surface p-4 shadow-[0_26px_60px_-28px_rgba(8,30,22,.4)] sm:p-5">
      {content}
    </div>
  );
}
