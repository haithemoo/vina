import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link, useLocation, useSearchParams } from "wouter";
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function Checkout() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

  const cartQuery = trpc.cart.getItems.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createCheckoutSessionMutation = trpc.orders.createCheckoutSession.useMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
    
    // Check for payment status from URL
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    
    if (success === "true") {
      setPaymentStatus("success");
      toast.success("Paiement réussi ! Merci pour votre commande.");
    } else if (canceled === "true") {
      setPaymentStatus("canceled");
      toast.info("Paiement annulé. Vous pouvez réessayer.");
    }
  }, [isAuthenticated, navigate, searchParams]);

  const items = cartQuery.data || [];
  const total = items.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || "0");
    return sum + price;
  }, 0);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }

    setIsProcessing(true);
    try {
      // Prepare items for Stripe checkout
      const checkoutItems = items.map(item => ({
        productId: item.product?.id || 0,
        price: item.product?.price || "0",
        name: item.product?.name || "Product",
      }));

      // Create Stripe checkout session
      const result = await createCheckoutSessionMutation.mutateAsync({
        items: checkoutItems,
      });

      if (result.url) {
        // Redirect to Stripe checkout
        window.location.href = result.url;
      } else {
        toast.error("Erreur lors de la création de la session de paiement");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du traitement du paiement");
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  // Show success or canceled message
  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Merci pour votre commande !
          </h1>
          <p className="text-gray-600 mb-6">
            Votre paiement a été traité avec succès. Vous pouvez suivre votre commande dans la section "Mes commandes".
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/orders">
              <Button className="btn-primary">Voir mes commandes</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Continuer vos achats</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === "canceled") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Paiement annulé
          </h1>
          <p className="text-gray-600 mb-6">
            Le paiement a été annulé. Vous pouvez réessayer ou revenir plus tard.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/cart">
              <Button className="btn-primary">Retour au panier</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Continuer vos achats</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="container py-6">
        <Link href="/cart">
          <button className="flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold mb-6">
            <ArrowLeft className="w-4 h-4" />
            Retour au panier
          </button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Paiement</h1>
      </div>

      <div className="container pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Informations de paiement
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Informations de paiement
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 bg-white">
                    <p className="text-gray-600 text-sm">
                      Vous serez redirigé vers Stripe pour compléter votre paiement de manière sécurisée.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Mode test :</strong> Utilisez la carte 4242 4242 4242 4242 pour tester
                  </p>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing || items.length === 0}
                  className="w-full btn-primary py-3 text-lg gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    `Payer ${total.toFixed(2)}$`
                  )}
                </Button>

                <p className="text-xs text-gray-600 text-center">
                  Paiement sécurisé avec Stripe
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Résumé de la commande
              </h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1">
                      {item.product?.name}
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${item.product?.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frais de traitement</span>
                  <span>$0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-violet-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/cart">
                <Button variant="outline" className="w-full mt-4">
                  Modifier le panier
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
