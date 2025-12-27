import { Link } from "react-router-dom";
import {
    Building2,
    UserCircle2,
    MapPin,
    Eye,
    PenSquare,
    BarChart3,
    Trash2,
    Stars,
} from "lucide-react";
import Seo from "../../../components/common/Seo";
import { Button } from "../../../components/ui/button";
import { paths } from "../../../routes/paths";
import { cn } from "../../../lib/utils";

type Profile = {
    id: string;
    name: string;
    type: "imobiliaria" | "corretor";
    location: string;
    badges: string[];
    listings: number;
    leads: number;
    highlight: string;
    profileLink: string;
    manageLink: string;
};

const imobiliarias: Profile[] = [
    {
        id: "imob-77",
        name: "77 Prime",
        type: "imobiliaria",
        location: "Barreiras • Vitória da Conquista",
        badges: ["Alto padrão", "Concierge", "Desde 2015"],
        listings: 14,
        leads: 62,
        highlight: "Portfólio premium com curadoria completa",
        profileLink: paths.profileImobiliaria,
        manageLink: paths.dashUsuarioCriarImobiliaria,
    },
    {
        id: "imob-vista",
        name: "Vista Lagoa Realty",
        type: "imobiliaria",
        location: "Bom Jesus da Lapa",
        badges: ["Lançamentos", "Equipe 8 corretores"],
        listings: 9,
        leads: 28,
        highlight: "Especialistas em empreendimentos à beira-rio",
        profileLink: paths.profileImobiliaria,
        manageLink: paths.dashUsuarioCriarImobiliaria,
    },
];

const corretores: Profile[] = [
    {
        id: "cor-joao",
        name: "João Amaral",
        type: "corretor",
        location: "Barreiras • CRECI 12345",
        badges: ["Top closer 2024", "NPS 96"],
        listings: 34,
        leads: 110,
        highlight: "Negociações consultivas em imóveis urbanos",
        profileLink: paths.profileCorretor,
        manageLink: paths.dashUsuario,
    },
    {
        id: "cor-luiza",
        name: "Luiza Fernandes",
        type: "corretor",
        location: "Vitória da Conquista • CRECI 99887",
        badges: ["Locação corporativa", "Visitas 7/7"],
        listings: 18,
        leads: 54,
        highlight: "Especialista em contratos corporativos e retrofit",
        profileLink: paths.profileCorretor,
        manageLink: paths.dashUsuario,
    },
];

const ACTION_BUTTON_CLASSES =
    "h-auto py-2 px-3 flex flex-col gap-1 items-center rounded-xl text-[10px] font-medium min-w-14 transition-colors border border-transparent";

const profileActionClassNames = {
    view: "text-gray-500 hover:text-lime-600 hover:bg-lime-50",
    edit: "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50",
    stats: "text-gray-500 hover:text-blue-600 hover:bg-blue-50",
    delete: "text-gray-400 hover:text-red-600 hover:bg-red-50 border-red-50 hover:border-red-200",
};

function ProfileCard({ profile }: { profile: Profile }) {
    const Icon = profile.type === "imobiliaria" ? Building2 : UserCircle2;

    return (
        <div className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-start gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                        "size-12 rounded-2xl flex items-center justify-center text-white",
                        profile.type === "imobiliaria"
                            ? "bg-linear-to-br from-slate-900 to-slate-700"
                            : "bg-linear-to-br from-lime-500 to-emerald-500 text-slate-900"
                    )}>
                        <Icon className="size-6" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.25em] text-gray-400 flex items-center gap-1">
                            <Stars className="size-3" />
                            {profile.type === "imobiliaria" ? "Imobiliária" : "Corretor"}
                        </p>
                        <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="size-3" />
                            {profile.location}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 ml-auto">
                    <Link
                        to={profile.profileLink}
                        className={cn(ACTION_BUTTON_CLASSES, profileActionClassNames.view, "border-slate-200 bg-white")}
                    >
                        <Eye className="size-4" />
                        Ver perfil
                    </Link>
                    <Link
                        to={profile.manageLink}
                        className={cn(ACTION_BUTTON_CLASSES, profileActionClassNames.edit, "border-slate-200 bg-white")}
                    >
                        <PenSquare className="size-4" />
                        Editar
                    </Link>
                    <Link
                        to={paths.dashUsuario}
                        className={cn(ACTION_BUTTON_CLASSES, profileActionClassNames.stats, "border-slate-200 bg-white")}
                    >
                        <BarChart3 className="size-4" />
                        Painel
                    </Link>
                    <button
                        type="button"
                        className={cn(ACTION_BUTTON_CLASSES, profileActionClassNames.delete, "border-slate-200 bg-white")}
                        onClick={() => alert(`Remover ${profile.name}`)}
                    >
                        <Trash2 className="size-4" />
                        Remover
                    </button>
                </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-4 text-sm text-gray-500">
                <span>{profile.leads} leads nos últimos 30 dias</span>
                <span className="rounded-full bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1">
                    {profile.listings} anúncios
                </span>
            </div>
        </div>
    );
}

export default function MyProfiles() {
    const totalImoveis =
        imobiliarias.reduce((acc, item) => acc + item.listings, 0) +
        corretores.reduce((acc, item) => acc + item.listings, 0);

    return (
        <div className="space-y-6">
            <Seo title="Dashboard | Meus Perfis" />
            <div className="flex justify-start">
                <Button asChild className="bg-lime-500 hover:bg-lime-600 text-slate-900">
                    <Link to={paths.dashUsuarioCriarImobiliaria}>Criar novo perfil</Link>
                </Button>
            </div>
            <header className="bg-white rounded-3xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Dashboard</p>
                    <h1 className="text-3xl font-bold text-gray-900">Meus Perfis</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Centralize as imobiliárias e corretores conectados à sua conta.
                    </p>
                </div>
                <div className="flex flex-1 flex-wrap md:flex-nowrap items-center justify-end gap-4 text-center">
                    <div className="min-w-35 rounded-2xl border border-gray-100 p-3">
                        <p className="text-2xl font-bold text-slate-900">{imobiliarias.length}</p>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Imobiliárias</p>
                    </div>
                    <div className="min-w-35 rounded-2xl border border-gray-100 p-3">
                        <p className="text-2xl font-bold text-slate-900">{corretores.length}</p>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Corretores</p>
                    </div>
                    <div className="min-w-35 rounded-2xl border border-gray-100 p-3">
                        <p className="text-2xl font-bold text-slate-900">
                            {totalImoveis}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Imóveis totais</p>
                    </div>
                </div>
            </header>

            <section className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">Imobiliárias</h2>
                        <p className="text-sm text-gray-500">Estruturas completas com equipe e CRM 77</p>
                    </div>
                    <Button variant="ghost" className="text-sm text-lime-600 hover:text-lime-500">
                        Gerenciar todas →
                    </Button>
                </div>
                <div className="grid gap-4">
                    {imobiliarias.map((profile) => (
                        <ProfileCard key={profile.id} profile={profile} />
                    ))}
                </div>
            </section>

            <section className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">Corretores associados</h2>
                        <p className="text-sm text-gray-500">Profissionais parceiros com acesso ao funil 77</p>
                    </div>
                    <Button variant="ghost" className="text-sm text-lime-600 hover:text-lime-500">
                        Convidar corretor →
                    </Button>
                </div>
                <div className="grid gap-4">
                    {corretores.map((profile) => (
                        <ProfileCard key={profile.id} profile={profile} />
                    ))}
                </div>
            </section>
        </div>
    );
}
