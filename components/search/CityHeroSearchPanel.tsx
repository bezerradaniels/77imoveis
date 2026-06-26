'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

type Option = { value: string; label: string };

const negotiationOptions = [
  { value: '', label: 'Comprar ou alugar' },
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
  { value: 'temporada', label: 'Temporada' },
  { value: 'romaria', label: 'Romaria' },
  { value: 'lancamento', label: 'Lançamento' },
];

function FieldDropdown({
  label,
  value,
  options,
  onSelect,
  icon,
  className,
}: {
  label: string;
  value: string;
  options: Option[];
  onSelect: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="block w-full rounded-xl border border-border bg-surface px-4 py-3 text-left transition hover:border-primary/50 hover:bg-bg"
      >
        <span className="block text-[12px] font-semibold leading-4 text-text">{label}</span>
        <span className="mt-1 flex min-w-0 items-center gap-2 text-[14px] leading-5 text-muted">
          {icon}
          <span className="truncate">{value}</span>
          <ChevronDown size={15} className={cn('ml-auto shrink-0 transition', open && 'rotate-180')} />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-auto rounded-xl border border-border bg-surface py-1 shadow-xl shadow-black/10">
          {options.map((option) => (
            <button
              key={option.value || 'all'}
              type="button"
              onClick={() => {
                onSelect(option.value);
                setOpen(false);
              }}
              className="block w-full px-4 py-2.5 text-left text-[14px] text-text transition hover:bg-bg"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CityHeroSearchPanel({
  city,
  total,
  h1,
  path,
  cities,
  types,
  currentTypeSlug,
  currentNegotiation,
}: {
  city: { name: string; slug: string };
  total: number;
  h1: string;
  path: string;
  cities: Option[];
  types: Option[];
  currentTypeSlug?: string;
  currentNegotiation?: string;
}) {
  const router = useRouter();
  const typeLabel = types.find((t) => t.value === currentTypeSlug)?.label ?? 'Todos';
  const negotiationLabel = negotiationOptions.find((n) => n.value === currentNegotiation)?.label ?? 'Comprar ou alugar';

  const goWithNegotiation = (basePath: string, negotiation: string) => {
    router.push(negotiation ? `${basePath}?modalidade=${negotiation}` : basePath);
  };

  return (
    <section className="relative z-10 w-full bg-bg md:rounded-[22px] md:bg-surface md:p-8 md:shadow-2xl md:shadow-black/10 lg:max-w-[460px]">
      <h1 className="text-[26px] font-bold leading-[1.08] text-text">{h1}</h1>
      <p className="mt-2 text-sm text-muted">
        {total ? `${total} opções ativas para comparar em ${city.name}.` : `Confira novas oportunidades em ${city.name} assim que forem publicadas.`}
      </p>

      <div className="mt-6 space-y-3">
        <FieldDropdown
          label="Localização"
          value={`${city.name}, Bahia`}
          options={cities}
          onSelect={(slug) => router.push(`/${slug}`)}
        />

        <div className="grid grid-cols-2 gap-3">
          <FieldDropdown
            label="Tipo"
            value={typeLabel}
            options={[{ value: '', label: 'Todos' }, ...types]}
            onSelect={(slug) => goWithNegotiation(slug ? `/${city.slug}/${slug}s` : `/${city.slug}`, currentNegotiation ?? '')}
          />
          <FieldDropdown
            label="Modalidade"
            value={negotiationLabel}
            options={negotiationOptions}
            onSelect={(negotiation) => goWithNegotiation(path, negotiation)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push(path)}
        className="mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-primary px-4 text-base font-semibold text-white transition hover:bg-primary-hover"
      >
        <Search size={21} />
        Ver imóveis
      </button>
    </section>
  );
}
