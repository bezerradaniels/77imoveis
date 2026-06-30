import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/meta';

// Áreas privadas/internas que NÃO devem ser rastreadas. As páginas públicas
// (cidades, imóveis, perfis, vitrines) ficam liberadas. Buscadores de IA
// (GPTBot, PerplexityBot, Google-Extended etc.) seguem a regra "*" liberada,
// pois queremos que o portal seja citável por mecanismos generativos (GEO).
const DISALLOW = [
  '/painel',
  '/admin',
  '/entrar',
  '/cadastro',
  '/esqueci-senha',
  '/redefinir-senha',
  '/anunciar',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
