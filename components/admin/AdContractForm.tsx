'use client';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, X, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import { cleanupUploadedImages, uploadImageFile, validateImageFile } from '@/lib/images/client';
import { adminCreateAdContract, adminUpdateAdContract, type CreateAdInput } from '@/app/admin/publicidade/actions';
import { PAYMENT_METHOD_OPTIONS, PAYMENT_STATUS_OPTIONS } from './contract-ui';

type CompanyOption = { id: string; trade_name: string };
type CityOption = { id: string; name: string };
type ExistingAd = {
  id: string;
  internal_name: string | null;
  title: string | null;
  target_url: string;
  image_url: string;
  image_url_mobile: string | null;
  city_id: string | null;
  priority: number;
  duration_days: number | null;
  starts_at: string | null;
  ends_at: string | null;
  payment_method: string | null;
  payment_status: string;
  amount: number | null;
  auto_renew: boolean;
  internal_notes: string | null;
};

const DAY = 86_400_000;
const toDateInput = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
const todayInput = () => new Date().toISOString().slice(0, 10);
const addDaysInput = (dateStr: string, days: number) =>
  new Date(new Date(`${dateStr}T00:00:00`).getTime() + days * DAY).toISOString().slice(0, 10);
const selectClass = 'h-11 w-full rounded-[10px] border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary';

function ImagePicker({ label, current, onFile }: { label: string; current?: string | null; onFile: (f: File | null, preview: string) => void }) {
  const [preview, setPreview] = useState(current ?? '');
  return (
    <label className="flex min-h-28 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-bg text-sm text-muted hover:border-primary/50">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-28 w-full object-cover" />
      ) : (
        <span className="inline-flex items-center gap-2"><ImagePlus size={18} /> {label}</span>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          if (!file) return;
          const url = URL.createObjectURL(file);
          setPreview(url);
          onFile(file, url);
        }}
      />
    </label>
  );
}

export function AdContractForm({
  companies,
  cities,
  mode = 'create',
  ad,
  triggerLabel,
  triggerClassName,
}: {
  companies?: CompanyOption[];
  cities?: CityOption[];
  mode?: 'create' | 'edit';
  ad?: ExistingAd;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState('');

  const init = useMemo(
    () => ({
      companyId: '',
      internalName: ad?.internal_name ?? '',
      displayTitle: ad?.title ?? '',
      targetUrl: ad?.target_url ?? 'https://',
      cityId: ad?.city_id ?? '',
      priority: String(ad?.priority ?? 0),
      durationDays: String(ad?.duration_days ?? 30),
      startsAt: toDateInput(ad?.starts_at ?? null),
      endsAt: ad?.ends_at ? toDateInput(ad.ends_at) : addDaysInput(todayInput(), 30),
      paymentMethod: ad?.payment_method ?? 'pix',
      paymentStatus: ad?.payment_status ?? 'pendente',
      amount: ad?.amount != null ? String(ad.amount) : '',
      autoRenew: ad?.auto_renew ?? false,
      scheduled: false,
      internalNotes: ad?.internal_notes ?? '',
    }),
    [ad],
  );
  const [form, setForm] = useState(init);
  const [companyId, setCompanyId] = useState('');
  const [deskFile, setDeskFile] = useState<File | null>(null);
  const [mobFile, setMobFile] = useState<File | null>(null);
  const set = <K extends keyof typeof init>(k: K, v: (typeof init)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onDuration = (d: string) => {
    const n = Number(d);
    setForm((f) => ({ ...f, durationDays: d, endsAt: n > 0 ? addDaysInput(f.startsAt, n) : f.endsAt }));
  };
  const onStart = (s: string) => {
    const n = Number(form.durationDays);
    setForm((f) => ({ ...f, startsAt: s, endsAt: n > 0 ? addDaysInput(s, n) : f.endsAt }));
  };

  const reset = () => { setForm(init); setCompanyId(''); setDeskFile(null); setMobFile(null); setError(''); };

  const submit = () =>
    start(async () => {
      setError('');
      if (mode === 'create' && !deskFile) { setError('Envie a imagem desktop do banner.'); return; }
      const uploaded: string[] = [];
      try {
        let imageUrl = ad?.image_url ?? '';
        let imageUrlMobile: string | null = ad?.image_url_mobile ?? null;
        if (deskFile) { validateImageFile(deskFile); imageUrl = (await uploadImageFile(deskFile, 'banner')).url; uploaded.push(imageUrl); }
        if (mobFile) { validateImageFile(mobFile); imageUrlMobile = (await uploadImageFile(mobFile, 'banner')).url; uploaded.push(imageUrlMobile); }

        const scheduled = form.scheduled && form.startsAt > todayInput();
        const common = {
          internalName: form.internalName,
          displayTitle: form.displayTitle || null,
          targetUrl: form.targetUrl,
          imageUrl,
          imageUrlMobile,
          cityId: form.cityId || null,
          priority: Number(form.priority) || 0,
          durationDays: Number(form.durationDays),
          startsAt: new Date(`${form.startsAt}T00:00:00`).toISOString(),
          endsAt: new Date(`${form.endsAt}T23:59:59`).toISOString(),
          paymentMethod: form.paymentMethod,
          paymentStatus: form.paymentStatus,
          amount: form.amount ? Number(form.amount) : null,
          autoRenew: form.autoRenew,
          internalNotes: form.internalNotes || null,
        };
        const res =
          mode === 'create'
            ? await adminCreateAdContract({ ...common, companyId: companyId || null, scheduled } as CreateAdInput)
            : await adminUpdateAdContract(ad!.id, common);
        if (res.error) { await cleanupUploadedImages(uploaded); setError(res.error); return; }
        setOpen(false); reset(); router.refresh();
      } catch (err) {
        await cleanupUploadedImages(uploaded);
        setError(err instanceof Error ? err.message : 'Não foi possível salvar o anúncio.');
      }
    });

  return (
    <>
      <button
        type="button"
        onClick={() => { reset(); setOpen(true); }}
        className={triggerClassName ?? 'inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover'}
      >
        {mode === 'create' ? <Plus size={16} /> : <Pencil size={14} />}
        {triggerLabel ?? (mode === 'create' ? 'Novo anúncio' : 'Editar')}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setOpen(false)}>
          <div className="h-full w-full max-w-lg overflow-y-auto bg-surface p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{mode === 'create' ? 'Novo anúncio (carrossel)' : 'Editar anúncio'}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-text"><X size={20} /></button>
            </div>

            <div className="space-y-3">
              {mode === 'create' && (
                <Field label="Cliente (opcional)">
                  <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={selectClass}>
                    <option value="">— Sem vínculo —</option>
                    {(companies ?? []).map((c) => <option key={c.id} value={c.id}>{c.trade_name}</option>)}
                  </select>
                </Field>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nome interno do banner"><Input value={form.internalName} onChange={(e) => set('internalName', e.target.value)} placeholder="Ex.: Campanha Construtora X" /></Field>
                <Field label="Título de exibição (opcional)"><Input value={form.displayTitle} onChange={(e) => set('displayTitle', e.target.value)} /></Field>
              </div>
              <Field label="URL de destino"><Input value={form.targetUrl} onChange={(e) => set('targetUrl', e.target.value)} placeholder="https://…" /></Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-sm font-semibold">Imagem desktop (16:9)</p>
                  <ImagePicker label="Enviar imagem desktop" current={ad?.image_url} onFile={(f) => setDeskFile(f)} />
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-semibold">Imagem mobile (opcional)</p>
                  <ImagePicker label="Enviar imagem mobile" current={ad?.image_url_mobile} onFile={(f) => setMobFile(f)} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Cidade de exibição">
                  <select value={form.cityId} onChange={(e) => set('cityId', e.target.value)} className={selectClass}>
                    <option value="">Regional (home)</option>
                    {(cities ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Prioridade (maior = primeiro)"><Input type="number" value={form.priority} onChange={(e) => set('priority', e.target.value)} /></Field>
                <Field label="Duração (dias)"><Input type="number" min={1} value={form.durationDays} onChange={(e) => onDuration(e.target.value)} /></Field>
                <Field label="Valor (R$, opcional)"><Input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} /></Field>
                <Field label="Início"><Input type="date" value={form.startsAt} onChange={(e) => onStart(e.target.value)} /></Field>
                <Field label="Término (auto, editável)"><Input type="date" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} /></Field>
                <Field label="Forma de pagamento">
                  <select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)} className={selectClass}>
                    {PAYMENT_METHOD_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </Field>
                <Field label="Status de pagamento">
                  <select value={form.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value)} className={selectClass}>
                    {PAYMENT_STATUS_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </Field>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                {mode === 'create' && (
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={form.scheduled} onChange={(e) => set('scheduled', e.target.checked)} /> Agendar para a data de início
                  </label>
                )}
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={form.autoRenew} onChange={(e) => set('autoRenew', e.target.checked)} /> Renovação automática (comercial)
                </label>
              </div>

              <Field label="Observação interna">
                <textarea value={form.internalNotes} onChange={(e) => set('internalNotes', e.target.value)} rows={2} className="w-full rounded-[10px] border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" />
              </Field>

              {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancelar</Button>
                <Button onClick={submit} disabled={pending}>{pending ? 'Salvando…' : mode === 'create' ? 'Criar anúncio' : 'Salvar'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
