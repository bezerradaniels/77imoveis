'use client';
import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { Camera, Loader2, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/app/painel/perfil/actions';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

type City = { id: string; name: string };
type Profile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  city_id: string | null;
};

const inputClass =
  'h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export function ProfileForm({ profile, cities }: { profile: Profile; cities: City[] }) {
  const [fullName, setFullName] = useState(profile.full_name ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp ?? '');
  const [cityId, setCityId] = useState(profile.city_id ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickFile(file: File) {
    setError(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return setError('Use imagens em JPG, PNG, WebP ou AVIF.');
    if (file.size > MAX_IMAGE_SIZE) return setError('A foto precisa ter até 5 MB.');
    setUploading(true);
    try {
      const sb = createClient();
      const path = `avatars/${crypto.randomUUID()}.${file.name.split('.').pop() || 'jpg'}`;
      const { error: upErr } = await sb.storage.from('imoveis').upload(path, file);
      if (upErr) throw upErr;
      setAvatarUrl(sb.storage.from('imoveis').getPublicUrl(path).data.publicUrl);
    } catch (e: any) {
      setError(
        e?.message?.includes('Bucket')
          ? 'Crie o bucket público "imoveis" no Supabase Storage para enviar fotos.'
          : 'Não foi possível enviar a foto.',
      );
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    start(async () => {
      const res = await updateProfile({ fullName, email, phone, whatsapp, avatarUrl, cityId });
      if ('error' in res) setError(res.error!);
      else setSaved(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Foto de perfil */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-surface">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Foto de perfil" fill className="object-cover" sizes="80px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted">
              <User size={32} />
            </span>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold transition hover:border-primary/40 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            {avatarUrl ? 'Trocar foto' : 'Enviar foto'}
          </button>
          <p className="mt-1 text-xs text-muted">JPG, PNG ou WebP, até 5 MB.</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickFile(f);
              e.currentTarget.value = '';
            }}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Nome completo</label>
        <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">E-mail de contato</label>
        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Telefone</label>
          <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(77) 0000-0000" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">WhatsApp</label>
          <input className={inputClass} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(77) 90000-0000" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Cidade</label>
        <select className={inputClass} value={cityId} onChange={(e) => setCityId(e.target.value)}>
          <option value="">Selecione…</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>
      )}
      {saved && !error && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">Perfil atualizado com sucesso.</p>
      )}

      <button
        type="submit"
        disabled={pending || uploading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {pending && <Loader2 size={18} className="animate-spin" />}
        Salvar perfil
      </button>
    </form>
  );
}
