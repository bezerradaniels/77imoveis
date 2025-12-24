import { useMemo } from "react";
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

export default function PropertyFilters() {
  const [sp, setSp] = useSearchParams();

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
    next.set("page", "1"); // mudar filtro volta para página 1
    setSp(next);
  }

  function clearAll() {
    setSp(new URLSearchParams());
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Finalidade</div>
          <Select value={v.purpose} onValueChange={(val) => setParam("purpose", val === "all" ? "" : val)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {purposeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Tipo</div>
          <Select value={v.type} onValueChange={(val) => setParam("type", val === "all" ? "" : val)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {typeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Cidade</div>
          <CityCombobox
            value={v.city}
            onChange={(val) => setParam("city", val)}
            options={DDD77_CITIES}
            placeholder="Selecione a cidade"
            searchPlaceholder="Buscar cidade…"
          />
        </div>


        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Bairro</div>
          <Input value={v.neighborhood} onChange={(e) => setParam("neighborhood", e.target.value)} placeholder="Ex: Centro" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Preço mín.</div>
          <Input inputMode="numeric" value={v.minPrice} onChange={(e) => setParam("minPrice", e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Preço máx.</div>
          <Input inputMode="numeric" value={v.maxPrice} onChange={(e) => setParam("maxPrice", e.target.value)} placeholder="999999" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Quartos</div>
          <Select value={v.bedrooms || "0"} onValueChange={(val) => setParam("bedrooms", val)}>
            <SelectTrigger>
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
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Suítes</div>
          <Select value={v.suites || "0"} onValueChange={(val) => setParam("suites", val)}>
            <SelectTrigger>
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
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Banheiros</div>
          <Select value={v.bathrooms || "0"} onValueChange={(val) => setParam("bathrooms", val)}>
            <SelectTrigger>
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
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Garagem</div>
          <Select value={v.parkingSpots || "0"} onValueChange={(val) => setParam("parkingSpots", val)}>
            <SelectTrigger>
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

      <div className="grid gap-3 md:grid-cols-1">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Ordenar</div>
          <Select value={v.sort} onValueChange={(val) => setParam("sort", val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="price_asc">Menor preço</SelectItem>
              <SelectItem value="price_desc">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={clearAll} className="border-gray-300 text-gray-600 hover:bg-gray-50">
          Limpar filtros
        </Button>
      </div>
    </div>
  );
}
