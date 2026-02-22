import { useRef } from "react";
import { trpc } from "../lib/trpc";

type Folder = "products" | "banners" | "settings";

export function UploadButton({
  folder,
  onUpload,
  children,
  className = "",
}: {
  folder: Folder;
  onUpload: (url: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.admin.upload.useMutation();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    try {
      const result = await uploadMutation.mutateAsync({ dataUrl, folder });
      onUpload(result.url);
    } catch (err) {
      console.error(err);
      alert("Échec de l’upload.");
    }
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        type="button"
        className={className}
        onClick={() => inputRef.current?.click()}
        disabled={uploadMutation.isPending}
      >
        {uploadMutation.isPending ? "Upload…" : children}
      </button>
    </>
  );
}
