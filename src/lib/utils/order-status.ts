import type { OrderStatus } from "@/lib/types/dashboard";

/** Transitions autorisées (PRD §8) */
export const ORDER_NEXT_STATUS: Record<OrderStatus, OrderStatus[] | null> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["delivering", "delivered", "cancelled"],
  delivering: ["delivered", "cancelled"],
  delivered: null,
  cancelled: null,
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  const next = ORDER_NEXT_STATUS[from];
  return next !== null && next.includes(to);
}
