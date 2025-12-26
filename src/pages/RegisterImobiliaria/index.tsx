import { useState } from "react";

import Seo from "../../components/common/Seo";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

type Status = "idle" | "loading" | "success";

type FormData = {
  companyName: string;
  tradeName: string;
  cnpj: string;
  responsibleName: string;
  email: string;
  phone: string;
  whatsapp: string;
  city: string;
  website: string;
  description: string;
};

export default function RegisterImobiliaria() {
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    tradeName: "",
    cnpj: "",
    responsibleName: "",
    email: "",
    phone: "",
    whatsapp: "",
    city: "",
    website: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [highlightPlan, setHighlightPlan] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(true);

  const handleChange =
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const requiredFields: (keyof FormData)[] = [
      "companyName",
      "tradeName",
      "cnpj",
      "responsibleName",
      "email",
      "phone",
      "whatsapp",
      "city",
      "description",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field].trim()) {
        newErrors[field] = "Campo obrigatório";
      }
    });

    const cleanCnpj = formData.cnpj.replace(/\D/g, "");
    if (cleanCnpj && cleanCnpj.length !== 14) {
      newErrors.cnpj = "Informe um CNPJ com 14 dígitos";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone && cleanPhone.length < 10) {
      newErrors.phone = "Informe um telefone válido";
    }

    const cleanWhatsapp = formData.whatsapp.replace(/\D/g, "");
    if (cleanWhatsapp && cleanWhatsapp.length < 11) {
      newErrors.whatsapp = "Informe um WhatsApp com DDD";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Informe um e-mail válido";
    }

    if (formData.description && formData.description.length < 20) {
      newErrors.description = "Conte um pouco mais sobre a imobiliária";
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
    }, 1400);
  };

  return (
    <>
      <Seo title="77 Imóveis | Cadastro de Imobiliária" />

      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase font-semibold tracking-[0.2em] text-lime-500">
            Novo parceiro
          </p>
          <h1 className="text-2xl font-semibold text-foreground">Cadastre sua imobiliária</h1>
          <p className="text-sm text-muted-foreground">
            Anuncie seus imóveis na maior vitrine do DDD 77, receba leads qualificados e acompanhe a
            performance pelo painel dedicado.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {status === "success" && (
            <div className="rounded-lg border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-900">
              Recebemos seus dados! Em breve nossa equipe entrará em contato para ativar seu painel.
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Razão social" htmlFor="companyName" error={errors.companyName}>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={handleChange("companyName")}
                placeholder="Nome legal da empresa"
                aria-invalid={Boolean(errors.companyName)}
              />
            </Field>

            <Field label="Nome fantasia" htmlFor="tradeName" error={errors.tradeName}>
              <Input
                id="tradeName"
                value={formData.tradeName}
                onChange={handleChange("tradeName")}
                placeholder="Como o público conhece sua marca"
                aria-invalid={Boolean(errors.tradeName)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="CNPJ" htmlFor="cnpj" error={errors.cnpj}>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={handleChange("cnpj")}
                placeholder="00.000.000/0001-00"
                aria-invalid={Boolean(errors.cnpj)}
              />
            </Field>

            <Field label="Responsável comercial" htmlFor="responsibleName" error={errors.responsibleName}>
              <Input
                id="responsibleName"
                value={formData.responsibleName}
                onChange={handleChange("responsibleName")}
                placeholder="Nome do contato principal"
                aria-invalid={Boolean(errors.responsibleName)}
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
                placeholder="contato@empresa.com.br"
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
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp comercial" htmlFor="whatsapp" error={errors.whatsapp}>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange("whatsapp")}
                placeholder="(77) 99999-0000"
                aria-invalid={Boolean(errors.whatsapp)}
              />
            </Field>

            <Field label="Cidade base" htmlFor="city" error={errors.city}>
              <Input
                id="city"
                value={formData.city}
                onChange={handleChange("city")}
                placeholder="Ex.: Vitória da Conquista (BA)"
                aria-invalid={Boolean(errors.city)}
              />
            </Field>
          </div>

          <Field label="Site / Instagram" htmlFor="website">
            <Input
              id="website"
              value={formData.website}
              onChange={handleChange("website")}
              placeholder="https://instagram.com/suaimobiliaria"
            />
          </Field>

          <Field
            label="Conte um pouco sobre a imobiliária"
            htmlFor="description"
            error={errors.description}
          >
            <Textarea
              id="description"
              value={formData.description}
              onChange={handleChange("description")}
              placeholder="Quantidade de imóveis, cidades atendidas, diferenciais e tipos de imóveis ofertados."
              rows={4}
              aria-invalid={Boolean(errors.description)}
            />
          </Field>

          <div className="space-y-2">
            <label className="flex items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="mt-1 size-4 rounded border border-input accent-lime-500"
                checked={highlightPlan}
                onChange={(event) => setHighlightPlan(event.target.checked)}
              />
              Quero conhecer os planos com destaque e impulsionamento dos imóveis.
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
            {status === "loading" ? "Enviando dados..." : "Quero anunciar na 77 Imóveis"}
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
