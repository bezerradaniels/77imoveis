import Link from 'next/link';
import { CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Confirmação de pagamento' };

export default function ConfirmacaoPagamentoPage({
  searchParams,
}: {
  searchParams: { status?: string; payment_id?: string; amount?: string; type?: string };
}) {
  const { status = 'pendente', payment_id, amount, type = 'plano' } = searchParams;

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; title: string; subtitle: string }> = {
    pago: {
      icon: CheckCircle,
      color: 'text-success',
      title: 'Pagamento confirmado!',
      subtitle: 'Sua transação foi processada com sucesso.',
    },
    pendente: {
      icon: Clock,
      color: 'text-warning',
      title: 'Pagamento em processamento',
      subtitle: 'Verifique o status em seu e-mail ou no painel.',
    },
    erro: {
      icon: XCircle,
      color: 'text-danger',
      title: 'Erro no pagamento',
      subtitle: 'Não conseguimos processar sua transação. Tente novamente.',
    },
  };

  const config = statusConfig[status] || statusConfig.pendente;
  const Icon = config.icon;

  const typeLabel: Record<string, string> = {
    plano: 'Assinatura do plano',
    destaque: 'Destaque do imóvel',
    vitrine: 'Ativação da vitrine',
    banner: 'Compra de banner',
  };

  const redirectUrl = type === 'destaque' ? '/painel/imoveis' : type === 'vitrine' ? '/painel/vitrine' : '/painel/planos';
  const redirectLabel = type === 'destaque' ? 'Meus imóveis' : type === 'vitrine' ? 'Minha vitrine' : 'Meus planos';

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
        <div className="mb-6 flex justify-center">
          <Icon size={60} className={config.color} />
        </div>

        <h1 className="mb-2 text-2xl font-bold">{config.title}</h1>
        <p className="mb-6 text-sm text-muted">{config.subtitle}</p>

        <div className="mb-6 space-y-3 rounded-lg bg-bg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Tipo</span>
            <span className="font-medium">{typeLabel[type] || 'Transação'}</span>
          </div>
          {amount && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">Valor</span>
              <span className="font-bold">
                {Number(amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          )}
          {payment_id && (
            <div className="flex justify-between text-sm">
              <span className="text-muted">ID transação</span>
              <span className="font-mono text-xs">{payment_id.slice(0, 12)}...</span>
            </div>
          )}
        </div>

        <div className="mb-6 space-y-2 text-sm text-muted">
          {status === 'pendente' && (
            <>
              <p>Você receberá um e-mail com o comprovante em breve.</p>
              <p>Se for Pix ou boleto, você pode acompanhar o status do pagamento abaixo.</p>
            </>
          )}
          {status === 'pago' && (
            <p>Sua {type === 'plano' ? 'assinatura' : 'compra'} está ativa e pronta para usar.</p>
          )}
          {status === 'erro' && (
            <p>Por favor, revise seus dados e tente novamente ou entre em contato com suporte.</p>
          )}
        </div>

        {status === 'pendente' && (
          <div className="mb-6 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
            <p className="font-medium">Acompanhe em tempo real</p>
            <p className="mt-1">Abra seu e-mail ou aplicativo bancário para confirmar o pagamento.</p>
          </div>
        )}

        {status === 'erro' && (
          <div className="mb-6 space-y-2">
            <Link
              href="/painel/planos"
              className="inline-block w-full rounded-full bg-primary px-4 py-3 text-sm font-bold text-on-primary hover:bg-primary-hover"
            >
              Tentar novamente
            </Link>
            <a
              href="mailto:suporte@77imoveis.com.br"
              className="block rounded-full border border-border px-4 py-3 text-sm font-bold text-text hover:bg-bg"
            >
              Contatar suporte
            </a>
          </div>
        )}

        {status !== 'erro' && (
          <Link
            href={redirectUrl}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-on-primary hover:bg-primary-hover"
          >
            Ir para {redirectLabel} <ArrowRight size={16} />
          </Link>
        )}

        <Link href="/painel" className="mt-4 block text-sm text-muted hover:text-text">
          Voltar ao painel
        </Link>
      </div>
    </main>
  );
}
