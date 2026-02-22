import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Download, ShoppingCart, Star } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

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

function getCategoryLabel(category: string) {
  return CATEGORY_LABELS[category] ?? category;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0");
  const { isAuthenticated } = useAuth();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const productQuery = trpc.products.getById.useQuery(productId);
  const variantsQuery = trpc.products.getVariants.useQuery(productId);
  const imagesQuery = trpc.products.getImages.useQuery(productId);
  const reviewsQuery = trpc.reviews.getByProduct.useQuery(productId);
  const cartMutation = trpc.cart.add.useMutation();

  const product = productQuery.data;
  const variants = variantsQuery.data ?? [];
  const images = imagesQuery.data ?? [];

  const galleryUrls = useMemo(() => {
    const main = product?.previewImageUrl;
    if (!main) return [];
    const rest = (images as { imageUrl: string }[]).map((i) => i.imageUrl);
    return [main, ...rest];
  }, [product?.previewImageUrl, images]);

  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[], [variants]);
  const colors = useMemo(() => [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[], [variants]);

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) return null;
    if (selectedSize || selectedColor) {
      return variants.find(
        (v) => (v.size === selectedSize || !selectedSize) && (v.color === selectedColor || !selectedColor)
      ) ?? null;
    }
    return variants[0] ?? null;
  }, [variants, selectedSize, selectedColor]);

  const displayPrice = (product as { salePrice?: string } | null)?.salePrice
    ? String((product as { salePrice?: string }).salePrice)
    : null;
  const hasSale = Boolean(displayPrice && product?.price);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Veuillez vous connecter pour ajouter au panier");
      return;
    }
    if (variants.length > 0 && !selectedVariant) {
      toast.error("Veuillez choisir une taille et/ou une couleur");
      return;
    }
    if (variants.length > 0 && selectedVariant && selectedVariant.stock < quantity) {
      toast.error("Stock insuffisant pour cette quantité");
      return;
    }
    if (variants.length > 0 && selectedVariant && selectedVariant.stock <= 0) {
      toast.error("Ce produit est en rupture de stock pour cette variante");
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartMutation.mutateAsync({
        productId: product!.id,
        variantId: selectedVariant?.id,
        quantity,
      });
      toast.success("Produit ajouté au panier");
    } catch (error: unknown) {
      toast.error((error as { message?: string })?.message || "Erreur lors de l'ajout au panier");
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

  const reference = (product as { reference?: string }).reference;
  const stockInfo = variants.length > 0 && selectedVariant
    ? selectedVariant.stock <= 0
      ? "Rupture de stock"
      : `Stock disponible ${selectedVariant.stock} restant${selectedVariant.stock > 1 ? "s" : ""}`
    : null;
  const canAddToCart = variants.length === 0 || (selectedVariant != null && selectedVariant.stock >= quantity);

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-6">
        <Link href="/">
          <button className="flex items-center gap-2 text-[#8c8070] hover:text-[#6d6458] font-semibold mb-6">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </Link>
      </div>

      <div className="container max-w-4xl pb-12">
        {/* Fil d'Ariane */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-[#8c8070]">Accueil</Link>
          <span className="mx-2">/</span>
          <span>{getCategoryLabel(product.category)}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Galerie */}
          <div className="space-y-3">
            <div className="flex justify-center items-center bg-gray-50 rounded-xl overflow-hidden h-96">
              <img
                src={galleryUrls[selectedImageIndex] ?? product.previewImageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {galleryUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {galleryUrls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === i ? "border-[#8c8070]" : "border-transparent"
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-[#b4aa9b]/20 text-[#8c8070] rounded-full text-sm font-semibold mb-3">
              {getCategoryLabel(product.category)}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {reference && (
              <p className="text-sm text-gray-500 mb-4">Référence: {reference}</p>
            )}

            {averageRating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
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

            {/* Prix */}
            <div className="mb-6">
              {hasSale ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl text-gray-400 line-through">{product.price} DT</span>
                  <span className="text-4xl font-bold text-[#8c8070]">{displayPrice} DT</span>
                </div>
              ) : (
                <div className="text-4xl font-bold text-[#8c8070]">{product.price} DT</div>
              )}
            </div>

            <p className="text-gray-600 mb-6">
              {product.description || "Produit de qualité"}
            </p>

            {/* Variantes: Taille */}
            {sizes.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Taille</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                        selectedSize === s
                          ? "border-[#8c8070] bg-[#8c8070] text-white"
                          : "border-gray-300 hover:border-[#8c8070]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variantes: Couleur */}
            {colors.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                        selectedColor === c
                          ? "border-[#8c8070] bg-[#8c8070] text-white"
                          : "border-gray-300 hover:border-[#8c8070]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {stockInfo && (
              <p className={`text-sm mb-4 ${selectedVariant && selectedVariant.stock <= 0 ? "text-red-600" : "text-gray-600"}`}>
                {stockInfo}
              </p>
            )}

            {/* Quantité (si variantes) */}
            {variants.length > 0 && selectedVariant && selectedVariant.stock > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                <input
                  type="number"
                  min={1}
                  max={selectedVariant.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(selectedVariant.stock, parseInt(e.target.value, 10) || 1)))}
                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !canAddToCart}
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

            {/* Stats optionnels (si pas variantes / produit digital) */}
            {(product.downloads > 0 || product.fileSize || product.fileType) && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{product.downloads}</p>
                  <p className="text-sm text-gray-600">Téléchargements</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {product.fileSize ? `${(product.fileSize / 1024 / 1024).toFixed(2)} MB` : "—"}
                  </p>
                  <p className="text-sm text-gray-600">Taille fichier</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{product.fileType || "—"}</p>
                  <p className="text-sm text-gray-600">Type</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#b4aa9b]/10 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos du créateur</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8c8070] to-[#b4aa9b] flex items-center justify-center text-white text-2xl font-bold">
              {product.creatorId.toString().charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">Créateur ID: {product.creatorId}</p>
              <p className="text-sm text-gray-600">Créateur de contenu</p>
            </div>
          </div>
        </div>

        {reviewsQuery.data && reviewsQuery.data.length > 0 && (
          <div className="mb-12">
            <h2 className="section-title">Avis des clients</h2>
            <div className="space-y-4">
              {reviewsQuery.data.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && <p className="text-gray-700">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
