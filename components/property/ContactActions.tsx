'use client';
import { MessageCircle, Phone } from 'lucide-react';
import { trackContactClick } from '@/lib/leads';
import { ANALYTICS_EVENTS, trackButtonClick, trackConversion, trackEvent } from '@/lib/analytics';

function track(slug: string, channel: 'whatsapp' | 'telefone' | 'ligacao', contactValue?: string | null) {
  void trackContactClick({ slug, channel, contactValue });
  trackEvent(ANALYTICS_EVENTS.contactAttempt, {
    channel,
    property_slug: slug,
    source_component: 'property_contact_actions',
  });
  if (channel === 'whatsapp') {
    trackConversion(ANALYTICS_EVENTS.contactWhatsappClick, {
      channel,
      property_slug: slug,
      source_component: 'property_contact_actions',
    });
    trackButtonClick({
      button_id: 'property_detail_whatsapp_button',
      button_text: 'Conversar no WhatsApp',
      button_location: 'property_contact_card',
    });
  }
  if (channel === 'telefone') {
    trackConversion(ANALYTICS_EVENTS.phoneClick, {
      channel,
      property_slug: slug,
      source_component: 'property_contact_actions',
    });
    trackButtonClick({
      button_id: 'property_detail_phone_button',
      button_text: 'Telefone',
      button_location: 'property_contact_card',
    });
  }
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
