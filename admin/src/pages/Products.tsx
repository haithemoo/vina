import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { trpc } from "../lib/trpc";
import { UploadButton } from "../components/UploadButton";

const CATEGORIES = [
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
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  women: "Femmes",
  men: "Hommes",
  children: "Enfants",
  dresses: "Robes",
  suits: "Costumes",
  sportswear: "Sport",
  accessories: "Accessoires",
  shoes: "Chaussures",
  bags: "Sacs",
  jewelry: "Bijoux",
  other: "Autres",
};

export default function Products() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    reference: "",
    name: "",
    description: "",
    category: "women" as (typeof CATEGORIES)[number],
    price: "",
    salePrice: "",
    previewImageUrl: "",
    isFeatured: false,
    isActive: true,
  });

  const listQuery = trpc.admin.products.list.useQuery({ limit: 500, offset: 0 });
  const createMutation = trpc.admin.products.create.useMutation();
  const updateMutation = trpc.admin.products.update.useMutation();
  const deleteMutation = trpc.admin.products.delete.useMutation();
  const variantsListQuery = trpc.admin.products.variants.list.useQuery(editingId ?? 0, { enabled: editingId != null });
  const variantsCreateMutation = trpc.admin.products.variants.create.useMutation();
  const variantsUpdateMutation = trpc.admin.products.variants.update.useMutation();
  const variantsDeleteMutation = trpc.admin.products.variants.delete.useMutation();
  const [variantForm, setVariantForm] = useState({ sku: "", size: "", color: "", stock: 0 });
  const imagesListQuery = trpc.admin.products.images.list.useQuery(editingId ?? 0, { enabled: editingId != null });
  const imagesAddMutation = trpc.admin.products.images.add.useMutation();
  const imagesDeleteMutation = trpc.admin.products.images.delete.useMutation();

  const products = listQuery.data ?? [];
  const variants = variantsListQuery.data ?? [];
  const productImages = imagesListQuery.data ?? [];
  const utils = trpc.useUtils();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, search, categoryFilter]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Le nom du produit est requis.");
      return;
    }
    if (editingId === null && !formData.previewImageUrl.trim()) {
      alert("L'image est requise pour un nouveau produit.");
      return;
    }
    try {
      if (editingId !== null) {
        await updateMutation.mutateAsync({
          id: editingId,
          reference: formData.reference || undefined,
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category,
          price: formData.price || undefined,
          salePrice: formData.salePrice || undefined,
          previewImageUrl: formData.previewImageUrl || undefined,
          isFeatured: formData.isFeatured,
          isActive: formData.isActive,
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          category: formData.category,
          price: formData.price || "0",
          salePrice: formData.salePrice || undefined,
          reference: formData.reference || undefined,
          previewImageUrl: formData.previewImageUrl,
          isFeatured: formData.isFeatured,
          isActive: formData.isActive,
        });
      }
      await utils.admin.products.list.invalidate();
      setShowModal(false);
      setEditingId(null);
    } catch (e: unknown) {
      console.error(e);
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message: string }).message) : (editingId !== null ? "Erreur lors de la mise à jour." : "Erreur lors de la création.");
      alert(msg);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({
      reference: "",
      name: "",
      description: "",
      category: "women",
      price: "",
      salePrice: "",
      previewImageUrl: "",
      isFeatured: false,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce produit ? Il ne sera plus visible sur le site.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      await utils.admin.products.list.invalidate();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la suppression.");
    }
  };

  const openEdit = (productId: number) => {
    const p = products.find((pr) => pr.id === productId);
    if (!p) return;
    const rawPrice = p.price;
    const rawSale = (p as { salePrice?: string | number | null }).salePrice;
    const numPrice = rawPrice != null ? Number(rawPrice) : NaN;
    const numSale = rawSale != null && rawSale !== "" ? Number(rawSale) : NaN;
    setEditingId(p.id);
    setFormData({
      reference: (p as { reference?: string }).reference ?? "",
      name: p.name ?? "",
      description: p.description ?? "",
      category: (p.category as (typeof CATEGORIES)[number]) ?? "women",
      price: !Number.isNaN(numPrice) ? String(numPrice) : "",
      salePrice: !Number.isNaN(numSale) ? String(numSale) : "",
      previewImageUrl: p.previewImageUrl ?? "",
      isFeatured: p.isFeatured ?? false,
      isActive: p.isActive ?? true,
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Produits</h1>
        <button
          onClick={openCreate}
          className="bg-[#8c8070] text-white px-6 py-2 rounded-lg hover:bg-[#6d6458] font-medium"
        >
          + Nouveau produit
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8c8070] focus:border-transparent"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8c8070]"
          >
            <option value="all">Toutes les catégories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c] ?? c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {listQuery.isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement…</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Catégorie</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Prix</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <img
                      src={p.previewImageUrl || "https://placehold.co/80"}
                      alt={p.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{CATEGORY_LABELS[p.category] ?? p.category}</td>
                  <td className="px-4 py-3">{!Number.isNaN(Number(p.price)) ? Number(p.price).toFixed(2) : "—"} DT</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {p.isFeatured && (
                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded">Vedette</span>
                      )}
                      {!p.isActive && (
                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">Inactif</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEdit(p.id);
                      }}
                      className="bg-[#8c8070] text-white px-3 py-1.5 rounded-lg hover:bg-[#6d6458] text-sm font-medium mr-2"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {filteredProducts.length === 0 && !listQuery.isLoading && (
          <div className="p-8 text-center text-gray-500">
            Aucun produit. Cliquez sur &quot;Nouveau produit&quot; pour en ajouter.
          </div>
        )}
      </div>

      {showModal && createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          onClick={() => { setShowModal(false); setEditingId(null); }}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="product-modal-title" className="text-xl font-bold text-gray-800 mb-4">
              {editingId !== null ? "Modifier le produit" : "Nouveau produit"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence (SKU)</label>
                <input
                  type="text"
                  placeholder="ex. REF-001"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <input
                type="text"
                placeholder="Nom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                rows={2}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as (typeof CATEGORIES)[number] })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Prix (DT)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Prix soldes (DT)"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image produit</label>
                <div className="flex items-center gap-2">
                  {formData.previewImageUrl && (
                    <img src={formData.previewImageUrl} alt="" className="h-16 w-20 object-cover rounded" />
                  )}
                  <UploadButton
                    folder="products"
                    onUpload={(url) => setFormData((f) => ({ ...f, previewImageUrl: url }))}
                    className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm hover:bg-gray-300"
                  >
                    Upload
                  </UploadButton>
                  <input
                    type="text"
                    value={formData.previewImageUrl}
                    onChange={(e) => setFormData({ ...formData, previewImageUrl: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="ou URL"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                />
                <span>Mettre en vedette sur le site</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span>Visible sur le site</span>
              </label>
            </div>
            {editingId !== null && (
            <>
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Gestion du stock — Variantes (taille, couleur, SKU)</h3>
              <div className="space-y-2 mb-3">
                {variants.map((v) => (
                  <div key={v.id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 text-sm">
                    <span className="font-mono">{v.sku}</span>
                    <span>{v.size || "—"}</span>
                    <span>{v.color || "—"}</span>
                    <span className="font-medium">Stock: {v.stock}</span>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        className="w-16 px-2 py-1 border rounded"
                        value={v.stock}
                        onChange={async (e) => {
                          const stock = parseInt(e.target.value, 10);
                          if (isNaN(stock)) return;
                          await variantsUpdateMutation.mutateAsync({ id: v.id, stock });
                          await utils.admin.products.variants.list.invalidate();
                        }}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm("Supprimer cette variante ?")) return;
                          await variantsDeleteMutation.mutateAsync(v.id);
                          await utils.admin.products.variants.list.invalidate();
                        }}
                        className="text-red-600 text-xs"
                      >
                        Suppr.
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="SKU"
                  value={variantForm.sku}
                  onChange={(e) => setVariantForm((f) => ({ ...f, sku: e.target.value }))}
                  className="w-24 px-2 py-1 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Taille"
                  value={variantForm.size}
                  onChange={(e) => setVariantForm((f) => ({ ...f, size: e.target.value }))}
                  className="w-20 px-2 py-1 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Couleur"
                  value={variantForm.color}
                  onChange={(e) => setVariantForm((f) => ({ ...f, color: e.target.value }))}
                  className="w-24 px-2 py-1 border rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={variantForm.stock || ""}
                  onChange={(e) => setVariantForm((f) => ({ ...f, stock: parseInt(e.target.value, 10) || 0 }))}
                  className="w-16 px-2 py-1 border rounded text-sm"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!variantForm.sku.trim()) return;
                    await variantsCreateMutation.mutateAsync({
                      productId: editingId,
                      sku: variantForm.sku,
                      size: variantForm.size || undefined,
                      color: variantForm.color || undefined,
                      stock: variantForm.stock,
                    });
                    await utils.admin.products.variants.list.invalidate();
                    setVariantForm({ sku: "", size: "", color: "", stock: 0 });
                  }}
                  className="bg-[#8c8070] text-white px-3 py-1 rounded text-sm hover:bg-[#6d6458]"
                >
                  Ajouter
                </button>
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Images galerie (supplémentaires)</h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {productImages.map((img: { id: number; imageUrl: string }) => (
                  <div key={img.id} className="relative group">
                    <img src={img.imageUrl} alt="" className="w-16 h-16 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={async () => {
                        await imagesDeleteMutation.mutateAsync(img.id);
                        await utils.admin.products.images.list.invalidate();
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <UploadButton
                folder="products"
                onUpload={async (url) => {
                  if (!editingId) return;
                  await imagesAddMutation.mutateAsync({ productId: editingId, imageUrl: url, sortOrder: productImages.length });
                  await utils.admin.products.images.list.invalidate();
                }}
                className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm hover:bg-gray-300"
              >
                Ajouter une image
              </UploadButton>
            </div>
            </>
            )}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-[#8c8070] text-white py-2 rounded-lg hover:bg-[#6d6458] disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? (editingId !== null ? "Enregistrement…" : "Création…")
                  : "Enregistrer"}
              </button>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
