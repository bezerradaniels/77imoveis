import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { mapAsaasBillingType, mapAsaasPaymentStatus, type AsaasPayment } from '@/lib/payments/asaas';

export const dynamic = 'force-dynamic';

const paidEvents = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'];
const failedEvents = ['PAYMENT_OVERDUE'];

const addMonths = (date: Date, months: number) => {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
};

function validateToken(request: Request) {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!expected) return true;
  return request.headers.get('asaas-access-token') === expected;
}

async function upsertPayment(service: any, event: string, payment: AsaasPayment) {
  if (!payment?.id) return null;

  const status = mapAsaasPaymentStatus(event, payment.status);
  const method = mapAsaasBillingType(payment.billingType);
  const paidAt = status === 'pago'
    ? payment.paymentDate || payment.clientPaymentDate || new Date().toISOString()
    : null;

  const { data: existing } = await service
    .from('payments')
    .select('id,subscription_id,company_id,status')
    .eq('gateway', 'asaas')
    .eq('gateway_payment_id', payment.id)
    .maybeSingle();

  let subscriptionId = existing?.subscription_id ?? null;
  let companyId = existing?.company_id ?? null;
  if ((!subscriptionId || !companyId) && payment.subscription) {
    const { data: subscription } = await service
      .from('subscriptions')
      .select('id,company_id')
      .eq('gateway', 'asaas')
      .eq('gateway_subscription_id', payment.subscription)
      .maybeSingle();
    subscriptionId = subscription?.id ?? subscriptionId;
    companyId = subscription?.company_id ?? companyId;
  }

  const patch = {
    company_id: companyId,
    subscription_id: subscriptionId,
    description: 'Cobrança Asaas',
    amount: Number(payment.value ?? 0),
    method,
    status,
    gateway: 'asaas',
    gateway_payment_id: payment.id,
    external_reference: payment.externalReference ?? null,
    invoice_url: payment.invoiceUrl ?? null,
    boleto_url: payment.bankSlipUrl ?? null,
    paid_at: paidAt,
    gateway_payload: payment,
  };

  if (existing?.id) {
    const { data } = await service.from('payments').update(patch).eq('id', existing.id).select('*').single();
    return data;
  }

  const { data } = await service.from('payments').insert(patch).select('*').single();
  return data;
}

async function applyBusinessRules(service: any, event: string, paymentRow: any) {
  if (!paymentRow) return;

  if (paymentRow.subscription_id && paidEvents.includes(event)) {
    const start = new Date();
    await service
      .from('subscriptions')
      .update({
        status: 'ativa',
        current_period_start: start.toISOString(),
        current_period_end: addMonths(start, 1).toISOString(),
      })
      .eq('id', paymentRow.subscription_id);
  }

  if (paymentRow.subscription_id && failedEvents.includes(event)) {
    await service
      .from('subscriptions')
      .update({ status: 'inadimplente' })
      .eq('id', paymentRow.subscription_id);
  }

  if (paidEvents.includes(event)) {
    const start = new Date();
    const { data: feature } = await service
      .from('listing_features')
      .select('id,days,property_id')
      .eq('payment_id', paymentRow.id)
      .maybeSingle();
    if (feature?.id) {
      const endsAt = new Date(start);
      endsAt.setDate(endsAt.getDate() + Number(feature.days));
      await service
        .from('listing_features')
        .update({
          status: 'ativo',
          starts_at: start.toISOString(),
          ends_at: endsAt.toISOString(),
        })
        .eq('id', feature.id);
      await service.from('properties').update({ is_featured: true }).eq('id', feature.property_id);
    }
  }
}

export async function POST(request: Request) {
  if (!validateToken(request)) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload?.id || !payload?.event) {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const service = createServiceClient() as any;
  const { error: eventError } = await service.from('payment_webhook_events').insert({
    gateway: 'asaas',
    event_id: payload.id,
    event_name: payload.event,
    payload,
  });

  if (eventError?.code === '23505') {
    return NextResponse.json({ received: true, duplicate: true });
  }
  if (eventError) {
    return NextResponse.json({ error: 'Erro ao registrar evento' }, { status: 500 });
  }

  const paymentRow = payload.payment
    ? await upsertPayment(service, payload.event, payload.payment)
    : null;
  await applyBusinessRules(service, payload.event, paymentRow);

  await service
    .from('payment_webhook_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('gateway', 'asaas')
    .eq('event_id', payload.id);

  return NextResponse.json({ received: true });
}
