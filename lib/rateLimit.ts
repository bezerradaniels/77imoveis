// Rate limit simples em memória, por processo — suficiente para o volume
// atual (um único servidor Node na Hostinger). Não persiste entre deploys
// nem funciona com múltiplas instâncias; se o site crescer a ponto de
// precisar disso, trocar por um contador no Redis/Supabase.
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);

  // Evita crescimento infinito do Map ao longo do tempo.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (!times.some((t) => now - t < windowMs)) hits.delete(k);
    }
  }

  return recent.length > limit;
}
