import { permanentRedirect } from 'next/navigation';
import {
  createImoveisMetadata,
  ImoveisListingPage,
  queryRedirectForImoveis,
  type Search,
} from './_listing';

export const revalidate = 300;

export async function generateMetadata({ searchParams }: { searchParams: Search }) {
  return createImoveisMetadata({ searchParams });
}

export default async function ImoveisPage({ searchParams }: { searchParams: Search }) {
  const redirectTo = await queryRedirectForImoveis(searchParams);
  if (redirectTo) permanentRedirect(redirectTo);
  return <ImoveisListingPage searchParams={searchParams} />;
}
