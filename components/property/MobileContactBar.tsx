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
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-surface px-4 py-2.5 lg:hidden">
        <div className="min-w-0">
          {primary && (
            <>
              <p className="text-[11px] text-muted">{negoLabel[primary.negotiation] ?? primary.negotiation}</p>
              <p className="truncate text-base font-bold tabular-nums">
                {priceLabel({ price: primary.price, priceVisibility: primary.price_visibility, negotiation: primary.negotiation })}
              </p>
            </>
          )}
        </div>
        <button onClick={() => setOpen(true)} className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">
          Falar com anunciante
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-bg p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Contato</p>
              <button onClick={() => setOpen(false)} aria-label="Fechar" className="rounded-md p-1 hover:bg-surface">
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
