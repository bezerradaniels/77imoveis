'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import type { Option } from '@/components/ui/Dropdown';
import { Dropdown } from '@/components/ui/Dropdown';
import { Autocomplete } from '@/components/ui/Autocomplete';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { cn } from '@/lib/cn';
import { ANALYTICS_EVENTS, trackButtonClick, trackEvent } from '@/lib/analytics';

const objetivoOpts: Option[] = [
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
  { value: 'permuta', label: 'Permuta' },
];

const quartosOpts: Option[] = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4+', label: '4 ou mais' },
];

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      {children}
    </div>
  );
}

// Formulário de busca do hero. Objetivo, tipo e quartos são múltipla escolha;
// cidade é única e o bairro (digitável) é restrito à cidade escolhida.
// Navega para a listagem mantendo o contrato de filtros das páginas:
//   /[cidade]/[tipo]  ·  /[cidade]  ·  /imoveis?cidade=&tipo=a,b
//   /imoveis/venda · /imoveis/casa/venda · + ?quartos=2,3 & bairro=slug
export function HeroSearchForm({
  cities,
  types,
  neighborhoods,
  bare = false,
}: {
  cities: Option[];
  types: Option[];
  neighborhoods: Record<string, Option[]>;
  bare?: boolean; // sem moldura de card (usado no bottom sheet do mobile)
}) {
  const router = useRouter();
  const [objetivo, setObjetivo] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [bairro, setBairro] = useState('');
  const [tipos, setTipos] = useState<string[]>([]);
  const [quartos, setQuartos] = useState<string[]>([]);

  const cityOptions: Option[] = [{ value: '', label: 'Todas as cidades' }, ...cities];
  const bairroOptions = city ? neighborhoods[city] ?? [] : [];

  const buscar = () => {
    const sp = new URLSearchParams();
    const negs = objetivo.filter((o) => o !== 'permuta'); // venda / aluguel
    if (negs.length) sp.set('modalidade', negs.join(','));
    if (objetivo.includes('permuta')) sp.set('permuta', '1');
    if (quartos.length) sp.set('quartos', quartos.join(','));
    if (city && bairro) sp.set('bairro', bairro);

    let base: string;
    if (city) {
      if (tipos.length === 1) {
        base = `/${city}/${tipos[0]}s`;
      } else if (tipos.length >= 2) {
        sp.set('cidade', city);
        sp.set('tipo', tipos.join(','));
        base = '/imoveis';
      } else {
        base = `/${city}`;
      }
    } else {
      const singleTipo = tipos.length === 1 ? tipos[0] : '';
      const singleNeg = negs.length === 1 ? negs[0] : '';
      if (tipos.length > 1) sp.set('tipo', tipos.join(','));
      if (negs.length <= 1) sp.delete('modalidade');
      if (singleTipo && singleNeg) base = `/imoveis/${singleTipo}/${singleNeg}`;
      else if (singleTipo) base = `/imoveis/${singleTipo}`;
      else if (singleNeg) base = `/imoveis/${singleNeg}`;
      else base = '/imoveis';
    }
    const qs = sp.toString();
    trackEvent(ANALYTICS_EVENTS.searchPerformed, {
      search_type: 'hero_search',
      section: bare ? 'mobile_search_sheet' : 'home_hero',
      city,
      state: 'BA',
      property_type: tipos.join(','),
      negotiation: objetivo.join(','),
      bedrooms: quartos.join(','),
      has_neighborhood: !!bairro,
    });
    trackButtonClick({
      button_id: bare ? 'mobile_search_button' : 'hero_search_button',
      button_text: 'Buscar imóveis',
      button_location: bare ? 'mobile_search_sheet' : 'home_hero',
      section: 'search',
    });
    router.push(qs ? `${base}?${qs}` : base);
  };

  return (
    <div
      role="search"
      className={cn(!bare && 'flex h-full w-full flex-col rounded-[20px] border border-border bg-surface p-5')}
    >
      {!bare && (
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <p className="text-[13px] font-bold tracking-[.01em] text-text">Filtrar imóveis</p>
          <Link href="/imoveis" className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-bold text-link transition-colors hover:text-link-hover">
            Ver todos os imóveis <ArrowRight size={13} />
          </Link>
        </div>
      )}

      <div className={cn('flex flex-col gap-3', !bare && 'lg:gap-3.5')}>
        <Field label="Objetivo">
          <MultiSelect options={objetivoOpts} selected={objetivo} onChange={setObjetivo} placeholder="Comprar, alugar ou permuta" />
        </Field>

        <Field label="Cidade">
          <Dropdown
            options={cityOptions}
            value={city}
            onChange={(v) => {
              setCity(v);
              setBairro('');
            }}
            placeholder="Todas as cidades"
          />
        </Field>

        <Field label="Bairro">
          <Autocomplete
            options={bairroOptions}
            value={bairro}
            onChange={setBairro}
            disabled={!city}
            placeholder={city ? 'Qualquer bairro' : 'Escolha a cidade primeiro'}
          />
        </Field>

        <div className="flex gap-3">
          <Field label="Tipo" className="flex-1">
            <MultiSelect options={types} selected={tipos} onChange={setTipos} placeholder="Todos" />
          </Field>
          <Field label="Quartos" className="flex-1">
            <MultiSelect options={quartosOpts} selected={quartos} onChange={setQuartos} placeholder="Qualquer" />
          </Field>
        </div>
      </div>

      <button
        type="button"
        onClick={buscar}
        className={cn(
          'mt-[18px] flex h-[50px] w-full items-center justify-center gap-2 rounded-[13px] bg-action text-[15.5px] font-bold text-on-action transition-colors hover:bg-action-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/25',
          !bare && 'lg:mt-auto',
        )}
      >
        <Search size={19} /> Buscar imóveis
      </button>
    </div>
  );
}
