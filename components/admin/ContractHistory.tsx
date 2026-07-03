// Linha do tempo do ciclo de vida do contrato (apresentacional).
import { contractStatusLabel } from './contract-ui';

const actionLabel: Record<string, string> = {
  create: 'Contrato criado',
  activate: 'Ativado',
  pause: 'Pausado',
  resume: 'Retomado',
  cancel: 'Cancelado',
  expire: 'Expirado',
  reactivate: 'Reativado',
  renew: 'Renovado',
  edit: 'Editado',
  note: 'Nota interna',
};

type HistoryRow = {
  id: string;
  action: string;
  from_status: string | null;
  to_status: string | null;
  reason: string | null;
  metadata: any;
  created_at: string;
  profiles?: { full_name: string | null; email: string | null } | null;
};

export function ContractHistory({ history }: { history: HistoryRow[] }) {
  if (!history.length) return <p className="text-sm text-muted">Sem histórico ainda.</p>;
  return (
    <ol className="space-y-3">
      {history.map((h) => {
        const admin = h.profiles?.full_name ?? h.profiles?.email ?? 'Admin';
        const transition =
          h.from_status && h.to_status && h.from_status !== h.to_status
            ? ` · ${contractStatusLabel[h.from_status] ?? h.from_status} → ${contractStatusLabel[h.to_status] ?? h.to_status}`
            : '';
        return (
          <li key={h.id} className="rounded-lg border border-border bg-bg p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{actionLabel[h.action] ?? h.action}{transition}</span>
              <span className="text-xs text-muted">{new Date(h.created_at).toLocaleString('pt-BR')}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted">por {admin}</p>
            {h.reason && <p className="mt-1 text-sm">{h.reason}</p>}
          </li>
        );
      })}
    </ol>
  );
}
