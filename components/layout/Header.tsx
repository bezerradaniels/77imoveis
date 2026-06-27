import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { AuthNav } from './AuthNav';

const menu = [
  { href: '/', label: 'Home' },
  { href: '/vitoria-da-conquista', label: 'Anúncios' },
  { href: '/#sobre', label: 'Sobre' },
  { href: '/contato', label: 'Contato' },
];

// Cabeçalho do site (handoff): logo, "Anuncie", tema e entrar — com degradê verde.
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5" style={{ backgroundImage: 'var(--header-grad)' }}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-primary">77</span>
          <span className="text-text">imóveis</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-5 md:flex">
            {menu.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-bold text-text/75 transition-colors hover:text-primary">
                {item.label}
              </Link>
            ))}
          </div>
          <ThemeToggle />
          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
