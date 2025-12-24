import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Container from "../../components/common/Container";
import Seo from "../../components/common/Seo";
import { supabase } from "../../components/lib/supabase/client";

function moneyBRL(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function looksLikeUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export default function Property() {
  const { idOrSlug } = useParams();
  const key = idOrSlug as string;

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        // 1) buscar por slug; se não achar e for uuid, buscar por id
        let p: any = null;

        const bySlug = await supabase
          .from("properties")
          .select("*")
          .eq("slug", key)
          .maybeSingle();

        if (bySlug.error) throw bySlug.error;
        p = bySlug.data;

        if (!p && looksLikeUuid(key)) {
          const byId = await supabase.from("properties").select("*").eq("id", key).maybeSingle();
          if (byId.error) throw byId.error;
          p = byId.data;
        }

        if (!p) throw new Error("Imóvel não encontrado (ou não publicado).");

        const ph = await supabase
          .from("property_photos")
          .select("id,url,sort_order")
          .eq("property_id", p.id)
          .order("sort_order", { ascending: true });

        if (ph.error) throw ph.error;

        if (!alive) return;
        setProperty(p);
        setPhotos(ph.data ?? []);
      } catch (e: any) {
        if (!alive) return;
        setErrorMsg(e?.message ?? "Erro ao carregar imóvel.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [key]);

  if (loading) {
    return (
      <>
        <Seo title="77 Imóveis | Imóvel" />
        <Container className="py-10">Carregando…</Container>
      </>
    );
  }

  if (errorMsg || !property) {
    return (
      <>
        <Seo title="77 Imóveis | Imóvel" />
        <Container className="py-10">
          <div className="rounded-xl border p-6">
            <div className="font-medium">Ops…</div>
            <div className="text-sm text-muted-foreground">{errorMsg ?? "Imóvel não encontrado."}</div>
          </div>
        </Container>
      </>
    );
  }

  const priceLabel = property.purpose === "aluguel" ? moneyBRL(property.rent) : moneyBRL(property.price);

  return (
    <>
      <Seo title={`77 Imóveis | ${property.title}`} />
      <Container className="py-10 space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <div className="text-muted-foreground">
            {property.city}{property.neighborhood ? ` • ${property.neighborhood}` : ""} • {property.state}
          </div>
          <div className="text-xl font-semibold">{priceLabel}</div>
        </div>

        {photos.length > 0 ? (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {photos.map((ph) => (
              <img
                key={ph.id}
                src={ph.url}
                alt=""
                className="w-full aspect-square object-cover rounded-xl border"
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            Este imóvel ainda não tem fotos.
          </div>
        )}

        <div className="rounded-xl border p-6 space-y-2">
          <div className="font-medium">Detalhes</div>
          <div className="text-sm text-muted-foreground">
            {property.bedrooms ?? 0} dorm • {property.bathrooms ?? 0} ban • {property.area_m2 ?? 0} m²
          </div>
          {property.description ? (
            <p className="mt-3 whitespace-pre-wrap">{property.description}</p>
          ) : (
            <div className="text-sm text-muted-foreground">Sem descrição.</div>
          )}
        </div>
      </Container>
    </>
  );
}
