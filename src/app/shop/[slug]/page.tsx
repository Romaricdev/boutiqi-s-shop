"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  Search,
  ShoppingBag,
  Heart,
  Plus,
  Minus,
  X,
  Truck,
  ChevronRight,
  Home,
  MessageCircle,
  Package,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Grid3X3,
} from "lucide-react";

import { useDashboardStore } from "@/lib/store/dashboard";
import { useCartStore } from "@/lib/store/cart";
import type { DashboardProduct } from "@/lib/types/dashboard";
import { cn } from "@/lib/cn";

const DELIVERY_FEE = 1500;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

const CATEGORY_COLORS = [
  { bg: "bg-brand-50", text: "text-brand-700", border: "border-brand-200", accent: "bg-brand-600" },
  { bg: "bg-accent-50", text: "text-accent-700", border: "border-accent-200", accent: "bg-accent-500" },
  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", accent: "bg-amber-500" },
  { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", accent: "bg-blue-500" },
  { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200", accent: "bg-pink-500" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", accent: "bg-emerald-500" },
];

export default function StorefrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { shop, products, categories } = useDashboardStore();
  const cart = useCartStore();

  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [detailProduct, setDetailProduct] = useState<DashboardProduct | null>(null);

  const catsSorted = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, "fr")),
    [categories],
  );

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const activeProducts = useMemo(() => products.filter((p) => p.isActive), [products]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    activeProducts.forEach((p) => counts.set(p.category, (counts.get(p.category) ?? 0) + 1));
    return counts;
  }, [activeProducts]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeProducts
      .filter((p) => (activeCat === "all" ? true : p.category === activeCat))
      .filter((p) => {
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          (categoryNameById.get(p.category) ?? "").toLowerCase().includes(q)
        );
      });
  }, [activeProducts, activeCat, query, categoryNameById]);

  const featuredProducts = useMemo(() => activeProducts.slice(0, 2), [activeProducts]);

  const toggleFav = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const addToCart = useCallback(
    (p: DashboardProduct) => {
      cart.addItem({ productId: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl });
    },
    [cart],
  );

  const isShopMatch = shop && shop.slug === slug;

  if (!isShopMatch) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-warm-50">
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-warm-100">
            <Store className="size-8 text-warm-300" />
          </div>
          <h1 className="mt-4 font-display text-2xl text-warm-900">Boutique introuvable</h1>
          <p className="mt-2 text-sm text-warm-500">Cette boutique n&apos;existe pas encore.</p>
        </div>
      </div>
    );
  }

  const initial = shop.shopName.charAt(0).toUpperCase();
  const hasCover = !!shop.coverImageUrl;

  return (
    <div className="min-h-dvh bg-[#F7F5F0]">
      {/* ═══ HEADER ═══ */}
      <header className="sticky top-0 z-40 border-b border-warm-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            {shop.logoUrl ? (
              <img src={shop.logoUrl} alt={shop.shopName} className="size-11 rounded-lg object-cover" />
            ) : (
              <div className="grid size-11 place-items-center rounded-lg bg-brand-600 font-display text-lg text-brand-50">
                {initial}
              </div>
            )}
            <div>
              <div className="font-display text-base leading-tight text-warm-900">{shop.shopName}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-warm-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  <span className="size-1.5 animate-pulse rounded-full bg-brand-500" />
                  Ouvert
                </span>
                <span>
                  &middot; {shop.neighborhood}, {shop.city}
                </span>
              </div>
            </div>
          </div>

          <div className="relative hidden max-w-xs flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-warm-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher un produit…"
              className="h-9 w-full rounded-lg border border-warm-200 bg-warm-50/60 pl-9 pr-3 text-sm text-warm-900 outline-none placeholder:text-warm-400 focus:border-brand-400 focus:bg-white focus:ring-1 focus:ring-brand-400/20"
            />
          </div>

          <button
            type="button"
            onClick={() => cart.openCart()}
            className="relative flex items-center gap-2 rounded-lg bg-warm-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-warm-800"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Panier</span>
            {cart.totalItems() > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-accent-500 text-[10px] font-bold text-white">
                {cart.totalItems()}
              </span>
            )}
          </button>
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto border-t border-warm-100 px-4 py-2.5 lg:px-6 [&::-webkit-scrollbar]:hidden">
          <CatPill active={activeCat === "all"} label="Tout" onClick={() => setActiveCat("all")} />
          {catsSorted.map((c) => (
            <CatPill key={c.id} active={activeCat === c.id} label={c.name} onClick={() => setActiveCat(c.id)} />
          ))}
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <div className="mx-auto max-w-7xl px-4 pt-4 lg:px-6">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl"
        style={{ minHeight: hasCover ? 280 : 240 }}
      >
        {hasCover ? (
          <img
            src={shop.coverImageUrl}
            alt={`Couverture ${shop.shopName}`}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-warm-900 via-warm-800 to-brand-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />

        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-brand-500/15" />
        <div className="absolute -bottom-16 left-1/3 size-56 rounded-full bg-accent-500/10" />

        <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end p-6 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm"
              >
                <Sparkles className="size-3" />
                Bienvenue chez {shop.shopName}
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-3 font-display text-3xl leading-tight text-white md:text-4xl"
              >
                {shop.description}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/60"
              >
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3" />
                  {shop.neighborhood}, {shop.city}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />
                  {shop.openingHours}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Package className="size-3" />
                  {activeProducts.length} produits
                </span>
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                type="button"
                onClick={() => document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" })}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-warm-900 shadow-lg transition hover:bg-brand-50 hover:shadow-xl"
              >
                Explorer la boutique
                <ArrowRight className="size-4" />
              </motion.button>
            </div>

            {/* Stats badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex gap-3"
            >
              <div className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-center backdrop-blur-sm">
                <div className="font-display text-2xl text-white">{activeProducts.length}</div>
                <div className="text-[10px] text-white/50">Produits</div>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-center backdrop-blur-sm">
                <div className="font-display text-2xl text-white">{categories.length}</div>
                <div className="text-[10px] text-white/50">Catégories</div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="mx-auto max-w-7xl px-4 pb-24 lg:px-6">
        {/* Info bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-warm-200 bg-warm-200 sm:grid-cols-3"
        >
          <InfoItem icon={<Truck className="size-4 text-brand-600" />} iconBg="bg-brand-50" title="Livraison disponible" sub={`${shop.neighborhood}, ${shop.city}`} />
          <InfoItem icon={<MapPin className="size-4 text-amber-600" />} iconBg="bg-amber-50" title="Retrait sur place" sub={`${shop.neighborhood}, ${shop.city}`} />
          <InfoItem icon={<MessageCircle className="size-4 text-brand-600" />} iconBg="bg-brand-50" title="Commande via WhatsApp" sub={`Contactez-nous directement`} />
        </motion.div>

        {/* Mobile search */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-warm-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher un produit…"
              className="h-10 w-full rounded-lg border border-warm-200 bg-white pl-9 pr-3 text-sm text-warm-900 outline-none placeholder:text-warm-400 focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20"
            />
          </div>
        </div>

        {/* ═══ CATEGORY CARDS ═══ */}
        {catsSorted.length > 1 && (
          <>
            <SectionHead title="Parcourir par" accent="catégorie" />
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4"
            >
              {catsSorted
                .filter((c) => c.id !== "autre")
                .map((c, i) => {
                  const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                  const count = categoryCounts.get(c.id) ?? 0;
                  return (
                    <motion.button
                      key={c.id}
                      variants={fadeUp}
                      custom={i}
                      type="button"
                      onClick={() => {
                        setActiveCat(c.id);
                        document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md",
                        color.border,
                        color.bg,
                        activeCat === c.id && "ring-2 ring-brand-500 ring-offset-1",
                      )}
                    >
                      <div className={cn("mb-2 grid size-9 place-items-center rounded-lg", color.accent)}>
                        <Grid3X3 className="size-4 text-white" />
                      </div>
                      <div className={cn("text-sm font-bold", color.text)}>{c.name}</div>
                      <div className="mt-0.5 text-[11px] text-warm-500">
                        {count} produit{count > 1 ? "s" : ""}
                      </div>
                      <ChevronRight className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-warm-300 transition group-hover:translate-x-0.5 group-hover:text-warm-500" />
                    </motion.button>
                  );
                })}
            </motion.div>
          </>
        )}

        {/* ═══ FEATURED ═══ */}
        {featuredProducts.length >= 2 && (
          <>
            <SectionHead title="Coups de" accent="cœur" />
            <div className="grid gap-3 sm:grid-cols-2">
              {featuredProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                  onClick={() => setDetailProduct(p)}
                  className={cn(
                    "group relative cursor-pointer overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:shadow-lg",
                    i === 0 ? "bg-warm-900" : "bg-accent-50 border border-accent-200",
                  )}
                >
                  {/* Background image if product has one */}
                  {p.imageUrl && (
                    <div className="absolute inset-0">
                      <img src={p.imageUrl} alt={p.name} className="size-full object-cover opacity-30 transition group-hover:scale-105" />
                      <div className={cn("absolute inset-0", i === 0 ? "bg-gradient-to-r from-warm-900/90 to-warm-900/50" : "bg-gradient-to-r from-accent-50/95 to-accent-50/70")} />
                    </div>
                  )}
                  <div className="relative flex items-center justify-between p-6">
                    <div>
                      <div className={cn("text-[10px] font-bold uppercase tracking-widest", i === 0 ? "text-brand-300" : "text-accent-600")}>
                        {i === 0 ? "Coup de cœur" : "Bestseller"}
                      </div>
                      <div className={cn("mt-2 font-display text-xl leading-tight", i === 0 ? "text-white" : "text-warm-900")}>
                        {p.name}
                      </div>
                      <div className={cn("mt-1 text-lg font-bold", i === 0 ? "text-brand-300" : "text-accent-600")}>
                        {p.price.toLocaleString()} FCFA
                      </div>
                      {p.description && (
                        <p className={cn("mt-2 line-clamp-2 max-w-xs text-xs", i === 0 ? "text-white/50" : "text-warm-500")}>
                          {p.description}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailProduct(p);
                        }}
                        className={cn(
                          "mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition",
                          i === 0 ? "bg-white text-warm-900 hover:bg-brand-50" : "bg-accent-500 text-white hover:bg-accent-600",
                        )}
                      >
                        Voir le produit <ChevronRight className="size-3.5" />
                      </button>
                    </div>
                    {!p.imageUrl && (
                      <div className="hidden shrink-0 sm:block">
                        <div className={cn("grid size-20 place-items-center rounded-2xl", i === 0 ? "bg-white/10" : "bg-accent-100")}>
                          <Package className={cn("size-10", i === 0 ? "text-white/30" : "text-accent-300")} />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* ═══ PRODUCTS GRID ═══ */}
        <div id="products-section">
          <SectionHead
            title="Tous les"
            accent="produits"
            right={`${filteredProducts.length} article${filteredProducts.length > 1 ? "s" : ""}`}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-warm-200 bg-white py-16 text-center">
            <Package className="size-10 text-warm-300" />
            <p className="mt-3 text-sm font-semibold text-warm-700">Aucun produit trouvé</p>
            <p className="mt-1 text-xs text-warm-500">Essayez une autre catégorie ou recherche.</p>
            {activeCat !== "all" && (
              <button
                type="button"
                onClick={() => setActiveCat("all")}
                className="mt-3 text-xs font-semibold text-brand-600 hover:underline"
              >
                Voir tous les produits
              </button>
            )}
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p, i) => (
              <motion.div key={p.id} variants={fadeUp} custom={i}>
                <ProductCard
                  product={p}
                  categoryLabel={categoryNameById.get(p.category) ?? ""}
                  isFav={favorites.has(p.id)}
                  onToggleFav={() => toggleFav(p.id)}
                  onAdd={() => addToCart(p)}
                  onOpen={() => setDetailProduct(p)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ═══ FOOTER BOUTIQUE ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 rounded-xl border border-warm-200 bg-white p-6 text-center"
        >
          <div className="mx-auto max-w-md">
            {shop.logoUrl ? (
              <img src={shop.logoUrl} alt={shop.shopName} className="mx-auto size-14 rounded-xl object-cover" />
            ) : (
              <div className="mx-auto grid size-14 place-items-center rounded-xl bg-brand-600 font-display text-xl text-brand-50">
                {initial}
              </div>
            )}
            <h3 className="mt-3 font-display text-lg text-warm-900">{shop.shopName}</h3>
            <p className="mt-1 text-xs text-warm-500">{shop.description}</p>
            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-warm-400">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {shop.neighborhood}, {shop.city}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3" />
                {shop.openingHours}
              </span>
            </div>
            <a
              href={`https://wa.me/237${shop.whatsappPhone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-warm-900"
            >
              <MessageCircle className="size-4" />
              Nous contacter sur WhatsApp
            </a>
            <p className="mt-4 text-[10px] text-warm-300">
              Propulsé par <span className="font-semibold text-brand-500">Boutiki</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* ═══ BOTTOM NAV MOBILE ═══ */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-warm-200 bg-white/95 py-2 pb-[max(8px,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
        <BottomTab icon={<Home className="size-5" />} label="Boutique" active />
        <BottomTab icon={<Search className="size-5" />} label="Recherche" />
        <BottomTab icon={<ShoppingBag className="size-5" />} label="Panier" badge={cart.totalItems()} onClick={() => cart.openCart()} />
        <BottomTab icon={<Heart className="size-5" />} label="Favoris" badge={favorites.size} />
      </nav>

      <CartSheet />

      <ProductDetailSheet
        product={detailProduct}
        categoryLabel={detailProduct ? (categoryNameById.get(detailProduct.category) ?? "") : ""}
        onClose={() => setDetailProduct(null)}
        onAdd={(p) => addToCart(p)}
        isFav={detailProduct ? favorites.has(detailProduct.id) : false}
        onToggleFav={() => detailProduct && toggleFav(detailProduct.id)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════ */

function CatPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-warm-200 bg-white text-warm-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700",
      )}
    >
      {label}
    </button>
  );
}

function InfoItem({
  icon,
  iconBg,
  title,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-white px-4 py-3">
      <div className={cn("grid size-8 shrink-0 place-items-center rounded-lg", iconBg)}>{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] font-bold text-warm-900">{title}</div>
        <div className="truncate text-[10px] text-warm-500">{sub}</div>
      </div>
    </div>
  );
}

function SectionHead({ title, accent, right }: { title: string; accent: string; right?: string }) {
  return (
    <div className="mt-7 mb-3 flex items-baseline justify-between">
      <h2 className="text-base font-bold text-warm-900">
        {title} <span className="font-display italic text-brand-600">{accent}</span>
      </h2>
      {right && <span className="text-xs font-semibold text-brand-600">{right}</span>}
    </div>
  );
}

function ProductCard({
  product: p,
  categoryLabel,
  isFav,
  onToggleFav,
  onAdd,
  onOpen,
}: {
  product: DashboardProduct;
  categoryLabel: string;
  isFav: boolean;
  onToggleFav: () => void;
  onAdd: () => void;
  onOpen: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const gradients = [
    "from-brand-50 to-brand-100/80",
    "from-accent-50 to-accent-100/80",
    "from-blue-50 to-blue-100/80",
    "from-amber-50 to-amber-100/80",
    "from-pink-50 to-pink-100/80",
    "from-warm-100 to-warm-200/80",
  ];
  const hash = p.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const gradient = gradients[hash % gradients.length];

  return (
    <motion.div
      onClick={onOpen}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="group cursor-pointer overflow-hidden rounded-xl border border-warm-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg hover:shadow-warm-300/20"
    >
      {/* Image zone */}
      <div className={cn("relative aspect-[4/5] overflow-hidden bg-gradient-to-br", gradient)}>
        {p.imageUrl ? (
          <motion.img
            src={p.imageUrl}
            alt={p.name}
            className="size-full object-cover"
            animate={{ scale: isHovered ? 1.06 : 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Package className="size-14 text-warm-300/40" />
          </div>
        )}

        {/* Gradient overlay bottom for text readability */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Category badge */}
        {categoryLabel && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-white/85 px-2 py-0.5 text-[10px] font-semibold text-warm-700 shadow-sm backdrop-blur-sm">
            {categoryLabel}
          </span>
        )}

        {/* Fav button */}
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav();
          }}
          whileTap={{ scale: 0.85 }}
          className={cn(
            "absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full shadow-sm backdrop-blur-sm transition-colors duration-200",
            isFav ? "bg-accent-50 text-accent-500" : "bg-white/85 text-warm-400 hover:text-accent-500",
          )}
        >
          <Heart className={cn("size-[14px]", isFav && "fill-accent-500")} />
        </motion.button>

        {/* Add to cart — slides up on hover */}
        <motion.div
          initial={false}
          animate={{ y: isHovered ? 0 : 48, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute bottom-0 inset-x-0 flex justify-center pb-3"
        >
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 rounded-lg bg-warm-900/90 px-4 py-2 text-[11px] font-semibold text-white shadow-md backdrop-blur-sm transition-colors hover:bg-brand-600"
          >
            <Plus className="size-3.5" />
            Ajouter
          </motion.button>
        </motion.div>
      </div>

      {/* Info zone */}
      <div className="p-3.5">
        <div className="line-clamp-2 text-[13px] font-semibold leading-snug text-warm-900">
          {p.name}
        </div>
        {p.description && (
          <p className="mt-1 line-clamp-1 text-[11px] text-warm-400">{p.description}</p>
        )}
        <div className="mt-2.5 flex items-center justify-between border-t border-warm-100 pt-2.5">
          <span className="text-[15px] font-bold tracking-tight text-warm-900">
            {p.price.toLocaleString()}{" "}
            <span className="text-[11px] font-semibold text-warm-400">FCFA</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-bold text-brand-700">
            <span className="size-1 rounded-full bg-brand-500" />
            En stock
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function BottomTab({
  icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium",
        active ? "text-brand-600" : "text-warm-400",
      )}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-0.5 top-0 grid size-4 place-items-center rounded-full bg-accent-500 text-[8px] font-bold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

/* ═══ CART SHEET ═══ */
function CartSheet() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, totalItems } = useCartStore();
  const total = subtotal() + (items.length > 0 ? DELIVERY_FEE : 0);
  const { shop } = useDashboardStore();

  const whatsappCheckout = () => {
    if (!shop) return;
    const phone = shop.whatsappPhone.replace(/\D/g, "");
    const num = phone.startsWith("237") ? phone : `237${phone}`;
    const lines = [
      `Bonjour, je souhaite commander :`,
      ...items.map((i) => `- ${i.name} x${i.quantity} = ${(i.price * i.quantity).toLocaleString()} F`),
      `Sous-total : ${subtotal().toLocaleString()} FCFA`,
      `Livraison : ${DELIVERY_FEE.toLocaleString()} FCFA`,
      `Total : ${total.toLocaleString()} FCFA`,
    ];
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-warm-900/40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-warm-100 px-5 py-4">
              <h2 className="text-base font-bold text-warm-900">
                Mon panier <span className="text-warm-400">({totalItems()})</span>
              </h2>
              <button
                type="button"
                onClick={closeCart}
                className="grid size-8 place-items-center rounded-lg bg-warm-100 text-warm-500 transition hover:bg-warm-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingBag className="size-10 text-warm-300" />
                  <p className="mt-3 text-sm text-warm-500">Votre panier est vide</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 rounded-lg bg-warm-50/60 p-3">
                      <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand-50">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="size-12 rounded-lg object-cover" />
                        ) : (
                          <Package className="size-5 text-warm-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-warm-900">{item.name}</div>
                        <div className="text-xs text-warm-500">{item.price.toLocaleString()} F / unité</div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="grid size-6 place-items-center rounded-md bg-warm-200 text-warm-700 transition hover:bg-warm-300"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="min-w-[20px] text-center text-sm font-bold text-warm-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="grid size-6 place-items-center rounded-md bg-warm-200 text-warm-700 transition hover:bg-warm-300"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-bold text-warm-900">{(item.price * item.quantity).toLocaleString()} F</div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="mt-1 text-[10px] font-medium text-red-500 hover:underline"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-warm-100 px-5 py-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-warm-500">
                    <span>Sous-total</span>
                    <span>{subtotal().toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-warm-500">
                    <span>Livraison</span>
                    <span>{DELIVERY_FEE.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between border-t border-warm-100 pt-1.5 text-base font-bold text-warm-900">
                    <span>Total</span>
                    <span>{total.toLocaleString()} FCFA</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={whatsappCheckout}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-3.5 text-sm font-bold text-white transition hover:bg-warm-900"
                >
                  <MessageCircle className="size-4" />
                  Commander via WhatsApp
                </button>
                <p className="mt-2 text-center text-[10px] text-warm-400">Paiement MTN MoMo &middot; Orange Money</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ═══ PRODUCT DETAIL SHEET ═══ */
function ProductDetailSheet({
  product,
  categoryLabel,
  onClose,
  onAdd,
  isFav,
  onToggleFav,
}: {
  product: DashboardProduct | null;
  categoryLabel: string;
  onClose: () => void;
  onAdd: (p: DashboardProduct) => void;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-warm-900/40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl"
          >
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Package className="size-20 text-warm-300/50" />
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/80 text-warm-600 backdrop-blur-sm transition hover:bg-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="text-[11px] font-bold uppercase tracking-widest text-brand-600">{categoryLabel}</div>
              <h2 className="mt-2 font-display text-2xl text-warm-900">{product.name}</h2>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-warm-900">{product.price.toLocaleString()} FCFA</span>
              </div>
              {product.description && (
                <p className="mt-4 text-sm leading-relaxed text-warm-600">{product.description}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700">En stock</span>
                <span className="rounded-full bg-warm-100 px-3 py-1 text-[11px] font-semibold text-warm-600">{categoryLabel}</span>
              </div>
            </div>

            <div className="flex gap-3 border-t border-warm-100 px-5 py-4">
              <button
                type="button"
                onClick={onToggleFav}
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-lg border transition",
                  isFav
                    ? "border-accent-200 bg-accent-50 text-accent-500"
                    : "border-warm-200 bg-warm-50 text-warm-400 hover:bg-accent-50 hover:text-accent-500",
                )}
              >
                <Heart className={cn("size-5", isFav && "fill-accent-500")} />
              </button>
              <button
                type="button"
                onClick={() => {
                  onAdd(product);
                  onClose();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-warm-900"
              >
                <Plus className="size-4" />
                Ajouter au panier
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
