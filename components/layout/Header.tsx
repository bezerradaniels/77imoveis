'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AuthNav } from './AuthNav';
import { cn } from '@/lib/cn';
import { cityEmojiFor, tileColors } from '@/lib/constants';
import type { Option } from '@/components/ui/Dropdown';

const negocios = [
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
  { value: 'temporada', label: 'Temporada' },
];

const ease = 'cubic-bezier(0.32, 0.72, 0, 1)';
const selCls = 'cursor-pointer appearance-none bg-transparent text-sm text-text outline-none';

export function Header({ cities, types }: { cities: Option[]; types: Option[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [negocio, setNegocio] = useState('venda');

  const showSearch = !/^\/(painel|admin|entrar|cadastro|anunciar)/.test(pathname);

  useEffect(() => {
    if (!showSearch) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [showSearch]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const buscar = (c = city) => {
    if (!c) return;
    const base = type ? `/${c}/${type}s` : `/${c}`;
    router.push(negocio === 'venda' ? base : `${base}?modalidade=${negocio}`);
  };

  const cityLabel = cities.find((c) => c.value === city)?.label;
  const negocioLabel = negocios.find((n) => n.value === negocio)?.label;

  return (
    <header
      className="sticky top-0 z-40 border-b border-border"
      style={{ backgroundImage: 'var(--header-grad)' }}
    >
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          77<span className="text-primary">imóveis</span>
        </Link>

        {/* pílula compacta — aparece ao rolar (desktop) */}
        {showSearch && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ transition: `opacity 350ms ${ease}, transform 350ms ${ease}` }}
            className={cn(
              'absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-4 pr-1.5 text-sm shadow-sm md:flex',
              scrolled ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
            )}
            aria-label="Abrir busca"
          >
            <span className="font-medium">{cityLabel ?? 'Buscar imóveis'}</span>
            <span className="h-4 w-px bg-border" />
            <span className="text-muted">{cityLabel ? negocioLabel : 'Cidade · tipo'}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
              <Search size={15} />
            </span>
          </button>
        )}

        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/anunciar" className="hidden rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-bg sm:inline">
            Anuncie seu imóvel
          </Link>
          <ThemeToggle />
          <AuthNav />
        </div>
      </div>

      {/* busca expandida — colapsa ao rolar (desktop) */}
      {showSearch && (
        <div
          style={{ transition: `max-height 450ms ${ease}, opacity 350ms ${ease}, transform 450ms ${ease}` }}
          className={cn(
            'hidden overflow-visible md:block',
            scrolled ? 'pointer-events-none max-h-0 -translate-y-2 opacity-0' : 'max-h-40 translate-y-0 opacity-100',
          )}
        >
          <div ref={ref} className="relative mx-auto max-w-3xl px-4 pb-4">
            <div className="flex items-center rounded-full border border-border bg-surface p-1.5 pl-2 transition-shadow hover:shadow-md">
              <button
                onClick={() => setOpen((o) => !o)}
                className={cn('flex flex-1 flex-col rounded-full px-4 py-1.5 text-left transition-colors hover:bg-bg', open && 'bg-bg')}
              >
                <span className="text-xs font-medium">Cidade</span>
                <span className={cn('text-sm', cityLabel ? 'text-text' : 'text-muted')}>{cityLabel ?? 'Onde você procura?'}</span>
              </button>
              <span className="h-8 w-px bg-border" />
              <div className="flex flex-1 flex-col px-4 py-1.5">
                <label className="text-xs font-medium">Tipo</label>
                <select aria-label="Tipo" className={selCls} value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">Qualquer</option>
                  {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <span className="h-8 w-px bg-border" />
              <div className="flex flex-1 flex-col px-4 py-1.5">
                <label className="text-xs font-medium">Negócio</label>
                <select aria-label="Negócio" className={selCls} value={negocio} onChange={(e) => setNegocio(e.target.value)}>
                  {negocios.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
              <button
                onClick={() => buscar()}
                className="ml-1 flex h-12 shrink-0 items-center gap-2 rounded-full bg-primary px-5 font-medium text-white transition-all hover:bg-primary-hover"
                aria-label="Buscar"
              >
                <Search size={18} /> Buscar
              </button>
            </div>

            {/* painel de destinos sugeridos */}
            <div
              style={{ transition: `opacity 250ms ${ease}, transform 250ms ${ease}` }}
              className={cn(
                'absolute left-4 right-4 top-full z-50 mt-2 origin-top rounded-2xl border border-border bg-surface p-3 shadow-lg',
                open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
              )}
            >
              <p className="px-2 py-1.5 text-xs font-medium text-muted">Destinos sugeridos</p>
              {cities.map((c, i) => (
                <button
                  key={c.value}
                  onClick={() => { setCity(c.value); setOpen(false); }}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-bg"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ background: tileColors[i % tileColors.length] }}
                  >
                    {cityEmojiFor(c.value)}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{c.label}, Bahia</span>
                    <span className="block text-sm text-muted">Imóveis na região do DDD 77</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
