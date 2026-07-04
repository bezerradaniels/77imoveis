'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getOrCreateStripeCustomer, createOneTimeCheckout } from '@/lib/payments/stripe';
import { ACTIVE_COMPANY_COOKIE } from '@/lib/data';
import { slugify } from '@/lib/format';
import type { Database } from '@/lib/supabase/types';

const DEFAULT_VITRINE_PRECOS = [
  { dias: 30, preco: 49.9, label: '30 dias' },
  { dias: 90, preco: 119.9, label: '90 dias' },
  { dias: 365, preco: 399.9, label: '1 ano' },
];

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

type StorefrontInsert = Database['public']['Tables']['storefronts']['Insert'];
type StorefrontUpdate = Database['public']['Tables']['storefronts']['Update'];

export type StorefrontInput = {
  slug?: string;
  headline?: string;
  about?: string;
  accentColor?: string;
  logoUrl?: string;
  coverUrl?: string;
  showWhatsapp: boolean;
};

async function uniqueSlug(sb: any, base: string) {
  const cleanBase = slugify(base).slice(0, 80) || 'vitrine';
  let slug = cleanBase;
  let n = 1;
  for (;;) {
    const { data } = await sb.from('storefronts').select('id').eq('slug', slug).maybeSingle();
    if (!data) return slug;
    slug = `${cleanBase}-${++n}`;
  }
}

// Salva a aparência da vitrine. O status/validade é controlado só pelo pagamento
// (trigger guard_storefront_status no banco) — o dono não consegue se ativar.
export async function saveStorefront(input: StorefrontInput): Promise<{ slug?: string; error?: string }> {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: 'Sessão expirada.' };

  const { data: companies } = await sb.from('companies').select('id,slug').eq('owner_id', auth.user.id).limit(1);
  const company = companies?.[0];
  if (!company) return { error: 'Crie sua empresa antes de configurar a vitrine.' };

  const accentColor = /^#[0-9a-f]{6}$/i.test(input.accentColor ?? '') ? input.accentColor : '#0ea5e9';
  const base: StorefrontUpdate = {
    headline: input.headline?.trim() || null,
    about: input.about?.trim() || null,
    accent_color: accentColor,
    logo_url: input.logoUrl?.trim() || null,
    cover_url: input.coverUrl?.trim() || null,
    show_whatsapp: input.showWhatsapp,
  };

  const { data: existing } = await sb.from('storefronts').select('id,slug').eq('company_id', company.id).maybeSingle();
  if (existing) {
    const { error } = await sb.from('storefronts').update(base).eq('id', existing.id);
    if (error) return { error: 'Não foi possível salvar a vitrine.' };
    revalidatePath('/painel/vitrine');
    revalidatePath(`/vitrine/${existing.slug}`);
    return { slug: existing.slug };
  }

  const slug = await uniqueSlug(sb, slugify(input.slug || company.slug));
  const insertPayload: StorefrontInsert = { ...base, company_id: company.id, slug };
  const { error } = await sb.from('storefronts').insert(insertPayload);
  if (error) return { error: 'Não foi possível criar a vitrine.' };
  revalidatePath('/painel/vitrine');
  revalidatePath(`/vitrine/${slug}`);
  return { slug };
}

// Checkout de ativação da vitrine por período (avulso). A ativação em si só
// acontece no webhook (payment_intent.succeeded) — o trigger guard_storefront_status
// impede o dono de se ativar sozinho.
export async function startStorefrontCheckout(formData: FormData) {
  const days = Number(formData.get('days') || 0);
  if (!days) redirect('/painel/planos?erro=periodo');

  const sb = createClient() as any;
  const { data: auth } = await sb.auth.getUser();
  const user = auth.user;
  if (!user) redirect('/entrar');

  const activeCompanyId = cookies().get(ACTIVE_COMPANY_COOKIE)?.value;
  let companyQuery = sb
    .from('companies')
    .select('id,trade_name,legal_name,cnpj,email,phone,whatsapp,gateway_customer_id')
    .eq('owner_id', user.id)
    .eq('status', 'ativo');
  companyQuery = activeCompanyId && activeCompanyId !== 'pessoal'
    ? companyQuery.eq('id', activeCompanyId)
    : companyQuery.order('created_at', { ascending: true });
  const { data: company } = await companyQuery.limit(1).maybeSingle();
  if (!company) redirect('/painel/planos?erro=empresa');

  const { data: storefront } = await sb.from('storefronts').select('id').eq('company_id', company.id).maybeSingle();
  if (!storefront) redirect('/painel/vitrine?erro=configurar');

  const { data: setting } = await sb.from('site_settings').select('value').eq('key', 'vitrine_precos').maybeSingle();
  const precos = (setting?.value as { dias: number; preco: number }[] | null) ?? DEFAULT_VITRINE_PRECOS;
  const option = precos.find((p) => Number(p.dias) === days);
  if (!option) redirect('/painel/planos?erro=periodo');
  const amount = Number(option.preco);

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

  const { data: payment, error: paymentError } = await service
    .from('payments')
    .insert({
      company_id: company.id,
      description: `Vitrine 77Imóveis - ${days} dias`,
      amount,
      status: 'pendente',
      gateway: 'stripe',
    })
    .select('id')
    .single();
  if (paymentError || !payment?.id) {
    console.error('[startStorefrontCheckout] payment insert', paymentError?.message);
    redirect('/painel/planos?erro=pagamento');
  }

  const { data: activation, error: activationError } = await service
    .from('storefront_activations')
    .insert({
      storefront_id: storefront.id,
      payment_id: payment!.id,
      days,
      amount,
      status: 'pendente_pagamento',
    })
    .select('id')
    .single();
  if (activationError || !activation?.id) {
    console.error('[startStorefrontCheckout] activation insert', activationError?.message);
    redirect('/painel/planos?erro=vitrine');
  }

  const externalReference = `payment:${payment!.id}:storefront:${activation.id}`;
  const checkout = await createOneTimeCheckout({
    customerId,
    name: 'Vitrine 77Imóveis',
    description: `Ativação da vitrine por ${days} dias`,
    amount,
    successUrl: `${siteUrl()}/confirmacao-pagamento?type=vitrine&status=pendente`,
    cancelUrl: `${siteUrl()}/painel/planos?checkout=cancelado`,
    metadata: {
      payment_id: payment!.id,
      storefront_activation_id: activation.id,
      company_id: company.id,
      type: 'vitrine',
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
    .eq('id', payment!.id);

  if (checkout.url) redirect(checkout.url);
  redirect('/painel/planos?checkout=criado');
}
