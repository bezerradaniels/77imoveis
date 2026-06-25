import Link from 'next/link';

const cidades = [
  ['Vitória da Conquista', 'vitoria-da-conquista'],
  ['Barreiras', 'barreiras'],
  ['Guanambi', 'guanambi'],
  ['Brumado', 'brumado'],
  ['Bom Jesus da Lapa', 'bom-jesus-da-lapa'],
  ['Santa Maria da Vitória', 'santa-maria-da-vitoria'],
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-bold">
            77<span className="text-primary">Imóveis</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            O portal imobiliário da região do DDD 77, na Bahia.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-medium">Cidades</p>
          <ul className="space-y-1.5 text-sm text-muted">
            {cidades.map(([nome, slug]) => (
              <li key={slug}>
                <Link href={`/${slug}`} className="hover:text-text">
                  Imóveis em {nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-medium">Institucional</p>
          <ul className="space-y-1.5 text-sm text-muted">
            <li><Link href="/anunciar" className="hover:text-text">Anuncie grátis</Link></li>
            <li><Link href="/profissionais" className="hover:text-text">Profissionais</Link></li>
            <li><Link href="/contato" className="hover:text-text">Contato</Link></li>
            <li><Link href="/privacidade" className="hover:text-text">Privacidade</Link></li>
            <li><Link href="/termos" className="hover:text-text">Termos de uso</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} 77Imóveis · DDD 77 — Bahia
      </div>
    </footer>
  );
}
