import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Building2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import Seo from "../../../components/common/Seo";
import { paths } from "../../../routes/paths";

type FormData = {
    name: string;
    creci: string;
    cnpj: string;
    phone: string;
    description: string;
    cep: string;
    city: string;
    address: string;
    profileType: "imobiliaria" | "corretor";
};

const INITIAL_DATA: FormData = {
    name: "",
    creci: "",
    cnpj: "",
    phone: "",
    description: "",
    cep: "",
    city: "",
    address: "",
    profileType: "imobiliaria",
};

export default function CreateImobiliaria() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<FormData>(INITIAL_DATA);

    const updateData = (updates: Partial<FormData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const nextStep = () => setStep((s) => Math.min(s + 1, 3));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate creation delay
        setTimeout(() => {
            console.log("Creating agency:", data);
            navigate(paths.dashUsuario);
        }, 1000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <Seo title="77 Imóveis | Criar Imobiliária" />

            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <span className={step >= 1 ? "text-lime-600 font-medium" : ""}>Dados Básicos</span>
                    <span className="text-gray-300">/</span>
                    <span className={step >= 2 ? "text-lime-600 font-medium" : ""}>Sobre</span>
                    <span className="text-gray-300">/</span>
                    <span className={step >= 3 ? "text-lime-600 font-medium" : ""}>Endereço</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Criar Imobiliária</h1>
                <p className="mt-2 text-gray-600">
                    Cadastre sua imobiliária para começar a publicar imóveis e gerenciar sua equipe.
                </p>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-lime-500 transition-all duration-500 ease-out"
                    style={{ width: `${(step / 3) * 100}%` }}
                />
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <div className="p-2 bg-lime-100 rounded-lg text-lime-600">
                                <Building2 className="size-6" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Informações Jurídicas</h2>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700">Tipo de conta *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { value: "imobiliaria", label: "Imobiliária", description: "CNPJ + equipe" },
                                    { value: "corretor", label: "Corretor Autônomo", description: "Atuação individual" },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => updateData({ profileType: option.value as FormData["profileType"] })}
                                        className={`rounded-2xl border p-4 text-left transition-all ${
                                            data.profileType === option.value
                                                ? "border-lime-500 bg-lime-50 shadow-sm"
                                                : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-gray-900">{option.label}</span>
                                            {data.profileType === option.value && (
                                                <span className="text-xs font-semibold text-lime-600 uppercase">Selecionado</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                    Nome Fantasia *
                                </label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Imobiliária Silva"
                                    required
                                    value={data.name}
                                    onChange={(e) => updateData({ name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="creci" className="text-sm font-medium text-gray-700">
                                    CRECI {data.profileType === "imobiliaria" ? "Jurídico" : "Profissional"} *
                                </label>
                                <Input
                                    id="creci"
                                    placeholder="Ex: 12345-J"
                                    required
                                    value={data.creci}
                                    onChange={(e) => updateData({ creci: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="cnpj" className="text-sm font-medium text-gray-700">
                                    CNPJ
                                </label>
                                <Input
                                    id="cnpj"
                                    placeholder="00.000.000/0001-00"
                                    value={data.cnpj}
                                    onChange={(e) => updateData({ cnpj: e.target.value })}
                                    disabled={data.profileType === "corretor"}
                                    className={data.profileType === "corretor" ? "bg-gray-50" : ""}
                                />
                                <p className="text-xs text-gray-500">
                                    {data.profileType === "corretor"
                                        ? "Corretores autônomos não precisam informar CNPJ agora."
                                        : "Opcional por enquanto; você poderá completar depois."}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: About & Contact */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Contato e Descrição</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                    Telefone Comercial *
                                </label>
                                <Input
                                    id="phone"
                                    placeholder="(00) 0000-0000"
                                    type="tel"
                                    required
                                    value={data.phone}
                                    onChange={(e) => updateData({ phone: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                                    Sobre a Imobiliária *
                                </label>
                                <div className="text-xs text-gray-500 mb-2">
                                    Conte um pouco sobre a história, missão e diferenciais da sua imobiliária.
                                    Essa descrição aparecerá no seu perfil público.
                                </div>
                                <Textarea
                                    id="description"
                                    placeholder="Ex: Fundada em 2010, nossa imobiliária é especialista em..."
                                    required
                                    className="min-h-40"
                                    value={data.description}
                                    onChange={(e) => updateData({ description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Address */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Localização</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="cep" className="text-sm font-medium text-gray-700">
                                    CEP *
                                </label>
                                <Input
                                    id="cep"
                                    placeholder="00000-000"
                                    required
                                    value={data.cep}
                                    onChange={(e) => updateData({ cep: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="city" className="text-sm font-medium text-gray-700">
                                    Cidade *
                                </label>
                                <Input
                                    id="city"
                                    required
                                    value={data.city}
                                    onChange={(e) => updateData({ city: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="address" className="text-sm font-medium text-gray-700">
                                    Endereço Completo *
                                </label>
                                <Input
                                    id="address"
                                    placeholder="Rua, número, bairro, complemento..."
                                    required
                                    value={data.address}
                                    onChange={(e) => updateData({ address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-8">
                    {step > 1 ? (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={prevStep}
                            className="text-gray-600"
                        >
                            <ArrowLeft className="size-4 mr-2" />
                            Voltar
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => navigate(paths.dashUsuario)}
                            className="text-gray-500 hover:text-red-600"
                        >
                            Cancelar
                        </Button>
                    )}

                    {step < 3 ? (
                        <Button
                            type="button"
                            onClick={nextStep}
                            className="bg-lime-500 hover:bg-lime-600 text-white font-semibold"
                        >
                            Próxima Etapa
                            <ArrowRight className="size-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            className="bg-lime-500 hover:bg-lime-600 text-white font-semibold min-w-40"
                        >
                            <Check className="size-4 mr-2" />
                            Finalizar Cadastro
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}
