// Rótulos, cores e badges compartilhados da gestão de contratos manuais.
// Módulo apresentacional (sem hooks nem imports de servidor) — pode ser usado
// tanto em Server Components quanto em Client Components.

export const contractStatusLabel: Record<string, string> = {
  agendado: 'Agendado',
  ativo: 'Ativo',
  pausado: 'Pausado',
  cancelado: 'Cancelado',
  expirado: 'Expirado',
};

export const contractStatusClass: Record<string, string> = {
  agendado: 'bg-primary/10 text-primary',
  ativo: 'bg-success/15 text-success',
  pausado: 'bg-warning/20 text-warning',
  cancelado: 'bg-border text-muted',
  expirado: 'bg-danger/15 text-danger',
};

export const situationLabel: Record<string, string> = {
  manual_ativo: 'Plano manual',
  agendado: 'Agendado',
  pausado: 'Pausado',
  expirado: 'Expirado',
  trial: 'Teste grátis',
  assinatura_ativa: 'Assinatura ativa',
  pendente: 'Pagamento pendente',
  inadimplente: 'Inadimplente',
  sem_plano: 'Sem plano',
};

export const situationClass: Record<string, string> = {
  manual_ativo: 'bg-success/15 text-success',
  agendado: 'bg-primary/10 text-primary',
  pausado: 'bg-warning/20 text-warning',
  expirado: 'bg-danger/15 text-danger',
  trial: 'bg-primary/10 text-primary',
  assinatura_ativa: 'bg-success/15 text-success',
  pendente: 'bg-warning/15 text-warning',
  inadimplente: 'bg-danger/15 text-danger',
  sem_plano: 'bg-border text-muted',
};

export const paymentStatusLabel: Record<string, string> = {
  pendente: 'Pagamento pendente',
  pago: 'Pago',
  parcial: 'Parcial',
  isento: 'Cortesia/Isento',
};

export const paymentStatusClass: Record<string, string> = {
  pendente: 'bg-warning/15 text-warning',
  pago: 'bg-success/15 text-success',
  parcial: 'bg-primary/10 text-primary',
  isento: 'bg-border text-muted',
};

export const paymentMethodLabel: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  transferencia: 'Transferência',
  cartao_manual: 'Cartão (manual)',
  fatura: 'Fatura',
  cortesia: 'Cortesia',
  outro: 'Outro',
};

export const PAYMENT_METHOD_OPTIONS = Object.entries(paymentMethodLabel).map(([v, l]) => ({ v, l }));
export const PAYMENT_STATUS_OPTIONS = Object.entries(paymentStatusLabel).map(([v, l]) => ({ v, l }));

export function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${className ?? 'bg-border text-muted'}`}>
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge label={contractStatusLabel[status] ?? status} className={contractStatusClass[status]} />;
}

export function SituationBadge({ situation }: { situation: string }) {
  return <Badge label={situationLabel[situation] ?? situation} className={situationClass[situation]} />;
}

export function PaymentBadge({ status }: { status: string }) {
  return <Badge label={paymentStatusLabel[status] ?? status} className={paymentStatusClass[status]} />;
}

export function fmtDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('pt-BR') : '—';
}
