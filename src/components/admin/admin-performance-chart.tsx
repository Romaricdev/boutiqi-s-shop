/**
 * Graphique minimal (lignes + aires) pour coller à l’esthétique dashboard de référence.
 * Données statiques — à remplacer par des données réelles.
 */
export function AdminPerformanceChart() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-neutral-100/80 bg-gradient-to-b from-neutral-50/80 to-white px-2 pt-4 shadow-inner transition-shadow duration-300 ease-out hover:shadow-md">
      <svg viewBox="0 0 520 140" className="h-[160px] w-full" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="adminPerfFillBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="adminPerfFillOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(249, 115, 22)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="rgb(249, 115, 22)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grille légère */}
        {[40, 70, 100, 130].map((y) => (
          <line key={y} x1="32" y1={y} x2="500" y2={y} stroke="rgb(229, 231, 235)" strokeWidth="1" />
        ))}
        {/* Aire orange (mois dernier) */}
        <path
          d="M 32 100 L 110 88 L 188 95 L 266 72 L 344 80 L 422 58 L 500 65 L 500 130 L 32 130 Z"
          fill="url(#adminPerfFillOrange)"
        />
        {/* Aire bleue (ce mois) */}
        <path
          d="M 32 110 L 110 75 L 188 85 L 266 52 L 344 48 L 422 38 L 500 42 L 500 130 L 32 130 Z"
          fill="url(#adminPerfFillBlue)"
        />
        <path
          d="M 32 110 L 110 75 L 188 85 L 266 52 L 344 48 L 422 38 L 500 42"
          fill="none"
          stroke="rgb(59, 130, 246)"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 32 100 L 110 88 L 188 95 L 266 72 L 344 80 L 422 58 L 500 65"
          fill="none"
          stroke="rgb(249, 115, 22)"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex justify-between px-8 pb-2 text-[10px] font-medium text-neutral-400">
        <span>01</span>
        <span>02</span>
        <span>03</span>
        <span>04</span>
        <span>05</span>
        <span>06</span>
        <span>07</span>
      </div>
    </div>
  );
}
