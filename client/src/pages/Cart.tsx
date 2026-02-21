import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const cartQuery = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const removeFromCartMutation = trpc.cart.remove.useMutation();
  const clearCartMutation = trpc.cart.clear.useMutation();

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await removeFromCartMutation.mutateAsync(cartItemId);
      await cartQuery.refetch();
      toast.success("Produit supprimé du panier");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Êtes-vous sûr de vouloir vider le panier ?")) return;
    try {
      await clearCartMutation.mutateAsync();
      await cartQuery.refetch();
      toast.success("Panier vidé");
    } catch (error) {
      toast.error("Erreur lors du vidage du panier");
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      setLocation("/checkout");
    } catch (error) {
      toast.error("Erreur lors du passage à la caisse");
      setIsCheckingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Veuillez vous connecter
          </h1>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour accéder à votre panier
          </p>
          <Link href="/">
            <Button className="btn-primary">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const items = cartQuery.data || [];
  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || "0");
    return sum + price;
  }, 0);

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
        <h1 className="text-3xl font-bold text-gray-900">Mon Panier</h1>
      </div>

      <div className="container pb-12">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-6">Votre panier est vide</p>
            <Link href="/">
              <Button className="btn-primary">Continuer vos achats</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4 flex gap-4"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product?.previewImageUrl}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/product/${item.product?.id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-[#8c8070] cursor-pointer">
                          {item.product?.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product?.category}
                      </p>
                      <p className="text-lg font-bold text-[#8c8070]">
                        {item.product?.price} DT
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleClearCart}
                className="mt-6 text-red-600 hover:text-red-700 font-semibold"
              >
                Vider le panier
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Résumé de la commande
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{total.toFixed(2)} DT</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Frais de traitement</span>
                    <span>0.00 DT</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-[#8c8070]">{total.toFixed(2)} DT</span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut || items.length === 0}
                  className="w-full btn-primary py-3 text-lg mb-3"
                >
                  {isCheckingOut ? "Traitement..." : "Procéder au paiement"}
                </Button>

                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Continuer vos achats
                  </Button>
                </Link>

                <p className="text-xs text-gray-600 text-center mt-4">
                  Paiement sécurisé avec Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
