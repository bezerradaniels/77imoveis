import Link from 'next/link';

const cidades = [
  ['Vitória da Conquista', 'vitoria-da-conquista'],
  ['Barreiras', 'barreiras'],
  ['Luís Eduardo Magalhães', 'luis-eduardo-magalhaes'],
  ['Guanambi', 'guanambi'],
  ['Brumado', 'brumado'],
];

const tipos = [
  ['Casas', '/imoveis/casa'],
  ['Apartamentos', '/imoveis/apartamento'],
  ['Terrenos e lotes', '/imoveis/terreno'],
  ['Imóveis comerciais', '/imoveis/sala-comercial'],
  ['Lançamentos', '/imoveis/lancamento'],
];

const profissionais = [
  ['Imobiliárias', '/profissionais/imobiliaria'],
  ['Construtoras', '/profissionais/construtora'],
  ['Corretores autônomos', '/profissionais/corretor_autonomo'],
];

const institucional = [
  ['Anunciar grátis', '/anunciar'],
  ['Planos e preços', '/planos-e-precos'],
  ['Contato', '/contato'],
  ['Privacidade', '/privacidade'],
  ['Termos de uso', '/termos'],
];

function Col({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="mb-3.5 text-sm font-medium text-text">{title}</p>
      <div className="flex flex-col gap-2.5 text-sm">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="inline-flex min-h-11 items-center font-medium text-muted transition-colors hover:text-link-hover"
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
    <footer className="border-t border-border bg-[#f8f9fa] text-text">
      <div className="mx-auto grid max-w-[1200px] gap-9 px-6 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="text-[22px] font-extrabold tracking-tight">
            <span className="text-link">77</span><span className="text-text">imóveis</span>
          </div>
          <p className="mt-3.5 max-w-[300px] text-sm font-medium leading-relaxed text-muted">
            O portal imobiliário do Oeste da Bahia. Imóveis, profissionais e empresas perto de você.
          </p>
        </div>
        <Col title="Cidades" links={[...cidades.map(([n, s]) => [n, `/${s}`]), ['Ver todas →', '/']]} />
        <Col title="Tipos de imóvel" links={tipos} />
        <Col title="Profissionais" links={profissionais} />
        <Col title="Institucional" links={institucional} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-4 text-center text-[13px] font-medium text-muted">
          © {new Date().getFullYear()} 77imóveis · Oeste da Bahia
        </div>
      </div>
    </footer>
  );
}
