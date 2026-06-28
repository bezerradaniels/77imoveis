import { getCitiesAll, getPropertyTypes } from '@/lib/data';
import { SITE_URL, REGION } from '@/lib/seo/meta';
import { companyTypes } from '@/lib/constants';
import { plural } from '@/lib/format';

export const revalidate = 3600;

// llms.txt — resumo factual e estruturado do site para buscadores de IA e
// LLMs (GEO). Define as entidades-chave (marca, região, cidades, tipos de
// imóvel, categorias de profissional) e os endpoints públicos de navegação.
export async function GET() {
  const [cities, types] = await Promise.all([getCitiesAll(), getPropertyTypes()]);

  const body = `# 77Imóveis

> 77Imóveis é o portal imobiliário regional do ${REGION} (Bahia, Brasil).
> Conecta quem busca imóveis a imobiliárias, corretores, construtoras e
> profissionais da construção. Conteúdo 100% em pt-BR.

## O que é
- Marketplace de imóveis à venda, para alugar, por temporada, para romaria e em lançamento.
- Região atendida: ${REGION} e sudoeste da Bahia.
- Anunciantes: imobiliárias, corretores autônomos, construtoras, incorporadoras e profissionais (engenharia civil, arquitetura, topografia, energia solar, financiamento, reformas).

## Como navegar
- Busca geral de imóveis: ${SITE_URL}/imoveis
- Busca por texto (palavra-chave): ${SITE_URL}/imoveis?busca={termo}
- Imóveis por cidade: ${SITE_URL}/{cidade}
- Imóveis por cidade e tipo: ${SITE_URL}/{cidade}/{tipo} (ex.: ${SITE_URL}/vitoria-da-conquista/casas)
- Página de um imóvel: ${SITE_URL}/imovel/{slug}
- Imobiliárias: ${SITE_URL}/imobiliarias
- Corretores: ${SITE_URL}/corretores
- Profissionais e empresas: ${SITE_URL}/profissionais
- Profissionais por categoria: ${SITE_URL}/profissionais/{categoria}
- Vitrines de empresas: ${SITE_URL}/vitrine/{slug}

## Tipos de imóvel
${(types as any[]).map((t) => `- ${plural(t.name)}: ${SITE_URL}/imoveis?tipo=${t.slug}`).join('\n') || '- Casas, apartamentos, terrenos, imóveis comerciais e rurais'}

## Categorias de profissional
${companyTypes.filter((t) => t.value !== 'outro').map((t) => `- ${t.label}: ${SITE_URL}/profissionais/${t.value}`).join('\n')}

## Cidades atendidas
${cities.map((c: any) => `- ${c.name} (BA): ${SITE_URL}/${c.slug}`).join('\n')}

## Contato
- Site: ${SITE_URL}
- E-mail: contato@77imoveis.com.br
`;
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
