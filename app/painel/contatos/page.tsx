import Link from 'next/link';
import { ArrowLeft, Phone, Mail, MessageCircle } from 'lucide-react';
import { getMyLeads } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contatos', robots: { index: false } };

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const channelLabel: Record<string, string> = {
  formulario: 'Formulário',
  whatsapp: 'WhatsApp',
  telefone: 'Telefone',
  ligacao: 'Ligação',
};

export default async function ContatosPage() {
  const leads = await getMyLeads();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/painel" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Painel
      </Link>
      <h1 className="mb-5 text-2xl font-bold">Contatos recebidos</h1>

      {leads.length ? (
        <ul className="space-y-3">
          {leads.map((l: any) => (
            <li key={l.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{l.name}</p>
                  {l.properties?.slug && (
                    <Link href={`/imovel/${l.properties.slug}`} className="text-xs text-link">
                      {l.properties.title}
                    </Link>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted">{fmtDate(l.created_at)}</span>
              </div>
              {l.channel && (
                <span className="mt-2 inline-flex rounded-full bg-bg px-2 py-0.5 text-xs text-muted">
                  {channelLabel[l.channel] ?? l.channel}
                </span>
              )}
              {l.message && <p className="mt-2 text-sm text-muted">{l.message}</p>}
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {l.phone && (
                  <a href={`https://wa.me/55${l.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-link">
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                )}
                {l.phone && (
                  <a href={`tel:${l.phone.replace(/\D/g, '')}`} className="inline-flex items-center gap-1 text-muted hover:text-text">
                    <Phone size={14} /> {l.phone}
                  </a>
                )}
                {l.email && (
                  <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 text-muted hover:text-text">
                    <Mail size={14} /> {l.email}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
          Nenhum contato ainda. Quando alguém te chamar por um anúncio, aparece aqui.
        </p>
      )}
    </main>
  );
}
