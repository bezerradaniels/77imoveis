import { useState } from 'react';
import { ImagePlus, Trash2, Search } from 'lucide-react';
import { Input, Field } from '@/components/ui/Input';
import { companyTypes } from '@/lib/constants';
import { weekDays } from './useCompanyForm';

type Opt = { id: string; name: string };
export const selectCls = 'h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm';

const quickTypes = ['imobiliaria', 'corretor_autonomo', 'construtora'];

export function TypeSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const quickTypes = [
    { value: 'imobiliaria', label: 'Imobiliária', desc: 'Empresa com vários imóveis' },
    { value: 'corretor_autonomo', label: 'Corretor autônomo', desc: 'Profissional individual' },
    { value: 'construtora', label: 'Construtora', desc: 'Construção e lançamentos' },
  ];

  const isQuickType = quickTypes.some((t) => t.value === value);
  const isOther = value !== '' && !isQuickType;

  const otherTypes = companyTypes.filter(
    (t) => !quickTypes.some((q) => q.value === t.value) && t.value !== 'outro'
  );

  return (
    <div className="space-y-4 max-w-xl">
      <div className="space-y-3">
        {quickTypes.map((t) => {
          const active = value === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                active
                  ? 'border-[#008A70] bg-[#008A70]/5 ring-1 ring-[#008A70]'
                  : 'border-border bg-surface hover:bg-bg'
              }`}
            >
              <div>
                <p className="font-semibold text-sm text-text">{t.label}</p>
                <p className="text-xs text-muted">{t.desc}</p>
              </div>
              <div
                className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                  active
                    ? 'border-[#008A70] bg-[#008A70] text-white'
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

        {/* Card for Outros */}
        <button
          type="button"
          onClick={() => {
            if (!isOther) {
              onChange('outro');
            }
          }}
          className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
            isOther || value === 'outro'
              ? 'border-[#008A70] bg-[#008A70]/5 ring-1 ring-[#008A70]'
              : 'border-border bg-surface hover:bg-bg'
          }`}
        >
          <div>
            <p className="font-semibold text-sm text-text">Outros</p>
            <p className="text-xs text-muted">Outro tipo de empresa</p>
          </div>
          <div
            className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
              isOther || value === 'outro'
                ? 'border-[#008A70] bg-[#008A70] text-white'
                : 'border-muted bg-transparent'
            }`}
          >
            {(isOther || value === 'outro') && (
              <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Select list fallback displayed if "Outros" is checked */}
      {(isOther || value === 'outro') && (
        <div className="pt-2 animate-fadeIn space-y-1.5">
          <label className="text-xs font-semibold text-muted">Selecione o tipo</label>
          <select
            className={selectCls}
            value={value === 'outro' ? '' : value}
            onChange={(e) => onChange(e.target.value || 'outro')}
          >
            <option value="">Selecione…</option>
            {otherTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}
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
        <Field label="Nome da empresa *">
          <Input
            value={f.tradeName}
            onChange={(e) => set('tradeName', e.target.value)}
            placeholder="Ex.: Mel Imob"
          />
          <p className="mt-1 text-xs text-muted">Nome como sua empresa aparece nos anúncios.</p>
        </Field>

        <Field label="CNPJ · opcional">
          <Input
            value={f.cnpj}
            onChange={(e) => set('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
          />
        </Field>

        <Field label="CRECI · opcional">
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
          <span className="rounded-full bg-[#008A70]/10 px-2.5 py-0.5 text-xs font-semibold text-[#008A70]">
            {selectedCount} {selectedCount === 1 ? 'selecionada' : 'selecionadas'}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {cities.map((c) => {
          const active = citySet.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                active
                  ? 'border-[#008A70] bg-[#008A70]/5 text-text ring-1 ring-[#008A70]'
                  : 'border-border bg-surface text-text hover:bg-bg'
              }`}
            >
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                  active
                    ? 'border-[#008A70] bg-[#008A70] text-white'
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

function ImgPick({ label, st, setter, ratio }: any) {
  return (
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
}

export function ImagesSection({ logo, setLogo, cover, setCover }: any) {
  return (
    <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
      <ImgPick label="Logo" st={logo} setter={setLogo} ratio="h-32 w-32" />
      <ImgPick label="Capa" st={cover} setter={setCover} ratio="h-32 w-full" />
    </div>
  );
}

export function DescriptionSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const charCount = value?.length || 0;
  return (
    <Field
      label={
        <div className="flex items-center justify-between w-full">
          <span>Sobre a empresa</span>
          <span className="text-xs text-muted font-normal">{charCount}/600</span>
        </div>
      }
    >
      <textarea
        className="min-h-36 w-full rounded-lg border border-border bg-surface p-3 text-sm focus:border-[#008A70] focus:ring-1 focus:ring-[#008A70]"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 600))}
        placeholder="Conte sobre a sua empresa, diferenciais e formas de atendimento."
        maxLength={600}
      />
    </Field>
  );
}

export function ContactSection({ f, set }: { f: any; set: (k: string, v: string) => void }) {
  return (
    <div className="space-y-4 max-w-xl">
      <Field label="WhatsApp">
        <Input
          value={f.whatsapp}
          onChange={(e) => set('whatsapp', e.target.value)}
          placeholder="(77) 90000-0000"
        />
      </Field>

      <Field label="Telefone">
        <Input
          value={f.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="(77) 0000-0000"
        />
      </Field>

      <Field label="E-mail">
        <Input
          type="email"
          value={f.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="contato@suaempresa.com"
        />
      </Field>

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
          onChange={(e) => set('instagram', e.target.value)}
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

export function BrokersSection({ brokers, addBroker, removeBroker, updateBroker }: any) {
  return (
    <div className="space-y-6 max-w-xl">
      {brokers.length === 0 && (
        <p className="text-sm text-muted">Nenhum corretor adicionado ainda.</p>
      )}

      <div className="space-y-6">
        {brokers.map((b: any, i: number) => (
          <div key={i} className="rounded-xl border border-border p-4 bg-surface space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <span className="text-xs font-bold text-muted tracking-wider">CORRETOR</span>
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

              <Field label="WhatsApp">
                <Input
                  value={b.whatsapp ?? ''}
                  onChange={(e) => updateBroker(i, { whatsapp: e.target.value })}
                  placeholder="(77) 90000-0000"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addBroker}
        className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl border border-dashed border-[#008A70] text-[#008A70] font-semibold text-sm hover:bg-[#008A70]/5 transition-all"
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
          <span className="rounded-full bg-[#008A70]/10 px-2.5 py-0.5 text-xs font-semibold text-[#008A70]">
            {selectedCount} {selectedCount === 1 ? 'selecionada' : 'selecionadas'}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {specialties.map((s) => {
          const active = specSet.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                active
                  ? 'border-[#008A70] bg-[#008A70]/5 text-text ring-1 ring-[#008A70]'
                  : 'border-border bg-surface text-text hover:bg-bg'
              }`}
            >
              <div
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                  active
                    ? 'border-[#008A70] bg-[#008A70] text-white'
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

export function AddressSection({ f, set }: { f: any; set: (k: string, v: string) => void }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <Field label="CEP">
        <Input value={f.cep} onChange={(e) => set('cep', e.target.value)} placeholder="00000-000" />
      </Field>
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
