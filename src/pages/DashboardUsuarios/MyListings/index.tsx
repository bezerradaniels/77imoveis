import { useState } from "react";
import { Link } from "react-router-dom";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    PauseCircle,
    PlayCircle,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { paths } from "../../../routes/paths";
import Seo from "../../../components/common/Seo";

// Mock data type
type Property = {
    id: string;
    title: string;
    address: string;
    price: string;
    type: string;
    status: "active" | "paused" | "sold" | "rented";
    image: string;
    views: number;
    leads: number;
};

// Mock data
const INITIAL_PROPERTIES: Property[] = [
    {
        id: "1",
        title: "Apartamento Alto Padrão - Jardins",
        address: "Rua Oscar Freire, São Paulo - SP",
        price: "R$ 2.500.000",
        type: "Venda",
        status: "active",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80",
        views: 1240,
        leads: 45,
    },
    {
        id: "2",
        title: "Casa em Condomínio Fechado",
        address: "Alphaville, Barueri - SP",
        price: "R$ 15.000 / mês",
        type: "Aluguel",
        status: "paused",
        image: "https://images.unsplash.com/photo-1600596542815-e32c21596519?auto=format&fit=crop&w=300&q=80",
        views: 890,
        leads: 12,
    },
    {
        id: "3",
        title: "Sala Comercial Paulista",
        address: "Av. Paulista, São Paulo - SP",
        price: "R$ 450.000",
        type: "Venda",
        status: "sold",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80",
        views: 3200,
        leads: 89,
    },
];

type ActionType = 'toggle_active' | 'mark_sold' | 'delete';

type ModalState = {
    isOpen: boolean;
    type: ActionType | null;
    propertyId: string | null;
    currentStatus?: Property["status"];
    propertyTitle?: string;
};

export default function MyListings() {
    const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
    const [searchTerm, setSearchTerm] = useState("");
    const [modal, setModal] = useState<ModalState>({ isOpen: false, type: null, propertyId: null });

    const filteredProperties = properties.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: Property["status"]) => {
        switch (status) {
            case "active":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Ativo</span>;
            case "paused":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pausado</span>;
            case "sold":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Vendido</span>;
            case "rented":
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Alugado</span>;
        }
    };

    const confirmAction = () => {
        if (!modal.propertyId || !modal.type) return;

        setProperties(prev => prev.map(p => {
            if (p.id !== modal.propertyId) return p;

            if (modal.type === 'toggle_active') {
                return { ...p, status: p.status === 'active' ? 'paused' as const : 'active' as const };
            }

            if (modal.type === 'mark_sold') {
                return { ...p, status: p.type === 'Venda' ? 'sold' as const : 'rented' as const };
            }

            return p;
        }).filter(p => modal.type !== 'delete' ? true : p.id !== modal.propertyId)); // Handle delete if implemented

        if (modal.type === 'delete') {
            setProperties(prev => prev.filter(p => p.id !== modal.propertyId));
        }

        closeModal();
    };

    const openModal = (type: ActionType, property: Property) => {
        setModal({
            isOpen: true,
            type,
            propertyId: property.id,
            currentStatus: property.status,
            propertyTitle: property.title
        });
    };

    const closeModal = () => {
        setModal({ isOpen: false, type: null, propertyId: null });
    };

    return (
        <div className="space-y-6 relative">
            <Seo title="77 Imóveis | Meus Anúncios" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Meus Anúncios</h1>
                    <p className="text-sm text-gray-500">Gerencie seus imóveis cadastrados</p>
                </div>
                <Link to={paths.dashUsuarioImovelNovo}>
                    <Button className="bg-lime-500 hover:bg-lime-600 text-white font-semibold shadow-sm w-full sm:w-auto">
                        <Plus className="size-4 mr-2" />
                        Cadastrar Imóvel
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm max-w-md">
                <Search className="size-5 text-gray-400 ml-2" />
                <Input
                    placeholder="Buscar por título ou endereço..."
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredProperties.map((property) => (
                    <div
                        key={property.id}
                        className="group bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-all shadow-sm"
                    >
                        {/* Image */}
                        <div className="w-full sm:w-48 h-32 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                            <img
                                src={property.image}
                                alt={property.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div className="space-y-1">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {getStatusBadge(property.status)}
                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{property.type}</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 truncate pr-4">{property.title}</h3>
                                    </div>

                                    {/* Actions Toolbar */}
                                    <div className="flex items-center gap-2">
                                        <Link to={paths.dashUsuarioImovelEditar(property.id)}>
                                            <Button variant="ghost" size="sm" className="h-auto py-2 flex-col gap-1 text-gray-500 hover:text-lime-600 hover:bg-lime-50 font-normal min-w-[3.5rem]">
                                                <Edit className="size-4" />
                                                <span className="text-[10px] leading-none">Editar</span>
                                            </Button>
                                        </Link>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openModal('toggle_active', property)}
                                            className="h-auto py-2 flex-col gap-1 text-gray-500 hover:text-amber-600 hover:bg-amber-50 font-normal min-w-[3.5rem]"
                                        >
                                            {property.status === 'active' ? (
                                                <>
                                                    <PauseCircle className="size-4" />
                                                    <span className="text-[10px] leading-none">Pausar</span>
                                                </>
                                            ) : (
                                                <>
                                                    <PlayCircle className="size-4" />
                                                    <span className="text-[10px] leading-none">Ativar</span>
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openModal('mark_sold', property)}
                                            className="h-auto py-2 flex-col gap-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 font-normal min-w-[3.5rem]"
                                            disabled={property.status === 'sold' || property.status === 'rented'}
                                        >
                                            <CheckCircle2 className="size-4" />
                                            <span className="text-[10px] leading-none">
                                                {property.type === 'Venda' ? 'Vendido' : 'Alugado'}
                                            </span>
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openModal('delete', property)}
                                            className="h-auto py-2 flex-col gap-1 text-gray-400 hover:text-red-600 hover:bg-red-50 font-normal min-w-[3.5rem]"
                                        >
                                            <Trash2 className="size-4" />
                                            <span className="text-[10px] leading-none">Excluir</span>
                                        </Button>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-500 truncate">{property.address}</p>
                                <p className="font-semibold text-lime-600">{property.price}</p>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-50">
                                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                    <span>{property.views} visualizações</span>
                                    <span>{property.leads} leads</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredProperties.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500">Nenhum anúncio encontrado.</p>
                        <Link to={paths.dashUsuarioImovelNovo} className="text-lime-600 font-medium hover:underline mt-2 inline-block">
                            Cadastrar imóvel
                        </Link>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95 duration-200" role="dialog">

                        <div className="flex items-center gap-3 text-amber-600">
                            <div className="p-2 bg-amber-100 rounded-full">
                                <AlertCircle className="size-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Confirmar Ação</h3>
                        </div>

                        <div className="text-gray-600">
                            {modal.type === 'toggle_active' && (
                                <p>Tem certeza que deseja <span className="font-bold">{modal.currentStatus === 'active' ? 'pausar' : 'ativar'}</span> o anúncio <span className="italic">"{modal.propertyTitle}"</span>?</p>
                            )}
                            {modal.type === 'mark_sold' && (
                                <p>Tem certeza que deseja marcar o imóvel <span className="italic">"{modal.propertyTitle}"</span> como <span className="font-bold">negociado</span>? Essa ação irá retirá-lo das buscas.</p>
                            )}
                            {modal.type === 'delete' && (
                                <p>Tem certeza que deseja <span className="font-bold text-red-600">excluir permanentemente</span> o anúncio <span className="italic">"{modal.propertyTitle}"</span>? Essa ação não pode ser desfeita.</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button variant="ghost" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button
                                variant={modal.type === 'delete' ? "destructive" : "default"}
                                className={modal.type !== 'delete' ? "bg-lime-600 hover:bg-lime-700" : ""}
                                onClick={confirmAction}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
