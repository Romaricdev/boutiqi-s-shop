"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Comment ça marche", href: "#how" },
  { label: "Fonctionnalités", href: "#features" },
  { label: "Tarifs", href: "#pricing" },
];

function Logo({ size = 34 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="grid place-items-center rounded-[9px] bg-brand-500"
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.59}
          height={size * 0.59}
          viewBox="0 0 44 44"
          fill="none"
        >
          <path
            d="M7 22L13 13L23 27L29 18L37 27"
            stroke="#B7E4C7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="33" cy="13" r="4" fill="#95D5B2" />
          <path
            d="M7 35Q22 30 37 35"
            stroke="#52B788"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="font-display text-[22px] tracking-[-0.5px] text-brand-500">
        Boutiki
      </span>
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 animate-fade-down">
      <div className="border-b border-warm-200/60 bg-warm-50/[0.88] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <Link href="/" aria-label="Accueil">
            <Logo />
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm font-medium text-warm-500 transition-colors hover:text-brand-500"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-warm-700 transition-all duration-200 hover:bg-warm-100"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-brand-700 hover:shadow-md"
            >
              Créer ma boutique
            </Link>
          </div>

          <button
            className="grid size-10 place-items-center rounded-lg transition hover:bg-warm-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menu"
          >
            <Menu className="size-5 text-warm-700" />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-50 bg-warm-50 transition-transform duration-300 lg:pointer-events-none lg:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-warm-200 px-4">
          <Link href="/" onClick={() => setOpen(false)} aria-label="Accueil">
            <Logo />
          </Link>
          <button
            className="grid size-10 place-items-center rounded-lg transition hover:bg-warm-100"
            onClick={() => setOpen(false)}
            aria-label="Fermer"
          >
            <X className="size-5 text-warm-700" />
          </button>
        </div>

        <div className="flex flex-col gap-1 px-4 pt-6">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-warm-700 transition hover:bg-warm-100"
            >
              {l.label}
            </a>
          ))}
          <hr className="my-4 border-warm-200" />
          <Link
            href="/auth/login"
            onClick={() => setOpen(false)}
            className="rounded-xl px-4 py-3 text-base font-medium text-warm-700 transition hover:bg-warm-100"
          >
            Connexion
          </Link>
          <Link
            href="/auth/register"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-xl bg-brand-500 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-brand-700"
          >
            Créer ma boutique
          </Link>
        </div>
      </div>
    </nav>
  );
}
