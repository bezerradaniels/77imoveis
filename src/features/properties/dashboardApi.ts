import { supabase } from "../../components/lib/supabase/client";
import type { Property } from "./types";

export async function fetchMyProperties() {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error("Não autenticado.");

  const { data, error } = await supabase
    .from("properties")
    .select("id,slug,title,purpose,type,status,city,neighborhood,price,rent,created_at,published_at")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as any[];
}

export async function fetchPropertyForEdit(id: string) {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  const photos = await fetchPropertyPhotos(id);
  return { property: data as any, photos };
}

export async function updateProperty(id: string, patch: Partial<Property> & Record<string, any>) {
  const { error } = await supabase.from("properties").update(patch).eq("id", id);
  if (error) throw error;
}

export async function publishProperty(id: string) {
  const { error } = await supabase
    .from("properties")
    .update({ status: "ativo", published_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function unpublishProperty(id: string) {
  const { error } = await supabase
    .from("properties")
    .update({ status: "inativo", published_at: null })
    .eq("id", id);

  if (error) throw error;
}

export async function fetchPropertyPhotos(propertyId: string) {
  const { data, error } = await supabase
    .from("property_photos")
    .select("id,url,sort_order,storage_path")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function uploadPropertyPhotos(propertyId: string, files: File[]) {
  const bucket = "property-photos";

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const safeName = file.name.replace(/\s+/g, "-");
    const storage_path = `${propertyId}/${crypto.randomUUID()}-${safeName}`;

    const { error: upErr } = await supabase.storage.from(bucket).upload(storage_path, file, {
      upsert: false,
      cacheControl: "3600",
    });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(storage_path);

    const { error: insErr } = await supabase.from("property_photos").insert({
      property_id: propertyId,
      url: pub.publicUrl,
      storage_path,
      sort_order: i,
    });
    if (insErr) throw insErr;
  }
}

export async function deletePhoto(photoId: string, storagePath: string | null) {
  const bucket = "property-photos";

  // remove do storage (se tivermos path)
  if (storagePath) {
    const { error: rmErr } = await supabase.storage.from(bucket).remove([storagePath]);
    if (rmErr) throw rmErr;
  }

  // remove registro
  const { error } = await supabase.from("property_photos").delete().eq("id", photoId);
  if (error) throw error;
}

export async function deleteProperty(propertyId: string) {
  // 1) pegar fotos (pra apagar do storage)
  const photos = await fetchPropertyPhotos(propertyId);
  const paths = photos.map((p: any) => p.storage_path).filter(Boolean) as string[];

  // 2) apagar storage
  if (paths.length > 0) {
    const { error: rmErr } = await supabase.storage.from("property-photos").remove(paths);
    if (rmErr) throw rmErr;
  }

  // 3) apagar imóvel (cascade apaga property_photos)
  const { error } = await supabase.from("properties").delete().eq("id", propertyId);
  if (error) throw error;
}
