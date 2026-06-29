'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input, Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const nextParam = useSearchParams().get('next');
  const next = nextParam?.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/painel/imoveis';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      window.location.assign(next);
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
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>
      <p className="text-right text-sm">
        <Link href="/esqueci-senha" className="text-link">
          Esqueci a senha
        </Link>
      </p>
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
