import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase/service';
import { constructStripeEvent, mapStripeMethod } from '@/lib/payments/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const addMonths = (date: Date, months: number) => {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
};

const iso = (unixSeconds?: number | null) =>
  unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;

// A referência da assinatura mudou de lugar entre versões da API; lê de forma
// defensiva (campo direto, parent.subscription_details ou linhas da fatura).
function invoiceSubscriptionId(invoice: any): string | null {
  return (
    invoice.subscription ||
    invoice.parent?.subscription_details?.subscription ||
    invoice.lines?.data?.find((l: any) => l.subscription)?.subscription ||
    null
  );
}

function invoicePeriod(invoice: any): { start: string | null; end: string | null } {
  const line = invoice.lines?.data?.[0]?.period;
  return { start: iso(line?.start), end: iso(line?.end) };
}

function paymentIntentMethod(pi: any): string | null {
  const type =
    pi.charges?.data?.[0]?.payment_method_details?.type ||
    pi.payment_method_types?.[0] ||
    null;
  return mapStripeMethod(type);
}

// ---- Assinaturas (eventos de fatura) -----------------------------------

async function handleInvoice(
  service: any,
  event: Stripe.Event,
  invoice: any,
): Promise<{ ok: true } | { error: string }> {
  const paid = event.type === 'invoice.paid';
  const stripeSubId = invoiceSubscriptionId(invoice);

  let subscriptionId: string | null = null;
  let companyId: string | null = null;
  if (stripeSubId) {
    const { data: sub } = await service
      .from('subscriptions')
      .select('id,company_id')
      .eq('gateway', 'stripe')
      .eq('gateway_subscription_id', stripeSubId)
      .maybeSingle();
    subscriptionId = sub?.id ?? null;
    companyId = sub?.company_id ?? null;
  }

  // Upsert do pagamento (a 1ª fatura já existe local via gateway_payment_id).
  const patch = {
    company_id: companyId,
    subscription_id: subscriptionId,
    description: invoice.description || 'Assinatura 77Imóveis',
    amount: Number((invoice.amount_paid ?? invoice.amount_due ?? 0)) / 100,
    status: paid ? 'pago' : 'falhou',
    gateway: 'stripe',
    gateway_payment_id: invoice.id,
    external_reference: subscriptionId ? `subscription:${subscriptionId}` : null,
    invoice_url: invoice.hosted_invoice_url ?? null,
    paid_at: paid ? iso(invoice.status_transitions?.paid_at) || new Date().toISOString() : null,
    gateway_payload: invoice,
  };

  const { data: existing } = await service
    .from('payments')
    .select('id')
    .eq('gateway', 'stripe')
    .eq('gateway_payment_id', invoice.id)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await service.from('payments').update(patch).eq('id', existing.id);
    if (error) return { error: `invoice.payment.update: ${error.message}` };
  } else {
    const { error } = await service.from('payments').insert(patch);
    if (error) return { error: `invoice.payment.insert: ${error.message}` };
  }

  if (subscriptionId) {
    const period = invoicePeriod(invoice);
    const start = period.start ?? new Date().toISOString();
    const end = period.end ?? addMonths(new Date(), 1).toISOString();
    const { error } = await service
      .from('subscriptions')
      .update(
        paid
          ? { status: 'ativa', current_period_start: start, current_period_end: end }
          : { status: 'inadimplente' },
      )
      .eq('id', subscriptionId);
    if (error) return { error: `subscription.update: ${error.message}` };
  }

  return { ok: true };
}

// ---- Compras avulsas (eventos de PaymentIntent) ------------------------

async function handlePaymentIntent(
  service: any,
  event: Stripe.Event,
  pi: any,
): Promise<{ ok: true } | { error: string }> {
  const paid = event.type === 'payment_intent.succeeded';
  const paymentId = pi.metadata?.payment_id as string | undefined;
  if (!paymentId) return { ok: true }; // não é uma compra nossa

  const { data: payment } = await service
    .from('payments')
    .select('id')
    .eq('id', paymentId)
    .maybeSingle();
  if (!payment?.id) return { ok: true };

  const { error: updateError } = await service
    .from('payments')
    .update({
      status: paid ? 'pago' : 'falhou',
      method: paymentIntentMethod(pi),
      gateway_payment_id: pi.id,
      paid_at: paid ? new Date().toISOString() : null,
      gateway_payload: pi,
    })
    .eq('id', payment.id);
  if (updateError) return { error: `pi.payment.update: ${updateError.message}` };

  if (!paid) return { ok: true };
  const feature = await activateListingFeature(service, payment.id);
  if ('error' in feature) return feature;
  return activateStorefront(service, payment.id);
}

// Ativa o avulso (destaque ou topo) vinculado ao pagamento.
// Destaque → properties.is_featured; Topo → properties.boosted_until.
async function activateListingFeature(
  service: any,
  paymentId: string,
): Promise<{ ok: true } | { error: string }> {
  const { data: feature, error: featureError } = await service
    .from('listing_features')
    .select('id,days,property_id,feature_type')
    .eq('payment_id', paymentId)
    .maybeSingle();
  if (featureError) return { error: `listing_feature.read: ${featureError.message}` };
  if (!feature?.id) return { ok: true };

  const start = new Date();
  const endsAt = new Date(start);
  endsAt.setDate(endsAt.getDate() + Number(feature.days));
  const { error: updateError } = await service
    .from('listing_features')
    .update({ status: 'ativo', starts_at: start.toISOString(), ends_at: endsAt.toISOString() })
    .eq('id', feature.id);
  if (updateError) return { error: `listing_feature.activate: ${updateError.message}` };

  const propertyPatch =
    feature.feature_type === 'topo'
      ? { boosted_until: endsAt.toISOString() }
      : { is_featured: true };
  const { error: propError } = await service
    .from('properties')
    .update(propertyPatch)
    .eq('id', feature.property_id);
  if (propError) return { error: `property.boost: ${propError.message}` };

  return { ok: true };
}

// Ativa a vitrine vinculada ao pagamento. O service role bypassa o trigger
// guard_storefront_status, então aqui é o único ponto que ativa/define validade.
async function activateStorefront(
  service: any,
  paymentId: string,
): Promise<{ ok: true } | { error: string }> {
  const { data: activation, error: readError } = await service
    .from('storefront_activations')
    .select('id,days,storefront_id')
    .eq('payment_id', paymentId)
    .maybeSingle();
  if (readError) return { error: `storefront_activation.read: ${readError.message}` };
  if (!activation?.id) return { ok: true };

  const start = new Date();
  const endsAt = new Date(start);
  endsAt.setDate(endsAt.getDate() + Number(activation.days));

  const { error: activationError } = await service
    .from('storefront_activations')
    .update({ status: 'ativo', starts_at: start.toISOString(), ends_at: endsAt.toISOString() })
    .eq('id', activation.id);
  if (activationError) return { error: `storefront_activation.activate: ${activationError.message}` };

  const { error: sfError } = await service
    .from('storefronts')
    .update({ status: 'ativo', activated_at: start.toISOString(), expires_at: endsAt.toISOString() })
    .eq('id', activation.storefront_id);
  if (sfError) return { error: `storefront.activate: ${sfError.message}` };

  return { ok: true };
}

async function handleSubscriptionDeleted(
  service: any,
  sub: any,
): Promise<{ ok: true } | { error: string }> {
  const { error } = await service
    .from('subscriptions')
    .update({ status: 'cancelada' })
    .eq('gateway', 'stripe')
    .eq('gateway_subscription_id', sub.id);
  if (error) return { error: `subscription.cancel: ${error.message}` };
  return { ok: true };
}

async function processEvent(
  service: any,
  event: Stripe.Event,
): Promise<{ ok: true } | { error: string }> {
  const obj = event.data.object as any;
  switch (event.type) {
    case 'invoice.paid':
    case 'invoice.payment_failed':
      return handleInvoice(service, event, obj);
    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed':
      return handlePaymentIntent(service, event, obj);
    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(service, obj);
    default:
      return { ok: true }; // evento não tratado: só registra e ignora
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Assinatura ausente' }, { status: 400 });
  }

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = constructStripeEvent(raw, signature);
  } catch (err) {
    console.error('[stripe webhook] assinatura inválida', (err as Error).message);
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 400 });
  }

  const service = createServiceClient() as any;
  const { error: eventError } = await service.from('payment_webhook_events').insert({
    gateway: 'stripe',
    event_id: event.id,
    event_name: event.type,
    payload: event as any,
  });

  if (eventError?.code === '23505') {
    // Evento já registrado. Só ignoramos se ele JÁ foi processado; se um envio
    // anterior falhou (processed_at nulo), deixamos o reenvio reprocessar.
    const { data: prior } = await service
      .from('payment_webhook_events')
      .select('processed_at')
      .eq('gateway', 'stripe')
      .eq('event_id', event.id)
      .maybeSingle();
    if (prior?.processed_at) return NextResponse.json({ received: true, duplicate: true });
  } else if (eventError) {
    return NextResponse.json({ error: 'Erro ao registrar evento' }, { status: 500 });
  }

  const result = await processEvent(service, event);
  if ('error' in result) {
    console.error('[stripe webhook]', event.id, result.error);
    // Não marca como processado: retorna 5xx para o Stripe reenviar o evento.
    return NextResponse.json({ error: 'Falha ao processar evento' }, { status: 500 });
  }

  await service
    .from('payment_webhook_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('gateway', 'stripe')
    .eq('event_id', event.id);

  return NextResponse.json({ received: true });
}
