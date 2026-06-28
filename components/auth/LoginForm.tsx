'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input, Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next') || '/painel';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const { error } = await createClient().auth.signInWithPassword({
        email: String(fd.get('email')).trim(),
        password: String(fd.get('password')),
      });
      if (error) {
        setError('E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError('Login indisponível: configuração do servidor ausente.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="E-mail">
        <Input name="email" type="email" autoComplete="email" required placeholder="voce@email.com" />
      </Field>
      <Field label="Senha">
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={loading} rounded="lg" className="w-full">
        {loading ? 'Entrando…' : 'Entrar'}
      </Button>
      <p className="text-center text-sm text-muted">
        Não tem conta?{' '}
        <Link href="/cadastro" className="text-link">
          Cadastre-se grátis
        </Link>
      </p>
    </form>
  );
}
