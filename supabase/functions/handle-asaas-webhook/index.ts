import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const asaasWebhookToken = Deno.env.get('ASAAS_WEBHOOK_TOKEN');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type AsaasEvent = 'PAYMENT_RECEIVED' | 'PAYMENT_CONFIRMED' | 'PAYMENT_DELETED' | 'PAYMENT_CANCELLED' | 'PAYMENT_REFUNDED' | 'PAYMENT_CHARGEBACK_REQUESTED';

function mapPaymentStatus(event: AsaasEvent, status?: string): string {
  if (['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'].includes(event)) return 'pago';
  if (['PAYMENT_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED'].includes(event)) return 'estornado';
  if (['PAYMENT_DELETED', 'PAYMENT_CANCELLED'].includes(event)) return 'cancelado';
  if (status === 'OVERDUE') return 'falhou';
  return 'pendente';
}

async function handleSubscriptionPayment(data: any) {
  const { subscription, externalReference } = data;
  if (!subscription) return;

  const [companyId] = externalReference?.split('-') || [];
  if (!companyId) return;

  const { data: payment } = await supabase
    .from('payments')
    .select('id, subscription_id')
    .eq('external_reference', externalReference)
    .maybeSingle();

  if (!payment) return;

  const newStatus = mapPaymentStatus(data.event, data.status);
  await supabase
    .from('payments')
    .update({
      status: newStatus,
      gateway_payment_id: data.id,
      gateway_data: data,
      paid_at: newStatus === 'pago' ? new Date().toISOString() : null,
    })
    .eq('id', payment.id);

  if (newStatus === 'pago' && payment.subscription_id) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', payment.subscription_id)
      .single();

    if (subscription) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'ativa',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + (subscription.interval === 'anual' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)).toISOString(),
        })
        .eq('id', subscription.id);
    }
  }
}

async function handleListingFeaturePayment(data: any) {
  const { externalReference } = data;
  if (!externalReference) return;

  const [propertyId, productSlug] = externalReference.split('-');
  if (!propertyId || !productSlug) return;

  const newStatus = mapPaymentStatus(data.event, data.status);
  const { data: payment } = await supabase
    .from('payments')
    .select('id')
    .eq('external_reference', externalReference)
    .maybeSingle();

  if (!payment) return;

  await supabase
    .from('payments')
    .update({
      status: newStatus,
      gateway_payment_id: data.id,
      gateway_data: data,
      paid_at: newStatus === 'pago' ? new Date().toISOString() : null,
    })
    .eq('id', payment.id);

  if (newStatus === 'pago') {
    const catalog: Record<string, { days: number }> = {
      destaque_7: { days: 7 },
      destaque_15: { days: 15 },
      destaque_30: { days: 30 },
      topo_cidade_tipo_7: { days: 7 },
      topo_cidade_tipo_15: { days: 15 },
      topo_cidade_tipo_30: { days: 30 },
    };

    const product = catalog[productSlug];
    if (product) {
      const now = new Date();
      const endsAt = new Date(now.getTime() + product.days * 24 * 60 * 60 * 1000);

      await supabase.from('listing_features').insert({
        property_id: propertyId,
        kind: 'destaque',
        status: 'ativo',
        starts_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
        payment_id: payment.id,
      });

      await supabase
        .from('properties')
        .update({ is_featured: true })
        .eq('id', propertyId);
    }
  }
}

async function handleStorefrontPayment(data: any) {
  const { externalReference } = data;
  if (!externalReference) return;

  const [companyId, days] = externalReference.split('-');
  if (!companyId || !days) return;

  const newStatus = mapPaymentStatus(data.event, data.status);
  const { data: payment } = await supabase
    .from('payments')
    .select('id')
    .eq('external_reference', externalReference)
    .maybeSingle();

  if (!payment) return;

  await supabase
    .from('payments')
    .update({
      status: newStatus,
      gateway_payment_id: data.id,
      gateway_data: data,
      paid_at: newStatus === 'pago' ? new Date().toISOString() : null,
    })
    .eq('id', payment.id);

  if (newStatus === 'pago') {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + Number(days) * 24 * 60 * 60 * 1000);

    await supabase
      .from('storefronts')
      .update({
        status: 'ativo',
        activated_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('company_id', companyId);

    await supabase.from('storefront_activations').insert({
      company_id: companyId,
      days: Number(days),
      price: payment.amount,
      payment_id: payment.id,
      starts_at: now.toISOString(),
      ends_at: expiresAt.toISOString(),
    });
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const token = req.headers.get('webhook-token') || req.headers.get('Webhook-Token');
  if (token !== asaasWebhookToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const data = await req.json();
    const { event, subscription, externalReference } = data;

    if (!event || !externalReference) {
      return new Response('Invalid payload', { status: 400 });
    }

    if (subscription) {
      await handleSubscriptionPayment(data);
    } else if (externalReference.includes('-destaque') || externalReference.includes('-topo')) {
      await handleListingFeaturePayment(data);
    } else if (externalReference.includes('-vitrine')) {
      await handleStorefrontPayment(data);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
