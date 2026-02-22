import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Sparkles, Heart, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  women: "Femme",
  men: "Homme",
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

const VALID_CATEGORIES = ["women", "men", "children", "dresses", "suits", "sportswear", "accessories", "shoes", "bags", "jewelry", "other"] as const;

// Bannière(s) pour une page catégorie : une image ou mini-slider si plusieurs
function CategoryBanner({ category }: { category: string }) {
  const { data: list = [] } = trpc.banners.getForPageWithImages.useQuery({
    pageType: "category",
    pageIdentifier: category,
  });
  const slides = useMemo(() => {
    const out: Array<{ key: string; imageUrl: string; title: string; link: string }> = [];
    for (const b of list as Array<{ id: number; title: string; imageUrl: string; buttonLink?: string | null; linkUrl?: string | null; images?: string[] }>) {
      const images = b.images?.length ? b.images : [b.imageUrl];
      const link = b.buttonLink ?? b.linkUrl ?? "#";
      images.forEach((imgUrl, idx) => {
        out.push({ key: `${b.id}-${idx}`, imageUrl: imgUrl, title: b.title, link });
      });
    }
    return out;
  }, [list]);
  const [current, setCurrent] = useState(0);
  const n = slides.length;
  const go = (d: number) => setCurrent((c) => (c + d + n) % n);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % n), 4000);
    return () => clearInterval(t);
  }, [n]);
  useEffect(() => {
    const el = containerRef.current;
    if (!el || n === 0) return;
    const slide = el.querySelector(`[data-slide-index="${current}"]`);
    slide?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [current, n]);

  if (slides.length === 0) {
    return (
      <div className="w-full h-32 md:h-48 rounded-xl bg-gradient-to-r from-[#8c8070] to-[#b4aa9b] flex items-center justify-center text-white mb-6">
        <span className="text-lg font-semibold" style={{ fontFamily: "Playfair Display, serif" }}>
          {CATEGORY_LABELS[category] ?? category}
        </span>
      </div>
    );
  }
  if (slides.length === 1) {
    const s = slides[0];
    return (
      <div className="relative w-full rounded-xl overflow-hidden mb-6 h-40 md:h-56">
        <a href={s.link} className="block w-full h-full relative">
          <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/10 flex items-end p-4">
            <span className="text-white text-xl font-semibold drop-shadow">{s.title}</span>
          </div>
        </a>
      </div>
    );
  }
  return (
    <section className="relative w-full overflow-hidden rounded-xl mb-6 h-40 md:h-56">
      <div ref={containerRef} className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth h-full" style={{ scrollbarWidth: "none" }}>
        {slides.map((s, idx) => (
          <a
            key={s.key}
            data-slide-index={idx}
            href={s.link}
            className="relative flex-shrink-0 w-full min-w-full h-full snap-start snap-center block"
          >
            <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" loading={idx <= current + 1 ? "eager" : "lazy"} />
            <div className="absolute inset-0 bg-black/20 flex items-end p-4">
              <span className="text-white font-semibold drop-shadow">{s.title}</span>
            </div>
          </a>
        ))}
      </div>
      <button type="button" onClick={() => go(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-[#8c8070] flex items-center justify-center shadow" aria-label="Précédent">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => go(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 text-[#8c8070] flex items-center justify-center shadow" aria-label="Suivant">
        <ChevronRight className="w-4 h-4" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((_, idx) => (
          <button key={idx} type="button" onClick={() => setCurrent(idx)} className={`w-1.5 h-1.5 rounded-full ${idx === current ? "bg-white" : "bg-white/60"}`} aria-label={`Slide ${idx + 1}`} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/product/${product.id}`}>
      <div className="group cursor-pointer bg-white rounded-none overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="relative h-72 bg-[oklch(0.97_0.003_65)] overflow-hidden">
          <img src={product.previewImageUrl || "https://placehold.co/600x800/eee/ddd?text=Produit"} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.salePrice != null && Number(product.salePrice) > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1">Soldes</span>
            )}
            {product.isFeatured && (
              <span className="bg-[#8c8070] text-white text-xs font-bold px-3 py-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Vedette
              </span>
            )}
          </div>
          <button className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all">
            <Heart className="w-4 h-4 text-[#8c8070]" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-[oklch(0.35_0.02_65)] mb-2 line-clamp-2 group-hover:text-[#8c8070]" style={{ fontFamily: "Lato, sans-serif" }}>
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.floor(parseFloat(product.rating || "0")) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {product.salePrice != null && Number(product.salePrice) > 0 ? (
              <>
                <span className="text-sm text-gray-500 line-through">{product.price} DT</span>
                <span className="text-lg font-bold text-[#8c8070]">{product.salePrice} DT</span>
              </>
            ) : (
              <span className="text-lg font-bold text-[#8c8070]">{product.price} DT</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CategoryPage() {
  const { id: categoryId } = useParams<{ id: string }>();
  const category = (categoryId && VALID_CATEGORIES.includes(categoryId as any)) ? categoryId : "women";

  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [onSale, setOnSale] = useState(false);

  const filtersQuery = trpc.products.getCategoryFilters.useQuery({ category: category as typeof VALID_CATEGORIES[number] });
  const productsQuery = trpc.products.listByCategoryFiltered.useQuery({
    category: category as typeof VALID_CATEGORIES[number],
    priceMin: priceMin ? parseFloat(priceMin) : undefined,
    priceMax: priceMax ? parseFloat(priceMax) : undefined,
    colors: selectedColors.length ? selectedColors : undefined,
    sizes: selectedSizes.length ? selectedSizes : undefined,
    onSale: onSale || undefined,
    limit: 200,
  });

  const products = productsQuery.data ?? [];
  const { colors = [], sizes = [] } = filtersQuery.data ?? {};

  const toggleColor = (c: string) => {
    setSelectedColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };
  const toggleSize = (s: string) => {
    setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.003_65)]">
      <div className="container px-4 py-6">
        <Link href="/">
          <button className="flex items-center gap-2 text-[#8c8070] hover:text-[#6d6458] font-medium mb-4">
            <ChevronLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>
        </Link>

        <CategoryBanner category={category} />

        <h1 className="text-2xl md:text-3xl font-bold text-[oklch(0.35_0.02_65)] mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
          {CATEGORY_LABELS[category] ?? category}
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtres à gauche */}
          <aside className="w-full lg:w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-fit">
            <h2 className="font-semibold text-gray-800 mb-4">Filtres</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix (DT)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="border-gray-200"
                    min={0}
                    step={1}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="border-gray-200"
                    min={0}
                    step={1}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} className="rounded border-[#c8bfb0] text-[#8c8070]" />
                <span className="text-sm text-gray-700">Soldes</span>
              </label>

              {colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Couleurs</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => toggleColor(c)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          selectedColors.includes(c) ? "bg-[#8c8070] text-white border-[#8c8070]" : "bg-white border-gray-200 text-gray-700 hover:border-[#8c8070]"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tailles</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSize(s)}
                        className={`px-3 py-1 rounded border text-sm transition-colors ${
                          selectedSizes.includes(s) ? "bg-[#8c8070] text-white border-[#8c8070]" : "bg-white border-gray-200 text-gray-700 hover:border-[#8c8070]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Grille produits */}
          <div className="flex-1">
            {productsQuery.isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded animate-pulse h-80" />
                ))}
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">{products.length} produit(s)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                {products.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Aucun produit ne correspond aux filtres.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
