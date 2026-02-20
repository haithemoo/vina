import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Search, ShoppingBag, Heart, ChevronRight, Menu, X, Star, Sparkles, Truck, RotateCcw, Shield, User, Instagram, Facebook, Twitter } from "lucide-react";
import { useState } from "react";

// Types pour les catégories
interface Category {
  id: string;
  label: string;
  icon: string;
  subcategories: string[];
}

// Types pour les produits
interface Product {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  price: string;
  previewImageUrl: string;
  downloads: number;
  rating: string;
  isNew?: boolean;
  isSale?: boolean;
  oldPrice?: string;
}

// Données de démonstration pour les produits
const DEMO_PRODUCTS: Product[] = [
  // Hommes - Pantalons
  { id: 1, name: "Pantalon costume bleu marine", category: "men", subcategory: "pants", price: "89.00", previewImageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400", downloads: 234, rating: "4.8", isNew: true },
  { id: 2, name: "Jean slim bleu foncé", category: "men", subcategory: "pants", price: "65.00", previewImageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", downloads: 189, rating: "4.6" },
  { id: 3, name: "Pantalon chino beige", category: "men", subcategory: "pants", price: "55.00", previewImageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400", downloads: 312, rating: "4.7" },
  { id: 4, name: "Jean décontracté gris", category: "men", subcategory: "pants", price: "58.00", previewImageUrl: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400", downloads: 156, rating: "4.5" },
  { id: 41, name: "Pantalon noir elegant", category: "men", subcategory: "pants", price: "75.00", previewImageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400", downloads: 198, rating: "4.6" },
  { id: 42, name: "Jean brut authentique", category: "men", subcategory: "pants", price: "62.00", previewImageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", downloads: 145, rating: "4.7" },
  
  // Hommes - T-shirts
  { id: 5, name: "T-shirt blanc premium", category: "men", subcategory: "tshirts", price: "25.00", previewImageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", downloads: 567, rating: "4.9", isNew: true },
  { id: 6, name: "T-shirt noir col rond", category: "men", subcategory: "tshirts", price: "22.00", previewImageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400", downloads: 423, rating: "4.7" },
  { id: 7, name: "T-shirt gris chiné", category: "men", subcategory: "tshirts", price: "20.00", previewImageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400", downloads: 345, rating: "4.6" },
  { id: 8, name: "T-shirt bleu marine", category: "men", subcategory: "tshirts", price: "23.00", previewImageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400", downloads: 298, rating: "4.5" },
  { id: 43, name: "T-shirt vert olive", category: "men", subcategory: "tshirts", price: "24.00", previewImageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", downloads: 178, rating: "4.6" },
  { id: 44, name: "T-shirt rouge bordeaux", category: "men", subcategory: "tshirts", price: "26.00", previewImageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400", downloads: 156, rating: "4.7" },
  
  // Hommes - Chemises
  { id: 9, name: "Chemise blanche classique", category: "men", subcategory: "shirts", price: "45.00", previewImageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400", downloads: 456, rating: "4.8" },
  { id: 10, name: "Chemise bleue celeste", category: "men", subcategory: "shirts", price: "48.00", previewImageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400", downloads: 234, rating: "4.7", isSale: true, oldPrice: "59.00" },
  { id: 11, name: "Chemise grise élégante", category: "men", subcategory: "shirts", price: "42.00", previewImageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400", downloads: 189, rating: "4.6" },
  { id: 12, name: "Chemise verte foncé", category: "men", subcategory: "shirts", price: "46.00", previewImageUrl: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400", downloads: 167, rating: "4.5" },
  { id: 45, name: "Chemise rose pale", category: "men", subcategory: "shirts", price: "44.00", previewImageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400", downloads: 145, rating: "4.6" },
  { id: 46, name: "Chemise noir slim", category: "men", subcategory: "shirts", price: "49.00", previewImageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400", downloads: 198, rating: "4.7" },
  
  // Hommes - Vestes
  { id: 13, name: "Veste de costume noire", category: "men", subcategory: "jackets", price: "149.00", previewImageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400", downloads: 178, rating: "4.9" },
  { id: 14, name: "Veste en jean bleue", category: "men", subcategory: "jackets", price: "75.00", previewImageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400", downloads: 267, rating: "4.7", isSale: true, oldPrice: "95.00" },
  { id: 15, name: "Manteau hiver gris", category: "men", subcategory: "jackets", price: "165.00", previewImageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400", downloads: 145, rating: "4.8" },
  { id: 16, name: "Veste cuir noire", category: "men", subcategory: "jackets", price: "189.00", previewImageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", downloads: 198, rating: "4.9", isNew: true },
  { id: 47, name: "Blouson bomber noir", category: "men", subcategory: "jackets", price: "95.00", previewImageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", downloads: 234, rating: "4.6" },
  { id: 48, name: "Veste trench beige", category: "men", subcategory: "jackets", price: "135.00", previewImageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400", downloads: 167, rating: "4.7" },

  // Femmes - Robes
  { id: 17, name: "Robe été fleurie", category: "women", subcategory: "dresses", price: "59.00", previewImageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400", downloads: 345, rating: "4.8", isNew: true },
  { id: 18, name: "Robe de soirée noire", category: "women", subcategory: "dresses", price: "89.00", previewImageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400", downloads: 267, rating: "4.9" },
  { id: 19, name: "Robe midi élégante", category: "women", subcategory: "dresses", price: "65.00", previewImageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400", downloads: 198, rating: "4.7", isSale: true, oldPrice: "79.00" },
  { id: 20, name: "Robe bohème fluide", category: "women", subcategory: "dresses", price: "55.00", previewImageUrl: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400", downloads: 234, rating: "4.6" },
  { id: 49, name: "Robe vintage rouge", category: "women", subcategory: "dresses", price: "68.00", previewImageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400", downloads: 178, rating: "4.7" },
  { id: 50, name: "Robe casino noire", category: "women", subcategory: "dresses", price: "75.00", previewImageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400", downloads: 156, rating: "4.8" },
  
  // Femmes - Tops
  { id: 21, name: "Blouse en satin blanche", category: "women", subcategory: "tops", price: "45.00", previewImageUrl: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=400", downloads: 456, rating: "4.8" },
  { id: 22, name: "Top noir elegant", category: "women", subcategory: "tops", price: "35.00", previewImageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400", downloads: 378, rating: "4.7" },
  { id: 23, name: "Tunique imprimée", category: "women", subcategory: "tops", price: "38.00", previewImageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400", downloads: 289, rating: "4.6" },
  { id: 24, name: "Crop top beige", category: "women", subcategory: "tops", price: "28.00", previewImageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400", downloads: 345, rating: "4.5" },
  { id: 51, name: "Blouse dentelle blanche", category: "women", subcategory: "tops", price: "52.00", previewImageUrl: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=400", downloads: 198, rating: "4.7" },
  { id: 52, name: "Top dos nu noir", category: "women", subcategory: "tops", price: "32.00", previewImageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400", downloads: 234, rating: "4.6" },
  
  // Femmes - Pantalons
  { id: 25, name: "Pantalon large beige", category: "women", subcategory: "pants", price: "55.00", previewImageUrl: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400", downloads: 234, rating: "4.7" },
  { id: 26, name: "Jean skinny noir", category: "women", subcategory: "pants", price: "48.00", previewImageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400", downloads: 312, rating: "4.8", isNew: true },
  { id: 27, name: "Pantalon fluide gris", category: "women", subcategory: "pants", price: "52.00", previewImageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400", downloads: 189, rating: "4.6" },
  { id: 28, name: "Jupe plissée noire", category: "women", subcategory: "pants", price: "42.00", previewImageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0edd7?w=400", downloads: 267, rating: "4.7", isSale: true, oldPrice: "55.00" },
  { id: 53, name: "Jean boyfriend bleu", category: "women", subcategory: "pants", price: "58.00", previewImageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400", downloads: 145, rating: "4.6" },
  { id: 54, name: "Legging noir haute", category: "women", subcategory: "pants", price: "35.00", previewImageUrl: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400", downloads: 198, rating: "4.5" },

  // Femmes - Jupes
  { id: 55, name: "Jupe crayon noire", category: "women", subcategory: "skirts", price: "45.00", previewImageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0edd7?w=400", downloads: 234, rating: "4.7" },
  { id: 56, name: "Jupe plissée beige", category: "women", subcategory: "skirts", price: "48.00", previewImageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0edd7?w=400", downloads: 178, rating: "4.6" },
  { id: 57, name: "Jupe longue fleurie", category: "women", subcategory: "skirts", price: "52.00", previewImageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0edd7?w=400", downloads: 156, rating: "4.8", isNew: true },
  { id: 58, name: "Mini jupe en jean", category: "women", subcategory: "skirts", price: "38.00", previewImageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0edd7?w=400", downloads: 198, rating: "4.5" },

  // Accessoires - Sacs
  { id: 29, name: "Sac à main cuir beige", category: "accessories", subcategory: "bags", price: "120.00", previewImageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400", downloads: 234, rating: "4.9", isNew: true },
  { id: 30, name: "Sac bandoulière noir", category: "accessories", subcategory: "bags", price: "85.00", previewImageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", downloads: 189, rating: "4.7" },
  { id: 31, name: "Sac à dos cuir", category: "accessories", subcategory: "bags", price: "95.00", previewImageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", downloads: 156, rating: "4.8" },
  { id: 32, name: "Sac panier tressé", category: "accessories", subcategory: "bags", price: "45.00", previewImageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400", downloads: 298, rating: "4.6" },
  { id: 59, name: "Sac pochette dorée", category: "accessories", subcategory: "bags", price: "65.00", previewImageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400", downloads: 145, rating: "4.7" },
  { id: 60, name: "Sac seau en cuir", category: "accessories", subcategory: "bags", price: "89.00", previewImageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", downloads: 167, rating: "4.8" },

  // Accessoires - Ceintures
  { id: 33, name: "Ceinture cuir noire", category: "accessories", subcategory: "belts", price: "35.00", previewImageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", downloads: 345, rating: "4.7" },
  { id: 34, name: "Ceinture beige elegante", category: "accessories", subcategory: "belts", price: "32.00", previewImageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400", downloads: 267, rating: "4.6" },
  { id: 35, name: "Ceinture dorée", category: "accessories", subcategory: "belts", price: "28.00", previewImageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", downloads: 198, rating: "4.5" },
  { id: 36, name: "Ceinture serpent", category: "accessories", subcategory: "belts", price: "42.00", previewImageUrl: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400", downloads: 145, rating: "4.8", isSale: true, oldPrice: "55.00" },

  // Accessoires - Écharpes
  { id: 37, name: "Écharpe cachemire grise", category: "accessories", subcategory: "scarves", price: "65.00", previewImageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400", downloads: 234, rating: "4.9" },
  { id: 38, name: "Foulard imprimé", category: "accessories", subcategory: "scarves", price: "35.00", previewImageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400", downloads: 189, rating: "4.7" },
  { id: 39, name: "Écharpe laine beige", category: "accessories", subcategory: "scarves", price: "45.00", previewImageUrl: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400", downloads: 156, rating: "4.6" },
  { id: 40, name: "Chèche rayée", category: "accessories", subcategory: "scarves", price: "25.00", previewImageUrl: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400", downloads: 267, rating: "4.5", isNew: true },
];

// Catégories principales avec sous-catégories style mabrouk.tn
const CATEGORIES: Category[] = [
  { id: "all", label: "Tout", icon: "🏠", subcategories: [] },
  { id: "men", label: "Homme", icon: "👔", subcategories: ["Pantalons", "T-shirts", "Chemises", "Vestes"] },
  { id: "women", label: "Femme", icon: "👗", subcategories: ["Robes", "Tops", "Pantalons", "Jupes"] },
  { id: "accessories", label: "Accessoires", icon: "👜", subcategories: ["Sacs", "Ceintures", "Écharpes", "Bijoux"] },
  { id: "sales", label: "Soldes", icon: "🔥", subcategories: [] },
];

// Sous-catégories par catégorie (non utilisé actuellement)

// Composant ProductCard
function ProductCard({ product }: { product: Product }) {
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
            {product.isNew && (
              <span className="bg-[#8c8070] text-white text-xs font-bold px-3 py-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Nouveau
              </span>
            )}
            {product.isSale && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1">
                -{Math.round((1 - parseFloat(product.price) / parseFloat(product.oldPrice || product.price)) * 100)}%
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
                  className={`w-3 h-3 ${i < Math.floor(parseFloat(product.rating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                />
              ))}
            </div>
            <span className="text-xs text-[oklch(0.55_0.016_65)]">({product.downloads})</span>
          </div>
          
          {/* Price - VINA Colors */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#8c8070]">{product.price} DT</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">{product.oldPrice} DT</span>
            )}
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

  // Filtrer les produits par catégorie
  const filteredProducts = DEMO_PRODUCTS.filter(p => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "sales") return p.isSale;
    return p.category === selectedCategory;
  });

  // Produits en promotion
  const saleProducts = DEMO_PRODUCTS.filter(p => p.isSale);
  
  // Nouveaux produits
  const newProducts = DEMO_PRODUCTS.filter(p => p.isNew);

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
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
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
              Découvrez notre nouvelle collection de vêtements et accessoires pour homme, femme et enfant. Qualité premium, prix incontournbles.
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
                onClick={() => setSelectedCategory("sales")}
              >
                Voir les promotions
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <div className="w-96 h-96 bg-white/10 rounded-full"></div>
        </div>
      </section>

      {/* Services Banner - VINA Colors */}
      <section className="bg-[oklch(0.97_0.003_65)] py-6 border-b border-[#c8bfb0]">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8c8070] rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[oklch(0.35_0.02_65)] text-sm">Livraison gratuite</p>
                <p className="text-xs text-[oklch(0.55_0.016_65)]"> dès 199 DT</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8c8070] rounded-full flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[oklch(0.35_0.02_65)] text-sm">Retours gratuits</p>
                <p className="text-xs text-[oklch(0.55_0.016_65)]"> sous 30 jours</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8c8070] rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[oklch(0.35_0.02_65)] text-sm">Paiement sécurisé</p>
                <p className="text-xs text-[oklch(0.55_0.016_65)]"> 100% sécurisé</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8c8070] rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[oklch(0.35_0.02_65)] text-sm">Service client</p>
                <p className="text-xs text-[oklch(0.55_0.016_65)]"> 7j/7</p>
              </div>
            </div>
          </div>
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
                {selectedCategory === "all" ? "Tous nos produits" : selectedCategory === "sales" ? "Soldes" : CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </h2>
              <p className="text-[oklch(0.55_0.016_65)] mt-1">{filteredProducts.length} produits</p>
            </div>
            <Button variant="outline" className="hidden md:flex border-[#8c8070] text-[#8c8070] hover:bg-[#8c8070] hover:text-white">
              Voir tout <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-[oklch(0.97_0.003_65)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-[#b4aa9b]" />
              </div>
              <h3 className="text-xl font-semibold text-[oklch(0.35_0.02_65)] mb-2">Aucun produit trouvé</h3>
              <p className="text-[oklch(0.55_0.016_65)]">Essayez avec une autre catégorie</p>
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner - VINA Colors */}
      {saleProducts.length > 0 && (
        <section className="py-8 md:py-12 bg-gradient-to-r from-[#8c8070] to-[#6d6458] text-white">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🔥</span>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>Soldesflash</h2>
                  <p className="opacity-90">Jusqu'à -50% sur une sélection</p>
                </div>
              </div>
              <Button className="bg-white text-[#8c8070] hover:bg-[#f5f2ee] font-semibold px-6" onClick={() => setSelectedCategory("sales")}>
                Voir tout
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {saleProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Products - VINA Colors */}
      {newProducts.length > 0 && (
        <section className="py-8 md:py-12">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✨</span>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[oklch(0.35_0.02_65)]" style={{ fontFamily: 'Playfair Display, serif' }}>Nouveautés</h2>
                  <p className="text-[oklch(0.55_0.016_65)]">Les dernières tendances</p>
                </div>
              </div>
              <Button variant="outline" className="border-[#8c8070] text-[#8c8070] hover:bg-[#8c8070] hover:text-white">
                Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newProducts.slice(0, 8).map((product) => (
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
                <li><Link href="/"><span className="hover:text-[#b4aa9b] transition-colors">Soldes</span></Link></li>
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

