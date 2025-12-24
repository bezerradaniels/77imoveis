import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import Container from "../../components/common/Container";
import Seo from "../../components/common/Seo";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { fetchListings } from "../../features/properties/api";
import PropertyCardModern from "../../features/properties/components/PropertyCardModern";
import FiltersSidebar from "../../features/properties/components/FiltersSidebar";
import { slugToPurpose, slugToType } from "../../lib/slugify";
import { DDD77_CITIES } from "../../constants/ddd77Cities";

function findCityBySlug(slug: string): string | undefined {
  const normalized = slug.toLowerCase().replace(/-/g, " ");
  return DDD77_CITIES.find(
    (city) => city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === normalized
  );
}

function parseBedroomsFromSlug(slug: string): number | undefined {
  const match = slug.match(/^(\d+)quartos?$/);
  return match ? Number(match[1]) : undefined;
}

export default function Listings() {
  const params = useParams<{ purpose?: string; city?: string; type?: string; bedrooms?: string }>();
  const [sp, setSp] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const page = Number(sp.get("page") ?? "1");
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;

  const filters = useMemo(() => {
    const n0 = (k: string) => {
      const raw = sp.get(k);
      if (!raw) return undefined;
      const v = Number(raw);
      if (!Number.isFinite(v) || v <= 0) return undefined;
      return v;
    };

    const purposeFromUrl = params.purpose ? slugToPurpose[params.purpose] : undefined;
    const cityFromUrl = params.city && params.city !== "todos" ? findCityBySlug(params.city) : undefined;
    const typeFromUrl = params.type ? slugToType[params.type] : undefined;
    const bedroomsFromUrl = params.bedrooms ? parseBedroomsFromSlug(params.bedrooms) : undefined;

    return {
      purpose: purposeFromUrl ?? (sp.get("purpose") ?? undefined) as any,
      type: typeFromUrl ?? (sp.get("type") ?? undefined) as any,
      city: cityFromUrl ?? sp.get("city") ?? undefined,
      neighborhood: sp.get("neighborhood") ?? undefined,
      minPrice: n0("minPrice"),
      maxPrice: n0("maxPrice"),
      bedrooms: bedroomsFromUrl ?? n0("bedrooms"),
      suites: n0("suites"),
      bathrooms: n0("bathrooms"),
      parkingSpots: n0("parkingSpots"),
      sort: (sp.get("sort") ?? "recent") as any,
      page: safePage,
      pageSize: 12,
    };
  }, [params, sp, safePage]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await fetchListings(filters);
        if (!alive) return;
        setItems(res.items);
        setTotalPages(res.totalPages);
      } catch (e: any) {
        if (!alive) return;
        setErrorMsg(e?.message ?? "Erro ao carregar listagens.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [filters]);

  function goPage(nextPage: number) {
    const next = new URLSearchParams(sp);
    next.set("page", String(nextPage));
    setSp(next);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Seo title="77 Imóveis | Listagens" />

      {/* Hero banner */}
      <div className="bg-white border-b border-gray-100 py-8 md:py-12">
        <Container>
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
            <span>Home</span>
            <span className="text-gray-300">/</span>
            <span className="text-lime-600 font-medium">Imóveis</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Encontre seu imóvel</h1>
              <p className="mt-2 text-gray-600">Casas, apartamentos e terrenos na região DDD 77</p>
            </div>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtros
            </button>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <FiltersSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {errorMsg && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-4 mb-6">
                <div className="font-medium text-red-700">Ops…</div>
                <div className="text-sm text-red-600">{errorMsg}</div>
              </div>
            )}

            {/* Results header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {loading ? "Carregando..." : `${items.length} imóveis encontrados`}
              </p>
              <div className="flex items-center gap-3">
                <Select
                  value={sp.get("sort") ?? "recent"}
                  onValueChange={(val) => {
                    const next = new URLSearchParams(sp);
                    next.set("sort", val);
                    next.set("page", "1");
                    setSp(next);
                  }}
                >
                  <SelectTrigger className="w-40 h-9 text-sm bg-white border-gray-200">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="price_asc">Menor preço</SelectItem>
                    <SelectItem value="price_desc">Maior preço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block w-10 h-10 border-3 border-lime-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-gray-500">Carregando imóveis…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="font-semibold text-gray-900 text-lg">Nenhum imóvel encontrado</div>
                <div className="text-gray-500 mt-2">Tente ajustar os filtros para ver mais resultados.</div>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((p) => (
                    <PropertyCardModern key={p.id} p={p} />
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3 pt-8">
                  <Button
                    variant="outline"
                    disabled={safePage <= 1}
                    onClick={() => goPage(safePage - 1)}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                  >
                    ← Anterior
                  </Button>

                  <div className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 shadow-sm">
                    Página <span className="font-semibold text-gray-900">{safePage}</span> de <span className="font-semibold text-gray-900">{totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    disabled={safePage >= totalPages}
                    onClick={() => goPage(safePage + 1)}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-30"
                  >
                    Próxima →
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
