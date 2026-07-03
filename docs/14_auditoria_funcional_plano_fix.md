# 77 Imoveis - Auditoria funcional e plano de fix

Data da auditoria: 2026-07-02  
Escopo: navegacao publica, auth sem sessao, painel/admin por revisao de codigo, integracao Supabase, pagamentos Asaas, persistencia e riscos de falso sucesso.

## Resumo executivo

O portal esta saudavel na experiencia publica principal. O build de producao passou, a checagem de tipos passou apos o build recriar os tipos do Next em `.next/types`, e o smoke test local em desktop e mobile nao encontrou scroll horizontal, requests quebradas ou crashes nas principais rotas publicas.

Os maiores riscos estao nas mutacoes de painel, admin, empresa/corretores e pagamentos. Existem acoes que fazem `update`, `delete` ou sequencias `delete + insert` sem confirmar que linhas foram afetadas e sem tratar erro em todas as etapas. Isso pode causar o problema mais perigoso para o produto: a interface aparenta sucesso, mas a mudanca nao foi persistida integralmente no banco.

Tambem houve um bloqueio importante na auditoria remota do Supabase: o MCP conectado nesta sessao nao parece ser o projeto do 77 Imoveis. Ele retornou tabelas e logs de outro app (`stores`, `products`, `orders`, `zapia.app`) em vez de `properties`, `companies`, `brokers`, etc. Por isso, os advisors/logs remotos nao devem ser considerados validacao do banco do 77 Imoveis ate a configuracao ser corrigida.

## Verificacoes executadas

- `npm run build`: passou.
- `npm run typecheck`: passou apos o build.
- Smoke test local com Chromium headless:
  - `/`
  - `/imoveis`
  - `/guanambi`
  - `/guanambi/casas`
  - `/imovel/slug-inexistente-audit`
  - `/entrar`
  - `/cadastro`
  - `/painel`
  - `/admin`
  - `/contato`
  - `/planos-e-precos`
  - `/vitrine`
- Viewports testados:
  - Desktop: `1366x900`
  - Mobile: `390x844`
- Login invalido testado:
  - O formulario exibiu `E-mail ou senha invalidos.`
  - O request do Supabase retornou `400`, esperado para credenciais invalidas.
- Rotas protegidas sem sessao:
  - `/painel` redirecionou para `/entrar?next=%2Fpainel`
  - `/admin` redirecionou para `/entrar?next=%2Fadmin`

## Limitacoes da auditoria

1. Nao foi possivel validar persistencia diretamente no Supabase correto porque o MCP conectado retornou dados de outro projeto.
2. Fluxos autenticados completos, como criar anuncio, editar anuncio, salvar empresa, gerenciar corretores e admin real, foram auditados por codigo e nao por sessao real com usuarios de teste.
3. Fluxos destrutivos nao foram executados contra o banco remoto para evitar alteracao acidental de dados.

## Achados criticos

### 1. Supabase MCP aponta para outro projeto

Status: Critico  
Area: Supabase, RLS, logs, advisors, verificacao de persistencia  
Arquivos envolvidos: configuracao MCP/ambiente, nao identificado no repo

Comportamento esperado: as ferramentas Supabase devem listar tabelas do 77 Imoveis, como `properties`, `companies`, `brokers`, `leads`, `plans`, `subscriptions`.

Comportamento atual: as ferramentas retornaram tabelas como `stores`, `products`, `orders`, `seller_catalogs` e logs de `zapia.app`.

Impacto: qualquer auditoria remota de RLS, advisors, logs e persistencia fica invalida.

Causa provavel: MCP autenticado/conectado ao projeto Supabase errado.

Fix recomendado:

1. Reautenticar o MCP Supabase no projeto correto.
2. Confirmar `project_ref` e URL do projeto.
3. Rodar `list_tables` e verificar a presenca das tabelas do 77 Imoveis.
4. Rodar advisors de seguranca/performance no projeto correto.
5. So depois validar RLS e persistencia.

Testes:

- `list_tables` deve retornar `properties`, `property_images`, `companies`, `brokers`, `leads`.
- `get_logs` deve mostrar requests do dominio do 77 Imoveis.
- Advisors devem refletir as migrations em `/database`.

### 2. Salvar empresa pode retornar sucesso com dados relacionais nao salvos

Status: Critico  
Fluxo: painel empresa, onboarding profissional, edicao de perfil profissional  
Arquivo: `app/painel/empresa/actions.ts`

Trechos:

- `company_cities`: linhas 101-104
- `company_specialties`: linhas 106-111
- `brokers`: linhas 113-128
- `profiles`: linhas 131-137

Comportamento esperado: salvar empresa deve persistir empresa, cidades de atuacao, especialidades, corretores e atualizacao do perfil; se qualquer etapa falhar, a UI deve mostrar erro e nao sugerir sucesso.

Comportamento atual: varias etapas executam `delete`, `insert` e `update` sem capturar `{ error }`.

Risco: a empresa pode ser salva parcialmente. Exemplo: empresa atualizada, mas especialidades/corretores nao salvos; usuario acredita que finalizou o cadastro.

Causa raiz: fluxo multi-etapa sem transacao e sem checagem de erro em todas as queries.

Fix recomendado:

1. Curto prazo: capturar `{ error }` em cada `delete`, `insert` e `update`.
2. Retornar mensagem especifica quando uma relacao falhar.
3. Medio prazo: criar RPC transacional no Postgres para salvar empresa + relacoes.
4. Rodar advisor Supabase apos criar RPC/migration.

Testes:

- Criar empresa com cidades e especialidades.
- Editar empresa removendo e adicionando especialidades.
- Simular falha em `company_specialties` e confirmar que a UI mostra erro.
- Recarregar `/painel/empresa` e confirmar persistencia.
- Abrir `/empresa/[slug]` e confirmar dados publicos.

### 3. Gerenciar corretores pode apagar a equipe antes de falhar ao recriar

Status: Critico  
Fluxo: painel corretores/equipe  
Arquivo: `app/painel/corretores/actions.ts`

Trecho: linhas 27-41

Comportamento esperado: substituir equipe deve ser atomico. Ou a nova equipe inteira e salva, ou a equipe anterior permanece.

Comportamento atual: a action apaga todos os corretores com `delete` e so verifica erro no `insert`.

Risco: uma falha no `insert` deixa a imobiliaria sem corretores cadastrados.

Causa raiz: estrategia `delete + insert` sem transacao.

Fix recomendado:

1. Capturar erro do `delete`.
2. Criar RPC `replace_company_brokers` com transacao.
3. Validar permissao no banco: empresa pertence ao usuario ou usuario e admin/moderador.

Testes:

- Salvar equipe com 2 corretores.
- Editar para 3 corretores e recarregar.
- Simular erro no insert e confirmar que a lista antiga permanece.
- Validar que usuario nao altera equipe de outra empresa.

## Achados de alta prioridade

### 4. Admin: acoes principais nao confirmam linhas afetadas

Status: Alta prioridade  
Area: admin imoveis, usuarios, banners, vitrines  
Arquivo: `app/admin/actions.ts`

Trechos:

- `adminSetPropertyStatus`: linha 70
- `adminTogglePropertyFeatured`: linha 80
- `adminSetUserRole`: linha 149
- `adminUpdateUser`: linha 166
- `adminDeleteProperty`: linhas 283-286
- `adminToggleBanner`: linha 371
- `adminDeleteBanner`: linha 379
- `adminCreateBanner`: linha 393
- `adminToggleStorefront`: linha 407

Comportamento esperado: uma action admin so deve retornar `{ ok: true }` se o banco confirmar que a linha foi alterada/criada/removida.

Comportamento atual: varias actions checam apenas `error`. No Supabase/PostgREST, um update que afeta 0 linhas pode nao retornar erro.

Risco: falso sucesso em remocao de imovel, destaque, papel de usuario, banner ou vitrine.

Fix recomendado:

1. Padronizar mutacoes admin com `.select('id')`.
2. Para updates/deletes por id, usar `.maybeSingle()` e retornar erro se `!data`.
3. Revalidar paginas somente depois de confirmar sucesso, ou manter revalidacao tambem em erro quando houver motivo claro.
4. Criar helper local para reduzir repeticao:

```ts
async function requireUpdated<T>(query: PromiseLike<{ data: T | null; error: any }>, emptyMessage: string) {
  const { data, error } = await query;
  if (error) return { error: error.message };
  if (!data) return { error: emptyMessage };
  return { data };
}
```

Testes:

- Chamar action com id inexistente e confirmar erro.
- Remover imovel pelo admin e recarregar `/admin/imoveis`, `/imoveis`, `/imovel/[slug]`.
- Alterar destaque e confirmar persistencia depois de refresh.
- Bloquear/desbloquear usuario e confirmar filtro admin.

### 5. Painel: alterar status de imovel pode retornar falso sucesso

Status: Alta prioridade  
Fluxo: painel imoveis, ativar/pausar/arquivar  
Arquivo: `app/painel/actions.ts`

Trecho: linha 319

Comportamento esperado: `setPropertyStatus` deve confirmar que o imovel pertence ao usuario e foi atualizado.

Comportamento atual: a action checa apenas `error`, diferente de `deleteProperty`, que ja usa `.select('id')`.

Risco: se RLS bloquear ou o id nao existir, o painel pode mostrar sucesso.

Fix recomendado:

1. Alterar para:

```ts
const { data, error } = await sb
  .from('properties')
  .update(patch)
  .eq('id', id)
  .select('id')
  .maybeSingle();

if (error || !data) return { error: 'Nao foi possivel atualizar o anuncio.' };
```

2. Revalidar apos sucesso.

Testes:

- Ativar imovel proprio.
- Tentar ativar id inexistente.
- Tentar ativar imovel de outro usuario.
- Confirmar refresh em `/painel/imoveis` e pagina publica.

### 6. Checkout e webhook Asaas ignoram erros de persistencia

Status: Alta prioridade  
Fluxos: planos, destaque de imovel, webhook de pagamento  
Arquivos:

- `app/painel/planos/actions.ts`
- `app/painel/imoveis/actions.ts`
- `app/api/webhooks/asaas/route.ts`

Problemas:

- `startPlanCheckout` cria customer, subscription e payments sem checar todos os erros.
- `startListingFeatureCheckout` tambem depende de inserts/updates sem tratamento robusto.
- Webhook atualiza payment/subscription/listing_feature/properties sem validar erro em cada etapa.
- Webhook marca evento como `processed_at` mesmo se regras de negocio falharem silenciosamente.

Impacto:

- Pagamento pode existir no Asaas, mas assinatura local nao ficar correta.
- Destaque pode ser pago e nao ativar.
- Evento pode ser marcado como processado sem aplicar negocio.

Fix recomendado:

1. Checar `error` em cada insert/update.
2. Encapsular regras do webhook em fluxo que retorna `{ ok, error }`.
3. Marcar `processed_at` apenas quando tudo necessario passar.
4. Registrar falhas em coluna propria, se existir, ou criar `processing_error`.
5. Garantir idempotencia por `event_id` e por `gateway_payment_id`.

Testes:

- Webhook `PAYMENT_RECEIVED` para plano.
- Webhook duplicado.
- Webhook de destaque pago.
- Webhook com payload invalido.
- Falha simulada no update de `listing_features`.

## Achados de media prioridade

### 7. Campo senha tem label ambiguo com o botao mostrar senha

Status: Media  
Fluxos: login e cadastro  
Arquivos:

- `components/auth/LoginForm.tsx`, linhas 49-63
- `components/auth/SignupForm.tsx`, linhas 113-127

Comportamento atual: o campo de senha e o botao `Mostrar senha` ficam dentro do mesmo `Field label="Senha"`. Em teste de acessibilidade, `getByLabel('Senha')` encontrou tanto input quanto botao.

Impacto: leitores de tela e testes automatizados podem ter ambiguidade.

Fix recomendado:

1. Garantir `id` unico no input.
2. Usar `htmlFor` no label.
3. Manter o botao com `aria-label`, mas fora da associacao do label.

Testes:

- `getByLabel('Senha')` deve resolver apenas o input.
- Botao `Mostrar senha` deve continuar acessivel por role/name.

### 8. Pagina de imovel inexistente funciona, mas gera warning no console

Status: Media  
Fluxo: `/imovel/[slug]` inexistente  
Comportamento atual: exibe pagina amigavel de nao encontrado, mas o console mostra warning do Next sobre fallback de parallel route.

Impacto: nao quebra usuario final, mas polui auditoria de console e pode mascarar warnings reais.

Fix recomendado:

1. Revisar estrutura de `not-found.tsx` e route groups.
2. Verificar se ha necessidade de `default.tsx` em algum parallel route caso exista.

Testes:

- Acessar `/imovel/slug-inexistente`.
- Confirmar status/UX e ausencia de warning inesperado.

## Achados de baixa prioridade

### 9. Warnings de `<img>` no build

Status: Baixa  
Arquivos apontados pelo build:

- `app/admin/banners/page.tsx`
- `components/admin/BannerAdmin.tsx`
- `components/painel/ProfileForm.tsx`
- `components/painel/PropertyForm.tsx`
- `components/painel/StorefrontForm.tsx`
- `components/painel/company/sections.tsx`

Impacto: performance/LCP e otimizacao de imagens, nao funcionalidade imediata.

Fix recomendado:

1. Trocar por `next/image` onde houver dimensoes conhecidas.
2. Manter `<img>` apenas quando houver motivo claro e comentario/local exception.

## Resultados por fluxo

| Fluxo | Status | Evidencia | Risco principal |
|---|---|---|---|
| Home publica | OK | 200 desktop/mobile, sem scroll horizontal | Baixo |
| Listagem `/imoveis` | OK com empty state | 200, filtros aparecem | Depende de dados reais |
| Cidade `/guanambi` | OK com empty state | 200, SEO e filtros aparecem | Depende de dados reais |
| Tipo `/guanambi/casas` | OK com empty state | 200, titulo correto | Depende de dados reais |
| Imovel inexistente | Parcial | Pagina amigavel, warning no console | Baixo/medio |
| Login invalido | OK | Mensagem exibida | Baixo |
| Cadastro | OK por renderizacao | Form renderiza mobile/desktop | Persistencia nao testada sem criar conta |
| `/painel` sem sessao | OK | Redirect para login | Baixo |
| `/admin` sem sessao | OK | Redirect para login | Baixo |
| Criar/editar imovel | Parcial por codigo | Validacao boa, mas update/status sem row count | Alto |
| Remover imovel no painel | OK por codigo | Usa `.select('id')` | Baixo |
| Remover imovel admin | Risco | Sem row count | Alto |
| Empresa/corretores | Risco | Multi-step sem transacao | Critico |
| Planos/pagamentos | Risco | Erros internos pouco tratados | Alto |

## Auditoria de botoes

| Area | Botao | Acao esperada | Resultado atual | Status |
|---|---|---|---|---|
| Home mobile | Buscar imoveis | Abrir busca mobile | Abre bottom sheet | OK |
| Home desktop | Buscar imoveis | Navegar para listagem filtrada | Implementado em `HeroSearchForm` | OK por codigo |
| Login | Entrar | Autenticar ou exibir erro | Erro invalido exibido | OK |
| Painel imoveis | Remover | Arquivar e tirar do publico | Confirma linha com `.select` | OK por codigo |
| Painel imoveis | Ativar/Pausar/Arquivar | Alterar status real | Sem confirmar linha afetada | Corrigir |
| Admin imoveis | Aprovar/Pausar/Reprovar | Alterar status real | Sem confirmar linha afetada | Corrigir |
| Admin imoveis | Destacar | Alterar `is_featured` | Sem confirmar linha afetada | Corrigir |
| Admin imoveis | Remover | Arquivar e remover destaque | Sem confirmar linha afetada | Corrigir |
| Admin banners | Ativar/excluir/criar | Persistir mudanca | Sem confirmar linha afetada em parte | Corrigir |
| Admin vitrines | Ativar/expirar | Persistir status | Toggle unitario sem row count | Corrigir |

## Auditoria de formularios

| Formulario | Status | Persistencia verificada | Observacoes |
|---|---|---|---|
| Login | OK | N/A | Erro invalido exibido corretamente |
| Cadastro | Parcial | Nao | Renderiza; precisa teste com conta real |
| Busca home | OK | N/A | Mobile abre sheet; submit interno navega |
| Filtros listagem | OK por codigo | N/A | Escreve filtros na URL |
| Criar/editar imovel | Parcial | Nao | Precisa confirmar row count em updates |
| Empresa | Risco | Nao | Multi-step sem transacao |
| Corretores | Risco | Nao | Delete antes de insert |
| Perfil | Parcial | Nao | Checa erro, mas nao row count |
| Admin usuarios | Risco | Nao | Algumas actions sem row count |
| Planos/checkout | Risco | Nao | Falta tratamento robusto de erros |

## Auditoria Supabase

Pontos positivos:

- Client browser usa anon key.
- `service_role` fica em helper server-side.
- Middleware usa `getUser()` para renovar/proteger sessoes.
- Muitas leituras publicas dependem de RLS e filtro `status = 'ativo'`.
- `deleteProperty` no painel ja evita falso sucesso com `.select('id')`.

Pontos de risco:

- MCP remoto conectado ao projeto errado.
- Mutacoes sem row count podem mascarar RLS bloqueando update.
- Fluxos multi-step sem transacao podem deixar dados parciais.
- Pagamentos/webhooks precisam melhor idempotencia e erro operacional.
- Se forem criadas novas tabelas no Supabase em projetos recentes, verificar exposicao na Data API alem de RLS.

Checklist Supabase para aplicar nos fixes:

1. Confirmar projeto MCP correto.
2. Rodar advisors de seguranca/performance no projeto correto.
3. Para migrations novas, criar arquivo novo em `/database`.
4. Evitar `SECURITY DEFINER` publico sem necessidade.
5. Se usar RPC transacional, revisar grants e RLS.
6. Depois de schema change, rodar `npm run db:types`.

## Auditoria de rotas

| Rota | Resultado |
|---|---|
| `/` | 200 |
| `/imoveis` | 200 |
| `/guanambi` | 200 |
| `/guanambi/casas` | 200 |
| `/imovel/slug-inexistente-audit` | Pagina de nao encontrado amigavel |
| `/entrar` | 200 |
| `/cadastro` | 200 |
| `/painel` sem sessao | Redirect para `/entrar?next=%2Fpainel` |
| `/admin` sem sessao | Redirect para `/entrar?next=%2Fadmin` |
| `/contato` | 200 |
| `/planos-e-precos` | 200 |
| `/vitrine` | 200 |

## Plano de fix recomendado

### Fase 0 - Corrigir auditoria remota

Prioridade: imediata

1. Corrigir MCP Supabase para o projeto 77 Imoveis.
2. Confirmar tabelas reais com `list_tables`.
3. Rodar `get_advisors` de seguranca e performance.
4. Rodar logs de `api`, `auth`, `storage` e `edge-function`.
5. Registrar achados reais do banco em novo anexo ou atualizar este documento.

### Fase 1 - Eliminar falso sucesso em mutacoes

Prioridade: critica

1. Criar padrao/helper para updates que exigem linha afetada.
2. Aplicar em:
   - `app/painel/actions.ts`
   - `app/admin/actions.ts`
   - `app/painel/perfil/actions.ts`
   - actions de banner/vitrine.
3. Reordenar `revalidatePath` para depois de sucesso confirmado.
4. Testar ids inexistentes e sem permissao.

### Fase 2 - Tornar empresa/corretores atomicos

Prioridade: critica

1. Criar RPC transacional para salvar empresa e relacoes.
2. Criar RPC ou estrategia transacional para substituir corretores.
3. Garantir que erro em relacao nao deixa dados parciais.
4. Atualizar types do Supabase se houver schema/RPC nova.
5. Cobrir com teste de regressao.

### Fase 3 - Endurecer pagamentos Asaas

Prioridade: alta

1. Checar erro em todos os inserts/updates.
2. Garantir que assinatura local existe antes de redirecionar para pagamento.
3. No webhook, nao marcar evento como processado se regra de negocio falhar.
4. Adicionar campo de erro operacional em `payment_webhook_events`, se necessario.
5. Testar webhook pago, duplicado, vencido e payload invalido.

### Fase 4 - Acessibilidade e console

Prioridade: media

1. Corrigir associacao de label dos campos senha.
2. Revisar warning de not-found do Next.
3. Trocar `<img>` por `next/image` nos pontos apontados pelo build quando fizer sentido.

### Fase 5 - E2E minimo de regressao

Prioridade: alta

Criar testes Playwright para:

1. Home carrega sem erro.
2. Busca mobile abre sheet e navega.
3. Login invalido mostra erro.
4. Rotas protegidas redirecionam.
5. Criar imovel rascunho.
6. Publicar imovel.
7. Editar imovel e validar refresh.
8. Remover imovel e validar ausencia publica.
9. Salvar empresa com cidades/especialidades.
10. Gerenciar corretores.
11. Admin remover imovel.
12. Webhook Asaas de destaque pago.

## Checklist de regressao manual

### Publico

- [ ] Home carrega desktop/mobile.
- [ ] Busca sem filtros vai para `/imoveis`.
- [ ] Busca por cidade vai para `/${cidade}`.
- [ ] Busca por cidade + tipo vai para `/${cidade}/${tipo}s`.
- [ ] Filtros atualizam URL.
- [ ] Limpar filtros remove query params.
- [ ] Imovel ativo abre em `/imovel/[slug]`.
- [ ] Imovel arquivado nao abre publicamente.
- [ ] WhatsApp abre numero correto.
- [ ] Formulario de lead grava contato.

### Auth

- [ ] Login invalido mostra erro.
- [ ] Login valido redireciona para `next`.
- [ ] Logout limpa sessao.
- [ ] Usuario bloqueado vai para `/entrar?blocked=1`.
- [ ] `/painel` exige login.
- [ ] `/admin` exige login.
- [ ] Usuario nao admin nao acessa admin.

### Painel

- [ ] Criar anuncio salva dados principais.
- [ ] Criar anuncio salva modalidades.
- [ ] Criar anuncio salva caracteristicas.
- [ ] Criar anuncio salva fotos e capa.
- [ ] Publicar anuncio aparece no publico.
- [ ] Editar anuncio persiste apos refresh.
- [ ] Pausar anuncio some do publico.
- [ ] Arquivar/remover anuncio some do publico.
- [ ] Usuario nao edita imovel de outro usuario.

### Empresa e corretores

- [ ] Criar empresa salva dados.
- [ ] Cidades de atuacao persistem.
- [ ] Especialidades persistem.
- [ ] Corretores persistem.
- [ ] Falha em corretor nao apaga equipe antiga.
- [ ] Perfil publico da empresa reflete mudancas.

### Admin

- [ ] Aprovar imovel confirma persistencia.
- [ ] Pausar/reprovar imovel confirma persistencia.
- [ ] Remover imovel nao retorna sucesso com id invalido.
- [ ] Alterar papel de usuario confirma persistencia.
- [ ] Bloquear usuario impede acesso.
- [ ] Atualizar empresa confirma persistencia.
- [ ] Remover empresa tira do publico.
- [ ] Atualizar corretor confirma persistencia.
- [ ] Banner criado/ativado/removido persiste.
- [ ] Vitrine ativada/expirada persiste.

### Pagamentos

- [ ] Checkout de plano cria subscription local.
- [ ] Checkout de destaque cria payment + listing_feature.
- [ ] Webhook pago ativa assinatura.
- [ ] Webhook pago ativa destaque.
- [ ] Webhook duplicado e idempotente.
- [ ] Webhook invalido retorna 400.
- [ ] Token invalido retorna 401.

## Ordem sugerida de implementacao

1. Corrigir MCP Supabase e confirmar banco certo.
2. Corrigir falso sucesso em `setPropertyStatus` e actions admin.
3. Corrigir `saveCompany` e `saveBrokers` com transacao.
4. Corrigir erros ignorados em checkout/webhook.
5. Criar testes de regressao dos fluxos criticos.
6. Fazer ajustes de acessibilidade e warnings.

