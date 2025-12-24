import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { deletePhoto, uploadPropertyPhotos } from "../../dashboardApi";

export default function PropertyPhotosManager({
  propertyId,
  photos,
  onReload,
}: {
  propertyId: string;
  photos: any[];
  onReload: () => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setMsg(null);
    try {
      await uploadPropertyPhotos(propertyId, files);
      await onReload();
      e.target.value = "";
    } catch (err: any) {
      setMsg(err?.message ?? "Erro ao enviar fotos.");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(photoId: string, storage_path: string | null) {
    const ok = confirm("Apagar esta foto?");
    if (!ok) return;

    setMsg(null);
    try {
      await deletePhoto(photoId, storage_path);
      await onReload();
    } catch (err: any) {
      setMsg(err?.message ?? "Erro ao apagar foto.");
    }
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Fotos</div>
          <div className="text-sm text-muted-foreground">Você pode adicionar e remover fotos.</div>
        </div>

        <div className="text-sm">
          <label className="cursor-pointer underline">
            {uploading ? "Enviando..." : "Adicionar fotos"}
            <input className="hidden" type="file" accept="image/*" multiple onChange={onUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {msg && <div className="text-sm">{msg}</div>}

      {photos.length === 0 ? (
        <div className="text-sm text-muted-foreground">Nenhuma foto ainda.</div>
      ) : (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="rounded-xl border overflow-hidden">
              <img src={p.url} alt="" className="w-full aspect-square object-cover" />
              <div className="p-2 flex justify-end">
                <Button variant="destructive" size="sm" onClick={() => void onDelete(p.id, p.storage_path ?? null)}>
                  Apagar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
