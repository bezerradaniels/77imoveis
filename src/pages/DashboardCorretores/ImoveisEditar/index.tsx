import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CityCombobox from "../../../components/common/CityCombobox";
import { DDD77_CITIES } from "../../../constants/ddd77Cities";
import Seo from "../../../components/common/Seo";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";

import { fetchPropertyForEdit, updateProperty } from "../../../features/properties/dashboardApi";
import PropertyPhotosManager from "../../../features/properties/components/PropertyPhotosManager";

export default function DashboardImovelEditarImobiliaria() {
  const { id } = useParams();
  const propertyId = id as string;

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [property, setProperty] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);

  async function load() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetchPropertyForEdit(propertyId);
      setProperty(res.property);
      setPhotos(res.photos);
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao carregar imóvel.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [propertyId]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await updateProperty(propertyId, {
        title: property.title,
        purpose: property.purpose,
        type: property.type,
        city: property.city,
        neighborhood: property.neighborhood,
        address_line: property.address_line,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parking_spots: property.parking_spots,
        area_m2: property.area_m2,
        price: property.price,
        rent: property.rent,
        description: property.description,
      });
      setMsg("Salvo com sucesso.");
    } catch (e: any) {
      setMsg(e?.message ?? "Erro ao salvar.");
    }
  }

  if (loading) return <div className="py-10">Carregando…</div>;
  if (!property) return <div className="rounded-xl border p-4">{msg ?? "Imóvel não encontrado."}</div>;

  return (
    <>
      <Seo title="77 Imóveis | Corretores - Editar imóvel" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Editar imóvel</h1>
          <p className="text-sm text-muted-foreground">Atualize os dados e gerencie as fotos.</p>
        </div>

        {msg && <div className="rounded-xl border p-4 text-sm">{msg}</div>}

        <form onSubmit={onSave} className="rounded-xl border p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Título</div>
              <Input value={property.title ?? ""} onChange={(e) => setProperty({ ...property, title: e.target.value })} />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Finalidade</div>
              <Select value={property.purpose} onValueChange={(v) => setProperty({ ...property, purpose: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="aluguel">Aluguel</SelectItem>
                  <SelectItem value="lancamento">Lançamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Tipo</div>
              <Select value={property.type} onValueChange={(v) => setProperty({ ...property, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="apartamento">Apartamento</SelectItem>
                  <SelectItem value="predio">Prédio</SelectItem>
                  <SelectItem value="loja">Loja</SelectItem>
                  <SelectItem value="escritorio">Escritório</SelectItem>
                  <SelectItem value="terreno">Terreno</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Cidade (DDD 77)</div>
              <CityCombobox
                value={property.city ?? ""}
                onChange={(v) => setProperty({ ...property, city: v })}
                options={DDD77_CITIES}
                placeholder="Selecione a cidade"
                searchPlaceholder="Buscar cidade…"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Bairro</div>
              <Input value={property.neighborhood ?? ""} onChange={(e) => setProperty({ ...property, neighborhood: e.target.value })} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Endereço (linha)</div>
              <Input value={property.address_line ?? ""} onChange={(e) => setProperty({ ...property, address_line: e.target.value })} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Dorms</div>
              <Input inputMode="numeric" value={property.bedrooms ?? ""} onChange={(e) => setProperty({ ...property, bedrooms: Number(e.target.value || 0) })} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Banheiros</div>
              <Input inputMode="numeric" value={property.bathrooms ?? ""} onChange={(e) => setProperty({ ...property, bathrooms: Number(e.target.value || 0) })} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Vagas</div>
              <Input inputMode="numeric" value={property.parking_spots ?? ""} onChange={(e) => setProperty({ ...property, parking_spots: Number(e.target.value || 0) })} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Área (m²)</div>
              <Input inputMode="numeric" value={property.area_m2 ?? ""} onChange={(e) => setProperty({ ...property, area_m2: Number(e.target.value || 0) })} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Preço (venda) / vazio se aluguel</div>
              <Input inputMode="numeric" value={property.price ?? ""} onChange={(e) => setProperty({ ...property, price: Number(e.target.value || 0) })} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Aluguel / vazio se venda</div>
              <Input inputMode="numeric" value={property.rent ?? ""} onChange={(e) => setProperty({ ...property, rent: Number(e.target.value || 0) })} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Descrição</div>
            <Textarea value={property.description ?? ""} onChange={(e) => setProperty({ ...property, description: e.target.value })} />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Salvar</Button>
          </div>
        </form>

        <PropertyPhotosManager propertyId={propertyId} photos={photos} onReload={load} />
      </div>
    </>
  );
}
