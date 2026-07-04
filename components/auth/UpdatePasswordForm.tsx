'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

export function UpdatePasswordForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get('password'));
    const confirm = String(fd.get('confirm'));

    if (password.length < 6) {
      setError('A nova senha precisa ter ao menos 6 caracteres.');
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError('As senhas não conferem.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) {
        setError('Link expirado ou inválido. Solicite uma nova recuperação de senha.');
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError('Alteração indisponível: configuração do servidor ausente.');
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="py-3 text-center">
        <LockKeyhole size={34} className="mx-auto text-success" />
        <h2 className="mt-3 text-lg font-bold">Senha atualizada</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">Agora você já pode acessar seu painel com a nova senha.</p>
        <Link href="/entrar" className="mt-5 inline-flex rounded-lg bg-action px-4 py-2 text-sm font-bold text-on-action hover:bg-action-hover">
          Entrar no painel
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nova senha">
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
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted hover:text-text"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </Field>
      <Field label="Confirmar nova senha">
        <Input name="confirm" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={6} />
      </Field>
      {error && <p className="text-sm font-medium text-danger">{error}</p>}
      <Button type="submit" disabled={loading} rounded="lg" className="h-11 w-full font-bold">
        {loading ? 'Salvando…' : 'Salvar nova senha'}
      </Button>
      <p className="text-center text-sm text-muted">
        O link expirou?{' '}
        <Link href="/esqueci-senha" className="font-bold text-link hover:text-link-hover">
          Enviar outro link
        </Link>
      </p>
    </form>
  );
}
