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
  const title = displayName ? `Olá, ${displayName} 👋` : 'Encontre o imóvel ideal no Oeste da Bahia';
  const subtitle = name
    ? 'Que bom te ver por aqui! Vamos achar o imóvel perfeito pra você?'
    : 'Busque casas, apartamentos, terrenos e imóveis comerciais nas principais cidades da região.';

  return (
    <>
      <h1 className="m-0 max-w-[620px] text-[22px] font-extrabold leading-[1.12] tracking-tight text-text sm:text-[24px] md:text-[30px]">
        {title}
      </h1>
      <p className="mb-0 mt-2 max-w-[580px] text-[14px] leading-relaxed text-muted md:text-[15.5px]">
        {subtitle}
      </p>
    </>
  );
}
