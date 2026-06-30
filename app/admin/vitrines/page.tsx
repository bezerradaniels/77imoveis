import { adminListStorefronts } from '@/lib/data';
import { StorefrontBulkList } from '@/components/admin/StorefrontBulkList';

export const dynamic = 'force-dynamic';

export default async function AdminVitrines() {
  const vitrines = await adminListStorefronts();
  return (
    <StorefrontBulkList vitrines={vitrines as any} />
  );
}
