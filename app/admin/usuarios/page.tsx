import { adminListUsers } from '@/lib/data';
import { UserRole } from '@/components/admin/UserRole';

export const dynamic = 'force-dynamic';

export default async function AdminUsuarios() {
  const users = await adminListUsers();
  return (
    <ul className="space-y-2">
      {users.map((u: any) => (
        <li key={u.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3">
          <div className="min-w-0">
            <p className="text-sm font-medium">{u.full_name ?? '(sem nome)'}</p>
            <p className="text-xs text-muted">{u.email} · {u.phone ?? '—'}</p>
          </div>
          <UserRole id={u.id} role={u.role} />
        </li>
      ))}
      {!users.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhum usuário.</p>}
    </ul>
  );
}
