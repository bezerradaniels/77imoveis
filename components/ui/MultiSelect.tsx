'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { Option } from '@/components/ui/Dropdown';
import { cn } from '@/lib/cn';

// Dropdown de múltipla escolha (checkboxes). O botão resume a seleção;
// o painel lista as opções com indicador de marcado. Usado no hero
// (objetivo, tipo, quartos) e reutilizável em outros formulários.
export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Qualquer',
  className,
}: {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  const labels = options.filter((o) => selected.includes(o.value)).map((o) => o.label);
  const summary = labels.length === 0 ? placeholder : labels.length <= 2 ? labels.join(', ') : `${labels.length} selecionados`;

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 text-left text-sm font-medium outline-none transition-all hover:border-primary/45 focus:border-primary focus:ring-4 focus:ring-primary/10"
      >
        <span className={cn('truncate', labels.length ? 'text-text' : 'text-muted')}>{summary}</span>
        <ChevronDown size={16} className={cn('shrink-0 text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_18px_42px_-18px_rgba(8,30,22,.38)]">
          <div className="max-h-60 overflow-auto p-1.5">
            {options.map((o) => {
              const on = selected.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => toggle(o.value)}
                  className={cn(
                    'flex min-h-10 w-full items-center justify-between gap-2 rounded-lg px-3 text-left text-sm font-semibold transition-colors hover:bg-primary/10',
                    on ? 'text-link' : 'text-text',
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  <span
                    aria-hidden
                    className={cn(
                      'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] border transition-colors',
                      on ? 'border-primary bg-primary text-on-primary' : 'border-border',
                    )}
                  >
                    {on && <Check size={13} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
