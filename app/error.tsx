'use client';
import Link from 'next/link';
import { RefreshCcw } from 'lucide-react';

// Tela de erro inesperado (runtime). O usuário pode tentar de novo sem perder o contexto.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex max-w-[720px] flex-col items-center px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10">
        <RefreshCcw size={28} className="text-danger" aria-hidden />
      </span>
      <h1 className="mt-6 text-2xl font-bold sm:text-3xl">Algo deu errado</h1>
      <p className="mt-3 max-w-[480px] text-[15px] leading-relaxed text-muted">
        Tivemos um problema para carregar esta página. Tente novamente — se continuar, volte em alguns minutos.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-colors hover:bg-primary-hover"
        >
          <RefreshCcw size={16} aria-hidden /> Tentar novamente
        </button>
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
