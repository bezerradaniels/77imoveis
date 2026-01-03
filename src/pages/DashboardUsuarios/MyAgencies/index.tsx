import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Seo from "../../../components/common/Seo";
import { Button } from "../../../components/ui/button";
import { paths } from "../../../routes/paths";
import { Building2, Plus, MapPin, Eye, PenSquare, Trash2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { supabase } from "../../../components/lib/supabase/client";
import { AuthContext } from "../../../app/providers";

type Agency = {
    id: string;
    name: string;
    city?: string;
    neighborhood?: string;
    // placeholders
    listings?: number;
    leads?: number;
};

function AgencyCard({ agency, onDelete }: { agency: Agency, onDelete: (id: string) => void }) {
    const handleDelete = () => {
        if (confirm(`Tem certeza que deseja remover ${agency.name}?`)) {
            onDelete(agency.id);
        }
    }

    return (
        <div className="p-5 rounded-2xl border border-gray-100 bg-white">
            <div className="flex flex-wrap items-start gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white">
                        <Building2 className="size-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{agency.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="size-3" />
                            {agency.city || "Localização não informada"}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-auto">
                    {/* Link para perfil público se tiver slug */}
                    <button
                        className={cn("h-auto py-2 px-3 flex flex-col gap-1 items-center rounded-xl text-[10px] font-medium min-w-14 transition-colors border border-gray-200 bg-white", "text-gray-400 cursor-not-allowed")}
                        disabled
                        title="Em breve"
                    >
                        <Eye className="size-4" />
                        Ver perfil
                    </button>
                    {/* Link para edição se tivermos a pagina de edit */}
                    <button
                        className={cn("h-auto py-2 px-3 flex flex-col gap-1 items-center rounded-xl text-[10px] font-medium min-w-14 transition-colors border border-gray-200 bg-white", "text-gray-400 cursor-not-allowed")}
                        disabled
                        title="Em breve"
                    >
                        <PenSquare className="size-4" />
                        Editar
                    </button>
                    <button
                        type="button"
                        className={cn("h-auto py-2 px-3 flex flex-col gap-1 items-center rounded-xl text-[10px] font-medium min-w-14 transition-colors border border-gray-200 bg-white", "text-gray-400 hover:text-red-600 hover:bg-red-50")}
                        onClick={handleDelete}
                    >
                        <Trash2 className="size-4" />
                        Remover
                    </button>
                </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4 text-sm text-gray-500">
                <span>0 leads recententes</span>
                <span className="rounded-full bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1">
                    0 anúncios
                </span>
            </div>
        </div>
    );
}

export default function MyAgencies() {
    const { user } = useContext(AuthContext);
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        async function fetchAgencies() {
            try {
                const { data, error } = await supabase
                    .from("agencies")
                    .select("*")
                    .eq("owner_id", user!.id)
                    .order("created_at", { ascending: false });

                if (error) throw error;
                setAgencies(data || []);
            } catch (err) {
                console.error("Erro ao buscar imobiliárias:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAgencies();
    }, [user]);

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('agencies').delete().eq('id', id);
            if (error) throw error;
            setAgencies(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error(err);
            alert("Erro ao remover imobiliária");
        }
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando imobiliárias...</div>;

    return (
        <div className="space-y-6">
            <Seo title="Dashboard | Minhas Imobiliárias" />

            <header className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
                            <Building2 className="w-7 h-7 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Minhas Imobiliárias</h1>
                            <p className="text-sm text-gray-500">
                                Gerencie suas imobiliárias cadastradas na plataforma.
                            </p>
                        </div>
                    </div>
                    <Button asChild className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-semibold rounded-xl">
                        <Link to={paths.dashUsuarioCriarImobiliaria}>
                            <Plus className="size-4 mr-2" />
                            Nova imobiliária
                        </Link>
                    </Button>
                </div>
            </header>

            {agencies.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma imobiliária cadastrada</h3>
                    <p className="text-gray-500 mb-6">
                        Cadastre sua primeira imobiliária para anunciar imóveis e gerenciar sua equipe.
                    </p>
                    <Button asChild className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-semibold rounded-xl">
                        <Link to={paths.dashUsuarioCriarImobiliaria}>
                            <Plus className="size-4 mr-2" />
                            Cadastrar imobiliária
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">{agencies.length} imobiliária(s) cadastrada(s)</p>
                    </div>
                    <div className="grid gap-4">
                        {agencies.map((agency) => (
                            <AgencyCard key={agency.id} agency={agency} onDelete={handleDelete} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
