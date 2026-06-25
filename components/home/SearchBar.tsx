'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Dropdown, type Option } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const modalidades = [
  { value: 'venda', label: 'Comprar' },
  { value: 'aluguel', label: 'Alugar' },
  { value: 'temporada', label: 'Temporada' },
];

// Busca principal da home. Monta a URL amigável e navega para a listagem.
export function SearchBar({ cities, types }: { cities: Option[]; types: Option[] }) {
  const router = useRouter();
  const [modalidade, setModalidade] = useState('venda');
  const [city, setCity] = useState(cities[0]?.value ?? '');
  const [type, setType] = useState('');

  const buscar = () => {
    if (!city) return;
    const base = type ? `/${city}/${type}` : `/${city}`;
    router.push(modalidade === 'venda' ? base : `${base}?modalidade=${modalidade}`);
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="mb-3 flex gap-2">
        {modalidades.map((m) => (
          <button
            key={m.value}
            onClick={() => setModalidade(m.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm',
              modalidade === m.value ? 'bg-primary text-white' : 'border border-border text-muted',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Dropdown options={cities} value={city} onChange={setCity} placeholder="Cidade" />
        <Dropdown options={types} value={type} onChange={setType} placeholder="Qualquer tipo" />
        <Button onClick={buscar} className="sm:w-auto">
          <Search size={16} /> Buscar
        </Button>
      </div>
    </div>
  );
}
