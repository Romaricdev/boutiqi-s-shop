"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  DashboardOrder,
  DashboardProduct,
  DashboardCategory,
  DashboardShop,
  DashboardMerchant,
  OrderStatus,
} from "@/lib/types/dashboard";

type DashboardState = {
  merchant: DashboardMerchant | null;
  shop: DashboardShop | null;
  orders: DashboardOrder[];
  products: DashboardProduct[];
  categories: DashboardCategory[];

  setMerchant: (m: DashboardMerchant | null) => void;
  setShop: (s: DashboardShop | null) => void;
  setOrders: (o: DashboardOrder[]) => void;
  setProducts: (p: DashboardProduct[]) => void;
  setCategories: (c: DashboardCategory[]) => void;

  addOrder: (order: DashboardOrder) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  addProduct: (product: Omit<DashboardProduct, "id">) => void;
  updateProduct: (id: string, updates: Partial<DashboardProduct>) => void;
  removeProduct: (id: string) => void;

  addCategory: (category: Pick<DashboardCategory, "id" | "name">) => void;
  updateCategory: (id: string, updates: Partial<Pick<DashboardCategory, "name">>) => void;
  removeCategory: (id: string) => void;

  hydrateFromOnboarding: (data: {
    fullName: string;
    email: string;
    phone: string;
    businessType: string;
    shopName: string;
    city: string;
    neighborhood: string;
    description: string;
    openingHours: string;
    logoUrl?: string;
    slug: string;
    products: { id: string; name: string; price: number; imageUrl?: string; category: string; description?: string }[];
  }) => void;
};

const defaultShop: DashboardShop = {
  shopName: "Ma Boutique",
  slug: "ma-boutique",
  city: "Douala",
  neighborhood: "Akwa",
  description: "Boutique de qualité.",
  openingHours: "8h-20h",
  whatsappPhone: "690123456",
};

const defaultMerchant: DashboardMerchant = {
  fullName: "Commerçant",
  email: "contact@example.com",
  phone: "690123456",
  businessType: "Friperie / Vêtements",
};

/** Données mock pour démo (remplacées par API plus tard) */
const DAY = 86400000;
const now = Date.now();
const mockOrders: DashboardOrder[] = [
  {
    id: "ord-1", trackingToken: "tk_a1b2c3", status: "new",
    customerName: "Jean Mbarga", customerPhone: "655123456",
    deliveryType: "delivery", address: "Akwa, près du marché", note: "Appeler à l'arrivée",
    items: [
      { productName: "Robe wax bleue", productPrice: 15000, quantity: 1, subtotal: 15000 },
      { productName: "Sac en pagne", productPrice: 8000, quantity: 2, subtotal: 16000 },
    ],
    total: 31000, createdAt: new Date(now).toISOString(), updatedAt: new Date(now).toISOString(),
  },
  {
    id: "ord-2", trackingToken: "tk_d4e5f6", status: "confirmed",
    customerName: "Marie Fotso", customerPhone: "677987654", deliveryType: "pickup",
    items: [{ productName: "Chemise homme", productPrice: 12000, quantity: 1, subtotal: 12000 }],
    total: 12000, createdAt: new Date(now - DAY).toISOString(), updatedAt: new Date(now).toISOString(),
  },
  {
    id: "ord-3", trackingToken: "tk_g7h8i9", status: "preparing",
    customerName: "Paul Ndjock", customerPhone: "690456789", deliveryType: "delivery",
    address: "Bonapriso, face pharmacie",
    items: [
      { productName: "Robe wax bleue", productPrice: 15000, quantity: 2, subtotal: 30000 },
      { productName: "Ceinture cuir", productPrice: 5000, quantity: 1, subtotal: 5000 },
    ],
    total: 35000, createdAt: new Date(now - DAY).toISOString(), updatedAt: new Date(now).toISOString(),
  },
  {
    id: "ord-4", trackingToken: "tk_j0k1l2", status: "delivered",
    customerName: "Estelle Kamga", customerPhone: "655987321", deliveryType: "delivery",
    address: "Makepe, carrefour Total",
    items: [{ productName: "Lunettes soleil", productPrice: 7500, quantity: 1, subtotal: 7500 }],
    total: 7500, createdAt: new Date(now - 2 * DAY).toISOString(), updatedAt: new Date(now - DAY).toISOString(),
  },
  {
    id: "ord-5", trackingToken: "tk_m3n4o5", status: "delivering",
    customerName: "Samuel Tchinda", customerPhone: "677112233", deliveryType: "delivery",
    address: "Logbessou, après le pont",
    items: [
      { productName: "Sac en pagne", productPrice: 8000, quantity: 1, subtotal: 8000 },
      { productName: "Chemise homme", productPrice: 12000, quantity: 1, subtotal: 12000 },
    ],
    total: 20000, createdAt: new Date(now - 2 * DAY).toISOString(), updatedAt: new Date(now).toISOString(),
  },
  {
    id: "ord-6", trackingToken: "tk_p6q7r8", status: "new",
    customerName: "Aline Ngoufack", customerPhone: "690223344", deliveryType: "pickup",
    items: [{ productName: "Ceinture cuir", productPrice: 5000, quantity: 3, subtotal: 15000 }],
    total: 15000, createdAt: new Date(now - 3600000).toISOString(), updatedAt: new Date(now).toISOString(),
  },
  {
    id: "ord-7", trackingToken: "tk_s9t0u1", status: "cancelled",
    customerName: "Franck Atangana", customerPhone: "655445566", deliveryType: "delivery",
    address: "Deido centre",
    items: [{ productName: "Robe wax bleue", productPrice: 15000, quantity: 1, subtotal: 15000 }],
    total: 15000, createdAt: new Date(now - 3 * DAY).toISOString(), updatedAt: new Date(now - 2 * DAY).toISOString(),
  },
  {
    id: "ord-8", trackingToken: "tk_v2w3x4", status: "delivered",
    customerName: "Brice Ngono", customerPhone: "677998877", deliveryType: "pickup",
    items: [
      { productName: "Lunettes soleil", productPrice: 7500, quantity: 2, subtotal: 15000 },
      { productName: "Sac en pagne", productPrice: 8000, quantity: 1, subtotal: 8000 },
    ],
    total: 23000, createdAt: new Date(now - 4 * DAY).toISOString(), updatedAt: new Date(now - 3 * DAY).toISOString(),
  },
];

const mockProducts: DashboardProduct[] = [
  { id: "prod-1", name: "Robe wax bleue", price: 15000, category: "vetements", isActive: true },
  { id: "prod-2", name: "Sac en pagne", price: 8000, category: "accessoires", isActive: true },
  { id: "prod-3", name: "Chemise homme", price: 12000, category: "vetements", isActive: true },
  { id: "prod-4", name: "Ceinture cuir", price: 5000, category: "accessoires", isActive: true },
  { id: "prod-5", name: "Lunettes soleil", price: 7500, category: "accessoires", isActive: false },
  { id: "prod-6", name: "Bonnet laine", price: 3500, category: "accessoires", isActive: true },
];

const mockCategories: DashboardCategory[] = [
  { id: "vetements", name: "Vêtements", createdAt: new Date(now - 30 * DAY).toISOString() },
  { id: "accessoires", name: "Accessoires", createdAt: new Date(now - 28 * DAY).toISOString() },
  { id: "autre", name: "Autre", createdAt: new Date(now - 28 * DAY).toISOString() },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      merchant: defaultMerchant,
      shop: defaultShop,
      orders: mockOrders,
      products: mockProducts,
      categories: mockCategories,

      setMerchant: (merchant) => set({ merchant }),
      setShop: (shop) => set({ shop }),
      setOrders: (orders) => set({ orders }),
      setProducts: (products) => set({ products }),
      setCategories: (categories) => set({ categories }),

      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      updateOrderStatus: (orderId, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o,
          ),
        })),

      addProduct: (product) =>
        set((s) => ({
          products: [
            ...s.products,
            { ...product, id: `prod-${Date.now()}`, isActive: product.isActive ?? true },
          ],
        })),
      updateProduct: (id, updates) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      removeProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      addCategory: (category) =>
        set((s) => ({
          categories: [
            ...s.categories,
            { id: category.id, name: category.name, createdAt: new Date().toISOString() },
          ],
        })),
      updateCategory: (id, updates) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      removeCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          products: s.products.map((p) => (p.category === id ? { ...p, category: "autre" } : p)),
        })),

      hydrateFromOnboarding: (data) => {
        const normalize = (x: string) =>
          x
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "autre";

        const dedup = new Map<string, string>();
        (data.products ?? []).forEach((p) => {
          const label = (p.category ?? "").trim() || "Autre";
          const id = normalize(label);
          if (!dedup.has(id)) dedup.set(id, label);
        });
        if (!dedup.has("autre")) dedup.set("autre", "Autre");

        set({
          merchant: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            businessType: data.businessType,
          },
          shop: {
            shopName: data.shopName,
            slug: data.slug,
            city: data.city,
            neighborhood: data.neighborhood,
            description: data.description,
            openingHours: data.openingHours,
            logoUrl: data.logoUrl,
            whatsappPhone: data.phone,
          },
          categories: [...dedup.entries()].map(([id, name]) => ({
            id,
            name,
            createdAt: new Date().toISOString(),
          })),
          products: data.products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            imageUrl: p.imageUrl,
            category: normalize(p.category ?? "Autre"),
            description: p.description,
            isActive: true,
          })),
        });
      },
    }),
    {
      name: "boutiqi-dashboard",
      partialize: (state) => ({
        ...state,
        shop: state.shop
          ? { ...state.shop, logoUrl: undefined, coverImageUrl: undefined }
          : null,
        products: state.products.map((p) => ({ ...p, imageUrl: undefined })),
      }),
    },
  ),
);
