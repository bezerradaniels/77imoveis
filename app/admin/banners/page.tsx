import { adminListBanners } from '@/lib/data';
import { BannerForm, BannerToggle } from '@/components/admin/BannerAdmin';

export const dynamic = 'force-dynamic';

const slotLabel: Record<string, string> = {
  home_topo:      'Home — topo',
  home_meio:      'Home — meio',
  busca_lateral:  'Busca — lateral',
  busca_lista:    'Busca — lista',
  imovel_rodape:  'Imóvel — rodapé',
  empresa_pagina: 'Empresa — página',
  blog:           'Blog',
};

export default async function AdminBanners() {
  const banners = await adminListBanners();
  return (
    <div className="space-y-6">
      <BannerForm />

      <ul className="space-y-2">
        {banners.map((b: any) => (
          <li key={b.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex items-center gap-3">
              {b.image_url && (
                <img src={b.image_url} alt={b.title ?? ''} className="h-12 w-20 shrink-0 rounded object-cover" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium">{b.title || '(sem título)'}</p>
                <p className="truncate text-xs text-muted">
                  {slotLabel[b.slot] ?? b.slot}
                  {b.cities ? ` · ${b.cities.name}` : ''}
                  {' · '}{b.impressions} impressões · {b.clicks} cliques
                </p>
                <a href={b.target_url} target="_blank" rel="noreferrer" className="truncate text-xs text-link hover:underline">{b.target_url}</a>
              </div>
            </div>
            <BannerToggle id={b.id} active={b.is_active} />
          </li>
        ))}
        {!banners.length && <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted">Nenhum banner cadastrado.</p>}
      </ul>
    </div>
  );
}
