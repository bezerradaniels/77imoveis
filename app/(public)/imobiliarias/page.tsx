import { getCompanies } from '@/lib/data';
import { CompanyCard } from '@/components/company/CompanyCard';
import { pageMetadata, REGION } from '@/lib/seo/meta';

export const revalidate = 300;

export const metadata = pageMetadata({
  title: `Imobiliárias no ${REGION}`,
  description: `Imobiliárias no ${REGION}, na Bahia. Veja contatos, cidades de atuação e imóveis à venda e para alugar anunciados pelas agências da região.`,
  path: '/imobiliarias',
});

export default async function ImobiliariasPage() {
  const companies = await getCompanies('imobiliaria');
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Imobiliárias no {REGION}</h1>
      <p className="mb-5 text-muted">Imobiliárias que atuam no {REGION}, na Bahia.</p>
      {companies.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <CompanyCard key={c.slug} {...c} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-12 text-center text-muted">
          Nenhuma imobiliária cadastrada ainda.
        </p>
      )}
    </main>
  );
}
