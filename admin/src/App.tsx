import { useState, useEffect } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Image, 
  Settings,
  Menu,
  X,
  LogOut,
  Layers
} from "lucide-react";

// Pages du Back Office
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Stock from "./pages/Stock";
import UsersAdmin from "./pages/UsersAdmin";
import Banners from "./pages/Banners";
import SettingsAdmin from "./pages/Settings";
import Login from "./pages/Login";
import { trpc } from "./lib/trpc";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/products", label: "Produits", icon: Package },
  { path: "/admin/stock", label: "Stock", icon: Layers },
  { path: "/admin/orders", label: "Commandes", icon: ShoppingCart },
  { path: "/admin/users", label: "Utilisateurs", icon: Users },
  { path: "/admin/banners", label: "Bannières", icon: Image },
  { path: "/admin/settings", label: "Paramètres", icon: Settings },
];

function Sidebar({ isOpen, onClose, items }: { isOpen: boolean; onClose: () => void; items: typeof navItems }) {
  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-[#1a1a1a] text-white transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          <Link href="/admin">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-[#8c8070] rounded-full flex items-center justify-center">
                <span className="text-white font-bold">V</span>
              </div>
              <span className="text-xl font-bold">VINA Admin</span>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {items.map((item) => (
            <Link key={item.path} href={item.path}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 space-y-2">
          <a href="/" className="block">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors text-gray-400">
              <LogOut className="w-5 h-5" />
              <span>Retour au site</span>
            </div>
          </a>
        </div>
      </aside>
    </>
  );
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const utils = trpc.useUtils();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Back Office VINA</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 hidden sm:inline">Administrateur</span>
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-[#8c8070] hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </header>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const meQuery = trpc.auth.me.useQuery();

  const role = (meQuery.data?.role as string) ?? "";
  const isAdmin = ["admin", "stock", "sales", "purchase", "designer"].includes(role);
  const isLoading = meQuery.isLoading;

  // Permissions strictes : Admin = tout ; Gestionnaire Vente en ligne (sales) = Produits + Commandes ; Gestionnaire Stock (stock) = Stock uniquement ; Designer = Bannières + Produits
  const canAccess = (path: string) => {
    if (role === "admin") return true;
    if (path === "/admin") return true;
    if (path === "/admin/stock" && role === "stock") return true;
    if (path === "/admin/orders" && role === "sales") return true;
    if (path === "/admin/products" && (role === "sales" || role === "designer")) return true;
    if (path === "/admin/banners" && role === "designer") return true;
    if (path === "/admin/users" || path === "/admin/settings") return role === "admin";
    return false;
  };
  const navItemsFiltered = navItems.filter((item) => canAccess(item.path));

  // Rediriger /admin/login vers /admin si déjà connecté admin
  useEffect(() => {
    if (isAdmin && location === "/admin/login") {
      setLocation("/admin");
    }
  }, [isAdmin, location, setLocation]);

  // Non connecté ou pas admin : afficher la page de connexion
  if (!isLoading && !isAdmin) {
    return <Login />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Chargement…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} items={navItemsFiltered} />
      
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-8">
          <Switch>
            <Route path="/admin" component={Dashboard} />
            <Route path="/admin/products" component={Products} />
            <Route path="/admin/stock" component={Stock} />
            <Route path="/admin/orders" component={Orders} />
            <Route path="/admin/users" component={UsersAdmin} />
            <Route path="/admin/banners" component={Banners} />
            <Route path="/admin/settings" component={SettingsAdmin} />
            <Route>
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-800">Page non trouvée</h2>
                <p className="text-gray-600 mt-2">La page que vous recherchez n'existe pas.</p>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}
