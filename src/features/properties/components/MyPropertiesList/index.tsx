import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../../components/ui/button";
import { fetchMyProperties, publishProperty, unpublishProperty, deleteProperty } from "../../dashboardApi";

function moneyBRL(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function MyPropertiesList({ baseEditPath, newPath }: { baseEditPath: (id: string) => string; newPath: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const data = await fetchMyProperties();
      setItems(data);
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function onPublish(id: string) {
    setMsg(null);
    try {
      await publishProperty(id);
      await load();
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao publicar.");
    }
  }

  async function onUnpublish(id: string) {
    setMsg(null);
    try {
      await unpublishProperty(id);
      await load();
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao despublicar.");
    }
  }

  async function onDelete(id: string) {
    setMsg(null);
    const ok = confirm("Tem certeza? Isso apaga o imóvel e as fotos.");
    if (!ok) return;

    try {
      await deleteProperty(id);
      await load();
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao apagar.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Meus imóveis</h1>
          <p className="text-sm text-muted-foreground">Rascunhos e publicados.</p>
        </div>

        <Button asChild>
          <Link to={newPath}>Novo imóvel</Link>
        </Button>
      </div>

      {msg && <div className="rounded-xl border p-4 text-sm">{msg}</div>}

      {loading ? (
        <div className="py-10">Carregando…</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border p-6">
          <div className="font-medium">Você ainda não tem imóveis</div>
          <div className="text-sm text-muted-foreground">Clique em “Novo imóvel” para começar.</div>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="grid grid-cols-12 gap-2 p-3 text-xs font-medium bg-muted/40">
            <div className="col-span-5">Título</div>
            <div className="col-span-2">Finalidade</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3 text-right">Ações</div>
          </div>

          {items.map((p) => {
            const priceLabel = p.purpose === "aluguel" ? moneyBRL(p.rent) : moneyBRL(p.price);
            const isPublished = p.status === "ativo" && !!p.published_at;

            return (
              <div key={p.id} className="grid grid-cols-12 gap-2 p-3 border-t items-center">
                <div className="col-span-5">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.city}{p.neighborhood ? ` • ${p.neighborhood}` : ""} • {priceLabel}
                  </div>
                </div>

                <div className="col-span-2 text-sm capitalize">{p.purpose}</div>
                <div className="col-span-2 text-sm capitalize">{p.status}</div>

                <div className="col-span-3 flex justify-end gap-2">
                  <Button variant="secondary" asChild>
                    <Link to={baseEditPath(p.id)}>Editar</Link>
                  </Button>

                  {isPublished ? (
                    <Button variant="secondary" onClick={() => void onUnpublish(p.id)}>
                      Despublicar
                    </Button>
                  ) : (
                    <Button onClick={() => void onPublish(p.id)}>
                      Publicar
                    </Button>
                  )}

                  <Button variant="destructive" onClick={() => void onDelete(p.id)}>
                    Apagar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
