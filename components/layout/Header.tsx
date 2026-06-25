import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { AuthNav } from './AuthNav';

// Cabeçalho do site. Os links ficam no array `nav` abaixo (fácil de editar).
const nav = [
  { label: 'Comprar', href: '/vitoria-da-conquista/casas' },
  { label: 'Alugar', href: '/vitoria-da-conquista/casas?modalidade=aluguel' },
  { label: 'Profissionais', href: '/profissionais' },
  { label: 'Anunciar', href: '/anunciar' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          77<span className="text-primary">Imóveis</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-text">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
