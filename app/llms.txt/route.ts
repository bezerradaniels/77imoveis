import { getCitiesAll } from '@/lib/data';

export const revalidate = 3600;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';

// llms.txt — resumo do site para buscadores de IA (GEO).
export async function GET() {
  const cities = await getCitiesAll();
  const body = `# 77Imóveis

> Portal imobiliário regional do DDD 77 (oeste e sudoeste da Bahia, Brasil).
> Casas, apartamentos, terrenos e imóveis rurais à venda, para alugar, temporada,
> romaria e lançamento. Conteúdo em pt-BR, com anúncios de imobiliárias,
> corretores e particulares.

## Como navegar
- Busca por cidade: ${SITE}/{cidade}
- Busca por cidade e tipo: ${SITE}/{cidade}/{tipo} (ex.: /vitoria-da-conquista/casas)
- Página de um imóvel: ${SITE}/imovel/{slug}
- Profissionais e empresas: ${SITE}/profissionais
- Vitrines de empresas: ${SITE}/vitrine/{slug}

## Cidades atendidas
${cities.map((c: any) => `- ${c.name}: ${SITE}/${c.slug}`).join('\n')}

## Contato
- Site: ${SITE}
`;
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
