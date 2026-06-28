'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/format';

type R = { ok?: true; error?: string };

// Garante que quem chama é admin/moderador (defesa extra além da RLS).
async function ensureAdmin() {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const { data } = await sb.from('profiles').select('role').eq('id', auth.user.id).maybeSingle();
  if (!data || !['admin', 'moderador'].includes((data as any).role)) return null;
  return sb;
}

// ---- Imóveis ----
export async function adminSetPropertyStatus(id: string, status: string): Promise<R> {
  const sb = await ensureAdmin();
  if (!sb) return { error: 'Sem permissão.' };
  const patch: Record<string, any> = { status };
  if (status === 'ativo') patch.published_at = new Date().toISOString();
  const { error } = await sb.from('properties').update(patch).eq('id', id);
  revalidatePath('/admin/imoveis');
  return error ? { error: 'Falha ao atualizar.' } : { ok: true };
}

export async function adminTogglePropertyFeatured(id: string, featured: boolean): Promise<R> {
  const sb = await ensureAdmin();
  if (!sb) return { error: 'Sem permissão.' };
  const { error } = await sb.from('properties').update({ is_featured: featured }).eq('id', id);
  revalidatePath('/admin/imoveis');
  return error ? { error: 'Falha ao atualizar.' } : { ok: true };
}

// ---- Empresas ----
export async function adminUpdateCompany(id: string, patch: Record<string, any>): Promise<R> {
  const sb = await ensureAdmin();
  if (!sb) return { error: 'Sem permissão.' };
  const { error } = await sb.from('companies').update(patch).eq('id', id);
  revalidatePath('/admin/empresas');
  return error ? { error: 'Falha ao atualizar.' } : { ok: true };
}

// ---- Usuários ----
export async function adminSetUserRole(id: string, role: string): Promise<R> {
  const sb = await ensureAdmin();
  if (!sb) return { error: 'Sem permissão.' };
  if (!['particular', 'profissional', 'admin', 'moderador'].includes(role)) return { error: 'Papel inválido.' };
  const { error } = await sb.from('profiles').update({ role }).eq('id', id);
  revalidatePath('/admin/usuarios');
  return error ? { error: 'Falha ao atualizar.' } : { ok: true };
}

// ---- Cidades / bairros ----
export async function adminAddCity(name: string, featured: boolean): Promise<R> {
  const sb = await ensureAdmin();
  if (!sb) return { error: 'Sem permissão.' };
  if (!name.trim()) return { error: 'Informe o nome da cidade.' };
  const { error } = await sb.from('cities').insert({
    name: name.trim(),
    slug: slugify(name),
    state: 'BA',
    ddd: 77,
    is_featured: featured,
  });
  revalidatePath('/admin/cidades');
  return error ? { error: 'Falha ao criar (slug já existe?).' } : { ok: true };
}

export async function adminToggleCityFeatured(id: string, featured: boolean): Promise<R> {
  const sb = await ensureAdmin();
  if (!sb) return { error: 'Sem permissão.' };
  const { error } = await sb.from('cities').update({ is_featured: featured }).eq('id', id);
  revalidatePath('/admin/cidades');
  return error ? { error: 'Falha ao atualizar.' } : { ok: true };
}

export async function adminAddNeighborhood(cityId: string, name: string): Promise<R> {
  const sb = await ensureAdmin();
  if (!sb) return { error: 'Sem permissão.' };
  if (!cityId || !name.trim()) return { error: 'Escolha a cidade e informe o bairro.' };
  const { error } = await sb.from('neighborhoods').insert({
    city_id: cityId,
    name: name.trim(),
    slug: slugify(name),
  });
  revalidatePath('/admin/cidades');
  if (!error) return { ok: true };
  if (error.message.includes('duplicate key')) return { error: 'Esse bairro já existe nessa cidade.' };
  return { error: 'Falha ao criar bairro.' };
}
