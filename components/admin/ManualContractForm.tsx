'use client';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Field } from '@/components/ui/Input';
import {
  adminCreateManualContract,
  adminUpdateManualContract,
  type CreateContractInput,
} from '@/app/admin/contratos/actions';
import { PAYMENT_METHOD_OPTIONS, PAYMENT_STATUS_OPTIONS } from './contract-ui';

type CompanyOption = { id: string; trade_name: string; type: string; cities?: { name: string } | null };
type CityOption = { id: string; name: string };

type ExistingContract = {
  id: string;
  plan_name: string;
  plan_type: string | null;
  max_active_listings: number;
  included_featured: number;
  duration_days: number;
  starts_at: string;
  ends_at: string;
  payment_method: string;
  payment_status: string;
  amount: number | null;
  auto_renew: boolean;
  city_scope: string[] | null;
  internal_notes: string | null;
  public_notes: string | null;
};

const DAY = 86_400_000;
const toDateInput = (iso: string) => new Date(iso).toISOString().slice(0, 10);
const todayInput = () => new Date().toISOString().slice(0, 10);
const addDaysInput = (dateStr: string, days: number) =>
  new Date(new Date(`${dateStr}T00:00:00`).getTime() + days * DAY).toISOString().slice(0, 10);

const selectClass =
  'h-11 w-full rounded-[10px] border border-border bg-white px-3 text-sm outline-none transition focus:ring-2 focus:ring-primary';

export function ManualContractForm({
  companies,
  cities,
  mode = 'create',
  contract,
  presetCompanyId,
  triggerLabel,
  triggerClassName,
}: {
  companies?: CompanyOption[];
  cities?: CityOption[];
  mode?: 'create' | 'edit';
  contract?: ExistingContract;
  presetCompanyId?: string;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState('');

  const init = useMemo(
    () => ({
      companyId: presetCompanyId ?? contract?.id ?? '',
      planName: contract?.plan_name ?? '',
      planType: contract?.plan_type ?? 'personalizado',
      maxActiveListings: String(contract?.max_active_listings ?? 30),
      includedFeatured: String(contract?.included_featured ?? 0),
      durationDays: String(contract?.duration_days ?? 30),
      startsAt: contract ? toDateInput(contract.starts_at) : todayInput(),
      endsAt: contract ? toDateInput(contract.ends_at) : addDaysInput(todayInput(), 30),
      paymentMethod: contract?.payment_method ?? 'pix',
      paymentStatus: contract?.payment_status ?? 'pendente',
      amount: contract?.amount != null ? String(contract.amount) : '',
      autoRenew: contract?.auto_renew ?? false,
      scheduled: false,
      cityScope: contract?.city_scope ?? [],
      internalNotes: contract?.internal_notes ?? '',
      publicNotes: contract?.public_notes ?? '',
    }),
    [contract, presetCompanyId],
  );

  const [form, setForm] = useState(init);
  const [companyId, setCompanyId] = useState(presetCompanyId ?? '');

  const set = <K extends keyof typeof init>(k: K, v: (typeof init)[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Recalcula o fim ao mudar início/duração (editável depois).
  const onDuration = (days: string) => {
    const n = Number(days);
    setForm((f) => ({ ...f, durationDays: days, endsAt: Number.isFinite(n) && n > 0 ? addDaysInput(f.startsAt, n) : f.endsAt }));
  };
  const onStart = (dateStr: string) => {
    const n = Number(form.durationDays);
    setForm((f) => ({ ...f, startsAt: dateStr, endsAt: Number.isFinite(n) && n > 0 ? addDaysInput(dateStr, n) : f.endsAt }));
  };

  const reset = () => {
    setForm(init);
    setCompanyId(presetCompanyId ?? '');
    setError('');
  };

  const submit = () =>
    start(async () => {
      setError('');
      const scheduled = form.scheduled && form.startsAt > todayInput();
      const payload: CreateContractInput = {
        companyId: mode === 'create' ? companyId : contract!.id, // (edit não usa companyId)
        planName: form.planName,
        planType: form.planType,
        maxActiveListings: Number(form.maxActiveListings),
        includedFeatured: Number(form.includedFeatured),
        cityScope: form.cityScope.length ? form.cityScope : null,
        durationDays: Number(form.durationDays),
        startsAt: new Date(`${form.startsAt}T00:00:00`).toISOString(),
        endsAt: new Date(`${form.endsAt}T23:59:59`).toISOString(),
        paymentMethod: form.paymentMethod,
        paymentStatus: form.paymentStatus,
        amount: form.amount ? Number(form.amount) : null,
        autoRenew: form.autoRenew,
        scheduled,
        internalNotes: form.internalNotes || null,
        publicNotes: form.publicNotes || null,
      };

      const res =
        mode === 'create'
          ? await adminCreateManualContract(payload)
          : await adminUpdateManualContract(contract!.id, {
              planName: payload.planName,
              planType: payload.planType,
              maxActiveListings: payload.maxActiveListings,
              includedFeatured: payload.includedFeatured,
              cityScope: payload.cityScope,
              durationDays: payload.durationDays,
              startsAt: payload.startsAt,
              endsAt: payload.endsAt,
              paymentMethod: payload.paymentMethod,
              paymentStatus: payload.paymentStatus,
              amount: payload.amount,
              autoRenew: payload.autoRenew,
              internalNotes: payload.internalNotes,
              publicNotes: payload.publicNotes,
            });

      if (res.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    });

  return (
    <>
      <button
        type="button"
        onClick={() => { reset(); setOpen(true); }}
        className={triggerClassName ?? 'inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-sm font-bold text-on-action hover:bg-action-hover'}
      >
        {mode === 'create' ? <Plus size={16} /> : <Pencil size={14} />}
        {triggerLabel ?? (mode === 'create' ? 'Novo contrato' : 'Editar')}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="h-full w-full max-w-lg overflow-y-auto bg-surface p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{mode === 'create' ? 'Novo contrato manual' : 'Editar contrato'}</h2>
              <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-text"><X size={20} /></button>
            </div>

            <div className="space-y-3">
              {mode === 'create' && !presetCompanyId && (
                <Field label="Cliente (empresa / corretor)">
                  <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={selectClass}>
                    <option value="">Selecione…</option>
                    {(companies ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.trade_name}{c.cities?.name ? ` — ${c.cities.name}` : ''}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nome do plano">
                  <Input value={form.planName} onChange={(e) => set('planName', e.target.value)} placeholder="Ex.: Plano Empresa Personalizado" />
                </Field>
                <Field label="Tipo do plano">
                  <Input value={form.planType} onChange={(e) => set('planType', e.target.value)} list="plan-types" placeholder="personalizado" />
                  <datalist id="plan-types">
                    <option value="personalizado" />
                    <option value="corretor" />
                    <option value="imobiliaria" />
                    <option value="construtora" />
                  </datalist>
                </Field>
                <Field label="Limite de imóveis ativos">
                  <Input type="number" min={0} value={form.maxActiveListings} onChange={(e) => set('maxActiveListings', e.target.value)} />
                </Field>
                <Field label="Destaques inclusos">
                  <Input type="number" min={0} value={form.includedFeatured} onChange={(e) => set('includedFeatured', e.target.value)} />
                </Field>
                <Field label="Duração (dias)">
                  <Input type="number" min={1} value={form.durationDays} onChange={(e) => onDuration(e.target.value)} />
                </Field>
                <Field label="Valor (R$, opcional)">
                  <Input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0,00" />
                </Field>
                <Field label="Início">
                  <Input type="date" value={form.startsAt} onChange={(e) => onStart(e.target.value)} />
                </Field>
                <Field label="Término (auto, editável)">
                  <Input type="date" value={form.endsAt} onChange={(e) => set('endsAt', e.target.value)} />
                </Field>
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

              {cities && cities.length > 0 && (
                <Field label="Cidades de acesso (opcional — vazio = todas)">
                  <select
                    multiple
                    value={form.cityScope}
                    onChange={(e) => set('cityScope', Array.from(e.target.selectedOptions, (o) => o.value))}
                    className="min-h-24 w-full rounded-[10px] border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  >
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
              )}

              <div className="flex flex-wrap gap-4 pt-1">
                {mode === 'create' && (
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={form.scheduled} onChange={(e) => set('scheduled', e.target.checked)} />
                    Agendar para a data de início (futura)
                  </label>
                )}
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={form.autoRenew} onChange={(e) => set('autoRenew', e.target.checked)} />
                  Renovação automática (comercial)
                </label>
              </div>

              <Field label="Observação interna (só admin)">
                <textarea
                  value={form.internalNotes}
                  onChange={(e) => set('internalNotes', e.target.value)}
                  rows={2}
                  className="w-full rounded-[10px] border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>
              <Field label="Observação pública (opcional)">
                <textarea
                  value={form.publicNotes}
                  onChange={(e) => set('publicNotes', e.target.value)}
                  rows={2}
                  className="w-full rounded-[10px] border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>

              {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancelar</Button>
                <Button onClick={submit} disabled={pending}>{pending ? 'Salvando…' : mode === 'create' ? 'Criar contrato' : 'Salvar alterações'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
