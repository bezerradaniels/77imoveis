import { supabase } from "../../components/lib/supabase/client";
import type { Property, ListingsFilters } from "./types";

export async function fetchListings(filters: ListingsFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from("properties")
    .select(
      "id,slug,title,purpose,type,status,state,city,neighborhood,bedrooms,suites,bathrooms,parking_spots,area_m2,price,rent,created_at, property_photos(url)",
      { count: "exact" }
    );

  // filtros
  if (filters.purpose) q = q.eq("purpose", filters.purpose);
  if (filters.type) q = q.eq("type", filters.type);

  if (filters.city) q = q.eq("city", filters.city);
  if (filters.neighborhood) q = q.ilike("neighborhood", `%${filters.neighborhood}%`);

  // Para venda/lancamento normalmente usa price, para aluguel usa rent.
  // Aqui aplicamos em ambos por simplicidade (você pode refinar depois).
  if (typeof filters.minPrice === "number") {
    q = q.or(`price.gte.${filters.minPrice},rent.gte.${filters.minPrice}`);
  }
  if (typeof filters.maxPrice === "number") {
    q = q.or(`price.lte.${filters.maxPrice},rent.lte.${filters.maxPrice}`);
  }

  if (typeof filters.bedrooms === "number") q = q.gte("bedrooms", filters.bedrooms);
  if (typeof filters.bathrooms === "number") q = q.gte("bathrooms", filters.bathrooms);
  if (typeof filters.suites === "number") q = q.gte("suites", filters.suites);
  if (typeof filters.parkingSpots === "number") q = q.gte("parking_spots", filters.parkingSpots);

  // ordenação
  const sort = filters.sort ?? "recent";
  if (sort === "recent") q = q.order("created_at", { ascending: false });
  if (sort === "price_asc") q = q.order("price", { ascending: true, nullsFirst: false });
  if (sort === "price_desc") q = q.order("price", { ascending: false, nullsFirst: false });

  // paginação
  q = q.range(from, to);

  const { data, error, count } = await q;
  if (error) throw error;

  return {
    items: (data ?? []) as Property[],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}
