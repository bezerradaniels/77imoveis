// Formatação em pt-BR (moeda etc.). Funções pequenas e reutilizáveis.
export const brl = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

// Gera slug amigável (sem acento, minúsculo, com hífens).
export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Plural simples em pt-BR (suficiente para nomes de tipos de imóvel).
export function plural(word: string) {
  if (/ão$/.test(word)) return word.replace(/ão$/, 'ões');
  if (/[ai]l$/.test(word)) return word.replace(/l$/, 'is');
  if (/m$/.test(word)) return word.replace(/m$/, 'ns');
  if (/r$/.test(word)) return word + 'es';
  return word + 's';
}

// Rótulo de preço de um card, considerando "sob consulta" e aluguel.
export function priceLabel(p: {
  price: number | null;
  priceVisibility: 'publico' | 'sob_consulta';
  negotiation: string;
}) {
  if (p.priceVisibility === 'sob_consulta' || p.price == null) return 'Consultar valor';
  const suffix = p.negotiation === 'aluguel' ? '/mês' : p.negotiation === 'temporada' || p.negotiation === 'romaria' ? '/dia' : '';
  return brl(p.price) + suffix;
}
