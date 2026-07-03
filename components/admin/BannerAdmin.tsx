'use client';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ImagePlus, Trash2, Plus } from 'lucide-react';
import { adminToggleBanner, adminDeleteBanner, adminCreateBanner } from '@/app/admin/actions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Database } from '@/lib/supabase/types';
import { cleanupUploadedImages, uploadImageFile, validateImageFile } from '@/lib/images/client';

type BannerSlot = Database['public']['Enums']['banner_slot'];
type BannerFormState = { title: string; target_url: string; slot: BannerSlot };

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
  const [form, setForm] = useState<BannerFormState>({ title: '', target_url: '', slot: 'home_topo' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const set = (k: keyof BannerFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold">Novo banner</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input placeholder="Título (opcional)" value={form.title} onChange={set('title')} />
        <Input placeholder="URL de destino" value={form.target_url} onChange={set('target_url')} />
        <select value={form.slot} onChange={set('slot')} className="h-11 rounded-lg border border-border bg-surface px-3 text-sm">
          {slots.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
      </div>
      <label className="flex min-h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-bg text-sm text-muted hover:border-primary/50">
        {preview ? (
          // Preview local (blob de URL.createObjectURL) — next/image não lida com blob:.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-32 w-full object-cover" />
        ) : (
          <span className="inline-flex items-center gap-2"><ImagePlus size={18} /> Enviar imagem do banner</span>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              validateImageFile(file);
              setImageFile(file);
              setPreview(URL.createObjectURL(file));
              setError('');
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Use uma imagem JPG, PNG, WebP ou AVIF.');
            }
          }}
        />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button
        disabled={pending}
        onClick={() => start(async () => {
          if (!imageFile) { setError('Envie a imagem do banner.'); return; }
          let uploadedUrl = '';
          try {
            uploadedUrl = (await uploadImageFile(imageFile, 'banner')).url;
            const r = await adminCreateBanner({ ...form, image_url: uploadedUrl });
            if (r.error) {
              await cleanupUploadedImages([uploadedUrl]);
              setError(r.error);
              return;
            }
            setForm({ title: '', target_url: '', slot: 'home_topo' });
            setImageFile(null);
            setPreview('');
            setError('');
            router.refresh();
          } catch (err) {
            await cleanupUploadedImages([uploadedUrl]);
            setError(err instanceof Error ? err.message : 'Não foi possível criar o banner.');
          }
        })}
      >
        <Plus size={16} /> Criar banner
      </Button>
    </div>
  );
}
