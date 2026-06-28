'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export type Option = { value: string; label: string };

// Dropdown estilizado reutilizável (usado em formulários e filtros).
export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Selecione',
  className,
}: {
  options: Option[];
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
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

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 text-sm"
      >
        <span className={cn(selected ? 'font-medium text-slate-900 dark:text-white' : 'text-muted')}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={16} className={cn('text-muted transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-border bg-surface">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange?.(o.value);
                setOpen(false);
              }}
              className={cn(
                'block w-full px-3 py-2 text-left text-sm hover:bg-bg',
                o.value === value && 'bg-primary/10 text-primary',
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
