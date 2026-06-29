'use client';
import { MessageCircle, Phone } from 'lucide-react';
import { trackContactClick } from '@/lib/leads';

function track(slug: string, channel: 'whatsapp' | 'telefone' | 'ligacao', contactValue?: string | null) {
  void trackContactClick({ slug, channel, contactValue });
}

// Ações de contato do imóvel: WhatsApp e/ou telefone, conforme escolha do anunciante.
// Os cliques são registrados como leads leves, sem bloquear a navegação.
export function ContactActions({
  wa,
  phone,
  slug,
}: {
  wa?: string | null;
  phone?: string | null;
  slug: string;
}) {
  return (
    <div className="space-y-2.5">
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track(slug, 'whatsapp', phone)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1FA855] px-4 text-[15px] font-bold text-on-primary transition hover:opacity-90"
        >
          <MessageCircle size={20} /> Conversar no WhatsApp
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone.replace(/\D/g, '')}`}
          onClick={() => track(slug, 'telefone', phone)}
          aria-label={`Ligar para ${phone}`}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border px-4 text-[15px] font-bold text-text transition hover:bg-subtle"
        >
          <Phone size={18} /> Telefone
        </a>
      )}
    </div>
  );
}
