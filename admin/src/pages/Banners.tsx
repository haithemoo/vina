import { useState, useMemo } from "react";
import { trpc } from "../lib/trpc";
import { UploadButton } from "../components/UploadButton";

const PAGE_TYPES = [
  { value: "home", label: "Page d'accueil" },
  { value: "category", label: "Catégorie" },
  { value: "subcategory", label: "Sous-catégorie" },
  { value: "filter", label: "Filtre" },
  { value: "promotion", label: "Promotion" },
] as const;

const CATEGORY_IDENTIFIERS = [
  "women",
  "men",
  "children",
  "dresses",
  "suits",
  "sportswear",
  "accessories",
  "shoes",
  "bags",
  "jewelry",
  "other",
];

type BannerRow = {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  buttonText?: string | null;
  buttonLink?: string | null;
  linkUrl?: string | null;
  pageType: string;
  pageIdentifier?: string | null;
  sortOrder: number;
  startDate?: string | null;
  endDate?: string | null;
  status: string;
  isActive: boolean;
};

const defaultForm = {
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  buttonText: "",
  buttonLink: "",
  pageType: "home" as const,
  pageIdentifier: "" as string | null,
  sortOrder: 0,
  startDate: "" as string | null,
  endDate: "" as string | null,
  status: "active" as "active" | "inactive",
  isActive: true,
};

export default function Banners() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [filters, setFilters] = useState({
    pageType: "",
    status: "",
    pageIdentifier: "",
    dateFrom: "",
    dateTo: "",
  });

  const listQuery = trpc.admin.banners.list.useQuery(
    useMemo(() => {
      const q: { pageType?: string; status?: string; pageIdentifier?: string; dateFrom?: string; dateTo?: string } = {};
      if (filters.pageType) q.pageType = filters.pageType;
      if (filters.status) q.status = filters.status;
      if (filters.pageIdentifier) q.pageIdentifier = filters.pageIdentifier;
      if (filters.dateFrom) q.dateFrom = filters.dateFrom;
      if (filters.dateTo) q.dateTo = filters.dateTo;
      return Object.keys(q).length > 0 ? q : undefined;
    }, [filters])
  );
  const createMutation = trpc.admin.banners.create.useMutation();
  const updateMutation = trpc.admin.banners.update.useMutation();
  const deleteMutation = trpc.admin.banners.delete.useMutation();
  const imagesListQuery = trpc.admin.banners.images.list.useQuery(editingId ?? 0, { enabled: editingId != null });
  const imagesAddMutation = trpc.admin.banners.images.add.useMutation();
  const imagesDeleteMutation = trpc.admin.banners.images.delete.useMutation();
  const utils = trpc.useUtils();

  const banners = (listQuery.data ?? []) as BannerRow[];
  const bannerImagesList = imagesListQuery.data ?? [];

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...defaultForm, sortOrder: banners.length });
    setModalOpen(true);
  };

  const openEdit = (b: BannerRow) => {
    setEditingId(b.id);
    setForm({
      title: b.title,
      subtitle: b.subtitle ?? "",
      description: (b as any).description ?? "",
      imageUrl: b.imageUrl,
      buttonText: b.buttonText ?? b.linkUrl ?? "",
      buttonLink: b.buttonLink ?? b.linkUrl ?? "",
      pageType: (b.pageType as any) || "home",
      pageIdentifier: b.pageIdentifier ?? "",
      sortOrder: b.sortOrder ?? 0,
      startDate: b.startDate ?? "",
      endDate: b.endDate ?? "",
      status: ((b as any).status === "inactive" ? "inactive" : "active") as "active" | "inactive",
      isActive: b.isActive ?? true,
    });
    setModalOpen(true);
  };

  const save = async () => {
    try {
      const payload = {
        title: form.title,
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        imageUrl: form.imageUrl,
        buttonText: form.buttonText || undefined,
        buttonLink: form.buttonLink || undefined,
        pageType: form.pageType,
        pageIdentifier: form.pageIdentifier || undefined,
        sortOrder: form.sortOrder,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        status: form.status,
        isActive: form.isActive,
      };
      if (editingId !== null) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      await utils.admin.banners.list.invalidate();
      setModalOpen(false);
    } catch (e: unknown) {
      console.error(e);
      const errMsg = e != null && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : "Erreur enregistrement";
      alert(errMsg);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Supprimer cette bannière ?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      await utils.admin.banners.list.invalidate();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la suppression.");
    }
  };

  const pageIdentifierOptions = useMemo(() => {
    if (form.pageType === "category" || form.pageType === "subcategory" || form.pageType === "filter") {
      return CATEGORY_IDENTIFIERS.map((id) => ({ value: id, label: id }));
    }
    return [];
  }, [form.pageType]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Marketing → Gestion des Bannières</h1>
      <p className="text-sm text-gray-500 mb-4">
        Bannières page d'accueil, catégories et filtres. Ordre d'affichage et périodes d'activation.
      </p>

      {/* Filtres */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Type de page</label>
          <select
            value={filters.pageType}
            onChange={(e) => setFilters((f) => ({ ...f, pageType: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Tous</option>
            {PAGE_TYPES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="">Tous</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Page (identifiant)</label>
          <input
            type="text"
            value={filters.pageIdentifier}
            onChange={(e) => setFilters((f) => ({ ...f, pageIdentifier: e.target.value }))}
            placeholder="ex. women"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-32"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date début</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date fin</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <button
          type="button"
          onClick={() => setFilters({ pageType: "", status: "", pageIdentifier: "", dateFrom: "", dateTo: "" })}
          className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Réinitialiser
        </button>
      </div>

      {listQuery.isError && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          Erreur de chargement. Vérifiez que la migration <code>0007_banner_management.sql</code> est appliquée.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listQuery.isLoading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Chargement…</div>
        ) : (
          banners.map((b) => (
            <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <img
                src={b.imageUrl || "https://placehold.co/1200x400"}
                alt={b.title}
                className="w-full h-40 object-cover rounded-lg mb-4"
                loading="lazy"
              />
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-semibold text-gray-800 truncate flex-1">{b.title}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    (b as any).status === "inactive" || !b.isActive ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-800"
                  }`}
                >
                  {(b as any).status === "inactive" || !b.isActive ? "Inactif" : "Actif"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {PAGE_TYPES.find((p) => p.value === b.pageType)?.label ?? b.pageType}
                {b.pageIdentifier ? ` · ${b.pageIdentifier}` : ""}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEdit(b)}
                  className="flex-1 bg-[#8c8070] text-white py-2 rounded-lg hover:bg-[#6d6458] text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={() => remove(b.id)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 text-sm"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={openCreate}
        className="mt-6 bg-[#8c8070] text-white px-6 py-2 rounded-lg hover:bg-[#6d6458]"
      >
        + Nouvelle bannière
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl my-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingId !== null ? "Modifier la bannière" : "Nouvelle bannière"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="ex. Soldes d'hiver"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="" className="h-20 w-28 object-cover rounded" />
                  )}
                  <UploadButton
                    folder="banners"
                    onUpload={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
                    className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm hover:bg-gray-300"
                  >
                    Upload
                  </UploadButton>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                    className="flex-1 min-w-0 px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="URL de l'image"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bouton (texte)</label>
                <input
                  type="text"
                  value={form.buttonText}
                  onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="ex. Découvrir"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bouton (URL)</label>
                <input
                  type="text"
                  value={form.buttonLink}
                  onChange={(e) => setForm((f) => ({ ...f, buttonLink: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de page</label>
                <select
                  value={form.pageType}
                  onChange={(e) => setForm((f) => ({ ...f, pageType: e.target.value as any, pageIdentifier: e.target.value === "home" ? null : f.pageIdentifier }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  {PAGE_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page (identifiant)</label>
                <select
                  value={form.pageIdentifier ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, pageIdentifier: e.target.value || null }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  disabled={form.pageType === "home"}
                >
                  <option value="">— Par défaut —</option>
                  {pageIdentifierOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Début (date)</label>
                <input
                  type="date"
                  value={form.startDate ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value || null }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin (date)</label>
                <input
                  type="date"
                  value={form.endDate ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value || null }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  />
                  <span>Visible (isActive)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={form.status === "active"}
                    onChange={() => setForm((f) => ({ ...f, status: "active" }))}
                  />
                  <span>Actif</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={form.status === "inactive"}
                    onChange={() => setForm((f) => ({ ...f, status: "inactive" }))}
                  />
                  <span>Inactif</span>
                </label>
              </div>
              {editingId !== null && (
                <div className="md:col-span-2 border-t pt-4 mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Photos supplémentaires (carousel)</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {bannerImagesList.map((img: { id: number; imageUrl: string }) => (
                      <div key={img.id} className="relative group">
                        <img src={img.imageUrl} alt="" className="w-20 h-20 object-cover rounded border" loading="lazy" />
                        <button
                          type="button"
                          onClick={async () => {
                            await imagesDeleteMutation.mutateAsync(img.id);
                            await utils.admin.banners.images.list.invalidate();
                          }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <UploadButton
                    folder="banners"
                    onUpload={async (url) => {
                      if (!editingId) return;
                      await imagesAddMutation.mutateAsync({ bannerId: editingId, imageUrl: url, sortOrder: bannerImagesList.length });
                      await utils.admin.banners.images.list.invalidate();
                    }}
                    className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm hover:bg-gray-300"
                  >
                    + Ajouter une photo
                  </UploadButton>
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={save}
                disabled={createMutation.isPending || updateMutation.isPending || !form.title.trim() || !form.imageUrl.trim()}
                className="flex-1 bg-[#8c8070] text-white py-2 rounded-lg hover:bg-[#6d6458] disabled:opacity-50"
              >
                Enregistrer
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
