'use server';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/lib/supabase/types';
import { createServiceClient } from '@/lib/supabase/service';
import { ensureAdmin, logAdminAction } from '@/lib/admin/guard';

type R = { ok?: true; error?: string };
type Service = ReturnType<typeof createServiceClient>;

type ManualContract = Database['public']['Tables']['manual_contracts']['Row'];
type ManualStatus = Database['public']['Enums']['manual_contract_status'];

const DAY = 86_400_000;
const isUuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);
const iso = (d: Date) => d.toISOString();
const addDays = (base: Date, days: number) => new Date(base.getTime() + days * DAY);
const daysBetween = (from: Date, to: Date) => Math.max(0, Math.ceil((to.getTime() - from.getTime()) / DAY));

const PAYMENT_METHODS = ['dinheiro', 'pix', 'transferencia', 'cartao_manual', 'fatura', 'cortesia', 'outro'] as const;
const PAYMENT_STATUSES = ['pendente', 'pago', 'parcial', 'isento'] as const;
const OPEN_STATUSES: ManualStatus[] = ['ativo', 'agendado'];

// Revalida todas as superfícies afetadas por uma mudança de contrato.
function revalidateContractSurfaces() {
  revalidatePath('/admin/contratos');
  revalidatePath('/admin/clientes');
  revalidatePath('/admin/planos');
  revalidatePath('/painel');
  revalidatePath('/painel/planos');
}

// Escreve uma entrada no histórico de ciclo de vida do contrato.
async function logHistory(
  sb: Service,
  contractId: string,
  action: string,
  adminId: string,
  opts: { from?: string | null; to?: string | null; reason?: string | null; metadata?: Record<string, unknown> } = {},
) {
  await sb.from('contract_status_history').insert({
    contract_type: 'plan',
    contract_id: contractId,
    action,
    from_status: opts.from ?? null,
    to_status: opts.to ?? null,
    admin_id: adminId,
    reason: opts.reason ?? null,
    metadata: (opts.metadata ?? {}) as any,
  });
}

// SINCRONIZA a subscription espelho (gateway='manual') a partir do contrato.
// É a ponte que faz toda a lógica de acesso existente (limites de imóveis,
// resumo do painel) enxergar o plano manual.
async function syncSubscription(sb: Service, contract: ManualContract) {
  const now = new Date();
  const starts = contract.starts_at ? new Date(contract.starts_at) : now;
  const scheduledFuture = contract.status === 'agendado' && starts.getTime() > now.getTime();

  // Estado da subscription espelho:
  //  ativo (e já iniciado)  -> 'ativa'  (concede acesso)
  //  agendado no futuro     -> 'pendente' (sem acesso até iniciar)
  //  pausado/cancelado/expirado -> 'cancelada' (sem acesso)
  let subStatus: Database['public']['Enums']['subscription_status'];
  if (contract.status === 'ativo' || (contract.status === 'agendado' && !scheduledFuture)) {
    subStatus = 'ativa';
  } else if (scheduledFuture) {
    subStatus = 'pendente';
  } else {
    subStatus = 'cancelada';
  }

  const patch = {
    company_id: contract.company_id,
    plan_id: contract.plan_id,
    status: subStatus,
    gateway: 'manual',
    current_period_start: contract.starts_at,
    current_period_end: contract.ends_at,
    manual_contract_id: contract.id,
    max_listings_override: contract.max_active_listings,
    featured_override: contract.included_featured,
    custom_plan_name: contract.plan_name,
  };

  const { data: existing } = await sb
    .from('subscriptions')
    .select('id')
    .eq('manual_contract_id', contract.id)
    .maybeSingle();

  if (existing) {
    await sb.from('subscriptions').update(patch).eq('id', (existing as any).id);
  } else {
    await sb.from('subscriptions').insert(patch);
  }
}

// =====================================================================
// CRIAÇÃO
// =====================================================================
export type CreateContractInput = {
  companyId: string;
  planId?: string | null;
  planName: string;
  planType?: string | null;
  maxActiveListings: number;
  includedFeatured: number;
  cityScope?: string[] | null;
  durationDays: number;
  startsAt: string;      // ISO
  endsAt: string;        // ISO (editável)
  paymentMethod: string;
  paymentStatus: string;
  amount?: number | null;
  autoRenew?: boolean;
  scheduled?: boolean;   // começa no futuro
  internalNotes?: string | null;
  publicNotes?: string | null;
};

export async function adminCreateManualContract(input: CreateContractInput): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };

  // Validação de entrada (nunca falhar em silêncio).
  if (!isUuid(input.companyId)) return { error: 'Selecione um cliente válido.' };
  if (!input.planName?.trim()) return { error: 'Informe o nome do plano.' };
  if (!Number.isFinite(input.maxActiveListings) || input.maxActiveListings < 0)
    return { error: 'Limite de imóveis inválido.' };
  if (!Number.isFinite(input.includedFeatured) || input.includedFeatured < 0)
    return { error: 'Limite de destaques inválido.' };
  if (!Number.isFinite(input.durationDays) || input.durationDays <= 0)
    return { error: 'Duração (dias) inválida.' };
  if (!PAYMENT_METHODS.includes(input.paymentMethod as any)) return { error: 'Forma de pagamento inválida.' };
  if (!PAYMENT_STATUSES.includes(input.paymentStatus as any)) return { error: 'Status de pagamento inválido.' };
  const starts = new Date(input.startsAt);
  const ends = new Date(input.endsAt);
  if (isNaN(starts.getTime()) || isNaN(ends.getTime())) return { error: 'Datas inválidas.' };
  if (ends.getTime() <= starts.getTime()) return { error: 'A data de término deve ser depois do início.' };
  if (input.planId && !isUuid(input.planId)) return { error: 'Plano base inválido.' };
  const cityScope = Array.isArray(input.cityScope) ? input.cityScope.filter(isUuid) : null;

  // Cliente precisa existir e não estar arquivado/removido/bloqueado.
  const { data: company } = await admin.sb
    .from('companies')
    .select('id,status,trade_name')
    .eq('id', input.companyId)
    .maybeSingle();
  if (!company) return { error: 'Cliente não encontrado.' };
  if (['removido', 'arquivado', 'bloqueado'].includes((company as any).status))
    return { error: 'Este cliente está inativo/arquivado — reative-o antes de criar um contrato.' };

  // Impede um segundo contrato manual em aberto (ativo/agendado).
  const { data: openContract } = await admin.sb
    .from('manual_contracts')
    .select('id')
    .eq('company_id', input.companyId)
    .in('status', OPEN_STATUSES)
    .maybeSingle();
  if (openContract) return { error: 'Este cliente já tem um contrato manual em aberto. Edite ou encerre-o primeiro.' };

  const now = new Date();
  const scheduled = !!input.scheduled && starts.getTime() > now.getTime();
  const status: ManualStatus = scheduled ? 'agendado' : 'ativo';

  const { data: created, error } = await admin.sb
    .from('manual_contracts')
    .insert({
      company_id: input.companyId,
      plan_id: input.planId ?? null,
      plan_name: input.planName.trim(),
      plan_type: input.planType?.trim() || null,
      max_active_listings: Math.trunc(input.maxActiveListings),
      included_featured: Math.trunc(input.includedFeatured),
      city_scope: cityScope && cityScope.length ? (cityScope as any) : null,
      duration_days: Math.trunc(input.durationDays),
      starts_at: iso(starts),
      ends_at: iso(ends),
      payment_method: input.paymentMethod,
      payment_status: input.paymentStatus,
      amount: input.amount ?? null,
      auto_renew: !!input.autoRenew,
      status,
      internal_notes: input.internalNotes?.trim() || null,
      public_notes: input.publicNotes?.trim() || null,
      created_by: admin.adminId,
      updated_by: admin.adminId,
    })
    .select('*')
    .maybeSingle();

  if (error) return { error: `Falha ao criar contrato: ${error.message}` };
  if (!created) return { error: 'Não foi possível criar o contrato.' };

  await syncSubscription(admin.sb, created as ManualContract);
  await logHistory(admin.sb, (created as any).id, 'create', admin.adminId, {
    to: status,
    metadata: { plan_name: input.planName, max_active_listings: input.maxActiveListings, payment_status: input.paymentStatus },
  });
  await logAdminAction(admin.sb, admin.adminId, 'manual_contract.create', 'manual_contract', (created as any).id, {
    company_id: input.companyId,
    plan_name: input.planName,
  });
  revalidateContractSurfaces();
  return { ok: true };
}

// =====================================================================
// EDIÇÃO
// =====================================================================
export type UpdateContractPatch = {
  planName?: string;
  planType?: string | null;
  maxActiveListings?: number;
  includedFeatured?: number;
  cityScope?: string[] | null;
  durationDays?: number;
  startsAt?: string;
  endsAt?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  amount?: number | null;
  autoRenew?: boolean;
  internalNotes?: string | null;
  publicNotes?: string | null;
};

export async function adminUpdateManualContract(id: string, patch: UpdateContractPatch): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if (!isUuid(id)) return { error: 'Contrato inválido.' };

  const { data: current } = await admin.sb.from('manual_contracts').select('*').eq('id', id).maybeSingle();
  if (!current) return { error: 'Contrato não encontrado.' };
  const c = current as ManualContract;

  const next: Record<string, unknown> = { updated_by: admin.adminId };
  if (patch.planName !== undefined) {
    if (!patch.planName.trim()) return { error: 'Informe o nome do plano.' };
    next.plan_name = patch.planName.trim();
  }
  if (patch.planType !== undefined) next.plan_type = patch.planType?.trim() || null;
  if (patch.maxActiveListings !== undefined) {
    if (!Number.isFinite(patch.maxActiveListings) || patch.maxActiveListings < 0) return { error: 'Limite de imóveis inválido.' };
    next.max_active_listings = Math.trunc(patch.maxActiveListings);
  }
  if (patch.includedFeatured !== undefined) {
    if (!Number.isFinite(patch.includedFeatured) || patch.includedFeatured < 0) return { error: 'Limite de destaques inválido.' };
    next.included_featured = Math.trunc(patch.includedFeatured);
  }
  if (patch.cityScope !== undefined) {
    const scope = Array.isArray(patch.cityScope) ? patch.cityScope.filter(isUuid) : null;
    next.city_scope = scope && scope.length ? scope : null;
  }
  if (patch.durationDays !== undefined) {
    if (!Number.isFinite(patch.durationDays) || patch.durationDays <= 0) return { error: 'Duração (dias) inválida.' };
    next.duration_days = Math.trunc(patch.durationDays);
  }
  const starts = patch.startsAt ? new Date(patch.startsAt) : new Date(c.starts_at);
  const ends = patch.endsAt ? new Date(patch.endsAt) : new Date(c.ends_at);
  if (patch.startsAt || patch.endsAt) {
    if (isNaN(starts.getTime()) || isNaN(ends.getTime())) return { error: 'Datas inválidas.' };
    if (ends.getTime() <= starts.getTime()) return { error: 'A data de término deve ser depois do início.' };
    next.starts_at = iso(starts);
    next.ends_at = iso(ends);
  }
  if (patch.paymentMethod !== undefined) {
    if (!PAYMENT_METHODS.includes(patch.paymentMethod as any)) return { error: 'Forma de pagamento inválida.' };
    next.payment_method = patch.paymentMethod;
  }
  if (patch.paymentStatus !== undefined) {
    if (!PAYMENT_STATUSES.includes(patch.paymentStatus as any)) return { error: 'Status de pagamento inválido.' };
    next.payment_status = patch.paymentStatus;
  }
  if (patch.amount !== undefined) next.amount = patch.amount ?? null;
  if (patch.autoRenew !== undefined) next.auto_renew = !!patch.autoRenew;
  if (patch.internalNotes !== undefined) next.internal_notes = patch.internalNotes?.trim() || null;
  if (patch.publicNotes !== undefined) next.public_notes = patch.publicNotes?.trim() || null;

  const { data: updated, error } = await admin.sb.from('manual_contracts').update(next as any).eq('id', id).select('*').maybeSingle();
  if (error) return { error: `Falha ao atualizar: ${error.message}` };
  if (!updated) return { error: 'Contrato não encontrado.' };

  await syncSubscription(admin.sb, updated as ManualContract);
  // Auditoria de mudanças sensíveis (fim de contrato / status de pagamento).
  const changes: Record<string, unknown> = {};
  if (patch.endsAt && iso(ends) !== c.ends_at) changes.ends_at = { from: c.ends_at, to: iso(ends) };
  if (patch.paymentStatus && patch.paymentStatus !== c.payment_status)
    changes.payment_status = { from: c.payment_status, to: patch.paymentStatus };
  await logHistory(admin.sb, id, 'edit', admin.adminId, { from: c.status, to: c.status, metadata: changes });
  await logAdminAction(admin.sb, admin.adminId, 'manual_contract.update', 'manual_contract', id, changes);
  revalidateContractSurfaces();
  return { ok: true };
}

// =====================================================================
// CICLO DE VIDA
// =====================================================================
export type ContractAction = 'activate' | 'pause' | 'resume' | 'cancel' | 'expire' | 'reactivate' | 'renew';

export async function adminContractAction(
  id: string,
  action: ContractAction,
  opts: { reason?: string; keepEndDate?: boolean } = {},
): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if (!isUuid(id)) return { error: 'Contrato inválido.' };

  const { data: current } = await admin.sb.from('manual_contracts').select('*').eq('id', id).maybeSingle();
  if (!current) return { error: 'Contrato não encontrado.' };
  const c = current as ManualContract;
  const now = new Date();
  const patch: Record<string, unknown> = { updated_by: admin.adminId };
  let toStatus: ManualStatus = c.status;
  const meta: Record<string, unknown> = {};

  switch (action) {
    case 'activate': {
      if (c.status === 'ativo') return { error: 'O contrato já está ativo.' };
      toStatus = 'ativo';
      patch.status = 'ativo';
      patch.paused_at = null;
      // Se o fim já passou, gera novo período a partir de hoje.
      if (new Date(c.ends_at).getTime() <= now.getTime()) {
        patch.starts_at = iso(now);
        patch.ends_at = iso(addDays(now, c.duration_days));
        meta.ends_at = { from: c.ends_at, to: patch.ends_at };
      }
      break;
    }
    case 'pause': {
      if (c.status !== 'ativo' && c.status !== 'agendado') return { error: 'Só é possível pausar um contrato ativo.' };
      toStatus = 'pausado';
      patch.status = 'pausado';
      patch.paused_at = iso(now);
      patch.remaining_days_snapshot = daysBetween(now, new Date(c.ends_at));
      meta.remaining_days = patch.remaining_days_snapshot;
      break;
    }
    case 'resume': {
      if (c.status !== 'pausado') return { error: 'Só é possível retomar um contrato pausado.' };
      toStatus = 'ativo';
      patch.status = 'ativo';
      patch.paused_at = null;
      if (!opts.keepEndDate) {
        // Recalcula o fim preservando os dias que restavam ao pausar.
        const remaining = c.remaining_days_snapshot ?? c.duration_days;
        patch.starts_at = iso(now);
        patch.ends_at = iso(addDays(now, remaining));
        meta.ends_at = { from: c.ends_at, to: patch.ends_at, remaining };
      } else {
        meta.kept_end_date = c.ends_at;
      }
      patch.remaining_days_snapshot = null;
      break;
    }
    case 'cancel': {
      if (c.status === 'cancelado') return { error: 'O contrato já está cancelado.' };
      toStatus = 'cancelado';
      patch.status = 'cancelado';
      break;
    }
    case 'expire': {
      if (c.status === 'expirado') return { error: 'O contrato já está expirado.' };
      toStatus = 'expirado';
      patch.status = 'expirado';
      break;
    }
    case 'reactivate': {
      if (c.status !== 'expirado' && c.status !== 'cancelado')
        return { error: 'Só é possível reativar um contrato expirado ou cancelado.' };
      toStatus = 'ativo';
      patch.status = 'ativo';
      patch.paused_at = null;
      const keep = opts.keepEndDate && new Date(c.ends_at).getTime() > now.getTime();
      if (!keep) {
        patch.starts_at = iso(now);
        patch.ends_at = iso(addDays(now, c.duration_days));
        meta.ends_at = { from: c.ends_at, to: patch.ends_at };
      } else {
        meta.kept_end_date = c.ends_at;
      }
      break;
    }
    case 'renew': {
      // Renovação COMERCIAL: estende o período pela duração original.
      const base = new Date(c.ends_at).getTime() > now.getTime() ? new Date(c.ends_at) : now;
      const newEnds = addDays(base, c.duration_days);
      toStatus = 'ativo';
      patch.status = 'ativo';
      patch.paused_at = null;
      patch.starts_at = c.status === 'ativo' ? c.starts_at : iso(now);
      patch.ends_at = iso(newEnds);
      // Novo ciclo nasce pendente, salvo se já isento/cortesia.
      patch.payment_status = c.payment_status === 'isento' ? 'isento' : 'pendente';
      meta.ends_at = { from: c.ends_at, to: iso(newEnds) };
      meta.payment_status = patch.payment_status;
      break;
    }
    default:
      return { error: 'Ação inválida.' };
  }

  const { data: updated, error } = await admin.sb.from('manual_contracts').update(patch as any).eq('id', id).select('*').maybeSingle();
  if (error) return { error: `Falha na ação: ${error.message}` };
  if (!updated) return { error: 'Contrato não encontrado.' };

  await syncSubscription(admin.sb, updated as ManualContract);
  await logHistory(admin.sb, id, action, admin.adminId, { from: c.status, to: toStatus, reason: opts.reason, metadata: meta });
  await logAdminAction(admin.sb, admin.adminId, `manual_contract.${action}`, 'manual_contract', id, {
    from: c.status,
    to: toStatus,
    ...meta,
  });
  revalidateContractSurfaces();
  return { ok: true };
}

// =====================================================================
// NOTA INTERNA
// =====================================================================
export async function adminAddContractNote(id: string, note: string): Promise<R> {
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Sem permissão.' };
  if (!isUuid(id)) return { error: 'Contrato inválido.' };
  const text = note?.trim();
  if (!text) return { error: 'Escreva uma nota.' };

  const { data: current } = await admin.sb.from('manual_contracts').select('internal_notes').eq('id', id).maybeSingle();
  if (!current) return { error: 'Contrato não encontrado.' };

  const stamp = new Date().toLocaleString('pt-BR');
  const line = `[${stamp}] ${text}`;
  const merged = (current as any).internal_notes ? `${(current as any).internal_notes}\n${line}` : line;

  const { error } = await admin.sb.from('manual_contracts').update({ internal_notes: merged, updated_by: admin.adminId }).eq('id', id);
  if (error) return { error: `Falha ao salvar nota: ${error.message}` };
  await logHistory(admin.sb, id, 'note', admin.adminId, { reason: text });
  revalidateContractSurfaces();
  return { ok: true };
}
