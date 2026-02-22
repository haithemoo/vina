import { useState, useMemo } from "react";
import { Link } from "wouter";
import { trpc } from "../lib/trpc";

type Row = {
  id: number;
  productId: number;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
  productName: string | null;
  productReference: string | null;
};

export default function Stock() {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [draftStock, setDraftStock] = useState<Record<number, number>>({});
  const [filterSize, setFilterSize] = useState<string>("");
  const [filterColor, setFilterColor] = useState<string>("");

  const listQuery = trpc.admin.stock.list.useQuery(
    useMemo(() => ({ size: filterSize || undefined, color: filterColor || undefined }), [filterSize, filterColor])
  );
  const updateMutation = trpc.admin.stock.updateVariant.useMutation();
  const utils = trpc.useUtils();
  const rows = (listQuery.data ?? []) as Row[];

  const sizes = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => { if (r.size) s.add(r.size); });
    return Array.from(s).sort();
  }, [rows]);
  const colors = useMemo(() => {
    const c = new Set<string>();
    rows.forEach((r) => { if (r.color) c.add(r.color); });
    return Array.from(c).sort();
  }, [rows]);

  const getStock = (r: Row) => (draftStock[r.id] !== undefined ? draftStock[r.id] : r.stock);

  const handleSave = async (id: number) => {
    const stock = draftStock[id] ?? rows.find((x) => x.id === id)?.stock;
    if (stock === undefined) return;
    setUpdatingId(id);
    try {
      await updateMutation.mutateAsync({ id, stock });
      await utils.admin.stock.list.invalidate();
      setDraftStock((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la mise à jour du stock.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Gestion du stock</h1>
          <p className="text-sm text-gray-500">
            Référence principale (SKU parent) et sous-références (taille, couleur). Stock par variation.
          </p>
        </div>
        <Link href="/admin/products">
          <button type="button" className="bg-[#8c8070] text-white px-6 py-2 rounded-lg hover:bg-[#6d6458] font-medium">
            + Nouveau produit
          </button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-gray-100">
        <span className="text-sm font-medium text-gray-700">Filtres :</span>
        <select
          value={filterSize}
          onChange={(e) => setFilterSize(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Toutes les tailles</option>
          {sizes.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filterColor}
          onChange={(e) => setFilterColor(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">Toutes les couleurs</option>
          {colors.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {(filterSize || filterColor) && (
          <button
            type="button"
            onClick={() => { setFilterSize(""); setFilterColor(""); }}
            className="text-sm text-[#8c8070] hover:underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {listQuery.isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucune variante. Ajoutez des variantes (taille, couleur, SKU) dans la fiche de chaque produit.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Référence (SKU parent)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Produit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">SKU variante</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Taille</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Couleur</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-800">{r.productReference ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.productName ?? `Produit #${r.productId}`}</td>
                    <td className="px-4 py-3 font-mono text-sm">{r.sku}</td>
                    <td className="px-4 py-3 text-gray-600">{r.size ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{r.color ?? "—"}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        className="w-20 px-2 py-1 border border-gray-200 rounded"
                        value={getStock(r)}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          setDraftStock((prev) => ({ ...prev, [r.id]: isNaN(v) || v < 0 ? 0 : v }));
                        }}
                        disabled={updatingId === r.id}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSave(r.id)}
                        disabled={updatingId === r.id}
                        className="text-sm bg-[#8c8070] text-white px-2 py-1 rounded hover:bg-[#6d6458] disabled:opacity-50"
                      >
                        {updatingId === r.id ? "…" : "Mettre à jour"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
