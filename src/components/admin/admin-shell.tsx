"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Settings,
  ShieldAlert,
  ShoppingCart,
  Store,
  Tags,
  Users,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { Avatar, AvatarFallback } from "@/components/shadcn/avatar";
import { Button } from "@/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Separator } from "@/components/shadcn/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/shadcn/sheet";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: "Principal",
    items: [{ href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard }],
  },
  {
    title: "Gestion",
    items: [
      { href: "/admin/shops", label: "Boutiques", icon: Store },
      { href: "/admin/merchants", label: "Commerçants", icon: Users },
      { href: "/admin/orders", label: "Commandes", icon: ShoppingCart },
    ],
  },
  {
    title: "Pilotage",
    items: [
      { href: "/admin/analytics", label: "Statistiques", icon: BarChart3 },
      { href: "/admin/subscriptions", label: "Abonnements", icon: CreditCard },
      { href: "/admin/subscriptions/plans", label: "Offres d'abonnement", icon: Tags },
    ],
  },
  {
    title: "Confiance",
    items: [
      { href: "/admin/moderation", label: "Modération", icon: ShieldAlert },
      { href: "/admin/support", label: "Support", icon: LifeBuoy },
    ],
  },
  {
    title: "Système",
    items: [{ href: "/admin/settings", label: "Paramètres", icon: Settings }],
  },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6 px-2">
      {navGroups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            {group.title}
          </p>
          <nav className="flex flex-col gap-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = isNavActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className="group block rounded-xl outline-none transition-transform duration-200 ease-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-neutral-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-100"
                >
                  <span
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ease-out will-change-transform",
                      active
                        ? "bg-white text-neutral-900 shadow-soft-sm hover:shadow-md"
                        : "text-neutral-500 hover:translate-x-0.5 hover:bg-white/70 hover:text-neutral-900 hover:shadow-soft-sm",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0 stroke-[1.5] transition-transform duration-200",
                        !active && "group-hover:scale-110",
                      )}
                      aria-hidden
                    />
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-5 pb-6 pt-7">
      <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-neutral-900 text-sm font-bold text-white shadow-md shadow-neutral-900/25 transition-shadow duration-300 hover:shadow-lg hover:shadow-neutral-900/35">
        B
      </div>
      <div>
        <div className="text-[15px] font-bold tracking-tight text-neutral-900">boutiki</div>
        <div className="text-[11px] font-medium text-neutral-400">admin</div>
      </div>
    </div>
  );
}

function HeaderDate() {
  const label = useMemo(
    () =>
      new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );
  return (
    <div className="group flex items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-white px-3 py-2 shadow-soft-sm transition-all duration-200 ease-out hover:-translate-y-px hover:border-neutral-200 hover:shadow-md">
      <span className="hidden text-sm font-medium text-neutral-700 sm:inline">{label}</span>
      <span className="sm:hidden text-xs font-medium text-neutral-600">
        {new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date())}
      </span>
      <span className="grid size-8 place-items-center rounded-lg border border-neutral-100 bg-neutral-50 transition-colors duration-200 group-hover:bg-neutral-100">
        <Calendar className="size-3.5 text-neutral-500 transition-transform duration-200 group-hover:scale-105" />
      </span>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const closeMobile = () => setOpen(false);

  return (
    <div className="min-h-dvh bg-neutral-50 font-sans antialiased text-neutral-900 md:h-dvh md:overflow-hidden">
      {/*
        Sidebar fixe : ne défile pas avec la page. Seul le bloc navigation interne scroll si besoin.
        Colonne principale : hauteur viewport, scroll uniquement dans <main>.
      */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-neutral-200/60 bg-neutral-100 shadow-[6px_0_32px_-12px_rgba(15,23,42,0.08)] md:flex md:flex-col">
        <div className="flex h-dvh flex-col">
          <SidebarBrand />
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain pb-2">
            <NavLinks />
          </div>

          <Separator className="shrink-0 bg-neutral-200/60" />
          <div className="flex shrink-0 flex-col gap-0.5 p-3">
            <Button
              variant="ghost"
              className="h-9 justify-start gap-2 rounded-xl px-3 text-[13px] font-medium text-neutral-500 transition-all duration-200 hover:translate-x-0.5 hover:bg-white hover:text-neutral-900 hover:shadow-soft-sm"
              asChild
            >
              <Link href="/">
                <CircleHelp className="size-[18px] stroke-[1.5]" />
                Aide & informations
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="h-9 justify-start gap-2 rounded-xl px-3 text-[13px] font-medium text-neutral-500 hover:bg-neutral-200/40 hover:text-neutral-900"
              disabled
            >
              <LogOut className="size-[18px] stroke-[1.5]" />
              Déconnexion (bientôt)
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col bg-neutral-50 md:ml-[260px] md:h-dvh md:min-h-0">
        <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-neutral-200/60 bg-white/90 px-4 shadow-[0_1px_0_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.06)] backdrop-blur-md md:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-xl transition-all duration-200 hover:bg-neutral-100 hover:shadow-soft-sm active:scale-95 md:hidden"
                aria-label="Menu"
              >
                <Menu className="size-5 text-neutral-600" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-[280px] flex-col border-neutral-200 bg-neutral-100 p-0 shadow-2xl shadow-neutral-900/10"
            >
              <SidebarBrand />
              <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-4">
                <NavLinks onNavigate={closeMobile} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 items-center justify-end gap-3">
            <HeaderDate />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="group size-10 rounded-xl transition-all duration-200 hover:bg-neutral-100 hover:shadow-soft-sm active:scale-95"
                  aria-label="Compte"
                >
                  <Avatar className="size-9 ring-1 ring-neutral-200/80 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md">
                    <AvatarFallback className="bg-neutral-900 text-[11px] font-bold text-white">AD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl border-neutral-200/80 shadow-soft">
                <DropdownMenuLabel className="font-normal">
                  <span className="text-[11px] text-neutral-400">Connecté en tant que</span>
                  <span className="block truncate text-sm font-semibold text-neutral-900">admin@boutiki.cm</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-neutral-100" />
                <DropdownMenuItem asChild>
                  <Link href="/">Retour au site</Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="text-neutral-400">
                  Déconnexion (bientôt)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
