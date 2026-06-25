'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Plus } from 'lucide-react';
import { adminAddCity, adminToggleCityFeatured, adminAddNeighborhood } from '@/app/admin/actions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function AddCity() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [featured, setFeatured] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState('');
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-surface p-3">
      <div className="flex-1">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nova cidade" />
      </div>
      <label className="inline-flex items-center gap-2 px-1 text-sm text-muted">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Destaque
      </label>
      <Button
        disabled={pending}
        onClick={() => start(async () => {
          const r = await adminAddCity(name, featured);
          if (r.error) setError(r.error);
          else { setName(''); setError(''); router.refresh(); }
        })}
      >
        <Plus size={16} /> Adicionar
      </Button>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </div>
  );
}

export function CityFeatured({ id, featured }: { id: string; featured: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(async () => { await adminToggleCityFeatured(id, !featured); router.refresh(); })}
      className={`inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs ${featured ? 'text-accent' : 'text-muted'}`}
    >
      <Star size={13} className={featured ? 'fill-accent' : ''} /> {featured ? 'Em destaque' : 'Destacar'}
    </button>
  );
}

export function AddNeighborhood({ cities }: { cities: { id: string; name: string }[] }) {
  const router = useRouter();
  const [cityId, setCityId] = useState('');
  const [name, setName] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState('');
  return (
    <div className="flex flex-wrap items-end gap-2 rounded-xl border border-border bg-surface p-3">
      <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="h-11 rounded-lg border border-border bg-surface px-3 text-sm">
        <option value="">Cidade…</option>
        {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div className="flex-1">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Novo bairro" />
      </div>
      <Button
        disabled={pending}
        onClick={() => start(async () => {
          const r = await adminAddNeighborhood(cityId, name);
          if (r.error) setError(r.error);
          else { setName(''); setError(''); router.refresh(); }
        })}
      >
        <Plus size={16} /> Bairro
      </Button>
      {error && <p className="w-full text-sm text-danger">{error}</p>}
    </div>
  );
}
