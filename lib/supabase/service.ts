import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Cliente com service_role — bypassa RLS e triggers de proteção.
// Usar SOMENTE em Server Actions/Route Handlers nunca expostos ao cliente.
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
