import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LogOut, ShoppingBag, User, Settings } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnecté avec succès");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenue, {user?.name || "Utilisateur"}
              </h1>
              <p className="text-gray-600 mt-1">{user?.email}</p>
            </div>
            <Link href="/">
              <Button variant="outline">Retour</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Actions rapides
            </h2>
            <div className="space-y-4">
              <Link href="/orders">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#b4aa9b]/20 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-[#8c8070]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Mes commandes
                      </h3>
                      <p className="text-sm text-gray-600">
                        Voir l'historique de vos achats
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/creator-dashboard">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#b4aa9b]/20 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-[#8c8070]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Profil créateur
                      </h3>
                      <p className="text-sm text-gray-600">
                        Gérer vos produits et revenus
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/cart">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#b4aa9b]/20 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-[#8c8070]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Mon panier
                      </h3>
                      <p className="text-sm text-gray-600">
                        Voir et modifier votre panier
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Account Settings */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Paramètres du compte
            </h2>
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Informations personnelles
                  </h3>
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Nom</p>
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">E-mail</p>
                    <p className="font-semibold text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Rôle</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Sécurité
                </h3>
                <Button variant="outline" className="w-full mb-2">
                  Changer le mot de passe
                </Button>
                <Button variant="outline" className="w-full">
                  Activer l'authentification à deux facteurs
                </Button>
              </div>

              <Button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>

        {/* Account Preferences */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Préférences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  Notifications par e-mail
                </p>
                <p className="text-sm text-gray-600">
                  Recevez des mises à jour sur vos commandes
                </p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  Notifications de produits
                </p>
                <p className="text-sm text-gray-600">
                  Soyez informé des nouveaux produits
                </p>
              </div>
              <input type="checkbox" className="w-5 h-5" />
            </div>
            <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  Infolettre
                </p>
                <p className="text-sm text-gray-600">
                  Recevez nos dernières offres et promotions
                </p>
              </div>
              <input type="checkbox" className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
