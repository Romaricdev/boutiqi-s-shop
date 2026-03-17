import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* ---------- Phone mockup ---------- */

const products = [
  {
    name: "Robe wax bleue",
    price: "14 500 FCFA",
    gradient: "from-brand-50 to-[#B7E4C7]",
    stroke: "#40916C",
    d: "M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H7v10c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V10h3.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z",
  },
  {
    name: "Sac cuir marron",
    price: "28 000 FCFA",
    gradient: "from-[#FBF0EA] to-[#F2CCBA]",
    stroke: "#A0522D",
    d: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z|M3 6h18|M16 10a4 4 0 01-8 0",
  },
  {
    name: "Collier doré",
    price: "7 500 FCFA",
    gradient: "from-[#EBF5FB] to-[#A9CCE3]",
    stroke: "#2471A3",
    d: "CIRCLE:12:8:5|M12 13v8M8 17h8",
  },
  {
    name: "Chaussure wax",
    price: "19 900 FCFA",
    gradient: "from-[#FEF6E4] to-[#F2C94C]",
    stroke: "#8B5A00",
    d: "RECT:3:11:18:11:2|M7 11V7a5 5 0 0110 0v4",
  },
];

function ProductIcon({ d, stroke }: { d: string; stroke: string }) {
  const parts = d.split("|");
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.5">
      {parts.map((p, i) => {
        if (p.startsWith("CIRCLE:")) {
          const [, cx, cy, r] = p.split(":");
          return <circle key={i} cx={cx} cy={cy} r={r} />;
        }
        if (p.startsWith("RECT:")) {
          const [, x, y, w, h, rx] = p.split(":");
          return <rect key={i} x={x} y={y} width={w} height={h} rx={rx} />;
        }
        return <path key={i} d={p} />;
      })}
    </svg>
  );
}

function PhoneMockup() {
  return (
    <div className="relative">
      {/* Floating cards — desktop only */}
      <div className="absolute -left-28 top-20 z-10 hidden w-40 animate-float-y rounded-[14px] bg-white p-3 shadow-lg ring-1 ring-warm-200/80 xl:block">
        <div className="text-[9px] font-semibold uppercase tracking-wider text-warm-500">
          Nouvelle commande
        </div>
        <div className="mt-1 font-display text-base text-warm-900">#047</div>
        <div className="text-[10px] text-warm-500">Marie Fotso — Akwa</div>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-semibold text-brand-500">
          <span className="size-[5px] rounded-full bg-current" />
          22 500 FCFA
        </span>
      </div>

      <div
        className="absolute -right-[90px] top-40 z-10 hidden w-[150px] animate-float-y rounded-[14px] bg-white p-3 shadow-lg ring-1 ring-warm-200/80 xl:block"
        style={{ animationDelay: "-2s" }}
      >
        <div className="text-[9px] font-semibold uppercase tracking-wider text-warm-500">
          Commande confirmée
        </div>
        <div className="mt-1 font-display text-base text-warm-900">#043</div>
        <div className="text-[10px] text-warm-500">En livraison</div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-warm-100">
          <div className="h-full w-3/4 rounded-full bg-brand-500" />
        </div>
      </div>

      <div
        className="absolute -left-[90px] bottom-36 z-10 hidden w-[140px] animate-float-y rounded-[14px] bg-white p-3 shadow-lg ring-1 ring-warm-200/80 xl:block"
        style={{ animationDelay: "-1s" }}
      >
        <div className="text-[9px] font-semibold uppercase tracking-wider text-warm-500">
          Suivi temps réel
        </div>
        <div className="mt-1 font-display text-base text-warm-900">12</div>
        <div className="text-[10px] text-warm-500">Commandes en cours</div>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#EBF5FB] px-2 py-0.5 text-[9px] font-semibold text-[#1A5276]">
          <span className="size-[5px] rounded-full bg-current" />
          Notifications actives
        </span>
      </div>

      {/* Phone frame */}
      <div className="mx-auto w-[260px] rounded-[44px] bg-warm-900 p-3 shadow-[0_40px_80px_rgba(28,26,23,0.22),0_0_0_1px_rgba(255,255,255,0.08)] sm:w-[280px]">
        <div className="mx-auto mb-2 h-7 w-[90px] rounded-b-[18px] bg-warm-900" />

        <div className="overflow-hidden rounded-[34px] bg-warm-50">
          {/* Shop header */}
          <div className="border-b border-warm-200/50 bg-white px-4 pb-2.5 pt-3.5">
            <div className="font-display text-[15px] text-warm-900">Boutique Solange</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-warm-500">
              <span className="size-1.5 rounded-full bg-green-500" />
              Ouvert · Akwa, Douala
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-warm-200/50 bg-white px-4 py-2.5">
            {["Tout", "Robes", "Sacs", "Bijoux"].map((c, i) => (
              <span
                key={c}
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  i === 0
                    ? "border border-[#D8F3DC] bg-brand-50 text-brand-500"
                    : "bg-warm-100 text-warm-500"
                }`}
              >
                {c}
              </span>
            ))}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 gap-2 bg-warm-100 p-2.5">
            {products.map((p) => (
              <div
                key={p.name}
                className="overflow-hidden rounded-[10px] border border-warm-200/50 bg-white"
              >
                <div
                  className={`flex h-20 items-center justify-center bg-gradient-to-br ${p.gradient}`}
                >
                  <ProductIcon d={p.d} stroke={p.stroke} />
                </div>
                <div className="px-2 py-1.5">
                  <div className="text-[10px] font-semibold text-warm-900">{p.name}</div>
                  <div className="flex items-end justify-between">
                    <span className="text-[11px] font-bold text-brand-500">{p.price}</span>
                    <button className="grid size-5 place-items-center rounded-md bg-brand-500 text-sm leading-none text-white">
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart bar */}
          <div className="mx-2.5 mb-2.5 flex items-center justify-between rounded-[10px] bg-brand-500 px-3.5 py-2.5">
            <div>
              <div className="text-[11px] text-white/80">2 articles · Panier</div>
              <div className="text-[13px] font-bold text-white">42 500 FCFA</div>
            </div>
            <span className="rounded-[7px] bg-white px-2.5 py-[5px] text-[10px] font-bold text-brand-500">
              Commander →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Hero section ---------- */

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-20 -top-[120px] size-[600px] rounded-full bg-brand-50 opacity-70" />
        <div className="absolute -left-[60px] bottom-20 size-[300px] rounded-full bg-accent-200 opacity-35" />
      </div>

      {/* Dots */}
      <div className="pointer-events-none absolute left-12 top-[120px] hidden grid-cols-8 gap-[18px] opacity-[0.18] lg:grid">
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} className="size-1 rounded-full bg-brand-500" />
        ))}
      </div>

      <div className="relative z-[1] mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:gap-0 lg:px-6 lg:py-0">
        {/* Left column */}
        <div className="lg:py-24">
          <div
            className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-[#D8F3DC] bg-brand-50 px-3.5 py-1.5"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="size-1.5 animate-pulse-dot rounded-full bg-[#52B788]" />
            <span className="text-xs font-semibold tracking-wide text-brand-500">
              Lancé à Douala — Gratuit pour commencer
            </span>
          </div>

          <h1
            className="mt-7 animate-fade-up font-display text-[clamp(40px,5vw,62px)] leading-[1.08] tracking-[-1.5px] text-warm-900"
            style={{ animationDelay: "0.2s" }}
          >
            Votre boutique
            <br />
            <em className="text-brand-500">en ligne</em> en
            <br />
            <span className="relative inline-block">
              5&nbsp;minutes
              <span className="absolute inset-x-0 bottom-0.5 h-[3px] rounded-full bg-accent-500" />
            </span>
          </h1>

          <p
            className="mt-6 max-w-[440px] animate-fade-up text-[17px] leading-[1.7] text-warm-500"
            style={{ animationDelay: "0.3s" }}
          >
            Créez votre catalogue, partagez un lien sur WhatsApp et centralisez vos commandes dans un dashboard simple — sans app, sans formation.
          </p>

          <div
            className="mt-10 flex animate-fade-up flex-wrap items-center gap-4"
            style={{ animationDelay: "0.4s" }}
          >
            <Link
              href="/auth/register"
              className="group inline-flex items-center gap-2 rounded-[10px] bg-brand-500 px-7 py-3.5 text-[15px] font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-brand-700 hover:shadow-lg"
            >
              Démarrer gratuitement
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demo/shop/solange-frip-akwa"
              className="inline-flex items-center gap-2 rounded-[10px] border-[1.5px] border-warm-200 bg-transparent px-6 py-3.5 text-[15px] font-medium text-warm-700 transition-all duration-300 hover:border-warm-300 hover:bg-white hover:shadow-md"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
              </svg>
              Voir la démo
            </Link>
          </div>

          {/* Social proof */}
          <div
            className="mt-12 flex animate-fade-up flex-wrap items-center gap-4"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex -space-x-2.5">
              {[
                { i: "MS", bg: "bg-brand-500" },
                { i: "JK", bg: "bg-accent-500" },
                { i: "AF", bg: "bg-[#1A5276]" },
                { i: "CN", bg: "bg-[#7D4E24]" },
              ].map((a) => (
                <div
                  key={a.i}
                  className={`grid size-[34px] place-items-center rounded-full border-[2.5px] border-warm-50 text-[11px] font-bold text-white ${a.bg}`}
                >
                  {a.i}
                </div>
              ))}
            </div>
            <span className="text-[13px] text-warm-500">
              <strong className="font-semibold text-warm-700">+240 commerçants</strong> font
              confiance à Boutiki
            </span>
            <span className="hidden h-7 w-px bg-warm-200 sm:block" />
            <span className="flex items-center gap-1">
              <span className="text-[14px] text-[#D4A017]">★★★★★</span>
              <span className="text-[13px] text-warm-500">4.9/5</span>
            </span>
          </div>
        </div>

        {/* Right column — phone */}
        <div
          className="relative flex animate-fade-left items-center justify-center lg:py-20"
          style={{ animationDelay: "0.3s" }}
        >
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}
