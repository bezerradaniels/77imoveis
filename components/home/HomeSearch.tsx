'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown } from 'lucide-react';
import type { Option } from '@/components/ui/Dropdown';
import { cn } from '@/lib/cn';

const faixas = [
  { value: '', label: 'Qualquer valor' },
  { value: '0-150000', label: 'Até R$ 150 mil' },
  { value: '150000-300000', label: 'R$ 150 – 300 mil' },
  { value: '300000-600000', label: 'R$ 300 – 600 mil' },
  { value: '600000-1000000', label: 'R$ 600 mil – 1 mi' },
  { value: '1000000-', label: 'Acima de R$ 1 mi' },
];
const quartosOpts = [
  { value: '', label: 'Indiferente' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
];

function Select({ label, value, onChange, children }: any) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <label className="text-xs font-bold text-muted">{label}</label>
      <div className="relative">
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-border bg-surface py-3 pl-3.5 pr-9 text-sm font-medium text-text outline-none focus:border-primary"
        >
          {children}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
      </div>
    </div>
  );
}

// Card de busca da home: aba Comprar/Alugar + cidade/tipo/preço/quartos → navega.
export function HomeSearch({ cities, types }: { cities: Option[]; types: Option[] }) {
  const router = useRouter();
  const [purpose, setPurpose] = useState<'venda' | 'aluguel'>('venda');
  const [city, setCity] = useState('');
  const [type, setType] = useState('');
  const [faixa, setFaixa] = useState('');
  const [quartos, setQuartos] = useState('');

  const buscar = () => {
    const dest = city || cities[0]?.value || 'vitoria-da-conquista';
    const base = type ? `/${dest}/${type}s` : `/${dest}`;
    const sp = new URLSearchParams({ modalidade: purpose });
    if (quartos) sp.set('quartos', quartos);
    if (faixa) {
      const [min, max] = faixa.split('-');
      if (min) sp.set('min', min);
      if (max) sp.set('max', max);
    }
    router.push(`${base}?${sp.toString()}`);
  };

  const tab = (v: 'venda' | 'aluguel', label: string) => (
    <button
      onClick={() => setPurpose(v)}
      className={cn(
        'rounded-[9px] px-[22px] py-2.5 text-sm font-bold transition-all',
        purpose === v ? 'bg-primary text-white shadow-sm' : 'text-muted',
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-[20px] border border-[#eceeec] bg-surface p-4 shadow-[0_26px_60px_-28px_rgba(8,30,22,.4)] sm:p-5">
      <div className="mb-4 flex w-fit gap-1.5 rounded-[13px] bg-subtle p-1.5">
        {tab('venda', 'Comprar')}
        {tab('aluguel', 'Alugar')}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-[2_1_200px]">
          <Select label="Cidade" value={city} onChange={setCity}>
            <option value="">Todas as cidades</option>
            {cities.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
        </div>
        <div className="flex-[1_1_150px]">
          <Select label="Tipo de imóvel" value={type} onChange={setType}>
            <option value="">Todos os tipos</option>
            {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </div>
        <div className="flex-[1_1_140px]">
          <Select label="Faixa de preço" value={faixa} onChange={setFaixa}>
            {faixas.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </Select>
        </div>
        <div className="flex-[1_1_120px]">
          <Select label="Quartos" value={quartos} onChange={setQuartos}>
            {quartosOpts.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
          </Select>
        </div>
        <button
          onClick={buscar}
          className="flex h-12 flex-[1_1_150px] items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[15px] font-bold text-white shadow-[0_10px_22px_-10px_rgba(14,157,116,.7)] transition-colors hover:bg-primary-hover"
        >
          <Search size={17} /> Buscar imóveis
        </button>
      </div>
    </div>
  );
}
