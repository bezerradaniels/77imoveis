import { MessageCircle } from 'lucide-react';
import { priceLabel } from '@/lib/format';
import { LeadForm } from './LeadForm';

export const negoLabel: Record<string, string> = {
  venda: 'Venda',
  aluguel: 'Aluguel',
  temporada: 'Temporada',
  romaria: 'Romaria',
  lancamento: 'Lançamento',
};

export type Neg = { negotiation: string; price: number | null; price_visibility: 'publico' | 'sob_consulta' };

// Conteúdo de preço + contato + lead. Usado na sidebar (desktop) e no modal (mobile).
export function ContactCard({
  negotiations,
  anunciante,
  wa,
  phone,
  slug,
  title,
}: {
  negotiations: Neg[];
  anunciante?: string;
  wa?: string | null;
  phone?: string | null;
  slug: string;
  title: string;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-surface p-5">
      <div className="space-y-1">
        {negotiations.map((n) => (
          <div key={n.negotiation} className="flex items-baseline justify-between gap-2">
            <span className="text-sm text-muted">{negoLabel[n.negotiation] ?? n.negotiation}</span>
            <span className="text-lg font-bold tabular-nums">
              {priceLabel({ price: n.price, priceVisibility: n.price_visibility, negotiation: n.negotiation })}
            </span>
          </div>
        ))}
      </div>

      {anunciante && (
        <p className="text-sm text-muted">
          Anunciante: <b className="text-text">{anunciante}</b>
        </p>
      )}

      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1FA855] font-semibold text-white hover:opacity-90">
          <MessageCircle size={18} /> Conversar no WhatsApp
        </a>
      )}
      {phone && (
        <a href={`tel:${phone.replace(/\D/g, '')}`} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border font-medium hover:bg-bg">
          Ligar: {phone}
        </a>
      )}

      <div className="border-t border-border pt-4">
        <p className="mb-2 text-sm font-medium">Enviar mensagem ao anunciante</p>
        <LeadForm slug={slug} title={title} />
      </div>
    </div>
  );
}
