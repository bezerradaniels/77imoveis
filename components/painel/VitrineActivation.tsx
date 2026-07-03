'use client';
import Link from 'next/link';
import { Store, ExternalLink, Settings2 } from 'lucide-react';
import { money } from '@/lib/pricing';
import { startStorefrontCheckout } from '@/app/painel/vitrine/actions';

type Preco = { dias: number; preco: number; label: string };

const fmt = (s?: string | null) => (s ? new Date(s).toLocaleDateString('pt-BR') : '');

export function VitrineActivation({ storefront, precos }: { storefront: any; precos: Preco[] }) {
  const active = storefront?.status === 'ativo';

  // Sem vitrine configurada: precisa de slug/aparência antes de pagar.
  if (!storefront) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-6 text-center">
        <Store className="mx-auto mb-2 text-muted" size={22} />
        <p className="text-sm text-muted">Configure a aparência da sua vitrine antes de ativá-la.</p>
        <Link href="/painel/vitrine" className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary">
          <Settings2 size={15} /> Configurar vitrine
        </Link>
      </div>
    );
  }

  if (active) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/40 bg-success/10 p-5">
        <p className="text-sm">
          <b className="text-success">Vitrine ativa</b>
          {storefront.expires_at && <> · válida até {fmt(storefront.expires_at)}</>}
        </p>
        <div className="flex gap-3">
          <Link href="/painel/vitrine" className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-text">
            <Settings2 size={14} /> Editar
          </Link>
          {storefront.slug && (
            <a href={`/vitrine/${storefront.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-link">
              Ver vitrine <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">Ative sua vitrine escolhendo um período:</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {precos.map((p) => (
          <form key={p.dias} action={startStorefrontCheckout} className="rounded-lg border border-border p-4 text-center">
            <input type="hidden" name="days" value={p.dias} />
            <p className="text-sm font-bold">{p.label}</p>
            <p className="mt-1 text-xl font-extrabold">{money(Number(p.preco))}</p>
            <button className="mt-3 h-9 w-full rounded-full bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover">
              Ativar
            </button>
          </form>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">
        A aparência é editada em <Link href="/painel/vitrine" className="font-semibold text-link">Minha vitrine</Link>.
      </p>
    </div>
  );
}
