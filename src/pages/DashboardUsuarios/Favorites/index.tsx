import { Link } from "react-router-dom";
import { Heart, MapPin, Bed, Bath, Maximize, Trash2, ArrowUpRight } from "lucide-react";

import Seo from "../../../components/common/Seo";
import { Button } from "../../../components/ui/button";
import { useFavorites } from "../../../app/favorites/FavoritesProvider";
import { paths } from "../../../routes/paths";

function moneyBRL(value: number | null | undefined) {
    if (value == null) return "Sob consulta";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function Favorites() {
    const { favorites, removeFavorite } = useFavorites();

    const totalFavorites = favorites.length;
    const totalValue = favorites.reduce((sum, item) => {
        const price = item.purpose === "aluguel" ? item.rent : item.price;
        return sum + (price ?? 0);
    }, 0);

    const emptyState = totalFavorites === 0;

    return (
        <div className="space-y-6">
            <Seo title="77 Imóveis | Favoritos" />

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-wrap items-center gap-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Minha seleção</p>
                    <h1 className="text-3xl font-semibold text-slate-900">Favoritos</h1>
                    <p className="text-sm text-gray-500">
                        Salve imóveis que despertaram interesse e organize visitas e negociações em um só lugar.
                    </p>
                </div>

                <div className="ml-auto flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Imóveis salvos</p>
                        <p className="text-2xl font-bold text-slate-900">{totalFavorites}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-3 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Ticket potencial</p>
                        <p className="text-2xl font-bold text-slate-900">{moneyBRL(totalValue || null)}</p>
                    </div>
                </div>
            </div>

            {emptyState ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-lime-50 text-lime-600 mb-4">
                        <Heart className="size-7" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">Nenhum favorito ainda</h2>
                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                        Explore os imóveis no catálogo e toque no ícone de coração para salvar seus preferidos aqui.
                    </p>
                    <Button asChild className="mt-6 bg-lime-500 text-slate-900 hover:bg-lime-400">
                        <Link to={paths.listings} className="gap-2">
                            Ver imóveis disponíveis
                            <ArrowUpRight className="size-4" />
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {favorites.map((fav) => {
                        const priceLabel = fav.purpose === "aluguel" ? moneyBRL(fav.rent) : moneyBRL(fav.price);
                        const priceSuffix = fav.purpose === "aluguel" ? "/mês" : "";

                        return (
                            <div key={fav.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col md:flex-row gap-5">
                                <div className="h-40 w-full md:w-64 rounded-2xl bg-linear-to-br from-gray-100 to-gray-50 flex items-center justify-center relative overflow-hidden">
                                    <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-500">
                                        {fav.purpose === "aluguel" ? "Aluguel" : fav.purpose === "lancamento" ? "Lançamento" : "Venda"}
                                    </div>
                                    <div className="text-sm text-gray-400 text-center px-4">
                                        Foto destacada aparecerá aqui
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-start gap-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">{fav.title}</h3>
                                            <p className="flex items-center gap-2 text-sm text-gray-500">
                                                <MapPin className="size-4 text-gray-400" />
                                                {fav.city}{fav.neighborhood ? `, ${fav.neighborhood}` : ""}{fav.state ? ` - ${fav.state}` : ""}
                                            </p>
                                        </div>

                                        <div className="ml-auto text-right">
                                            <p className="text-2xl font-bold text-slate-900">{priceLabel}</p>
                                            {priceSuffix && <p className="text-xs text-gray-500">{priceSuffix}</p>}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                        {fav.bedrooms != null && (
                                            <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1">
                                                <Bed className="size-4 text-gray-400" />
                                                {fav.bedrooms} quartos
                                            </span>
                                        )}
                                        {fav.bathrooms != null && (
                                            <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1">
                                                <Bath className="size-4 text-gray-400" />
                                                {fav.bathrooms} banheiros
                                            </span>
                                        )}
                                        {fav.area_m2 != null && (
                                            <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1">
                                                <Maximize className="size-4 text-gray-400" />
                                                {fav.area_m2} m²
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button asChild size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                                            <Link to={paths.property(fav.slug ?? fav.id)} className="gap-2">
                                                Ver imóvel
                                                <ArrowUpRight className="size-4" />
                                            </Link>
                                        </Button>

                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            className="gap-2 text-gray-500 hover:text-red-500"
                                            onClick={() => removeFavorite(fav.id)}
                                        >
                                            <Trash2 className="size-4" />
                                            Remover
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
