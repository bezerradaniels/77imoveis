'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getOrCreateStripeCustomer, createOneTimeCheckout } from '@/lib/payments/stripe';
import { oneTimeProducts, type OneTimeProductSlug } from '@/lib/payments/catalog';

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export async function startListingFeatureCheckout(formData: FormData) {
  const propertyId = String(formData.get('propertyId') || '');
  const productSlug = String(formData.get('productSlug') || 'destaque_7') as OneTimeProductSlug;
  const product = oneTimeProducts[productSlug];
  if (!propertyId || !product || product.kind !== 'listing_feature') redirect('/painel/imoveis?erro=produto');

  const sb = createClient() as any;
  const { data: auth } = await sb.auth.getUser();
  const user = auth.user;
  if (!user) redirect('/entrar');

  const { data: property } = await sb
    .from('properties')
    .select('id,title,company_id,owner_id')
    .eq('id', propertyId)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!property?.company_id) redirect('/painel/imoveis?erro=profissional');

  const { data: company } = await sb
    .from('companies')
    .select('id,trade_name,legal_name,cnpj,email,phone,whatsapp,gateway_customer_id')
    .eq('id', property.company_id)
    .eq('owner_id', user.id)
    .maybeSingle();
  if (!company) redirect('/painel/imoveis?erro=empresa');

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

  const { data: localPayment, error: paymentError } = await service
    .from('payments')
    .insert({
      company_id: company.id,
      description: `${product.name} - ${property.title}`,
      amount: product.amount,
      status: 'pendente',
      gateway: 'stripe',
    })
    .select('id')
    .single();
  if (paymentError || !localPayment?.id) {
    console.error('[startListingFeatureCheckout] payment insert', paymentError?.message);
    redirect('/painel/imoveis?erro=pagamento');
  }

  const { data: feature, error: featureError } = await service
    .from('listing_features')
    .insert({
      property_id: property.id,
      payment_id: localPayment!.id,
      days: product.days,
      amount: product.amount,
      status: 'pendente_pagamento',
      feature_type: productSlug.startsWith('topo') ? 'topo' : 'destaque',
    })
    .select('id')
    .single();
  if (featureError || !feature?.id) {
    console.error('[startListingFeatureCheckout] listing_feature insert', featureError?.message);
    redirect('/painel/imoveis?erro=destaque');
  }

  const externalReference = `payment:${localPayment!.id}:feature:${feature.id}`;
  const checkout = await createOneTimeCheckout({
    customerId,
    name: product.name,
    description: `${product.description} - ${property.title}`,
    amount: product.amount,
    successUrl: `${siteUrl()}/confirmacao-pagamento?type=destaque&status=pendente`,
    cancelUrl: `${siteUrl()}/painel/imoveis?checkout=cancelado`,
    metadata: {
      payment_id: localPayment!.id,
      feature_id: feature.id,
      company_id: company.id,
      external_reference: externalReference,
    },
  });

  await service
    .from('payments')
    .update({
      gateway_payment_id: checkout.sessionId,
      external_reference: externalReference,
      invoice_url: checkout.url,
    })
    .eq('id', localPayment!.id);

  if (checkout.url) redirect(checkout.url);
  redirect('/painel/imoveis?checkout=criado');
}
