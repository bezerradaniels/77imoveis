import { BedDouble, Bath, Car, Ruler, LandPlot, DoorOpen, Building2, Layers } from 'lucide-react';

type Spec = { Icon: typeof BedDouble; value: string | number; label: string };

// Ficha técnica do imóvel: grade altamente escaneável (ícone + número + rótulo).
export function PropertySpecs(p: {
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  garages?: number;
  builtArea?: number | null;
  landArea?: number | null;
  floor?: number | null;
  totalFloors?: number | null;
}) {
  const specs = [
    p.bedrooms && { Icon: BedDouble, value: p.bedrooms, label: 'Quartos' },
    p.suites && { Icon: DoorOpen, value: p.suites, label: 'Suítes' },
    p.bathrooms && { Icon: Bath, value: p.bathrooms, label: 'Banheiros' },
    p.garages && { Icon: Car, value: p.garages, label: 'Vagas' },
    p.builtArea && { Icon: Ruler, value: `${p.builtArea} m²`, label: 'Construídos' },
    p.landArea && { Icon: LandPlot, value: `${p.landArea} m²`, label: 'Terreno' },
    p.floor && { Icon: Building2, value: `${p.floor}º`, label: 'Andar' },
    p.totalFloors && { Icon: Layers, value: p.totalFloors, label: 'Andares' },
  ].filter(Boolean) as Spec[];

  if (!specs.length) return null;

  return (
    <section className="rounded-2xl border border-border p-6">
      <h2 className="mb-4 text-lg font-bold">Ficha do imóvel</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {specs.map((s, k) => (
          <div key={k} className="rounded-xl bg-subtle p-4">
            <s.Icon size={21} className="text-primary" />
            <div className="mt-2 text-lg font-extrabold leading-none tabular-nums">{s.value}</div>
            <div className="mt-1 text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
