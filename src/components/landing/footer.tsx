import Link from "next/link";

const columns = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Tarifs", href: "#pricing" },
      { label: "Démo", href: "#" },
      { label: "Nouveautés", href: "#" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Guide de démarrage", href: "#" },
      { label: "Centre d'aide", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Conditions d'utilisation", href: "#" },
      { label: "Politique de confidentialité", href: "#" },
      { label: "Mentions légales", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-warm-900 px-4 pb-8 pt-14 lg:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Top */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid size-7 place-items-center rounded-[7px] bg-brand-500">
                <svg width="16" height="16" viewBox="0 0 44 44" fill="none">
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
              <span className="font-display text-[22px] tracking-[-0.5px] text-warm-50">
                Boutiki
              </span>
            </div>
            <p className="mt-3 max-w-[260px] text-sm leading-relaxed text-warm-500">
              La plateforme de commerce simplifié pour les entrepreneurs
              camerounais. Créez, vendez, encaissez.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-warm-300">
                {col.title}
              </div>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-warm-500 transition-colors hover:text-warm-50"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <span className="text-[13px] text-warm-500">
            © {new Date().getFullYear()} Boutiki. Tous droits réservés.
          </span>
          <span className="flex items-center gap-1.5 text-[13px] text-warm-500">
            🇨🇲 Fait avec fierté au Cameroun
          </span>
        </div>
      </div>
    </footer>
  );
}
