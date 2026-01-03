import Seo from "../../../components/common/Seo";
import { BarChart3, Users, Eye, MousePointerClick, Heart } from "lucide-react";
import { cn } from "../../../lib/utils";

const stats = [
    {
        label: "Visualizações totais",
        value: "12.450",
        change: "+12.5%",
        trend: "up",
        icon: Eye,
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        label: "Leads recebidos",
        value: "48",
        change: "+4.2%",
        trend: "up",
        icon: Users,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        label: "Cliques no WhatsApp",
        value: "156",
        change: "-2.1%",
        trend: "down",
        icon: MousePointerClick,
        color: "text-purple-600",
        bg: "bg-purple-50",
    },
    {
        label: "Favoritamentos",
        value: "843",
        change: "+8.4%",
        trend: "up",
        icon: Heart,
        color: "text-rose-600",
        bg: "bg-rose-50",
    },
];

export default function Statistics() {
    return (
        <div className="space-y-8">
            <Seo title="Dashboard | Estatísticas" />

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Estatísticas</h1>
                <p className="text-sm text-gray-500">
                    Acompanhe o desempenho dos seus anúncios e perfil nos últimos 30 dias.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between gap-4"
                    >
                        <div className="flex items-start justify-between">
                            <div className={cn("p-2 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <span
                                className={cn(
                                    "text-xs font-semibold px-2 py-1 rounded-full",
                                    stat.trend === "up"
                                        ? "text-emerald-700 bg-emerald-50"
                                        : "text-rose-700 bg-rose-50"
                                )}
                            >
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder for a chart */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[400px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-tr from-gray-50/50 to-white pointer-events-none" />
                <div className="text-center z-10">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Gráfico de desempenho</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                        Em breve você poderá visualizar gráficos detalhados de visualizações e leads ao longo do tempo.
                    </p>
                </div>
            </div>
        </div>
    );
}
