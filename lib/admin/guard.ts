// Helpers compartilhados das Server Actions do admin: verificação de papel,
// registro de auditoria e checagem de "0 linhas afetadas". Reutilizados por
// app/admin/actions.ts e app/admin/contratos/actions.ts (uma fonte de verdade).
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

// Garante que quem chama é admin/moderador (defesa extra além da RLS).
// Retorna um client service_role (bypassa RLS/triggers) + o id do admin.
export async function ensureAdmin() {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  const { data } = await sb.from('profiles').select('role,is_active').eq('id', auth.user.id).maybeSingle();
  if (!data || !(data as any).is_active || !['admin', 'moderador'].includes((data as any).role)) return null;
  return { sb: createServiceClient(), adminId: auth.user.id };
}

// Grava uma ação administrativa em audit_logs.
export async function logAdminAction(
  sb: ReturnType<typeof createServiceClient>,
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>,
) {
  await sb.from('audit_logs').insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: (metadata ?? {}) as any,
  });
}

// Confirma que uma mutação por id afetou uma linha. No PostgREST, um update/delete
// que atinge 0 linhas (id inexistente ou RLS bloqueando) NÃO retorna erro — sem
// esta checagem o admin veria um falso sucesso. Use com `.select(...).maybeSingle()`.
export async function requireRow<T>(
  query: PromiseLike<{ data: T | null; error: { message: string } | null }>,
  emptyMessage: string,
): Promise<{ data?: T; error?: string }> {
  const { data, error } = await query;
  if (error) return { error: `Falha ao atualizar: ${error.message}` };
  if (!data) return { error: emptyMessage };
  return { data };
}
