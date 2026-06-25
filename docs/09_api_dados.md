# 77Imóveis — Especificação de API / Acesso a Dados

O app usa o **Supabase** (PostgREST + RPC) como API. Não há backend próprio; a segurança vem da **RLS**. Operações sensíveis ficam em **Edge Functions**.

## 1. Leitura pública (build SSG e busca)

| Operação | Como |
|---|---|
| Listar cidades em destaque | `from('cities').select().eq('is_featured',true)` |
| Bairros de uma cidade | `from('neighborhoods').select().eq('city_id',id)` |
| Autocomplete cidade | `from('cities').select('name,slug').ilike('name', '%termo%')` |
| Imóveis da cidade/tipo | `from('properties').select(...).eq('status','ativo')...` |
| Imóvel por slug | `from('properties').select('*, property_images(*), property_features(features(*)), cities(*), neighborhoods(*)').eq('slug',slug).single()` |
| Busca por raio | `rpc('properties_within_radius', { center_lat, center_lng, radius_km })` |
| Empresa por slug | `from('companies').select('*, brokers(*), company_specialties(specialties(*))').eq('slug',slug)` |
| Posts do blog | `from('blog_posts').select().eq('is_published',true)` |

### Parser de filtros (URL → query)
`/{cidade}/{tipo}?quartos=3&banheiros=2&vagas=1&preco_min=&preco_max=&area_min=&caracteristicas=piscina,churrasqueira&disp=a-venda`
→ `lib/search/parseFilters.ts` converte em filtros encadeados do Supabase, com `canonical` controlado.

## 2. Operações autenticadas (painel)

| Operação | Regra (RLS) |
|---|---|
| Criar/editar imóvel | dono (`owner_id = auth.uid()`) |
| Ativar imóvel | trigger valida limite (particular=1; plano=limite) |
| Duplicar imóvel | insert copiando campos (novo slug, status `rascunho`) |
| Pausar/arquivar | update de `status` |
| Upload de foto | signed URL + insert em `property_images` |
| Listar meus contatos | `from('leads').select().eq('owner_id', uid)` |
| Editar empresa | dono da empresa |
| Favoritar | `from('favorites')` (privado do usuário) |

## 3. Criação de lead (pública, anti-spam)

```
POST (Edge Function: create-lead)
  body: { property_id, name, phone, email?, message?, turnstileToken }
  → valida Turnstile + honeypot + rate limit por IP
  → insert em leads (channel='formulario')
  → dispara notificação (e-mail/WhatsApp) ao dono
```
Clique no WhatsApp também registra um lead `channel='whatsapp'` (via Edge Function leve antes do redirect `wa.me`).

## 4. Edge Functions

| Função | Auth | Papel |
|---|---|---|
| `create-lead` | pública | anti-spam + insert + notificação |
| `asaas-webhook` | token | confirma pagamentos/assinaturas |
| `expire-features` | cron | expira destaques vencidos |
| `rebuild-trigger` | service | dispara rebuild SSG ao mudar anúncios |
| `signed-upload` | usuário | gera URL de upload validada |

## 5. Tipos gerados

`npx supabase gen types typescript` → `lib/supabase/types.ts` (tipagem ponta a ponta do banco no front).

## 6. Convenções

- Paginação por `range()` (cursor/offset) nas listagens.
- Datas em UTC; formatação pt-BR no front.
- Moeda sempre `numeric` no banco; máscara R$ no front.
- Slugs gerados com `unaccent` + hífens; únicos por tabela.
