# Mapeamento de eventos — GTM e GA4

Atualizado em 31/07/2026.

Este documento organiza os eventos do portal 77Imóveis e das landing pages. O nome técnico permanece em inglês e `snake_case` para estabilidade da implementação; o nome amigável em português deve ser usado para identificar tags, acionadores, relatórios e conversões.

## Identificadores

- Contêiner GTM: `GTM-T72Z5ZBB`
- Propriedade GA4: `G-ZWT0D48ZYT`
- JSON para importação: [`docs/gtm/77imoveis-eventos-gtm.json`](./gtm/77imoveis-eventos-gtm.json)
- Origem dos eventos do portal: `lib/analytics.ts`
- Origem dos eventos das LPs: `dataLayer.push(...)` nos arquivos `lps/*/index.html`

## Convenção de nomes no GTM

| Recurso | Padrão | Exemplo |
| --- | --- | --- |
| Tag | `GA4 — [nome amigável]` | `GA4 — Contatos e leads` |
| Acionador | `EV — [grupo amigável]` | `EV — Cadastro e acesso` |
| Variável da camada de dados | `DLV — [nome amigável]` | `DLV — Nome da landing page` |
| Pasta | `77Imóveis — Eventos` | Agrupa todos os recursos importados |

## Eventos de aquisição e navegação

| Nome amigável | Evento no `dataLayer` / GA4 | Quando dispara | Parâmetros principais | Uso recomendado |
| --- | --- | --- | --- | --- |
| Visita de página | `page_view` | Abertura de página e mudança de rota no portal | `page_path`, `page_title` | Relatório; não usar como conversão |
| Clique no CTA da landing page | `lp_cta_click` | Clique em CTA principal ou secundário das sete LPs | `cta_name`, `cta_location`, `landing_page`, `destination_url` | Microconversão |
| Clique em chamada principal | `cta_click` | Clique em CTA instrumentado no portal | `button_id`, `cta_text`, `cta_location`, `destination_url` | Microconversão |
| Clique em botão | `button_click` | Clique em botão instrumentado no portal | `button_id`, `button_text`, `button_location`, `section`, `destination_url` | Diagnóstico de interação |

## Eventos de cadastro e acesso

| Nome amigável | Evento | Quando dispara | Parâmetros principais | Prioridade |
| --- | --- | --- | --- | --- |
| Início do cadastro | `sign_up_start` | Envio inicial do formulário de cadastro | `form_name`, `page_path` | Etapa de funil |
| Cadastro concluído | `sign_up` | Conta criada sem erro | `method`, `form_name`, `conversion` | **Conversão principal** |
| Tentativa de login | `login_start` | Envio do formulário de login | `form_name` | Diagnóstico |
| Login concluído | `login` | Autenticação concluída | `method`, `form_name`, `conversion` | Conversão secundária |
| Saída da conta | `logout` | Clique em sair | `page_path` | Diagnóstico |

## Eventos de busca e descoberta

| Nome amigável | Evento | Quando dispara | Parâmetros principais | Uso recomendado |
| --- | --- | --- | --- | --- |
| Busca realizada | `search_performed` | Busca pelo hero ou painel móvel | `search_type`, `section`, `city`, `property_type`, `negotiation`, `bedrooms`, `has_neighborhood` | Funil de procura |
| Filtro aplicado | `filter_applied` | Aplicação, remoção ou limpeza de filtros | `filter_name`, `filter_value`, `active_filters`, `section` | Otimização da busca |
| Imóvel visualizado | `property_view` | Abertura da página de um imóvel | `property_slug`, `property_type`, `city`, `state`, `property_status`, `bedrooms` | Funil de procura |
| Empresa visualizada | `company_view` | Abertura do perfil de imobiliária | `company_slug`, `company_type` | Funil de confiança |
| Corretor visualizado | `broker_view` | Abertura do perfil de corretor autônomo | `company_slug`, `company_type` | Funil de confiança |

## Eventos de contato e geração de lead

| Nome amigável | Evento no `dataLayer` | Evento enviado ao GA4 | Quando dispara | Parâmetros principais | Prioridade |
| --- | --- | --- | --- | --- | --- |
| Tentativa de contato | `contact_attempt` | `contact_attempt` | Início de contato por formulário, WhatsApp ou telefone | `channel`, `form_name`, `property_slug`, `company_slug`, `source_component` | Etapa de funil |
| Lead enviado | `lead_generate` | `generate_lead` | Formulário de interesse enviado com sucesso | `form_name`, `property_slug`, `success`, `conversion` | **Conversão principal** |
| Clique no WhatsApp | `contact_whatsapp_click` | `contact_whatsapp_click` | Clique em WhatsApp de imóvel ou empresa | `channel`, `property_slug`, `company_slug`, `source_component`, `conversion` | **Conversão principal** |
| Clique no telefone | `phone_click` | `phone_click` | Clique no telefone de um imóvel | `channel`, `property_slug`, `source_component`, `conversion` | Conversão secundária |
| Clique no e-mail | `email_click` | `email_click` | Reservado para futuros links públicos de e-mail | `source_component`, `conversion` | Conversão secundária; ainda não disparado |

`generate_lead` é o nome recomendado pelo GA4. O portal mantém `lead_generate` no `dataLayer` por compatibilidade, e a tag do GTM faz a tradução antes do envio ao GA4.

## Eventos de cadastro e gestão de imóveis

| Nome amigável | Evento | Quando dispara | Parâmetros principais | Prioridade |
| --- | --- | --- | --- | --- |
| Início do anúncio | `property_create_start` | Abertura do formulário de novo anúncio | `user_role`, `step_name`, `step_number` | Etapa de funil |
| Etapa do anúncio visualizada | `property_create_step_view` | Exibição de uma etapa do formulário | `step_name`, `step_number`, `form_mode` | Diagnóstico |
| Etapa do anúncio concluída | `property_create_step_complete` | Avanço após validação da etapa | `step_name`, `step_number`, `form_mode` | Etapa de funil |
| Erro no cadastro do imóvel | `property_create_validation_error` | Falha de validação em uma etapa | `step_name`, `step_number`, `error_type` | Diagnóstico |
| Anúncio enviado | `property_create_submit` | Tentativa de salvar ou publicar | `form_mode`, `publish`, `property_type`, `city`, `state` | Etapa de funil |
| Imóvel cadastrado | `property_create_complete` | Primeiro salvamento concluído no banco | `user_role`, `property_type`, `city`, `state`, `negotiation`, `property_status`, `photo_count`, `conversion` | **Conversão principal** |
| Imóvel publicado | `property_publish_complete` | Publicação ou ativação concluída | `property_status`, `source_component`, `conversion` | Conversão secundária |
| Início da edição | `property_edit_start` | Abertura do formulário de edição | `property_type`, `city`, `state`, `step_name` | Diagnóstico |
| Edição concluída | `property_edit_complete` | Alterações salvas com sucesso | `property_type`, `property_status`, `photo_count` | Resultado operacional |
| Imóvel removido | `property_delete_complete` | Remoção ou arquivamento concluído | `property_status`, `source_component` | Resultado operacional |
| Status do imóvel alterado | `property_status_change` | Mudança de status do anúncio | `property_status`, `new_status`, `source_component` | Resultado operacional |

## Eventos de painel e perfil

| Nome amigável | Evento | Quando dispara | Parâmetros principais | Uso recomendado |
| --- | --- | --- | --- | --- |
| Painel visualizado | `dashboard_view` | Abertura da página inicial do painel | `user_role`, `section` | Engajamento do anunciante |
| Perfil atualizado | `profile_update` | Perfil pessoal salvo | `section`, `source_component`, `success` | Ativação |
| Perfil profissional atualizado | `company_profile_update` | Empresa/corretor salvo | `company_type`, `form_mode`, `section`, `success` | Ativação |
| Imóvel ativado pelo painel | `dashboard_property_publish` | Ativação ou publicação no painel | `property_status`, `new_status`, `source_component` | Operacional |
| Imóvel pausado pelo painel | `dashboard_property_unpublish` | Pausa do anúncio | `property_status`, `new_status`, `source_component` | Operacional |
| Foto enviada | `dashboard_photo_upload` | Upload de foto de imóvel ou perfil | `section`, `photo_count`, `success`, `source_component` | Diagnóstico |
| Foto removida | `dashboard_photo_delete` | Remoção de foto no formulário | `section`, `photo_count`, `source_component` | Diagnóstico |

## Eventos administrativos

| Nome amigável | Evento | Quando dispara | Uso recomendado |
| --- | --- | --- | --- |
| Administração visualizada | `admin_view` | Abertura da área administrativa | Uso interno |
| Usuário alterado | `admin_user_edit` | Alteração de função, dados ou reativação | Auditoria agregada |
| Usuário desativado | `admin_user_delete` | Desativação de usuário | Auditoria agregada |
| Empresa alterada | `admin_company_edit` | Verificação, destaque ou edição de empresa | Auditoria agregada |
| Empresa removida | `admin_company_delete` | Remoção de empresa | Auditoria agregada |
| Corretor alterado | `admin_broker_edit` | Aprovação, reprovação ou edição de corretor | Auditoria agregada |
| Corretor removido | `admin_broker_delete` | Remoção de corretor | Auditoria agregada |
| Imóvel moderado | `admin_property_edit` | Aprovação, pausa, reprovação ou destaque | Auditoria agregada |
| Imóvel removido pela administração | `admin_property_delete` | Remoção administrativa do imóvel | Auditoria agregada |

Os eventos administrativos não devem ser marcados como conversão nem usados para otimização de mídia.

## Conversões e funis recomendados

### Campanha para captar anunciantes

1. `page_view`
2. `lp_cta_click`
3. `sign_up_start`
4. `sign_up` — conversão principal inicial
5. `property_create_start`
6. `property_create_complete` — conversão principal qualificada
7. `property_publish_complete` — conversão secundária

### Jornada de quem procura imóvel

1. `page_view`
2. `search_performed`
3. `filter_applied`
4. `property_view`
5. `contact_attempt`
6. `generate_lead`, `contact_whatsapp_click` ou `phone_click`

## Parâmetros permitidos

Parâmetros de contexto que podem ser enviados quando existirem:

`page_path`, `page_title`, `section`, `source_component`, `user_role`, `method`, `form_name`, `form_mode`, `step_name`, `step_number`, `success`, `error_type`, `property_slug`, `property_type`, `property_status`, `new_status`, `city`, `state`, `negotiation`, `bedrooms`, `has_neighborhood`, `company_slug`, `company_type`, `channel`, `search_type`, `filter_name`, `filter_value`, `active_filters`, `button_id`, `button_text`, `button_location`, `cta_name`, `cta_text`, `cta_location`, `landing_page`, `destination_url`, `photo_count`, `publish`, `action_type`, `active`, `verified`, `featured` e `conversion`.

Nunca enviar e-mail, telefone, WhatsApp, nome, CPF/CNPJ, endereço, CEP ou IDs internos de usuário, empresa, corretor ou imóvel.

## Importação rápida no GTM

1. Abra o contêiner `GTM-T72Z5ZBB`.
2. Acesse **Administrador → Importar contêiner**.
3. Selecione `docs/gtm/77imoveis-eventos-gtm.json`.
4. Escolha o espaço de trabalho desejado.
5. Selecione **Mesclar**, nunca **Substituir**.
6. Em conflito, escolha **Renomear** para preservar os recursos existentes.
7. Confirme que a tag Google existente usa `G-ZWT0D48ZYT`.
8. Use o modo **Visualizar** e valide todos os eventos antes de publicar.

O JSON cria 1 pasta, 43 variáveis da camada de dados, 46 acionadores e 46 tags GA4 — uma dupla acionador/tag por evento, o que evita mistura de parâmetros. A tag `GA4 — Visita de página SPA` é importada **pausada** para impedir duplicidade. Ative-a apenas depois de desabilitar o envio automático de `page_view` na Google tag existente e validar um único evento por navegação.

## Eventos principais para marcar no GA4

Marcar como eventos principais:

- `sign_up`
- `property_create_complete`
- `generate_lead`
- `contact_whatsapp_click`

Opcionais, conforme a campanha:

- `property_publish_complete`
- `phone_click`
- `login`

Não usar `page_view`, `lp_cta_click`, `button_click`, eventos de etapa ou eventos administrativos como conversão principal de campanha.
