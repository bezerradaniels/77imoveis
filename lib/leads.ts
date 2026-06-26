'use server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getPropertyContactRef } from '@/lib/data';

export type LeadInput = {
  slug: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  website?: string; // honeypot — deve vir vazio
  token?: string; // Cloudflare Turnstile (opcional)
};

export type ContactClickInput = {
  slug: string;
  channel: 'whatsapp' | 'telefone' | 'ligacao';
  contactValue?: string | null;
};

// Grava um contato (lead) de um anúncio. Insert público (RLS) com o dono correto.
export async function submitLead(form: LeadInput): Promise<{ ok?: true; error?: string }> {
  // Anti-spam 1: honeypot. Bots preenchem o campo escondido → descarta silenciosamente.
  if (form.website) return { ok: true };
  if (!form.name?.trim() || !form.phone?.trim()) return { error: 'Informe seu nome e telefone.' };

  // Anti-spam 2: Turnstile (só valida se as chaves estiverem configuradas).
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret && !(await verifyTurnstile(form.token, secret)))
    return { error: 'Verificação anti-robô falhou. Recarregue e tente de novo.' };

  const ref = await getPropertyContactRef(form.slug);
  if (!ref) return { error: 'Anúncio não encontrado.' };

  const h = headers();
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || null;

  const { error } = await createClient().from('leads').insert({
    property_id: ref.id,
    owner_id: ref.owner_id,
    company_id: ref.company_id,
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email?.trim() || null,
    message: form.message?.trim() || null,
    channel: 'formulario',
    ip_address: ip,
    user_agent: h.get('user-agent') || null,
  });
  if (error) return { error: 'Não foi possível enviar agora. Tente novamente.' };
  return { ok: true };
}

// Registra cliques em WhatsApp/telefone como leads leves, sem bloquear o CTA.
export async function trackContactClick(form: ContactClickInput): Promise<{ ok?: true; error?: string }> {
  const ref = await getPropertyContactRef(form.slug);
  if (!ref) return { error: 'Anúncio não encontrado.' };

  const h = headers();
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || null;
  const label = form.channel === 'whatsapp' ? 'Clique no WhatsApp' : 'Clique no telefone';

  const { error } = await createClient().from('leads').insert({
    property_id: ref.id,
    owner_id: ref.owner_id,
    company_id: ref.company_id,
    name: label,
    phone: form.contactValue?.trim() || null,
    message: `Contato iniciado por ${form.channel}.`,
    channel: form.channel,
    ip_address: ip,
    user_agent: h.get('user-agent') || null,
  });
  return error ? { error: 'Não foi possível registrar o contato.' } : { ok: true };
}

async function verifyTurnstile(token: string | undefined, secret: string) {
  if (!token) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    return !!(await r.json()).success;
  } catch {
    return false;
  }
}
