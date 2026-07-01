import type { SupabaseClient } from '@supabase/supabase-js';
import { IMAGE_UPLOAD_CONFIG } from './config';
import { storagePathFromPublicUrl } from './deleteStorageImage';

// Prefixos de pasta por contexto, do mais específico para o mais genérico
// (ex.: "properties/thumbnails" precisa ser testado antes de "properties").
const folders = Object.values(IMAGE_UPLOAD_CONFIG)
  .map((c) => c.folder)
  .sort((a, b) => b.length - a.length);

function entityIdFromPath(path: string): string | null {
  const folder = folders.find((f) => path === f || path.startsWith(`${f}/`));
  if (!folder) return null;
  return path.slice(folder.length + 1).split('/')[0] || null;
}

// Filtra, dentre os caminhos informados, apenas os que o usuário logado tem
// permissão de apagar: os próprios imóveis, empresas (e vitrines/corretores
// delas) e o próprio avatar. Admin/moderador pode apagar qualquer um.
// Evita que um usuário autenticado passe o caminho de outro usuário para
// deleteUploadedImages e apague arquivos que não são dele.
export async function filterOwnedImagePaths(
  sb: SupabaseClient<any>,
  userId: string,
  isAdmin: boolean,
  refs: string[],
): Promise<string[]> {
  const paths = [...new Set(refs.map((ref) => storagePathFromPublicUrl(ref)).filter(Boolean) as string[])];
  if (!paths.length) return [];
  if (isAdmin) return paths;

  const [{ data: properties }, { data: companies }] = await Promise.all([
    sb.from('properties').select('id').eq('owner_id', userId),
    sb.from('companies').select('id').eq('owner_id', userId),
  ]);
  const companyIds = (companies ?? []).map((c: any) => c.id);

  const [{ data: brokers }, { data: storefronts }] = companyIds.length
    ? await Promise.all([
        sb.from('brokers').select('id').in('company_id', companyIds),
        sb.from('storefronts').select('id,slug').in('company_id', companyIds),
      ])
    : [{ data: [] as any[] }, { data: [] as any[] }];

  const ownedIds = new Set<string>([
    userId,
    ...(properties ?? []).map((p: any) => p.id),
    ...companyIds,
    ...(brokers ?? []).map((b: any) => b.id),
    ...(storefronts ?? []).flatMap((s: any) => [s.id, s.slug]),
  ]);

  return paths.filter((path) => {
    const entityId = entityIdFromPath(path);
    return !!entityId && ownedIds.has(entityId);
  });
}
