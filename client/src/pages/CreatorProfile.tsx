import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CreatorProfile() {
  const { id } = useParams<{ id: string }>();

  const creatorQuery = trpc.creators.getById.useQuery(parseInt(id || "0"));
  const productsQuery = trpc.products.getByCreator.useQuery({
    creatorId: parseInt(id || "0"),
    limit: 20,
  });

  const creator = creatorQuery.data;

  if (creatorQuery.isLoading) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="container max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-32" />
            <div className="h-48 bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Créateur non trouvé
          </h1>
          <Link href="/">
            <Button className="btn-primary">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

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

      {/* Creator Banner */}
      <div className="bg-gradient-to-r from-[#b4aa9b]/20 to-[#8c8070]/10 h-48">
        {creator.bannerUrl && (
          <img
            src={creator.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Creator Info */}
      <div className="container max-w-4xl -mt-24 relative z-10 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-8 items-start md:items-end">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#8c8070] to-[#b4aa9b] flex items-center justify-center text-white text-5xl font-bold flex-shrink-0">
            {creator.displayName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {creator.displayName}
              </h1>
              {creator.isVerified && (
                <span className="bg-[#b4aa9b]/20 text-[#8c8070] px-3 py-1 rounded-full text-sm font-semibold">
                  ✓ Vérifié
                </span>
              )}
            </div>
            <p className="text-gray-600 mb-4">{creator.bio || "Créateur de contenu numérique"}</p>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Produits</p>
                <p className="text-2xl font-bold text-[#8c8070]">
                  {productsQuery.data?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Ventes totales</p>
                <p className="text-2xl font-bold text-[#8c8070]">
                  {creator.totalSales}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Revenus</p>
                <p className="text-2xl font-bold text-[#8c8070]">
                  ${creator.totalEarnings}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container max-w-4xl pb-12">
        <h2 className="section-title">Produits du créateur</h2>
        <p className="section-subtitle">
          Découvrez tous les produits de {creator.displayName}
        </p>

        {productsQuery.isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card-product animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : productsQuery.data && productsQuery.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsQuery.data.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <div className="card-product group">
                  <div className="relative overflow-hidden h-48 bg-gray-100">
                    <img
                      src={product.previewImageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                      {product.category}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-[#8c8070]">
                        ${product.price}
                      </span>
                      <span className="text-xs text-gray-500">
                        {product.downloads} téléchargements
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Ce créateur n'a pas encore de produits
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
