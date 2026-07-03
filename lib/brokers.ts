// Substituição atômica da equipe de corretores de uma empresa.
//
// Caminho principal: RPC transacional `replace_company_brokers` (migração 26) —
// delete + insert numa única transação, respeitando a RLS de `brokers`.
// Fallback: se a função ainda não existe no banco (migração não aplicada),
// faz delete + insert em código e RESTAURA a equipe anterior caso o insert
// falhe, para nunca deixar a imobiliária sem corretores.

export type BrokerRow = {
  name: string;
  creci?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  photo_url?: string | null;
};

const ERROR_MSG = 'Não foi possível salvar os corretores.';

export async function replaceCompanyBrokers(
  sb: any,
  companyId: string,
  rows: BrokerRow[],
): Promise<{ error?: string }> {
  const payload = rows
    .filter((r) => r.name?.trim())
    .map((r) => ({
      name: r.name.trim(),
      creci: r.creci ?? null,
      email: r.email ?? null,
      phone: r.phone ?? null,
      whatsapp: r.whatsapp ?? null,
      photo_url: r.photo_url ?? null,
    }));

  const { error } = await sb.rpc('replace_company_brokers', {
    p_company_id: companyId,
    p_brokers: payload,
  });
  if (!error) return {};

  // A função não existe (migração 26 não aplicada): usa o fallback em código.
  const missingFn =
    error.code === '42883' ||
    error.code === 'PGRST202' ||
    /Could not find the function/i.test(error.message || '');
  if (!missingFn) return { error: ERROR_MSG };

  const { data: previous } = await sb.from('brokers').select('*').eq('company_id', companyId);

  const { error: deleteError } = await sb.from('brokers').delete().eq('company_id', companyId);
  if (deleteError) return { error: ERROR_MSG };

  if (payload.length) {
    const { error: insertError } = await sb
      .from('brokers')
      .insert(payload.map((b) => ({ ...b, company_id: companyId })));
    if (insertError) {
      if (previous?.length) await sb.from('brokers').insert(previous);
      return { error: `${ERROR_MSG} A equipe anterior foi mantida.` };
    }
  }
  return {};
}
