'use server';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/supabase/types';
import { createServiceClient } from '@/lib/supabase/service';
import { ensureAdmin, logAdminAction } from '@/lib/admin/guard';

type R = { ok?: true; error?: string };
type Service = ReturnType<typeof createServiceClient>;
type Banner = Database['public']['Tables']['banners']['Row'];
type AdStatus = Database['public']['Enums']['manual_contract_status'];

const DAY = 86_400_000;
const isUuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);
const iso = (d: Date) => d.toISOString();
const addDays = (base: Date, days: number) => new Date(base.getTime() + days * DAY);

const PAYMENT_METHODS = ['dinheiro', 'pix', 'transferencia', 'cartao_manual', 'fatura', 'cortesia', 'outro'];
const PAYMENT_STATUSES = ['pendente', 'pago', 'parcial', 'isento'];

// Um banner é exibido (is_active) somente se ATIVO e dentro da janela de datas.
function displayActive(status: AdStatus, startsAt: string | null, endsAt: string | null): boolean {
  if (status !== 'ativo') return false;
  const now = Date.now();
  if (startsAt && new Date(startsAt).getTime() > now) return false; // agendado
  if (endsAt && new Date(endsAt).getTime() <= now) return false; // expirado por data
  return true;
}

function revalidateAdSurfaces(citySlug?: string | null) {
  revalidatePath('/admin/publicidade');
  revalidatePath('/'); // carrossel da home
  if (citySlug) revalidatePath(`/${citySlug}`);
}

async function citySlugOf(sb: Service, cityId: string | null | undefined) {
  if (!cityId) return null;
  const { data } = await sb.from('cities').select('slug').eq('id', cityId).maybeSingle();
  return (data as any)?.slug ?? null;
}

async function logHistory(
  sb: Service,
  bannerId: string,
  action: string,
  adminId: string,
  opts: { from?: string | null; to?: string | null; reason?: string | null; metadata?: Record<string, unknown> } = {},
) {
  await sb.from('contract_status_history').insert({
    contract_type: 'ad',
    contract_id: bannerId,
    action,
    from_status: opts.from ?? null,
    to_status: opts.to ?? null,
    admin_id: adminId,
    reason: opts.reason ?? null,
    metadata: (opts.metadata ?? {}) as any,
  });
}

// =====================================================================
// CRIAÇÃO
// =====================================================================
export type CreateAdInput = {
  companyId?: string | null;
  internalName: string;
  displayTitle?: string | null;
  targetUrl: string;
  imageUrl: string;        // desktop (obrigatória)
  imageUrlMobile?: string | null;
  cityId?: string | null;  // null = regional (home)
  priority?: number;
  durationDays: number;
  startsAt: string;
  endsAt: string;
  paymentMethod: string;
  paymentStatus: string;
  amount?: number | null;
  autoRenew?: boolean;
  scheduled?: boolean;
  internalNotes?: string | null;
};

export async function adminCreateAdContract(input: CreateAdInput): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if (!input.internalName?.trim()) return { error: 'Informe o nome/título do banner.' };
  if (!input.imageUrl) return { error: 'Envie a imagem do banner (desktop).' };
  if (!/^https?:\/\//i.test(input.targetUrl || '')) return { error: 'Informe uma URL de destino válida (http/https).' };
  if (!PAYMENT_METHODS.includes(input.paymentMethod)) return { error: 'Forma de pagamento inválida.' };
  if (!PAYMENT_STATUSES.includes(input.paymentStatus)) return { error: 'Status de pagamento inválido.' };
  if (!Number.isFinite(input.durationDays) || input.durationDays <= 0) return { error: 'Duração (dias) inválida.' };
  const starts = new Date(input.startsAt);
  const ends = new Date(input.endsAt);
  if (isNaN(starts.getTime()) || isNaN(ends.getTime())) return { error: 'Datas inválidas.' };
  if (ends.getTime() <= starts.getTime()) return { error: 'O término deve ser depois do início.' };
  if (input.companyId && !isUuid(input.companyId)) return { error: 'Cliente inválido.' };
  if (input.cityId && !isUuid(input.cityId)) return { error: 'Cidade inválida.' };

  const now = new Date();
  const scheduled = !!input.scheduled && starts.getTime() > now.getTime();
  const status: AdStatus = scheduled ? 'agendado' : 'ativo';

  const { data: created, error } = await admin.sb
    .from('banners')
    .insert({
      slot: 'home_topo',
      company_id: input.companyId ?? null,
      internal_name: input.internalName.trim(),
      title: input.displayTitle?.trim() || input.internalName.trim(),
      target_url: input.targetUrl.trim(),
      image_url: input.imageUrl,
      image_url_mobile: input.imageUrlMobile ?? null,
      city_id: input.cityId ?? null,
      priority: Number.isFinite(input.priority) ? Math.trunc(input.priority as number) : 0,
      duration_days: Math.trunc(input.durationDays),
      starts_at: iso(starts),
      ends_at: iso(ends),
      payment_method: input.paymentMethod,
      payment_status: input.paymentStatus,
      amount: input.amount ?? null,
      auto_renew: !!input.autoRenew,
      status,
      is_active: displayActive(status, iso(starts), iso(ends)),
      internal_notes: input.internalNotes?.trim() || null,
      created_by: admin.adminId,
      updated_by: admin.adminId,
    })
    .select('id,city_id')
    .maybeSingle();

  if (error) return { error: `Falha ao criar anúncio: ${error.message}` };
  if (!created) return { error: 'Não foi possível criar o anúncio.' };

  await logHistory(admin.sb, (created as any).id, 'create', admin.adminId, { to: status, metadata: { internal_name: input.internalName, city_id: input.cityId } });
  await logAdminAction(admin.sb, admin.adminId, 'ad_contract.create', 'banner', (created as any).id, { company_id: input.companyId, city_id: input.cityId });
  revalidateAdSurfaces(await citySlugOf(admin.sb, input.cityId));
  return { ok: true };
}

// =====================================================================
// EDIÇÃO (inclui troca de imagem, cidade, pagamento, auto-renovação)
// =====================================================================
export type UpdateAdPatch = {
  internalName?: string;
  displayTitle?: string | null;
  targetUrl?: string;
  imageUrl?: string;
  imageUrlMobile?: string | null;
  cityId?: string | null;
  priority?: number;
  durationDays?: number;
  startsAt?: string;
  endsAt?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  amount?: number | null;
  autoRenew?: boolean;
  internalNotes?: string | null;
};

export async function adminUpdateAdContract(id: string, patch: UpdateAdPatch): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if (!isUuid(id)) return { error: 'Anúncio inválido.' };
  const { data: cur } = await admin.sb.from('banners').select('*').eq('id', id).maybeSingle();
  if (!cur) return { error: 'Anúncio não encontrado.' };
  const c = cur as Banner;

  const next: Record<string, unknown> = { updated_by: admin.adminId };
  const changes: Record<string, unknown> = {};
  if (patch.internalName !== undefined) {
    if (!patch.internalName.trim()) return { error: 'Informe o nome do banner.' };
    next.internal_name = patch.internalName.trim();
  }
  if (patch.displayTitle !== undefined) next.title = patch.displayTitle?.trim() || (patch.internalName?.trim() ?? c.internal_name ?? c.title);
  if (patch.targetUrl !== undefined) {
    if (!/^https?:\/\//i.test(patch.targetUrl)) return { error: 'URL de destino inválida.' };
    next.target_url = patch.targetUrl.trim();
  }
  if (patch.imageUrl !== undefined && patch.imageUrl) { next.image_url = patch.imageUrl; changes.image = 'trocada'; }
  if (patch.imageUrlMobile !== undefined) next.image_url_mobile = patch.imageUrlMobile;
  if (patch.cityId !== undefined) {
    if (patch.cityId && !isUuid(patch.cityId)) return { error: 'Cidade inválida.' };
    if ((patch.cityId ?? null) !== (c.city_id ?? null)) changes.city = { from: c.city_id, to: patch.cityId ?? null };
    next.city_id = patch.cityId ?? null;
  }
  if (patch.priority !== undefined) next.priority = Math.trunc(patch.priority);
  if (patch.durationDays !== undefined) {
    if (!Number.isFinite(patch.durationDays) || patch.durationDays <= 0) return { error: 'Duração inválida.' };
    next.duration_days = Math.trunc(patch.durationDays);
  }
  const starts = patch.startsAt ? new Date(patch.startsAt) : c.starts_at ? new Date(c.starts_at) : null;
  const ends = patch.endsAt ? new Date(patch.endsAt) : c.ends_at ? new Date(c.ends_at) : null;
  if (patch.startsAt || patch.endsAt) {
    if ((starts && isNaN(starts.getTime())) || (ends && isNaN(ends.getTime()))) return { error: 'Datas inválidas.' };
    if (starts && ends && ends.getTime() <= starts.getTime()) return { error: 'O término deve ser depois do início.' };
    next.starts_at = starts ? iso(starts) : null;
    next.ends_at = ends ? iso(ends) : null;
    if (patch.endsAt) changes.ends_at = { from: c.ends_at, to: ends ? iso(ends) : null };
  }
  if (patch.paymentMethod !== undefined) {
    if (!PAYMENT_METHODS.includes(patch.paymentMethod)) return { error: 'Forma de pagamento inválida.' };
    next.payment_method = patch.paymentMethod;
  }
  if (patch.paymentStatus !== undefined) {
    if (!PAYMENT_STATUSES.includes(patch.paymentStatus)) return { error: 'Status de pagamento inválido.' };
    if (patch.paymentStatus !== c.payment_status) changes.payment_status = { from: c.payment_status, to: patch.paymentStatus };
    next.payment_status = patch.paymentStatus;
  }
  if (patch.amount !== undefined) next.amount = patch.amount ?? null;
  if (patch.autoRenew !== undefined) {
    if (patch.autoRenew !== c.auto_renew) changes.auto_renew = { from: c.auto_renew, to: patch.autoRenew };
    next.auto_renew = !!patch.autoRenew;
  }
  if (patch.internalNotes !== undefined) next.internal_notes = patch.internalNotes?.trim() || null;

  // Recalcula display se datas mudaram e o contrato está ativo.
  const effStarts = (next.starts_at as string | undefined) ?? c.starts_at;
  const effEnds = (next.ends_at as string | undefined) ?? c.ends_at;
  next.is_active = displayActive(c.status as AdStatus, effStarts, effEnds);

  const { data: updated, error } = await admin.sb.from('banners').update(next as any).eq('id', id).select('id,city_id').maybeSingle();
  if (error) return { error: `Falha ao atualizar: ${error.message}` };
  if (!updated) return { error: 'Anúncio não encontrado.' };

  await logHistory(admin.sb, id, 'edit', admin.adminId, { from: c.status, to: c.status, metadata: changes });
  await logAdminAction(admin.sb, admin.adminId, 'ad_contract.update', 'banner', id, changes);
  revalidateAdSurfaces(await citySlugOf(admin.sb, (updated as any).city_id));
  return { ok: true };
}

// =====================================================================
// CICLO DE VIDA
// =====================================================================
export type AdAction = 'activate' | 'pause' | 'resume' | 'cancel' | 'expire' | 'reactivate' | 'renew';

export async function adminAdContractAction(
  id: string,
  action: AdAction,
  opts: { reason?: string; keepEndDate?: boolean } = {},
): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if (!isUuid(id)) return { error: 'Anúncio inválido.' };
  const { data: cur } = await admin.sb.from('banners').select('*').eq('id', id).maybeSingle();
  if (!cur) return { error: 'Anúncio não encontrado.' };
  const c = cur as Banner;
  const now = new Date();
  const duration = c.duration_days ?? 30;
  const patch: Record<string, unknown> = { updated_by: admin.adminId };
  let toStatus: AdStatus = c.status as AdStatus;
  const meta: Record<string, unknown> = {};

  switch (action) {
    case 'activate': {
      if (c.status === 'ativo') return { error: 'O anúncio já está ativo.' };
      toStatus = 'ativo'; patch.status = 'ativo';
      if (!c.ends_at || new Date(c.ends_at).getTime() <= now.getTime()) {
        patch.starts_at = iso(now); patch.ends_at = iso(addDays(now, duration));
        meta.ends_at = { to: patch.ends_at };
      }
      break;
    }
    case 'pause':
      if (c.status !== 'ativo' && c.status !== 'agendado') return { error: 'Só é possível pausar um anúncio ativo.' };
      toStatus = 'pausado'; patch.status = 'pausado'; break;
    case 'resume': {
      if (c.status !== 'pausado') return { error: 'Só é possível retomar um anúncio pausado.' };
      toStatus = 'ativo'; patch.status = 'ativo';
      if (!opts.keepEndDate || !c.ends_at || new Date(c.ends_at).getTime() <= now.getTime()) {
        patch.starts_at = iso(now); patch.ends_at = iso(addDays(now, duration));
        meta.ends_at = { to: patch.ends_at };
      }
      break;
    }
    case 'cancel':
      if (c.status === 'cancelado') return { error: 'O anúncio já está cancelado.' };
      toStatus = 'cancelado'; patch.status = 'cancelado'; break;
    case 'expire':
      if (c.status === 'expirado') return { error: 'O anúncio já está expirado.' };
      toStatus = 'expirado'; patch.status = 'expirado'; break;
    case 'reactivate': {
      if (c.status !== 'expirado' && c.status !== 'cancelado') return { error: 'Só reativa anúncio expirado ou cancelado.' };
      toStatus = 'ativo'; patch.status = 'ativo';
      const keep = opts.keepEndDate && c.ends_at && new Date(c.ends_at).getTime() > now.getTime();
      if (!keep) { patch.starts_at = iso(now); patch.ends_at = iso(addDays(now, duration)); meta.ends_at = { to: patch.ends_at }; }
      break;
    }
    case 'renew': {
      const base = c.ends_at && new Date(c.ends_at).getTime() > now.getTime() ? new Date(c.ends_at) : now;
      toStatus = 'ativo'; patch.status = 'ativo';
      patch.ends_at = iso(addDays(base, duration));
      patch.payment_status = c.payment_status === 'isento' ? 'isento' : 'pendente';
      meta.ends_at = { from: c.ends_at, to: patch.ends_at }; meta.payment_status = patch.payment_status;
      break;
    }
    default:
      return { error: 'Ação inválida.' };
  }

  const effStarts = (patch.starts_at as string | undefined) ?? c.starts_at;
  const effEnds = (patch.ends_at as string | undefined) ?? c.ends_at;
  patch.is_active = displayActive(toStatus, effStarts, effEnds);

  const { data: updated, error } = await admin.sb.from('banners').update(patch as any).eq('id', id).select('id,city_id').maybeSingle();
  if (error) return { error: `Falha na ação: ${error.message}` };
  if (!updated) return { error: 'Anúncio não encontrado.' };

  await logHistory(admin.sb, id, action, admin.adminId, { from: c.status, to: toStatus, reason: opts.reason, metadata: meta });
  await logAdminAction(admin.sb, admin.adminId, `ad_contract.${action}`, 'banner', id, { from: c.status, to: toStatus, ...meta });
  revalidateAdSurfaces(await citySlugOf(admin.sb, (updated as any).city_id));
  return { ok: true };
}

export async function adminDeleteAdContract(id: string): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if (!isUuid(id)) return { error: 'Anúncio inválido.' };
  const { data, error } = await admin.sb.from('banners').delete().eq('id', id).select('id,city_id').maybeSingle();
  if (error) return { error: `Falha ao excluir: ${error.message}` };
  if (!data) return { error: 'Anúncio não encontrado.' };
  await logAdminAction(admin.sb, admin.adminId, 'ad_contract.delete', 'banner', id, {});
  revalidateAdSurfaces(await citySlugOf(admin.sb, (data as any).city_id));
  return { ok: true };
}
