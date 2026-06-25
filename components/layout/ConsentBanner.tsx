'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// Aviso de cookies/privacidade (LGPD). Guarda o consentimento no navegador.
export function ConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem('lgpd-consent')) setShow(true);
    } catch {}
  }, []);

  const accept = () => {
    try {
      localStorage.setItem('lgpd-consent', '1');
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-3 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted">
          Usamos cookies para melhorar sua experiência e entender o uso do site. Ao continuar, você concorda com a nossa{' '}
          <Link href="/privacidade" className="text-primary underline">Política de Privacidade</Link>.
        </p>
        <button onClick={accept} className="shrink-0 rounded-lg bg-primary px-4 py-2 font-medium text-white">
          Entendi
        </button>
      </div>
    </div>
  );
}
