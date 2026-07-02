// Edge Function: envia e-mails (via Resend) quando um lead é criado pelo
// formulário de contato de um imóvel. Disparada por um trigger no Postgres
// (ver database/25_lead_email_notifications.sql), não por chamada do app.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('LEADS_WEBHOOK_SECRET')!;
const FROM_EMAIL = 'Contato 77Imóveis <contato@77imoveis.com.br>';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://77imoveis.com.br';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

type LeadRecord = {
  id: string;
  property_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
};

async function sendEmail(payload: { to: string; subject: string; html: string; replyTo?: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      reply_to: payload.replyTo,
    }),
  });
  if (!res.ok) console.error('Resend error:', res.status, await res.text());
}

Deno.serve(async (req: Request) => {
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('unauthorized', { status: 401 });
  }

  const { record } = (await req.json()) as { record: LeadRecord };

  const { data: property } = await supabase
    .from('properties')
    .select('title,slug,lead_email,contact_email,owner_id,profiles!properties_owner_id_fkey(email)')
    .eq('id', record.property_id)
    .maybeSingle();

  if (!property) return new Response('ok', { status: 200 });

  const ownerEmail = (property as any).profiles?.email as string | undefined;
  const notifyTo = property.lead_email || property.contact_email || ownerEmail;
  const propertyUrl = `${SITE_URL}/imovel/${property.slug}`;

  if (notifyTo) {
    await sendEmail({
      to: notifyTo,
      subject: `Novo contato: ${property.title}`,
      replyTo: record.email ?? undefined,
      html: `
        <p>Você recebeu um novo contato pelo anúncio <strong>${property.title}</strong>.</p>
        <p><strong>Nome:</strong> ${record.name}</p>
        <p><strong>Telefone:</strong> ${record.phone ?? '-'}</p>
        <p><strong>E-mail:</strong> ${record.email ?? '-'}</p>
        <p><strong>Mensagem:</strong> ${record.message ?? '-'}</p>
        <p><a href="${propertyUrl}">Ver anúncio</a></p>
      `,
    });
  }

  if (record.email) {
    await sendEmail({
      to: record.email,
      subject: `Recebemos seu contato — ${property.title}`,
      html: `
        <p>Olá, ${record.name}!</p>
        <p>Recebemos seu interesse no anúncio <strong>${property.title}</strong> e o anunciante foi notificado por e-mail.</p>
        <p>Em breve você deve receber um retorno. Se preferir, veja o anúncio novamente: <a href="${propertyUrl}">${propertyUrl}</a></p>
        <p>— Equipe 77Imóveis</p>
      `,
    });
  }

  return new Response('ok', { status: 200 });
});
