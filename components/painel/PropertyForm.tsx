'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { saveProperty, loadNeighborhoods, type PropertyInput } from '@/app/painel/actions';
import { Input, Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

type Opt = { id: string; name: string };
type Feature = { id: string; name: string; category: string | null };

const NEGOS = [
  { v: 'venda', label: 'Venda' },
  { v: 'aluguel', label: 'Aluguel (mês)' },
  { v: 'temporada', label: 'Temporada (diária)' },
  { v: 'romaria', label: 'Romaria (diária)' },
  { v: 'lancamento', label: 'Lançamento' },
];

type Neg = { on: boolean; price: string; sob: boolean };

export function PropertyForm({
  types,
  cities,
  features,
  initial,
}: {
  types: Opt[];
  cities: (Opt & { slug: string })[];
  features: Feature[];
  initial?: any;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [typeId, setTypeId] = useState(initial?.property_type_id ?? '');
  const [cityId, setCityId] = useState(initial?.city_id ?? '');
  const [hoods, setHoods] = useState<Opt[]>([]);
  const [neighborhoodId, setNeighborhoodId] = useState(initial?.neighborhood_id ?? '');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [rooms, setRooms] = useState({
    bedrooms: initial?.bedrooms ?? '',
    suites: initial?.suites ?? '',
    bathrooms: initial?.bathrooms ?? '',
    garages: initial?.garages ?? '',
  });
  const [areas, setAreas] = useState({ built: initial?.built_area ?? '', land: initial?.land_area ?? '' });

  const initNegs: Record<string, Neg> = Object.fromEntries(
    NEGOS.map((n) => {
      const ex = initial?.property_negotiations?.find((x: any) => x.negotiation === n.v);
      return [n.v, { on: !!ex, price: ex?.price?.toString() ?? '', sob: ex?.price_visibility === 'sob_consulta' }];
    }),
  );
  const [negs, setNegs] = useState<Record<string, Neg>>(initNegs);

  const [featSet, setFeatSet] = useState<Set<string>>(
    new Set((initial?.property_features ?? []).map((f: any) => f.feature_id)),
  );

  const [existing, setExisting] = useState<string[]>(
    [...(initial?.property_images ?? [])].sort((a: any, b: any) => a.sort - b.sort).map((i: any) => i.url),
  );
  const [files, setFiles] = useState<File[]>([]);

  // Carrega bairros quando a cidade muda.
  useEffect(() => {
    if (!cityId) return setHoods([]);
    loadNeighborhoods(cityId).then((h) => setHoods(h as Opt[]));
  }, [cityId]);

  const toggleFeat = (id: string) =>
    setFeatSet((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  async function uploadFiles(): Promise<string[]> {
    if (!files.length) return [];
    setUploading(true);
    try {
      const sb = createClient();
      const urls: string[] = [];
      for (const f of files) {
        const path = `${crypto.randomUUID()}.${f.name.split('.').pop() || 'jpg'}`;
        const { error } = await sb.storage.from('imoveis').upload(path, f, { cacheControl: '3600' });
        if (error) throw error;
        urls.push(sb.storage.from('imoveis').getPublicUrl(path).data.publicUrl);
      }
      return urls;
    } finally {
      setUploading(false);
    }
  }

  async function submit(publish: boolean) {
    setError('');
    if (!typeId || !cityId || !title.trim()) return setError('Preencha tipo, cidade e título.');
    const negotiations = NEGOS.filter((n) => negs[n.v].on).map((n) => ({
      negotiation: n.v,
      price: negs[n.v].sob ? null : Number(negs[n.v].price) || null,
      priceVisibility: (negs[n.v].sob ? 'sob_consulta' : 'publico') as 'publico' | 'sob_consulta',
    }));
    if (!negotiations.length) return setError('Escolha ao menos uma modalidade.');

    setSaving(true);
    try {
      let images: string[] = [...existing];
      if (files.length) images = [...images, ...(await uploadFiles())];

      const city = cities.find((c) => c.id === cityId);
      const input: PropertyInput = {
        id: initial?.id,
        title: title.trim(),
        description,
        typeId,
        cityId,
        citySlug: city?.slug ?? '',
        neighborhoodId: neighborhoodId || undefined,
        bedrooms: Number(rooms.bedrooms) || 0,
        suites: Number(rooms.suites) || 0,
        bathrooms: Number(rooms.bathrooms) || 0,
        garages: Number(rooms.garages) || 0,
        builtArea: areas.built ? Number(areas.built) : null,
        landArea: areas.land ? Number(areas.land) : null,
        negotiations,
        featureIds: [...featSet],
        images,
        publish,
      };
      const r = await saveProperty(input);
      if (r.error) {
        setError(r.error);
        setSaving(false);
        return;
      }
      router.push('/painel/imoveis');
      router.refresh();
    } catch (e: any) {
      setError(e?.message?.includes('Bucket') ? 'Crie o bucket público "imoveis" no Supabase Storage para enviar fotos.' : 'Erro ao salvar. Tente novamente.');
      setSaving(false);
    }
  }

  const sel = 'h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm';
  const byCat: Record<string, Feature[]> = {};
  features.forEach((f) => ((byCat[f.category ?? 'outros'] ??= []).push(f)));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Tipo de imóvel">
          <select className={sel} value={typeId} onChange={(e) => setTypeId(e.target.value)}>
            <option value="">Selecione…</option>
            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
        <Field label="Cidade">
          <select className={sel} value={cityId} onChange={(e) => { setCityId(e.target.value); setNeighborhoodId(''); }}>
            <option value="">Selecione…</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Bairro">
          <select className={sel} value={neighborhoodId} onChange={(e) => setNeighborhoodId(e.target.value)} disabled={!hoods.length}>
            <option value="">{hoods.length ? 'Selecione…' : 'Escolha a cidade'}</option>
            {hoods.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </Field>
      </section>

      <Field label="Título do anúncio">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Casa 3 quartos no Recreio com quintal" />
      </Field>
      <Field label="Descrição">
        <textarea
          className="min-h-28 w-full rounded-lg border border-border bg-surface p-3 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalhe o imóvel, diferenciais, localização…"
        />
      </Field>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([['bedrooms', 'Quartos'], ['suites', 'Suítes'], ['bathrooms', 'Banheiros'], ['garages', 'Vagas']] as const).map(([k, l]) => (
          <Field key={k} label={l}>
            <Input type="number" min={0} value={(rooms as any)[k]} onChange={(e) => setRooms({ ...rooms, [k]: e.target.value })} />
          </Field>
        ))}
        <Field label="Área construída (m²)">
          <Input type="number" min={0} value={areas.built} onChange={(e) => setAreas({ ...areas, built: e.target.value })} />
        </Field>
        <Field label="Área do terreno (m²)">
          <Input type="number" min={0} value={areas.land} onChange={(e) => setAreas({ ...areas, land: e.target.value })} />
        </Field>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Modalidades e preços</h2>
        <div className="space-y-2">
          {NEGOS.map((n) => {
            const st = negs[n.v];
            return (
              <div key={n.v} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
                <label className="inline-flex w-40 items-center gap-2 text-sm">
                  <input type="checkbox" checked={st.on} onChange={(e) => setNegs({ ...negs, [n.v]: { ...st, on: e.target.checked } })} />
                  {n.label}
                </label>
                {st.on && (
                  <>
                    <Input
                      type="number"
                      min={0}
                      className="w-40"
                      placeholder="Preço (R$)"
                      value={st.price}
                      disabled={st.sob}
                      onChange={(e) => setNegs({ ...negs, [n.v]: { ...st, price: e.target.value } })}
                    />
                    <label className="inline-flex items-center gap-2 text-sm text-muted">
                      <input type="checkbox" checked={st.sob} onChange={(e) => setNegs({ ...negs, [n.v]: { ...st, sob: e.target.checked } })} />
                      Sob consulta
                    </label>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-muted">A primeira modalidade marcada vira a principal (usada no card e na URL).</p>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Características</h2>
        {Object.entries(byCat).map(([cat, list]) => (
          <div key={cat} className="mb-3">
            <p className="mb-1 text-xs uppercase tracking-wide text-muted">{cat}</p>
            <div className="flex flex-wrap gap-2">
              {list.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFeat(f.id)}
                  className={featSet.has(f.id)
                    ? 'rounded-full bg-primary px-3 py-1 text-sm text-white'
                    : 'rounded-full border border-border px-3 py-1 text-sm hover:bg-bg'}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Fotos</h2>
        <div className="flex flex-wrap gap-2">
          {existing.map((url, i) => (
            <div key={url} className="relative h-24 w-32">
              <img src={url} alt="" className="h-full w-full rounded-lg object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 rounded bg-accent px-1.5 text-xs text-white">Capa</span>}
              <button type="button" onClick={() => setExisting(existing.filter((u) => u !== url))} className="absolute -right-1.5 -top-1.5 rounded-full bg-danger p-0.5 text-white">
                <X size={12} />
              </button>
            </div>
          ))}
          {files.map((f, i) => (
            <div key={i} className="relative h-24 w-32">
              <img src={URL.createObjectURL(f)} alt="" className="h-full w-full rounded-lg object-cover" />
              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute -right-1.5 -top-1.5 rounded-full bg-danger p-0.5 text-white">
                <X size={12} />
              </button>
            </div>
          ))}
          <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted hover:bg-bg">
            <ImagePlus size={18} /> Adicionar
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} />
          </label>
        </div>
      </section>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <Button onClick={() => submit(true)} disabled={saving || uploading}>
          {(saving || uploading) && <Loader2 size={16} className="animate-spin" />}
          {uploading ? 'Enviando fotos…' : saving ? 'Salvando…' : 'Publicar anúncio'}
        </Button>
        <Button variant="outline" onClick={() => submit(false)} disabled={saving || uploading}>
          Salvar rascunho
        </Button>
      </div>
    </div>
  );
}
