import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OnboardingAccount = {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  businessType: string;
};

export type OnboardingShop = {
  shopName: string;
  city: string;
  neighborhood: string;
  description: string;
  openingHours: string;
  logoUrl?: string;
};

export type OnboardingProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category: string;
  description?: string;
};

type OnboardingState = {
  currentStep: number;
  account: OnboardingAccount | null;
  shop: OnboardingShop | null;
  products: OnboardingProduct[];
  shopSlug: string;

  setStep: (step: number) => void;
  setAccount: (account: OnboardingAccount) => void;
  setShop: (shop: OnboardingShop) => void;
  addProduct: (product: OnboardingProduct) => void;
  updateProduct: (id: string, product: Partial<OnboardingProduct>) => void;
  removeProduct: (id: string) => void;
  reset: () => void;
};

const generateSlug = (shopName: string): string => {
  return shopName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      account: null,
      shop: null,
      products: [],
      shopSlug: "",

      setStep: (step) => set({ currentStep: step }),

      setAccount: (account) => set({ account }),

      setShop: (shop) => {
        const slug = generateSlug(shop.shopName);
        set({ shop, shopSlug: slug });
      },

      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      reset: () =>
        set({
          currentStep: 1,
          account: null,
          shop: null,
          products: [],
          shopSlug: "",
        }),
    }),
    {
      name: "boutiqi-onboarding",
    },
  ),
);
