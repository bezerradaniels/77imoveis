/**
 * Converte string para slug amigável
 * Ex: "Vitória da Conquista" -> "vitoria-da-conquista"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]+/g, "-") // substitui caracteres especiais por hífen
    .replace(/^-+|-+$/g, ""); // remove hífens do início e fim
}

/**
 * Converte slug para texto legível
 * Ex: "vitoria-da-conquista" -> "vitória da conquista" (precisa de lookup)
 */
export function unslugify(slug: string): string {
  return slug.replace(/-/g, " ");
}

/**
 * Mapeamento de finalidades para URLs
 */
export const purposeToSlug: Record<string, string> = {
  aluguel: "aluguel",
  venda: "venda",
  lancamento: "lancamentos",
};

export const slugToPurpose: Record<string, string> = {
  aluguel: "aluguel",
  venda: "venda",
  lancamentos: "lancamento",
};

/**
 * Mapeamento de tipos para URLs
 */
export const typeToSlug: Record<string, string> = {
  casa: "casas",
  apartamento: "apartamentos",
  predio: "predios",
  loja: "lojas",
  escritorio: "escritorios",
  terreno: "terrenos",
  rural: "rurais",
};

export const slugToType: Record<string, string> = {
  casas: "casa",
  apartamentos: "apartamento",
  predios: "predio",
  lojas: "loja",
  escritorios: "escritorio",
  terrenos: "terreno",
  rurais: "rural",
};

/**
 * Gera URL amigável para listagem
 */
export function buildListingUrl(params: {
  purpose?: string;
  city?: string;
  type?: string;
  bedrooms?: number;
}): string {
  const parts: string[] = [];

  if (params.purpose) {
    parts.push(purposeToSlug[params.purpose] || params.purpose);
  }

  if (params.city) {
    parts.push(slugify(params.city));
  } else if (params.purpose) {
    parts.push("todos");
  }

  if (params.type) {
    parts.push(typeToSlug[params.type] || params.type);
  }

  if (params.bedrooms && params.bedrooms > 0) {
    parts.push(`${params.bedrooms}quartos`);
  }

  return parts.length > 0 ? `/${parts.join("/")}` : "/imoveis";
}
