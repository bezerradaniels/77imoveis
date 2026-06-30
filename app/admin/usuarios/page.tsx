import { adminListUsers } from '@/lib/data';
import { UserRole } from '@/components/admin/UserRole';

export const dynamic = 'force-dynamic';

export default async function AdminUsuarios() {
  const users = await adminListUsers();
  return (
    <ul className="space-y-2">
      {users.map((u: any) => (
        <li key={u.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3 ${!u.is_active ? 'opacity-60' : ''}`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{u.full_name ?? '(sem nome)'}</p>
              {!u.is_active && <span className="rounded bg-danger/15 px-1.5 py-0.5 text-xs text-danger">Bloqueado</span>}
            </div>
            <p className="text-xs text-muted">{u.email} · {u.phone ?? '—'}</p>
          </div>
          <UserRole id={u.id} role={u.role} isActive={u.is_active ?? true} />
        </li>
      ))}
      {!users.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhum usuário.</p>}
    </ul>
  );
}
