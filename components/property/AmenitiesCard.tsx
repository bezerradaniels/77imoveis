import { Check } from 'lucide-react';

type Feature = { name: string; slug: string };

// Comodidades / diferenciais do imóvel: lista visual e fácil de escanear.
export function AmenitiesCard({ features }: { features: Feature[] }) {
  if (!features.length) return null;
  return (
    <section className="rounded-2xl border border-border p-6">
      <h2 className="mb-4 text-lg font-bold">Comodidades</h2>
      <ul className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
        {features.map((f) => {
          return (
            <li key={f.slug} className="flex items-center gap-3 text-sm text-text">
              <Check size={18} className="shrink-0 text-link" /> {f.name}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
