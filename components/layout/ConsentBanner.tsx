'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

// Aviso de cookies/privacidade (LGPD). Guarda o consentimento no navegador.
export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('lgpd-consent')) setShow(true);
    } catch {}
  }, []);

  const respond = (value: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem('lgpd-consent', value);
      window.dispatchEvent(new Event('lgpd-consent'));
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-50 px-4 pb-4 md:bottom-0">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-lg sm:flex-row sm:items-center">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg">
          <Cookie className="h-5 w-5 text-link" />
        </span>
        <div className="flex-1 text-sm">
          <p className="mb-1 font-semibold text-text">Cookies no 77Imóveis</p>
          <p className="text-muted">
            Usamos cookies essenciais para manter o site funcionando e, com sua permissão, cookies de
            análise para melhorar a experiência. Você pode aceitar ou recusar os cookies não essenciais.{' '}
            <Link href="/privacidade" className="font-semibold text-text underline">
              Saiba mais.
            </Link>
          </p>
        </div>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
          <button
            onClick={() => respond('rejected')}
            className="min-h-11 flex-1 rounded-full border border-border px-4 py-2 font-medium text-text sm:flex-none"
          >
            Recusar
          </button>
          <button
            onClick={() => respond('accepted')}
            className="min-h-11 flex-1 rounded-full bg-primary px-4 py-2 font-medium text-on-primary sm:flex-none"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
