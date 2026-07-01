# GA4 Analytics Implementation Report

## Current Analytics Status

- GA4/GTM nao existiam no projeto antes desta implementacao.
- Nao havia `gtag`, `dataLayer`, scripts GA/GTM no layout, nem page views do App Router.
- Existia apenas tracking interno de cliques de contato em `lib/leads.ts`; ele continua preservado.
- Page views agora disparam em mudancas de rota via App Router.
- Para evitar duplicidade, use GTM ou GA4 direto. Se `NEXT_PUBLIC_GTM_ID` existir, os eventos vao para `dataLayer`; caso contrario, usam `gtag`.

## Implemented Tracking Architecture

- `lib/analytics.ts`: mapa central de eventos, sanitizacao de parametros, `trackEvent`, `trackButtonClick`, `trackCtaClick`, `trackConversion`.
- `components/analytics/AnalyticsProvider.tsx`: carrega GTM/GA4 e rastreia page views.
- `components/analytics/TrackEventOnMount.tsx`: eventos de visualizacao de paginas importantes.
- `components/analytics/TrackedLink.tsx` e `TrackedExternalLink.tsx`: cliques padronizados em CTAs/links.
- Tracking fica ativo em producao ou quando `NEXT_PUBLIC_ANALYTICS_DEBUG=true`.

## Conversion Events

| Evento | Trigger | Conversao | Parametros principais | Status |
| --- | --- | --- | --- | --- |
| `sign_up` | Conta criada sem erro no Supabase Auth | Primaria | `method`, `form_name`, `page_path` | Implementado |
| `login` | Login concluido sem erro | Secundaria/opcional | `method`, `form_name`, `page_path` | Implementado |
| `property_create_complete` | Primeiro save/publicacao do anuncio no banco | Primaria | `user_role`, `property_type`, `city`, `state`, `negotiation`, `property_status`, `photo_count` | Implementado |
| `property_publish_complete` | Publicacao/ativacao concluida | Secundaria | `property_status`, `source_component` | Implementado |
| `lead_generate` | Formulario de lead enviado com sucesso | Primaria | `form_name`, `property_slug`, `success` | Implementado |
| `contact_whatsapp_click` | Clique em WhatsApp de imovel/empresa | Primaria | `channel`, `property_slug` ou `company_slug`, `source_component` | Implementado |
| `phone_click` | Clique em telefone do imovel | Secundaria | `channel`, `property_slug` | Implementado |

## User Journey Events

| Evento | Onde dispara | Status |
| --- | --- | --- |
| `page_view` | Todas as rotas client-side | Implementado |
| `sign_up_start` | Submit do cadastro | Implementado |
| `login_start` | Submit do login | Implementado |
| `search_performed` | Busca do hero/home/mobile sheet | Implementado |
| `filter_applied` | Filtros da listagem | Implementado |
| `property_view` | Pagina publica do imovel | Implementado |
| `company_view` | Pagina publica da empresa | Implementado |
| `broker_view` | Pagina publica de corretor autonomo | Implementado |
| `contact_attempt` | Formulario, WhatsApp, telefone | Implementado |
| `property_create_start` | Abertura do formulario de novo anuncio | Implementado |
| `property_create_step_view` | Visualizacao de etapa do formulario | Implementado |
| `property_create_step_complete` | Avanco valido de etapa | Implementado |
| `property_create_validation_error` | Erro de validacao em etapa | Implementado |
| `property_create_submit` | Tentativa de salvar/publicar | Implementado |
| `dashboard_view` | Home do painel | Implementado |
| `admin_view` | Home do admin | Implementado |

## Dashboard Events

| Evento | Trigger | Status |
| --- | --- | --- |
| `profile_update` | Perfil salvo com sucesso | Implementado |
| `company_profile_update` | Perfil profissional salvo com sucesso | Implementado |
| `property_edit_start` | Abertura do formulario de edicao | Implementado |
| `property_edit_complete` | Edicao salva com sucesso | Implementado |
| `property_delete_complete` | Remocao/arquivamento concluido no painel | Implementado |
| `property_status_change` | Arquivamento/status alterado | Implementado |
| `dashboard_property_publish` | Imovel ativado/publicado | Implementado |
| `dashboard_property_unpublish` | Imovel pausado | Implementado |
| `dashboard_photo_upload` | Upload de foto de imovel/perfil | Implementado |
| `dashboard_photo_delete` | Remocao de foto no formulario de imovel | Implementado |

## Admin Events

| Evento | Trigger | Status |
| --- | --- | --- |
| `admin_user_edit` | Alteracao de papel/dados/reativacao | Implementado |
| `admin_user_delete` | Desativacao de usuario | Implementado |
| `admin_company_edit` | Verificar/destacar/salvar empresa | Implementado |
| `admin_company_delete` | Remover empresa | Implementado |
| `admin_broker_edit` | Aprovar/reprovar/salvar corretor | Implementado |
| `admin_broker_delete` | Remover corretor | Implementado |
| `admin_property_edit` | Aprovar/pausar/reprovar/destacar imovel | Implementado |
| `admin_property_delete` | Remover imovel | Implementado |

## Button Click Events

Evento padrao: `button_click`.

Locais implementados: header, login/cadastro, busca do hero, mobile bottom bar, filtros, contatos de imovel, formulario de lead, contato mobile, perfil, empresa, formulario de imovel, acoes do painel e acoes admin.

Parametros usados: `button_id`, `button_text`, `button_location`, `section`, `destination_url`, `page_path`, `page_title`.

## Event Parameters

Parametros padrao usados quando disponiveis: `page_path`, `page_title`, `section`, `user_role`, `property_type`, `property_status`, `city`, `state`, `form_name`, `step_name`, `step_number`, `success`, `error_type`, `source_component`, `channel`.

Nao enviar: email, telefone, WhatsApp, nome, CPF/CNPJ, endereco, CEP, IDs internos de usuario/empresa/imovel/corretor.

## GA4 Conversions to Configure Manually

Marcar como conversoes primarias no GA4:

- `sign_up`
- `property_create_complete`
- `lead_generate`
- `contact_whatsapp_click`

Conversoes secundarias/opcionais:

- `login`
- `phone_click`
- `email_click` (reservado)
- `property_publish_complete`

## Privacy and PII Protection

- Eventos nao incluem email, telefone, WhatsApp, nomes, CPF/CNPJ ou endereco.
- `cleanAnalyticsParams` remove chaves sensiveis conhecidas antes de enviar.
- Dados de contato continuam sendo usados apenas para a operacao do app/Supabase, nao para GA4.

## Testing Checklist

1. Definir `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...` ou `NEXT_PUBLIC_GTM_ID=GTM-...`.
2. Em ambiente local, definir `NEXT_PUBLIC_ANALYTICS_DEBUG=true`.
3. Rodar `npm run dev`.
4. Abrir GA4 DebugView ou Tag Assistant.
5. Navegar entre paginas e confirmar um `page_view` por rota.
6. Testar cadastro/login com sucesso.
7. Testar busca, filtros e pagina de imovel.
8. Enviar lead e clicar WhatsApp/telefone.
9. Criar, salvar, publicar, pausar e remover um anuncio.
10. Testar acoes admin principais.
11. Conferir que nenhum evento leva PII.

## Remaining Recommendations

- Criar eventos customizados/conversoes no GA4 depois do deploy.
- Se usar GTM, configurar tags GA4 Event lendo os eventos de `dataLayer`.
- Definir naming de audiencias/funis: busca -> imovel -> contato, cadastro -> anuncio -> publicacao, admin/moderacao.
- Adicionar `email_click` quando houver CTAs `mailto:` publicos.
