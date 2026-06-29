import { Banknote, Landmark, Repeat2, Home } from 'lucide-react';

type Item = { Icon: typeof Banknote; title: string; sub: string };

// Formas de negociação aceitas — ajuda o usuário a entender a flexibilidade de
// compra rapidamente. Dirigido por campos REAIS do banco:
//   • À vista      → implícito em venda/lançamento
//   • Financiamento → properties.accepts_financing
//   • Minha Casa Minha Vida → properties.accepts_mcmv
//   • Permuta      → properties.accepts_exchange
export function NegotiationCard({
  negotiation,
  acceptsFinancing,
  acceptsExchange,
  acceptsMcmv,
}: {
  negotiation: string;
  acceptsFinancing?: boolean;
  acceptsExchange?: boolean;
  acceptsMcmv?: boolean;
}) {
  const isSale = negotiation === 'venda' || negotiation === 'lancamento';
  const items = [
    isSale && { Icon: Banknote, title: 'À vista', sub: 'Pagamento direto' },
    isSale && acceptsFinancing && { Icon: Landmark, title: 'Financiamento', sub: 'Bancário' },
    acceptsMcmv && { Icon: Home, title: 'Minha Casa Minha Vida', sub: 'Programa habitacional' },
    acceptsExchange && { Icon: Repeat2, title: 'Permuta', sub: 'Aceita troca' },
  ].filter(Boolean) as Item[];

  if (!items.length) return null;

  return (
    <section className="rounded-2xl border border-border p-6">
      <h2 className="text-lg font-bold">Formas de negociação aceitas</h2>
      <p className="mb-4 mt-1 text-sm text-muted">Flexibilidade de pagamento informada pelo anunciante.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it, k) => (
          <div
            key={k}
            className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/[0.04] p-4"
          >
            <it.Icon size={20} className="shrink-0 text-link" />
            <div>
              <div className="text-sm font-semibold">{it.title}</div>
              <div className="text-xs text-muted">{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
