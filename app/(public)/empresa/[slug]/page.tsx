import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BadgeCheck, Globe, Instagram, MessageCircle, Phone, MapPin } from 'lucide-react';
import { getCompanyBySlug } from '@/lib/data';
import { companyTypeLabel } from '@/lib/constants';
import { PropertyCard } from '@/components/property/PropertyCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { localBusinessLd, breadcrumbLd } from '@/lib/seo/jsonld';

export const revalidate = 300;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://77imoveis.com.br';
const shouldUnoptimize = (src: string) => src.endsWith('.svg') || (/^https?:\/\//.test(src) && !src.includes('.supabase.co'));

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const res = await getCompanyBySlug(params.slug);
  if (!res) return {};
  const c: any = res.company;
  const title = c.seo_title || `${c.trade_name} — ${companyTypeLabel(c.type)}`;
  const description = c.seo_description || (c.description ?? '').slice(0, 155);
  return { title, description, alternates: { canonical: `${SITE}/empresa/${c.slug}` } };
}

const wa = (n?: string) => (n ? `https://wa.me/55${n.replace(/\D/g, '')}` : null);

export default async function EmpresaPublicaPage({ params }: { params: { slug: string } }) {
  const res = await getCompanyBySlug(params.slug);
  if (!res) notFound();
  const c: any = res.company;
  const url = `${SITE}/empresa/${c.slug}`;
  const specialties = (c.company_specialties ?? []).map((s: any) => s.specialties).filter(Boolean);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <JsonLd
        data={localBusinessLd({
          name: c.trade_name,
          url,
          logo: c.logo_url,
          phone: c.whatsapp || c.phone,
          city: c.cities?.name,
        })}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Início', url: SITE },
          { name: 'Profissionais', url: `${SITE}/profissionais` },
          { name: c.trade_name, url },
        ])}
      />

      {c.cover_url && (
        <div className="relative mb-4 aspect-[5/1] w-full overflow-hidden rounded-xl bg-border">
          <Image
            src={c.cover_url}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            unoptimized={shouldUnoptimize(c.cover_url)}
            className="object-cover"
          />
        </div>
      )}

      <header className="flex flex-wrap items-start gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
          {c.logo_url && (
            <Image
              src={c.logo_url}
              alt={c.trade_name}
              fill
              sizes="80px"
              unoptimized={shouldUnoptimize(c.logo_url)}
              className="object-cover"
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            {c.trade_name}
            {c.is_verified && <BadgeCheck size={20} className="text-primary" />}
          </h1>
          <p className="text-muted">{companyTypeLabel(c.type)}</p>
          {c.cities?.name && (
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
              <MapPin size={14} /> {c.cities.name} - BA
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {wa(c.whatsapp || c.phone) && (
            <a href={wa(c.whatsapp || c.phone)!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#1FA855] px-4 py-2 text-sm font-semibold text-white">
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}
          {c.website && (
            <a href={c.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm">
              <Globe size={16} /> Site
            </a>
          )}
          {c.instagram && (
            <a href={`https://instagram.com/${c.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-sm">
              <Instagram size={16} />
            </a>
          )}
        </div>
      </header>

      {c.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">{c.description}</p>}

      {!!specialties.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {specialties.map((s: any) => (
            <span key={s.slug} className="rounded-full border border-border px-3 py-1 text-xs text-muted">{s.name}</span>
          ))}
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Imóveis ({res.properties.length})</h2>
        {res.properties.length ? (
          <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,200px)]">
            {res.properties.map((p) => <PropertyCard key={p.slug} {...p} />)}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
            Esta empresa ainda não tem imóveis ativos.
          </p>
        )}
      </section>
    </main>
  );
}
