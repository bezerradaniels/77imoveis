import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Property } from "../../types";
import { paths } from "../../../../routes/paths";
import { useFavorites } from "../../../../app/favorites/FavoritesProvider";

function moneyBRL(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function PropertyCard({ p }: { p: Property }) {
  const priceLabel = p.purpose === "aluguel" ? moneyBRL(p.rent) : moneyBRL(p.price);
  const purposeColor = p.purpose === "aluguel" ? "bg-blue-500" : p.purpose === "lancamento" ? "bg-lime-500" : "bg-orange-500";
  const { toggleFavorite, isFavorite } = useFavorites();

  const favoritePayload = {
    id: p.id,
    slug: p.slug ?? p.id,
    title: p.title,
    city: p.city,
    neighborhood: p.neighborhood,
    state: p.state,
    purpose: p.purpose,
    type: p.type,
    price: p.price,
    rent: p.rent,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area_m2: p.area_m2,
  };
  const favorite = isFavorite(p.id);

  return (
    <Link
      to={paths.property(p.slug ?? p.id)}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 card-shadow"
    >
      {/* Placeholder para imagem futura */}
      <div className="aspect-4/3 bg-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white rounded-full ${purposeColor}`}>
          {p.purpose === "lancamento" ? "Lançamento" : p.purpose === "aluguel" ? "Aluguel" : "Venda"}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(favoritePayload);
          }}
          aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all"
        >
          <Heart className={favorite ? "w-5 h-5 text-red-500" : "w-5 h-5 text-gray-400"} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {p.city}{p.neighborhood ? `, ${p.neighborhood}` : ""}
        </div>

        <h3 className="font-semibold text-gray-900 group-hover:text-lime-600 transition-colors line-clamp-2 leading-snug">
          {p.title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>{p.bedrooms ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            <span>{p.bathrooms ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>{p.area_m2 ?? 0} m²</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded-full">{p.type}</span>
          <span className="text-xl font-bold text-lime-600">{priceLabel}</span>
        </div>
      </div>
    </Link>
  );
}
