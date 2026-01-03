export type ListingPurpose = "venda" | "aluguel" | "lancamento";
export type PropertyType =
  | "casa"
  | "apartamento"
  | "predio"
  | "loja"
  | "escritorio"
  | "terreno"
  | "rural";

export type PropertyStatus = "rascunho" | "ativo" | "inativo" | "vendido" | "alugado";

export type ListingsFilters = {
  purpose?: ListingPurpose;
  type?: PropertyType;
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  suites?: number;
  parkingSpots?: number;
  sort?: "recent" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
};

export type Property = {
  id: string;
  slug: string | null;
  title: string;

  purpose: ListingPurpose;
  type: PropertyType;
  status: PropertyStatus;

  state: string;
  city: string;
  neighborhood: string | null;

  bedrooms: number | null;
  bathrooms: number | null;
  parking_spots: number | null;
  area_m2: number | null;
  suites: number | null;


  price: number | null;
  rent: number | null;

  created_at: string;
  property_photos?: { url: string }[];
};
