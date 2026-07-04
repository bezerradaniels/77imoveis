'use client';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle, ArrowLeft, Bath, BedDouble, Car, Check, ChevronLeft, ChevronRight, DoorOpen, Eye, EyeOff,
  Info, Loader2, MapPin, Minus, Pencil, Plus, Ruler, Sparkles, Upload, X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { brl } from '@/lib/format';
import { ANALYTICS_EVENTS, trackButtonClick, trackConversion, trackEvent } from '@/lib/analytics';
import { cleanupUploadedImages, uploadImageFile, validateImageFile } from '@/lib/images/client';
import { saveProperty, loadNeighborhoods, type PropertyInput } from '@/app/painel/actions';

type Opt = { id: string; name: string; slug?: string };
type TypeOpt = { id: string; name: string; slug: string };
type Feature = { id: string; name: string; slug?: string; category: string | null };
type Defaults = { name?: string; whatsapp?: string; email?: string };
type BrokerOpt = { id: string; name: string; email?: string; whatsapp?: string; phone?: string };
type ContactMethod = 'whatsapp' | 'telefone' | 'formulario';

const DRAFT_KEY = 'publicar_imovel_draft';

const STEPS = [
  { n: 1, label: 'Objetivo' }, { n: 2, label: 'Tipo' }, { n: 3, label: 'Local' }, { n: 4, label: 'Detalhes' },
  { n: 5, label: 'Preço' }, { n: 6, label: 'Fotos' }, { n: 7, label: 'Descrição' }, { n: 8, label: 'Contato' },
  { n: 9, label: 'Revisão' },
];
const TITLES: Record<number, string> = {
  1: 'O que você deseja anunciar?', 2: 'Qual o tipo do imóvel?', 3: 'Onde fica o imóvel?',
  4: 'Conte os principais detalhes', 5: 'Preço e condições', 6: 'Fotos e mídia',
  7: 'Descrição e diferenciais', 8: 'Contato e anunciante', 9: 'Revise antes de publicar',
};
const EYEBROWS: Record<number, string> = {
  1: 'Vamos começar pelo básico.', 2: 'Isso ajuda a classificar seu anúncio na busca.',
  3: 'A cidade e o bairro aparecem na busca e no anúncio.', 4: 'Quanto mais completo, mais contatos você recebe.',
  5: 'Defina os valores em reais (R$).', 6: 'Imóveis com boas fotos recebem mais contatos.',
  7: 'Capriche no texto — ou gere com IA.', 8: 'É assim que os interessados vão falar com você.',
  9: 'Confira tudo e publique seu imóvel.',
};

type Money = number | '';
type FormData = {
  negotiation: 'venda' | 'aluguel' | 'ambos' | null;
  propertyTypeId: string | null;
  cityId: string | null; neighborhoodId: string | null;
  street: string; number: string; complement: string; zipcode: string; hideExact: boolean;
  title: string; bedrooms: number; suites: number; bathrooms: number; garages: number;
  builtArea: string; landArea: string; floor: string; condoName: string;
  furnished: string | null; condition: string | null; availability: string;
  priceVisibility: 'publico' | 'sob_consulta';
  salePrice: Money; rentPrice: Money; condoFee: Money; iptu: Money;
  acceptsFinancing: boolean; acceptsMcmv: boolean; acceptsExchange: boolean; negotiable: boolean;
  videoUrl: string; tourUrl: string;
  shortDesc: string; fullDesc: string; amenities: string[]; nearby: string[];
  advName: string; companyName: string; whatsapp: string; phone: string;
  contactMethods: ContactMethod[]; contactPref: string; showPhone: boolean; leadEmail: string;
  brokerId: string | null;
};
type Photo = { id: string; url?: string; file?: File; preview?: string; low?: boolean };

function blank(defaults?: Defaults): FormData {
  return {
    negotiation: null, propertyTypeId: null, cityId: null, neighborhoodId: null,
    street: '', number: '', complement: '', zipcode: '', hideExact: false,
    title: '', bedrooms: 0, suites: 0, bathrooms: 0, garages: 0,
    builtArea: '', landArea: '', floor: '', condoName: '',
    furnished: null, condition: null, availability: 'disponivel',
    priceVisibility: 'publico', salePrice: '', rentPrice: '', condoFee: '', iptu: '',
    acceptsFinancing: false, acceptsMcmv: false, acceptsExchange: false, negotiable: true,
    videoUrl: '', tourUrl: '', shortDesc: '', fullDesc: '', amenities: [], nearby: [],
    advName: titleCaseWords(defaults?.name ?? ''), companyName: '', whatsapp: defaults?.whatsapp ?? '', phone: '',
    contactMethods: ['whatsapp'], contactPref: 'whatsapp', showPhone: true, leadEmail: defaults?.email ?? '',
    brokerId: null,
  };
}

function fromInitial(initial: any, defaults?: Defaults): FormData {
  const negs: any[] = initial.property_negotiations ?? [];
  const has = (k: string) => negs.some((n) => n.negotiation === k);
  const negotiation: FormData['negotiation'] = has('venda') && has('aluguel') ? 'ambos' : has('aluguel') ? 'aluguel' : 'venda';
  const priceOf = (k: string) => { const n = negs.find((x) => x.negotiation === k); return n && n.price != null ? Number(n.price) : ''; };
  const primary = negs.find((n) => n.is_primary) ?? negs[0];
  const contactMethods: ContactMethod[] = Array.isArray(initial.contact_methods) && initial.contact_methods.length
    ? initial.contact_methods
    : [initial.contact_pref ?? 'whatsapp'];
  return {
    ...blank(defaults),
    negotiation,
    propertyTypeId: initial.property_type_id ?? null,
    cityId: initial.city_id ?? null, neighborhoodId: initial.neighborhood_id ?? null,
    street: initial.street ?? '', number: initial.number ?? '', complement: initial.complement ?? '',
    zipcode: initial.zipcode ?? '', hideExact: !!initial.hide_exact_location,
    title: initial.title ?? '',
    bedrooms: initial.bedrooms ?? 0, suites: initial.suites ?? 0, bathrooms: initial.bathrooms ?? 0, garages: initial.garages ?? 0,
    builtArea: initial.built_area != null ? String(initial.built_area) : '',
    landArea: initial.land_area != null ? String(initial.land_area) : '',
    floor: initial.floor != null ? String(initial.floor) : '', condoName: initial.condo_name ?? '',
    furnished: initial.furnished ?? null, condition: initial.condition ?? null, availability: initial.availability ?? 'disponivel',
    priceVisibility: primary?.price_visibility === 'sob_consulta' ? 'sob_consulta' : 'publico',
    salePrice: priceOf('venda'), rentPrice: priceOf('aluguel'),
    condoFee: initial.condo_fee != null ? Number(initial.condo_fee) : '', iptu: initial.iptu != null ? Number(initial.iptu) : '',
    acceptsFinancing: !!initial.accepts_financing, acceptsMcmv: !!initial.accepts_mcmv, acceptsExchange: !!initial.accepts_exchange, negotiable: initial.negotiable !== false,
    videoUrl: initial.video_url ?? '', tourUrl: initial.tour_url ?? '',
    shortDesc: initial.short_description ?? '', fullDesc: initial.description ?? '',
    amenities: [], nearby: [], // preenchido depois pela divisão de features
    advName: titleCaseWords(initial.contact_name ?? defaults?.name ?? ''), companyName: titleCaseWords(initial.contact_company ?? ''),
    whatsapp: initial.contact_whatsapp ?? defaults?.whatsapp ?? '', phone: initial.contact_phone ?? '',
    contactMethods, contactPref: contactMethods[0] ?? 'whatsapp', showPhone: contactMethods.some((m) => m !== 'formulario'),
    leadEmail: initial.lead_email ?? initial.contact_email ?? defaults?.email ?? '',
    brokerId: initial.broker_id ?? null,
  };
}

const onlyDigits = (v: string) => v.replace(/\D/g, '');
function fmtPhone(v: string) {
  const x = onlyDigits(v).slice(0, 11);
  if (x.length > 7) return `(${x.slice(0, 2)}) ${x.slice(2, 7)}-${x.slice(7)}`;
  if (x.length > 2) return `(${x.slice(0, 2)}) ${x.slice(2)}`;
  return x;
}
function fmtLandline(v: string) {
  const x = onlyDigits(v).slice(0, 10);
  if (x.length > 6) return `(${x.slice(0, 2)}) ${x.slice(2, 6)}-${x.slice(6)}`;
  if (x.length > 2) return `(${x.slice(0, 2)}) ${x.slice(2)}`;
  return x;
}
function fmtCep(v: string) {
  const x = onlyDigits(v).slice(0, 8);
  return x.length > 5 ? `${x.slice(0, 5)}-${x.slice(5)}` : x;
}
const moneyText = (n: Money) => (n === '' ? '' : brl(n));
function titleCaseWords(v: string) {
  return v.toLocaleLowerCase('pt-BR').replace(/(^|[\s([{'"-])(\p{L})/gu, (_, p: string, ch: string) => p + ch.toLocaleUpperCase('pt-BR'));
}

export function PropertyForm({
  types, cities, features, initial, defaults, ownerType, brokers,
}: {
  types: TypeOpt[];
  cities: (Opt & { slug: string })[];
  features: Feature[];
  initial?: any;
  defaults?: Defaults;
  ownerType?: string;
  brokers?: BrokerOpt[];
}) {
  const router = useRouter();
  const isParticular = ownerType === 'particular';

  const amenityCatalog = useMemo(() => features.filter((f) => f.category !== 'proximidades'), [features]);
  const nearbyCatalog = useMemo(() => features.filter((f) => f.category === 'proximidades'), [features]);
  const featureById = useMemo(() => new Map(features.map((f) => [f.id, f])), [features]);
  const typeById = useMemo(() => new Map(types.map((t) => [t.id, t])), [types]);

  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(() => {
    if (initial) {
      const seeded = fromInitial(initial, defaults);
      const ids: string[] = (initial.property_features ?? []).map((f: any) => f.feature_id);
      seeded.amenities = ids.filter((id) => featureById.get(id)?.category !== 'proximidades');
      seeded.nearby = ids.filter((id) => featureById.get(id)?.category === 'proximidades');
      return seeded;
    }
    return blank(defaults);
  });
  const [photos, setPhotos] = useState<Photo[]>(() =>
    [...(initial?.property_images ?? [])].sort((a: any, b: any) => a.sort - b.sort).map((i: any) => ({ id: i.url, url: i.url })),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hoods, setHoods] = useState<Opt[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [savedTick, setSavedTick] = useState(0);
  const [planModal, setPlanModal] = useState(false);
  const [genBusy, setGenBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ slug?: string; status?: string } | null>(null);
  const savedId = useRef<string | undefined>(initial?.id);
  const savedImageUrls = useRef<string[]>(
    [...(initial?.property_images ?? [])].sort((a: any, b: any) => a.sort - b.sort).map((i: any) => i.url),
  );
  const drag = useRef<number | null>(null);
  const restored = useRef(false);

  const isEdit = !!initial?.id;
  const stepLabel = (n = step) => STEPS.find((s) => s.n === n)?.label ?? String(n);

  const analyticsBase = () => ({
    form_name: 'property_form',
    user_role: ownerType || 'unknown',
    property_type: typeName(data.propertyTypeId),
    city: cityName(data.cityId),
    state: 'BA',
    negotiation: data.negotiation ?? '',
    source_component: 'PropertyForm',
  });

  // Restaura rascunho local (apenas ao criar um anúncio novo).
  useEffect(() => {
    if (isEdit || restored.current) return;
    restored.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setData((d) => ({ ...d, ...JSON.parse(raw) }));
    } catch {}
  }, [isEdit]);

  useEffect(() => {
    trackEvent(isEdit ? ANALYTICS_EVENTS.propertyEditStart : ANALYTICS_EVENTS.propertyCreateStart, {
      ...analyticsBase(),
      step_name: stepLabel(1),
      step_number: 1,
      form_mode: isEdit ? 'edit' : 'create',
    });
    // Apenas na montagem do formulário.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.propertyCreateStepView, {
      ...analyticsBase(),
      step_name: stepLabel(),
      step_number: step,
      form_mode: isEdit ? 'edit' : 'create',
    });
    // step é o gatilho; os demais campos enriquecem o evento atual.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Autosave do rascunho local (texto; fotos vão só pro servidor ao salvar).
  useEffect(() => {
    if (isEdit) return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch {}
  }, [data, isEdit]);

  // Atualiza o "salvo há Xs" periodicamente.
  useEffect(() => {
    const iv = setInterval(() => setSavedTick((t) => t + 1), 5000);
    return () => clearInterval(iv);
  }, []);

  // Bairros da cidade selecionada.
  useEffect(() => {
    if (!data.cityId) { setHoods([]); return; }
    loadNeighborhoods(data.cityId).then((h) => setHoods(h as Opt[]));
  }, [data.cityId]);

  function up<K extends keyof FormData>(field: K, value: FormData[K]) {
    setData((d) => {
      const nd = { ...d, [field]: value };
      if (field === 'cityId') nd.neighborhoodId = null;
      return nd;
    });
    setSavedAt(Date.now());
    setErrors((e) => {
      const ne = { ...e }; delete ne[field as string];
      if (field === 'salePrice' || field === 'rentPrice') delete ne.price;
      if (['whatsapp', 'phone', 'leadEmail', 'contactMethods'].includes(field as string)) {
        delete ne.contact;
        delete ne.leadEmail;
      }
      return ne;
    });
  }
  const toggleArr = (field: 'amenities' | 'nearby', key: string) =>
    up(field, data[field].includes(key) ? data[field].filter((k) => k !== key) : [...data[field], key]);
  const money = (field: 'salePrice' | 'rentPrice' | 'condoFee' | 'iptu') => (v: string) => {
    const dg = onlyDigits(v); up(field, dg ? parseInt(dg, 10) : '');
  };
  function toggleContactMethod(value: ContactMethod) {
    setData((d) => {
      const contactMethods = d.contactMethods.includes(value)
        ? d.contactMethods.filter((m) => m !== value)
        : [...d.contactMethods, value];
      return {
        ...d,
        contactMethods,
        contactPref: contactMethods[0] ?? 'whatsapp',
        showPhone: contactMethods.some((m) => m !== 'formulario'),
      };
    });
    setSavedAt(Date.now());
    setErrors((e) => {
      const ne = { ...e };
      delete ne.contact;
      delete ne.leadEmail;
      return ne;
    });
  }

  // ---- lookups ----
  const typeName = (id: string | null) => (id ? typeById.get(id)?.name ?? '' : '');
  const typeSlug = (id: string | null) => (id ? typeById.get(id)?.slug ?? '' : '');
  const cityName = (id: string | null) => (id ? cities.find((c) => c.id === id)?.name ?? '' : '');
  const citySlug = (id: string | null) => (id ? cities.find((c) => c.id === id)?.slug ?? '' : '');
  const nbName = (id: string | null) => (id ? hoods.find((h) => h.id === id)?.name ?? '' : '');

  const slug = typeSlug(data.propertyTypeId);
  const showRooms = slug !== 'terreno' && slug !== 'lote';
  const showBuilt = showRooms;
  const showFloor = ['apartamento', 'cobertura', 'kitnet', 'condominio', 'sala-comercial'].includes(slug);
  const showCondo = ['apartamento', 'cobertura', 'kitnet', 'condominio'].includes(slug);
  const landLabel = ['terreno', 'lote', 'chacara', 'fazenda'].includes(slug) ? 'Área do terreno' : 'Área total';
  const includesVenda = data.negotiation === 'venda' || data.negotiation === 'ambos';
  const includesAluguel = data.negotiation === 'aluguel' || data.negotiation === 'ambos';

  // ---- derived preview ----
  const objWord = data.negotiation === 'aluguel' ? 'para alugar' : data.negotiation === 'ambos' ? 'à venda ou para alugar' : 'à venda';
  const negoBadge = data.negotiation === 'aluguel' ? 'Aluguel' : data.negotiation === 'ambos' ? 'Venda e aluguel' : 'Venda';
  function previewPrice() {
    if (data.priceVisibility === 'sob_consulta') return 'Preço sob consulta';
    if (data.negotiation === 'ambos') {
      const parts: string[] = [];
      if (data.salePrice !== '') parts.push(brl(data.salePrice));
      if (data.rentPrice !== '') parts.push(`${brl(data.rentPrice)}/mês`);
      return parts.length ? parts.join('  ·  ') : 'Definir valor';
    }
    if (data.negotiation === 'aluguel') return data.rentPrice !== '' ? `${brl(data.rentPrice)}/mês` : 'Definir valor';
    return data.salePrice !== '' ? brl(data.salePrice) : 'Definir valor';
  }
  const locText = [nbName(data.neighborhoodId), cityName(data.cityId)].filter(Boolean).join(', ');
  const seoTitle = `${typeName(data.propertyTypeId) || 'Imóvel'} ${objWord} em ${locText || 'Oeste da Bahia'} | 77imóveis`;
  const seoDesc = `${typeName(data.propertyTypeId) || 'Imóvel'}${data.bedrooms ? ` com ${data.bedrooms} quartos` : ''} ${objWord} em ${locText || 'Oeste da Bahia'}. Veja fotos, preço, localização e fale com o anunciante pelo 77imóveis.`;
  const seoSlug = '/imovel/' + ([typeName(data.propertyTypeId), data.bedrooms ? `${data.bedrooms}-quartos` : '', nbName(data.neighborhoodId), cityName(data.cityId)]
    .filter(Boolean).join('-').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'novo-imovel');

  // ---- validation ----
  function validate(s: number): Record<string, string> {
    const e: Record<string, string> = {};
    if (s === 1 && !data.negotiation) e.negotiation = 'Escolha o que deseja fazer com o imóvel.';
    if (s === 2 && !data.propertyTypeId) e.propertyType = 'Selecione o tipo de imóvel.';
    if (s === 3) { if (!data.cityId) e.city = 'Selecione a cidade.'; if (!data.neighborhoodId) e.neighborhood = 'Selecione o bairro.'; }
    if (s === 4 && !data.title.trim()) e.title = 'Dê um título ao seu anúncio.';
    if (s === 5 && !(data.priceVisibility === 'sob_consulta' || data.salePrice !== '' || data.rentPrice !== ''))
      e.price = 'Informe um valor ou escolha “Preço sob consulta”.';
    if (s === 6 && !photos.length) e.photos = 'Adicione pelo menos uma foto do imóvel.';
    if (s === 8) {
      if (!data.advName.trim()) e.advName = 'Informe o nome para contato.';
      if (!data.contactMethods.length) e.contact = 'Escolha ao menos uma forma de contato.';
      if (data.contactMethods.includes('whatsapp') && !data.whatsapp) e.contact = 'Informe o WhatsApp para exibir esse contato.';
      if (data.contactMethods.includes('telefone') && !data.phone) e.contact = 'Informe o telefone para exibir esse contato.';
      if (data.contactMethods.includes('formulario') && !data.leadEmail) e.leadEmail = 'Informe o e-mail para receber os leads do formulário.';
      if (data.leadEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.leadEmail)) e.leadEmail = 'E-mail inválido.';
    }
    return e;
  }

  function goNext() {
    const e = validate(step);
    if (Object.keys(e).length) {
      trackEvent(ANALYTICS_EVENTS.propertyCreateValidationError, {
        ...analyticsBase(),
        step_name: stepLabel(),
        step_number: step,
        error_type: Object.keys(e).join(','),
      });
      setErrors(e);
      return;
    }
    trackEvent(ANALYTICS_EVENTS.propertyCreateStepComplete, {
      ...analyticsBase(),
      step_name: stepLabel(),
      step_number: step,
    });
    setStep((s) => Math.min(9, s + 1)); setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function goBack() { setStep((s) => Math.max(1, s - 1)); setErrors({}); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function goStep(n: number) { setStep(n); setErrors({}); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  // ---- photos ----
  function onFiles(files: FileList | null) {
    const selected = Array.from(files ?? []);
    if (selected.length) {
      trackButtonClick({
        button_id: 'property_photo_upload_button',
        button_text: 'Enviar fotos',
        button_location: 'property_form_step_photos',
        section: 'property_form',
      });
    }
    selected.forEach((file) => {
      try {
        validateImageFile(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Use fotos em JPG, PNG, WebP ou AVIF.');
        return;
      }
      const preview = URL.createObjectURL(file);
      const id = 'p' + Date.now() + Math.random().toString(36).slice(2, 6);
      const img = new Image();
      img.onload = () => setPhotos((ps) => ps.map((p) => (p.id === id ? { ...p, low: img.naturalWidth < 800 } : p)));
      img.src = preview;
      setPhotos((ps) => [...ps, { id, file, preview }]);
    });
    setErrors((e) => { const ne = { ...e }; delete ne.photos; return ne; });
    setSavedAt(Date.now());
  }
  const removePhoto = (id: string) => {
    trackEvent(ANALYTICS_EVENTS.dashboardPhotoDelete, {
      ...analyticsBase(),
      section: 'property_form',
      photo_count: photos.length,
    });
    setPhotos((ps) => ps.filter((p) => p.id !== id));
  };
  const makeCover = (id: string) => setPhotos((ps) => { const i = ps.findIndex((p) => p.id === id); if (i <= 0) return ps; const c = [...ps]; const [x] = c.splice(i, 1); c.unshift(x); return c; });
  const reorder = (from: number, to: number) => setPhotos((ps) => { const c = [...ps]; const [x] = c.splice(from, 1); c.splice(to, 0, x); return c; });

  // ---- AI description (gerada localmente a partir do que já foi preenchido) ----
  function genDesc() {
    setGenBusy(true);
    setTimeout(() => {
      const t = typeName(data.propertyTypeId) || 'Imóvel';
      const loc = locText || 'região';
      const bits: string[] = [];
      let head = t + (data.bedrooms ? ` com ${data.bedrooms} ${data.bedrooms > 1 ? 'quartos' : 'quarto'}` : '');
      if (data.suites) head += ` (${data.suites} ${data.suites > 1 ? 'suítes' : 'suíte'})`;
      head += ` em ${loc}.`;
      bits.push(head[0].toUpperCase() + head.slice(1));
      const specs: string[] = [];
      if (data.bathrooms) specs.push(`${data.bathrooms} ${data.bathrooms > 1 ? 'banheiros' : 'banheiro'}`);
      if (data.garages) specs.push(`${data.garages} ${data.garages > 1 ? 'vagas de garagem' : 'vaga de garagem'}`);
      if (data.builtArea) specs.push(`${data.builtArea} m² construídos`);
      if (data.landArea) specs.push(`${data.landArea} m² de terreno`);
      if (specs.length) bits.push(`Conta com ${specs.join(', ')}.`);
      const cm: Record<string, string> = { novo: 'Imóvel novo, pronto para você.', usado: 'Imóvel em ótimo estado de conservação.', em_construcao: 'Em construção, com entrega prevista.', reformado: 'Recém-reformado, sem nada para mexer.' };
      if (data.condition && cm[data.condition]) bits.push(cm[data.condition]);
      const am = data.amenities.map((s) => featureById.get(s)?.name).filter(Boolean) as string[];
      if (am.length) bits.push(`Diferenciais: ${am.slice(0, 6).join(', ')}.`);
      const nb = data.nearby.map((s) => featureById.get(s)?.name).filter(Boolean) as string[];
      if (nb.length) bits.push(`Localização privilegiada, próximo a ${nb.slice(0, 5).join(', ')}.`);
      bits.push(data.negotiation === 'aluguel' ? 'Agende uma visita e alugue já.' : data.negotiation === 'ambos' ? 'Disponível para venda ou locação — fale com o anunciante.' : 'Agende sua visita e garanta seu novo endereço.');
      const full = bits.join(' ');
      const shortD = data.shortDesc || `${t}${data.bedrooms ? ` com ${data.bedrooms} quartos` : ''} em ${loc}`.slice(0, 120);
      setData((d) => ({ ...d, fullDesc: full, shortDesc: shortD }));
      setGenBusy(false); setSavedAt(Date.now());
    }, 650);
  }

  // ---- persistence ----
  async function uploadPhotos(): Promise<{ urls: string[]; uploadedUrls: string[] }> {
    const urls: string[] = [];
    const uploadedUrls: string[] = [];
    try {
      for (const p of photos) {
        if (p.url) { urls.push(p.url); continue; }
        if (!p.file) continue;
        const uploaded = await uploadImageFile(p.file, 'property', savedId.current);
        urls.push(uploaded.url);
        uploadedUrls.push(uploaded.url);
        trackEvent(ANALYTICS_EVENTS.dashboardPhotoUpload, {
          ...analyticsBase(),
          section: 'property_form',
          success: true,
        });
      }
    } catch (err) {
      await cleanupUploadedImages(uploadedUrls);
      throw err;
    }
    return { urls, uploadedUrls };
  }

  function buildNegotiations(): PropertyInput['negotiations'] {
    const vis = data.priceVisibility;
    const make = (
      negotiation: PropertyInput['negotiations'][number]['negotiation'],
      price: Money,
    ): PropertyInput['negotiations'][number] => ({
      negotiation,
      price: vis === 'sob_consulta' ? null : price === '' ? null : Number(price),
      priceVisibility: vis,
    });
    if (data.negotiation === 'ambos') return [make('venda', data.salePrice), make('aluguel', data.rentPrice)];
    if (data.negotiation === 'aluguel') return [make('aluguel', data.rentPrice)];
    return [make('venda', data.salePrice)];
  }

  async function persist(publish: boolean) {
    setError('');
    const wasNew = !savedId.current;
    const { urls: images, uploadedUrls } = await uploadPhotos();
    const input: PropertyInput = {
      id: savedId.current,
      title: data.title.trim() || 'Anúncio sem título',
      description: data.fullDesc, shortDescription: data.shortDesc,
      typeId: data.propertyTypeId!, cityId: data.cityId!, citySlug: citySlug(data.cityId),
      neighborhoodId: data.neighborhoodId || undefined,
      street: data.street, number: data.number, complement: data.complement, zipcode: data.zipcode, hideExactLocation: data.hideExact,
      bedrooms: showRooms ? data.bedrooms : 0, suites: showRooms ? data.suites : 0,
      bathrooms: showRooms ? data.bathrooms : 0, garages: showRooms ? data.garages : 0,
      builtArea: data.builtArea ? Number(data.builtArea.replace(',', '.')) : null,
      landArea: data.landArea ? Number(data.landArea.replace(',', '.')) : null,
      floor: data.floor ? Number(data.floor) : null, condoName: data.condoName,
      furnished: data.furnished, condition: data.condition, availability: data.availability,
      condoFee: data.condoFee === '' ? null : Number(data.condoFee), iptu: data.iptu === '' ? null : Number(data.iptu),
      acceptsFinancing: data.acceptsFinancing, acceptsMcmv: data.acceptsMcmv, acceptsExchange: data.acceptsExchange, negotiable: data.negotiable,
      videoUrl: data.videoUrl, tourUrl: data.tourUrl,
      contactName: data.advName, contactCompany: data.companyName, contactWhatsapp: data.whatsapp,
      contactPhone: data.phone, contactEmail: data.leadEmail, contactMethods: data.contactMethods,
      contactPref: data.contactPref, showPhone: data.showPhone, leadEmail: data.leadEmail,
      brokerId: data.brokerId,
      negotiations: buildNegotiations(),
      featureIds: [...data.amenities, ...data.nearby],
      images, publish,
    };
    const r = await saveProperty(input);
    if (r.error) {
      await cleanupUploadedImages(uploadedUrls);
      throw new Error(r.error);
    }
    savedId.current = r.id;
    const params = {
      ...analyticsBase(),
      property_status: r.status,
      publish,
      success: true,
      photo_count: images.length,
    };
    if (wasNew) trackConversion(ANALYTICS_EVENTS.propertyCreateComplete, params);
    else trackEvent(ANALYTICS_EVENTS.propertyEditComplete, params);
    if (publish) {
      trackConversion(ANALYTICS_EVENTS.propertyPublishComplete, params);
      trackEvent(ANALYTICS_EVENTS.dashboardPropertyPublish, params);
    }
    await cleanupUploadedImages(savedImageUrls.current.filter((url) => !images.includes(url)));
    savedImageUrls.current = images;
    setPhotos(images.map((url) => ({ id: url, url })));
    return r;
  }

  async function saveDraft() {
    if (!data.cityId || !data.propertyTypeId || !data.negotiation) {
      setError('Escolha ao menos objetivo, tipo e cidade para salvar o rascunho.');
      return;
    }
    setBusy(true);
    try {
      trackEvent(ANALYTICS_EVENTS.propertyCreateSubmit, {
        ...analyticsBase(),
        form_mode: isEdit ? 'edit' : 'create',
        publish: false,
      });
      await persist(false);
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setSavedAt(Date.now());
      setError('');
    } catch (e: any) {
      setError(uploadMsg(e?.message));
    } finally { setBusy(false); }
  }

  async function publish() {
    const all: Record<string, string> = {};
    [1, 2, 3, 4, 5, 6, 8].forEach((s) => Object.assign(all, validate(s)));
    if (Object.keys(all).length) { setErrors(all); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setBusy(true);
    try {
      trackEvent(ANALYTICS_EVENTS.propertyCreateSubmit, {
        ...analyticsBase(),
        form_mode: isEdit ? 'edit' : 'create',
        publish: true,
      });
      const r = await persist(true);
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setSuccess({ slug: r.slug, status: r.status });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setError(uploadMsg(e?.message));
    } finally { setBusy(false); }
  }

  function uploadMsg(msg?: string) {
    if (msg?.includes('Bucket')) return 'Crie o bucket público "imoveis" no Supabase Storage para enviar fotos.';
    return msg || 'Não foi possível salvar. Tente novamente.';
  }

  // ---- saved label ----
  void savedTick;
  let savedLabel = '';
  if (savedAt) {
    const diff = Math.round((Date.now() - savedAt) / 1000);
    savedLabel = diff < 5 ? 'Rascunho salvo agora' : diff < 60 ? `Rascunho salvo há ${diff}s` : `Rascunho salvo há ${Math.round(diff / 60)} min`;
  }

  const coverPhoto = photos[0];
  const coverSrc = coverPhoto?.url ?? coverPhoto?.preview;
  const showPreview = step >= 2 && step <= 8;
  const pvSpecs: { icon: ReactNode; v: string; l: string }[] = [];
  if (showRooms) {
    if (data.bedrooms) pvSpecs.push({ icon: <BedDouble size={15} />, v: String(data.bedrooms), l: 'quartos' });
    if (data.bathrooms) pvSpecs.push({ icon: <Bath size={15} />, v: String(data.bathrooms), l: 'banh.' });
    if (data.garages) pvSpecs.push({ icon: <Car size={15} />, v: String(data.garages), l: 'vagas' });
  }
  if (data.builtArea) pvSpecs.push({ icon: <Ruler size={15} />, v: `${data.builtArea} m²`, l: 'const.' });
  else if (data.landArea) pvSpecs.push({ icon: <Ruler size={15} />, v: `${data.landArea} m²`, l: 'terreno' });

  // ---- review / missing ----
  const missing: { msg: string; step: number }[] = [];
  [1, 2, 3, 4, 5, 6, 8].forEach((s) => { const e = validate(s); Object.values(e).forEach((msg) => missing.push({ msg, step: s })); });
  const reviewSections = [
    { title: 'Objetivo', step: 1, value: negoBadge },
    { title: 'Tipo de imóvel', step: 2, value: typeName(data.propertyTypeId) || '—' },
    { title: 'Localização', step: 3, value: locText || '—' },
    { title: 'Detalhes', step: 4, value: (data.title || 'Sem título') + (showRooms && (data.bedrooms || data.bathrooms) ? ` · ${[data.bedrooms ? `${data.bedrooms}q` : '', data.bathrooms ? `${data.bathrooms}b` : ''].filter(Boolean).join(' ')}` : '') },
    { title: 'Preço', step: 5, value: previewPrice() },
    { title: 'Fotos', step: 6, value: photos.length ? `${photos.length} ${photos.length > 1 ? 'fotos' : 'foto'}` : 'Nenhuma foto' },
    { title: 'Descrição e diferenciais', step: 7, value: (data.fullDesc ? `${data.fullDesc.length} caracteres` : 'Sem descrição') + (data.amenities.length ? ` · ${data.amenities.length} diferenciais` : '') },
    { title: 'Contato', step: 8, value: (data.advName || '—') + (data.whatsapp ? ` · ${data.whatsapp}` : data.leadEmail ? ` · ${data.leadEmail}` : '') },
  ];

  // ---- shared classes ----
  const inputCls = 'h-11 w-full rounded-[11px] border border-border bg-surface px-3 text-[14.5px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';
  const taCls = 'w-full resize-y rounded-[11px] border border-border bg-surface p-3 text-[14.5px] leading-relaxed outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';
  const bigCard = (sel: boolean) => cn('flex min-h-14 w-full items-center gap-2.5 rounded-2xl border px-4 py-3 text-left transition', sel ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary');
  const typeCard = (sel: boolean) => cn('flex min-h-14 items-center gap-2.5 rounded-2xl border px-4 py-3 text-left transition', sel ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary');
  const chipCls = (sel: boolean) => cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition', sel ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface text-text hover:border-primary');
  const contactOptionCls = (sel: boolean) => cn('flex min-h-12 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition', sel ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface text-text hover:border-primary');
  const Radial = ({ sel }: { sel: boolean }) => (
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
        sel ? 'border-primary bg-primary text-on-primary' : 'border-border bg-surface',
      )}
    >
      {sel && <Check size={13} strokeWidth={3} />}
    </span>
  );

  const Lbl = ({ children, hint }: { children: ReactNode; hint?: 'req' | 'opt' }) => (
    <span className="mb-1.5 block text-[13px] font-semibold">
      {children} {hint === 'req' && <span className="text-danger">*</span>}
      {hint === 'opt' && <span className="font-medium text-muted">(opcional)</span>}
    </span>
  );
  const Err = ({ msg }: { msg?: string }) => msg ? <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger">{msg}</p> : null;
  const Switch = ({ on }: { on: boolean }) => (
    <span className={cn('relative inline-block h-[25px] w-[42px] shrink-0 rounded-full transition', on ? 'bg-primary' : 'bg-border')}>
      <span className={cn('absolute top-[3px] h-[19px] w-[19px] rounded-full bg-white shadow transition-all', on ? 'left-5' : 'left-[3px]')} />
    </span>
  );

  const PILLS = {
    furnished: [{ k: 'sim', l: 'Sim' }, { k: 'nao', l: 'Não' }, { k: 'parcial', l: 'Parcialmente' }],
    condition: [{ k: 'novo', l: 'Novo' }, { k: 'usado', l: 'Usado' }, { k: 'em_construcao', l: 'Em construção' }, { k: 'reformado', l: 'Reformado' }],
    availability: [{ k: 'disponivel', l: 'Disponível' }, { k: 'reservado', l: 'Reservado' }, { k: 'vendido', l: 'Vendido' }, { k: 'alugado', l: 'Alugado' }],
  };
  const SelectGroup = ({ field, placeholder = 'Selecione' }: { field: 'furnished' | 'condition' | 'availability'; placeholder?: string }) => (
    <select className={inputCls} value={data[field] ?? ''} onChange={(e) => up(field, (e.target.value || null) as any)}>
      <option value="">{placeholder}</option>
      {PILLS[field].map((o) => <option key={o.k} value={o.k}>{o.l}</option>)}
    </select>
  );
  const ContactOptionGroup = () => (
    <div className="grid gap-2.5 sm:grid-cols-3">
      {([
        { k: 'whatsapp', l: 'WhatsApp' },
        { k: 'telefone', l: 'Telefone' },
        { k: 'formulario', l: 'Formulário' },
      ] as const).map((o) => {
        const sel = data.contactMethods.includes(o.k);
        return (
          <button key={o.k} type="button" onClick={() => toggleContactMethod(o.k)} aria-pressed={sel} className={contactOptionCls(sel)}>
            <Radial sel={sel} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{o.l}</span>
          </button>
        );
      })}
    </div>
  );

  const livePreview = (compact: boolean) => (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      {compact && <div className="border-b border-border px-3.5 py-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted">Prévia do anúncio</div>}
      <div className="relative" style={{ height: compact ? 160 : 190, background: 'repeating-linear-gradient(135deg,var(--subtle) 0 14px,var(--border) 14px 28px)' }}>
        {coverSrc && (
          // Prévia da capa: pode ser blob (URL.createObjectURL) — next/image não lida com blob:.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverSrc} alt="" className="h-full w-full object-cover" />
        )}
        <span className="absolute left-3 top-3 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">{negoBadge}</span>
        {!coverSrc && <span className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted">capa do anúncio</span>}
      </div>
      <div className="p-4">
        <div className="text-[11.5px] font-semibold uppercase tracking-wide text-primary">{typeName(data.propertyTypeId) || 'Tipo do imóvel'}</div>
        <div className="mt-0.5 text-[15px] font-bold leading-tight">{data.title || 'Título do seu anúncio'}</div>
        <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted"><MapPin size={14} />{locText || 'Cidade · Bairro'}</div>
        <div className="mt-2 text-lg font-bold tabular-nums">{previewPrice()}</div>
        {pvSpecs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3">
            {pvSpecs.map((sp, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[12.5px] font-semibold"><span className="text-primary">{sp.icon}</span>{sp.v}{!compact && <span className="font-normal text-muted">{sp.l}</span>}</span>
            ))}
          </div>
        )}
        {!compact && data.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.amenities.slice(0, 6).map((s) => <span key={s} className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-[11.5px] text-primary">{featureById.get(s)?.name}</span>)}
          </div>
        )}
        {compact && <div className="mt-3 text-[11.5px] leading-relaxed text-muted">A prévia atualiza conforme você preenche o anúncio.</div>}
      </div>
    </div>
  );

  // ---- success overlay ----
  if (success) {
    return (
      <div className="mx-auto max-w-lg px-5 py-12 text-center">
        <div className="mx-auto mb-5 flex h-[74px] w-[74px] items-center justify-center rounded-full bg-primary/10 text-primary"><Check size={32} /></div>
        <span className="inline-block rounded-full border border-warning/30 bg-warning/10 px-3 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-warning">
          {success.status === 'ativo' ? 'Publicado' : 'Em análise'}
        </span>
        <h2 className="mt-4 text-2xl font-bold leading-tight">Seu anúncio foi enviado com sucesso!</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          {success.status === 'ativo'
            ? 'Seu anúncio já está publicado no portal. Você pode vê-lo agora ou gerenciar seus anúncios.'
            : 'Seu anúncio foi enviado para análise. Você será avisado por e-mail e WhatsApp assim que ele estiver publicado no portal.'}
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          {success.status === 'ativo' && success.slug && (
            <Link href={`/imovel/${success.slug}`} className="flex h-12 items-center justify-center rounded-xl bg-action text-[14.5px] font-semibold text-on-action hover:bg-action-hover">Ver página do imóvel</Link>
          )}
          <Link href="/painel/imoveis" className="flex h-12 items-center justify-center rounded-xl border border-border bg-surface text-sm font-semibold">Gerenciar meus anúncios</Link>
          <button type="button" onClick={() => { setSuccess(null); setData(blank(defaults)); setPhotos([]); setStep(1); savedId.current = undefined; }} className="h-11 rounded-xl text-sm font-semibold text-primary">Publicar outro imóvel</button>
        </div>
        {isParticular && (
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-left text-[12.5px] leading-relaxed">
            Este é seu imóvel ativo gratuito. Quer destacar nos resultados ou anunciar mais imóveis? <strong className="text-primary">Conheça os planos para empresas.</strong>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-10 pt-4">
      <Link href="/painel/imoveis" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text"><ArrowLeft size={15} /> Meus imóveis</Link>

      {/* progresso */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center justify-center gap-3 sm:gap-4">
            {STEPS.map((s) => {
              const done = s.n < step, cur = s.n === step;
              return (
                <button
                  key={s.n}
                  type="button"
                  aria-label={`Ir para ${s.label}`}
                  onClick={() => (done ? goStep(s.n) : undefined)}
                  disabled={!done}
                  className={cn(
                    'h-3 w-3 rounded-full transition sm:h-3.5 sm:w-3.5',
                    done && 'bg-primary hover:scale-110',
                    cur && 'bg-primary ring-4 ring-primary/20',
                    !done && !cur && 'bg-border',
                  )}
                />
              );
            })}
          </div>
          {savedLabel && <span className="hidden text-xs text-muted sm:block">{savedLabel}</span>}
        </div>
      </div>

      {/* título */}
      <div className="mb-4 mt-5">
        <div className="mb-1.5 text-[13px] font-semibold text-primary">{EYEBROWS[step]}</div>
        <h1 className="text-[23px] font-bold leading-tight tracking-tight">{TITLES[step]}</h1>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>
            {error}
            {error.includes('plano profissional') && (
              <Link href="/painel/planos" className="ml-1 font-semibold text-link underline">
                Ver planos
              </Link>
            )}
          </span>
        </div>
      )}

      <div className={cn(showPreview && 'lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6')}>
        <div className="min-w-0">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <section>
                <div className="text-[13px] font-bold">O que você deseja anunciar?</div>
                <div className="mb-3 mt-0.5 text-[12.5px] text-muted">Venda, aluguel ou ambos.</div>
                <div className="grid gap-2.5 lg:grid-cols-3">
                  {([{ k: 'venda', l: 'Vender' }, { k: 'aluguel', l: 'Alugar' }, { k: 'ambos', l: 'Vender ou alugar' }] as const).map((o) => {
                    const sel = data.negotiation === o.k;
                    return (
                      <button key={o.k} type="button" onClick={() => up('negotiation', o.k)} aria-pressed={sel} className={bigCard(sel)}>
                        <Radial sel={sel} />
                        <span className="min-w-0 truncate text-[15px] font-semibold">{o.l}</span>
                      </button>
                    );
                  })}
                </div>
                <Err msg={errors.negotiation} />
              </section>
              {isParticular && (
                <div className="flex gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
                  <Info size={16} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <div className="text-[13px] font-semibold leading-snug">Proprietários particulares podem manter 1 imóvel ativo gratuitamente.</div>
                    <button type="button" onClick={() => setPlanModal(true)} className="mt-1.5 text-[12.5px] font-semibold text-primary underline">Já tenho outro imóvel? Conheça os planos para empresas</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {types.map((t) => {
                  const sel = data.propertyTypeId === t.id;
                  return (
                    <button key={t.id} type="button" onClick={() => up('propertyTypeId', t.id)} aria-pressed={sel} className={typeCard(sel)}>
                      <Radial sel={sel} />
                      <span className="min-w-0 truncate text-[13.5px] font-semibold">{t.name}</span>
                    </button>
                  );
                })}
              </div>
              <Err msg={errors.propertyType} />
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block">
                  <Lbl hint="req">Cidade</Lbl>
                  <select className={inputCls} value={data.cityId ?? ''} onChange={(e) => up('cityId', e.target.value || null)}>
                    <option value="">Selecione a cidade</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Err msg={errors.city} />
                </label>
                <label className="block">
                  <Lbl hint="req">Bairro</Lbl>
                  <select className={inputCls} value={data.neighborhoodId ?? ''} onChange={(e) => up('neighborhoodId', e.target.value || null)} disabled={!hoods.length}>
                    <option value="">{hoods.length ? 'Selecione o bairro' : 'Escolha a cidade'}</option>
                    {hoods.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                  <Err msg={errors.neighborhood} />
                </label>
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block"><Lbl hint="opt">Rua / Logradouro</Lbl><input className={inputCls} value={data.street} onChange={(e) => up('street', e.target.value)} placeholder="Ex.: Av. Olívia Flores" /></label>
                <div className="grid grid-cols-2 gap-3.5">
                  <label className="block"><Lbl>Número</Lbl><input className={inputCls} value={data.number} onChange={(e) => up('number', e.target.value)} placeholder="123" /></label>
                  <label className="block"><Lbl>CEP</Lbl><input className={inputCls} value={data.zipcode} onChange={(e) => up('zipcode', fmtCep(e.target.value))} placeholder="46000-000" inputMode="numeric" /></label>
                </div>
              </div>
              <label className="block"><Lbl hint="opt">Complemento</Lbl><input className={inputCls} value={data.complement} onChange={(e) => up('complement', e.target.value)} placeholder="Apto, bloco, ponto de referência" /></label>
              <button type="button" onClick={() => up('hideExact', !data.hideExact)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-subtle p-3.5 text-left">
                <Switch on={data.hideExact} />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[13.5px] font-semibold">Ocultar endereço exato</span>
                  <span className="text-xs text-muted">No anúncio público aparece só cidade e bairro. O endereço completo fica visível apenas para você.</span>
                </span>
              </button>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <label className="block">
                <Lbl hint="req">Título do anúncio</Lbl>
                <input className={inputCls} value={data.title} onChange={(e) => up('title', e.target.value)} placeholder="Ex.: Casa 3 quartos com quintal no Recreio" />
                <Err msg={errors.title} />
              </label>

              {showRooms && (
                <div className="rounded-2xl border border-border bg-subtle px-1 py-1.5">
                  {([{ f: 'bedrooms', l: 'Quartos', I: BedDouble }, { f: 'suites', l: 'Suítes', I: DoorOpen }, { f: 'bathrooms', l: 'Banheiros', I: Bath }, { f: 'garages', l: 'Vagas', I: Car }] as const).map((c) => (
                    <div key={c.f} className="flex items-center justify-between px-3 py-2.5">
                      <span className="flex items-center gap-2.5 text-sm font-medium"><c.I size={18} className="text-primary" />{c.l}</span>
                      <span className="flex items-center gap-3">
                        <button type="button" aria-label="Diminuir" onClick={() => up(c.f, Math.max(0, data[c.f] - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface"><Minus size={16} /></button>
                        <span className="min-w-5 text-center text-[15px] font-bold tabular-nums">{data[c.f]}</span>
                        <button type="button" aria-label="Aumentar" onClick={() => up(c.f, data[c.f] + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary bg-primary text-on-primary"><Plus size={16} /></button>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className={cn('grid gap-3.5', showBuilt && 'grid-cols-2')}>
                {showBuilt && (
                  <label className="block"><Lbl>Área construída</Lbl>
                    <span className="relative block"><input className={cn(inputCls, 'pr-10')} value={data.builtArea} onChange={(e) => up('builtArea', e.target.value.replace(/[^0-9.,]/g, ''))} placeholder="0" inputMode="decimal" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted">m²</span></span>
                  </label>
                )}
                <label className="block"><Lbl>{landLabel}</Lbl>
                  <span className="relative block"><input className={cn(inputCls, 'pr-10')} value={data.landArea} onChange={(e) => up('landArea', e.target.value.replace(/[^0-9.,]/g, ''))} placeholder="0" inputMode="decimal" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-muted">m²</span></span>
                </label>
              </div>

              {showFloor && (
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <label className="block"><Lbl>Andar</Lbl><input className={inputCls} value={data.floor} onChange={(e) => up('floor', e.target.value.replace(/[^0-9]/g, ''))} placeholder="Ex.: 4" inputMode="numeric" /></label>
                  {showCondo && <label className="block"><Lbl>Condomínio / Edifício</Lbl><input className={inputCls} value={data.condoName} onChange={(e) => up('condoName', e.target.value)} placeholder="Nome do empreendimento" /></label>}
                </div>
              )}

              <div className="grid gap-3.5 sm:grid-cols-3">
                <label className="block"><Lbl>Mobiliado?</Lbl><SelectGroup field="furnished" /></label>
                <label className="block"><Lbl>Estado do imóvel</Lbl><SelectGroup field="condition" /></label>
                <label className="block"><Lbl>Disponibilidade</Lbl><SelectGroup field="availability" /></label>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              <div>
                <Lbl>Exibição do preço</Lbl>
                <div className="flex gap-2.5">
                  {([{ k: 'publico', l: 'Mostrar preço', I: Eye }, { k: 'sob_consulta', l: 'Preço sob consulta', I: EyeOff }] as const).map((o) => {
                    const sel = data.priceVisibility === o.k;
                    return <button key={o.k} type="button" onClick={() => up('priceVisibility', o.k)} className={cn('flex flex-1 items-center justify-center gap-2 rounded-xl border p-3 text-[13.5px] font-semibold transition', sel ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-surface')}><o.I size={17} />{o.l}</button>;
                  })}
                </div>
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                {includesVenda && <label className="block"><Lbl>Valor de venda</Lbl><input className={inputCls} value={moneyText(data.salePrice)} onChange={(e) => money('salePrice')(e.target.value)} placeholder="R$ 0" inputMode="numeric" /></label>}
                {includesAluguel && <label className="block"><Lbl>Aluguel mensal</Lbl><input className={inputCls} value={moneyText(data.rentPrice)} onChange={(e) => money('rentPrice')(e.target.value)} placeholder="R$ 0" inputMode="numeric" /></label>}
              </div>
              <Err msg={errors.price} />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block"><Lbl hint="opt">Condomínio</Lbl><input className={inputCls} value={moneyText(data.condoFee)} onChange={(e) => money('condoFee')(e.target.value)} placeholder="R$ 0" inputMode="numeric" /></label>
                <label className="block"><Lbl hint="opt">IPTU anual</Lbl><input className={inputCls} value={moneyText(data.iptu)} onChange={(e) => money('iptu')(e.target.value)} placeholder="R$ 0" inputMode="numeric" /></label>
              </div>
              <div className="rounded-2xl border border-border bg-subtle px-1 py-1.5">
                {([
                  { f: 'acceptsFinancing', l: 'Aceita financiamento' },
                  { f: 'acceptsMcmv', l: 'Aceita Minha Casa Minha Vida' },
                  { f: 'acceptsExchange', l: 'Aceita permuta' },
                  { f: 'negotiable', l: 'Preço negociável' },
                ] as const).map((o, i) => (
                  <button key={o.f} type="button" onClick={() => up(o.f, !data[o.f])} className={cn('flex w-full items-center justify-between px-3 py-2.5', i > 0 && 'border-t border-border')}>
                    <span className="text-sm font-medium">{o.l}</span><Switch on={data[o.f]} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6 */}
          {step === 6 && (
            <div className="flex flex-col gap-4">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-7 text-center transition hover:border-primary">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.currentTarget.value = ''; }} />
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Upload size={22} /></span>
                <span className="text-[14.5px] font-semibold">Arraste fotos aqui ou toque para enviar</span>
                <span className="max-w-xs text-[12.5px] text-muted">Adicione fotos claras do imóvel. A primeira imagem será usada como capa do anúncio. Recomendamos pelo menos 5 fotos.</span>
                <span className="mt-1 text-xs font-semibold text-primary">JPG, PNG, WebP ou AVIF · até 10 MB cada</span>
              </label>
              <Err msg={errors.photos} />
              {photos.length > 0 && (
                <div>
                  <div className="mb-2.5 flex items-center justify-between"><span className="text-[13px] font-bold">{photos.length} foto(s)</span><span className="text-[11.5px] text-muted">Arraste para reordenar</span></div>
                  <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                    {photos.map((p, i) => (
                      <div key={p.id} draggable onDragStart={() => (drag.current = i)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (drag.current != null && drag.current !== i) reorder(drag.current, i); drag.current = null; }}
                        className="group relative aspect-square cursor-grab overflow-hidden rounded-xl border border-border bg-subtle">
                        {/* Foto enviada: url do storage ou blob de preview — next/image não lida com blob:. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url ?? p.preview} alt="" className="h-full w-full object-cover" />
                        {i === 0 && <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[10.5px] font-bold text-on-primary">Capa</span>}
                        {p.low && <span className="absolute bottom-1.5 left-1.5 rounded-md bg-warning px-1.5 py-0.5 text-[10px] font-semibold text-white">Baixa resolução</span>}
                        <button type="button" onClick={() => removePhoto(p.id)} aria-label="Remover" className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/65 text-white"><X size={14} /></button>
                        {i !== 0 && <button type="button" onClick={() => makeCover(p.id)} className="absolute bottom-1.5 right-1.5 rounded-md bg-white/90 px-2 py-1 text-[10.5px] font-semibold text-text">Definir capa</button>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block"><Lbl hint="opt">Vídeo (YouTube)</Lbl><input className={inputCls} value={data.videoUrl} onChange={(e) => up('videoUrl', e.target.value)} placeholder="https://youtube.com/..." /></label>
                <label className="block"><Lbl hint="opt">Tour virtual 360°</Lbl><input className={inputCls} value={data.tourUrl} onChange={(e) => up('tourUrl', e.target.value)} placeholder="Link do tour virtual" /></label>
              </div>
            </div>
          )}

          {/* STEP 7 */}
          {step === 7 && (
            <div className="flex flex-col gap-4">
              <label className="block">
                <span className="mb-1.5 flex items-center justify-between"><span className="text-[13px] font-semibold">Resumo curto</span><span className="text-[11.5px] text-muted">{data.shortDesc.length}/160</span></span>
                <input className={inputCls} value={data.shortDesc} onChange={(e) => up('shortDesc', e.target.value.slice(0, 160))} placeholder="Uma frase que aparece no topo do anúncio" />
              </label>
              <label className="block">
                <span className="mb-1.5 flex items-center justify-between"><span className="text-[13px] font-semibold">Descrição completa</span><span className="text-[11.5px] text-muted">{data.fullDesc.length}/2000</span></span>
                <textarea className={taCls} rows={6} value={data.fullDesc} onChange={(e) => up('fullDesc', e.target.value.slice(0, 2000))} placeholder="Descreva o imóvel: cômodos, acabamento, vizinhança, diferenciais..." />
                <button type="button" onClick={genDesc} disabled={genBusy} className="mt-2.5 inline-flex items-center gap-2 rounded-xl border border-primary bg-primary/5 px-3.5 py-2 text-[13px] font-semibold text-primary disabled:opacity-60">
                  {genBusy ? <><Loader2 size={15} className="animate-spin" />Gerando...</> : <><Sparkles size={16} />Gerar descrição com IA</>}
                </button>
                <div className="mt-1.5 text-[11.5px] text-muted">A IA usa apenas as informações que você já preencheu. Você pode editar antes de publicar.</div>
              </label>
              <div>
                <div className="text-[13px] font-bold">Diferenciais e comodidades</div>
                <div className="mb-2.5 mt-0.5 text-xs text-muted">Toque para selecionar. Aparecem como destaques no anúncio.</div>
                <div className="flex flex-wrap gap-2">
                  {amenityCatalog.map((f) => { const sel = data.amenities.includes(f.id); return <button key={f.id} type="button" onClick={() => toggleArr('amenities', f.id)} aria-pressed={sel} className={chipCls(sel)}>{sel && <Check size={14} />}{f.name}</button>; })}
                </div>
              </div>
              <div>
                <div className="mb-2.5 text-[13px] font-bold">O que tem por perto</div>
                <div className="flex flex-wrap gap-2">
                  {nearbyCatalog.map((f) => { const sel = data.nearby.includes(f.id); return <button key={f.id} type="button" onClick={() => toggleArr('nearby', f.id)} aria-pressed={sel} className={chipCls(sel)}>{sel && <Check size={14} />}{f.name}</button>; })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 8 */}
          {step === 8 && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block"><Lbl hint="req">Nome para contato</Lbl><input className={inputCls} value={data.advName} onChange={(e) => up('advName', titleCaseWords(e.target.value))} placeholder="Seu nome ou da imobiliária" /><Err msg={errors.advName} /></label>
                <label className="block"><Lbl hint="opt">Empresa</Lbl><input className={inputCls} value={data.companyName} onChange={(e) => up('companyName', titleCaseWords(e.target.value))} placeholder="Nome da imobiliária / construtora" /></label>
              </div>
              {!!brokers?.length && (
                <label className="block">
                  <Lbl hint="opt">Atribuir a um corretor</Lbl>
                  <select
                    className={inputCls}
                    value={data.brokerId ?? ''}
                    onChange={(e) => {
                      const b = brokers.find((x) => x.id === e.target.value);
                      setData((d) => b
                        ? { ...d, brokerId: b.id, advName: b.name || d.advName, whatsapp: b.whatsapp || d.whatsapp, phone: b.phone || d.phone, leadEmail: b.email || d.leadEmail }
                        : { ...d, brokerId: null });
                    }}
                  >
                    <option value="">Ninguém (eu mesmo)</option>
                    {brokers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <span className="mt-1 block text-xs text-muted">Preenche o contato com os dados do corretor — você pode editar abaixo.</span>
                </label>
              )}
              <div>
                <Lbl>Contato que aparece no anúncio</Lbl>
                <ContactOptionGroup />
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block"><Lbl hint={data.contactMethods.includes('whatsapp') ? 'req' : 'opt'}>WhatsApp</Lbl><input className={inputCls} value={data.whatsapp} onChange={(e) => up('whatsapp', fmtPhone(e.target.value))} placeholder="(77) 90000-0000" inputMode="tel" /></label>
                <label className="block"><Lbl hint={data.contactMethods.includes('telefone') ? 'req' : 'opt'}>Telefone</Lbl><input className={inputCls} value={data.phone} onChange={(e) => up('phone', fmtLandline(e.target.value))} placeholder="(77) 0000-0000" inputMode="tel" /></label>
              </div>
              <label className="block"><Lbl hint={data.contactMethods.includes('formulario') ? 'req' : 'opt'}>E-mail para receber leads</Lbl><input className={inputCls} value={data.leadEmail} onChange={(e) => up('leadEmail', e.target.value)} placeholder="Para onde enviamos os contatos recebidos" inputMode="email" /><Err msg={errors.leadEmail} /></label>
              <Err msg={errors.contact} />
              <div className="flex gap-2.5 rounded-2xl border border-primary/20 bg-primary/5 p-3.5"><Info size={16} className="mt-0.5 shrink-0 text-primary" /><span className="text-[12.5px] leading-relaxed">As opções selecionadas definem quais botões e formulário aparecem na página do imóvel.</span></div>
            </div>
          )}

          {/* STEP 9 */}
          {step === 9 && (
            <div className="flex flex-col gap-4">
              {missing.length > 0 && (
                <div className="rounded-2xl border border-warning/40 bg-warning/5 p-3.5">
                  <div className="mb-2 flex items-center gap-1.5 text-[13.5px] font-bold text-warning"><AlertTriangle size={16} />Faltam informações obrigatórias</div>
                  <div className="flex flex-col gap-1.5">
                    {missing.map((m, i) => (
                      <button key={i} type="button" onClick={() => goStep(m.step)} className="flex items-center justify-between rounded-lg border border-warning/30 bg-surface px-3 py-2 text-left">
                        <span className="text-[12.5px]">{m.msg}</span><span className="text-xs font-semibold text-primary">Corrigir</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {livePreview(false)}

              <div className="overflow-hidden rounded-2xl border border-border">
                {reviewSections.map((r) => (
                  <div key={r.title} className="flex items-center justify-between gap-3 border-b border-border px-3.5 py-3 last:border-b-0">
                    <div className="min-w-0"><div className="text-[11.5px] font-semibold uppercase tracking-wide text-muted">{r.title}</div><div className="mt-0.5 truncate text-[13.5px] font-medium">{r.value}</div></div>
                    <button type="button" onClick={() => goStep(r.step)} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[12.5px] font-semibold text-primary"><Pencil size={15} />Editar</button>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-border p-3.5">
                <div className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-muted">Prévia nos resultados de busca (SEO)</div>
                <div className="text-xs text-primary">{seoSlug}</div>
                <div className="mt-0.5 text-[15px] font-semibold leading-tight text-[#1a4ba0]">{seoTitle}</div>
                <div className="mt-1 text-[12.5px] leading-relaxed text-muted">{seoDesc}</div>
              </div>
            </div>
          )}
        </div>

        {showPreview && <aside className="sticky top-44 hidden lg:block">{livePreview(true)}</aside>}
      </div>

      {/* ações */}
      <div className="mt-8 border-t border-border pt-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
          {step !== 9 ? (
            <button type="button" onClick={goNext} className="order-1 flex h-[46px] items-center justify-center gap-1 rounded-xl bg-action px-5 text-[14.5px] font-semibold text-on-action hover:bg-action-hover sm:order-3 sm:min-w-44">
              Continuar<ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={publish} disabled={busy} className="order-1 flex h-[46px] items-center justify-center gap-2 rounded-xl bg-action px-5 text-[14.5px] font-bold text-on-action hover:bg-action-hover disabled:opacity-60 sm:order-3 sm:min-w-44">
              {busy && <Loader2 size={16} className="animate-spin" />}Publicar imóvel
            </button>
          )}
          <button type="button" onClick={saveDraft} disabled={busy} className="order-2 h-[46px] whitespace-nowrap rounded-xl border border-border bg-surface px-4 text-[13.5px] font-semibold text-muted disabled:opacity-50 sm:order-2">
            Salvar rascunho
          </button>
          {step === 1 ? (
            <Link href="/painel/imoveis" className="order-3 flex h-[46px] items-center justify-center gap-1 rounded-xl border border-border bg-surface px-4 text-sm font-semibold sm:order-1">
              <ChevronLeft size={16} />Voltar
            </Link>
          ) : (
            <button type="button" onClick={goBack} className="order-3 flex h-[46px] items-center justify-center gap-1 rounded-xl border border-border bg-surface px-4 text-sm font-semibold sm:order-1">
              <ChevronLeft size={16} />Voltar
            </button>
          )}
        </div>
      </div>

      {/* modal de planos */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45" onClick={() => setPlanModal(false)}>
          <div className="w-full max-w-md rounded-t-3xl bg-surface p-5 pb-6" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-border" />
            <div className="text-lg font-bold">Quer anunciar mais imóveis?</div>
            <p className="my-3 text-[13.5px] leading-relaxed text-muted">Proprietários particulares mantêm 1 imóvel ativo gratuitamente. Para anunciar vários imóveis, ter destaque e perfil de empresa, conheça os planos profissionais.</p>
            <div className="mb-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between rounded-xl border border-border p-3.5"><div><div className="text-sm font-bold">Corretor Essencial</div><div className="text-xs text-muted">Até 10 imóveis · perfil profissional</div></div><div className="text-[15px] font-bold text-primary">R$ 19,90<span className="text-[11px] font-medium text-muted">/mês</span></div></div>
              <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3.5"><div><div className="text-sm font-bold">Empresa Start <span className="ml-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] text-on-primary">Novo</span></div><div className="text-xs text-muted">Até 50 imóveis · vitrine da empresa</div></div><div className="text-[15px] font-bold text-primary">R$ 79,90<span className="text-[11px] font-medium text-muted">/mês</span></div></div>
            </div>
            <div className="grid gap-2">
              <Link href="/painel/planos" className="flex h-[46px] items-center justify-center rounded-xl bg-action text-[14.5px] font-semibold text-on-action hover:bg-action-hover">Ver planos e assinar</Link>
              <button type="button" onClick={() => setPlanModal(false)} className="h-[42px] w-full rounded-xl border border-border text-[13.5px] font-semibold text-muted">Continuar com plano gratuito</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
