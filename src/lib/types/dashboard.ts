/** Statuts commande (PRD §8) */
export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "delivering"
  | "delivered"
  | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Nouvelle",
  confirmed: "Confirmée",
  preparing: "En préparation",
  delivering: "En livraison",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export type DeliveryType = "delivery" | "pickup";

/** Snapshot d'un article dans une commande (historique) */
export interface OrderItemSnapshot {
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface DashboardOrder {
  id: string;
  trackingToken: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  address?: string;
  note?: string;
  items: OrderItemSnapshot[];
  total: number;
  createdAt: string; // ISO
  updatedAt: string;
}

export interface DashboardProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  /** Référence de catégorie (id/slug) */
  category: string;
  description?: string;
  isActive: boolean;
}

export interface DashboardCategory {
  id: string; // slug
  name: string;
  createdAt: string; // ISO
}

export interface DashboardShop {
  shopName: string;
  slug: string;
  city: string;
  neighborhood: string;
  description: string;
  openingHours: string;
  logoUrl?: string;
  coverImageUrl?: string;
  whatsappPhone: string;
}

export interface DashboardMerchant {
  fullName: string;
  email: string;
  phone: string;
  businessType: string;
}
