import {
  Check,
  Waves,
  Flame,
  Sun,
  Wind,
  Trees,
  Sofa,
  ShieldCheck,
  Utensils,
  Dumbbell,
  Car,
  Wifi,
  Dog,
  Baby,
  Building2,
} from 'lucide-react';

// Mapa slug → ícone (lucide). Slugs não mapeados caem no Check verde.
const ICON: Record<string, typeof Check> = {
  piscina: Waves,
  churrasqueira: Flame,
  area_gourmet: Utensils,
  gourmet: Utensils,
  energia_solar: Sun,
  ar_condicionado: Wind,
  jardim: Trees,
  quintal: Trees,
  mobiliado: Sofa,
  seguranca: ShieldCheck,
  portaria: ShieldCheck,
  academia: Dumbbell,
  garagem: Car,
  wifi: Wifi,
  internet: Wifi,
  'pet-friendly': Dog,
  pet: Dog,
  playground: Baby,
  elevador: Building2,
};

type Feature = { name: string; slug: string };

// Comodidades / diferenciais do imóvel: lista visual e fácil de escanear.
export function AmenitiesCard({ features }: { features: Feature[] }) {
  if (!features.length) return null;
  return (
    <section className="rounded-2xl border border-border p-6">
      <h2 className="mb-4 text-lg font-bold">Comodidades</h2>
      <ul className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2">
        {features.map((f) => {
          const Icon = ICON[f.slug] ?? Check;
          return (
            <li key={f.slug} className="flex items-center gap-3 text-sm text-text">
              <Icon size={18} className="shrink-0 text-link" /> {f.name}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
