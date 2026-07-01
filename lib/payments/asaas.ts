const ASAAS_VERSION = '77imoveis/0.1 (Next.js)';

type AsaasError = { errors?: { code?: string; description?: string }[] };

export type AsaasCustomerInput = {
  name: string;
  cpfCnpj?: string | null;
  email?: string | null;
  mobilePhone?: string | null;
  externalReference?: string;
};

export type AsaasSubscriptionInput = {
  customer: string;
  billingType: 'UNDEFINED' | 'BOLETO' | 'PIX' | 'CREDIT_CARD';
  value: number;
  nextDueDate: string;
  cycle: 'MONTHLY' | 'YEARLY';
  description: string;
  externalReference: string;
};

export type AsaasPaymentInput = {
  customer: string;
  billingType: 'UNDEFINED' | 'BOLETO' | 'PIX' | 'CREDIT_CARD';
  value: number;
  dueDate: string;
  description: string;
  externalReference: string;
};

export type AsaasSubscription = {
  id: string;
  customer: string;
  value: number;
  status?: string;
  invoiceUrl?: string;
};

export type AsaasPayment = {
  id: string;
  customer?: string;
  subscription?: string;
  value?: number;
  status?: string;
  billingType?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  externalReference?: string;
  dueDate?: string;
  paymentDate?: string;
  clientPaymentDate?: string;
};

function apiKey() {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error('ASAAS_API_KEY não configurada.');
  return key;
}

export function asaasBaseUrl() {
  if (process.env.ASAAS_API_URL) return process.env.ASAAS_API_URL.replace(/\/$/, '');
  return process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com/v3'
    : 'https://api-sandbox.asaas.com/v3';
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${asaasBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': ASAAS_VERSION,
      access_token: apiKey(),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const body = (await response.json().catch(() => null)) as (T & AsaasError) | null;
  if (!response.ok) {
    const details = body?.errors?.map((e) => e.description || e.code).filter(Boolean).join(' ');
    throw new Error(details || `Erro Asaas HTTP ${response.status}`);
  }
  return body as T;
}

const digits = (value?: string | null) => value?.replace(/\D/g, '') || undefined;

export async function createAsaasCustomer(input: AsaasCustomerInput) {
  return asaasFetch<{ id: string }>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      cpfCnpj: digits(input.cpfCnpj),
      email: input.email || undefined,
      mobilePhone: digits(input.mobilePhone),
      externalReference: input.externalReference,
      notificationDisabled: false,
    }),
  });
}

export async function createAsaasSubscription(input: AsaasSubscriptionInput) {
  return asaasFetch<AsaasSubscription>('/subscriptions', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function listAsaasSubscriptionPayments(subscriptionId: string) {
  const result = await asaasFetch<{ data?: AsaasPayment[] }>(`/subscriptions/${subscriptionId}/payments`);
  return result.data ?? [];
}

export async function createAsaasPayment(input: AsaasPaymentInput) {
  return asaasFetch<AsaasPayment>('/payments', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function mapAsaasBillingType(method?: string | null) {
  if (method === 'PIX') return 'pix';
  if (method === 'BOLETO') return 'boleto';
  if (method === 'CREDIT_CARD') return 'cartao_credito';
  return null;
}

export function mapAsaasPaymentStatus(event: string, status?: string | null) {
  if (['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'].includes(event)) return 'pago';
  if (['PAYMENT_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED', 'PAYMENT_CHARGEBACK_DISPUTE'].includes(event)) return 'estornado';
  if (['PAYMENT_DELETED', 'PAYMENT_CANCELLED'].includes(event)) return 'cancelado';
  if (status === 'OVERDUE') return 'falhou';
  return 'pendente';
}
