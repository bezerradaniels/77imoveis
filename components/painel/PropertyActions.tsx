'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, Pause, Pencil, Trash2, Archive, Star } from 'lucide-react';
import { setPropertyStatus, deleteProperty } from '@/app/painel/actions';
import { startListingFeatureCheckout } from '@/app/painel/imoveis/actions';
import { ANALYTICS_EVENTS, trackButtonClick, trackConversion, trackEvent } from '@/lib/analytics';

// Botões de ação de um imóvel no painel (ativar/pausar/arquivar/editar/excluir).
export function PropertyActions({ id, slug, status }: { id: string; slug: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState('');

  const run = (
    fn: () => Promise<{ error?: string }>,
    eventName?: keyof typeof ANALYTICS_EVENTS,
    params?: Record<string, string | number | boolean | null | undefined>,
    afterSuccess?: () => void,
  ) =>
    start(async () => {
      setError('');
      const r = await fn();
      if (r?.error) setError(r.error);
      else {
        if (eventName) trackEvent(ANALYTICS_EVENTS[eventName], { property_status: status, ...params });
        afterSuccess?.();
        router.refresh();
      }
    });

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        {status !== 'ativo' ? (
          <button
            onClick={() => {
              trackButtonClick({ button_id: 'dashboard_property_publish_button', button_text: 'Ativar', button_location: 'dashboard_property_row' });
              run(
                () => setPropertyStatus(id, 'ativo'),
                'dashboardPropertyPublish',
                { new_status: 'ativo' },
                () => trackConversion(ANALYTICS_EVENTS.propertyPublishComplete, { property_status: 'ativo', source_component: 'PropertyActions' }),
              );
            }}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success hover:bg-success/20"
          >
            <Play size={13} /> Ativar
          </button>
        ) : (
          <button
            onClick={() => {
              trackButtonClick({ button_id: 'dashboard_property_unpublish_button', button_text: 'Pausar', button_location: 'dashboard_property_row' });
              run(() => setPropertyStatus(id, 'pausado'), 'dashboardPropertyUnpublish', { new_status: 'pausado' });
            }}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md bg-warning/10 px-2 py-1 text-xs font-medium text-warning hover:bg-warning/20"
          >
            <Pause size={13} /> Pausar
          </button>
        )}
        <Link
          href={`/painel/imoveis/${id}`}
          onClick={() => trackButtonClick({ button_id: 'dashboard_property_edit_button', button_text: 'Editar', button_location: 'dashboard_property_row' })}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-bg"
        >
          <Pencil size={13} /> Editar
        </Link>
        {status === 'ativo' && (
          <form action={startListingFeatureCheckout}>
            <input type="hidden" name="propertyId" value={id} />
            <input type="hidden" name="productSlug" value="destaque_7" />
            <button
              type="submit"
              onClick={() => trackButtonClick({ button_id: 'dashboard_property_feature_button', button_text: 'Destacar', button_location: 'dashboard_property_row' })}
              className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
            >
              <Star size={13} /> Destacar
            </button>
          </form>
        )}
        {status !== 'arquivado' && (
          <button
            onClick={() => {
              trackButtonClick({ button_id: 'dashboard_property_archive_button', button_text: 'Arquivar', button_location: 'dashboard_property_row' });
              run(() => setPropertyStatus(id, 'arquivado'), 'propertyStatusChange', { new_status: 'arquivado' });
            }}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-bg"
          >
            <Archive size={13} /> Arquivar
          </button>
        )}
        <button
          onClick={() => {
            if (confirm('Remover este anúncio? Ele sairá do site público, mas os dados históricos serão preservados.'))
              {
                trackButtonClick({ button_id: 'dashboard_property_delete_button', button_text: 'Remover', button_location: 'dashboard_property_row' });
                run(() => deleteProperty(id), 'propertyDeleteComplete', { new_status: 'arquivado' });
              }
          }}
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-danger hover:bg-danger/10"
        >
          <Trash2 size={13} /> Remover
        </button>
      </div>
      {error && (
        <div className="max-w-xs text-right text-xs">
          <p className="text-danger">{error}</p>
          {error.includes('perfil profissional') && (
            <Link href="/painel/empresa" className="font-medium text-link">
              Criar perfil profissional
            </Link>
          )}
          {error.includes('plano profissional') && (
            <Link href="/painel/planos" className="font-medium text-link">
              Ver planos
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
