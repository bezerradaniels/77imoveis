'use client';
import { MessageCircle } from 'lucide-react';
import { trackContactClick } from '@/lib/leads';

function track(slug: string, channel: 'whatsapp' | 'telefone' | 'ligacao', contactValue?: string | null) {
  void trackContactClick({ slug, channel, contactValue });
}

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
    <>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track(slug, 'whatsapp', phone)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1FA855] px-4 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <MessageCircle size={18} /> Conversar no WhatsApp
        </a>
      )}
      {phone && (
        <a
          href={`tel:${phone.replace(/\D/g, '')}`}
          onClick={() => track(slug, 'telefone', phone)}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-border px-4 text-center text-sm font-medium transition hover:bg-bg"
        >
          Ligar: {phone}
        </a>
      )}
    </>
  );
}
