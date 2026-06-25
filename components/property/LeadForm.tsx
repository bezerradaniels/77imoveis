'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitLead } from '@/lib/leads';
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
      <Input name="name" placeholder="Seu nome" required />
      <Input name="phone" type="tel" placeholder="WhatsApp / Telefone" required />
      <Input name="email" type="email" placeholder="E-mail (opcional)" />
      <textarea
        name="message"
        rows={3}
        className="w-full rounded-lg border border-border bg-surface p-3 text-sm"
        placeholder={`Tenho interesse no imóvel "${title}".`}
      />
      {SITE_KEY && <div className="cf-turnstile" data-sitekey={SITE_KEY} />}
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Enviando…' : 'Enviar mensagem'}
      </Button>
    </form>
  );
}
