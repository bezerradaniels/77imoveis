'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ANALYTICS_EVENTS, trackButtonClick, trackConversion, trackEvent } from '@/lib/analytics';
import { Input, Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const blocked = searchParams.get('blocked') === '1';
  const next = nextParam?.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/painel/imoveis';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    trackEvent(ANALYTICS_EVENTS.loginStart, { form_name: 'login' });
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
      trackConversion(ANALYTICS_EVENTS.login, { method: 'email', form_name: 'login' });
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
      <Field label="Senha" htmlFor="login-password">
        <div className="relative">
          <Input
            id="login-password"
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
        <Link href="/esqueci-senha" className="font-bold text-link hover:text-link-hover">
          Esqueci a senha
        </Link>
      </p>
      {blocked && <p className="text-sm font-medium text-danger">Sua conta está desativada. Fale com a administração para recuperar o acesso.</p>}
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
      <Button type="submit" disabled={loading} rounded="lg" className="h-11 w-full font-bold">
        {loading ? 'Entrando…' : 'Entrar'}
      </Button>
      <p className="text-center text-sm text-muted">
        Não tem conta?{' '}
        <Link href="/cadastro" className="font-bold text-link hover:text-link-hover">
          <span
            onClick={() => trackButtonClick({
              button_id: 'login_signup_link',
              button_text: 'Cadastre-se grátis',
              button_location: 'login_form',
            })}
          >
            Cadastre-se grátis
          </span>
        </Link>
      </p>
    </form>
  );
}
