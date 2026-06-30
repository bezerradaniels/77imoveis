import { NextResponse } from 'next/server';
import { getProfile } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Endpoint leve para personalização client-side (ex.: saudação na home),
// sem tornar páginas estáticas em dinâmicas. Retorna só o primeiro nome.
export async function GET() {
  const profile = await getProfile();
  const firstName = profile?.full_name?.trim().split(/\s+/)[0] ?? null;
  return NextResponse.json({ firstName });
}
