import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// =====================================================================
// CRON de contratos: expiração e RENOVAÇÃO COMERCIAL (nunca cobra).
// Protegido por segredo (CRON_SECRET) via header ou ?secret=.
// Agende na Hostinger (cron job) ou Supabase scheduled function chamando:
//   GET /api/cron/contracts?secret=SEU_SEGREDO
// Idempotente: pode rodar quantas vezes quiser.
// =====================================================================

const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString();
const addDays = (base: Date, days: number) => new Date(base.getTime() + days * DAY);

type Svc = ReturnType<typeof createServiceClient>;

async function history(sb: Svc, type: 'plan' | 'ad', id: string, action: string, from: string, to: string, meta: Record<string, unknown> = {}) {
  await sb.from('contract_status_history').insert({
    contract_type: type, contract_id: id, action, from_status: from, to_status: to, admin_id: null, reason: 'Automático (cron)', metadata: meta as any,
  });
}

// ---- Planos manuais -------------------------------------------------
async function processManualContracts(sb: Svc) {
  const now = new Date();
  const nowIso = iso(now);
  const result = { expired: 0, renewed: 0, activated: 0 };

  // 1) Agendados que chegaram na data de início -> ativa (subscription 'ativa').
  const { data: due } = await sb.from('manual_contracts').select('*').eq('status', 'agendado').lte('starts_at', nowIso);
  for (const c of (due ?? []) as any[]) {
    await sb.from('manual_contracts').update({ status: 'ativo' }).eq('id', c.id);
    await sb.from('subscriptions').update({ status: 'ativa' }).eq('manual_contract_id', c.id);
    await history(sb, 'plan', c.id, 'activate', 'agendado', 'ativo');
    result.activated++;
  }

  // 2) Ativos vencidos -> renova (se auto_renew) ou expira.
  const { data: expired } = await sb.from('manual_contracts').select('*').eq('status', 'ativo').lt('ends_at', nowIso);
  for (const c of (expired ?? []) as any[]) {
    if (c.auto_renew) {
      const base = new Date(c.ends_at).getTime() > now.getTime() ? new Date(c.ends_at) : now;
      const newEnds = addDays(base, c.duration_days);
      const payment = c.payment_status === 'isento' ? 'isento' : 'pendente';
      await sb.from('manual_contracts').update({ ends_at: iso(newEnds), payment_status: payment }).eq('id', c.id);
      await sb.from('subscriptions').update({ status: 'ativa', current_period_end: iso(newEnds) }).eq('manual_contract_id', c.id);
      await history(sb, 'plan', c.id, 'renew', 'ativo', 'ativo', { ends_at: { from: c.ends_at, to: iso(newEnds) }, payment_status: payment });
      result.renewed++;
    } else {
      await sb.from('manual_contracts').update({ status: 'expirado' }).eq('id', c.id);
      await sb.from('subscriptions').update({ status: 'cancelada' }).eq('manual_contract_id', c.id);
      await history(sb, 'plan', c.id, 'expire', 'ativo', 'expirado');
      result.expired++;
    }
  }
  return result;
}

// ---- Publicidade (banners) ------------------------------------------
async function processAdContracts(sb: Svc) {
  const now = new Date();
  const nowIso = iso(now);
  const result = { expired: 0, renewed: 0, activated: 0 };

  // 1) Agendados iniciados -> ativo + visível.
  const { data: due } = await sb.from('banners').select('*').eq('status', 'agendado').lte('starts_at', nowIso);
  for (const b of (due ?? []) as any[]) {
    const visible = !b.ends_at || new Date(b.ends_at).getTime() > now.getTime();
    await sb.from('banners').update({ status: 'ativo', is_active: visible }).eq('id', b.id);
    await history(sb, 'ad', b.id, 'activate', 'agendado', 'ativo');
    result.activated++;
  }

  // 2) Ativos vencidos -> renova (auto_renew) ou expira e some do carrossel.
  const { data: expired } = await sb.from('banners').select('*').eq('status', 'ativo').lt('ends_at', nowIso);
  for (const b of (expired ?? []) as any[]) {
    const duration = b.duration_days ?? 30;
    if (b.auto_renew) {
      const base = new Date(b.ends_at).getTime() > now.getTime() ? new Date(b.ends_at) : now;
      const newEnds = addDays(base, duration);
      const payment = b.payment_status === 'isento' ? 'isento' : 'pendente';
      await sb.from('banners').update({ ends_at: iso(newEnds), payment_status: payment, is_active: true }).eq('id', b.id);
      await history(sb, 'ad', b.id, 'renew', 'ativo', 'ativo', { ends_at: { from: b.ends_at, to: iso(newEnds) }, payment_status: payment });
      result.renewed++;
    } else {
      await sb.from('banners').update({ status: 'expirado', is_active: false }).eq('id', b.id);
      await history(sb, 'ad', b.id, 'expire', 'ativo', 'expirado');
      result.expired++;
    }
  }
  return result;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: 'CRON_SECRET não configurado.' }, { status: 500 });
  const url = new URL(request.url);
  const provided = request.headers.get('x-cron-secret') ?? url.searchParams.get('secret');
  if (provided !== secret) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

  try {
    const sb = createServiceClient();
    const [plans, ads] = await Promise.all([processManualContracts(sb), processAdContracts(sb)]);
    return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), plans, ads });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Falha no cron.' }, { status: 500 });
  }
}
