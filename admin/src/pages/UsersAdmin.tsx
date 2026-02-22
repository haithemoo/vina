import { useState } from "react";
import { trpc } from "../lib/trpc";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  sales: "Gestionnaire Vente en ligne",
  stock: "Gestionnaire Stock",
  designer: "Designer Graphique",
  user: "Client",
  creator: "Créateur",
  purchase: "Acheteur",
};

const BACK_OFFICE_ROLES = ["admin", "sales", "stock", "designer"] as const;
type BackOfficeRole = (typeof BACK_OFFICE_ROLES)[number];

export default function UsersAdmin() {
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ email: "", password: "", name: "", role: "sales" as BackOfficeRole });

  const listQuery = trpc.admin.users.list.useQuery({ limit: 200, offset: 0 });
  const createMutation = trpc.admin.users.create.useMutation();
  const utils = trpc.useUtils();
  const users = listQuery.data ?? [];

  const handleCreate = async () => {
    if (!createForm.email || !createForm.password || !createForm.name) {
      alert("Remplissez email, mot de passe et nom.");
      return;
    }
    try {
      await createMutation.mutateAsync(createForm);
      await utils.admin.users.list.invalidate();
      setShowCreate(false);
      setCreateForm({ email: "", password: "", name: "", role: "sales" });
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message;
      alert(msg || "Erreur lors de la création.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#8c8070] text-white px-4 py-2 rounded-lg hover:bg-[#6d6458]"
        >
          + Créer un compte
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Nouveau compte back office</h2>
            <p className="text-sm text-gray-500 mb-4">Rôle client non proposé : uniquement comptes avec accès back office.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value as BackOfficeRole }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="admin">Administrateur</option>
                  <option value="sales">Gestionnaire Vente en ligne (Produits + Commandes)</option>
                  <option value="stock">Gestionnaire Stock (Stock uniquement)</option>
                  <option value="designer">Designer Graphique (Bannières + Produits)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1 bg-[#8c8070] text-white py-2 rounded-lg hover:bg-[#6d6458] disabled:opacity-50"
              >
                Créer
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {listQuery.isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement…</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nom</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rôle</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Inscription</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">#{u.id}</td>
                  <td className="px-4 py-3 text-gray-800">{u.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : u.role === "sales"
                            ? "bg-green-100 text-green-800"
                            : u.role === "stock"
                              ? "bg-blue-100 text-blue-800"
                              : u.role === "designer"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {users.length === 0 && !listQuery.isLoading && (
          <div className="p-8 text-center text-gray-500">Aucun utilisateur.</div>
        )}
      </div>
    </div>
  );
}
