import { useState } from "react";
import {
    Search,
    Filter,
    Mail,
    Archive,
    Star,
    Trash2,
    Flag,
    MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Seo from "../../../components/common/Seo";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { cn } from "../../../lib/utils";

type InboxThread = {
    id: string;
    contact: {
        name: string;
        initials: string;
        email: string;
        phone: string;
    };
    property: {
        name: string;
        location: string;
        priceRange: string;
        slug: string;
    };
    subject: string;
    preview: string;
    lastMessageTime: string;
    unread: boolean;
    channel: string;
    stage: "Novo" | "Em negociação" | "Visita agendada";
    tags: string[];
    notes: string[];
};

const THREADS: InboxThread[] = [
    {
        id: "1",
        contact: {
            name: "Roberto Almeida",
            initials: "RA",
            email: "roberto.almeida@email.com",
            phone: "(11) 99999-1234"
        },
        property: {
            name: "Apto. Jardins 220m²",
            location: "Rua Haddock Lobo, Jardins - SP",
            priceRange: "R$ 2,4M",
            slug: "apto-jardins-220m"
        },
        subject: "Confirmação de visita presencial",
        preview: "Combinado! Amanhã às 14h então. Vou levar minha esposa.",
        lastMessageTime: "Hoje, 10:30",
        unread: true,
        channel: "Portal 77",
        stage: "Visita agendada",
        tags: ["Visita", "Alta prioridade"],
        notes: [
            "Prefere contato via WhatsApp",
            "Interessado em vaga adicional"
        ]
    },
    {
        id: "2",
        contact: {
            name: "Fernanda Costa",
            initials: "FC",
            email: "fernanda.costa@email.com",
            phone: "(11) 98888-4567"
        },
        property: {
            name: "Casa Alphaville 480m²",
            location: "Residencial 2, Santana de Parnaíba - SP",
            priceRange: "R$ 4,8M",
            slug: "casa-alphaville-480m"
        },
        subject: "Dúvidas sobre condomínio e IPTU",
        preview: "Bom dia. O valor do condomínio está incluso? Tenho algumas dúvidas sobre o clube.",
        lastMessageTime: "Ontem, 18:12",
        unread: false,
        channel: "Landing page",
        stage: "Em negociação",
        tags: ["Família", "Financiamento"],
        notes: ["Avaliar permuta por apartamento em Moema"]
    },
    {
        id: "3",
        contact: {
            name: "Imobiliária Silva",
            initials: "IS",
            email: "contato@imobsilva.com",
            phone: "(11) 3131-1234"
        },
        property: {
            name: "Cobertura Vila Madalena",
            location: "Rua Girassol, Vila Madalena - SP",
            priceRange: "R$ 3,1M",
            slug: "cobertura-vila-madalena"
        },
        subject: "Parceria para divulgação cruzada",
        preview: "Enviamos a proposta para o proprietário e aguardamos retorno.",
        lastMessageTime: "Segunda, 14:08",
        unread: false,
        channel: "Parcerias",
        stage: "Novo",
        tags: ["Parceria", "B2B"],
        notes: ["Responder até sexta", "Enviar fotos atualizadas"]
    }
];

const FILTERS = ["Todos", "Não lidos", "Visitas", "Arquivo"];

const STAGE_STYLES: Record<InboxThread["stage"], string> = {
    "Novo": "bg-slate-100 text-slate-700",
    "Em negociação": "bg-amber-100 text-amber-700",
    "Visita agendada": "bg-lime-100 text-lime-700"
};

type Action = "archive" | "delete" | "flag";
type RowAction = "message" | "whatsapp" | "delete";

const ROW_ACTIONS: { key: RowAction; label: string; icon: LucideIcon; className?: string }[] = [
    { key: "message", label: "Mensagem", icon: Mail, className: "hover:text-slate-900 hover:bg-gray-50" },
    { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, className: "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" },
    { key: "delete", label: "Excluir", icon: Trash2, className: "text-red-500 hover:text-red-600 hover:bg-red-50" },
];

export default function Messages() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [starredIds, setStarredIds] = useState<string[]>(["1"]);
    const [activeFilter, setActiveFilter] = useState<string>("Todos");
    const [messageModal, setMessageModal] = useState<{ open: boolean; thread: InboxThread | null }>({
        open: false,
        thread: null,
    });
    const [messageBody, setMessageBody] = useState("");

    const filteredThreads = THREADS.filter((thread) => {
        if (activeFilter === "Todos") return true;
        if (activeFilter === "Não lidos") return thread.unread;
        if (activeFilter === "Visitas") return thread.stage === "Visita agendada";
        if (activeFilter === "Arquivo") return false;
        return true;
    });

    const allSelected = filteredThreads.length > 0 && selectedIds.length === filteredThreads.length;

    const toggleSelectThread = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredThreads.map((thread) => thread.id));
        }
    };

    const toggleStar = (id: string) => {
        setStarredIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleBulkAction = (action: Action) => {
        if (selectedIds.length === 0) {
            alert("Selecione pelo menos uma conversa para executar ações.");
            return;
        }
        const actionLabel =
            action === "archive" ? "Arquivadas" : action === "delete" ? "Excluídas" : "Marcadas";
        alert(`${actionLabel} ${selectedIds.length} conversas.`);
        if (action !== "flag") {
            setSelectedIds([]);
        }
    };

    const formatWhatsAppNumber = (phone: string) => {
        const digits = phone.replace(/\D/g, "");
        if (!digits) return null;
        if (digits.startsWith("55")) return digits;
        return `55${digits}`;
    };

    const handleRowAction = (thread: InboxThread, action: RowAction) => {
        switch (action) {
            case "message": {
                setMessageModal({
                    open: true,
                    thread,
                });
                setMessageBody(`Olá ${thread.contact.name}, tudo bem?`);
                break;
            }
            case "whatsapp": {
                const number = formatWhatsAppNumber(thread.contact.phone);
                if (!number) {
                    alert("Número inválido para WhatsApp.");
                    return;
                }
                const text = encodeURIComponent(`Olá ${thread.contact.name}, tudo bem?`);
                window.open(`https://wa.me/${number}?text=${text}`, "_blank", "noopener,noreferrer");
                break;
            }
            case "delete":
                alert(`Conversa com ${thread.contact.name} marcada para exclusão.`);
                setSelectedIds((prev) => prev.filter((id) => id !== thread.id));
                break;
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <Seo title="77 Imóveis | Inbox" />

            <div className="border-b border-gray-100 px-6 py-4 flex flex-wrap items-center gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Relacionamento</p>
                    <h1 className="text-2xl font-semibold text-slate-900">Caixa de entrada</h1>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2 border-gray-200">
                        <Filter className="size-4" />
                        Filtrar
                    </Button>
                    <Button size="sm" className="bg-lime-500 text-slate-900 hover:bg-lime-400">
                        Nova mensagem
                    </Button>
                </div>
            </div>

            <div className="border-b border-gray-100 px-6 py-3 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="size-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                    />
                    Selecionar tudo
                </label>
                <div className="flex items-center gap-3 text-slate-500">
                    <button
                        className="inline-flex items-center gap-1 text-sm hover:text-slate-900 transition-colors"
                        onClick={() => handleBulkAction("archive")}
                    >
                        <Archive className="size-4" /> Arquivar
                    </button>
                    <button
                        className="inline-flex items-center gap-1 text-sm hover:text-red-500 transition-colors"
                        onClick={() => handleBulkAction("delete")}
                    >
                        <Trash2 className="size-4" /> Excluir
                    </button>
                    <button
                        className="inline-flex items-center gap-1 text-sm hover:text-slate-900 transition-colors"
                        onClick={() => handleBulkAction("flag")}
                    >
                        <Flag className="size-4" /> Marcar
                    </button>
                </div>
            </div>

            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nome, assunto ou imóvel"
                        className="pl-9 bg-gray-50 border-gray-100 focus-visible:ring-lime-500"
                    />
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                                activeFilter === filter
                                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                            )}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                {filteredThreads.map((thread) => {
                    const isSelected = selectedIds.includes(thread.id);
                    const isStarred = starredIds.includes(thread.id);

                    return (
                        <div
                            key={thread.id}
                            className={cn(
                                "flex flex-col md:flex-row items-start md:items-center gap-4 px-4 py-4 border-b border-gray-100 transition-colors",
                                thread.unread ? "bg-lime-50/30" : "bg-white",
                                "hover:bg-lime-50/50"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectThread(thread.id)}
                                    className="mt-1 size-4 rounded border-gray-300 text-lime-600 focus:ring-lime-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleStar(thread.id)}
                                    className="mt-0.5 text-gray-300 hover:text-amber-500 transition-colors"
                                >
                                    <Star className={cn("size-4", isStarred && "text-amber-500 fill-amber-500")} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 min-w-55">
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-semibold",
                                    thread.unread
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-600 border-gray-200"
                                )}>
                                    {thread.contact.initials}
                                </div>
                                <div>
                                    <p className={cn(
                                        "text-sm font-semibold text-slate-900",
                                        thread.unread ? "font-bold" : "font-medium"
                                    )}>
                                        {thread.contact.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{thread.contact.email}</p>
                                </div>
                            </div>

                            <div className="flex-1 min-w-55">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className={cn(
                                        "text-sm text-slate-900",
                                        thread.unread ? "font-semibold" : "font-medium"
                                    )}>
                                        {thread.subject}
                                    </p>
                                    <span className={cn(
                                        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                                        STAGE_STYLES[thread.stage]
                                    )}>
                                        {thread.stage}
                                    </span>
                                    {thread.tags.includes("Alta prioridade") && (
                                        <span className="text-[10px] uppercase tracking-wide text-amber-500 font-semibold">Prioridade</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-1">{thread.preview}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                    <span>{thread.lastMessageTime}</span>
                                    <span>•</span>
                                    <span>{thread.property.name}</span>
                                    <span>•</span>
                                    <span>{thread.channel}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 ml-auto">
                                {ROW_ACTIONS.map((action) => (
                                    <button
                                        key={action.key}
                                        type="button"
                                        onClick={() => handleRowAction(thread, action.key)}
                                        className={cn(
                                            "h-auto py-2 px-3 flex flex-col items-center gap-1 text-[11px] font-medium text-gray-500 rounded-xl transition-colors min-w-14",
                                            action.className
                                        )}
                                    >
                                        <action.icon className="size-4" />
                                        <span className="leading-none">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {filteredThreads.length === 0 && (
                    <div className="py-16 text-center text-gray-500">
                        Nenhuma mensagem encontrada para esse filtro.
                    </div>
                )}
            </div>

            {messageModal.open && messageModal.thread && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Mensagem para</p>
                                <h3 className="text-xl font-semibold text-slate-900">{messageModal.thread.contact.name}</h3>
                                <p className="text-sm text-gray-500">{messageModal.thread.contact.email}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMessageModal({ open: false, thread: null })}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Fechar"
                            >
                                ×
                            </button>
                        </div>

                        <Textarea
                            value={messageBody}
                            onChange={(e) => setMessageBody(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className="min-h-32"
                        />

                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setMessageModal({ open: false, thread: null })}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                className="bg-lime-500 hover:bg-lime-600 text-slate-900"
                                onClick={() => {
                                    alert(`Mensagem enviada para ${messageModal.thread?.contact.name}!`);
                                    setMessageModal({ open: false, thread: null });
                                }}
                            >
                                Enviar mensagem
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
