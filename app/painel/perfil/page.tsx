import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMyProfile, getCitiesAll } from '@/lib/data';
import { ProfileForm } from '@/components/painel/ProfileForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Meu perfil', robots: { index: false } };

export default async function PerfilPage() {
  const [profile, cities] = await Promise.all([getMyProfile(), getCitiesAll()]);
  if (!profile) redirect('/entrar');

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/painel" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-text">
        <ArrowLeft size={15} /> Painel
      </Link>
      <h1 className="mb-1 text-2xl font-bold">Meu perfil</h1>
      <p className="mb-6 text-sm text-muted">Atualize seu nome, contatos, foto e cidade.</p>
      <ProfileForm profile={profile as any} cities={cities as any} />
    </main>
  );
}
