// =====================================================================
// SEO helpers centrais — termos públicos, saneamento de jargão interno,
// limites de tamanho de título/descrição e builder de Metadata (Next.js).
// Regra de conteúdo: NUNCA expor "DDD 77" em texto público; usar a região
// "Oeste da Bahia". O "DDD 77" continua válido apenas como lógica interna.
// =====================================================================
import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br').replace(/\/+$/, '');
export const SITE_NAME = '77Imóveis';

/** Termo regional público (pt-BR). Substitui o jargão interno "DDD 77". */
export const REGION = 'Oeste da Bahia';
export const STATE = 'BA';

/** Asset existente reaproveitado como imagem padrão de compartilhamento (OG). */
export const DEFAULT_OG_IMAGE = '/hero-family-moving.jpg';

/** Limites recomendados para exibição em buscadores. */
export const TITLE_MAX = 60;
export const DESC_MAX = 160;

export const absoluteUrl = (path = '/') =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Troca o jargão interno ("DDD 77", "região 77") pelo termo público
 * "Oeste da Bahia". Aplicar a QUALQUER texto vindo do banco que vá para
 * conteúdo/metadados públicos (descrições de cidades, empresas, imóveis).
 */
export function swapRegion(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/regi(?:ã|a)o\s+do\s+DDD\s*-?\s*77/gi, 'região do Oeste da Bahia')
    .replace(/\b(no|do|da|na|em)\s+DDD\s*-?\s*77\b/gi, '$1 Oeste da Bahia')
    .replace(/\bregi(?:ã|a)o\s+(?:do\s+)?77\b/gi, 'Oeste da Bahia')
    .replace(/\bDDD\s*-?\s*77\b/gi, 'Oeste da Bahia');
}

/**
 * Versão para METADADOS: troca o jargão e normaliza tudo numa única linha.
 * Para texto VISÍVEL (que pode ter quebras de linha), use `swapRegion`.
 */
export function regionalize(text?: string | null): string {
  return swapRegion(text).replace(/\s+/g, ' ').trim();
}

/** Corta o texto num limite respeitando palavras e remove pontuação solta. */
export function clamp(text: string, max: number): string {
  const t = (text ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const i = cut.lastIndexOf(' ');
  const base = i > max * 0.6 ? cut.slice(0, i) : cut;
  return `${base.replace(/[\s,;:.\-–—]+$/, '')}…`;
}

/** Atalhos com os limites recomendados, já saneando o jargão interno. */
export const seoTitle = (text: string) => clamp(regionalize(text), TITLE_MAX);
export const seoDescription = (text: string) => clamp(regionalize(text), DESC_MAX);

type PageMetaInput = {
  /** Título "core" (sem a marca). O template do layout adiciona " | 77Imóveis". */
  title: string;
  description: string;
  /** Caminho absoluto da rota (ex.: "/barreiras/casas"). Vira o canonical. */
  path: string;
  images?: (string | null | undefined)[];
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
};

/**
 * Builder de Metadata para páginas públicas: canonical auto-referente,
 * Open Graph e Twitter completos (incluindo marca e siteName) e robots.
 */
export function pageMetadata({
  title,
  description,
  path,
  images,
  type = 'website',
  noindex,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const cleanTitle = seoTitle(title);
  const cleanDesc = seoDescription(description);
  const branded = `${cleanTitle} | ${SITE_NAME}`;
  const pics = (images?.filter(Boolean) as string[] | undefined) ?? [];
  const ogImages = (pics.length ? pics : [DEFAULT_OG_IMAGE]).map((src) =>
    /^https?:\/\//.test(src) ? src : absoluteUrl(src),
  );

  return {
    title: cleanTitle,
    description: cleanDesc,
    // noindex e canonical cross-URL são sinais conflitantes: em páginas
    // noindex (variantes filtradas) omitimos o canonical.
    ...(noindex
      ? { robots: { index: false, follow: false } }
      : { alternates: { canonical: url } }),
    openGraph: {
      title: branded,
      description: cleanDesc,
      url,
      type: type as any,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: branded,
      description: cleanDesc,
      images: ogImages,
    },
  };
}
