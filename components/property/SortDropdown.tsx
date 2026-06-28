'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Dropdown } from '@/components/ui/Dropdown';

const ordens = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
];

// Ordenação dos resultados — escreve ?ordem= na URL.
export function SortDropdown({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setOrder = (v: string) => {
    const next = new URLSearchParams(params.toString());
    v && v !== 'recentes' ? next.set('ordem', v) : next.delete('ordem');
    next.delete('pagina');
    router.push(`${pathname}?${next.toString()}`);
  };

  return <Dropdown options={ordens} value={value} onChange={setOrder} placeholder="Ordenar" className="w-[170px] shrink-0" />;
}
