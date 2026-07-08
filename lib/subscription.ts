// =====================================================================
// FONTE ÚNICA de leitura do estado de assinatura/teste grátis.
// Tudo que a interface mostra sobre "plano atual", "teste grátis" e
// "status da assinatura" é derivado daqui — nunca inventado no frontend.
// Os dados vêm do banco (companies + subscriptions.status/current_period_end),
// e agora também de contratos manuais (manual_contracts) criados pelo admin.
// =====================================================================

import { COMPANY_TRIAL_DAYS } from './payments/catalog';

export const TRIAL_DAYS = COMPANY_TRIAL_DAYS; // 60

export type SubStatusKind =
  | 'particular'        // conta pessoal, sem perfil profissional
  | 'sem_plano'         // profissional sem assinatura escolhida
  | 'trial'             // teste grátis ativo
  | 'trial_expirado'    // teste grátis terminou, aguardando pagamento
  | 'pendente'          // fatura emitida, aguardando pagamento
  | 'inadimplente'      // pagamento não confirmado
  | 'ativa'             // assinatura paga e ativa
  | 'pausado'           // contrato manual pausado pelo admin
  | 'expirado'          // contrato manual expirado
  | 'cancelada';        // assinatura cancelada

export type SummaryTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type SubscriptionSummary = {
  hasCompany: boolean;
  accountLabel: string;
  planName: string | null;
  kind: SubStatusKind;
  statusLabel: string;
  tone: SummaryTone;
  message: string;
  trialDaysRemaining: number | null;
  trialEndsAt: string | null;
  isManual: boolean;
  cta: { label: string; href: string } | null;
};

const companyTypeLabel: Record<string, string> = {
  corretor_autonomo: 'Corretor autônomo',
  imobiliaria: 'Imobiliária',
  construtora: 'Construtora',
  incorporadora: 'Incorporadora',
};

// Dias restantes até uma data (arredonda pra cima; nunca negativo).
export function trialDaysRemaining(end?: string | null): number | null {
  if (!end) return null;
  const ms = new Date(end).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

type CompanyLike = { type?: string | null; free_forever?: boolean | null } | null | undefined;
type SubscriptionLike =
  | {
      status?: string | null;
      current_period_end?: string | null;
      manual_contract_id?: string | null;
      custom_plan_name?: string | null;
      plans?: { name?: string | null } | null;
    }
  | null
  | undefined;
type ManualContractLike =
  | {
      status?: string | null;
      plan_name?: string | null;
      ends_at?: string | null;
      payment_status?: string | null;
      public_notes?: string | null;
    }
  | null
  | undefined;

// Deriva o resumo exibido no painel a partir de company + subscription (+ contrato manual).
export function subscriptionSummary(
  company: CompanyLike,
  subscription: SubscriptionLike,
  manualContract?: ManualContractLike,
): SubscriptionSummary {
  const hasCompany = !!company?.type;
  const accountLabel = company?.type ? companyTypeLabel[company.type] ?? 'Profissional' : 'Particular';
  const planName = subscription?.custom_plan_name ?? subscription?.plans?.name ?? null;
  const isManual = !!subscription?.manual_contract_id || !!manualContract;

  // Conta pessoal (sem perfil profissional).
  if (!hasCompany) {
    return {
      hasCompany: false,
      accountLabel,
      planName: 'Particular Gratuito',
      kind: 'particular',
      statusLabel: 'Plano gratuito',
      tone: 'neutral',
      message: 'Você está no plano Particular Gratuito, com 1 imóvel ativo grátis. Para publicar mais e ter recursos profissionais, ative um perfil.',
      trialDaysRemaining: null,
      trialEndsAt: null,
      isManual: false,
      cta: { label: 'Atuar profissionalmente', href: '/painel/empresa' },
    };
  }

  const isBroker = company?.type === 'corretor_autonomo';

  // --- Gratuidade vitalícia (cortesia permanente concedida pelo admin) tem
  // prioridade máxima: acesso profissional ativo, sem cobrança e sem expiração.
  if (company?.free_forever) {
    return {
      hasCompany: true,
      accountLabel,
      planName: 'Cortesia vitalícia',
      kind: 'ativa',
      statusLabel: 'Cortesia vitalícia',
      tone: 'success',
      message: 'Você tem acesso profissional gratuito e vitalício, concedido pela administração — imóveis ilimitados, vitrine e selo verificado, sem cobrança.',
      trialDaysRemaining: null,
      trialEndsAt: null,
      isManual: true,
      cta: null,
    };
  }

  // --- Contrato manual (criado pelo admin) tem prioridade sobre o estado
  // bruto da subscription sincronizada (que, quando pausada, aparece como
  // 'cancelada' por não existir status "pausado" no enum de subscriptions).
  if (manualContract) {
    const mcName = manualContract.plan_name ?? planName;
    const mcEnds = manualContract.ends_at ?? null;
    const ended = mcEnds ? new Date(mcEnds).getTime() <= Date.now() : false;

    if (manualContract.status === 'pausado') {
      return {
        hasCompany: true,
        accountLabel,
        planName: mcName,
        kind: 'pausado',
        statusLabel: 'Plano pausado',
        tone: 'warning',
        message: `Seu plano ${mcName ?? 'personalizado'} está pausado pela administração. O acesso profissional fica suspenso até a retomada.`,
        trialDaysRemaining: null,
        trialEndsAt: mcEnds,
        isManual: true,
        cta: null,
      };
    }

    if (manualContract.status === 'expirado' || (manualContract.status !== 'cancelado' && ended)) {
      return {
        hasCompany: true,
        accountLabel,
        planName: mcName,
        kind: 'expirado',
        statusLabel: 'Plano expirado',
        tone: 'warning',
        message: `Seu plano ${mcName ?? 'personalizado'} expirou. Fale com a administração para renovar.`,
        trialDaysRemaining: 0,
        trialEndsAt: mcEnds,
        isManual: true,
        cta: null,
      };
    }

    if (manualContract.status === 'ativo' || manualContract.status === 'agendado') {
      const remaining = trialDaysRemaining(mcEnds);
      const scheduled = manualContract.status === 'agendado';
      const pendingPay = manualContract.payment_status === 'pendente';
      return {
        hasCompany: true,
        accountLabel,
        planName: mcName,
        kind: 'ativa',
        statusLabel: scheduled ? 'Plano agendado' : 'Plano manual ativo',
        tone: scheduled ? 'info' : 'success',
        message: scheduled
          ? `Seu plano ${mcName ?? 'personalizado'} foi configurado pela administração e começa em breve.`
          : `Seu plano ${mcName ?? 'personalizado'} está ativo${
              remaining !== null ? ` — faltam ${remaining} ${remaining === 1 ? 'dia' : 'dias'}` : ''
            }.${pendingPay ? ' Pagamento pendente com a administração.' : ''}`,
        trialDaysRemaining: remaining,
        trialEndsAt: mcEnds,
        isManual: true,
        cta: null,
      };
    }
    // status 'cancelado' cai no fluxo normal abaixo (mostra "sem plano").
  }

  const status = subscription?.status ?? null;

  // Profissional ainda sem assinatura escolhida.
  if (!status || status === 'cancelada') {
    return {
      hasCompany: true,
      accountLabel,
      planName: null,
      kind: status === 'cancelada' ? 'cancelada' : 'sem_plano',
      statusLabel: status === 'cancelada' ? 'Assinatura cancelada' : 'Nenhum plano ativo',
      tone: 'info',
      message: isBroker
        ? 'Você tem 1 imóvel ativo grátis. Escolha um plano com 60 dias grátis para publicar mais imóveis e ativar a vitrine.'
        : 'Escolha um plano para começar. Todos os planos têm 60 dias grátis — você só paga depois do período de teste.',
      trialDaysRemaining: null,
      trialEndsAt: null,
      isManual: false,
      cta: { label: 'Escolher plano', href: '/painel/planos' },
    };
  }

  const trialEndsAt = subscription?.current_period_end ?? null;
  const remaining = trialDaysRemaining(trialEndsAt);

  if (status === 'trial') {
    // Trial cujo fim já passou: tratamos como aguardando pagamento.
    if (remaining !== null && remaining <= 0) {
      return {
        hasCompany: true,
        accountLabel,
        planName,
        kind: 'trial_expirado',
        statusLabel: 'Teste grátis encerrado',
        tone: 'warning',
        message: `Seu teste grátis do plano ${planName ?? 'profissional'} terminou. Conclua o pagamento para manter o plano ativo.`,
        trialDaysRemaining: 0,
        trialEndsAt,
        isManual,
        cta: { label: 'Ir para pagamento', href: '/painel/planos' },
      };
    }
    return {
      hasCompany: true,
      accountLabel,
      planName,
      kind: 'trial',
      statusLabel: 'Teste grátis ativo',
      tone: 'success',
      message:
        remaining !== null
          ? `Seu teste grátis de ${TRIAL_DAYS} dias está ativo — faltam ${remaining} ${remaining === 1 ? 'dia' : 'dias'}. Depois do teste, será necessário concluir o pagamento para manter o plano ativo.`
          : `Seu teste grátis de ${TRIAL_DAYS} dias está ativo. Depois do teste, será necessário concluir o pagamento para manter o plano ativo.`,
      trialDaysRemaining: remaining,
      trialEndsAt,
      isManual,
      cta: { label: 'Gerenciar assinatura', href: '/painel/planos' },
    };
  }

  if (status === 'pendente') {
    return {
      hasCompany: true,
      accountLabel,
      planName,
      kind: 'pendente',
      statusLabel: 'Pagamento pendente',
      tone: 'warning',
      message: `Falta concluir o pagamento do plano ${planName ?? 'profissional'} para ativá-lo.`,
      trialDaysRemaining: null,
      trialEndsAt,
      isManual,
      cta: { label: 'Ir para pagamento', href: '/painel/planos' },
    };
  }

  if (status === 'inadimplente') {
    return {
      hasCompany: true,
      accountLabel,
      planName,
      kind: 'inadimplente',
      statusLabel: 'Pagamento não confirmado',
      tone: 'danger',
      message: `O pagamento do plano ${planName ?? 'profissional'} não foi confirmado. Regularize para manter o plano ativo.`,
      trialDaysRemaining: null,
      trialEndsAt,
      isManual,
      cta: { label: 'Regularizar pagamento', href: '/painel/planos' },
    };
  }

  // status === 'ativa'
  return {
    hasCompany: true,
    accountLabel,
    planName,
    kind: 'ativa',
    statusLabel: isManual ? 'Plano manual ativo' : 'Assinatura ativa',
    tone: 'success',
    message: isManual
      ? `Seu plano ${planName ?? 'personalizado'} está ativo.`
      : `Sua assinatura do plano ${planName ?? 'profissional'} está ativa.`,
    trialDaysRemaining: null,
    trialEndsAt,
    isManual,
    cta: { label: 'Gerenciar assinatura', href: '/painel/planos' },
  };
}
