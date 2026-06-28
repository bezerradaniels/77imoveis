import Link from 'next/link';
import { ArrowLeft, Check, Building2 } from 'lucide-react';
import { getPlans, getMyCompany } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Planos', robots: { index: false } };

const money = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });

export default async function PlanosPage() {
  const [plans, company] = await Promise.all([getPlans(), getMyCompany()]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/painel" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Painel
      </Link>
      <h1 className="mb-1 text-2xl font-bold">Planos e upgrade</h1>
      <p className="mb-6 text-sm text-muted">
        Compare limites e recursos. A integração de pagamento deve ativar o plano escolhido após confirmação do gateway.
      </p>

      {!company && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4">
          <div className="flex items-center gap-3">
            <Building2 className="text-link" />
            <p className="text-sm">Crie uma empresa para acessar os planos profissionais.</p>
          </div>
          <Link href="/painel/empresa" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary">
            Criar perfil profissional
          </Link>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p: any) => (
          <article key={p.slug} className={`rounded-xl border bg-surface p-5 ${p.highlight ? 'border-primary shadow-sm' : 'border-border'}`}>
            {p.highlight && <p className="mb-2 text-xs font-semibold uppercase text-link">Mais escolhido</p>}
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {p.max_active_listings >= 100000 ? 'Imóveis ilimitados' : `${p.max_active_listings} imóveis ativos`}
            </p>
            <p className="mt-4 text-2xl font-bold">
              {Number(p.price) === 0 ? 'Grátis' : money(Number(p.price))}
              {Number(p.price) > 0 && <span className="text-sm font-normal text-muted">/{p.interval}</span>}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {(p.benefits ?? []).map((b: string) => (
                <li key={b} className="flex gap-2">
                  <Check size={15} className="mt-0.5 shrink-0 text-success" /> {b}
                </li>
              ))}
            </ul>
            <button disabled className="mt-5 h-10 w-full rounded-full border border-border text-sm font-medium text-muted">
              Checkout em implantação
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
