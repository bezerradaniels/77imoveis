'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      if (error) {
        setError('Não foi possível enviar o link agora. Confira o e-mail e tente novamente.');
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError('Recuperação indisponível: configuração do servidor ausente.');
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="py-3 text-center">
        <MailCheck size={34} className="mx-auto text-success" />
        <h2 className="mt-3 text-lg font-bold">Confira seu e-mail</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Se existir uma conta para {email}, você receberá um link para criar uma nova senha.
        </p>
        <Link href="/entrar" className="mt-5 inline-flex items-center justify-center gap-2 text-sm font-bold text-link hover:text-link-hover">
          <ArrowLeft size={16} /> Voltar para entrar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="E-mail da conta">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
        />
      </Field>
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
      <Button type="submit" disabled={loading} rounded="lg" className="h-11 w-full font-bold">
        {loading ? 'Enviando…' : 'Enviar link de recuperação'}
      </Button>
      <p className="text-center text-sm text-muted">
        Lembrou a senha?{' '}
        <Link href="/entrar" className="font-bold text-link hover:text-link-hover">
          Entrar
        </Link>
      </p>
    </form>
  );
}
