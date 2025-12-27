import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../../app/providers";
import { paths } from "../../../routes/paths";
import {
    Home,
    Heart,
    Users,
    MessageSquare,
    Settings,
    LogOut,
    Building2,
    Plus,
} from "lucide-react";
import { cn } from "../../../lib/utils";

type NavItem = {
    label: string;
    to: string;
    icon: React.ReactNode;
};

export default function Sidebar() {
    const { signOut, user } = useContext(AuthContext);
    const location = useLocation();

    const navItems: NavItem[] = [
        { label: "Início", to: paths.dashUsuario, icon: <Home className="size-5" /> },
        { label: "Favoritos", to: paths.dashUsuarioFavoritos, icon: <Heart className="size-5" /> },
        { label: "Clientes", to: paths.dashUsuarioClientes, icon: <Users className="size-5" /> },
        { label: "Mensagens", to: paths.dashUsuarioMensagens, icon: <MessageSquare className="size-5" /> },
        { label: "Configurações", to: paths.dashUsuarioConfiguracoes, icon: <Settings className="size-5" /> },
    ];

    const isActive = (path: string) => {
        if (path === paths.dashUsuario) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-slate-700/50">
                <Link to={paths.home} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 flex items-center justify-center shadow-lg shadow-lime-500/20">
                        <span className="font-black text-lg text-slate-900">77</span>
                    </div>
                    <span className="text-xl font-bold text-white">Imóveis</span>
                </Link>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center text-slate-900 font-semibold">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.email?.split("@")[0] || "Usuário"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
                    </div>
                </div>
            </div>

            {/* Create Imobiliaria CTA */}
            <div className="p-4">
                <Link
                    to={paths.dashUsuarioCriarImobiliaria}
                    className="flex items-center gap-3 w-full p-3 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 text-slate-900 font-semibold hover:from-lime-400 hover:to-emerald-400 transition-all shadow-lg shadow-lime-500/20 group"
                >
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Building2 className="size-4" />
                    </div>
                    <span className="flex-1">Criar Imobiliária</span>
                    <Plus className="size-4" />
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 px-3 mb-3">
                    Menu Principal
                </p>
                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                            isActive(item.to)
                                ? "bg-lime-500/10 text-lime-400 shadow-inner"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                        )}
                    >
                        <span className={cn(
                            "transition-colors",
                            isActive(item.to) ? "text-lime-400" : "text-slate-500"
                        )}>
                            {item.icon}
                        </span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-700/50 space-y-2">
                <Link
                    to={paths.home}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                >
                    <Home className="size-5 text-slate-500" />
                    Ir para o Site
                </Link>
                <button
                    onClick={() => void signOut()}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
                >
                    <LogOut className="size-5 text-slate-500" />
                    Sair da conta
                </button>
            </div>
        </aside>
    );
}
