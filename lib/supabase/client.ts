import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

type BrowserSupabaseClient = SupabaseClient<Database, Database['__InternalSupabase'], 'public'>;

// Cliente para uso no navegador (painéis) e no build (leitura pública).
// Usa a anon key; a segurança é garantida pela RLS no banco.
//
// IMPORTANTE: a conexão só é criada quando createClient() é chamado,
// nunca no carregamento do arquivo. Assim o build não quebra quando
// as variáveis do Supabase ainda não foram configuradas.
export function createClient(): BrowserSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  return createBrowserClient<Database>(url, anonKey) as unknown as BrowserSupabaseClient;
}
