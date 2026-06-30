// Detecta a sessão pela presença do cookie de auth do Supabase, SEM carregar o
// SDK do Supabase nas páginas públicas (mantém o bundle leve e o cache/SEO).
// Só serve para alternar UI (Login/Painel, saudação) — o middleware protege as rotas.
export function hasAuthCookie() {
  if (typeof document === 'undefined') return false;
  const ref = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/^https?:\/\//, '').split('.')[0];
  if (!ref) return false;
  return document.cookie.split('; ').some((c) => c.startsWith(`sb-${ref}-auth-token`));
}
