import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { paths } from "../../routes/paths";
import { supabase } from "../../components/lib/supabase/client";
import { Home, Heart, Building2, MessageCircle, Check } from "lucide-react";

type Status = "idle" | "loading" | "success";

type FormData = {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
};

const benefits = [
    {
        icon: Home,
        title: "Anuncie seus imóveis",
        description: "Publique como pessoa física, corretor ou imobiliária.",
    },
    {
        icon: Heart,
        title: "Salve seus favoritos",
        description: "Guarde os imóveis que mais gostou para acessar depois.",
    },
    {
        icon: Building2,
        title: "Gerencie perfis profissionais",
        description: "Crie perfis de corretor e imobiliária pelo painel.",
    },
    {
        icon: MessageCircle,
        title: "Contato direto",
        description: "Converse com anunciantes e receba propostas.",
    },
];

export default function Register() {
    const navigate = useNavigate();
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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setStatus("loading");
        setErrors({}); // Clear previous errors

        try {
            // 1. Criar usuário no Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Criar perfil na tabela pública (fallback caso não tenha trigger)
                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert({
                        id: authData.user.id,
                        full_name: formData.fullName,
                        phone: formData.phone,
                        role: "usuario", // Default role
                    })
                    .select()
                    .single();

                // Se der erro de duplicidade (já criado por trigger), ignoramos
                if (profileError && profileError.code !== "23505") {
                    console.warn("Erro ao criar perfil manual (pode ter sido criado por trigger):", profileError);
                }

                setStatus("success");
                setTimeout(() => {
                    navigate(paths.dashUsuario);
                }, 1500);
            }
        } catch (error: any) {
            console.error("Erro no cadastro:", error);
            setStatus("idle");
            setErrors({
                email: error.message || "Erro ao criar conta. Tente novamente.",
            });
        }
    };

    return (
        <>
            <Seo title="77 Imóveis | Cadastro" />
            <div className="min-h-[90vh] flex items-center bg-gray-50">
                <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Coluna 1: Vantagens */}
                    <div className="space-y-8">
                        <div>
                            <p className="text-xs uppercase font-semibold tracking-[0.25em] text-lime-600 mb-2">
                                Gratuito e sem burocracia
                            </p>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                Crie sua conta e aproveite tudo que a 77 Imóveis oferece
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {benefits.map((benefit) => (
                                <div
                                    key={benefit.title}
                                    className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-100"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center flex-shrink-0">
                                        <benefit.icon className="w-5 h-5 text-lime-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm">{benefit.title}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Check className="w-4 h-4 text-lime-500" />
                            <span>Mais de 1.000 usuários já cadastrados na região</span>
                        </div>
                    </div>

                    {/* Coluna 2: Formulário */}
                    <div className="bg-white rounded-3xl p-6 lg:p-8 border border-gray-100">
                        <div className="space-y-1 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Criar conta</h2>
                            <p className="text-sm text-gray-500">Preencha seus dados para começar</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                            {status === "success" && (
                                <div className="rounded-xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-900">
                                    Conta criada! Redirecionando para o painel...
                                </div>
                            )}

                            <Field label="Nome completo" htmlFor="fullName" error={errors.fullName}>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange("fullName")}
                                    placeholder="Seu nome"
                                    autoComplete="name"
                                    className="h-11 rounded-xl border-gray-200 focus:border-lime-500 focus:ring-lime-500"
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
                                    className="h-11 rounded-xl border-gray-200 focus:border-lime-500 focus:ring-lime-500"
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
                                    className="h-11 rounded-xl border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                                />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Senha" htmlFor="password" error={errors.password}>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange("password")}
                                        placeholder="••••••"
                                        autoComplete="new-password"
                                        className="h-11 rounded-xl border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                                    />
                                </Field>

                                <Field label="Confirmar" htmlFor="confirmPassword" error={errors.confirmPassword}>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange("confirmPassword")}
                                        placeholder="••••••"
                                        autoComplete="new-password"
                                        className="h-11 rounded-xl border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                                    />
                                </Field>
                            </div>

                            <label className="flex items-start gap-2 text-xs text-gray-500 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 size-4 rounded border-gray-300 accent-lime-500"
                                    checked={acceptTerms}
                                    onChange={(event) => setAcceptTerms(event.target.checked)}
                                />
                                <span>
                                    Aceito os <Link to={paths.terms} className="text-lime-600 hover:underline">termos de uso</Link> e a <Link to={paths.privacy} className="text-lime-600 hover:underline">política de privacidade</Link>.
                                </span>
                            </label>
                            {errors.acceptTerms && <p className="text-xs text-red-500">{errors.acceptTerms}</p>}

                            <Button
                                type="submit"
                                className="w-full h-11 bg-lime-500 hover:bg-lime-600 text-gray-900 font-semibold rounded-xl"
                                disabled={status === "loading"}
                            >
                                {status === "loading" ? "Criando conta..." : "Criar conta gratuita"}
                            </Button>

                            <p className="text-center text-sm text-gray-500">
                                Já tem uma conta?{" "}
                                <Link to={paths.login} className="font-semibold text-lime-600 hover:text-lime-700">
                                    Entrar
                                </Link>
                            </p>
                        </form>
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
    error?: string;
};

function Field({ label, htmlFor, children, error }: FieldProps) {
    return (
        <div className="space-y-1">
            <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
                {label}
            </label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
