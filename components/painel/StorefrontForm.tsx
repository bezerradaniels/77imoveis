'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ImagePlus, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { saveStorefront, type StorefrontInput } from '@/app/painel/vitrine/actions';
import { Input, Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const fmt = (s?: string) => (s ? new Date(s).toLocaleDateString('pt-BR') : '');
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export function StorefrontForm({
  storefront,
  precos,
}: {
  storefront: any;
  precos: { dias: number; preco: number; label: string }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [slug, setSlug] = useState(storefront?.slug ?? '');
  const [headline, setHeadline] = useState(storefront?.headline ?? '');
  const [about, setAbout] = useState(storefront?.about ?? '');
  const [accent, setAccent] = useState(storefront?.accent_color ?? '#0891b2');
  const [showWa, setShowWa] = useState(storefront?.show_whatsapp ?? true);
  const [logo, setLogo] = useState<{ url: string; file?: File }>({ url: storefront?.logo_url ?? '' });
  const [cover, setCover] = useState<{ url: string; file?: File }>({ url: storefront?.cover_url ?? '' });

  const active = storefront?.status === 'ativo';
  const publicUrl = slug ? `/vitrine/${slug}` : '';

  async function upload(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error('Use uma imagem JPG, PNG, WebP ou AVIF.');
    if (file.size > MAX_IMAGE_SIZE) throw new Error('A imagem precisa ter até 5 MB.');

    const sb = createClient();
    const path = `vitrine/${crypto.randomUUID()}.${file.name.split('.').pop() || 'jpg'}`;
    const { error } = await sb.storage.from('imoveis').upload(path, file);
    if (error) throw error;
    return sb.storage.from('imoveis').getPublicUrl(path).data.publicUrl;
  }

  async function submit() {
    setError('');
    setBusy(true);
    try {
      const input: StorefrontInput = {
        slug,
        headline,
        about,
        accentColor: accent,
        showWhatsapp: showWa,
        logoUrl: logo.file ? await upload(logo.file) : logo.url,
        coverUrl: cover.file ? await upload(cover.file) : cover.url,
      };
      const r = await saveStorefront(input);
      if (r.error) {
        setError(r.error);
        setBusy(false);
        return;
      }
      if (r.slug) setSlug(r.slug);
      router.refresh();
      setBusy(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Status / ativação */}
      <div className={`rounded-xl border p-4 ${active ? 'border-success/40 bg-success/10' : 'border-border bg-surface'}`}>
        {active ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">
              <b className="text-success">Vitrine ativa</b>
              {storefront?.expires_at && <> · válida até {fmt(storefront.expires_at)}</>}
            </p>
            {publicUrl && (
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-link">
                Ver vitrine <ExternalLink size={14} />
              </a>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium">Vitrine ainda não ativada</p>
            <p className="mt-1 text-sm text-muted">Configure a aparência abaixo e ative por período:</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {precos.map((p) => (
                <div key={p.dias} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <b>{p.label}</b> — R$ {p.preco.toFixed(2).replace('.', ',')}
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">Salve a aparência primeiro. O pagamento/ativação chega no módulo de pagamentos.</p>
          </div>
        )}
      </div>

      <Field label="Link da vitrine">
        <div className="flex rounded-lg border border-border bg-surface focus-within:border-primary">
          <span className="shrink-0 px-3 py-2.5 text-sm text-muted">/vitrine/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={!!storefront?.slug}
            placeholder="minha-imobiliaria"
            className="h-11 min-w-0 flex-1 bg-transparent px-0 pr-3 text-sm outline-none disabled:text-muted"
          />
        </div>
      </Field>
      <Field label="Chamada (headline)">
        <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Ex.: Os melhores imóveis de Conquista" />
      </Field>
      <Field label="Sobre / texto de apresentação">
        <textarea className="min-h-24 w-full rounded-lg border border-border bg-surface p-3 text-sm" value={about} onChange={(e) => setAbout(e.target.value)} />
      </Field>

      <div className="flex flex-wrap items-center gap-6">
        <Field label="Cor de destaque">
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-11 w-16 rounded-lg border border-border bg-surface" />
        </Field>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showWa} onChange={(e) => setShowWa(e.target.checked)} /> Mostrar botão de WhatsApp
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        {[['Logo', logo, setLogo, 'h-32 w-32'], ['Capa', cover, setCover, 'h-32 w-full']].map(([label, st, setter, ratio]: any) => (
          <Field key={label} label={label}>
            <label className={`flex ${ratio} cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border text-xs text-muted hover:bg-bg`}>
              {st.file || st.url ? (
                <img src={st.file ? URL.createObjectURL(st.file) : st.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-1"><ImagePlus size={18} /> Enviar</span>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setter({ url: st.url, file: e.target.files[0] })} />
            </label>
          </Field>
        ))}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="border-t border-border pt-4">
        <Button onClick={submit} disabled={busy}>
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? 'Salvando…' : 'Salvar vitrine'}
        </Button>
      </div>
    </div>
  );
}
