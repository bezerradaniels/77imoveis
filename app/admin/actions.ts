'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { Database } from '@/lib/supabase/types';
import { slugify } from '@/lib/format';

type R = { ok?: true; error?: string };

type ListingStatus = Database['public']['Enums']['listing_status'];
const allowedRoles = ['particular', 'profissional', 'admin', 'moderador'] as const;
type UserRole = (typeof allowedRoles)[number];
const companyStatuses = ['ativo', 'pendente', 'pausado', 'bloqueado', 'arquivado', 'removido'] as const;
const brokerStatuses = ['ativo', 'pendente', 'aprovado', 'reprovado', 'inativo', 'arquivado', 'removido'] as const;

// Garante que quem chama é admin/moderador (defesa extra além da RLS).
async function ensureAdmin() {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const { data } = await sb.from('profiles').select('role,is_active').eq('id', auth.user.id).maybeSingle();
  if (!data || !(data as any).is_active || !['admin', 'moderador'].includes((data as any).role)) return null;
  return { sb: createServiceClient(), adminId: auth.user.id };
}

async function logAdminAction(
  sb: ReturnType<typeof createServiceClient>,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>,
) {
  await sb.from('audit_logs').insert({ actor_id: actorId, action, entity_type: entityType, entity_id: entityId, metadata: (metadata ?? {}) as any });
}

async function revalidatePropertySurfaces(sb: ReturnType<typeof createServiceClient>, id: string) {
  const { data } = await sb
    .from('properties')
    .select('slug,cities(slug),companies(slug),brokers(id)')
    .eq('id', id)
    .maybeSingle();
  revalidatePath('/admin/imoveis');
  revalidatePath('/imoveis');
  revalidatePath('/');
  if ((data as any)?.slug) revalidatePath(`/imovel/${(data as any).slug}`);
  if ((data as any)?.cities?.slug) revalidatePath(`/${(data as any).cities.slug}`);
  if ((data as any)?.companies?.slug) revalidatePath(`/empresa/${(data as any).companies.slug}`);
}

// ---- Imóveis ----
function propertyUpdatePatch(status: ListingStatus) {
  return {
    status,
    ...(status === 'ativo' ? { published_at: new Date().toISOString() } : {}),
  } as Partial<Database['public']['Tables']['properties']['Update']>;
}

export async function adminSetPropertyStatus(id: string, status: ListingStatus): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };

  const patch = propertyUpdatePatch(status);

  const { error } = await admin.sb.from('properties').update(patch).eq('id', id);
  await revalidatePropertySurfaces(admin.sb, id);
  if (error) return { error: `Falha ao atualizar: ${error.message}` };
  await logAdminAction(admin.sb, admin.adminId, 'property.status', 'property', id, { status });
  return { ok: true };
}

export async function adminTogglePropertyFeatured(id: string, featured: boolean): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  const { error } = await admin.sb.from('properties').update({ is_featured: featured }).eq('id', id);
  await revalidatePropertySurfaces(admin.sb, id);
  if (error) return { error: `Falha ao atualizar: ${error.message}` };
  await logAdminAction(admin.sb, admin.adminId, 'property.featured', 'property', id, { featured });
  return { ok: true };
}

// ---- Empresas ----
export async function adminUpdateCompany(id: string, patch: Partial<Database['public']['Tables']['companies']['Update']>): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if (patch.status && !companyStatuses.includes(patch.status as any)) return { error: 'Status inválido.' };
  const safePatch = {
    trade_name: patch.trade_name,
    legal_name: patch.legal_name,
    email: patch.email,
    phone: patch.phone,
    whatsapp: patch.whatsapp,
    website: patch.website,
    instagram: patch.instagram,
    description: patch.description,
    status: patch.status,
    is_verified: patch.is_verified,
    is_featured: patch.is_featured,
  };
  const { error } = await admin.sb.from('companies').update(safePatch).eq('id', id);
  revalidatePath('/admin/empresas');
  revalidatePath('/imobiliarias');
  revalidatePath('/corretores');
  revalidatePath('/profissionais');
  if (error) return { error: `Falha ao atualizar: ${error.message}` };
  const { data } = await admin.sb.from('companies').select('slug').eq('id', id).maybeSingle();
  if (data?.slug) revalidatePath(`/empresa/${data.slug}`);
  await logAdminAction(admin.sb, admin.adminId, 'company.update', 'company', id, patch as Record<string, unknown>);
  return { ok: true };
}

// ---- Usuários ----
export async function adminSetUserRole(id: string, role: UserRole): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if (!allowedRoles.includes(role)) return { error: 'Papel inválido.' };
  const { error } = await admin.sb.from('profiles').update({ role }).eq('id', id);
  revalidatePath('/admin/usuarios');
  if (error) return { error: `Falha ao atualizar: ${error.message}` };
  await logAdminAction(admin.sb, admin.adminId, 'user.role', 'profile', id, { role });
  return { ok: true };
}

export async function adminUpdateUser(id: string, patch: Partial<Database['public']['Tables']['profiles']['Update']>): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  const safePatch = {
    full_name: patch.full_name,
    email: patch.email,
    phone: patch.phone,
    whatsapp: patch.whatsapp,
    city_id: patch.city_id || null,
  };
  const { error } = await admin.sb.from('profiles').update(safePatch).eq('id', id);
  revalidatePath('/admin/usuarios');
  if (error) return { error: `Falha ao salvar usuário: ${error.message}` };
  await logAdminAction(admin.sb, admin.adminId, 'user.update', 'profile', id, safePatch);
  return { ok: true };
}

// ---- Cidades / bairros ----
export async function adminAddCity(name: string, featured: boolean): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if (!name.trim()) return { error: 'Informe o nome da cidade.' };
  const { error } = await admin.sb.from('cities').insert({
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
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  const { error } = await admin.sb.from('cities').update({ is_featured: featured }).eq('id', id);
  revalidatePath('/admin/cidades');
  return error ? { error: 'Falha ao atualizar.' } : { ok: true };
}

export async function adminAddNeighborhood(cityId: string, name: string): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if (!cityId || !name.trim()) return { error: 'Escolha a cidade e informe o bairro.' };
  const { error } = await admin.sb.from('neighborhoods').insert({
    city_id: cityId,
    name: name.trim(),
    slug: slugify(name),
  });
  revalidatePath('/admin/cidades');
  if (!error) return { ok: true };
  if (error.message.includes('duplicate key')) return { error: 'Esse bairro já existe nessa cidade.' };
  return { error: 'Falha ao criar bairro.' };
}

// ---- Remover imóvel ----
export async function adminDeleteProperty(id: string): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  const { error } = await admin.sb
    .from('properties')
    .update({ status: 'arquivado', is_featured: false })
    .eq('id', id);
  await revalidatePropertySurfaces(admin.sb, id);
  if (error) return { error: `Falha ao remover: ${error.message}` };
  await logAdminAction(admin.sb, admin.adminId, 'property.remove', 'property', id, { status: 'arquivado' });
  return { ok: true };
}

// ---- Bloquear / desbloquear usuário ----
export async function adminSetUserActive(id: string, active: boolean): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  const { error } = await admin.sb.from('profiles').update({ is_active: active }).eq('id', id);
  revalidatePath('/admin/usuarios');
  if (error) return { error: `Falha ao atualizar: ${error.message}` };
  await logAdminAction(admin.sb, admin.adminId, active ? 'user.enable' : 'user.disable', 'profile', id, { is_active: active });
  return { ok: true };
}

// ---- Corretores ----
export async function adminUpdateBroker(id: string, patch: Partial<Database['public']['Tables']['brokers']['Update']>): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if ((patch as any).status && !brokerStatuses.includes((patch as any).status)) return { error: 'Status inválido.' };
  const safePatch = {
    name: patch.name,
    email: patch.email,
    creci: patch.creci,
    phone: patch.phone,
    whatsapp: patch.whatsapp,
    photo_url: patch.photo_url,
    status: (patch as any).status,
    verified_at: (patch as any).verified_at,
    approved_at: (patch as any).approved_at,
    rejected_at: (patch as any).rejected_at,
    disabled_at: (patch as any).disabled_at,
  };
  const { error } = await admin.sb.from('brokers').update(safePatch as any).eq('id', id);
  revalidatePath('/admin/corretores');
  revalidatePath('/corretores');
  revalidatePath('/profissionais/corretor_autonomo');
  if (error) return { error: `Falha ao atualizar corretor: ${error.message}` };
  await logAdminAction(admin.sb, admin.adminId, 'broker.update', 'broker', id, safePatch);
  return { ok: true };
}

export async function adminSetBrokerStatus(id: string, status: string): Promise<R> {
  const now = new Date().toISOString();
  const patch: any = { status };
  if (status === 'aprovado' || status === 'ativo') patch.approved_at = now;
  if (status === 'reprovado') patch.rejected_at = now;
  if (status === 'inativo' || status === 'arquivado' || status === 'removido') patch.disabled_at = now;
  return adminUpdateBroker(id, patch);
}

// ---- Banners ----
export async function adminToggleBanner(id: string, active: boolean): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  const { error } = await admin.sb.from('banners').update({ is_active: active }).eq('id', id);
  revalidatePath('/admin/banners');
  return error ? { error: 'Falha ao atualizar.' } : { ok: true };
}

export async function adminDeleteBanner(id: string): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  const { error } = await admin.sb.from('banners').delete().eq('id', id);
  revalidatePath('/admin/banners');
  return error ? { error: 'Falha ao excluir.' } : { ok: true };
}

export async function adminCreateBanner(data: {
  title: string;
  image_url: string;
  target_url: string;
  slot: Database['public']['Enums']['banner_slot'];
}): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if (!data.image_url || !data.target_url || !data.slot) return { error: 'Preencha todos os campos.' };
  const { error } = await admin.sb.from('banners').insert({ ...data, is_active: true });
  revalidatePath('/admin/banners');
  return error ? { error: 'Falha ao criar banner.' } : { ok: true };
}

// ---- Vitrines ----
// Usa service_role para contornar o trigger guard_storefront_status.
export async function adminToggleStorefront(id: string, active: boolean): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  const service = createServiceClient();
  const patch: Partial<Database['public']['Tables']['storefronts']['Update']> = active
    ? { status: 'ativo', activated_at: new Date().toISOString(), expires_at: null }
    : { status: 'expirado' };
  const { error } = await service.from('storefronts').update(patch).eq('id', id);
  revalidatePath('/admin/vitrines');
  return error ? { error: 'Falha ao atualizar vitrine.' } : { ok: true };
}
