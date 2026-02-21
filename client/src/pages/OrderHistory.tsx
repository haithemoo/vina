import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Download } from "lucide-react";
import { useState } from "react";

export default function OrderHistory() {
  const { isAuthenticated } = useAuth();
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const ordersQuery = trpc.orders.getHistory.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Veuillez vous connecter
          </h1>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour voir votre historique de commandes
          </p>
          <Link href="/">
            <Button className="btn-primary">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const orders = ordersQuery.data || [];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "En attente" },
      completed: { bg: "bg-green-100", text: "text-green-800", label: "Complétée" },
      failed: { bg: "bg-red-100", text: "text-red-800", label: "Échouée" },
      refunded: { bg: "bg-blue-100", text: "text-blue-800", label: "Remboursée" },
    };
    const s = statusMap[status] || statusMap.pending;
    return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${s.bg} ${s.text}`}>{s.label}</span>;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="container py-6">
        <Link href="/">
          <button className="flex items-center gap-2 text-[#8c8070] hover:text-[#6d6458] font-semibold mb-6">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Historique de mes commandes</h1>
      </div>

      <div className="container pb-12">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-6">Vous n'avez pas encore de commandes</p>
            <Link href="/">
              <Button className="btn-primary">Commencer à acheter</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedOrderId(
                      expandedOrderId === order.id ? null : order.id
                    )
                  }
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 mb-2">
                      Commande #{order.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#8c8070] mb-2">
                      ${order.totalAmount}
                    </p>
                    {getStatusBadge(order.status)}
                  </div>
                </button>

                {expandedOrderId === order.id && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6">
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Articles de cette commande
                      </h3>
                      <div className="space-y-3">
                        {/* Items would be loaded here */}
                        <p className="text-sm text-gray-600">
                          Articles de la commande #{order.id}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Montant total</p>
                        <p className="text-lg font-bold text-gray-900">
                          ${order.totalAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Statut</p>
                        <p className="font-semibold text-gray-900">
                          {order.status === "completed"
                            ? "Complétée"
                            : order.status === "pending"
                            ? "En attente"
                            : order.status}
                        </p>
                      </div>
                    </div>

                    {order.status === "completed" && (
                      <Button className="w-full btn-secondary gap-2">
                        <Download className="w-4 h-4" />
                        Télécharger les fichiers
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
