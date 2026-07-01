import { adminListUsers } from '@/lib/data';
import { UserRole } from '@/components/admin/UserRole';

export const dynamic = 'force-dynamic';

const roleOpts = [
  ['', 'Todos os papéis'],
  ['particular', 'Particular'],
  ['profissional', 'Profissional'],
  ['moderador', 'Moderador'],
  ['admin', 'Admin'],
];

export default async function AdminUsuarios({ searchParams }: { searchParams: { q?: string; role?: string; status?: string } }) {
  const users = await adminListUsers({ text: searchParams.q, role: searchParams.role, status: searchParams.status });
  return (
    <div>
      <form className="mb-4 grid gap-2 sm:grid-cols-[1fr_160px_160px_auto]">
        <input name="q" defaultValue={searchParams.q ?? ''} placeholder="Buscar nome, e-mail ou telefone" className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary" />
        <select name="role" defaultValue={searchParams.role ?? ''} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
          {roleOpts.map(([v, l]) => <option key={v || 'all'} value={v}>{l}</option>)}
        </select>
        <select name="status" defaultValue={searchParams.status ?? ''} className="h-10 rounded-lg border border-border bg-surface px-3 text-sm">
          <option value="">Status visíveis</option>
          <option value="active">Ativos</option>
          <option value="blocked">Desativados</option>
        </select>
        <button className="rounded-lg bg-primary px-4 text-sm font-medium text-on-primary">Filtrar</button>
      </form>
      <ul className="space-y-2">
        {users.map((u: any) => (
          <li key={u.id} className={`flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 lg:flex-row lg:items-center lg:justify-between ${!u.is_active ? 'opacity-70' : ''}`}>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{u.full_name ?? '(sem nome)'}</p>
                <span className="rounded bg-bg px-1.5 py-0.5 text-xs">{u.role}</span>
                {!u.is_active && <span className="rounded bg-danger/15 px-1.5 py-0.5 text-xs text-danger">Desativado</span>}
              </div>
              <p className="text-xs text-muted">{u.email ?? 'sem e-mail'} · {u.phone ?? 'sem telefone'}</p>
              <p className="mt-1 text-xs text-muted">
                Empresas: {u.companies?.[0]?.count ?? 0} · Corretores: {u.brokers?.[0]?.count ?? 0} · Imóveis: {u.properties?.[0]?.count ?? 0}
              </p>
            </div>
            <UserRole id={u.id} role={u.role} isActive={u.is_active ?? true} user={u} />
          </li>
        ))}
        {!users.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhum usuário.</p>}
      </ul>
    </div>
  );
}
