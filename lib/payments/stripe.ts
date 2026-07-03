import Stripe from 'stripe';

// Versão da API fixada na do SDK instalado (evita drift entre ambientes).
const STRIPE_API_VERSION = '2026-06-24.dahlia';

// Não fixamos os métodos de pagamento: usamos os "métodos dinâmicos" ativados
// no Dashboard do Stripe (hoje cartão + boleto). Assim, ao habilitar o Pix na
// conta, ele passa a aparecer automaticamente sem mudar código — e evitamos
// erro na API caso um método listado não esteja habilitado.
let client: Stripe | null = null;

export function stripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY não configurada.');
  client = new Stripe(key, { apiVersion: STRIPE_API_VERSION });
  return client;
}

const digits = (value?: string | null) => value?.replace(/\D/g, '') || undefined;

// Metadata do Stripe só aceita strings; descarta valores vazios/nulos.
function toMetadata(input: Record<string, string | number | null | undefined>): Stripe.MetadataParam {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value == null || value === '') continue;
    out[key] = String(value);
  }
  return out;
}

export type StripeCustomerInput = {
  companyId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  cpfCnpj?: string | null;
  existingCustomerId?: string | null;
};

// Reusa o customer já salvo em companies.gateway_customer_id; senão cria.
export async function getOrCreateStripeCustomer(input: StripeCustomerInput): Promise<string> {
  if (input.existingCustomerId) return input.existingCustomerId;
  const customer = await stripe().customers.create({
    name: input.name,
    email: input.email || undefined,
    phone: digits(input.phone),
    metadata: toMetadata({ company_id: input.companyId, cpf_cnpj: digits(input.cpfCnpj) }),
  });
  return customer.id;
}

export type PlanForCheckout = {
  id: string;
  name: string;
  interval: string; // 'mensal' | 'anual' | ...
  stripe_price_id: string | null;
};

export type PlanSubscriptionResult = {
  subscriptionId: string;
  invoiceId: string | null;
  hostedInvoiceUrl: string | null;
};

// Cria a assinatura no modelo "fatura por ciclo" (send_invoice): a cada período
// o Stripe emite uma fatura hospedada paga por cartão/boleto/Pix. Espelha o
// comportamento do Asaas (cliente paga cada fatura; sem cobrança automática).
export async function createPlanInvoiceSubscription(params: {
  customerId: string;
  plan: PlanForCheckout;
  trialDays: number;
  metadata?: Record<string, string | number | null | undefined>;
}): Promise<PlanSubscriptionResult> {
  const { customerId, plan, trialDays } = params;
  if (!plan.stripe_price_id) {
    throw new Error(`Plano ${plan.id} sem stripe_price_id. Rode "npm run stripe:setup-plans".`);
  }

  const subscription = await stripe().subscriptions.create({
    customer: customerId,
    items: [{ price: plan.stripe_price_id }],
    collection_method: 'send_invoice',
    days_until_due: 7,
    ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
    expand: ['latest_invoice'],
    metadata: toMetadata({ ...params.metadata, plan_id: plan.id }),
  });

  // Durante o trial não há fatura a pagar agora. Sem trial, garantimos que a
  // primeira fatura esteja finalizada para ter o hosted_invoice_url.
  let invoice = subscription.latest_invoice as Stripe.Invoice | null;
  if (invoice && invoice.status === 'draft') {
    invoice = await stripe().invoices.finalizeInvoice(invoice.id as string);
  }

  return {
    subscriptionId: subscription.id,
    invoiceId: invoice?.id ?? null,
    hostedInvoiceUrl: invoice?.hosted_invoice_url ?? null,
  };
}

export type OneTimeCheckoutResult = {
  sessionId: string;
  url: string | null;
};

// Checkout hospedado (mode payment) para compras avulsas (destaques etc.).
export async function createOneTimeCheckout(params: {
  customerId: string;
  name: string;
  description?: string;
  amount: number; // em reais
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string | number | null | undefined>;
}): Promise<OneTimeCheckoutResult> {
  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    customer: params.customerId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'brl',
          unit_amount: Math.round(params.amount * 100),
          product_data: {
            name: params.name,
            ...(params.description ? { description: params.description } : {}),
          },
        },
      },
    ],
    metadata: toMetadata(params.metadata ?? {}),
    // Propaga a metadata para o PaymentIntent (é onde o webhook lê o vínculo).
    payment_intent_data: { metadata: toMetadata(params.metadata ?? {}) },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
  return { sessionId: session.id, url: session.url };
}

// ---- Mapeamentos para os enums do banco --------------------------------

export function mapStripeMethod(type?: string | null) {
  if (type === 'pix') return 'pix';
  if (type === 'boleto') return 'boleto';
  if (type === 'card') return 'cartao_credito';
  return null;
}

// Converte o tipo do evento + status do objeto para o enum payment_status.
export function mapStripePaymentStatus(eventType: string, status?: string | null) {
  if (eventType === 'invoice.paid' || eventType === 'payment_intent.succeeded') return 'pago';
  if (eventType === 'charge.refunded' || status === 'refunded') return 'estornado';
  if (eventType === 'invoice.payment_failed' || eventType === 'payment_intent.payment_failed') return 'falhou';
  if (status === 'canceled') return 'cancelado';
  return 'pendente';
}

export function constructStripeEvent(rawBody: string, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET não configurada.');
  return stripe().webhooks.constructEvent(rawBody, signature, secret);
}
