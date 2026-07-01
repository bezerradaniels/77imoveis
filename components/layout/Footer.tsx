import Link from 'next/link';

const cidades = [
  ['Vitória da Conquista', 'vitoria-da-conquista'],
  ['Barreiras', 'barreiras'],
  ['Luís Eduardo Magalhães', 'luis-eduardo-magalhaes'],
  ['Guanambi', 'guanambi'],
  ['Brumado', 'brumado'],
];

const tipos = [
  ['Casas', '/vitoria-da-conquista/casas'],
  ['Apartamentos', '/vitoria-da-conquista/apartamentos'],
  ['Terrenos e lotes', '/vitoria-da-conquista/terrenos'],
  ['Imóveis comerciais', '/vitoria-da-conquista/sala-comercials'],
  ['Lançamentos', '/vitoria-da-conquista?modalidade=lancamento'],
];

const profissionais = [
  ['Imobiliárias', '/profissionais/imobiliaria'],
  ['Construtoras', '/profissionais/construtora'],
  ['Corretores autônomos', '/profissionais/corretor_autonomo'],
];

const institucional = [
  ['Anunciar grátis', '/anunciar'],
  ['Contato', '/contato'],
  ['Privacidade', '/privacidade'],
  ['Termos de uso', '/termos'],
];

function Col({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="mb-3.5 text-sm font-medium text-slate-950 dark:text-white">{title}</p>
      <div className="flex flex-col gap-2.5 text-sm">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="inline-flex min-h-11 items-center font-medium text-slate-600 transition-colors hover:text-link-hover dark:text-slate-300 dark:hover:text-link-hover"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-50 to-slate-200 text-slate-700 dark:from-[#0d1512] dark:to-[#111a16] dark:text-slate-300">
      <div className="mx-auto grid max-w-[1200px] gap-9 px-6 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="text-[22px] font-extrabold tracking-tight">
            <span className="text-link">77</span><span className="text-slate-950 dark:text-white">imóveis</span>
          </div>
          <p className="mt-3.5 max-w-[300px] text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
            O portal imobiliário do Oeste da Bahia. Imóveis, profissionais e empresas perto de você.
          </p>
        </div>
        <Col title="Cidades" links={[...cidades.map(([n, s]) => [n, `/${s}`]), ['Ver todas →', '/']]} />
        <Col title="Tipos de imóvel" links={tipos} />
        <Col title="Profissionais" links={profissionais} />
        <Col title="Institucional" links={institucional} />
      </div>
      <div className="border-t border-slate-300/70 dark:border-white/10">
        <div className="mx-auto max-w-[1200px] px-6 py-4 text-center text-[13px] font-medium text-slate-500 dark:text-slate-500">
          © {new Date().getFullYear()} 77imóveis · Oeste da Bahia
        </div>
      </div>
    </footer>
  );
}
