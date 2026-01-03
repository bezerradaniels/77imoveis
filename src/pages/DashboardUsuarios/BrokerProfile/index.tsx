import { useState, useEffect, useContext } from "react";
import Seo from "../../../components/common/Seo";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";
import { Briefcase, Check, AlertCircle } from "lucide-react";
import CityMultiSelect from "../../../components/common/CityMultiSelect";
import { DDD77_CITIES } from "../../../constants/ddd77Cities";
import { supabase } from "../../../components/lib/supabase/client";
import { AuthContext } from "../../../app/providers";

type Status = "idle" | "loading" | "success";

type FormData = {
    creci: string;
    cities: string[];
    specialties: string;
    experience: string;
    bio: string;
};

export default function BrokerProfile() {
    const { user } = useContext(AuthContext);
    const [isActive, setIsActive] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        creci: "",
        cities: [],
        specialties: "",
        experience: "",
        bio: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<Status>("idle");
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (error) throw error;
                if (data) {
                    setIsActive(data.role === "corretor");
                    setFormData({
                        creci: data.creci || "",
                        cities: data.cities || [],
                        specialties: data.specialties || "",
                        experience: data.experience || "",
                        bio: data.bio || "",
                    });
                }
            } catch (err) {
                console.error("Erro ao carregar perfil:", err);
            } finally {
                setLoadingData(false);
            }
        }
        loadProfile();
    }, [user]);

    const handleChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handleCitiesChange = (cities: string[]) => {
        setFormData((prev) => ({ ...prev, cities }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.creci.trim()) newErrors.creci = "Informe seu CRECI";
        if (formData.cities.length === 0) newErrors.cities = "Selecione pelo menos uma cidade";
        if (!formData.bio.trim() || formData.bio.length < 20) newErrors.bio = "Informe uma descrição com pelo menos 20 caracteres";
        return newErrors;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;
        if (!user) return;

        setStatus("loading");

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    role: "corretor",
                    creci: formData.creci,
                    cities: formData.cities,
                    specialties: formData.specialties,
                    experience: formData.experience,
                    bio: formData.bio,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (error) throw error;

            setStatus("success");
            setIsActive(true);
            setTimeout(() => setStatus("idle"), 2000);

            // Forçamos um refresh na sessão para o AuthProvider pegar o novo role?
            // O ideal seria o AuthProvider ouvir as mudanças ou usarmos um reload simples.
            // Para simplicidade:
            // window.location.reload(); // Drastic but effective for role update prop
        } catch (err) {
            console.error("Erro ao atualizar perfil:", err);
            setStatus("idle");
            alert("Erro ao salvar. Verifique se você está conectado.");
        }
    };

    if (loadingData) {
        return <div className="p-8 text-center text-gray-500">Carregando informações...</div>;
    }

    return (
        <div className="space-y-6">
            <Seo title="Dashboard | Sou Corretor" />

            <header className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                        <Briefcase className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Sou Corretor</h1>
                        <p className="text-sm text-gray-500">
                            Ative seu perfil de corretor para anunciar imóveis com seu CRECI e receber leads qualificados.
                        </p>
                    </div>
                </div>
            </header>

            {isActive ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-center gap-3 text-green-600 mb-4">
                        <Check className="w-6 h-6" />
                        <span className="font-semibold">Perfil de corretor ativo</span>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Seu perfil de corretor está ativo. Você pode anunciar imóveis com seu CRECI e aparecer nas buscas como corretor parceiro.
                    </p>
                    <Button variant="outline" onClick={() => setIsActive(false)}>
                        Editar informações
                    </Button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex items-start gap-3 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold">Você ainda não ativou seu perfil de corretor</p>
                            <p className="text-amber-700">Preencha os dados abaixo para começar a anunciar como corretor.</p>
                        </div>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                        {status === "success" && (
                            <div className="rounded-xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm text-lime-900">
                                Perfil atualizado com sucesso!
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Número do CRECI" htmlFor="creci" error={errors.creci}>
                                <Input
                                    id="creci"
                                    value={formData.creci}
                                    onChange={handleChange("creci")}
                                    placeholder="BA-00000"
                                    className="h-11 rounded-xl"
                                />
                            </Field>

                            <Field label="Cidades atendidas" htmlFor="cities" error={errors.cities}>
                                <CityMultiSelect
                                    values={formData.cities}
                                    onChange={handleCitiesChange}
                                    options={DDD77_CITIES}
                                    placeholder="Selecione as cidades de atuação"
                                />
                            </Field>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Especialidades" htmlFor="specialties">
                                <Input
                                    id="specialties"
                                    value={formData.specialties}
                                    onChange={handleChange("specialties")}
                                    placeholder="Ex.: alto padrão, lançamentos"
                                    className="h-11 rounded-xl"
                                />
                            </Field>

                            <Field label="Tempo de experiência" htmlFor="experience">
                                <Input
                                    id="experience"
                                    value={formData.experience}
                                    onChange={handleChange("experience")}
                                    placeholder="Ex.: 5 anos"
                                    className="h-11 rounded-xl"
                                />
                            </Field>
                        </div>

                        <Field label="Sobre você" htmlFor="bio" error={errors.bio}>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={handleChange("bio")}
                                placeholder="Conte sobre seu atendimento, diferenciais e regiões que atua."
                                rows={4}
                                className="rounded-xl"
                            />
                        </Field>

                        <Button
                            type="submit"
                            className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-semibold h-11 rounded-xl"
                            disabled={status === "loading"}
                        >
                            {status === "loading" ? "Salvando..." : "Ativar/Atualizar perfil"}
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
}

// ... Field components ...

type FieldProps = {
    label: string;
    htmlFor: string;
    children: React.ReactNode;
    error?: string;
};

function Field({ label, htmlFor, children, error }: FieldProps) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
                {label}
            </label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
