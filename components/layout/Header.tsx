import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { AuthNav } from './AuthNav';
import { MobileMenu } from './MobileMenu';

const menu = [
  { href: '/imoveis/venda', label: 'Venda' },
  { href: '/imoveis/aluguel', label: 'Aluguel' },
  { href: '/planos-e-precos', label: 'Planos' },
];

// Cabeçalho do site (handoff): logo, "Anuncie", tema e entrar.
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-[var(--header-bg)]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-2xl font-extrabold tracking-tight"
          >
            <span className="text-link">77</span>
            <span className="text-text">imóveis</span>
          </Link>
          <div className="hidden items-center gap-5 md:flex">
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center text-sm font-bold text-text/75 transition-colors hover:text-link-hover"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <nav className="flex items-center">
          <div className="hidden items-center gap-3 sm:gap-4 md:flex">
            <Link
              href="/anunciar"
              className="inline-flex min-h-11 items-center rounded-[10px] bg-primary px-3 py-2 text-sm font-bold text-on-primary shadow-[0_10px_22px_-14px_rgba(14,165,233,.45)] transition-colors hover:bg-primary-hover"
            >
              Anunciar imóvel
            </Link>
            <AuthNav />
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {menu.slice(0, 2).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-[10px] px-2 text-sm font-bold text-text/80"
              >
                {item.label}
              </Link>
            ))}
            <MobileMenu />
          </div>
        </nav>
      </div>
    </header>
  );
}
