import { useState } from "react";
import { Link } from "react-router-dom";

import Seo from "../../components/common/Seo";
import { supabase } from "../../components/lib/supabase/client";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { paths } from "../../routes/paths";

type Status = "idle" | "loading";

type FormData = {
  email: string;
  password: string;
};

export default function Login() {
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (signInError) {
      setError("Não foi possível entrar. Verifique seus dados e tente novamente.");
    }

    setStatus("idle");
  }

  return (
    <>
      <Seo title="77 Imóveis | Login" />

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase font-semibold tracking-[0.2em] text-lime-500">
                Bem-vindo de volta
              </p>
              <h1 className="text-2xl font-semibold text-foreground">Acesse sua conta</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie anúncios, acompanhe leads e continue suas negociações de onde parou.
              </p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit} noValidate>
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field label="E-mail" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  placeholder="voce@email.com"
                  autoComplete="email"
                  required
                />
              </Field>

              <Field label="Senha" htmlFor="password">
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 rounded border border-input accent-lime-500"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  Lembrar neste dispositivo
                </label>
                <Link to={paths.contact} className="font-medium text-lime-500 hover:text-lime-600">
                  Esqueceu a senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-lime-500 hover:bg-lime-600"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Entrando..." : "Entrar na plataforma"}
              </Button>
            </form>

            <div className="space-y-3 rounded-xl border border-dashed border-lime-200 bg-lime-50/60 px-4 py-5 text-sm leading-relaxed text-lime-900">
              <p className="font-semibold text-lime-700">Ainda não anuncia na 77 Imóveis?</p>
              <p>Crie sua conta gratuita e conecte-se a milhares de interessados em imóveis no DDD 77.</p>
              <div className="flex flex-col gap-2 text-sm font-medium">
                <Link to={paths.register} className="text-lime-700 hover:text-lime-900">
                  Criar conta gratuita →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
};

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
