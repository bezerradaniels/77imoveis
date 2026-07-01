'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createAsaasCustomer, createAsaasSubscription, listAsaasSubscriptionPayments } from '@/lib/payments/asaas';
import { COMPANY_TRIAL_DAYS } from '@/lib/payments/catalog';

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const toDate = (date: Date) => date.toISOString().slice(0, 10);

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

  const { data: company } = await sb
    .from('companies')
    .select('id,type,trade_name,legal_name,cnpj,email,phone,whatsapp,gateway_customer_id')
    .eq('owner_id', user.id)
    .eq('status', 'ativo')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!company) redirect('/painel/planos?erro=empresa');

  const { data: plan } = await sb
    .from('plans')
    .select('id,name,slug,price,interval,audience')
    .eq('slug', planSlug)
    .eq('is_active', true)
    .maybeSingle();
  if (!plan || Number(plan.price) <= 0 || plan.interval === 'unico') redirect('/painel/planos?erro=plano');

  const service = createServiceClient() as any;
  let customerId = (company as any).gateway_customer_id as string | null;
  if (!customerId) {
    const customer = await createAsaasCustomer({
      name: company.legal_name || company.trade_name,
      cpfCnpj: company.cnpj,
      email: company.email || user.email,
      mobilePhone: company.whatsapp || company.phone,
      externalReference: `company:${company.id}`,
    });
    customerId = customer.id;
    await service.from('companies').update({ gateway_customer_id: customerId }).eq('id', company.id);
  }

  const trialDays = company.type === 'corretor_autonomo' ? 0 : COMPANY_TRIAL_DAYS;
  const nextDueDate = toDate(addDays(trialDays));
  const externalReference = `plan:${company.id}:${plan.id}:${Date.now()}`;
  const subscription = await createAsaasSubscription({
    customer: customerId,
    billingType: 'UNDEFINED',
    value: Number(plan.price),
    nextDueDate,
    cycle: plan.interval === 'anual' ? 'YEARLY' : 'MONTHLY',
    description: `77Imóveis - ${plan.name}`,
    externalReference,
  });

  const currentPeriodEnd = trialDays ? addDays(trialDays).toISOString() : null;
  const { data: localSub } = await service
    .from('subscriptions')
    .insert({
      company_id: company.id,
      plan_id: plan.id,
      status: trialDays ? 'trial' : 'pendente',
      gateway: 'asaas',
      gateway_customer_id: customerId,
      gateway_subscription_id: subscription.id,
      current_period_start: new Date().toISOString(),
      current_period_end: currentPeriodEnd,
    })
    .select('id')
    .single();

  if (!trialDays) {
    const payments = await listAsaasSubscriptionPayments(subscription.id).catch(() => []);
    const firstPayment = payments[0];
    if (firstPayment?.id) {
      await service.from('payments').insert({
        company_id: company.id,
        subscription_id: localSub?.id,
        description: `77Imóveis - ${plan.name}`,
        amount: Number(firstPayment.value ?? plan.price),
        status: 'pendente',
        gateway: 'asaas',
        gateway_payment_id: firstPayment.id,
        external_reference: firstPayment.externalReference ?? externalReference,
        invoice_url: firstPayment.invoiceUrl ?? null,
        boleto_url: firstPayment.bankSlipUrl ?? null,
        gateway_payload: firstPayment,
      });
      if (firstPayment.invoiceUrl) redirect(firstPayment.invoiceUrl);
    }
  }

  redirect(`${siteUrl()}/painel/planos?checkout=${trialDays ? 'trial' : 'criado'}`);
}
