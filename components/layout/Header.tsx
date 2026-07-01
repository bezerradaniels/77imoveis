import { ThemeToggle } from './ThemeToggle';
import { AuthNav } from './AuthNav';
import { TrackedLink } from '@/components/analytics/TrackedLink';

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
          <TrackedLink
            href="/"
            buttonId="header_logo_link"
            buttonText="77imóveis"
            buttonLocation="header"
            section="header"
            className="text-2xl font-extrabold tracking-tight"
          >
            <span className="text-link">77</span>
            <span className="text-text">imóveis</span>
          </TrackedLink>
          <div className="hidden items-center gap-5 md:flex">
            {menu.map((item) => (
              <TrackedLink
                key={item.href}
                href={item.href}
                buttonId={`header_${item.label.toLowerCase()}_link`}
                buttonText={item.label}
                buttonLocation="header_nav"
                section="header"
                className="text-sm font-bold text-text/75 transition-colors hover:text-link-hover"
              >
                {item.label}
              </TrackedLink>
            ))}
          </div>
        </div>

        <nav className="flex items-center gap-3 sm:gap-4">
          <TrackedLink
            href="/anunciar"
            buttonId="header_add_property_button"
            buttonText="Anunciar imóvel"
            buttonLocation="header"
            section="header"
            className="hidden rounded-[10px] bg-primary px-3 py-2 text-sm font-bold text-on-primary shadow-[0_10px_22px_-14px_rgba(14,165,233,.45)] transition-colors hover:bg-primary-hover md:inline-flex"
          >
            Anunciar imóvel
          </TrackedLink>
          <AuthNav />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
