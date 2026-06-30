import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { AuthNav } from './AuthNav';

const menu = [
  { href: '/imoveis?modalidade=venda', label: 'Venda' },
  { href: '/imoveis?modalidade=aluguel', label: 'Aluguel' },
];

// Cabeçalho do site (handoff): logo, "Anuncie", tema e entrar — com degradê sutil.
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5" style={{ backgroundImage: 'var(--header-grad)' }}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            <span className="text-link">77</span>
            <span className="text-text">imóveis</span>
          </Link>
          <div className="hidden items-center gap-5 md:flex">
            {menu.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-bold text-text/75 transition-colors hover:text-link-hover">
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/anunciar"
            className="hidden rounded-[10px] bg-primary px-3 py-2 text-sm font-bold text-on-primary shadow-[0_10px_22px_-14px_rgba(14,165,233,.45)] transition-colors hover:bg-primary-hover md:inline-flex"
          >
            Anunciar imóvel
          </Link>
          <AuthNav />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
