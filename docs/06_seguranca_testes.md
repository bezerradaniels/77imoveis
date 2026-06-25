# 77Imóveis — Segurança e Testes

## 1. Segurança

### Controle de acesso
- **RBAC** via `profiles.role` (`particular`, `profissional`, `moderador`, `admin`).
- **RLS** (Row Level Security) em todas as tabelas — base da segurança (ver `02_rls.sql`). Conteúdo público legível; escrita só do dono; admin total.
- **service_role key** só no servidor/Edge Functions, nunca no navegador.

### Proteção de aplicação
- **Validação de entrada** com Zod em todo formulário e em cada Edge Function.
- **CSRF**: ações sensíveis via tokens do Supabase/POST com checagem de origem.
- **Rate limiting**: por IP em login, cadastro, criação de lead e contato (Cloudflare + checagem na Edge Function).
- **CAPTCHA** (hCaptcha/Cloudflare Turnstile) no cadastro e no formulário de lead (anti-spam).
- **Uploads seguros**: signed URLs, validação de MIME/tamanho, varredura de extensão, conversão para WebP, nomes aleatórios.
- **Anti-spam de leads**: honeypot + Turnstile + limite por IP + bloqueio de palavras.
- **Headers**: HSTS, X-Content-Type-Options, Referrer-Policy, CSP restritiva, X-Frame-Options.
- **Segredos**: variáveis de ambiente (nunca no client); chaves anon vs service separadas.
- **Auditoria**: `audit_logs` registra ações de admin/moderação e webhooks.
- **LGPD**: consentimento de cookies, política de privacidade, base legal para dados de leads, opção de exclusão de conta/dados.

### Moderação
Fila `moderation_queue` para imóveis/empresas reportados; admin aprova/reprova; histórico em `audit_logs`.

## 2. Estratégia de testes

| Camada | Ferramenta | O que cobre |
|---|---|---|
| Unitário | Vitest | utils, parser de filtros, geradores de SEO/JSON-LD, máscaras |
| Componente | Testing Library | PropertyCard, FilterBar, LeadForm, formulários |
| E2E | Playwright | cadastro 2 etapas, criar/ativar anúncio, busca, enviar lead, checkout |
| Banco | pgTAP / scripts SQL | políticas RLS, trigger do limite de 1 imóvel do particular |
| Acessibilidade | axe-core + Lighthouse CI | WCAG AA, contraste, navegação |
| Performance | Lighthouse CI | metas ≥ 95 e Core Web Vitals |
| Carga (futuro) | k6 | busca e páginas de cidade |

### Testes críticos de regra de negócio (exemplos)
1. Particular não consegue ativar 2 imóveis → recebe erro `LIMITE_PARTICULAR`.
2. RLS: usuário A não lê leads/imóveis pausados de B.
3. Webhook de pagamento é idempotente (mesmo evento 2x não duplica).
4. Destaque expira no fim do período (job `expire-features`).

### CI
GitHub Actions: lint + typecheck + unit + e2e + Lighthouse/axe em PR; bloqueia merge se falhar; deploy só no merge para `main`.
