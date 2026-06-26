'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { priceLabel } from '@/lib/format';
import { ContactCard, negoLabel, type Neg } from './ContactCard';

// Barra de ação fixa no rodapé (mobile) + modal com preço/contato/lead.
export function MobileContactBar(props: {
  negotiations: Neg[];
  anunciante?: string;
  wa?: string | null;
  phone?: string | null;
  slug: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const primary = props.negotiations[0];

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-surface px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="min-w-0">
          {primary && (
            <>
              <p className="text-[11px] text-muted">{negoLabel[primary.negotiation] ?? primary.negotiation}</p>
              <p className="truncate text-lg font-bold tabular-nums">
                {priceLabel({ price: primary.price, priceVisibility: primary.price_visibility, negotiation: primary.negotiation })}
              </p>
            </>
          )}
        </div>
        <button onClick={() => setOpen(true)} className="h-12 shrink-0 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm">
          Falar com anunciante
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-bg px-4 pb-5 pt-3" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
            <div className="mb-4 flex items-center justify-between">
              <p className="text-lg font-semibold">Contato</p>
              <button onClick={() => setOpen(false)} aria-label="Fechar" className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface hover:bg-bg">
                <X size={20} />
              </button>
            </div>
            <ContactCard {...props} />
          </div>
        </div>
      )}
    </>
  );
}
