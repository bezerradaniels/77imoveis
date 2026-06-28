'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, MailCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input, Field } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (digits.length <= 2) return digits.length ? `(${ddd}` : '';
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  if (digits.length <= 10) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
}

export function SignupForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        options: { data: { full_name, phone, whatsapp: phone } },
      });
      if (error) {
        setError(error.message.includes('registered') ? 'Este e-mail já tem conta.' : 'Não foi possível criar a conta.');
        setLoading(false);
        return;
      }
      if (data.session && data.user) {
        // Conta já ativa: completa o telefone no profile (criado pelo trigger).
        await sb.from('profiles').update({ phone, whatsapp: phone }).eq('id', data.user.id);
        window.location.assign('/painel/escolha-perfil');
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
      <div className="space-y-3 rounded-[30px] border border-border bg-surface p-6 text-center">
        <MailCheck size={32} className="mx-auto text-success" />
        <h2 className="font-semibold">Confirme seu e-mail</h2>
        <p className="text-sm text-muted">
          Enviamos um link de confirmação. Abra-o para ativar sua conta e entrar.
        </p>
        <Link href="/entrar" className="inline-block text-sm text-link">
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
        <Input
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          required
          placeholder="(77) 90000-0000"
          maxLength={15}
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
        />
      </Field>
      <Field label="E-mail">
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
      <Field label="Senha">
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={6}
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
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={loading} rounded="lg" className="w-full">
        {loading ? 'Criando conta…' : 'Criar conta grátis'}
      </Button>
      <p className="text-center text-sm text-muted">
        Já tem conta?{' '}
        <Link href="/entrar" className="text-link">
          Entrar
        </Link>
      </p>
    </form>
  );
}
