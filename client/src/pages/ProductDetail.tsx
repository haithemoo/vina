import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Download, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const productQuery = trpc.products.getById.useQuery(parseInt(id || "0"));
  const reviewsQuery = trpc.reviews.getByProduct.useQuery(parseInt(id || "0"));
  const cartMutation = trpc.cart.add.useMutation();

  const product = productQuery.data;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour ajouter au panier");
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartMutation.mutateAsync(product!.id);
      toast.success("Produit ajouté au panier");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout au panier");
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (productQuery.isLoading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="container max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
          <Link href="/">
            <Button className="btn-primary">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageRating =
    reviewsQuery.data && reviewsQuery.data.length > 0
      ? (
          reviewsQuery.data.reduce((sum, r) => sum + r.rating, 0) /
          reviewsQuery.data.length
        ).toFixed(1)
      : null;

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
      </div>

      {/* Product Details */}
      <div className="container max-w-4xl pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden h-96">
            <img
              src={product.previewImageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-[#b4aa9b]/20 text-[#8c8070] rounded-full text-sm font-semibold mb-3">
                        {product.category === 'women' ? 'Femmes' :
                         product.category === 'men' ? 'Hommes' :
                         product.category === 'children' ? 'Enfants' :
                         product.category === 'dresses' ? 'Robes' :
                         product.category === 'suits' ? 'Costumes' :
                         product.category === 'sportswear' ? 'Sport' :
                         product.category === 'accessories' ? 'Accessoires' :
                         product.category === 'shoes' ? 'Chaussures' :
                         product.category === 'bags' ? 'Sacs' :
                         product.category === 'jewelry' ? 'Bijoux' : 'Autres'}
                      </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {averageRating && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(parseFloat(averageRating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {averageRating} ({reviewsQuery.data?.length} avis)
                </span>
              </div>
            )}

            <p className="text-gray-600 text-lg mb-6">
              {product.description || "Produit numérique de qualité"}
            </p>

            {/* Price and Actions */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="text-4xl font-bold text-[#8c8070] mb-4">
                {product.price} DT
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full btn-primary gap-2 py-3 text-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isAddingToCart ? "Ajout en cours..." : "Ajouter au panier"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-3 text-lg"
                  disabled={!isAuthenticated}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Télécharger après achat
                </Button>
              </div>
            </div>

            {/* Product Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {product.downloads}
                </p>
                <p className="text-sm text-gray-600">Téléchargements</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {product.fileSize ? `${(product.fileSize / 1024 / 1024).toFixed(2)}MB` : "N/A"}
                </p>
                <p className="text-sm text-gray-600">Taille du fichier</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {product.fileType || "Digital"}
                </p>
                <p className="text-sm text-gray-600">Type</p>
              </div>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="bg-[#b4aa9b]/10 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos du créateur</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8c8070] to-[#b4aa9b] flex items-center justify-center text-white text-2xl font-bold">
              {product.creatorId.toString().charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">Créateur ID: {product.creatorId}</p>
              <p className="text-sm text-gray-600">Créateur de contenu numérique</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviewsQuery.data && reviewsQuery.data.length > 0 && (
          <div className="mb-12">
            <h2 className="section-title">Avis des clients</h2>
            <div className="space-y-4">
              {reviewsQuery.data.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
