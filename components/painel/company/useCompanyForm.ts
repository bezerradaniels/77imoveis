'use client';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { saveCompany, type CompanyInput } from '@/app/painel/empresa/actions';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics';

export const weekDays = [
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
] as const;

type Broker = { name: string; creci?: string; phone?: string; whatsapp?: string; photoUrl?: string; photoFile?: File };
type Img = { url: string; file?: File };
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const digits = (v: string) => v.replace(/\D/g, '');

function validUrl(value: string) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function useCompanyForm(initial?: any, opts?: { manageBrokers?: boolean }) {
  const manageBrokers = opts?.manageBrokers ?? true;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  let initialAddress = { cep: '', street: '', number: '', neighborhood: '' };
  if (initial?.address) {
    try {
      const parsed = JSON.parse(initial.address);
      initialAddress = {
        cep: parsed.cep ?? '',
        street: parsed.street ?? '',
        number: parsed.number ?? '',
        neighborhood: parsed.neighborhood ?? '',
      };
    } catch {
      initialAddress.street = initial.address;
    }
  }

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
    cep: initialAddress.cep,
    street: initialAddress.street,
    number: initialAddress.number,
    neighborhood: initialAddress.neighborhood,
  });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const [citySet, setCitySet] = useState<Set<string>>(
    new Set((initial?.company_cities ?? []).map((c: any) => c.city_id)),
  );
  const [specSet, setSpecSet] = useState<Set<string>>(
    new Set((initial?.company_specialties ?? []).map((s: any) => s.specialty_id)),
  );
  function toggleIn(setter: Dispatch<SetStateAction<Set<string>>>) {
    return (id: string) =>
      setter((s) => {
        const n = new Set(s);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
      });
  }
  const toggleCity = toggleIn(setCitySet);
  const toggleSpec = toggleIn(setSpecSet);

  const [logo, setLogo] = useState<Img>({ url: initial?.logo_url ?? '' });
  const [cover, setCover] = useState<Img>({ url: initial?.cover_url ?? '' });

  const [hours, setHours] = useState<Record<string, string>>(initial?.business_hours ?? {});
  const setHour = (day: string, value: string) => setHours((p) => ({ ...p, [day]: value }));

  const [brokers, setBrokers] = useState<Broker[]>(
    (initial?.brokers ?? []).map((b: any) => ({
      name: b.name,
      creci: b.creci ?? '',
      phone: b.phone ?? '',
      whatsapp: b.whatsapp ?? '',
      photoUrl: b.photo_url ?? '',
    })),
  );
  const addBroker = () => setBrokers((p) => [...p, { name: '' }]);
  const removeBroker = (idx: number) => setBrokers((p) => p.filter((_, i) => i !== idx));
  const updateBroker = (idx: number, patch: Partial<Broker>) =>
    setBrokers((p) => p.map((b, i) => (i === idx ? { ...b, ...patch } : b)));

  async function upload(file: File, prefix: string) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) throw new Error('Use imagens em JPG, PNG, WebP ou AVIF.');
    if (file.size > MAX_IMAGE_SIZE) throw new Error('Cada imagem precisa ter até 5 MB.');
    const sb = createClient();
    const path = `${prefix}/${crypto.randomUUID()}.${file.name.split('.').pop() || 'jpg'}`;
    const { error } = await sb.storage.from('imoveis').upload(path, file);
    if (error) throw error;
    return sb.storage.from('imoveis').getPublicUrl(path).data.publicUrl;
  }

  async function submit() {
    setError('');
    if (!f.type || !f.tradeName.trim()) return setError('Informe o tipo e o nome do perfil.');
    if (!f.whatsapp.trim() && !f.phone.trim() && !f.email.trim())
      return setError('Informe ao menos um contato: WhatsApp, telefone ou e-mail.');
    if (f.cnpj && digits(f.cnpj).length !== 14) return setError('Informe um CNPJ com 14 dígitos ou deixe em branco.');
    if (f.whatsapp && digits(f.whatsapp).length < 10) return setError('Informe um WhatsApp válido com DDD.');
    if (f.phone && digits(f.phone).length < 10) return setError('Informe um telefone válido com DDD.');
    if (f.email && !validEmail(f.email)) return setError('Informe um e-mail válido.');
    if (f.website && !validUrl(f.website)) return setError('Informe o site completo, começando com https://.');
    if (manageBrokers && brokers.some((b) => b.whatsapp && digits(b.whatsapp).length < 10))
      return setError('Informe um WhatsApp válido com DDD para os corretores ou deixe em branco.');
    setBusy(true);
    try {
      const logoUrl = logo.file ? await upload(logo.file, 'empresa') : logo.url;
      const coverUrl = cover.file ? await upload(cover.file, 'empresa') : cover.url;
      const resolvedBrokers = manageBrokers && f.type === 'imobiliaria'
        ? await Promise.all(
            brokers
              .filter((b) => b.name.trim())
              .map(async (b) => ({
                name: b.name.trim(),
                creci: b.creci,
                phone: b.phone,
                whatsapp: b.whatsapp,
                photoUrl: b.photoFile ? await upload(b.photoFile, 'corretores') : b.photoUrl,
              })),
          )
        : undefined;
      const { cep, street, number, neighborhood, ...cleanF } = f;
      const input: CompanyInput = {
        id: initial?.id,
        ...cleanF,
        address: JSON.stringify({ cep, street, number, neighborhood }),
        logoUrl,
        coverUrl,
        cityIds: [...citySet],
        specialtyIds: [...specSet],
        businessHours: hours,
        brokers: resolvedBrokers,
      };
      const r = await saveCompany(input);
      if (r.error) {
        setError(r.error);
        setBusy(false);
        return;
      }
      trackEvent(ANALYTICS_EVENTS.companyProfileUpdate, {
        company_type: f.type,
        form_mode: initial?.id ? 'edit' : 'create',
        section: 'company_form',
        source_component: 'useCompanyForm',
        success: true,
      });
      router.push(`/empresa/${r.slug}`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message?.includes('Bucket') ? 'Bucket "imoveis" ausente no Storage.' : 'Erro ao salvar.');
      setBusy(false);
    }
  }

  return {
    f, set,
    citySet, specSet, toggleCity, toggleSpec,
    logo, setLogo, cover, setCover, upload,
    hours, setHour,
    brokers, addBroker, removeBroker, updateBroker,
    busy, error, submit,
  };
}
