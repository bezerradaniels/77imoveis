import { useState } from "react";

import Seo from "../../components/common/Seo";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

type Status = "idle" | "loading" | "success";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterUsuario() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [acceptTerms, setAcceptTerms] = useState(true);

  const handleChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    (Object.keys(formData) as (keyof FormData)[]).forEach((field) => {
      if (!formData[field].trim()) {
        newErrors[field] = "Campo obrigatório";
      }
    });

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Informe um e-mail válido";
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = "A senha deve ter ao menos 6 caracteres";
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "As senhas não conferem";
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = "É necessário aceitar os termos de uso";
    }

    return newErrors;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2200);
    }, 1200);
  };

  return (
    <>
      <Seo title="77 Imóveis | Cadastro de Usuário" />

      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase font-semibold tracking-[0.2em] text-lime-500">
            Crie sua conta
          </p>
          <h1 className="text-2xl font-semibold text-foreground">Entre para o ecossistema 77</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre-se para salvar imóveis favoritos, receber alertas personalizados e conversar com
            imobiliárias e corretores da região.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {status === "success" && (
            <div className="rounded-lg border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-900">
              Conta criada com sucesso! Em instantes você receberá um e-mail de confirmação.
            </div>
          )}

          <Field label="Nome completo" htmlFor="fullName" error={errors.fullName}>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={handleChange("fullName")}
              placeholder="Seu nome completo"
              autoComplete="name"
            />
          </Field>

          <Field label="E-mail" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              placeholder="voce@email.com"
              autoComplete="email"
            />
          </Field>

          <Field label="Telefone / WhatsApp" htmlFor="phone" error={errors.phone}>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange("phone")}
              placeholder="(77) 99999-0000"
              autoComplete="tel"
            />
          </Field>

          <Field label="Senha" htmlFor="password" error={errors.password}>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </Field>

          <Field label="Confirme sua senha" htmlFor="confirmPassword" error={errors.confirmPassword}>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              autoComplete="new-password"
            />
          </Field>

          <div className="space-y-2">
            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border border-input accent-lime-500"
                checked={acceptTerms}
                onChange={(event) => setAcceptTerms(event.target.checked)}
              />
              Desejo receber novidades e aceito os{" "}
              <span className="font-medium text-foreground">termos de uso</span>.
            </label>
            {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms}</p>}
          </div>

          <Button type="submit" className="w-full bg-lime-500 hover:bg-lime-600" disabled={status === "loading"}>
            {status === "loading" ? "Enviando..." : "Criar conta gratuita"}
          </Button>
        </form>
      </div>
    </>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  error?: string;
};

function Field({ label, htmlFor, children, error }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
