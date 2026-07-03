'use client';
import { useEffect, useState } from 'react';
import { hasAuthCookie } from '@/lib/has-auth-cookie';

// Heading do hero. Por padrão mostra o título/subtítulo de SEO (renderizado no
// servidor). Para quem está logado, troca pela saudação personalizada, usando
// exatamente o mesmo estilo do hero. A troca acontece no cliente, mantendo a
// home estática e indexável.
export function HomeGreeting() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!hasAuthCookie()) return;
    let alive = true;
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.firstName) setName(d.firstName);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const displayName = name ? name.charAt(0).toUpperCase() + name.slice(1) : null;
  const subtitle = name
    ? 'Que bom te ver por aqui! Vamos achar o imóvel perfeito pra você?'
    : 'Busque casas, apartamentos, terrenos e imóveis comerciais nas principais cidades da região.';

  return (
    <>
      <h1 className="mx-auto max-w-[430px] text-center text-[22px] font-extrabold leading-[1.12] tracking-tight text-text sm:text-[24px] md:max-w-[620px] md:text-[30px]">
        {displayName ? (
          `Olá, ${displayName} 👋`
        ) : (
          <>
            <span className="block">Encontre o imóvel ideal no</span>
            <span className="block bg-gradient-to-r from-primary to-[#0891b2] bg-clip-text text-transparent">
              Oeste da Bahia
            </span>
          </>
        )}
      </h1>
      <p className="mx-auto mb-0 mt-2 max-w-[360px] text-center text-[14px] leading-relaxed text-muted md:max-w-[580px] md:text-[15.5px]">
        {subtitle}
      </p>
    </>
  );
}
