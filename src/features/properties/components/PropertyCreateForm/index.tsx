import { useEffect, useMemo, useState } from "react";
import CityCombobox from "../../../../components/common/CityCombobox";
import { DDD77_CITIES } from "../../../../constants/ddd77Cities";
import { supabase } from "../../../../components/lib/supabase/client";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";

type Role = "imobiliaria" | "corretor" | "usuario";
type Purpose = "venda" | "aluguel" | "lancamento";
type PropertyType = "casa" | "apartamento" | "predio" | "loja" | "escritorio" | "terreno" | "rural";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toNumberOrNull(v: string) {
  if (!v.trim()) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function getMyRole(): Promise<Role | null> {
  const { data, error } = await supabase.from("profiles").select("role").single();
  if (error) return null;
  return (data?.role ?? null) as Role | null;
}

async function getMyImobiliariaId(): Promise<string | null> {
  // Para o policy "properties imobiliaria write own" funcionar,
  // precisamos setar imobiliaria_id que pertença ao owner_id=auth.uid()
  const { data, error } = await supabase
    .from("imobiliarias")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data?.id ?? null;
}

export default function PropertyCreateForm() {
  const [role, setRole] = useState<Role | null>(null);

  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("venda");
  const [type, setType] = useState<PropertyType>("casa");

  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [addressLine, setAddressLine] = useState("");

  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [parkingSpots, setParkingSpots] = useState("");
  const [areaM2, setAreaM2] = useState("");

  const [price, setPrice] = useState("");
  const [rent, setRent] = useState("");

  const [description, setDescription] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await getMyRole();
      setRole(r);
    })();
  }, []);

  const priceLabel = useMemo(() => {
    if (purpose === "aluguel") return "Aluguel (R$)";
    return "Preço (R$)";
  }, [purpose]);

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles(picked);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!title.trim()) return setMsg("Informe um título.");
    if (!city.trim()) return setMsg("Informe a cidade.");
    if (!role || role === "usuario") return setMsg("Seu usuário não tem permissão para criar imóveis.");

    setSubmitting(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) throw new Error("Você precisa estar logado.");

      // Montar payload conforme policies RLS
      let imobiliaria_id: string | null = null;
      let corretor_user_id: string | null = null;

      if (role === "imobiliaria") {
        imobiliaria_id = await getMyImobiliariaId();
        if (!imobiliaria_id) {
          throw new Error("Nenhuma imobiliária encontrada para seu usuário. Cadastre a imobiliária primeiro.");
        }
      }

      if (role === "corretor") {
        corretor_user_id = userId; // policy exige corretor_user_id = auth.uid()
      }

      const baseSlug = slugify(title);
      const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;

      const payload = {
        title: title.trim(),
        slug,
        purpose,
        type,
        status: "rascunho",
        created_by: userId,

        imobiliaria_id,
        corretor_user_id,

        state: "BA",
        city: city.trim(),
        neighborhood: neighborhood.trim() || null,
        address_line: addressLine.trim() || null,

        bedrooms: toNumberOrNull(bedrooms),
        bathrooms: toNumberOrNull(bathrooms),
        parking_spots: toNumberOrNull(parkingSpots),
        area_m2: toNumberOrNull(areaM2),

        price: purpose === "aluguel" ? null : toNumberOrNull(price),
        rent: purpose === "aluguel" ? toNumberOrNull(rent || price) : null,

        description: description.trim() || null,
      };

      // 1) Criar imóvel
      const { data: inserted, error: insertErr } = await supabase
        .from("properties")
        .insert(payload)
        .select("id")
        .single();

      if (insertErr) throw insertErr;
      const propertyId = inserted.id as string;

      // 2) Upload fotos + insert property_photos
      if (files.length > 0) {
        const bucket = "property-photos";

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          // Guardar num “diretório” do imóvel
          const safeName = file.name.replace(/\s+/g, "-");
          const path = `${propertyId}/${crypto.randomUUID()}-${safeName}`;

          const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
            upsert: false,
            cacheControl: "3600",
          });
          if (upErr) throw upErr;

          const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
          const url = pub.publicUrl;

          const { error: photoErr } = await supabase
            .from("property_photos")
            .insert({
              property_id: propertyId,
              url,
              sort_order: i,
            });

          if (photoErr) throw photoErr;
        }
      }

      setMsg("Imóvel criado com sucesso (rascunho).");
      setTitle("");
      setCity("");
      setNeighborhood("");
      setAddressLine("");
      setBedrooms("");
      setBathrooms("");
      setParkingSpots("");
      setAreaM2("");
      setPrice("");
      setRent("");
      setDescription("");
      setFiles([]);
    } catch (err: any) {
      setMsg(err?.message ?? "Erro ao criar imóvel.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Novo imóvel</h2>
        <p className="text-sm text-muted-foreground">
          Crie um imóvel em <b>rascunho</b>. Depois você publica quando estiver pronto.
        </p>
      </div>

      {msg && (
        <div className="rounded-xl border p-4 text-sm">
          {msg}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-medium">Título *</div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Casa ampla com 3 quartos" />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Finalidade *</div>
          <Select value={purpose} onValueChange={(v) => setPurpose(v as Purpose)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="venda">Venda</SelectItem>
              <SelectItem value="aluguel">Aluguel</SelectItem>
              <SelectItem value="lancamento">Lançamento</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Tipo *</div>
          <Select value={type} onValueChange={(v) => setType(v as PropertyType)}>
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
          <div className="text-sm font-medium">Cidade (DDD 77) *</div>
          <CityCombobox
            value={city}
            onChange={setCity}
            options={DDD77_CITIES}
            placeholder="Selecione a cidade"
            searchPlaceholder="Buscar cidade…"
            disabled={submitting}
          />
        </div>


        <div className="space-y-2">
          <div className="text-sm font-medium">Bairro</div>
          <Input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Ex: Centro" />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Endereço (linha)</div>
          <Input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="Ex: Rua X, nº Y" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Dormitórios</div>
          <Input inputMode="numeric" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="3" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Banheiros</div>
          <Input inputMode="numeric" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="2" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Vagas</div>
          <Input inputMode="numeric" value={parkingSpots} onChange={(e) => setParkingSpots(e.target.value)} placeholder="1" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Área (m²)</div>
          <Input inputMode="numeric" value={areaM2} onChange={(e) => setAreaM2(e.target.value)} placeholder="120" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {purpose === "aluguel" ? (
          <div className="space-y-2">
            <div className="text-sm font-medium">{priceLabel}</div>
            <Input inputMode="numeric" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="1500" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm font-medium">{priceLabel}</div>
            <Input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="350000" />
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-medium">Fotos</div>
          <input
            className="block w-full text-sm"
            type="file"
            accept="image/*"
            multiple
            onChange={onPickFiles}
          />
          {files.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {files.length} arquivo(s) selecionado(s)
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium">Descrição</div>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Conte os detalhes do imóvel..." />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Salvando..." : "Criar imóvel (rascunho)"}
        </Button>
      </div>
    </form>
  );
}
