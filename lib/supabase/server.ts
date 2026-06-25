import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

// Cliente Supabase para Server Components / Server Actions / Route Handlers.
// Usa cookies (sessão compartilhada com o navegador via @supabase/ssr).
// A segurança vem da RLS no banco; aqui é sempre a anon key.
export function createClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet: { name: string; value: string; options?: any }[]) => {
          // Em Server Components o set lança — o middleware cuida do refresh.
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    },
  );
}
