'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Check, Search, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AuthNav } from './AuthNav';
import { cn } from '@/lib/cn';
import { cityEmojiFor, cityTaglineFor, tileColors } from '@/lib/constants';
import type { Option } from '@/components/ui/Dropdown';

const negocios = [
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
  { value: 'temporada', label: 'Temporada' },
];

const mobileTabs = [
  { label: 'Imóveis', href: '/' },
  { label: 'Profissionais', href: '/profissionais' },
  { label: 'Catálogos', href: '/vitrine' },
];

const ease = 'cubic-bezier(0.32, 0.72, 0, 1)';
const selCls = 'cursor-pointer appearance-none bg-transparent text-sm text-text outline-none';

export function Header({ cities, types }: { cities: Option[]; types: Option[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [forceExpanded, setForceExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [tipoOpen, setTipoOpen] = useState(false);
  const [negocioOpen, setNegocioOpen] = useState(false);
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [negocio, setNegocio] = useState('');

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
      const target = e.target as Node;
      if (ref.current?.contains(target) || mobileRef.current?.contains(target) || pillRef.current?.contains(target)) return;
      setOpen(false);
      setTipoOpen(false);
      setNegocioOpen(false);
      setForceExpanded(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const fieldOrder = ['cidade', 'tipo', 'negocio'] as const;
  const openField = (field: (typeof fieldOrder)[number]) => {
    setOpen(field === 'cidade');
    setTipoOpen(field === 'tipo');
    setNegocioOpen(field === 'negocio');
  };
  const advance = (current: (typeof fieldOrder)[number]) => {
    openField(fieldOrder[(fieldOrder.indexOf(current) + 1) % fieldOrder.length]);
  };

  const buscar = (c = city) => {
    if (!c) return;
    const base = type ? `/${c}/${type}s` : `/${c}`;
    router.push(negocio && negocio !== 'venda' ? `${base}?modalidade=${negocio}` : base);
  };

  const cityLabel = cities.find((c) => c.value === city)?.label;
  const typeLabel = types.find((t) => t.value === type)?.label;
  const negocioLabel = negocios.find((n) => n.value === negocio)?.label;
  const activeTab = pathname.startsWith('/profissionais')
    ? '/profissionais'
    : pathname.startsWith('/vitrine')
      ? '/vitrine'
      : '/';

  return (
    <>
    <header
      className="sticky top-0 z-40 border-b border-border"
      style={{ backgroundImage: 'var(--header-grad)' }}
    >
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          77<span className="text-primary">imóveis</span>
        </Link>

        {/* pílula compacta — aparece ao rolar (desktop); expande a busca no lugar */}
        {showSearch && (
          <button
            ref={pillRef}
            onClick={() => { setForceExpanded(true); setOpen(true); }}
            style={{ transition: `opacity 350ms ${ease}, transform 350ms ${ease}` }}
            className={cn(
              'absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-4 pr-1.5 text-sm shadow-sm md:flex',
              scrolled && !forceExpanded ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0',
            )}
            aria-label="Abrir busca"
          >
            <span className="font-medium">{cityLabel ?? 'Buscar imóveis'}</span>
            <span className="h-4 w-px bg-border" />
            <span className="text-muted">{cityLabel ? (negocioLabel ?? 'Comprar ou alugar') : 'Cidade · tipo'}</span>
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

      {/* busca + abas — mobile */}
      <div ref={mobileRef} className="contents">
      {showSearch && (
        <div className="px-4 pb-3 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="flex h-12 w-full items-center gap-3 rounded-full border border-border bg-surface px-4 shadow-sm"
            aria-label="Abrir busca"
          >
            <Search size={18} className="text-muted" />
            <span className={cn('text-sm', cityLabel ? 'text-text' : 'text-muted')}>
              {cityLabel ? `${cityLabel} · ${negocioLabel ?? 'Comprar ou alugar'}` : 'Inicie sua busca'}
            </span>
          </button>

          {!scrolled && (
            <div className="mt-3 flex gap-5 overflow-x-auto text-sm">
              {mobileTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'shrink-0 pb-2 font-medium',
                    activeTab === tab.href ? 'border-b-2 border-text text-text' : 'text-muted',
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* painel de busca — overlay mobile */}
      {showSearch && open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-surface md:hidden">
          <div className="flex items-center justify-between gap-4 px-4 pt-4">
            <div className="flex gap-5 text-sm">
              {mobileTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'pb-2 font-medium',
                    activeTab === tab.href ? 'border-b-2 border-text text-text' : 'text-muted',
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt-6">
            <p className="mb-3 text-2xl font-semibold">Onde?</p>
            <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border bg-bg px-4 py-3">
              <Search size={18} className="text-muted" />
              <span className={cn('text-sm', cityLabel ? 'text-text' : 'text-muted')}>
                {cityLabel ?? 'Buscar destinos'}
              </span>
            </div>

            <p className="mb-2 px-1 text-xs font-medium text-muted">Destinos sugeridos</p>
            {cities.map((c, i) => (
              <button
                key={c.value}
                onClick={() => setCity(c.value)}
                className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left transition-colors hover:bg-bg"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ background: tileColors[i % tileColors.length] }}
                >
                  {cityEmojiFor(c.value)}
                </span>
                <span>
                  <span className="block text-sm font-medium">{c.label}</span>
                  <span className="block text-sm text-muted">{cityTaglineFor(c.value)}</span>
                </span>
              </button>
            ))}

            <div className="mt-5 flex flex-col gap-3">
              <div className="flex flex-col rounded-2xl border border-border px-4 py-3">
                <label className="text-xs font-medium">Tipo</label>
                <select aria-label="Tipo" className={selCls} value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">Qualquer</option>
                  {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col rounded-2xl border border-border px-4 py-3">
                <label className="text-xs font-medium">Negócio</label>
                <select aria-label="Negócio" className={selCls} value={negocio} onChange={(e) => setNegocio(e.target.value)}>
                  <option value="">Comprar ou alugar</option>
                  {negocios.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-4">
            <button
              onClick={() => { setCity(''); setType(''); setNegocio(''); }}
              className="text-sm font-medium underline"
            >
              Limpar tudo
            </button>
            <button
              onClick={() => { buscar(); setOpen(false); }}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-white"
            >
              <Search size={16} /> Buscar
            </button>
          </div>
        </div>
      )}
      </div>

      {/* busca expandida — colapsa ao rolar (desktop) */}
      {showSearch && (
        <div
          style={{ transition: `max-height 450ms ${ease}, opacity 350ms ${ease}, transform 450ms ${ease}` }}
          className={cn(
            'hidden overflow-visible md:block',
            scrolled && !forceExpanded ? 'pointer-events-none max-h-0 -translate-y-2 opacity-0' : 'max-h-40 translate-y-0 opacity-100',
          )}
        >
          <div ref={ref} className="relative mx-auto max-w-3xl px-4 pb-4">
            <div className="flex items-center rounded-full border border-border bg-surface p-1.5 pl-2 transition-shadow hover:shadow-md">
              <button
                onClick={() => { setOpen((o) => !o); setTipoOpen(false); setNegocioOpen(false); }}
                className={cn('flex h-11 flex-1 flex-col justify-center rounded-full px-4 text-left transition-colors hover:bg-subtle', open && 'bg-subtle')}
              >
                <span className="text-xs font-medium">Cidade</span>
                <span className={cn('text-sm', cityLabel ? 'text-text' : 'text-muted')}>{cityLabel ?? 'Onde você procura?'}</span>
              </button>
              <span className="mx-1.5 h-8 w-px bg-border" />
              <div className="relative flex flex-1">
                <button
                  onClick={() => { setTipoOpen((o) => !o); setOpen(false); setNegocioOpen(false); }}
                  className={cn('flex w-full flex-col rounded-full px-4 py-2 text-left transition-colors hover:bg-subtle', tipoOpen && 'bg-subtle')}
                >
                  <span className="text-xs font-medium">Tipo</span>
                  <span className={cn('text-sm', type ? 'text-text' : 'text-muted')}>{typeLabel ?? 'Casa, apt, kit, sala'}</span>
                </button>

                {/* painel de tipo */}
                <div
                  style={{ transition: `opacity 250ms ${ease}, transform 250ms ${ease}` }}
                  className={cn(
                    'absolute left-0 top-full z-50 mt-2 w-64 origin-top rounded-2xl border border-border bg-surface p-2 shadow-lg',
                    tipoOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
                  )}
                >
                  <button
                    onClick={() => { setType(''); advance('tipo'); }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-bg"
                  >
                    Qualquer {!type && <Check size={16} className="text-text" />}
                  </button>
                  {types.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setType(t.value); advance('tipo'); }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-bg"
                    >
                      {t.label} {type === t.value && <Check size={16} className="text-text" />}
                    </button>
                  ))}
                </div>
              </div>
              <span className="mx-1.5 h-8 w-px bg-border" />
              <div className="relative flex flex-1">
                <button
                  onClick={() => { setNegocioOpen((o) => !o); setOpen(false); setTipoOpen(false); }}
                  className={cn('flex h-11 w-full flex-col justify-center rounded-full px-4 text-left transition-colors hover:bg-subtle', negocioOpen && 'bg-subtle')}
                >
                  <span className="text-xs font-medium">Negócio</span>
                  <span className={cn('text-sm', negocio ? 'text-text' : 'text-muted')}>{negocioLabel ?? 'Comprar ou alugar'}</span>
                </button>

                {/* painel de negócio */}
                <div
                  style={{ transition: `opacity 250ms ${ease}, transform 250ms ${ease}` }}
                  className={cn(
                    'absolute right-0 top-full z-50 mt-2 w-56 origin-top rounded-2xl border border-border bg-surface p-2 shadow-lg',
                    negocioOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0',
                  )}
                >
                  <button
                    onClick={() => { setNegocio(''); advance('negocio'); }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-bg"
                  >
                    Qualquer {!negocio && <Check size={16} className="text-text" />}
                  </button>
                  {negocios.map((n) => (
                    <button
                      key={n.value}
                      onClick={() => { setNegocio(n.value); advance('negocio'); }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-bg"
                    >
                      {n.label} {negocio === n.value && <Check size={16} className="text-text" />}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { buscar(); setForceExpanded(false); }}
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
                  onClick={() => { setCity(c.value); advance('cidade'); }}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-bg"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                    style={{ background: tileColors[i % tileColors.length] }}
                  >
                    {cityEmojiFor(c.value)}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{c.label}</span>
                    <span className="block text-sm text-muted">{cityTaglineFor(c.value)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>

    {/* overlay escuro — destaca a busca expandida quando aberta via pílula compacta */}
    {showSearch && forceExpanded && (
      <div className="fixed inset-0 z-30 hidden bg-black/50 md:block" aria-hidden="true" />
    )}
    </>
  );
}
