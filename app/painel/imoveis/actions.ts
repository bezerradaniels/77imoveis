'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { createAsaasCustomer, createAsaasPayment } from '@/lib/payments/asaas';
import { oneTimeProducts, type OneTimeProductSlug } from '@/lib/payments/catalog';

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const toDate = (date: Date) => date.toISOString().slice(0, 10);

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

  const { data: localPayment } = await service
    .from('payments')
    .insert({
      company_id: company.id,
      description: `${product.name} - ${property.title}`,
      amount: product.amount,
      status: 'pendente',
      gateway: 'asaas',
    })
    .select('id')
    .single();

  const { data: feature } = await service
    .from('listing_features')
    .insert({
      property_id: property.id,
      payment_id: localPayment.id,
      days: product.days,
      amount: product.amount,
      status: 'pendente_pagamento',
    })
    .select('id')
    .single();

  const asaasPayment = await createAsaasPayment({
    customer: customerId,
    billingType: 'UNDEFINED',
    value: product.amount,
    dueDate: toDate(addDays(3)),
    description: `${product.description} - ${property.title}`,
    externalReference: `payment:${localPayment.id}:feature:${feature.id}`,
  });

  await service
    .from('payments')
    .update({
      gateway_payment_id: asaasPayment.id,
      external_reference: asaasPayment.externalReference ?? `payment:${localPayment.id}:feature:${feature.id}`,
      invoice_url: asaasPayment.invoiceUrl ?? null,
      boleto_url: asaasPayment.bankSlipUrl ?? null,
      gateway_payload: asaasPayment,
    })
    .eq('id', localPayment.id);

  if (asaasPayment.invoiceUrl) redirect(asaasPayment.invoiceUrl);
  redirect('/painel/imoveis?checkout=criado');
}
