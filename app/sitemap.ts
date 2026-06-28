import type { MetadataRoute } from 'next';
import {
  getCitiesAll,
  getPropertyTypes,
  getActivePropertySlugs,
  getActiveCompanySlugs,
  getActiveStorefrontSlugs,
} from '@/lib/data';
import { companyTypes } from '@/lib/constants';
import { SITE_URL } from '@/lib/seo/meta';

export const revalidate = 3600;

// Apenas URLs públicas e indexáveis. Áreas privadas (/painel, /admin, /entrar,
// /cadastro, /anunciar) e páginas filtradas por query são deixadas de fora —
// estas últimas apontam para o canonical da rota base.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cities, types, props, companies, storefronts] = await Promise.all([
    getCitiesAll(),
    getPropertyTypes(),
    getActivePropertySlugs(),
    getActiveCompanySlugs(),
    getActiveStorefrontSlugs(),
  ]);
  const now = new Date();

  const urls: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/imoveis`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/imobiliarias`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/corretores`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/profissionais`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/vitrine`, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${SITE_URL}/contato`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacidade`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/termos`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  // Landing pages por categoria de profissional (SEO programático).
  for (const t of companyTypes) {
    if (t.value === 'outro') continue;
    urls.push({ url: `${SITE_URL}/profissionais/${t.value}`, changeFrequency: 'weekly', priority: 0.5 });
  }

  for (const c of cities) {
    urls.push({ url: `${SITE_URL}/${c.slug}`, changeFrequency: 'daily', priority: 0.8 });
    for (const t of types) urls.push({ url: `${SITE_URL}/${c.slug}/${t.slug}s`, changeFrequency: 'weekly', priority: 0.6 });
  }
  for (const slug of props) urls.push({ url: `${SITE_URL}/imovel/${slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 });
  for (const slug of companies) urls.push({ url: `${SITE_URL}/empresa/${slug}`, changeFrequency: 'weekly', priority: 0.5 });
  for (const slug of storefronts) urls.push({ url: `${SITE_URL}/vitrine/${slug}`, changeFrequency: 'weekly', priority: 0.5 });

  return urls;
}
