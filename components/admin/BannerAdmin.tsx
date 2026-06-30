'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Trash2, Plus } from 'lucide-react';
import { adminToggleBanner, adminDeleteBanner, adminCreateBanner } from '@/app/admin/actions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Database } from '@/lib/supabase/types';

type BannerSlot = Database['public']['Enums']['banner_slot'];
type BannerFormState = { title: string; image_url: string; target_url: string; slot: BannerSlot };

const slots = [
  { v: 'home_topo',       l: 'Home — topo' },
  { v: 'home_meio',       l: 'Home — meio' },
  { v: 'busca_lateral',   l: 'Busca — lateral' },
  { v: 'busca_lista',     l: 'Busca — lista' },
  { v: 'imovel_rodape',   l: 'Imóvel — rodapé' },
  { v: 'empresa_pagina',  l: 'Empresa — página' },
  { v: 'blog',            l: 'Blog' },
] satisfies { v: BannerSlot; l: string }[];

export function BannerToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const btn = 'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium disabled:opacity-50';
  return (
    <div className="flex items-center gap-1.5">
      <button
        disabled={pending}
        onClick={() => start(async () => { await adminToggleBanner(id, !active); router.refresh(); })}
        className={`${btn} border border-border ${active ? 'text-success' : 'text-muted'}`}
      >
        {active ? <Eye size={13} /> : <EyeOff size={13} />}
        {active ? 'Ativo' : 'Inativo'}
      </button>
      <button
        disabled={pending}
        onClick={() => { if (confirm('Excluir este banner?')) start(async () => { await adminDeleteBanner(id); router.refresh(); }); }}
        className={`${btn} bg-danger/10 text-danger`}
      >
        <Trash2 size={13} /> Excluir
      </button>
    </div>
  );
}

export function BannerForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState('');
  const [form, setForm] = useState<BannerFormState>({ title: '', image_url: '', target_url: '', slot: 'home_topo' });
  const set = (k: keyof BannerFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold">Novo banner</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input placeholder="Título (opcional)" value={form.title} onChange={set('title')} />
        <Input placeholder="URL da imagem" value={form.image_url} onChange={set('image_url')} />
        <Input placeholder="URL de destino" value={form.target_url} onChange={set('target_url')} />
        <select value={form.slot} onChange={set('slot')} className="h-11 rounded-lg border border-border bg-surface px-3 text-sm">
          {slots.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button
        disabled={pending}
        onClick={() => start(async () => {
          const r = await adminCreateBanner(form);
          if (r.error) { setError(r.error); return; }
          setForm({ title: '', image_url: '', target_url: '', slot: 'home_topo' });
          setError('');
          router.refresh();
        })}
      >
        <Plus size={16} /> Criar banner
      </Button>
    </div>
  );
}
