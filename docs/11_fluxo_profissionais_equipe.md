# 77Imóveis — Fluxo de Profissionais e Equipe de Corretores

> Documento de desenho da reformulação do fluxo profissional: conta pessoal → escolha de
> perfil profissional (imobiliária / construtora / corretor autônomo) e gestão de equipe de
> corretores por busca de perfis existentes (sem duplicidade).
>
> **Status:** desenho aprovado; **múltiplas empresas por conta**, cada uma com assinatura própria;
> equipe só avulso; gating por plano.
> **Última atualização:** 2026-06-30.

---

## 1. Objetivo

Reformular o fluxo de cadastro e os dashboards para:

1. Toda pessoa tem uma **conta pessoal** (perfil de usuário).
2. A partir dela, a pessoa pode **criar uma ou mais empresas** (`imobiliaria`, `construtora` e/ou `incorporadora`) **ou** criar um **perfil de corretor autônomo**.
3. **Cada empresa tem a sua própria assinatura** (independente das demais). Uma conta pode, portanto, ter várias empresas e várias assinaturas.
4. **Gating por plano:** corretor autônomo tem **1 imóvel ativo grátis**; para anunciar **mais de 1**, precisa assinar um **plano profissional de corretor autônomo**.
5. **Remover** a criação de outros tipos de prestador (financiadora, escritório, etc.).
6. A **imobiliária monta sua equipe apenas de forma avulsa** (texto livre). **A busca por corretores já cadastrados fica desativada** nesta fase.
7. Rever os **dashboards** por papel, incluindo **troca de empresa ativa** quando a conta tem mais de uma.

---

## 2. Decisões estruturais (aprovadas)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Empresas por conta | **Múltiplas** — uma conta pode ter várias empresas (`imobiliaria`/`construtora`/`incorporadora`) |
| 2 | Assinatura | **Por empresa** — cada empresa tem a sua assinatura independente |
| 3 | Tipos expostos | `imobiliaria`, `construtora`, `incorporadora` (empresas) + `corretor_autonomo` (perfil) |
| 4 | Como o corretor autônomo existe | **Empresa própria** (`company` tipo `corretor_autonomo`) com página/vitrine |
| 5 | Anúncios do corretor autônomo | **1 ativo grátis**; mais que 1 exige **plano profissional** |
| 6 | Gestão da equipe da imobiliária | **Apenas avulso** (texto livre) — **busca desativada** |
| 7 | ~~Convite + aceite~~ / ~~busca de perfis~~ / ~~exclusividade~~ | **Adiado** — fora desta fase (ver §12) |

---

## 3. Decisões menores (propostas — confirmar)

1. **Equipe de corretores — quais tipos?** → Proposta: **só imobiliária**. Construtora/incorporadora sem equipe por enquanto.
2. **Quem cria anúncios da imobiliária?** → Como o corretor é avulso (sem conta), **só o dono** da imobiliária cria/edita anúncios; pode atribuí-los a um corretor avulso (`broker_id`).
3. **Limite de imóveis ativos (por empresa):**
   - **Particular:** 1 (regra atual mantida).
   - **Corretor autônomo:** 1 grátis · N conforme **plano profissional**.
   - **Imobiliária/Construtora/Incorporadora:** conforme o plano **da própria empresa**.
4. **Plano de corretor autônomo** — criar como item em `plans` (ver §7). Valores/limites a definir.
5. **Corretor autônomo + empresa na mesma conta?** → Permitido (cada um é uma `company`). Avaliar UX para não confundir (§6, troca de empresa). *(confirmar)*

---

## 4. Modelo de dados

### 4.1 Entidades

- **`profile`** — a pessoa/conta. Todo usuário tem uma.
- **`company`** — a entidade profissional. `owner_id` **não é único**: uma conta pode ter **várias** empresas. Tipos expostos na UI: `imobiliaria`, `construtora`, `incorporadora` (empresas) e `corretor_autonomo` (perfil).
- **`subscriptions`** — **por empresa** (`company_id`). Cada empresa assina e é cobrada de forma independente (já modelado assim no schema).
- **`brokers`** — roster (texto livre) de corretores de uma **imobiliária**.

### 4.2 Dois sentidos de "corretor"

| | O que é | Tem conta? | Página pública |
|---|---------|-----------|----------------|
| **Corretor autônomo** | Dono de uma `company` tipo `corretor_autonomo` | Sim (própria) | Sim (própria) |
| **Corretor de imobiliária (avulso)** | Uma linha em `brokers` (texto livre) cadastrada pela imobiliária | **Não** | Aparece na página da imobiliária |

Nesta fase, o corretor de imobiliária é **sempre avulso** (sem conta). Vínculo a perfis reais, convite/aceite e exclusividade ficam **adiados** (§12).

### 4.3 Alterações de schema (migração nova — não recriar o banco)

- **Não** criar `unique(owner_id)` em `companies` — a conta pode ter várias empresas (`owner_id` já é índice comum, mantém assim).
- `subscriptions.company_id` já existe → assinatura por empresa, sem mudança de schema.
- Já aplicada: `brokers.email` (migração 18) para atribuição de imóvel a corretor.

A tabela **`brokers` permanece como está** (roster de texto livre: `company_id`, `name`, `creci`,
`phone`, `whatsapp`, `photo_url`). O `profile_id` (já existente, nullable) fica reservado para o
vínculo real numa fase futura — não é usado agora.

**Gating de anúncios do corretor autônomo** — duas alternativas (decidir na Fase 1):

- **(a) No app (recomendado p/ começar):** ao publicar/ativar um imóvel, checar se a empresa do
  usuário é `corretor_autonomo`, contar imóveis ativos e exigir assinatura ativa para passar de 1.
- **(b) No banco (trigger):** estender a regra que hoje limita `particular` a 1 ativo, para cobrir
  `corretor_autonomo` sem plano. Mais robusto, porém mais acoplado.

> Após aplicar a migração: rodar `npm run db:types` e o advisor do Supabase.

### 4.4 RLS

- **Imobiliária (dono)** gerencia as linhas de `brokers` da sua empresa (avulsos).
- Busca de perfis / RPC de match: **descopados** nesta fase.

---

## 5. Fluxos

### 5.1 Onboarding (revisado)

```
Cadastro → conta pessoal (perfil de usuário)
   │
   ├─ pode anunciar como pessoa física (1 imóvel) sem virar profissional
   │
   └─ "Atuar profissionalmente" → cria UM perfil profissional (e pode criar mais depois):
         ├─ Imobiliária      → company (imobiliaria)     + role=profissional + assinatura própria
         ├─ Construtora       → company (construtora)      + role=profissional + assinatura própria
         ├─ Incorporadora     → company (incorporadora)    + role=profissional + assinatura própria
         └─ Corretor autônomo → company (corretor_autonomo) + role=profissional + plano próprio
```

Novas empresas podem ser criadas a qualquer momento pelo painel (não só no onboarding).

Remoções no onboarding atual (`components/auth/OnboardingFlow.tsx` + `app/painel/escolha-perfil/actions.ts`):
- Eliminar o caminho **"Empresa ou prestador"** e seus segmentos.
- Restringir `company_type` exposto a **imobiliaria / construtora / incorporadora / corretor_autonomo**.

### 5.2 Gating de anúncios (corretor autônomo)

```
Corretor autônomo cria anúncio
   ├─ já tem 1 imóvel ativo e SEM plano profissional → bloqueia, oferece upgrade
   └─ com plano profissional ativo → permite (limite do plano)
```

Verificação ao **publicar/ativar** (não ao salvar rascunho). Mensagem com CTA para `/painel/planos`.

### 5.3 Montar equipe (imobiliária) — apenas avulso

```
Imobiliária → Equipe → "Adicionar corretor"
   └─ cadastro avulso (texto livre): nome, CRECI, WhatsApp  → brokers(profile_id=null)
```

> **Busca de perfis: desativada nesta fase.** Sem convite, sem aceite, sem vínculo a contas reais.

### 5.4 Remoção de corretor (avulso)

- Remover o corretor = excluir a linha de `brokers`.
- Anúncios atribuídos a ele continuam com a imobiliária (`company_id` inalterado); `broker_id` vira null.

---

## 6. Dashboards por papel

O painel é **sempre no contexto de uma empresa selecionada** (ou do perfil pessoal). Quando a conta
tem mais de uma empresa, há um **seletor de empresa ativa** no topo da navegação; os itens, dados,
limites e assinatura mostrados são **da empresa selecionada**.

| Contexto | Itens do painel |
|----------|-----------------|
| **Pessoal (particular)** | Meus imóveis (1) · Contatos · Meu perfil · CTA "Criar empresa / Virar corretor autônomo" |
| **Imobiliária** | Imóveis · **Equipe** (avulsos) · Contatos/Leads · Perfil da empresa · Vitrine · **Planos (desta empresa)** · Meu perfil |
| **Construtora / Incorporadora** | Imóveis · Contatos/Leads · Perfil da empresa · Vitrine · **Planos (desta empresa)** · Meu perfil _(sem Equipe — confirmar)_ |
| **Corretor autônomo** | Imóveis (1 grátis / N com plano) · Contatos · Perfil profissional · Vitrine · **Planos** · Meu perfil |
| **Admin / Moderador** | (inalterado) |

> **Seletor de empresa** é a peça nova de navegação: define qual `company_id` está em foco em todas as
> telas (imóveis, equipe, vitrine, planos). O perfil pessoal é uma das opções do seletor.

A página **Equipe de corretores** (`/painel/corretores`) fica visível apenas quando a empresa ativa é
**imobiliária** — mantém o **cadastro avulso** (sem busca).

---

## 7. Planos e gating

- **Assinatura por empresa:** cada `company` tem a sua assinatura em `subscriptions` (`company_id`). Limites/recursos sempre resolvidos pela empresa em foco.
- Criar item em `plans` para **Corretor Autônomo Profissional** (intervalo mensal/anual; valores a definir).
- Regra: corretor autônomo **sem assinatura ativa** → **1 imóvel ativo**; **com assinatura** → limite do plano.
- Aplicar na **publicação/ativação** do anúncio (ver §5.2). Reaproveitar `subscriptions`/`plans` existentes.

## 8. Atribuição de anúncios

- Imobiliária → `company_id` = imobiliária; `broker_id` = corretor avulso (opcional).
- Corretor autônomo → `company_id` = a empresa dele; `broker_id` = null.
- Pessoa física → `company_id` = null; `broker_id` = null.

---

## 9. Itens a remover/ajustar

- Caminho "Empresa ou prestador" do onboarding + segmentos.
- `company_type` na UI restrito a **imobiliaria / construtora / incorporadora / corretor_autonomo** (enum permanece; só a UI/validação restringe).
- **Função de busca de corretor: não implementar** (descopada).
- Diretório público `/profissionais` — ajustar para os tipos ativos e tratar SEO de tipos órfãos.

---

## 10. Riscos e preocupações

1. **Múltiplas empresas por conta** — maior impacto. Hoje o código assume "uma empresa do usuário":
   - `getMyCompany()` → vira **`getMyCompanies()`** + uma noção de **empresa ativa** (cookie/param/estado).
   - `getListingPublishGate()` é **por empresa** — precisa receber a empresa em foco, não "a primeira do owner".
   - `app/painel/*` e `app/painel/empresa` precisam considerar a empresa selecionada.
2. **Seletor de empresa** — nova peça de navegação; definir onde guarda o foco (cookie de sessão é o mais simples).
3. **Gating por plano** — checagem no app (mais simples) ou em trigger; ver §4.3. Sempre **por empresa**.
4. **Limite ao baixar de plano** — se cancelar com vários imóveis ativos, o que fazer com os excedentes? (Proposta: bloquear novos, manter os já ativos — confirmar.)
5. **Migração de `brokers` legados** — permanecem como avulsos; nada a fazer.
6. **Duplicidade de corretores avulsos** — aceita nesta fase; resolver na fase futura.

---

## 11. Faseamento

| Fase | Escopo | Status |
|------|--------|--------|
| **1 — Fundação** | Onboarding com 4 tipos (incl. incorporadora) · **criar empresa pelo painel** (`?nova=1`) · `getMyCompanies()` + empresa ativa (cookie) | ✅ feito |
| **2 — Multi-empresa** | **Seletor de empresa** na navegação · imóveis escopados por `company_id` · gate por empresa ativa | ✅ feito |
| **3 — Gating** | Plano de corretor autônomo em `plans` · limite por empresa · CTA de upgrade | parcial (gate já existe; falta plano/CTA) |
| **4 — Dashboards** | Permissões por papel · atribuição de anúncios · equipe avulsa | pendente |
| **5 — Polimento** | Diretório `/profissionais` · limites de plano por empresa | pendente |

**Notas da implementação (fases 1–2):**
- Empresa ativa via cookie `active_company` (`'pessoal'` = perfil pessoal); helper `getActiveCompanyId()` + `setActiveCompany()`.
- `getMyCompany()` agora retorna a **empresa ativa** (fallback na primeira); `getMyCompanies()` alimenta o seletor.
- `getMyProperties()` e `getListingPublishGate()` escopados pela empresa ativa.
- Seletor: `components/painel/CompanySwitcher.tsx` no layout do painel.
- Sem nova migração de schema (multi-empresa já cabe; `owner_id` continua não-único).

> **Adiado (fase futura):** busca de perfis, convite + aceite, exclusividade de vínculo, merge de avulso.

---

## 12. Arquivos provavelmente afetados (referência)

- **DB:** sem nova migração de schema obrigatória (sem `unique owner_id`) · `brokers.email` já feito (18)
- **Dados:** `lib/data.ts` — **`getMyCompanies()`** + empresa ativa · `getListingPublishGate(company)` por empresa · equipe/planos por `company_id`
- **Empresa ativa:** novo helper (cookie de sessão) + **seletor de empresa** na navegação
- **Onboarding:** `components/auth/OnboardingFlow.tsx` · `app/painel/escolha-perfil/actions.ts`
- **Criar empresa pelo painel:** rota nova (ex.: `app/painel/empresas/nova`)
- **Equipe:** `app/painel/corretores/*` · `components/painel/BrokersManager.tsx` (mantém avulso)
- **Anúncios/gating:** `app/painel/imoveis/*` · `components/painel/PropertyForm.tsx`
- **Planos:** `app/painel/planos/*` (por empresa)
- **Empresa:** `components/painel/CompanyForm.tsx` · `components/painel/company/sections.tsx`
- **Layout/navegação:** `app/painel/layout.tsx` · `app/painel/page.tsx`
- **Diretório público:** rotas em `app/(public)/profissionais/*`
