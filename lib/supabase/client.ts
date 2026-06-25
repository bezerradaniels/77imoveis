import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// Cliente para uso no navegador (painéis) e no build (leitura pública).
// Usa a anon key; a segurança é garantida pela RLS no banco.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export const supabase = createClient();
