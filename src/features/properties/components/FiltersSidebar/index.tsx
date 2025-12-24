import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import CityCombobox from "../../../../components/common/CityCombobox";
import { DDD77_CITIES } from "../../../../constants/ddd77Cities";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

const purposeOptions = [
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
  { value: "lancamento", label: "Lançamentos" },
] as const;

const typeOptions = [
  { value: "casa", label: "Casa" },
  { value: "apartamento", label: "Apartamento" },
  { value: "predio", label: "Prédio" },
  { value: "loja", label: "Loja" },
  { value: "escritorio", label: "Escritório" },
  { value: "terreno", label: "Terreno" },
  { value: "rural", label: "Rural" },
] as const;

interface FiltersSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  hidePurpose?: boolean;
}

export default function FiltersSidebar({ isOpen, onToggle, hidePurpose = false }: FiltersSidebarProps) {
  const [sp, setSp] = useSearchParams();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    location: true,
    price: true,
    features: false,
  });

  const v = useMemo(() => {
    const s = (k: string) => sp.get(k) ?? "";
    return {
      purpose: s("purpose"),
      type: s("type"),
      city: s("city"),
      neighborhood: s("neighborhood"),
      minPrice: s("minPrice"),
      maxPrice: s("maxPrice"),
      bedrooms: s("bedrooms"),
      suites: s("suites"),
      bathrooms: s("bathrooms"),
      parkingSpots: s("parkingSpots"),
      sort: sp.get("sort") ?? "recent",
    };
  }, [sp]);

  const numberOptions = (max: number) => Array.from({ length: max + 1 }, (_, i) => i);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp);
    if (!value) next.delete(key);
    else next.set(key, value);
    next.set("page", "1");
    setSp(next);
  }

  function clearAll() {
    setSp(new URLSearchParams());
  }

  function toggleSection(section: string) {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  const activeFiltersCount = [
    v.purpose,
    v.type,
    v.city,
    v.neighborhood,
    v.minPrice,
    v.maxPrice,
    v.bedrooms && v.bedrooms !== "0" ? v.bedrooms : "",
    v.suites && v.suites !== "0" ? v.suites : "",
    v.bathrooms && v.bathrooms !== "0" ? v.bathrooms : "",
    v.parkingSpots && v.parkingSpots !== "0" ? v.parkingSpots : "",
  ].filter(Boolean).length;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 lg:top-24 left-0 z-50 lg:z-0
          h-full lg:h-auto max-h-screen lg:max-h-[calc(100vh-8rem)]
          w-80 lg:w-72 xl:w-80
          bg-white lg:bg-transparent
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto no-scrollbar
          lg:block
        `}
      >
        <div className="p-6 lg:p-0 space-y-4">
          {/* Header mobile */}
          <div className="flex items-center justify-between lg:hidden">
            <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filters container */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="font-semibold text-gray-900">Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-lime-100 text-lime-700 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-lime-600 transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Finalidade */}
            {!hidePurpose && (
              <div className="border-b border-gray-100">
                <button
                  onClick={() => toggleSection("purpose")}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-700">Finalidade</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.purpose ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSections.purpose && (
                  <div className="px-4 pb-4 space-y-2">
                    {purposeOptions.map((o) => (
                      <label
                        key={o.value}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          v.purpose === o.value
                            ? "bg-lime-50 border border-lime-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        <input
                          type="radio"
                          name="purpose"
                          value={o.value}
                          checked={v.purpose === o.value}
                          onChange={(e) => setParam("purpose", e.target.checked ? o.value : "")}
                          className="w-4 h-4 text-lime-500 border-gray-300 focus:ring-lime-500"
                        />
                        <span className="text-sm text-gray-700">{o.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tipo */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection("type")}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-700">Tipo de imóvel</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.type ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.type && (
                <div className="px-4 pb-4">
                  <Select value={v.type || "all"} onValueChange={(val) => setParam("type", val === "all" ? "" : val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {typeOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Localização */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection("location")}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-700">Localização</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.location ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.location && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cidade</label>
                    <CityCombobox
                      value={v.city}
                      onChange={(val) => setParam("city", val)}
                      options={DDD77_CITIES}
                      placeholder="Selecione"
                      searchPlaceholder="Buscar cidade…"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bairro</label>
                    <Input
                      value={v.neighborhood}
                      onChange={(e) => setParam("neighborhood", e.target.value)}
                      placeholder="Ex: Centro"
                      className="h-10"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preço */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => toggleSection("price")}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-700">Faixa de preço</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.price ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.price && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mínimo</label>
                      <Input
                        inputMode="numeric"
                        value={v.minPrice}
                        onChange={(e) => setParam("minPrice", e.target.value)}
                        placeholder="R$ 0"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Máximo</label>
                      <Input
                        inputMode="numeric"
                        value={v.maxPrice}
                        onChange={(e) => setParam("maxPrice", e.target.value)}
                        placeholder="R$ ∞"
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Características */}
            <div>
              <button
                onClick={() => toggleSection("features")}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-700">Características</span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.features ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.features && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quartos</label>
                      <Select value={v.bedrooms || "0"} onValueChange={(val) => setParam("bedrooms", val === "0" ? "" : val)}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {numberOptions(10).map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n === 0 ? "Qualquer" : `${n}+`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Suítes</label>
                      <Select value={v.suites || "0"} onValueChange={(val) => setParam("suites", val === "0" ? "" : val)}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {numberOptions(6).map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n === 0 ? "Qualquer" : `${n}+`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Banheiros</label>
                      <Select value={v.bathrooms || "0"} onValueChange={(val) => setParam("bathrooms", val === "0" ? "" : val)}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {numberOptions(6).map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n === 0 ? "Qualquer" : `${n}+`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vagas</label>
                      <Select value={v.parkingSpots || "0"} onValueChange={(val) => setParam("parkingSpots", val === "0" ? "" : val)}>
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {numberOptions(6).map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n === 0 ? "Qualquer" : `${n}+`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botão aplicar mobile */}
          <div className="lg:hidden">
            <Button
              onClick={onToggle}
              className="w-full bg-lime-500 hover:bg-lime-600 text-white font-semibold h-12 rounded-xl"
            >
              Ver resultados
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
