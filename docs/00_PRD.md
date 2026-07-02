# 77Imóveis — Documento de Requisitos do Produto (PRD)

> Portal imobiliário regional do **DDD 77** (Bahia, Brasil). Conteúdo 100% em pt-BR, mobile-first, com SEO/GEO como prioridade.

---

## 1. Visão

Ser o maior portal imobiliário do oeste e sudoeste da Bahia (região do DDD 77), conectando quem busca imóveis a corretores, imobiliárias, construtoras e profissionais da construção — com forte presença no Google e nas buscas por inteligência artificial.

## 2. Problema

Na região do DDD 77 não existe um portal regional forte. Anúncios estão espalhados em grupos de WhatsApp, Facebook Marketplace e portais nacionais que não dão destaque às cidades menores. Corretores locais têm pouca visibilidade online e os compradores não encontram tudo em um só lugar.

## 3. Público-alvo

**B2C — Particular:** pessoa física que quer vender ou alugar 1 imóvel próprio. Conta gratuita, 1 imóvel ativo.

**B2B — Profissional:** imobiliárias, corretores, construtoras, incorporadoras, engenheiros civis, arquitetos, topógrafos, lojas de material, energia solar, segurança, financiamento e prestadores (pintor, pedreiro, eletricista, encanador). Cada empresa tem dashboard próprio.

**Buscador (visitante):** quem procura imóvel para comprar, alugar ou para temporada. Não precisa de conta para buscar e contatar; precisa de conta para favoritar.

## 4. Regras de negócio centrais

1. **Particular**: 1 conta gratuita, **1 imóvel ativo**. Ao tentar publicar/ativar um 2º imóvel, o sistema exibe: *"Gostaria de migrar para um plano profissional (B2B)?"* (regra garantida no banco pelo trigger `enforce_particular_limit`).
2. **Profissional**: corretor autônomo, imobiliária ou construtora usa plano mensal/anual para ampliar limite de imóveis e recursos.
3. **Planos pagos**: têm régua mais barata para corretores autônomos, planos B2B para empresas e opção anual com desconto.
4. **Destaque de imóvel**: pagamento **avulso** (7/15/30 dias) para subir o anúncio.
5. **Empresa em destaque**: visibilidade premium no diretório (paga).
6. Todo imóvel tem **botão de WhatsApp + formulário de contato**; os leads são entregues ao anunciante **e** registrados internamente.

## 5. Escopo do MVP (v1)

| Incluído no MVP | Fora do MVP (fases futuras) |
|---|---|
| Cadastro 2 etapas (conta + onboarding profissional) | Simulador de financiamento |
| Anúncio de imóvel com tabelas normalizadas | Avaliações com estrelas |
| Busca por cidade/bairro/tipo/preço/área/características | Chat interno |
| Mapa com pino e busca por raio | CRM em funil (Kanban) |
| Diretório de profissionais | App nativo |
| Leads (WhatsApp + formulário) + lista de contatos no painel | Assinatura de alertas por e-mail |
| Planos + destaque avulso + Pix/boleto/cartão | Sponsored search / leilão de anúncios |
| Painel da empresa (mobile-first) | Integração com bancos |
| Painel administrativo | API pública para parceiros |
| Blog + CMS básico | |
| SEO/GEO completo (páginas por cidade/bairro/tipo) | |

## 6. Funcionalidades por módulo

### 6.1 Autenticação (2 etapas)
- **Etapa 1 — Conta:** nome, e-mail, telefone, senha (Supabase Auth). Opcional: login Google.
- **Etapa 2 — Onboarding profissional (wizard):** tipo de empresa → dados → cidades de atuação → logo → capa → descrição → corretores → redes sociais → WhatsApp → horário → especialidades.

### 6.2 Anúncio de imóvel (onboarding)
Tipo de imóvel · negociação — **uma ou mais ao mesmo tempo** (venda, aluguel, temporada, **romaria**, lançamento), **cada uma com seu próprio preço** (ex.: a mesma casa à venda E para alugar; ou aluguel + temporada). A modalidade marcada como "principal" vira o rótulo do card/URL. · cidade (autocomplete) → bairro (autocomplete só da cidade) · informações básicas (quartos, banheiros, suítes, vagas, área construída, área do terreno, andar, condomínio, IPTU) · preço por modalidade (valor **ou** "sob consulta") · características (piscina, churrasqueira, aceita pet, condomínio fechado, perto de escola/mercado, mobiliado, elevador, energia solar, acessibilidade, jardim, varanda) · fotos.

### 6.3 Gestão de anúncios
Criar · editar · **duplicar** · arquivar · ativar · pausar · remover. Toggle **Ativo / Pausado** direto no card.

### 6.4 Leads
Botão WhatsApp (abre `wa.me` com mensagem pré-preenchida) + formulário. Lead salvo na tabela `leads` e notificado ao dono. Painel = lista simples (quem, qual imóvel, quando, status).

### 6.5 Diretório profissional
Página por empresa: galeria, serviços/especialidades, botão WhatsApp, formulário, dados, mapa. Cada página é otimizada para SEO.

### 6.6 Painel da empresa (mobile-first)
- **Mobile:** resumo essencial — imóveis ativos, novos contatos, visualizações.
- **Desktop:** sidebar + cards + gráficos + relatórios.

### 6.7 Painel administrativo
Usuários · Empresas · Imóveis · Categorias · Tipos · Cidades · Bairros · Banners · Destaques · Empresas em destaque · Planos · Pagamentos · Leads · Páginas de SEO · Blog · Relatórios · Moderação · Configurações.

## 7. Métricas de sucesso (Norte)

- **Aquisição SEO:** nº de páginas de cidade/bairro/tipo indexadas; cliques orgânicos.
- **Oferta:** imóveis ativos; empresas cadastradas.
- **Demanda:** visitas únicas; leads gerados (WhatsApp + formulário).
- **Receita:** assinaturas ativas; destaques vendidos; MRR.
- **Performance:** Lighthouse ≥ 95; Core Web Vitals "bom".

## 8. Premissas e decisões (discovery)

- Hospedagem econômica na Hostinger → arquitetura de **páginas pré-geradas (SSG)** para preservar SEO dentro desse limite (ver `01_arquitetura.md`).
- Busca com **PostgreSQL FTS + PostGIS** (sem serviço externo no início).
- Mapas com **Leaflet + tiles OSM/MapTiler**.
- Pagamentos com gateway brasileiro (**Asaas** ou **Mercado Pago**) para **Pix + boleto + cartão**; Stripe como opção futura.
- **Sem** simulador e **sem** avaliações no MVP.
- Modo claro + escuro. Logo criada pelo time.
