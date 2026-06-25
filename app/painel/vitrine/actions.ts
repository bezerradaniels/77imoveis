'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { slugify } from '@/lib/format';

export type StorefrontInput = {
  slug?: string;
  headline?: string;
  about?: string;
  accentColor?: string;
  logoUrl?: string;
  coverUrl?: string;
  showWhatsapp: boolean;
};

async function uniqueSlug(sb: any, base: string) {
  const cleanBase = slugify(base).slice(0, 80) || 'vitrine';
  let slug = cleanBase;
  let n = 1;
  for (;;) {
    const { data } = await sb.from('storefronts').select('id').eq('slug', slug).maybeSingle();
    if (!data) return slug;
    slug = `${cleanBase}-${++n}`;
  }
}

// Salva a aparência da vitrine. O status/validade é controlado só pelo pagamento
// (trigger guard_storefront_status no banco) — o dono não consegue se ativar.
export async function saveStorefront(input: StorefrontInput): Promise<{ slug?: string; error?: string }> {
  const sb = createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return { error: 'Sessão expirada.' };

  const { data: companies } = await sb.from('companies').select('id,slug').eq('owner_id', auth.user.id).limit(1);
  const company = companies?.[0];
  if (!company) return { error: 'Crie sua empresa antes de configurar a vitrine.' };

  const accentColor = /^#[0-9a-f]{6}$/i.test(input.accentColor ?? '') ? input.accentColor : '#0891b2';
  const base: Record<string, any> = {
    headline: input.headline?.trim() || null,
    about: input.about?.trim() || null,
    accent_color: accentColor,
    logo_url: input.logoUrl?.trim() || null,
    cover_url: input.coverUrl?.trim() || null,
    show_whatsapp: input.showWhatsapp,
  };

  const { data: existing } = await sb.from('storefronts').select('id,slug').eq('company_id', company.id).maybeSingle();
  if (existing) {
    const { error } = await sb.from('storefronts').update(base).eq('id', existing.id);
    if (error) return { error: 'Não foi possível salvar a vitrine.' };
    revalidatePath('/painel/vitrine');
    revalidatePath(`/vitrine/${existing.slug}`);
    return { slug: existing.slug };
  }

  const slug = await uniqueSlug(sb, slugify(input.slug || company.slug));
  const { error } = await sb.from('storefronts').insert({ ...base, company_id: company.id, slug });
  if (error) return { error: 'Não foi possível criar a vitrine.' };
  revalidatePath('/painel/vitrine');
  revalidatePath(`/vitrine/${slug}`);
  return { slug };
}
