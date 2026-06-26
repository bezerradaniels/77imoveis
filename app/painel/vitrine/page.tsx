import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import { getMyStorefront, getSiteSetting } from '@/lib/data';
import { StorefrontForm } from '@/components/painel/StorefrontForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Vitrine', robots: { index: false } };

const DEFAULT_PRECOS = [
  { dias: 30, preco: 49.9, label: '30 dias' },
  { dias: 90, preco: 119.9, label: '90 dias' },
  { dias: 365, preco: 399.9, label: '1 ano' },
];

export default async function VitrinePage() {
  const [{ company, storefront }, precos] = await Promise.all([
    getMyStorefront(),
    getSiteSetting('vitrine_precos'),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/painel" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Painel
      </Link>
      <h1 className="mb-1 text-2xl font-bold">Vitrine</h1>
      <p className="mb-6 text-sm text-muted">Sua página própria com sua marca, reunindo todos os seus imóveis.</p>

      {company ? (
        <StorefrontForm storefront={storefront} precos={(precos as any) ?? DEFAULT_PRECOS} />
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Building2 className="mx-auto mb-2 text-muted" />
          <p className="text-muted">A vitrine é um recurso para empresas.</p>
          <Link href="/painel/empresa" className="mt-4 inline-block rounded-full bg-primary px-4 py-2 font-semibold text-white">
            Criar minha empresa
          </Link>
        </div>
      )}
    </main>
  );
}
