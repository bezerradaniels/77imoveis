import { priceLabel } from '@/lib/format';
import { ContactActions } from './ContactActions';
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
    <div className="space-y-5 rounded-xl border border-border bg-surface p-5 shadow-[0_12px_34px_rgba(0,0,0,0.10)]">
      <div className="space-y-3">
        {negotiations.map((n) => (
          <div key={n.negotiation} className="flex items-start justify-between gap-4">
            <span className="pt-1 text-sm font-medium text-muted">{negoLabel[n.negotiation] ?? n.negotiation}</span>
            <span className="text-right text-xl font-bold tabular-nums">
              {priceLabel({ price: n.price, priceVisibility: n.price_visibility, negotiation: n.negotiation })}
            </span>
          </div>
        ))}
      </div>

      {anunciante && (
        <p className="rounded-lg bg-bg px-3 py-2.5 text-sm text-muted">
          Anunciante: <b className="text-text">{anunciante}</b>
        </p>
      )}

      <div className="space-y-2.5">
        <ContactActions wa={wa} phone={phone} slug={slug} />
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-3 text-sm font-semibold">Enviar mensagem ao anunciante</p>
        <LeadForm slug={slug} title={title} />
      </div>
    </div>
  );
}
