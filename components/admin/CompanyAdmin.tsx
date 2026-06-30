'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck, Pencil, Star, Trash2 } from 'lucide-react';
import { adminRemoveCompany, adminUpdateCompany } from '@/app/admin/actions';

export function CompanyAdmin({
  company,
}: {
  company: {
    id: string;
    trade_name: string;
    legal_name?: string | null;
    email?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    website?: string | null;
    instagram?: string | null;
    description?: string | null;
    status: string;
    is_verified: boolean;
    is_featured: boolean;
  };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const run = (patch: Record<string, any>) => start(async () => {
    setMessage('');
    const r = await adminUpdateCompany(company.id, patch);
    setMessage(r?.error || 'Atualizado.');
    if (!r?.error) {
      setEditing(false);
      router.refresh();
    }
  });

  const btn = 'inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs disabled:opacity-50';
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <button disabled={pending} onClick={() => run({ is_verified: !company.is_verified })} className={`${btn} ${company.is_verified ? 'text-link' : 'text-muted'}`}>
          <BadgeCheck size={13} /> {company.is_verified ? 'Verificada' : 'Verificar'}
        </button>
        <button disabled={pending} onClick={() => run({ is_featured: !company.is_featured })} className={`${btn} ${company.is_featured ? 'text-accent' : 'text-muted'}`}>
          <Star size={13} className={company.is_featured ? 'fill-accent' : ''} /> Destaque
        </button>
        <button disabled={pending} onClick={() => setEditing(true)} className={`${btn} text-muted`}>
          <Pencil size={13} /> Editar
        </button>
        <button
          disabled={pending}
          onClick={() => {
            if (confirm('Remover esta empresa? Ela deixará de aparecer publicamente, mas os dados históricos serão preservados.')) {
              start(async () => {
                setMessage('');
                const r = await adminRemoveCompany(company.id);
                setMessage(r?.error || 'Atualizado.');
                if (!r?.error) router.refresh();
              });
            }
          }}
          className={`${btn} text-danger`}
        >
          <Trash2 size={13} /> Remover
        </button>
      </div>
      {editing && (
        <form
          className="mt-2 grid w-full min-w-[300px] gap-2 rounded-lg border border-border bg-bg p-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            run({
              trade_name: String(form.get('trade_name') || '').trim(),
              legal_name: String(form.get('legal_name') || '').trim() || null,
              email: String(form.get('email') || '').trim() || null,
              phone: String(form.get('phone') || '').trim() || null,
              whatsapp: String(form.get('whatsapp') || '').trim() || null,
              website: String(form.get('website') || '').trim() || null,
              instagram: String(form.get('instagram') || '').trim() || null,
              description: String(form.get('description') || '').trim() || null,
            });
          }}
        >
          <input name="trade_name" required defaultValue={company.trade_name ?? ''} placeholder="Nome fantasia" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="legal_name" defaultValue={company.legal_name ?? ''} placeholder="Razão social" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="email" defaultValue={company.email ?? ''} placeholder="E-mail" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="phone" defaultValue={company.phone ?? ''} placeholder="Telefone" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="whatsapp" defaultValue={company.whatsapp ?? ''} placeholder="WhatsApp" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="website" defaultValue={company.website ?? ''} placeholder="Site" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <input name="instagram" defaultValue={company.instagram ?? ''} placeholder="Instagram" className="rounded-md border border-border bg-surface px-2 py-1.5 text-sm" />
          <textarea name="description" defaultValue={company.description ?? ''} placeholder="Descrição" className="min-h-20 rounded-md border border-border bg-surface px-2 py-1.5 text-sm sm:col-span-2" />
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={pending} className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-on-primary disabled:opacity-50">Salvar</button>
            <button type="button" disabled={pending} onClick={() => setEditing(false)} className="rounded-md border border-border px-3 py-1.5 text-sm">Cancelar</button>
          </div>
        </form>
      )}
      {message && <p className={message === 'Atualizado.' ? 'text-xs text-success' : 'text-xs text-danger'}>{message}</p>}
    </div>
  );
}
