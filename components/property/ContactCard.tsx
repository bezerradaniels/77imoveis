import { priceLabel } from '@/lib/format';
import { BadgeCheck, Lock } from 'lucide-react';
import { ContactActions } from './ContactActions';
import { LeadForm } from './LeadForm';

export const negoLabel: Record<string, string> = {
  venda: 'Venda',
  aluguel: 'Aluguel',
  temporada: 'Temporada',
  romaria: 'Romaria',
  lancamento: 'Lançamento',
};

export type Neg = {
  negotiation: string;
  price: number | null;
  price_visibility: 'publico' | 'sob_consulta';
};

export type ContactCardProps = {
  negotiations: Neg[];
  anunciante?: string;
  advertiserLogo?: string | null;
  acceptsFinancing?: boolean;
  acceptsExchange?: boolean;
  wa?: string | null;
  waVisit?: string | null;
  phone?: string | null;
  slug: string;
  title: string;
};

// Card de conversão (âncora de CRO): preço + selos + identidade do anunciante +
// CTAs (WhatsApp/visita/ligar) + formulário de lead. Usado na sidebar fixa
// (desktop) e dentro do bottom sheet (mobile).
export function ContactCard({
  negotiations,
  anunciante,
  advertiserLogo,
  acceptsFinancing,
  acceptsExchange,
  wa,
  waVisit,
  phone,
  slug,
  title,
}: ContactCardProps) {
  const initials = (anunciante ?? 'A')
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const chips = [acceptsFinancing && 'Aceita financiamento', acceptsExchange && 'Aceita permuta'].filter(
    Boolean,
  ) as string[];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_18px_44px_-22px_rgba(15,40,30,0.4)]">
      {/* Preço(s) */}
      <div className="p-5 pb-4">
        {negotiations.map((nn, k) => (
          <div key={nn.negotiation} className={k ? 'mt-2.5' : ''}>
            <div className="text-xs font-medium text-muted">{negoLabel[nn.negotiation] ?? nn.negotiation}</div>
            <div className="text-[30px] font-extrabold leading-none tracking-tight tabular-nums">
              {priceLabel({ price: nn.price, priceVisibility: nn.price_visibility, negotiation: nn.negotiation })}
            </div>
          </div>
        ))}
        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {chips.map((c) => (
              <span key={c} className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Identidade do anunciante (confiança) */}
      {anunciante && (
        <div className="flex items-center gap-3 border-y border-border bg-bg px-5 py-4">
          {advertiserLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={advertiserLogo} alt={anunciante} className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-sm font-bold text-white">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <span className="truncate">{anunciante}</span>
              <BadgeCheck size={15} className="shrink-0 text-primary" />
            </div>
            <div className="text-xs text-muted">Anunciante no 77Imóveis</div>
          </div>
        </div>
      )}

      {/* CTAs + formulário */}
      <div className="space-y-4 p-5">
        <ContactActions wa={wa} waVisit={waVisit} phone={phone} slug={slug} />
        <div className="border-t border-border pt-4">
          <p className="mb-3 text-sm font-semibold">Solicitar mais informações</p>
          <LeadForm slug={slug} title={title} />
        </div>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <Lock size={12} /> Seus dados são protegidos e não ficam públicos.
        </p>
      </div>
    </div>
  );
}
