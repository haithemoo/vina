import { trpc } from "../lib/trpc";

export default function Dashboard() {
  const productsQuery = trpc.admin.products.list.useQuery({ limit: 1000, offset: 0 });
  const ordersQuery = trpc.admin.orders.list.useQuery({ limit: 1000, offset: 0 });
  const usersQuery = trpc.admin.users.list.useQuery({ limit: 1000, offset: 0 });

  const products = productsQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const users = usersQuery.data ?? [];

  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const recentOrders = orders.slice(0, 5);
  const isLoading = productsQuery.isLoading || ordersQuery.isLoading || usersQuery.isLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <div className="animate-pulse space-y-4">Chargement…</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Produits</p>
              <p className="text-3xl font-bold text-gray-800">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Commandes</p>
              <p className="text-3xl font-bold text-gray-800">{orders.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Utilisateurs</p>
              <p className="text-3xl font-bold text-gray-800">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenus</p>
              <p className="text-3xl font-bold text-gray-800">{totalRevenue.toFixed(2)} DT</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Dernières commandes</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500">Aucune commande.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4">#</th>
                  <th className="pb-2 pr-4">Client ID</th>
                  <th className="pb-2 pr-4">Total</th>
                  <th className="pb-2 pr-4">Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100">
                    <td className="py-3 pr-4">#{o.id}</td>
                    <td className="py-3 pr-4">{o.userId}</td>
                    <td className="py-3 pr-4">{Number(o.totalAmount).toFixed(2)} DT</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          o.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : o.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {o.status}
                      </span>
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
