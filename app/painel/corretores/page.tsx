import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMyCompany } from '@/lib/data';
import { BrokersManager } from '@/components/painel/BrokersManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Equipe de corretores', robots: { index: false } };

const ALLOWED_TYPES = ['imobiliaria'];

export default async function CorretoresPage() {
  const company = await getMyCompany();
  // Disponível apenas para imobiliárias nesta fase.
  if (!company || !ALLOWED_TYPES.includes(company.type)) redirect('/painel');

  const brokers = (company.brokers ?? []).map((b: any) => ({
    name: b.name,
    creci: b.creci ?? '',
    email: b.email ?? '',
    phone: b.phone ?? '',
    whatsapp: b.whatsapp ?? '',
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/painel" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Painel
      </Link>
      <h1 className="mb-1 text-2xl font-bold">Equipe de corretores</h1>
      <p className="mb-6 text-sm text-muted">
        Cadastre os corretores que atuam na sua empresa. Eles aparecem no seu perfil público.
      </p>
      <BrokersManager initialBrokers={brokers} companyWhatsapp={company.whatsapp ?? undefined} />
    </main>
  );
}
