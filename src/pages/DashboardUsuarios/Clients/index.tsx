import { useState } from "react";
import {
    MoreHorizontal,
    Phone,
    MessageCircle,
    User,
    MapPin,
    DollarSign,
    GripVertical
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../lib/utils";
import Seo from "../../../components/common/Seo";

type ClientStatus = "contact" | "opportunity" | "negotiation" | "proposal" | "sold";

type Client = {
    id: string;
    name: string;
    email: string;
    phone: string;
    interest: string;
    propertyId: string;
    budget: string;
    status: ClientStatus;
    lastContact: string;
};

const INITIAL_CLIENTS: Client[] = [
    {
        id: "1",
        name: "Roberto Almeida",
        email: "roberto@email.com",
        phone: "(11) 99999-9999",
        interest: "Apartamento Jardins",
        propertyId: "1",
        budget: "R$ 2.4M",
        status: "contact",
        lastContact: "Hoje, 10:30"
    },
    {
        id: "2",
        name: "Fernanda Costa",
        email: "fernanda@email.com",
        phone: "(11) 98888-8888",
        interest: "Casa Alphaville",
        propertyId: "2",
        budget: "R$ 15k/mês",
        status: "negotiation",
        lastContact: "Ontem"
    },
    {
        id: "3",
        name: "Carlos Santos",
        email: "carlos@email.com",
        phone: "(11) 97777-7777",
        interest: "Sala Paulista",
        propertyId: "3",
        budget: "R$ 400k",
        status: "opportunity",
        lastContact: "2 dias atrás"
    },
    {
        id: "4",
        name: "Julia Pereira",
        email: "julia@email.com",
        phone: "(11) 96666-6666",
        interest: "Apto Vila Madalena",
        propertyId: "4",
        budget: "R$ 1.2M",
        status: "sold",
        lastContact: "1 semana atrás"
    }
];

const COLUMNS: { id: ClientStatus; label: string; color: string; bg: string }[] = [
    { id: "contact", label: "Contato", color: "bg-blue-500", bg: "bg-blue-50" },
    { id: "opportunity", label: "Oportunidade", color: "bg-amber-500", bg: "bg-amber-50" },
    { id: "negotiation", label: "Negociando", color: "bg-orange-500", bg: "bg-orange-50" },
    { id: "proposal", label: "Orçamento", color: "bg-purple-500", bg: "bg-purple-50" },
    { id: "sold", label: "Venda Realizada", color: "bg-green-500", bg: "bg-green-50" },
];

export default function Clients() {
    const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
    const [draggedClientId, setDraggedClientId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<ClientStatus | null>(null);

    const handleDragStart = (clientId: string) => {
        setDraggedClientId(clientId);
    };

    const handleDragOver = (e: React.DragEvent, status: ClientStatus) => {
        e.preventDefault();
        setDragOverColumn(status);
    };

    const handleDrop = (e: React.DragEvent, status: ClientStatus) => {
        e.preventDefault();
        if (draggedClientId) {
            setClients(prev => prev.map(c =>
                c.id === draggedClientId ? { ...c, status } : c
            ));
        }
        setDraggedClientId(null);
        setDragOverColumn(null);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-6">
            <Seo title="77 Imóveis | Gerenciar Clientes" />

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h1>
                <p className="text-sm text-gray-500">Arraste os cards para mover os clientes pelo funil de vendas</p>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex gap-4 h-full min-w-max pb-4">
                    {COLUMNS.map((column) => (
                        <div
                            key={column.id}
                            className={cn(
                                "w-80 flex flex-col gap-4 rounded-xl transition-colors duration-200 p-2",
                                dragOverColumn === column.id ? "bg-gray-100 ring-2 ring-lime-500/50" : "bg-transparent"
                            )}
                            onDragOver={(e) => handleDragOver(e, column.id)}
                            onDrop={(e) => handleDrop(e, column.id)}
                            onDragLeave={() => setDragOverColumn(null)}
                        >
                            {/* Column Header */}
                            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm select-none">
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-3 h-3 rounded-full", column.color)} />
                                    <span className="font-semibold text-gray-700">{column.label}</span>
                                </div>
                                <span className={cn("text-xs font-medium px-2 py-1 rounded-full", column.bg, "text-gray-600")}>
                                    {clients.filter(c => c.status === column.id).length}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div className="flex-1 overflow-y-auto space-y-3 p-1">
                                {clients
                                    .filter(c => c.status === column.id)
                                    .map(client => (
                                        <div
                                            key={client.id}
                                            draggable
                                            onDragStart={() => handleDragStart(client.id)}
                                            className={cn(
                                                "bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group cursor-grab active:cursor-grabbing",
                                                draggedClientId === client.id && "opacity-50 ring-2 ring-lime-500 rotate-2"
                                            )}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium text-xs border border-gray-200">
                                                        {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{client.name}</p>
                                                        <p className="text-xs text-gray-500">{client.lastContact}</p>
                                                    </div>
                                                </div>
                                                <GripVertical className="size-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <User className="size-3.5 text-gray-400" />
                                                    <span className="truncate">{client.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <MapPin className="size-3.5 text-gray-400" />
                                                    <span className="truncate font-medium">{client.interest}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-lime-700 font-medium bg-lime-50 px-2 py-1 rounded-md w-fit border border-lime-100">
                                                    <DollarSign className="size-3.5" />
                                                    {client.budget}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 pt-3 border-t border-gray-50">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg">
                                                    <MessageCircle className="size-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg">
                                                    <Phone className="size-3.5" />
                                                </Button>
                                                <div className="flex-1" />
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                                                    <MoreHorizontal className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                {clients.filter(c => c.status === column.id).length === 0 && (
                                    <div className={cn(
                                        "h-24 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400",
                                        dragOverColumn === column.id && "bg-lime-50/50 border-lime-200 text-lime-600"
                                    )}>
                                        Arraste aqui
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
