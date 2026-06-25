# 77Imóveis — Fluxos de Usuário e Roadmap

## 1. Fluxos principais

### 1.1 Cadastro em 2 etapas
```
Visitante → "Anunciar" → [Etapa 1] cria conta (nome, e-mail, telefone, senha)
   → confirma e-mail → logado como PARTICULAR
   → quer anunciar como empresa? → [Etapa 2] wizard de onboarding profissional
      tipo → dados → cidades → logo → capa → descrição → corretores
      → redes/WhatsApp → horário → especialidades → vira PROFISSIONAL
```

### 1.2 Publicar imóvel (Particular)
```
Painel → Novo imóvel → tipo → negociação → cidade (autocomplete) → bairro (autocomplete)
   → infos básicas → preço (ou "sob consulta") → características → fotos → revisar
   → Publicar
   → se já tem 1 ativo: "Gostaria de migrar para um plano profissional (B2B)?"
```

### 1.3 Buscar e contatar
```
Home/Busca → filtros (cidade, bairro, tipo, quartos, preço, área, características)
   → resultados (lista + mapa) → abre imóvel
   → WhatsApp (wa.me pré-preenchido)  e/ou  formulário de contato
   → lead salvo + enviado ao anunciante
```

### 1.4 Profissional gerencia
```
Painel (mobile) → resumo (ativos, contatos novos, visitas)
Painel (desktop) → imóveis (ativar/pausar/duplicar/editar) · contatos (lista) ·
   empresa (perfil) · planos (upgrade) · financeiro (faturas)
```

### 1.5 Admin
```
/admin → moderação (aprovar imóveis/empresas) · cidades/bairros · planos ·
   pagamentos · banners · destaques · blog/CMS · relatórios · configurações
```

## 2. Roadmap por milestones

### M0 — Fundação (semana 1–2)
- Projeto Next.js + Tailwind + tokens + modo escuro + logo.
- Supabase: aplicar schema, RLS, seed (7 cidades + bairros, catálogo, planos).
- Auth (e-mail/senha) + criação automática de profile.
- CI/CD (build estático → Hostinger) + Cloudflare.

### M1 — Núcleo do imóvel (semana 3–5)
- Onboarding de imóvel (tabelas normalizadas, fotos, "sob consulta").
- Gestão: criar/editar/duplicar/ativar/pausar/arquivar + regra de 1 ativo (particular).
- Página pública do imóvel (SSG) com JSON-LD + galeria + mapa.
- PropertyCard + listagem.

### M2 — Busca e SEO (semana 5–7)
- Busca com filtros na URL (FTS + trigram + PostGIS/raio).
- Páginas programáticas cidade/bairro/tipo + sitemap + robots + breadcrumbs.
- Performance (WebP, lazy, code splitting) — meta Lighthouse 95+.
- GEO: FAQs, resumos, llms.txt.

### M3 — Leads e profissionais (semana 7–9)
- Botão WhatsApp + formulário + tabela de leads + anti-spam (Turnstile/honeypot).
- Onboarding profissional (wizard) + diretório + página da empresa (SEO).
- Painel da empresa (mobile-first) + lista de contatos.

### M4 — Monetização (semana 9–11)
- Planos + assinatura (Asaas/Mercado Pago) + webhooks + limites por plano.
- Destaque avulso de imóvel + expiração.
- **Vitrine (catálogo próprio)**: página `/vitrine/{slug}` com marca da empresa + ativação avulsa por período (30/90/365 dias) + editor no painel.
- Banners + empresa em destaque.
- Financeiro (faturas, upgrade/downgrade/cancelamento).

### M5 — Admin e CMS (semana 11–13)
- Painel admin (usuários, empresas, imóveis, moderação, cidades, planos, pagamentos, banners, SEO, relatórios).
- Blog + CMS (posts, FAQs, landing pages).

### M6 — Polimento e lançamento (semana 13–14)
- Acessibilidade (axe/AA), testes E2E, auditoria de segurança, LGPD.
- Conteúdo inicial do blog + guias de cidade.
- Lançamento nas 6 cidades-foco.

## 3. Roadmap futuro (pós-MVP)
- Simulador de financiamento (SAC/Price).
- Avaliações com estrelas + moderação.
- CRM em funil (Kanban) para imobiliárias.
- Alertas de imóvel por e-mail/WhatsApp.
- App nativo (React Native/Expo).
- Sponsored search / leilão de posições.
- Migração para SSR/ISR em VPS (conteúdo em tempo real).
- Cadastro completo dos ~106 municípios do DDD 77.
- Programa de indicação e cupons.
- Integração com bancos para financiamento.
