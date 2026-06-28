'use client';
import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { priceLabel } from '@/lib/format';
import { ContactCard, negoLabel, type ContactCardProps } from './ContactCard';

// Mobile: CTA flutuante (barra inferior + FAB do WhatsApp) que abre um bottom
// sheet com preço, anunciante, contato e formulário. Reduz a fricção de contato
// e mantém a conversão sempre ao alcance do polegar. Some no desktop (lg).
export function MobileContactBar(props: ContactCardProps) {
  const [open, setOpen] = useState(false);
  const primary = props.negotiations[0];

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* FAB do WhatsApp */}
      {props.wa && (
        <a
          href={props.wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar no WhatsApp"
          className="fixed bottom-[88px] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1FA855] text-white shadow-[0_12px_26px_-10px_rgba(31,168,85,0.8)] lg:hidden"
        >
          <MessageCircle size={26} />
        </a>
      )}

      {/* Barra inferior flutuante */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-surface px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="min-w-0">
          {primary && (
            <>
              <p className="text-[11px] text-muted">{negoLabel[primary.negotiation] ?? primary.negotiation}</p>
              <p className="truncate text-lg font-extrabold tabular-nums">
                {priceLabel({
                  price: primary.price,
                  priceVisibility: primary.price_visibility,
                  negotiation: primary.negotiation,
                })}
              </p>
            </>
          )}
        </div>
        <button
          onClick={() => setOpen(true)}
          className="h-12 shrink-0 rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-hover"
        >
          Falar com anunciante
        </button>
      </div>

      {/* Bottom sheet */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-bg px-4 pb-6 pt-3"
            style={{ animation: 'sheetUp .32s cubic-bezier(.32,.72,0,1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border" />
            <div className="mb-3 flex items-center justify-between">
              <p className="text-lg font-bold">Contato</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface transition hover:bg-bg"
              >
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
