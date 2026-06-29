'use client';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export type Option = { value: string; label: string };

// Campo digitável com sugestões (filtra a lista de opções pelo texto digitado).
export function Autocomplete({
  options,
  value,
  onChange,
  placeholder = 'Digite para buscar',
  disabled = false,
  className,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [query, setQuery] = useState(() => options.find((o) => o.value === value)?.label ?? '');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(options.find((o) => o.value === value)?.label ?? '');
  }, [value, options]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const filtered = query.trim() ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())) : options;

  return (
    <div ref={ref} className={cn('relative', className)}>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange('');
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm font-medium text-slate-900 disabled:cursor-not-allowed disabled:bg-bg disabled:text-muted disabled:font-normal dark:text-white"
      />
      {open && !disabled && !!filtered.length && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-lg border border-border bg-surface py-1 shadow-xl shadow-black/10">
          {filtered.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setQuery(o.label);
                setOpen(false);
              }}
              className={cn('block w-full px-3 py-2 text-left text-sm hover:bg-bg', o.value === value && 'bg-primary/10 text-link')}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
