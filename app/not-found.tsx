import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchX } from 'lucide-react';

export const metadata: Metadata = { title: 'Página não encontrada', robots: { index: false } };

// 404 do site inteiro (imóvel desativado, cidade inexistente, link quebrado).
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-[720px] flex-col items-center px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <SearchX size={30} className="text-primary" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-bold sm:text-3xl">Página não encontrada</h1>
      <p className="mt-3 max-w-[480px] text-[15px] leading-relaxed text-muted">
        O endereço pode estar errado, ou o anúncio que você procura já foi vendido, alugado ou removido pelo anunciante.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/imoveis"
          className="inline-flex min-h-11 items-center rounded-[10px] bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover"
        >
          Ver imóveis disponíveis
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-[10px] border border-border bg-surface px-4 py-2 text-sm font-bold text-text transition-colors hover:bg-bg"
        >
          Ir para a página inicial
        </Link>
      </div>
    </main>
  );
}
