'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getOrCreateStripeCustomer, createPlanInvoiceSubscription } from '@/lib/payments/stripe';
import { COMPANY_TRIAL_DAYS } from '@/lib/payments/catalog';
import { ACTIVE_COMPANY_COOKIE } from '@/lib/data';

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function startPlanCheckout(formData: FormData) {
  const planSlug = String(formData.get('planSlug') || '');
  if (!planSlug) redirect('/painel/planos?erro=plano');

  const sb = createClient() as any;
  const { data: auth } = await sb.auth.getUser();
  const user = auth.user;
  if (!user) redirect('/entrar');

  const activeCompanyId = cookies().get(ACTIVE_COMPANY_COOKIE)?.value;
  let companyQuery = sb
    .from('companies')
    .select('id,type,trade_name,legal_name,cnpj,email,phone,whatsapp,gateway_customer_id')
    .eq('owner_id', user.id)
    .eq('status', 'ativo');
  companyQuery = activeCompanyId && activeCompanyId !== 'pessoal'
    ? companyQuery.eq('id', activeCompanyId)
    : companyQuery.order('created_at', { ascending: true });
  const { data: company } = await companyQuery.limit(1).maybeSingle();
  if (!company) redirect('/painel/planos?erro=empresa');

  const { data: plan } = await sb
    .from('plans')
    .select('id,name,slug,price,interval,audience,stripe_price_id')
    .eq('slug', planSlug)
    .eq('is_active', true)
    .maybeSingle();
  if (!plan || Number(plan.price) <= 0 || plan.interval === 'unico') redirect('/painel/planos?erro=plano');
  if (!plan.stripe_price_id) {
    console.error('[startPlanCheckout] plano sem stripe_price_id', plan.slug);
    redirect('/painel/planos?erro=plano');
  }

  const brokerCompany = company.type === 'corretor_autonomo';
  if (brokerCompany && plan.audience !== 'corretor_autonomo') redirect('/painel/planos?erro=perfil');
  if (!brokerCompany && plan.audience === 'corretor_autonomo') redirect('/painel/planos?erro=perfil');

  const service = createServiceClient() as any;
  const existingCustomerId = (company as any).gateway_customer_id as string | null;
  const customerId = await getOrCreateStripeCustomer({
    companyId: company.id,
    name: company.legal_name || company.trade_name,
    email: company.email || user.email,
    phone: company.whatsapp || company.phone,
    cpfCnpj: company.cnpj,
    existingCustomerId,
  });
  if (!existingCustomerId) {
    await service.from('companies').update({ gateway_customer_id: customerId }).eq('id', company.id);
  }

  const trialDays = company.type === 'corretor_autonomo' ? 0 : COMPANY_TRIAL_DAYS;
  const subscription = await createPlanInvoiceSubscription({
    customerId,
    plan,
    trialDays,
    metadata: { company_id: company.id, plan_id: plan.id },
  });

  const currentPeriodEnd = trialDays ? addDays(trialDays).toISOString() : null;
  const { data: localSub, error: subError } = await service
    .from('subscriptions')
    .insert({
      company_id: company.id,
      plan_id: plan.id,
      status: trialDays ? 'trial' : 'pendente',
      gateway: 'stripe',
      gateway_customer_id: customerId,
      gateway_subscription_id: subscription.subscriptionId,
      current_period_start: new Date().toISOString(),
      current_period_end: currentPeriodEnd,
    })
    .select('id')
    .single();

  // Garante que a assinatura local existe antes de mandar o usuário pagar. Se
  // não persistir, o webhook não conseguiria vincular o pagamento à assinatura.
  if (subError || !localSub?.id) {
    console.error('[startPlanCheckout] subscription insert', subError?.message);
    redirect('/painel/planos?erro=assinatura');
  }

  // Sem trial: já existe a primeira fatura hospedada; registra o pagamento
  // pendente e manda o usuário pagar. Com trial: a fatura só nasce no fim do
  // período — o webhook cuida da ativação.
  if (!trialDays && subscription.hostedInvoiceUrl) {
    const { error: paymentError } = await service.from('payments').insert({
      company_id: company.id,
      subscription_id: localSub!.id,
      description: `77Imóveis - ${plan.name}`,
      amount: Number(plan.price),
      status: 'pendente',
      gateway: 'stripe',
      gateway_payment_id: subscription.invoiceId,
      external_reference: `subscription:${localSub!.id}`,
      invoice_url: subscription.hostedInvoiceUrl,
    });
    if (paymentError) console.error('[startPlanCheckout] payment insert', paymentError.message);
    redirect(subscription.hostedInvoiceUrl);
  }

  redirect(`${siteUrl()}/painel/planos?checkout=${trialDays ? 'trial' : 'criado'}`);
}
