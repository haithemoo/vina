import { useState, useMemo } from "react";
import { trpc } from "../lib/trpc";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  completed: "Livrée",
  failed: "Annulée",
  refunded: "Remboursée",
  cancelled: "Annulée",
};

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "shipped", label: "Expédiée" },
  { value: "completed", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
  { value: "failed", label: "Échouée" },
  { value: "refunded", label: "Remboursée" },
];

export default function Orders() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const listQuery = trpc.admin.orders.list.useQuery({
    limit: 200,
    offset: 0,
    status: statusFilter || undefined,
  });
  const detailQuery = trpc.admin.orders.getById.useQuery(selectedId!, { enabled: selectedId != null });
  const updateStatusMutation = trpc.admin.orders.updateStatus.useMutation();
  const utils = trpc.useUtils();

  const orders = listQuery.data ?? [];
  const orderDetail = detailQuery.data;

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: status as "pending" | "confirmed" | "shipped" | "completed" | "failed" | "refunded" | "cancelled",
      });
      await utils.admin.orders.list.invalidate();
      if (selectedId === orderId) await utils.admin.orders.getById.invalidate();
    } catch (e) {
      console.error(e);
      alert("Erreur lors du changement de statut.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Commandes</h1>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filtrer par statut :</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {listQuery.isLoading ? (
            <div className="p-8 text-center text-gray-500">Chargement…</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className={`border-t border-gray-100 ${selectedId === o.id ? "bg-[#8c8070]/10" : "hover:bg-gray-50/50"}`}
                  >
                    <td className="px-4 py-3 font-medium">#{o.id}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {(o as { userName?: string | null }).userName ?? (o as { userEmail?: string | null }).userEmail ?? `#${o.userId}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("fr-FR") : "—"}
                    </td>
                    <td className="px-4 py-3">{Number(o.totalAmount).toFixed(2)} DT</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          o.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : o.status === "shipped" || o.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : o.status === "failed" || o.status === "refunded" || o.status === "cancelled"
                                ? "bg-gray-200 text-gray-700"
                                : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedId(o.id)}
                        className="text-[#8c8070] hover:underline"
                      >
                        Voir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {orders.length === 0 && !listQuery.isLoading && (
            <div className="p-8 text-center text-gray-500">Aucune commande.</div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Détail de la commande</h2>
          {selectedId == null ? (
            <p className="text-gray-500">Sélectionnez une commande.</p>
          ) : detailQuery.isLoading ? (
            <p className="text-gray-500">Chargement…</p>
          ) : orderDetail ? (
            <div className="space-y-4">
              <p><span className="text-gray-500">N° commande</span> #{orderDetail.id}</p>
              <p>
                <span className="text-gray-500">Nom utilisateur</span><br />
                <strong>{(orderDetail as { userName?: string | null }).userName ?? "—"}</strong>
              </p>
              <p>
                <span className="text-gray-500">Email</span><br />
                {(orderDetail as { userEmail?: string | null }).userEmail ?? "—"}
              </p>
              <p>
                <span className="text-gray-500">Adresse de livraison</span><br />
                {(orderDetail as { shippingAddress?: string | null }).shippingAddress ?? "—"}
              </p>
              <p>
                <span className="text-gray-500">Téléphone</span><br />
                {(orderDetail as { shippingPhone?: string | null }).shippingPhone ?? "—"}
              </p>
              <p><span className="text-gray-500">Total</span> {Number(orderDetail.totalAmount).toFixed(2)} DT</p>
              <p>
                <span className="text-gray-500">Statut</span> {STATUS_LABELS[orderDetail.status] ?? orderDetail.status}
              </p>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Changer le statut</label>
                <select
                  value={orderDetail.status}
                  onChange={(e) => handleStatusChange(orderDetail.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                >
                  {(["pending", "confirmed", "shipped", "completed", "cancelled", "failed", "refunded"] as const).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              {orderDetail.items && orderDetail.items.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Articles</p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {orderDetail.items.map((item: { id: number; productName: string; price: string }) => (
                      <li key={item.id}>{item.productName} — {Number(item.price).toFixed(2)} DT</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Commande introuvable.</p>
          )}
        </div>
      </div>
    </div>
  );
}
