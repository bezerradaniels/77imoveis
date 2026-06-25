'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ImagePlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { saveCompany, type CompanyInput } from '@/app/painel/empresa/actions';
import { companyTypes } from '@/lib/constants';
import { Input, Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Opt = { id: string; name: string };

export function CompanyForm({
  cities,
  specialties,
  initial,
}: {
  cities: Opt[];
  specialties: Opt[];
  initial?: any;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [f, setF] = useState({
    type: initial?.type ?? '',
    tradeName: initial?.trade_name ?? '',
    legalName: initial?.legal_name ?? '',
    cnpj: initial?.cnpj ?? '',
    creci: initial?.creci ?? '',
    description: initial?.description ?? '',
    phone: initial?.phone ?? '',
    whatsapp: initial?.whatsapp ?? '',
    email: initial?.email ?? '',
    website: initial?.website ?? '',
    instagram: initial?.instagram ?? '',
    cityId: initial?.city_id ?? '',
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const [citySet, setCitySet] = useState<Set<string>>(
    new Set((initial?.company_cities ?? []).map((c: any) => c.city_id)),
  );
  const [specSet, setSpecSet] = useState<Set<string>>(
    new Set((initial?.company_specialties ?? []).map((s: any) => s.specialty_id)),
  );
  const [logo, setLogo] = useState<{ url: string; file?: File }>({ url: initial?.logo_url ?? '' });
  const [cover, setCover] = useState<{ url: string; file?: File }>({ url: initial?.cover_url ?? '' });

  const toggle = (setter: any) => (id: string) =>
    setter((s: Set<string>) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  async function upload(file: File) {
    const sb = createClient();
    const path = `empresa/${crypto.randomUUID()}.${file.name.split('.').pop() || 'jpg'}`;
    const { error } = await sb.storage.from('imoveis').upload(path, file);
    if (error) throw error;
    return sb.storage.from('imoveis').getPublicUrl(path).data.publicUrl;
  }

  async function submit() {
    setError('');
    if (!f.type || !f.tradeName.trim()) return setError('Informe o tipo e o nome da empresa.');
    setBusy(true);
    try {
      const logoUrl = logo.file ? await upload(logo.file) : logo.url;
      const coverUrl = cover.file ? await upload(cover.file) : cover.url;
      const input: CompanyInput = {
        id: initial?.id,
        ...f,
        logoUrl,
        coverUrl,
        cityIds: [...citySet],
        specialtyIds: [...specSet],
      };
      const r = await saveCompany(input);
      if (r.error) {
        setError(r.error);
        setBusy(false);
        return;
      }
      router.push(`/empresa/${r.slug}`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message?.includes('Bucket') ? 'Bucket "imoveis" ausente no Storage.' : 'Erro ao salvar.');
      setBusy(false);
    }
  }

  const sel = 'h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm';
  const ImgPick = ({ label, st, setter, ratio }: any) => (
    <Field label={label}>
      <label className={`flex ${ratio} cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border text-xs text-muted hover:bg-bg`}>
        {st.file || st.url ? (
          <img src={st.file ? URL.createObjectURL(st.file) : st.url} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1"><ImagePlus size={18} /> Enviar</span>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setter({ url: st.url, file: e.target.files[0] })} />
      </label>
    </Field>
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo">
          <select className={sel} value={f.type} onChange={(e) => set('type', e.target.value)}>
            <option value="">Selecione…</option>
            {companyTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Nome fantasia (exibido)">
          <Input value={f.tradeName} onChange={(e) => set('tradeName', e.target.value)} placeholder="Ex.: Imobiliária Conquista" />
        </Field>
        <Field label="Razão social (opcional)">
          <Input value={f.legalName} onChange={(e) => set('legalName', e.target.value)} />
        </Field>
        <Field label="CNPJ (opcional)">
          <Input value={f.cnpj} onChange={(e) => set('cnpj', e.target.value)} />
        </Field>
        <Field label="CRECI (opcional)">
          <Input value={f.creci} onChange={(e) => set('creci', e.target.value)} />
        </Field>
        <Field label="Cidade principal">
          <select className={sel} value={f.cityId} onChange={(e) => set('cityId', e.target.value)}>
            <option value="">Selecione…</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
      </section>

      <Field label="Descrição">
        <textarea className="min-h-24 w-full rounded-lg border border-border bg-surface p-3 text-sm" value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Conte sobre a empresa, área de atuação, diferenciais…" />
      </Field>

      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="WhatsApp"><Input value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="(77) 90000-0000" /></Field>
        <Field label="Telefone"><Input value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
        <Field label="E-mail"><Input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} /></Field>
        <Field label="Site"><Input value={f.website} onChange={(e) => set('website', e.target.value)} placeholder="https://" /></Field>
        <Field label="Instagram"><Input value={f.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@suaempresa" /></Field>
      </section>

      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <ImgPick label="Logo" st={logo} setter={setLogo} ratio="h-32 w-32" />
        <ImgPick label="Capa" st={cover} setter={setCover} ratio="h-32 w-full" />
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Cidades de atuação</h2>
        <div className="flex flex-wrap gap-2">
          {cities.map((c) => (
            <button key={c.id} type="button" onClick={() => toggle(setCitySet)(c.id)}
              className={citySet.has(c.id) ? 'rounded-full bg-primary px-3 py-1 text-sm text-white' : 'rounded-full border border-border px-3 py-1 text-sm hover:bg-bg'}>
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Especialidades</h2>
        <div className="flex flex-wrap gap-2">
          {specialties.map((s) => (
            <button key={s.id} type="button" onClick={() => toggle(setSpecSet)(s.id)}
              className={specSet.has(s.id) ? 'rounded-full bg-primary px-3 py-1 text-sm text-white' : 'rounded-full border border-border px-3 py-1 text-sm hover:bg-bg'}>
              {s.name}
            </button>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="border-t border-border pt-4">
        <Button onClick={submit} disabled={busy}>
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? 'Salvando…' : initial?.id ? 'Salvar empresa' : 'Criar empresa e virar profissional'}
        </Button>
      </div>
    </div>
  );
}
