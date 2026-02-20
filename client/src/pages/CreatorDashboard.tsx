import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Plus, Edit2, Trash2, BarChart3, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CreatorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "shirts" as const,
    price: "",
    previewImageUrl: "",
    fileUrl: "",
  });

  const creatorQuery = trpc.creators.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const productsQuery = trpc.products.getByCreator.useQuery(
    { creatorId: creatorQuery.data?.id || 0, limit: 50 },
    { enabled: !!creatorQuery.data?.id }
  );

  const createProductMutation = trpc.products.create.useMutation();
  const updateProductMutation = trpc.products.update.useMutation();
  const deleteProductMutation = trpc.products.delete.useMutation();

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProductMutation.mutateAsync({
        ...formData,
        price: formData.price,
      });
      toast.success("Produit créé avec succès");
      setFormData({
        name: "",
        description: "",
        category: "shirts",
        price: "",
        previewImageUrl: "",
        fileUrl: "",
      });
      setShowCreateForm(false);
      await productsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création du produit");
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await updateProductMutation.mutateAsync({
        id: editingProduct,
        ...formData,
      });
      toast.success("Produit mis à jour avec succès");
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        category: "shirts",
        price: "",
        previewImageUrl: "",
        fileUrl: "",
      });
      await productsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour du produit");
    }
  };

  const handleEditClick = (product: any) => {
    setEditingProduct(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      category: product.category as any,
      price: product.price,
      previewImageUrl: product.previewImageUrl,
      fileUrl: product.fileUrl,
    });
    setShowCreateForm(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    try {
      await deleteProductMutation.mutateAsync(productId);
      toast.success("Produit supprimé avec succès");
      await productsQuery.refetch();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression du produit");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Veuillez vous connecter
          </h1>
          <Link href="/">
            <Button className="btn-primary">Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!creatorQuery.data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Devenir créateur
          </h1>
          <p className="text-gray-600 mb-6">
            Vous n'êtes pas encore créateur. Créez votre profil pour commencer à vendre.
          </p>
          <Button className="btn-primary">Créer un profil créateur</Button>
        </div>
      </div>
    );
  }

  const creator = creatorQuery.data;
  const products = productsQuery.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord créateur
            </h1>
            <Link href="/">
              <Button variant="outline">Retour</Button>
            </Link>
          </div>

          {/* Creator Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Produits</p>
              <p className="text-3xl font-bold text-violet-600">
                {products.length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Ventes totales</p>
              <p className="text-3xl font-bold text-cyan-600">
                {creator.totalSales}
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Revenus</p>
              <p className="text-3xl font-bold text-pink-600">
                ${creator.totalEarnings}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Statut</p>
              <p className="text-lg font-bold text-green-600">
                {creator.isVerified ? "✓ Vérifié" : "En attente"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Create Product Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Mes produits</h2>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau produit
            </Button>
          </div>

          {showCreateForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingProduct ? "Modifier le produit" : "Créer un nouveau produit"}
              </h3>
              <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nom du produit
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ex: T-shirt Classique"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="shirts">T-shirts & Chemises</option>
                      <option value="pants">Pantalons</option>
                      <option value="accessories">Accessoires</option>
                      <option value="shoes">Chaussures</option>
                      <option value="other">Autres</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Décrivez votre produit..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Prix ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="29.99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      URL de l'aperçu
                    </label>
                    <Input
                      type="url"
                      required
                      value={formData.previewImageUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          previewImageUrl: e.target.value,
                        })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    URL du fichier
                  </label>
                  <Input
                    type="url"
                    required
                    value={formData.fileUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, fileUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    className="btn-primary"
                  >
                    {editingProduct
                      ? updateProductMutation.isPending
                        ? "Mise à jour..."
                        : "Mettre à jour"
                      : createProductMutation.isPending
                      ? "Création..."
                      : "Créer le produit"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingProduct(null);
                      setFormData({
                        name: "",
                        description: "",
                        category: "shirts",
                        price: "",
                        previewImageUrl: "",
                        fileUrl: "",
                      });
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Products List */}
        {productsQuery.isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Vous n'avez pas encore de produits</p>
            <p className="text-gray-500 text-sm mb-6">
              Créez votre premier produit pour commencer à vendre
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary gap-2"
            >
              <Plus className="w-4 h-4" />
              Créer un produit
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-100 overflow-hidden">
                  <img
                    src={product.previewImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {product.category}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-violet-600">
                      ${product.price}
                    </span>
                    <span className="text-xs text-gray-500">
                      {product.downloads} téléchargements
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => handleEditClick(product)}
                    >
                      <Edit2 className="w-4 h-4" />
                      Éditer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2 text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
