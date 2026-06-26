import type { MetadataRoute } from 'next';
import {
  getCitiesAll,
  getPropertyTypes,
  getActivePropertySlugs,
  getActiveCompanySlugs,
  getActiveStorefrontSlugs,
} from '@/lib/data';

export const revalidate = 3600;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';

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
    { url: SITE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/profissionais`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE}/vitrine`, changeFrequency: 'weekly', priority: 0.4 },
    { url: `${SITE}/privacidade`, priority: 0.2 },
    { url: `${SITE}/termos`, priority: 0.2 },
  ];

  for (const c of cities) {
    urls.push({ url: `${SITE}/${c.slug}`, changeFrequency: 'daily', priority: 0.8 });
    for (const t of types) urls.push({ url: `${SITE}/${c.slug}/${t.slug}s`, changeFrequency: 'weekly', priority: 0.6 });
  }
  for (const slug of props) urls.push({ url: `${SITE}/imovel/${slug}`, changeFrequency: 'weekly', priority: 0.7 });
  for (const slug of companies) urls.push({ url: `${SITE}/empresa/${slug}`, changeFrequency: 'weekly', priority: 0.5 });
  for (const slug of storefronts) urls.push({ url: `${SITE}/vitrine/${slug}`, changeFrequency: 'weekly', priority: 0.5 });

  return urls;
}
