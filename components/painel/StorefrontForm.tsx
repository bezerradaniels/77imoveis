'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ImagePlus, ExternalLink, Check, ArrowLeft, ArrowRight, CreditCard, Store } from 'lucide-react';
import { saveStorefront, startStorefrontCheckout, type StorefrontInput } from '@/app/painel/vitrine/actions';
import { Input, Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cleanupUploadedImages, uploadImageFile } from '@/lib/images/client';

const fmt = (s?: string) => (s ? new Date(s).toLocaleDateString('pt-BR') : '');
const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

type Preco = { dias: number; preco: number; label: string };

export function StorefrontForm({
  storefront,
  precos,
}: {
  storefront: any;
  precos: Preco[];
}) {
  const router = useRouter();
  const active = storefront?.status === 'ativo';

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Fluxo (vitrine ainda não ativa): 'plano' → escolher período; 'config' → configurar.
  const [step, setStep] = useState<'plano' | 'config'>('plano');
  const [days, setDays] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [slug, setSlug] = useState(storefront?.slug ?? '');
  const [headline, setHeadline] = useState(storefront?.headline ?? '');
  const [about, setAbout] = useState(storefront?.about ?? '');
  const [accent, setAccent] = useState(storefront?.accent_color ?? '#0891b2');
  const [showWa, setShowWa] = useState(storefront?.show_whatsapp ?? true);
  const [logo, setLogo] = useState<{ url: string; file?: File }>({ url: storefront?.logo_url ?? '' });
  const [cover, setCover] = useState<{ url: string; file?: File }>({ url: storefront?.cover_url ?? '' });

  const publicUrl = slug ? `/vitrine/${slug}` : '';
  const selectedPreco = precos.find((p) => p.dias === days) ?? null;

  // Salva a aparência. Se for o fluxo de ativação (vitrine inativa), abre o
  // popup de confirmação que leva ao pagamento; se já ativa, só salva.
  async function submit(openConfirmAfter: boolean) {
    setError('');
    setBusy(true);
    const uploadedUrls: string[] = [];
    try {
      const logoUrl = logo.file ? (await uploadImageFile(logo.file, 'logo', slug || storefront?.id)).url : logo.url;
      if (logo.file) uploadedUrls.push(logoUrl);
      const coverUrl = cover.file ? (await uploadImageFile(cover.file, 'storefrontCover', slug || storefront?.id)).url : cover.url;
      if (cover.file) uploadedUrls.push(coverUrl);
      const input: StorefrontInput = { slug, headline, about, accentColor: accent, showWhatsapp: showWa, logoUrl, coverUrl };
      const r = await saveStorefront(input);
      if (r.error) {
        await cleanupUploadedImages(uploadedUrls);
        setError(r.error);
        setBusy(false);
        return;
      }
      await cleanupUploadedImages([logo.file ? logo.url : null, cover.file ? cover.url : null]);
      setLogo({ url: logoUrl });
      setCover({ url: coverUrl });
      if (r.slug) setSlug(r.slug);
      router.refresh();
      setBusy(false);
      if (openConfirmAfter) setShowConfirm(true);
    } catch (err) {
      await cleanupUploadedImages(uploadedUrls);
      setError(err instanceof Error ? err.message : 'Erro ao salvar.');
      setBusy(false);
    }
  }

  // ── Vitrine já ativa: apenas edição da aparência ──────────────────────
  if (active) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-success/40 bg-success/10 p-4">
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
        </div>

        <AppearanceFields
          slug={slug} setSlug={setSlug} lockSlug={!!storefront?.slug}
          headline={headline} setHeadline={setHeadline}
          about={about} setAbout={setAbout}
          accent={accent} setAccent={setAccent}
          showWa={showWa} setShowWa={setShowWa}
          logo={logo} setLogo={setLogo} cover={cover} setCover={setCover}
        />

        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="border-t border-border pt-4">
          <Button onClick={() => submit(false)} disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy ? 'Salvando…' : 'Salvar vitrine'}
          </Button>
        </div>
      </div>
    );
  }

  // ── Vitrine não ativa: fluxo guiado (plano → configuração → pagamento) ─
  return (
    <div className="space-y-6">
      {/* Passos */}
      <div className="flex items-center gap-2 text-sm">
        <StepPill n={1} label="Escolher plano" active={step === 'plano'} done={step === 'config'} />
        <div className="h-px flex-1 bg-border" />
        <StepPill n={2} label="Configurar" active={step === 'config'} done={false} />
        <div className="h-px flex-1 bg-border" />
        <StepPill n={3} label="Pagamento" active={false} done={false} />
      </div>

      {step === 'plano' ? (
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-1 flex items-center gap-2">
            <Store size={18} className="text-link" />
            <h2 className="font-bold">Escolha o período da vitrine</h2>
          </div>
          <p className="mb-4 text-sm text-muted">
            A vitrine é uma página própria com sua marca. Selecione por quanto tempo quer mantê-la ativa — você só paga depois de configurar.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {precos.map((p) => {
              const selected = days === p.dias;
              return (
                <button
                  key={p.dias}
                  type="button"
                  onClick={() => setDays(p.dias)}
                  className={`flex flex-col items-start rounded-xl border-2 p-4 text-left transition ${
                    selected ? 'border-primary bg-primary/5' : 'border-border bg-bg hover:border-primary/40'
                  }`}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className="text-sm font-bold">{p.label}</span>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? 'border-primary bg-primary text-on-primary' : 'border-border'}`}>
                      {selected && <Check size={12} strokeWidth={3} />}
                    </span>
                  </span>
                  <span className="mt-2 text-xl font-extrabold">{brl(p.preco)}</span>
                  <span className="text-xs text-muted">pagamento único</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={() => days && setStep('config')} disabled={!days} rounded="lg">
              Continuar <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm">
              Plano selecionado: <b>{selectedPreco?.label}</b> — {selectedPreco ? brl(selectedPreco.preco) : ''}
            </p>
            <button type="button" onClick={() => setStep('plano')} className="inline-flex items-center gap-1 text-sm font-semibold text-link">
              <ArrowLeft size={14} /> Trocar plano
            </button>
          </div>

          <AppearanceFields
            slug={slug} setSlug={setSlug} lockSlug={!!storefront?.slug}
            headline={headline} setHeadline={setHeadline}
            about={about} setAbout={setAbout}
            accent={accent} setAccent={setAccent}
            showWa={showWa} setShowWa={setShowWa}
            logo={logo} setLogo={setLogo} cover={cover} setCover={setCover}
          />

          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button variant="ghost" rounded="lg" onClick={() => setStep('plano')} disabled={busy}>
              <ArrowLeft size={16} /> Voltar
            </Button>
            <Button onClick={() => submit(true)} disabled={busy} rounded="lg">
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? 'Salvando…' : 'Salvar e continuar'}
            </Button>
          </div>
        </div>
      )}

      {/* Popup de confirmação → pagamento */}
      {showConfirm && selectedPreco && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowConfirm(false)}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
              <Check size={26} className="text-success" strokeWidth={3} />
            </div>
            <h2 className="text-lg font-bold">Sua vitrine foi configurada com sucesso</h2>
            <p className="mt-2 text-sm text-muted">
              Para ativá-la por <b>{selectedPreco.label}</b> ({brl(selectedPreco.preco)}), você será direcionado para a página de pagamento.
              Ao clicar no botão abaixo, você continuará para o pagamento do plano escolhido.
            </p>
            <form action={startStorefrontCheckout} className="mt-5">
              <input type="hidden" name="days" value={selectedPreco.dias} />
              <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover">
                <CreditCard size={16} /> Ir para pagamento
              </button>
            </form>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="mt-3 h-11 w-full rounded-full border border-border px-4 text-sm font-bold text-text hover:bg-bg"
            >
              Voltar e revisar
            </button>
            <p className="mt-3 text-xs text-muted">
              Sua configuração já está salva. Você pode voltar e concluir o pagamento depois.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function StepPill({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
        active ? 'bg-primary text-on-primary' : done ? 'bg-success text-white' : 'bg-border text-muted'
      }`}>
        {done ? <Check size={13} strokeWidth={3} /> : n}
      </span>
      <span className={`hidden text-xs font-semibold sm:inline ${active || done ? 'text-text' : 'text-muted'}`}>{label}</span>
    </div>
  );
}

// Campos de aparência da vitrine — reutilizados nos dois modos (ativa/fluxo).
function AppearanceFields(p: {
  slug: string; setSlug: (v: string) => void; lockSlug: boolean;
  headline: string; setHeadline: (v: string) => void;
  about: string; setAbout: (v: string) => void;
  accent: string; setAccent: (v: string) => void;
  showWa: boolean; setShowWa: (v: boolean) => void;
  logo: { url: string; file?: File }; setLogo: (v: { url: string; file?: File }) => void;
  cover: { url: string; file?: File }; setCover: (v: { url: string; file?: File }) => void;
}) {
  return (
    <div className="space-y-6">
      <Field label="Link da vitrine">
        <div className="flex rounded-lg border border-border bg-surface focus-within:border-primary">
          <span className="shrink-0 px-3 py-2.5 text-sm text-muted">/vitrine/</span>
          <input
            value={p.slug}
            onChange={(e) => p.setSlug(e.target.value)}
            disabled={p.lockSlug}
            placeholder="minha-imobiliaria"
            className="h-11 min-w-0 flex-1 bg-transparent px-0 pr-3 text-sm outline-none disabled:text-muted"
          />
        </div>
      </Field>
      <Field label="Chamada (headline)">
        <Input value={p.headline} onChange={(e) => p.setHeadline(e.target.value)} placeholder="Ex.: Os melhores imóveis de Conquista" />
      </Field>
      <Field label="Sobre / texto de apresentação">
        <textarea className="min-h-24 w-full rounded-lg border border-border bg-surface p-3 text-sm" value={p.about} onChange={(e) => p.setAbout(e.target.value)} />
      </Field>

      <div className="flex flex-wrap items-center gap-6">
        <Field label="Cor de destaque">
          <input type="color" value={p.accent} onChange={(e) => p.setAccent(e.target.value)} className="h-11 w-16 rounded-lg border border-border bg-surface" />
        </Field>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={p.showWa} onChange={(e) => p.setShowWa(e.target.checked)} /> Mostrar botão de WhatsApp
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        {([['Logo', p.logo, p.setLogo, 'h-32 w-32'], ['Capa', p.cover, p.setCover, 'h-32 w-full']] as const).map(
          ([label, st, setter, ratio]: any) => (
            <Field key={label} label={label}>
              <label className={`flex ${ratio} cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border text-xs text-muted hover:bg-bg`}>
                {st.file || st.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={st.file ? URL.createObjectURL(st.file) : st.url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-1"><ImagePlus size={18} /> Enviar</span>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => e.target.files?.[0] && setter({ url: st.url, file: e.target.files[0] })} />
              </label>
            </Field>
          ),
        )}
      </div>
    </div>
  );
}
