import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Search, ShoppingBag, Heart, ChevronRight, Menu, X, Star, Sparkles, Truck, RotateCcw, Shield, User, Instagram, Facebook, Twitter } from "lucide-react";
import { useState, useMemo } from "react";

// Types pour les catégories
interface Category {
  id: string;
  label: string;
  icon: string;
  subcategories: string[];
}

// Catégories principales avec sous-catégories style mabrouk.tn
const CATEGORIES: Category[] = [
  { id: "all", label: "Tout", icon: "🏠", subcategories: [] },
  { id: "men", label: "Homme", icon: "👔", subcategories: ["Pantalons", "T-shirts", "Chemises", "Vestes"] },
  { id: "women", label: "Femme", icon: "👗", subcategories: ["Robes", "Tops", "Pantalons", "Jupes"] },
  { id: "accessories", label: "Accessoires", icon: "👜", subcategories: ["Sacs", "Ceintures", "Écharpes", "Bijoux"] },
  { id: "sales", label: "Soldes", icon: "🔥", subcategories: [] },
];

// Composant ProductCard
function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/product/${product.id}`}>
      <div className="group cursor-pointer bg-white rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative h-72 bg-[oklch(0.97_0.003_65)] overflow-hidden">
          <img
            src={product.previewImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges - VINA Colors */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isFeatured && (
              <span className="bg-[#8c8070] text-white text-xs font-bold px-3 py-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Vedette
              </span>
            )}
          </div>
          
          {/* Wishlist Button */}
          <button className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md hover:scale-110">
            <Heart className="w-4 h-4 text-[#8c8070] hover:text-red-500" />
          </button>
          
          {/* Quick View Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button className="w-full bg-white text-[#8c8070] hover:bg-[#8c8070] hover:text-white font-medium">
              Voir le produit
            </Button>
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-[oklch(0.35_0.02_65)] mb-2 line-clamp-2 group-hover:text-[#8c8070] transition-colors" style={{ fontFamily: 'Lato, sans-serif' }}>
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.floor(parseFloat(product.rating || "0")) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                />
              ))}
            </div>
            <span className="text-xs text-[oklch(0.55_0.016_65)]">({product.downloads || 0})</span>
          </div>
          
          {/* Price - VINA Colors */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#8c8070]">{product.price} DT</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Récupération des produits depuis l'API
  const productsQuery = trpc.products.list.useQuery({ limit: 100, offset: 0 });
  const featuredQuery = trpc.products.getFeatured.useQuery({ limit: 8 });

  // Filtrer les produits par catégorie et recherche
  const filteredProducts = useMemo(() => {
    if (!productsQuery.data) return [];
    
    return productsQuery.data.filter(p => {
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      const matchesSearch = searchQuery === "" || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [productsQuery.data, selectedCategory, searchQuery]);

  // Produits vedettes
  const featuredProducts = featuredQuery.data || [];

  // État de chargement
  const isLoading = productsQuery.isLoading || featuredQuery.isLoading;

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.003_65)]">
      {/* Top Bar - VINA Colors */}
      <div className="bg-[#8c8070] text-white text-xs py-2">
        <div className="container flex justify-between items-center px-4">
          <div className="flex items-center gap-4">
            <span>📞 +216 00 000 000</span>
            <span className="hidden sm:inline">📧 contact@vina.tn</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Suivez-nous:</span>
            <div className="flex gap-3">
              <a href="#" className="hover:text-[#b4aa9b]"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="hover:text-[#b4aa9b]"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="hover:text-[#b4aa9b]"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#8c8070] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg md:text-xl">V</span>
                </div>
                <span className="text-xl md:text-2xl font-bold text-[oklch(0.35_0.02_65)]" style={{ fontFamily: 'Playfair Display, serif' }}>VINA</span>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-none border-2 border-[#c8bfb0] focus:border-[#8c8070] bg-[oklch(0.97_0.003_65)]"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b4aa9b]" />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 hover:bg-[oklch(0.97_0.003_65)] rounded-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <Link href="/cart">
                <button className="p-2 hover:bg-[oklch(0.97_0.003_65)] rounded-lg transition-colors relative">
                  <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-[oklch(0.35_0.02_65)]" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">0</span>
                </button>
              </Link>
              
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="hidden md:flex bg-[#8c8070] hover:bg-[#6d6458] text-white px-6">
                    <User className="w-4 h-4 mr-2" />
                    {user?.name?.split(" ")[0] || "Mon Compte"}
                  </Button>
                </Link>
              ) : (
                <Link href="/auth">
                  <Button className="hidden md:flex bg-[#8c8070] hover:bg-[#6d6458] text-white px-6">
                    <User className="w-4 h-4 mr-2" />
                    Se connecter
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 rounded-none border-2 border-[#c8bfb0]"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b4aa9b]" />
            </div>
          </div>
        </div>

        {/* Category Navigation - Desktop - Style mabrouk.tn */}
        <nav className="hidden md:block border-t border-[#c8bfb0]">
          <div className="container px-4">
            <div className="flex items-center gap-0">
              {CATEGORIES.map((cat) => (
                <div 
                  key={cat.id}
                  className="relative"
                  onMouseEnter={() => cat.subcategories.length > 0 && setActiveDropdown(cat.id)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-5 py-4 whitespace-nowrap font-medium transition-all border-b-3 ${
                      selectedCategory === cat.id
                        ? "text-[#8c8070] border-b-[#8c8070] bg-[oklch(0.97_0.003_65)]"
                        : "text-[oklch(0.35_0.02_65)] border-b-transparent hover:text-[#8c8070] hover:bg-[oklch(0.97_0.003_65)]"
                    }`}
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.label}
                    {cat.subcategories.length > 0 && (
                      <ChevronRight className="inline w-4 h-4 ml-1" />
                    )}
                  </button>
                  
                  {/* Dropdown Menu - Style mabrouk.tn */}
                  {cat.subcategories.length > 0 && activeDropdown === cat.id && (
                    <div className="absolute left-0 top-full bg-white shadow-xl border border-[#c8bfb0] min-w-48 z-50">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setSelectedCategory(cat.id);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-[oklch(0.97_0.003_65)] text-[oklch(0.35_0.02_65)] font-medium"
                        >
                          Voir tout
                        </button>
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => {
                              setSelectedCategory(cat.id);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[oklch(0.97_0.003_65)] text-[oklch(0.55_0.016_65)]"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu - Style mabrouk.tn */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t">
          <div className="container px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-none text-left font-medium transition-all ${
                    selectedCategory === cat.id
                      ? "bg-[#8c8070] text-white"
                      : "bg-[oklch(0.97_0.003_65)] text-[oklch(0.35_0.02_65)] hover:bg-[#b4aa9b]/20"
                  }`}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
            
            {/* Mobile Subcategories */}
            {selectedCategory !== "all" && selectedCategory !== "sales" && CATEGORIES.find(c => c.id === selectedCategory)?.subcategories && (
              <div className="mt-4 pt-4 border-t border-[#c8bfb0]">
                <p className="text-sm font-medium text-[oklch(0.55_0.016_65)] mb-2">Sous-catégories:</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.find(c => c.id === selectedCategory)?.subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub.toLowerCase())}
                      className="px-3 py-1 text-sm bg-[oklch(0.97_0.003_65)] text-[oklch(0.35_0.02_65)] rounded-full hover:bg-[#8c8070] hover:text-white transition-colors"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section - VINA Colors */}
      <section className="relative bg-gradient-to-r from-[#8c8070] to-[#b4aa9b] text-white py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container px-4 relative">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium mb-4">
              Collection 2024
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Élégance & Style<br />
              <span className="text-[#f5f2ee]">Pour Tous</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Découvrez notre nouvelle collection de vêtements et accessoires pour homme, femme et enfant. Qualité premium, prix incontournables.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-white text-[#8c8070] hover:bg-[#f5f2ee] px-8 py-3 text-lg font-semibold rounded-none"
                onClick={() => setSelectedCategory("women")}
              >
                Découvrir la collection
              </Button>
              <Button 
                variant="outline" 
                className="border-2 border-white text-white hover:bg-white/20 px-8 py-3 text-lg font-semibold rounded-none"
                onClick={() => setSelectedCategory("all")}
              >
                Voir tous les produits
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <div className="w-96 h-96 bg-white/10 rounded-full"></div>
        </div>
      </section>

      {/* Categories Tabs - Mobile */}
      <section className="md:hidden bg-white py-4 sticky top-16 z-40 shadow-sm">
        <div className="container px-4">
          <div className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 whitespace-nowrap font-medium text-sm transition-all ${
                  selectedCategory === cat.id
                    ? "bg-[#8c8070] text-white"
                    : "bg-[oklch(0.97_0.003_65)] text-[oklch(0.35_0.02_65)] hover:bg-[#b4aa9b]/30"
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Products Section */}
      <section className="py-8 md:py-12">
        <div className="container px-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[oklch(0.35_0.02_65)]" style={{ fontFamily: 'Playfair Display, serif' }}>
                {selectedCategory === "all" ? "Tous nos produits" : CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </h2>
              <p className="text-[oklch(0.55_0.016_65)] mt-1">{filteredProducts.length} produits</p>
            </div>
            <Button variant="outline" className="hidden md:flex border-[#8c8070] text-[#8c8070] hover:bg-[#8c8070] hover:text-white">
              Voir tout <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-none overflow-hidden shadow-sm animate-pulse">
                  <div className="h-72 bg-[oklch(0.97_0.003_65)]"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-[oklch(0.97_0.003_65)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-[#b4aa9b]" />
              </div>
              <h3 className="text-xl font-semibold text-[oklch(0.35_0.02_65)] mb-2">Aucun produit trouvé</h3>
              <p className="text-[oklch(0.55_0.016_65)]">Essayez avec une autre catégorie ou recherche</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      {!isLoading && featuredProducts.length > 0 && (
        <section className="py-8 md:py-12">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[oklch(0.35_0.02_65)]" style={{ fontFamily: 'Playfair Display, serif' }}>Produits Vedettes</h2>
                  <p className="text-[oklch(0.55_0.016_65)]">Nos meilleures sélections</p>
                </div>
              </div>
              <Button variant="outline" className="border-[#8c8070] text-[#8c8070] hover:bg-[#8c8070] hover:text-white">
                Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter - VINA Colors */}
      <section className="py-12 md:py-16 bg-[#8c8070]">
        <div className="container px-4 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Restez informé de nos offres
          </h2>
          <p className="text-[#f5f2ee] mb-6">
            Inscrivez-vous à notre newsletter pour recevoir les dernières nouveautés et offres exclusives.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Votre adresse e-mail"
              className="flex-1 px-6 py-3 rounded-none border-0 text-[oklch(0.35_0.02_65)]"
            />
            <Button className="bg-white text-[#8c8070] hover:bg-[#f5f2ee] px-8 py-3 font-semibold rounded-none">
              S'abonner
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - VINA Colors */}
      <footer className="bg-[oklch(0.35_0.02_65)] text-[oklch(0.92_0.005_65)] py-12 md:py-16">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#8c8070] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>VINA</span>
              </div>
              <p className="text-sm text-[oklch(0.70_0.015_65)] mb-4">
                Votre destination mode pour des vêtements et accessoires de qualité.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-8 h-8 bg-[oklch(0.40_0.01_65)] hover:bg-[#8c8070] rounded-full flex items-center justify-center transition-colors"><Facebook className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 bg-[oklch(0.40_0.01_65)] hover:bg-[#8c8070] rounded-full flex items-center justify-center transition-colors"><Instagram className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 bg-[oklch(0.40_0.01_65)] hover:bg-[#8c8070] rounded-full flex items-center justify-center transition-colors"><Twitter className="w-4 h-4" /></a>
              </div>
            </div>
            
            {/* Shop */}
            <div>
              <h4 className="font-semibold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Boutique</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Hommes</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Femmes</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Enfants</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Accessoires</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Tous les produits</span></Link></li>
              </ul>
            </div>
            
            {/* Help */}
            <div>
              <h4 className="font-semibold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Aide</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help"><span className="hover:text-[#b4aa9b] transition-colors">Centre d'aide</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Livraison</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Retours</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">FAQ</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Nous contacter</span></Link></li>
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Légal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms"><span className="hover:text-[#b4aa9b] transition-colors">CGV</span></Link></li>
                <li><Link href="/privacy"><span className="hover:text-[#b4aa9b] transition-colors">Confidentialité</span></Link></li>
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Cookies</span></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[oklch(0.40_0.01_65)] pt-8 text-center text-sm text-[oklch(0.55_0.016_65)]">
            <p>&copy; 2024 VINA. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
