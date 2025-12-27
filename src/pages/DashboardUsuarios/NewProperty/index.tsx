import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, Home, Check, Camera, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";
import Seo from "../../../components/common/Seo";
import { paths } from "../../../routes/paths";

type FormData = {
    // Step 1
    advertiserType: "imobiliaria" | "particular";
    selectedAgencyId?: string;
    purpose: "venda" | "aluguel" | "temporada";

    // Step 2
    title: string;
    description: string;
    cep: string;
    address: string;
    neighborhood: string;
    city: string;
    state: string;

    // Step 3
    bedrooms: number;
    bathrooms: number;
    parkingSpaces: number;
    area: number;
    price: string;

    // Step 4
    images: string[];
};

const INITIAL_DATA: FormData = {
    advertiserType: "particular",
    purpose: "venda",
    title: "",
    description: "",
    cep: "",
    address: "",
    neighborhood: "",
    city: "",
    state: "",
    bedrooms: 1,
    bathrooms: 1,
    parkingSpaces: 0,
    area: 0,
    price: "",
    images: [],
};

const USER_AGENCIES = [
    { id: '1', name: 'Nova Imobiliária 77' },
    { id: '2', name: 'Imobiliária Aliança' }
];

export default function NewProperty() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [step, setStep] = useState(1);
    const [data, setData] = useState<FormData>(INITIAL_DATA);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing) {
            // Simulate fetching data for editing
            setLoading(true);
            setTimeout(() => {
                setData({
                    advertiserType: "particular",
                    purpose: "venda",
                    title: "Apartamento Alto Padrão - Jardins",
                    description: "Excelente apartamento localizado nos Jardins, com acabamento de primeira linha e vista privilegiada. Condomínio com infraestrutura completa de lazer e segurança.",
                    cep: "01426-000",
                    address: "Rua Oscar Freire, 1230",
                    neighborhood: "Jardins",
                    city: "São Paulo",
                    state: "SP",
                    bedrooms: 3,
                    bathrooms: 4,
                    parkingSpaces: 3,
                    area: 180,
                    price: "2.500.000",
                    images: [],
                });
                setLoading(false);
            }, 800);
        }
    }, [isEditing]);

    const updateData = (updates: Partial<FormData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const nextStep = () => {
        if (step === 1 && data.advertiserType === "imobiliaria" && !data.selectedAgencyId) {
            alert("Por favor, selecione uma imobiliária para continuar.");
            return;
        }
        setStep((s) => Math.min(s + 1, 4));
    };

    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate submission
        console.log("Submitting:", data);
        navigate(paths.dashUsuario);
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto py-12 text-center text-gray-500">
                <div className="animate-spin w-8 h-8 border-2 border-lime-500 border-t-transparent rounded-full mx-auto mb-4" />
                Carregando dados do imóvel...
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12">
            <Seo title={`77 Imóveis | ${isEditing ? "Editar" : "Novo"} Imóvel`} />

            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <span className={step >= 1 ? "text-lime-600 font-medium" : ""}>Tipo</span>
                    <span className="text-gray-300">/</span>
                    <span className={step >= 2 ? "text-lime-600 font-medium" : ""}>Dados</span>
                    <span className="text-gray-300">/</span>
                    <span className={step >= 3 ? "text-lime-600 font-medium" : ""}>Detalhes</span>
                    <span className="text-gray-300">/</span>
                    <span className={step >= 4 ? "text-lime-600 font-medium" : ""}>Fotos</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditing ? "Editar Imóvel" : "Cadastrar Novo Imóvel"}
                </h1>
                <p className="mt-2 text-gray-600">
                    {isEditing ? "Atualize as informações do seu anúncio." : "Preencha as informações para anunciar seu imóvel."}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-lime-500 transition-all duration-500 ease-out"
                    style={{ width: `${(step / 4) * 100}%` }}
                />
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">

                {/* Step 1: Tipo e Finalidade */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Como você deseja anunciar?</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <RadioCard
                                    selected={data.advertiserType === "particular"}
                                    onClick={() => updateData({ advertiserType: "particular", selectedAgencyId: undefined })}
                                    icon={<Home className="size-6" />}
                                    title="Direto com Proprietário"
                                    description="Anunciar como pessoa física, sem intermediários."
                                />
                                <RadioCard
                                    selected={data.advertiserType === "imobiliaria"}
                                    onClick={() => updateData({ advertiserType: "imobiliaria" })}
                                    icon={<Building2 className="size-6" />}
                                    title="Por Imobiliária"
                                    description="Anunciar através de uma de suas imobiliárias cadastradas."
                                />
                            </div>

                            {/* Agency Selector */}
                            {data.advertiserType === "imobiliaria" && (
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl animate-in zoom-in-95 fade-in duration-200">
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                                        Selecione a Imobiliária Responsável
                                    </label>

                                    {USER_AGENCIES.length > 0 ? (
                                        <div className="grid gap-2">
                                            {USER_AGENCIES.map(agency => (
                                                <div
                                                    key={agency.id}
                                                    onClick={() => updateData({ selectedAgencyId: agency.id })}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                                                        data.selectedAgencyId === agency.id
                                                            ? "bg-white border-lime-500 shadow-sm ring-1 ring-lime-500"
                                                            : "bg-white border-gray-200 hover:border-lime-300"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-lime-100 text-lime-700 rounded-md">
                                                            <Building2 className="size-4" />
                                                        </div>
                                                        <span className="font-medium text-gray-700">{agency.name}</span>
                                                    </div>
                                                    {data.selectedAgencyId === agency.id && (
                                                        <div className="w-5 h-5 bg-lime-500 rounded-full flex items-center justify-center text-white">
                                                            <Check className="size-3" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-gray-500 mb-3">Você ainda não possui imobiliárias cadastradas.</p>
                                            <Button variant="outline" size="sm" onClick={() => navigate(paths.dashUsuarioCriarImobiliaria)}>
                                                <Plus className="size-4 mr-2" /> Cadastrar Imobiliária
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">Qual a finalidade do anúncio?</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <RadioCard
                                    selected={data.purpose === "venda"}
                                    onClick={() => updateData({ purpose: "venda" })}
                                    title="Venda"
                                    center
                                />
                                <RadioCard
                                    selected={data.purpose === "aluguel"}
                                    onClick={() => updateData({ purpose: "aluguel" })}
                                    title="Aluguel"
                                    center
                                />
                                <RadioCard
                                    selected={data.purpose === "temporada"}
                                    onClick={() => updateData({ purpose: "temporada" })}
                                    title="Temporada"
                                    center
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Informações do Imóvel */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Informações Básicas</h2>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Título do Anúncio</label>
                            <Input
                                value={data.title}
                                onChange={(e) => updateData({ title: e.target.value })}
                                placeholder="Ex: Apartamento aconchegante no centro"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Descrição Completa</label>
                            <Textarea
                                className="min-h-[120px]"
                                value={data.description}
                                onChange={(e) => updateData({ description: e.target.value })}
                                placeholder="Descreva os pontos fortes do imóvel..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">CEP</label>
                                <Input
                                    value={data.cep}
                                    onChange={(e) => updateData({ cep: e.target.value })}
                                    placeholder="00000-000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Cidade</label>
                                <Input
                                    value={data.city}
                                    onChange={(e) => updateData({ city: e.target.value })}
                                    placeholder="Cidade"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Bairro</label>
                                <Input
                                    value={data.neighborhood}
                                    onChange={(e) => updateData({ neighborhood: e.target.value })}
                                    placeholder="Bairro"
                                />
                            </div>
                            <div className="space-y-2 lg:col-span-3">
                                <label className="text-sm font-medium text-gray-700">Endereço (Rua e número)</label>
                                <Input
                                    value={data.address}
                                    onChange={(e) => updateData({ address: e.target.value })}
                                    placeholder="Rua das Flores, 123"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Características e Preço */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Características e Valores</h2>

                        <div className="grid grid-cols-2 gap-6">
                            <CounterInput
                                label="Quartos"
                                value={data.bedrooms}
                                onChange={(val) => updateData({ bedrooms: val })}
                            />
                            <CounterInput
                                label="Banheiros"
                                value={data.bathrooms}
                                onChange={(val) => updateData({ bathrooms: val })}
                            />
                            <CounterInput
                                label="Vagas de Garagem"
                                value={data.parkingSpaces}
                                onChange={(val) => updateData({ parkingSpaces: val })}
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Área (m²)</label>
                                <Input
                                    type="number"
                                    value={data.area}
                                    onChange={(e) => updateData({ area: Number(e.target.value) })}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Preço (R$)</label>
                                <Input
                                    value={data.price}
                                    onChange={(e) => updateData({ price: e.target.value })}
                                    placeholder="0,00"
                                    className="text-lg font-semibold"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Fotos */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Fotos do Imóvel</h2>
                        <p className="text-sm text-gray-500">
                            {isEditing ? "Atualize as fotos do seu anúncio." : "Adicione até 8 fotos para dar destaque ao seu anúncio."}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-lime-500 hover:bg-lime-50 transition-all group"
                                >
                                    <Camera className="size-6 text-gray-300 group-hover:text-lime-500 transition-colors" />
                                    <span className="text-xs text-gray-400 group-hover:text-lime-600 font-medium">Adicionar Foto</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    {step > 1 ? (
                        <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                            <ArrowLeft className="size-4" /> Voltar
                        </Button>
                    ) : (
                        <div />
                    )}

                    {step < 4 ? (
                        <Button type="button" onClick={nextStep} className="bg-lime-500 hover:bg-lime-600 gap-2">
                            Próximo <ArrowRight className="size-4" />
                        </Button>
                    ) : (
                        <Button type="submit" className="bg-lime-600 hover:bg-lime-700 gap-2 min-w-[150px]">
                            <Check className="size-4" /> {isEditing ? "Salvar Alterações" : "Finalizar Cadastro"}
                        </Button>
                    )}
                </div>

            </form>
        </div>
    );
}

// Subcomponents

function RadioCard({ selected, onClick, title, description, icon, center }: any) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-lime-50",
                selected
                    ? "border-lime-500 bg-lime-50/50"
                    : "border-gray-100 hover:border-lime-200 bg-white",
                center && "flex flex-col items-center justify-center text-center"
            )}
        >
            <div className="flex items-center gap-3 mb-2">
                {icon && <div className={cn("text-gray-500", selected && "text-lime-600")}>{icon}</div>}
                <div className="font-semibold text-gray-900">{title}</div>
            </div>
            {description && <div className="text-sm text-gray-500">{description}</div>}
        </div>
    )
}

function CounterInput({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => onChange(Math.max(0, value - 1))}
                >
                    -
                </Button>
                <div className="w-12 text-center font-semibold text-lg">{value}</div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => onChange(value + 1)}
                >
                    +
                </Button>
            </div>
        </div>
    )
}
