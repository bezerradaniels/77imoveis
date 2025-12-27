import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../../app/providers";
import { paths } from "../../../routes/paths";
import {
    Home,
    Heart,
    Users,
    MessageSquare,
    UserCircle2,
    LogOut,
    Settings,
    ChevronRight,
    ChevronLeft,
    Compass,
} from "lucide-react";
import { cn } from "../../../lib/utils";

type NavItem = {
    id: string;
    label: string;
    to: string;
    icon: React.ReactNode;
    section: "principal" | "ciclo" | "usuario";
};

const NAV_ITEMS: NavItem[] = [
    { id: "home", label: "Resumo", to: paths.dashUsuario, icon: <Home className="size-5" />, section: "principal" },
    { id: "favoritos", label: "Favoritos", to: paths.dashUsuarioFavoritos, icon: <Heart className="size-5" />, section: "principal" },
    { id: "clientes", label: "Clientes", to: paths.dashUsuarioClientes, icon: <Users className="size-5" />, section: "ciclo" },
    { id: "mensagens", label: "Mensagens", to: paths.dashUsuarioMensagens, icon: <MessageSquare className="size-5" />, section: "ciclo" },
    { id: "perfis", label: "Meus Perfis", to: paths.dashUsuarioPerfis, icon: <UserCircle2 className="size-5" />, section: "usuario" },
];

const SECTIONS: Record<NavItem["section"], string> = {
    principal: "Resumo",
    ciclo: "Ciclo de vida",
    usuario: "Usuário",
};

export default function Sidebar() {
    const { signOut } = useContext(AuthContext);
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const groupedNav = NAV_ITEMS.reduce<Record<NavItem["section"], NavItem[]>>((acc, item) => {
        acc[item.section] = acc[item.section] ? [...acc[item.section], item] : [item];
        return acc;
    }, {} as Record<NavItem["section"], NavItem[]>);

    const isActive = (path: string) => {
        if (path === paths.dashUsuario) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen flex flex-col bg-white border-r border-slate-200 transition-[width] duration-200",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="flex items-center justify-between px-3 py-4 border-b border-slate-200">
                {!collapsed && (
                    <Link to={paths.home} className="flex items-center gap-2 text-slate-900 font-bold tracking-wide">
                        <span className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg">77</span>
                        <span>Imóveis</span>
                    </Link>
                )}
                <button
                    onClick={() => setCollapsed((prev) => !prev)}
                    className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400 transition-colors"
                    title={collapsed ? "Expandir menu" : "Recolher menu"}
                >
                    {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
                {(Object.keys(SECTIONS) as NavItem["section"][]).map((section) => (
                    <div key={section} className="space-y-2">
                        {!collapsed && (
                            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400 px-3">
                                {SECTIONS[section]}
                            </p>
                        )}
                        <div className="space-y-1">
                            {(groupedNav[section] ?? []).map((item) => (
                                <Link
                                    key={item.id}
                                    to={item.to}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors",
                                        isActive(item.to) && "text-slate-900 bg-slate-100"
                                    )}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <span className="flex items-center justify-center text-slate-500">
                                        {item.icon}
                                    </span>
                                    {!collapsed && <span className="truncate">{item.label}</span>}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="px-2 pb-4 space-y-2">
                <Link
                    to={paths.support}
                    className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-500",
                        collapsed && "justify-center"
                    )}
                    title={collapsed ? "Ajuda & Suporte" : undefined}
                >
                    <Compass className="size-5" />
                    {!collapsed && <span>Ajuda & Suporte</span>}
                </Link>
                <div className="flex items-center justify-between gap-2">
                    <Link
                        to={paths.dashUsuarioConfiguracoes}
                        className={cn(
                            "flex-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors",
                            collapsed && "justify-center"
                        )}
                        title={collapsed ? "Administração" : undefined}
                    >
                        <Settings className="size-5" />
                        {!collapsed && <span>Administração</span>}
                    </Link>
                    <button
                        onClick={() => void signOut()}
                        className={cn(
                            "flex-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors",
                            collapsed && "justify-center"
                        )}
                        title={collapsed ? "Sair" : undefined}
                    >
                        <LogOut className="size-5" />
                        {!collapsed && <span>Sair</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
}
