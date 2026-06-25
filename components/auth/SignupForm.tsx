'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input, Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const full_name = String(fd.get('full_name')).trim();
    const phone = String(fd.get('phone')).trim();
    const email = String(fd.get('email')).trim();
    const password = String(fd.get('password'));
    if (password.length < 6) {
      setError('A senha precisa ter ao menos 6 caracteres.');
      setLoading(false);
      return;
    }
    try {
      const sb = createClient();
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name } },
      });
      if (error) {
        setError(error.message.includes('registered') ? 'Este e-mail já tem conta.' : 'Não foi possível criar a conta.');
        setLoading(false);
        return;
      }
      if (data.session && data.user) {
        // Conta já ativa: completa o telefone no profile (criado pelo trigger).
        await sb.from('profiles').update({ phone }).eq('id', data.user.id);
        router.push('/painel');
        router.refresh();
      } else {
        // Confirmação de e-mail necessária.
        setSent(true);
      }
    } catch {
      setError('Cadastro indisponível: configuração do servidor ausente.');
      setLoading(false);
    }
  }

  if (sent)
    return (
      <div className="space-y-3 rounded-xl border border-border bg-surface p-6 text-center">
        <MailCheck size={32} className="mx-auto text-success" />
        <h2 className="font-semibold">Confirme seu e-mail</h2>
        <p className="text-sm text-muted">
          Enviamos um link de confirmação. Abra-o para ativar sua conta e entrar.
        </p>
        <Link href="/entrar" className="inline-block text-sm text-primary">
          Voltar para o login
        </Link>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nome completo">
        <Input name="full_name" autoComplete="name" required placeholder="Seu nome" />
      </Field>
      <Field label="WhatsApp / Telefone">
        <Input name="phone" type="tel" autoComplete="tel" required placeholder="(77) 90000-0000" />
      </Field>
      <Field label="E-mail">
        <Input name="email" type="email" autoComplete="email" required placeholder="voce@email.com" />
      </Field>
      <Field label="Senha">
        <Input name="password" type="password" autoComplete="new-password" required minLength={6} />
      </Field>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Criando conta…' : 'Criar conta grátis'}
      </Button>
      <p className="text-center text-sm text-muted">
        Já tem conta?{' '}
        <Link href="/entrar" className="text-primary">
          Entrar
        </Link>
      </p>
    </form>
  );
}
