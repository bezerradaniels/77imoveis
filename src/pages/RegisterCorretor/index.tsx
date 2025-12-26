import { useState } from "react";

import Seo from "../../components/common/Seo";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

type Status = "idle" | "loading" | "success";

type FormData = {
  fullName: string;
  creci: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  specialties: string;
  experience: string;
  bio: string;
};

export default function RegisterCorretor() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    creci: "",
    email: "",
    phone: "",
    whatsapp: "",
    city: "",
    specialties: "",
    experience: "",
    bio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [featuredPlan, setFeaturedPlan] = useState(true);

  const handleChange =
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields: (keyof FormData)[] = [
      "fullName",
      "creci",
      "email",
      "phone",
      "whatsapp",
      "city",
      "specialties",
      "experience",
      "bio",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        newErrors[field] = "Campo obrigatório";
      }
    });

    if (formData.creci && !/^\w{2}-\d{4,5}$/i.test(formData.creci.trim())) {
      newErrors.creci = "Use o formato UF-00000";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone && cleanPhone.length < 10) {
      newErrors.phone = "Telefone inválido";
    }

    const cleanWhatsapp = formData.whatsapp.replace(/\D/g, "");
    if (cleanWhatsapp && cleanWhatsapp.length < 11) {
      newErrors.whatsapp = "Informe um WhatsApp com DDD";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Informe um e-mail válido";
    }

    if (formData.bio && formData.bio.length < 20) {
      newErrors.bio = "Apresente-se com pelo menos 20 caracteres";
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
      <Seo title="77 Imóveis | Cadastro de Corretor" />

      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase font-semibold tracking-[0.2em] text-lime-500">
            Rede de especialistas
          </p>
          <h1 className="text-2xl font-semibold text-foreground">Cadastre-se como corretor parceiro</h1>
          <p className="text-sm text-muted-foreground">
            Receba leads qualificados diariamente, tenha um perfil destaque na busca e acompanhe suas
            negociações em um painel dedicado.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {status === "success" && (
            <div className="rounded-lg border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-900">
              Cadastro enviado! Nossa equipe entrará em contato para liberar seu perfil.
            </div>
          )}

          <Field label="Nome completo" htmlFor="fullName" error={errors.fullName}>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={handleChange("fullName")}
              placeholder="Seu nome como aparece no CRECI"
              autoComplete="name"
              aria-invalid={Boolean(errors.fullName)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Número do CRECI" htmlFor="creci" error={errors.creci}>
              <Input
                id="creci"
                value={formData.creci}
                onChange={handleChange("creci")}
                placeholder="BA-00000"
                aria-invalid={Boolean(errors.creci)}
              />
            </Field>

            <Field label="Cidade base" htmlFor="city" error={errors.city}>
              <Input
                id="city"
                value={formData.city}
                onChange={handleChange("city")}
                placeholder="Vitória da Conquista (BA)"
                aria-invalid={Boolean(errors.city)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="E-mail" htmlFor="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="voce@corretor.com.br"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
            </Field>

            <Field label="Telefone fixo" htmlFor="phone" error={errors.phone}>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange("phone")}
                placeholder="(77) 3422-0000"
                aria-invalid={Boolean(errors.phone)}
              />
            </Field>
          </div>

          <Field label="WhatsApp" htmlFor="whatsapp" error={errors.whatsapp}>
            <Input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={handleChange("whatsapp")}
              placeholder="(77) 99999-0000"
              aria-invalid={Boolean(errors.whatsapp)}
            />
          </Field>

          <Field
            label="Especialidades"
            htmlFor="specialties"
            error={errors.specialties}
          >
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={handleChange("specialties")}
              placeholder="Ex.: alto padrão, lançamentos, locação estudantil"
              aria-invalid={Boolean(errors.specialties)}
            />
          </Field>

          <Field label="Tempo de experiência" htmlFor="experience" error={errors.experience}>
            <Input
              id="experience"
              value={formData.experience}
              onChange={handleChange("experience")}
              placeholder="Ex.: 5 anos, 12 anos"
              aria-invalid={Boolean(errors.experience)}
            />
          </Field>

          <Field label="Fale sobre seu atendimento" htmlFor="bio" error={errors.bio}>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={handleChange("bio")}
              placeholder="Conte sua abordagem, diferenciais e regiões que atua."
              rows={4}
              aria-invalid={Boolean(errors.bio)}
            />
          </Field>

          <div className="space-y-2">
            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border border-input accent-lime-500"
                checked={featuredPlan}
                onChange={(event) => setFeaturedPlan(event.target.checked)}
              />
              Quero saber mais sobre o plano de destaque e impulsionamento de perfil.
            </label>
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border border-input accent-lime-500"
                checked={acceptTerms}
                onChange={(event) => setAcceptTerms(event.target.checked)}
              />
              Declaro que aceito os <span className="font-medium text-foreground">termos de uso</span> e a
              <span className="font-medium text-foreground"> política de privacidade</span>.
            </label>
            {errors.acceptTerms && <p className="text-xs text-destructive">{errors.acceptTerms}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-lime-500 hover:bg-lime-600"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Enviando..." : "Quero me tornar parceiro"}
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
