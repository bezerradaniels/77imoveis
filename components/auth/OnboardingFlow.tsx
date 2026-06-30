'use client';
import { useState, useTransition } from 'react';
import { Building2, Check, ChevronLeft, HardHat, KeyRound, Loader2, Search } from 'lucide-react';
import { completeOnboarding } from '@/app/painel/escolha-perfil/actions';

type City = { id: string; name: string; slug: string };
type RoleKey = 'pessoal' | 'corretor_autonomo' | 'imobiliaria' | 'construtora' | 'incorporadora';

// ── Definição dos caminhos ────────────────────────────────────────────

type RadioQ = {
  kind: 'radio';
  key: string;
  title: string;
  subtitle?: string;
  cols?: 'auto' | 'city'; // city = grid compacto para 7 cidades
  options: { value: string; label: string; description?: string }[];
};
type TextQ = { kind: 'text'; key: string; title: string; placeholder: string; subtitle?: string; optional?: boolean };
type FieldsQ = {
  kind: 'fields';
  key: string;
  title: string;
  subtitle?: string;
  optional?: boolean;
  fields: { key: string; label: string; placeholder: string }[];
};
type Question = RadioQ | TextQ | FieldsQ;

function buildPaths(cities: City[]): Record<RoleKey, Question[]> {
  const cityOpts = cities.map((c) => ({ value: c.id, label: c.name }));

  const cityQuestion = (title: string): RadioQ => ({
    kind: 'radio',
    key: 'city_id',
    title,
    cols: 'city',
    options: cityOpts,
  });

  const propertyCountQuestion: RadioQ = {
    kind: 'radio',
    key: 'property_count',
    title: 'Quantos imóveis você gerencia atualmente?',
    options: [
      { value: '1', label: '1 imóvel' },
      { value: 'menos5', label: 'Menos de 5' },
      { value: '5a20', label: 'De 5 a 20' },
      { value: 'mais20', label: 'Mais de 20' },
    ],
  };

  const credentialsQuestion: FieldsQ = {
    kind: 'fields',
    key: 'credentials',
    title: 'Documentos profissionais',
    subtitle: 'Opcional — você pode adicionar ou corrigir depois no perfil profissional.',
    optional: true,
    fields: [
      { key: 'creci', label: 'CRECI', placeholder: 'Ex.: CRECI 12345-F' },
      { key: 'cnpj', label: 'CNPJ', placeholder: 'Ex.: 00.000.000/0001-00' },
    ],
  };

  return {
    pessoal: [
      {
        kind: 'radio',
        key: 'intention',
        title: 'O que você busca?',
        options: [
          { value: 'comprar',  label: 'Comprar',       description: 'Quero encontrar um imóvel para comprar.' },
          { value: 'alugar',   label: 'Alugar',        description: 'Procuro imóvel para alugar.' },
          { value: 'temporada',label: 'Temporada',     description: 'Hospedagem para viagem ou romaria.' },
          { value: 'explorar', label: 'Só explorar',   description: 'Ainda não decidi, quero ver o que tem.' },
        ],
      },
      cityQuestion('Em qual cidade você busca?'),
    ],

    corretor_autonomo: [
      cityQuestion('Em qual cidade você atua principalmente?'),
      propertyCountQuestion,
      credentialsQuestion,
    ],

    imobiliaria: [
      {
        kind: 'text',
        key: 'trade_name',
        title: 'Qual o nome da imobiliária?',
        placeholder: 'Ex.: Imóveis Silva',
      },
      cityQuestion('Em qual cidade a imobiliária atua principalmente?'),
      propertyCountQuestion,
      credentialsQuestion,
    ],

    construtora: [
      {
        kind: 'text',
        key: 'trade_name',
        title: 'Qual o nome da construtora?',
        placeholder: 'Ex.: Construtora Oeste',
      },
      cityQuestion('Em qual cidade a construtora atua principalmente?'),
      {
        kind: 'fields',
        key: 'credentials',
        title: 'CNPJ',
        subtitle: 'Opcional — você pode adicionar depois no perfil profissional.',
        optional: true,
        fields: [
          { key: 'cnpj', label: 'CNPJ', placeholder: 'Ex.: 00.000.000/0001-00' },
        ],
      },
    ],

    incorporadora: [
      {
        kind: 'text',
        key: 'trade_name',
        title: 'Qual o nome da incorporadora?',
        placeholder: 'Ex.: Incorporadora Oeste',
      },
      cityQuestion('Em qual cidade a incorporadora atua principalmente?'),
      {
        kind: 'fields',
        key: 'credentials',
        title: 'CNPJ',
        subtitle: 'Opcional — você pode adicionar depois no perfil profissional.',
        optional: true,
        fields: [
          { key: 'cnpj', label: 'CNPJ', placeholder: 'Ex.: 00.000.000/0001-00' },
        ],
      },
    ],
  };
}

// ── Componente radio card ─────────────────────────────────────────────

function RadioCard({
  label, description, checked, onSelect, compact,
}: {
  label: string; description?: string; checked: boolean; onSelect: () => void; compact?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer select-none items-start justify-between gap-3 rounded-xl border-2 transition
        ${compact ? 'px-4 py-3' : 'p-5'}
        ${checked ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary/40'}`}
    >
      <input type="radio" className="sr-only" checked={checked} onChange={onSelect} />
      <div className="min-w-0">
        <p className={`font-semibold leading-snug ${compact ? 'text-sm' : ''}`}>{label}</p>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      <span className={`mt-0.5 flex shrink-0 items-center justify-center rounded-full border-2 transition
        ${compact ? 'h-4 w-4' : 'h-5 w-5'}
        ${checked ? 'border-[#4ade80] bg-[#4ade80]' : 'border-border'}`}>
        {checked && <Check size={compact ? 10 : 12} strokeWidth={3} className="text-white" />}
      </span>
    </label>
  );
}

// ── Wizard principal ──────────────────────────────────────────────────

const roleOptions = [
  { key: 'pessoal', icon: Search, title: 'Conta pessoal', description: 'Buscar imóveis e anunciar 1 imóvel como particular.' },
  { key: 'corretor_autonomo', icon: KeyRound, title: 'Corretor autônomo', description: 'Atuar com perfil próprio e 1 imóvel ativo grátis.' },
  { key: 'imobiliaria', icon: Building2, title: 'Imobiliária', description: 'Criar perfil profissional e montar equipe avulsa.' },
  { key: 'construtora', icon: HardHat, title: 'Construtora', description: 'Divulgar empreendimentos e imóveis da construtora.' },
  { key: 'incorporadora', icon: Building2, title: 'Incorporadora', description: 'Desenvolver e divulgar empreendimentos imobiliários.' },
] as const;

export function OnboardingFlow({ cities }: { cities: City[] }) {
  const paths = buildPaths(cities);

  // null = ainda na escolha de papel
  const [roleKey, setRoleKey] = useState<RoleKey | null>(null);
  const [stepIndex, setStepIndex]  = useState(0);
  const [answers, setAnswers]      = useState<Record<string, string>>({});
  const [error, setError]          = useState<string | null>(null);
  const [pending, start]           = useTransition();

  const currentPath = roleKey ? paths[roleKey] : null;
  const currentQ    = currentPath ? currentPath[stepIndex] : null;
  const totalSteps  = currentPath?.length ?? 0;

  // valor selecionado nesta pergunta
  const currentValue = currentQ ? (answers[currentQ.key] ?? '') : '';
  const canAdvance   = roleKey === null
    ? true // botão só aparece após selecionar
    : currentQ?.kind === 'text'
      ? (currentQ.optional || (answers[currentQ.key] ?? '').trim().length > 0)
      : currentQ?.kind === 'fields'
        ? (currentQ.optional || currentQ.fields.some((f) => (answers[f.key] ?? '').trim().length > 0))
        : currentValue !== '';

  function selectRole(key: RoleKey) {
    setRoleKey(key);
    setStepIndex(0);
    setAnswers({});
  }

  function setAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
    } else {
      setRoleKey(null);
      setAnswers({});
    }
  }

  function advance() {
    if (!roleKey) return;
    if (stepIndex < totalSteps - 1) {
      setStepIndex((s) => s + 1);
    } else {
      // último passo — submeter
      start(async () => {
        const result = await completeOnboarding(roleKey, answers);
        if (result?.error) setError(result.error);
      });
    }
  }

  const isLastStep = roleKey !== null && stepIndex === totalSteps - 1;

  // ── Render: escolha de papel ────────────────────────────────────

  if (roleKey === null) {
    return (
      <>
        <div className="grid gap-3 sm:grid-cols-2">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <label
                key={opt.key}
                onClick={() => selectRole(opt.key)}
                className="flex cursor-pointer select-none flex-col gap-3 rounded-xl border-2 border-border bg-surface p-5 transition hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <Icon size={22} className="text-muted" />
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-border" />
                </div>
                <div>
                  <p className="font-semibold leading-snug">{opt.title}</p>
                  <p className="mt-1 text-sm text-muted">{opt.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </>
    );
  }

  // ── Render: perguntas do caminho ────────────────────────────────

  if (!currentQ) return null;

  return (
    <div className="space-y-5">
      {/* Progresso */}
      <div className="flex items-center gap-3">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-text"
        >
          <ChevronLeft size={16} /> Voltar
        </button>
        <div className="flex flex-1 gap-1">
          {currentPath!.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= stepIndex ? 'bg-primary' : 'bg-border'}`}
            />
          ))}
        </div>
        <span className="text-xs text-muted">{stepIndex + 1}/{totalSteps}</span>
      </div>

      {/* Pergunta */}
      <div>
        <h2 className="text-xl font-bold">{currentQ.title}</h2>
        {(currentQ.kind === 'text' || currentQ.kind === 'fields') && currentQ.subtitle && (
          <p className="mt-1 text-sm text-muted">{currentQ.subtitle}</p>
        )}
      </div>

      {/* Inputs */}
      {currentQ.kind === 'radio' && (
        <div className={`grid gap-2 ${
          currentQ.cols === 'city'
            ? 'grid-cols-2 sm:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2'
        }`}>
          {currentQ.options.map((opt) => (
            <RadioCard
              key={opt.value + opt.label}
              label={opt.label}
              description={currentQ.cols === 'city' ? undefined : opt.description}
              checked={currentValue === opt.value && answers[currentQ.key + '_label'] === opt.label}
              onSelect={() => {
                setAnswer(currentQ.key, opt.value);
                setAnswer(currentQ.key + '_label', opt.label);
              }}
              compact={currentQ.cols === 'city'}
            />
          ))}
        </div>
      )}

      {currentQ.kind === 'text' && (
        <input
          type="text"
          value={answers[currentQ.key] ?? ''}
          onChange={(e) => setAnswer(currentQ.key, e.target.value)}
          placeholder={currentQ.placeholder}
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      )}

      {currentQ.kind === 'fields' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {currentQ.fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-sm font-semibold">{f.label}</label>
              <input
                type="text"
                value={answers[f.key] ?? ''}
                onChange={(e) => setAnswer(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          ))}
        </div>
      )}

      {/* Erro */}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {/* Botão continuar */}
      <button
        disabled={!canAdvance || pending}
        onClick={advance}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        {pending && <Loader2 size={18} className="animate-spin" />}
        {isLastStep ? 'Concluir' : 'Continuar'}
      </button>
    </div>
  );
}
