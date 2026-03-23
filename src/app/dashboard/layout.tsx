"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
  Users2,
  Settings,
  LogOut,
  Store,
  ChevronLeft,
  Search,
  Bell,
  PlusCircle,
  User,
} from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { useDashboardStore } from "@/lib/store/dashboard";
import { cn } from "@/lib/cn";

const GENERAL = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/dashboard/products", label: "Catalogue", icon: Package },
  { href: "/dashboard/analytics", label: "Statistiques", icon: BarChart3 },
  { href: "/dashboard/customers", label: "Clients", icon: Users2 },
];

const BOUTIQUE = [
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

const MOBILE_NAV = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/dashboard/products", label: "Catalogue", icon: Package },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { shop, merchant } = useDashboardStore();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex min-h-dvh bg-warm-50 font-sans">
      {/* Sidebar desktop - style Nexus */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-warm-200 bg-white/95 transition-[width] lg:flex",
          sidebarCollapsed ? "w-[72px]" : "w-60",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-warm-100 px-3.5">
          {!sidebarCollapsed && (
            <Logo size={28} href="/dashboard" />
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-warm-500 hover:bg-warm-100 hover:text-warm-700"
            aria-label={sidebarCollapsed ? "Ouvrir le menu" : "Réduire le menu"}
          >
            <ChevronLeft
              className={cn("size-5 transition-transform", sidebarCollapsed && "rotate-180")}
            />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 overflow-auto py-4">
          {!sidebarCollapsed && (
            <span className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-warm-400">
              Général
            </span>
          )}
          {GENERAL.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "mx-2.5 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ease-out",
                  isActive
                    ? "bg-warm-100 text-warm-900 shadow-sm"
                    : "text-warm-600 hover:translate-x-[1px] hover:bg-warm-50 hover:text-warm-800 hover:shadow-sm",
                )}
              >
                <Icon className="size-4.5 shrink-0 text-warm-500" />
                {!sidebarCollapsed && <span>{label}</span>}
              </Link>
            );
          })}

          {!sidebarCollapsed && (
            <span className="mt-5 px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-warm-400">
              Boutique
            </span>
          )}
          {BOUTIQUE.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "mx-2.5 flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ease-out",
                  isActive
                    ? "bg-warm-100 text-warm-900 shadow-sm"
                    : "text-warm-600 hover:translate-x-[1px] hover:bg-warm-50 hover:text-warm-800 hover:shadow-sm",
                )}
              >
                <Icon className="size-4.5 shrink-0 text-warm-500" />
                {!sidebarCollapsed && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {!sidebarCollapsed && (
          <div className="border-t border-warm-100 p-3.5">
            <div className="mb-2.5 flex items-center gap-2 rounded-xl bg-warm-50 px-3 py-2.5">
              <Store className="size-4 shrink-0 text-warm-500" />
              <span className="truncate text-xs font-medium text-warm-700">
                {shop?.shopName ?? "Boutique"}
              </span>
            </div>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-warm-600 transition hover:bg-warm-50 hover:text-warm-800"
            >
              <LogOut className="size-5 shrink-0" />
              Quitter
            </Link>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top header - style Nexus */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-warm-200 bg-white px-4 lg:px-6">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative hidden max-w-xs flex-1 sm:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-warm-400" />
              <input
                type="search"
                placeholder="Rechercher..."
                className="h-9 w-full rounded-lg border border-warm-200 bg-warm-50/50 pl-9 pr-3 text-sm text-warm-900 placeholder:text-warm-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-warm-200 bg-white px-1.5 py-0.5 text-[10px] text-warm-400 sm:inline-block">
                ⌘F
              </kbd>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="grid size-9 place-items-center rounded-lg text-warm-500 hover:bg-warm-100 hover:text-warm-700"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
            </button>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-lg text-warm-500 hover:bg-warm-100 hover:text-warm-700"
              aria-label="Créer"
            >
              <PlusCircle className="size-5" />
            </button>
            <div className="ml-2 flex items-center gap-2 rounded-lg border border-warm-100 bg-warm-50/50 pl-1 pr-3 py-1.5">
              <div className="grid size-8 place-items-center rounded-md bg-brand-100 text-brand-600">
                <User className="size-4" />
              </div>
              <span className="hidden max-w-[140px] truncate text-sm font-medium text-warm-800 sm:inline">
                {merchant?.fullName ?? shop?.shopName ?? "Commerçant"}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-warm-200 bg-white px-4 py-3 lg:hidden">
          <Logo size={26} href="/dashboard" />
          <span className="truncate text-sm font-medium text-warm-700">
            {shop?.shopName ?? "Dashboard"}
          </span>
          <div className="w-[26px]" />
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-4 py-5 lg:px-6 lg:py-6">
          {children}
        </main>

        {/* Bottom nav mobile */}
        <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-warm-200 bg-white py-2 lg:hidden">
          {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs font-medium",
                  isActive ? "text-brand-600" : "text-warm-500",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="h-16 lg:hidden" />
      </div>
    </div>
  );
}
