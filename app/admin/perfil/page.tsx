import { redirect } from 'next/navigation';
import { getMyProfile, getCitiesAll } from '@/lib/data';
import { ProfileForm } from '@/components/painel/ProfileForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Meu perfil — Admin', robots: { index: false } };

export default async function AdminPerfilPage() {
  const [profile, cities] = await Promise.all([getMyProfile(), getCitiesAll()]);
  if (!profile) redirect('/entrar');

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Meu perfil</h1>
      <p className="mb-6 text-sm text-muted">Atualize seu nome, contatos, foto e cidade.</p>
      <ProfileForm profile={profile as any} cities={cities as any} />
    </div>
  );
}
