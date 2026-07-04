'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';

type Option = { value: string; label: string };

function FieldDropdown({
  label,
  value,
  options,
  onSelect,
  className,
}: {
  label: string;
  value: string;
  options: Option[];
  onSelect: (value: string) => void;
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
    <div ref={ref} className={cn('relative min-w-0', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="block h-11 w-full rounded-lg border border-border bg-surface px-3 text-left transition hover:border-primary/50 hover:bg-bg sm:h-12"
      >
        <span className="block text-[10px] font-semibold leading-3 text-muted">{label}</span>
        <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[13px] leading-4 text-text sm:text-sm">
          <span className="truncate">{value}</span>
          <ChevronDown size={14} className={cn('ml-auto shrink-0 text-muted transition', open && 'rotate-180')} />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-64 overflow-auto rounded-lg border border-border bg-surface py-1 shadow-xl shadow-black/10">
          {options.map((option) => (
            <button
              key={option.value || 'all'}
              type="button"
              onClick={() => {
                onSelect(option.value);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-text transition hover:bg-bg"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Barra de busca compacta (sem foto de fundo): Localização, Bairro e Tipo.
// Modalidade fica só nos Filtros (evita duplicar a mesma escolha duas vezes
// na tela). Fica acima dos resultados — visível antes do scroll no mobile.
export function CityHeroSearchPanel({
  city,
  path,
  cities,
  types,
  neighborhoods,
  currentTypeSlug,
}: {
  city: { name: string; slug: string };
  path: string;
  cities: Option[];
  types: Option[];
  neighborhoods: Option[];
  currentTypeSlug?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const typeLabel = types.find((t) => t.value === currentTypeSlug)?.label ?? 'Todos os tipos';
  const bairroSlug = params.get('bairro') ?? '';
  const bairroLabel = neighborhoods.find((n) => n.value === bairroSlug)?.label ?? 'Todos os bairros';

  const setBairro = (slug: string) => {
    const next = new URLSearchParams(params.toString());
    slug ? next.set('bairro', slug) : next.delete('bairro');
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="grid gap-2 sm:grid-cols-[1.1fr_1fr_1fr_auto] sm:gap-2.5">
      <FieldDropdown
        label="Localização"
        value={`${city.name}, BA`}
        options={cities}
        onSelect={(slug) => router.push(`/${slug}`)}
      />
      <FieldDropdown
        label="Bairro"
        value={bairroLabel}
        options={[{ value: '', label: 'Todos os bairros' }, ...neighborhoods]}
        onSelect={setBairro}
      />
      <FieldDropdown
        label="Tipo"
        value={typeLabel}
        options={[{ value: '', label: 'Todos os tipos' }, ...types]}
        onSelect={(slug) => router.push(slug ? `/${city.slug}/${slug}s` : `/${city.slug}`)}
      />
      <button
        type="button"
        onClick={() => router.push(path)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-action px-4 text-sm font-semibold text-on-action transition hover:bg-action-hover sm:h-12"
      >
        <Search size={17} />
        <span className="sm:hidden">Buscar</span>
      </button>
    </div>
  );
}
