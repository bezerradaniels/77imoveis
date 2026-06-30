import { useState } from 'react';
import { ImagePlus, Trash2, Search } from 'lucide-react';
import { Input, Field } from '@/components/ui/Input';
import { weekDays } from './useCompanyForm';

type Opt = { id: string; name: string };

function phoneMask(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function instagramUsername(value: string) {
  const raw = value.trim();
  if (!raw) return '';
  const withoutAt = raw.replace(/^@/, '');
  try {
    const url = new URL(withoutAt.startsWith('http') ? withoutAt : `https://${withoutAt}`);
    if (url.hostname.includes('instagram.com')) {
      return (url.pathname.split('/').filter(Boolean)[0] ?? '').replace(/^@/, '');
    }
  } catch {}
  return withoutAt
    .replace(/^instagram\.com\//, '')
    .split(/[/?#]/)[0]
    .replace(/^@/, '');
}

function cleanEmail(value: string) {
  return value.trim().toLowerCase().replace(/\s/g, '');
}

export function TypeSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const quickTypes = [
    { value: 'imobiliaria', label: 'Imobiliária', desc: 'Empresa com vários imóveis' },
    { value: 'corretor_autonomo', label: 'Corretor autônomo', desc: 'Profissional individual' },
    { value: 'construtora', label: 'Construtora', desc: 'Construção e lançamentos' },
    { value: 'incorporadora', label: 'Incorporadora', desc: 'Desenvolve empreendimentos' },
  ];

  return (
    <div className="space-y-4 max-w-xl">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {quickTypes.map((t) => {
          const active = value === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                active
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-white hover:bg-bg'
              }`}
            >
              <div>
                <p className="font-semibold text-sm text-text">{t.label}</p>
                <p className="text-xs text-muted">{t.desc}</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                  active
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-muted bg-transparent'
                }`}
              >
                {active && (
                  <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DataSection({
  f,
  set,
  cities,
  isWizard = false,
}: {
  f: any;
  set: (k: string, v: string) => void;
  cities: Opt[];
  isWizard?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const currentCityName = cities.find((c) => c.id === f.cityId)?.name || '';
  const displayVal = isOpen ? search : currentCityName;

  const filtered = cities.filter((c) =>
    c.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .includes(search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );

  if (isWizard) {
    return (
      <section className="space-y-4 max-w-xl">
        <Field label="Nome de exibição *">
          <Input
            value={f.tradeName}
            onChange={(e) => set('tradeName', e.target.value)}
            placeholder="Ex.: Mel Imob"
          />
          <p className="mt-1 text-xs text-muted">Será usado nos anúncios e no perfil público.</p>
        </Field>

        <Field label="CRECI">
          <Input
            value={f.creci}
            onChange={(e) => set('creci', e.target.value)}
            placeholder="000000"
          />
        </Field>

        <Field label="Cidade principal">
          <div className="relative">
            <Input
              value={displayVal}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => {
                setSearch(currentCityName);
                setIsOpen(true);
              }}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              placeholder="Digite a cidade"
            />
            <Search size={18} className="absolute right-3 top-3 text-muted pointer-events-none" />

            {isOpen && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg">
                {filtered.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted">Nenhuma cidade encontrada</div>
                ) : (
                  filtered.slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-bg"
                      onClick={() => {
                        set('cityId', c.id);
                        setSearch(c.name);
                        setIsOpen(false);
                      }}
                    >
                      {c.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </Field>

        <Field
          label={
            <div className="flex w-full items-center justify-between">
              <span>Descrição</span>
              <span className="text-xs font-normal text-muted">{(f.description?.length || 0)}/600</span>
            </div>
          }
        >
          <textarea
            className="min-h-32 w-full rounded-lg border border-border bg-white p-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
            value={f.description}
            onChange={(e) => set('description', e.target.value.slice(0, 600))}
            placeholder="Conte sobre sua empresa, diferenciais e formas de atendimento."
            maxLength={600}
          />
        </Field>
      </section>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <Field label="Nome fantasia (exibido)">
        <Input value={f.tradeName} onChange={(e) => set('tradeName', e.target.value)} placeholder="Ex.: Imobiliária Conquista" />
      </Field>
      <Field label="Razão social (opcional)">
        <Input value={f.legalName} onChange={(e) => set('legalName', e.target.value)} />
      </Field>
      <Field label="CNPJ (opcional)">
        <Input value={f.cnpj} onChange={(e) => set('cnpj', e.target.value)} placeholder="00.000.000/0000-00" />
      </Field>
      <Field label="CRECI (opcional)">
        <Input value={f.creci} onChange={(e) => set('creci', e.target.value)} placeholder="000000" />
      </Field>
      <Field label="Cidade principal">
        <div className="relative">
          <Input
            value={displayVal}
            onChange={(e) => {
              setSearch(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setSearch(currentCityName);
              setIsOpen(true);
            }}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            placeholder="Digite a cidade"
          />
          <Search size={18} className="absolute right-3 top-3 text-muted pointer-events-none" />

          {isOpen && (
            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-lg">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-muted">Nenhuma cidade encontrada</div>
              ) : (
                filtered.slice(0, 8).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-bg"
                    onClick={() => {
                      set('cityId', c.id);
                      setSearch(c.name);
                      setIsOpen(false);
                    }}
                  >
                    {c.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </Field>
    </section>
  );
}

export function CitiesSection({
  cities,
  citySet,
  toggle,
}: {
  cities: Opt[];
  citySet: Set<string>;
  toggle: (id: string) => void;
}) {
  const selectedCount = citySet.size;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Cidades de atuação</h3>
        {selectedCount > 0 && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-link">
            {selectedCount} {selectedCount === 1 ? 'selecionada' : 'selecionadas'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cities.map((c) => {
          const active = citySet.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className={`flex min-h-11 w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all ${
                active
                  ? 'border-primary bg-primary/5 text-text ring-1 ring-primary'
                  : 'border-border bg-white text-text hover:bg-bg'
              }`}
            >
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                  active
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-muted bg-transparent'
                }`}
              >
                {active && (
                  <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                )}
              </div>
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ImgPick({ label, st, setter, ratio, hint }: any) {
  const hasImage = st.file || st.url;
  return (
    <Field label={label}>
      <label
        className={`group relative flex ${ratio} cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed text-muted transition ${
          hasImage ? 'border-transparent' : 'border-primary/40 bg-[#f8fbfe] hover:border-primary hover:bg-[#eff8ff]'
        }`}
      >
        {hasImage ? (
          <>
            <img src={st.file ? URL.createObjectURL(st.file) : st.url} alt="" className="h-full w-full object-cover" />
            {/* Overlay no hover */}
            <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 opacity-0 transition group-hover:bg-slate-950/40 group-hover:opacity-100">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow">
                <ImagePlus size={14} /> Trocar
              </span>
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-2 px-3 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-on-primary">
              <ImagePlus size={20} />
            </span>
            <span className="text-sm font-semibold text-text">Adicionar imagem</span>
            {hint && <span className="text-[11px] leading-tight text-muted">{hint}</span>}
          </span>
        )}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && setter({ url: st.url, file: e.target.files[0] })}
        />
      </label>
      {hasImage && (
        <button
          type="button"
          onClick={() => setter({ url: '', file: undefined })}
          className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-danger hover:underline"
        >
          <Trash2 size={13} /> Remover
        </button>
      )}
    </Field>
  );
}

export function ImagesSection({ logo, setLogo, cover, setCover }: any) {
  return (
    <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
      <ImgPick label="Logo" st={logo} setter={setLogo} ratio="h-40 w-40" hint="Quadrada, até 5 MB" />
      <ImgPick label="Capa" st={cover} setter={setCover} ratio="h-40 w-full" hint="Paisagem (16:9), até 5 MB" />
    </div>
  );
}

export function DescriptionSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const charCount = value?.length || 0;
  return (
    <Field
      label={
        <div className="flex items-center justify-between w-full">
      <span>Sobre o perfil</span>
          <span className="text-xs text-muted font-normal">{charCount}/600</span>
        </div>
      }
    >
      <textarea
        className="min-h-36 w-full rounded-lg border border-border bg-white p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 600))}
        placeholder="Conte sobre a sua empresa, diferenciais e formas de atendimento."
        maxLength={600}
      />
    </Field>
  );
}

export function ContactSection({
  f, set, lockWhatsapp = false, showError = false,
}: { f: any; set: (k: string, v: string) => void; lockWhatsapp?: boolean; showError?: boolean }) {
  const hasContact = !!(f.whatsapp.trim() || f.phone.trim() || f.email.trim());
  return (
    <div className="space-y-4 max-w-xl">
      <p className="text-sm text-muted">
        Informe ao menos um: <span className="font-semibold text-text">WhatsApp, telefone ou e-mail</span>.
      </p>

      <Field label="WhatsApp *">
        <Input
          inputMode="tel"
          value={f.whatsapp}
          onChange={(e) => set('whatsapp', lockWhatsapp ? phoneMask(e.target.value) : e.target.value)}
          placeholder="(77) 90000-0000"
        />
      </Field>

      <Field label="Telefone *">
        <Input
          inputMode="tel"
          value={f.phone}
          onChange={(e) => set('phone', lockWhatsapp ? phoneMask(e.target.value) : e.target.value)}
          placeholder="(77) 0000-0000"
        />
      </Field>

      <Field label="E-mail *">
        <Input
          type="email"
          value={f.email}
          onChange={(e) => set('email', cleanEmail(e.target.value))}
          placeholder="contato@suaempresa.com"
        />
      </Field>

      {showError && !hasContact && (
        <p className="text-xs text-danger">Preencha pelo menos um dos três campos marcados com *.</p>
      )}

      <Field label="Site">
        <Input
          value={f.website}
          onChange={(e) => set('website', e.target.value)}
          placeholder="https://"
        />
      </Field>

      <Field label="Instagram">
        <Input
          value={f.instagram}
          onChange={(e) => set('instagram', instagramUsername(e.target.value))}
          placeholder="@suaempresa"
        />
      </Field>
    </div>
  );
}

export function HoursSection({ hours, setHour }: { hours: Record<string, string>; setHour: (day: string, v: string) => void }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold">Horário de atendimento</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {weekDays.map((d) => (
          <Field key={d.key} label={d.label}>
            <Input
              value={hours[d.key] ?? ''}
              onChange={(e) => setHour(d.key, e.target.value)}
              placeholder="08:00-18:00 (vazio = fechado)"
            />
          </Field>
        ))}
      </div>
    </section>
  );
}

export function BrokersSection({ brokers, companyWhatsapp, addBroker, removeBroker, updateBroker }: any) {
  return (
    <div className="space-y-6 max-w-xl">
      {brokers.length === 0 && (
        <p className="text-sm text-muted">Nenhum corretor adicionado ainda.</p>
      )}

      <div className="space-y-6">
        {brokers.map((b: any, i: number) => (
          <div key={i} className="rounded-xl border border-border p-4 bg-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted">CORRETOR</span>
              <button
                type="button"
                onClick={() => removeBroker(i)}
                className="text-sm font-semibold text-danger hover:underline"
              >
                Remover
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Nome *">
                <Input
                  value={b.name}
                  onChange={(e) => updateBroker(i, { name: e.target.value })}
                  placeholder="Nome do corretor"
                />
              </Field>

              <Field label="CRECI">
                <Input
                  value={b.creci ?? ''}
                  onChange={(e) => updateBroker(i, { creci: e.target.value })}
                  placeholder="000000"
                />
              </Field>

              <Field label="E-mail">
                <Input
                  type="email"
                  value={b.email ?? ''}
                  onChange={(e) => updateBroker(i, { email: e.target.value })}
                  placeholder="corretor@email.com"
                />
              </Field>

              <Field label="WhatsApp">
                <Input
                  inputMode="tel"
                  value={b.whatsapp ?? ''}
                  onChange={(e) => updateBroker(i, { whatsapp: phoneMask(e.target.value) })}
                  placeholder="(77) 90000-0000"
                />
              </Field>
              <label className="flex items-center gap-2 text-sm font-medium text-muted">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={!!companyWhatsapp && b.whatsapp === companyWhatsapp}
                  onChange={(e) => updateBroker(i, { whatsapp: e.target.checked ? companyWhatsapp : '' })}
                  disabled={!companyWhatsapp}
                />
                Usar WhatsApp da imobiliária
              </label>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addBroker}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary bg-white py-3 text-sm font-semibold text-link transition-all hover:bg-primary/5"
      >
        <span className="text-lg">+</span> Adicionar corretor
      </button>
    </div>
  );
}

export function SpecialtiesSection({
  specialties,
  specSet,
  toggle,
}: {
  specialties: Opt[];
  specSet: Set<string>;
  toggle: (id: string) => void;
}) {
  const selectedCount = specSet.size;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">Especialidades</h3>
        {selectedCount > 0 && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-link">
            {selectedCount} {selectedCount === 1 ? 'selecionada' : 'selecionadas'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {specialties.map((s) => {
          const active = specSet.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={`flex min-h-11 w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all ${
                active
                  ? 'border-primary bg-primary/5 text-text ring-1 ring-primary'
                  : 'border-border bg-white text-text hover:bg-bg'
              }`}
            >
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                  active
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-muted bg-transparent'
                }`}
              >
                {active && (
                  <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                )}
              </div>
              {s.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AddressSection({ f, set, hideCep = false }: { f: any; set: (k: string, v: string) => void; hideCep?: boolean }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {!hideCep && (
        <Field label="CEP">
          <Input value={f.cep} onChange={(e) => set('cep', e.target.value)} placeholder="00000-000" />
        </Field>
      )}
      <Field label="Rua">
        <Input value={f.street} onChange={(e) => set('street', e.target.value)} placeholder="Av. Brasil" />
      </Field>
      <Field label="Número">
        <Input value={f.number} onChange={(e) => set('number', e.target.value)} placeholder="100" />
      </Field>
      <Field label="Bairro">
        <Input value={f.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} placeholder="Centro" />
      </Field>
    </section>
  );
}
