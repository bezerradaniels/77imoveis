import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { AuthNav } from './AuthNav';

// Cabeçalho do site (handoff): logo, "Anuncie", tema e entrar — com degradê verde.
export function Header() {
  return (
    <header className="border-b border-black/5" style={{ backgroundImage: 'var(--header-grad)' }}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-primary">77</span>
          <span className="text-text">imóveis</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link href="/anunciar" className="hidden text-sm font-semibold text-text/80 hover:text-text sm:inline">
            Anuncie seu imóvel
          </Link>
          <ThemeToggle />
          <AuthNav />
        </nav>
      </div>
    </header>
  );
}
