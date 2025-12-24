import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

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

export default function Lancamentos() {
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

    return {
      purpose: "lancamento" as const,
      type: (sp.get("type") ?? undefined) as any,
      city: sp.get("city") ?? undefined,
      neighborhood: sp.get("neighborhood") ?? undefined,
      minPrice: n0("minPrice"),
      maxPrice: n0("maxPrice"),
      bedrooms: n0("bedrooms"),
      suites: n0("suites"),
      bathrooms: n0("bathrooms"),
      parkingSpots: n0("parkingSpots"),
      sort: (sp.get("sort") ?? "recent") as any,
      page: safePage,
      pageSize: 12,
    };
  }, [sp, safePage]);

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
      <Seo title="77 Imóveis | Lançamentos" />

      <Container className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>Home</span>
            <span className="text-gray-300">/</span>
            <span className="text-lime-600 font-medium">Lançamentos</span>
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

        <div className="flex gap-8">
          {/* Sidebar */}
          <FiltersSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} hidePurpose />

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
                {loading ? "Carregando..." : `${items.length} lançamentos disponíveis`}
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
                <p className="mt-4 text-gray-500">Carregando lançamentos…</p>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center shadow-sm">
                <div className="w-20 h-20 mx-auto rounded-full bg-lime-50 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="font-semibold text-gray-900 text-lg">Nenhum lançamento disponível</div>
                <div className="text-gray-500 mt-2">Novos empreendimentos em breve. Fique ligado!</div>
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
