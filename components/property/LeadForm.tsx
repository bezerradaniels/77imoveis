'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitLead } from '@/lib/leads';
import { ANALYTICS_EVENTS, trackButtonClick, trackConversion, trackEvent } from '@/lib/analytics';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Formulário de contato do imóvel. Grava o lead e tem anti-spam (honeypot + Turnstile).
export function LeadForm({ slug, title }: { slug: string; title: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Carrega o widget do Turnstile só se a chave pública estiver configurada.
  useEffect(() => {
    if (!SITE_KEY || document.getElementById('cf-turnstile-script')) return;
    const s = document.createElement('script');
    s.id = 'cf-turnstile-script';
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    document.body.appendChild(s);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    trackEvent(ANALYTICS_EVENTS.contactAttempt, {
      channel: 'formulario',
      form_name: 'property_lead',
      property_slug: slug,
      source_component: 'property_lead_form',
    });
    trackButtonClick({
      button_id: 'property_detail_lead_submit_button',
      button_text: 'Enviar mensagem',
      button_location: 'property_lead_form',
    });
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const r = await submitLead({
      slug,
      name: String(fd.get('name') || ''),
      phone: String(fd.get('phone') || ''),
      email: String(fd.get('email') || ''),
      message: String(fd.get('message') || '') || `Tenho interesse no imóvel "${title}".`,
      website: String(fd.get('website') || ''),
      token: String(fd.get('cf-turnstile-response') || ''),
    });
    if (r?.error) {
      setError(r.error);
      setLoading(false);
      return;
    }
    trackConversion(ANALYTICS_EVENTS.leadGenerate, {
      form_name: 'property_lead',
      property_slug: slug,
      success: true,
      source_component: 'property_lead_form',
    });
    setSent(true);
  }

  if (sent)
    return (
      <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
        <CheckCircle2 size={18} /> Mensagem enviada! O anunciante vai entrar em contato.
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="space-y-2.5">
      {/* honeypot (escondido para humanos) */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Input name="name" placeholder="Seu nome" required className="border border-border bg-bg" />
      <Input name="phone" type="tel" placeholder="WhatsApp / Telefone" required className="border border-border bg-bg" />
      <Input name="email" type="email" placeholder="E-mail (opcional)" className="border border-border bg-bg" />
      <textarea
        name="message"
        rows={3}
        className="w-full resize-none rounded-lg border border-border bg-bg p-3 text-sm outline-none transition focus:ring-2 focus:ring-primary"
        placeholder={`Tenho interesse no imóvel "${title}".`}
      />
      {SITE_KEY && <div className="cf-turnstile" data-sitekey={SITE_KEY} />}
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={loading} rounded="lg" className="h-11 w-full">
        {loading ? 'Enviando…' : 'Enviar mensagem'}
      </Button>
    </form>
  );
}
