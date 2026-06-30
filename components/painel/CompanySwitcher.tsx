'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronDown, Plus, Building2, User } from 'lucide-react';
import { companyTypeLabel } from '@/lib/constants';
import { setActiveCompany } from '@/app/painel/actions';

type Company = { id: string; type: string; trade_name: string };

export function CompanySwitcher({
  companies,
  activeId,
}: {
  companies: Company[];
  activeId: string | null; // id da empresa ativa, ou null = perfil pessoal
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const active = companies.find((c) => c.id === activeId) ?? null;
  const label = active ? active.trade_name : 'Perfil pessoal';
  const sub = active ? companyTypeLabel(active.type) : 'Conta pessoal';

  function choose(id: string) {
    setOpen(false);
    start(async () => {
      await setActiveCompany(id);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="flex w-full items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-3 py-2 text-left transition hover:bg-slate-50 disabled:opacity-60"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {active ? <Building2 size={16} /> : <User size={16} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold leading-tight text-slate-900">{label}</span>
          <span className="block truncate text-xs text-slate-500">{sub}</span>
        </span>
        <ChevronDown size={16} className="shrink-0 text-slate-500" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-slate-300 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => choose('pessoal')}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
            >
              <User size={15} className="shrink-0 text-slate-500" />
              <span className="flex-1">Perfil pessoal</span>
              {!active && <Check size={15} className="text-primary" />}
            </button>
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => choose(c.id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <Building2 size={15} className="shrink-0 text-slate-500" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{c.trade_name}</span>
                  <span className="block truncate text-xs text-slate-500">{companyTypeLabel(c.type)}</span>
                </span>
                {c.id === activeId && <Check size={15} className="shrink-0 text-primary" />}
              </button>
            ))}
            <a
              href="/painel/empresa?nova=1"
              className="flex items-center gap-2 border-t border-slate-200 px-3 py-2 text-sm font-semibold text-primary hover:bg-slate-50"
            >
              <Plus size={15} /> Criar empresa
            </a>
          </div>
        </>
      )}
    </div>
  );
}
