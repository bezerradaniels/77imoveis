import {
  createImoveisMetadata,
  ImoveisListingPage,
  type ImoveisPreset,
  type Search,
} from './_listing';

export function createImoveisRoute(preset: ImoveisPreset) {
  return {
    async generateMetadata({ searchParams }: { searchParams: Search }) {
      return createImoveisMetadata({ searchParams, preset });
    },
    Page({ searchParams }: { searchParams: Search }) {
      return <ImoveisListingPage searchParams={searchParams} preset={preset} />;
    },
  };
}
