"use client";

import { useState } from "react";
import { LayoutDashboard, Bell, Package, MessageCircle } from "lucide-react";

import { ScrollReveal } from "./scroll-reveal";
import { SectionEyebrow, SectionSub, SectionTitle } from "./section-heading";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard en temps réel",
    desc: "Commandes du jour, dernières commandes, filtres par statut — tout en un coup d'œil dès l'ouverture.",
    preview: "dashboard",
  },
  {
    icon: Bell,
    title: "Notifications in-app",
    desc: "Alertes instantanées pour chaque nouvelle commande et changement de statut.",
    preview: "notifications",
  },
  {
    icon: Package,
    title: "Suivi de commande client",
    desc: "Vos clients suivent leur commande en temps réel via un lien unique. Statut mis à jour automatiquement.",
    preview: "tracking",
  },
  {
    icon: MessageCircle,
    title: "Intégration WhatsApp",
    desc: "Boutons de contact direct, messages pré-remplis, partage de lien boutique — tout est pensé pour WhatsApp.",
    preview: "whatsapp",
  },
];

const orders = [
  { id: "#047", name: "Marie Fotso", amount: "22 500", badge: "Nouvelle", cls: "bg-brand-50 text-brand-600" },
  { id: "#046", name: "Jean-Pierre M.", amount: "14 500", badge: "Confirmée", cls: "bg-[#EBF5FB] text-[#1A5276]" },
  { id: "#045", name: "Cécile Nguema", amount: "38 000", badge: "Livrée", cls: "bg-warm-100 text-warm-500" },
  { id: "#044", name: "Alain Bello", amount: "9 800", badge: "Livrée", cls: "bg-warm-100 text-warm-500" },
];

function DashboardPreview() {
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-warm-900">Dashboard</span>
        <span className="text-[11px] text-warm-500">Lun 17 Mars 2026</span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Commandes", value: "24", delta: "+3 vs hier", color: "" },
          { label: "Nouvelles", value: "7", delta: "à traiter", color: "text-brand-600" },
          { label: "Confirmées", value: "12", delta: "en cours", color: "text-[#1A5276]" },
          { label: "Livrées", value: "5", delta: "aujourd'hui", color: "text-warm-600" },
        ].map((s, i) => (
          <div
            key={s.label}
            className="animate-fade-up rounded-[10px] bg-warm-50 p-2.5"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="text-[9px] font-medium text-warm-500">{s.label}</div>
            <div className={`mt-1 font-display text-lg ${s.color || "text-warm-900"}`}>
              {s.value}
            </div>
            <div className={`text-[9px] font-semibold ${s.color ? "text-warm-500" : "text-brand-500"}`}>
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1">
        <div className="mb-2 text-[11px] font-semibold text-warm-700">
          Dernières commandes
        </div>
        {orders.map((o, i) => (
          <div
            key={o.id}
            className="flex animate-fade-up items-center gap-2.5 border-b border-warm-100 py-[7px] last:border-0"
            style={{ animationDelay: `${0.5 + i * 0.1}s` }}
          >
            <span className="min-w-[28px] text-[10px] font-bold text-warm-900">{o.id}</span>
            <span className="flex-1 truncate text-[10px] text-warm-600">{o.name}</span>
            <span className="text-[10px] font-bold text-warm-900">{o.amount}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${o.cls}`}>
              {o.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsPreview() {
  const notifs = [
    { type: "Nouvelle commande", msg: "#047 — Marie Fotso", time: "Il y a 2 min", dot: "bg-brand-500" },
    { type: "Commande confirmée", msg: "#046 — Jean-Pierre M.", time: "Il y a 15 min", dot: "bg-[#2471A3]" },
    { type: "Commande livrée", msg: "#045 — Cécile Nguema", time: "Il y a 1h", dot: "bg-warm-600" },
  ];

  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-warm-900">Notifications</span>
        <span className="relative grid size-6 place-items-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
          3
        </span>
      </div>

      <div className="flex-1 space-y-2">
        {notifs.map((n, i) => (
          <div
            key={n.msg}
            className="animate-fade-up rounded-[10px] border border-warm-200 bg-white p-3 transition hover:border-brand-200"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="flex items-start gap-2.5">
              <span className={`mt-1 size-2 shrink-0 animate-pulse-dot rounded-full ${n.dot}`} />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-warm-900">{n.type}</div>
                <div className="mt-0.5 text-[12px] text-warm-600">{n.msg}</div>
                <div className="mt-1 text-[11px] text-warm-400">{n.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-[11px] text-warm-500">
        Toutes les notifications sont en temps réel
      </div>
    </div>
  );
}

function TrackingPreview() {
  const steps = [
    { label: "Nouvelle", time: "17 Mars, 14:30", active: true, done: true },
    { label: "Confirmée", time: "17 Mars, 14:45", active: true, done: true },
    { label: "En préparation", time: "17 Mars, 15:10", active: true, done: false },
    { label: "En livraison", time: "—", active: false, done: false },
    { label: "Livrée", time: "—", active: false, done: false },
  ];

  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <div className="text-center">
        <div className="text-[11px] font-medium text-warm-500">Commande</div>
        <div className="mt-1 font-display text-2xl text-warm-900">#047</div>
        <div className="mt-1 text-[12px] text-warm-600">Marie Fotso · 22 500 FCFA</div>
      </div>

      <div className="relative flex-1">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className={`relative flex animate-fade-up items-start gap-3 pb-6 last:pb-0 ${
              i < steps.length - 1 ? "border-l-2" : ""
            } ${s.active ? "border-brand-500" : "border-warm-200"} pl-5`}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <div
              className={`absolute -left-[9px] top-0 grid size-4 place-items-center rounded-full border-2 ${
                s.done
                  ? "border-brand-500 bg-brand-500"
                  : s.active
                    ? "animate-pulse-dot border-brand-500 bg-white"
                    : "border-warm-200 bg-white"
              }`}
            >
              {s.done && (
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>

            <div className="flex-1">
              <div className={`text-[13px] font-semibold ${s.active ? "text-warm-900" : "text-warm-400"}`}>
                {s.label}
              </div>
              <div className="text-[11px] text-warm-500">{s.time}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="rounded-lg bg-[#25D366] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#20BA5A]">
        Contacter la boutique
      </button>
    </div>
  );
}

function WhatsAppPreview() {
  return (
    <div className="flex h-full flex-col gap-3 p-5">
      <div className="text-center">
        <div className="text-sm font-bold text-warm-900">Intégration WhatsApp</div>
        <div className="mt-1 text-[11px] text-warm-500">Messages pré-remplis automatiquement</div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="animate-fade-up rounded-xl border border-warm-200 bg-white p-4" style={{ animationDelay: "0.1s" }}>
          <div className="mb-2 flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-[#25D366]">
              <MessageCircle className="size-4 text-white" />
            </div>
            <div className="text-[12px] font-semibold text-warm-900">Partager ma boutique</div>
          </div>
          <div className="rounded-lg bg-warm-50 p-2.5 text-[11px] leading-relaxed text-warm-600">
            Salut ! 👋 Découvre ma boutique en ligne : boutiki.cm/solange-frip-akwa
          </div>
        </div>

        <div className="animate-fade-up rounded-xl border border-warm-200 bg-white p-4" style={{ animationDelay: "0.2s" }}>
          <div className="mb-2 flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-[#25D366]">
              <MessageCircle className="size-4 text-white" />
            </div>
            <div className="text-[12px] font-semibold text-warm-900">Contacter le client</div>
          </div>
          <div className="rounded-lg bg-warm-50 p-2.5 text-[11px] leading-relaxed text-warm-600">
            Bonjour Marie, votre commande #047 (22 500 FCFA) est confirmée. Livraison prévue demain.
          </div>
        </div>

        <div className="animate-fade-up rounded-xl border border-warm-200 bg-white p-4" style={{ animationDelay: "0.3s" }}>
          <div className="mb-2 flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-[#25D366]">
              <MessageCircle className="size-4 text-white" />
            </div>
            <div className="text-[12px] font-semibold text-warm-900">Suivi client</div>
          </div>
          <div className="rounded-lg bg-warm-50 p-2.5 text-[11px] leading-relaxed text-warm-600">
            Suivez votre commande : boutiki.cm/track/abc123xyz
          </div>
        </div>
      </div>
    </div>
  );
}

export function Features() {
  const [active, setActive] = useState(0);

  const renderPreview = () => {
    switch (features[active].preview) {
      case "dashboard":
        return <DashboardPreview />;
      case "notifications":
        return <NotificationsPreview />;
      case "tracking":
        return <TrackingPreview />;
      case "whatsapp":
        return <WhatsAppPreview />;
      default:
        return <DashboardPreview />;
    }
  };

  return (
    <section id="features" className="bg-warm-50 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <ScrollReveal>
          <SectionEyebrow text="Fonctionnalités" />
        </ScrollReveal>
        <ScrollReveal>
          <SectionTitle>
            Tout ce dont vous
            <br />
            <em className="text-brand-500">avez besoin.</em>
          </SectionTitle>
        </ScrollReveal>
        <ScrollReveal>
          <SectionSub>
            Conçu pour les commerçants camerounais. Pas un outil importé,
            adapté.
          </SectionSub>
        </ScrollReveal>

        <ScrollReveal className="mt-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Feature list */}
            <div className="flex flex-col gap-2">
              {features.map((f, i) => {
                const Icon = f.icon;
                const isActive = i === active;
                return (
                  <button
                    key={f.title}
                    onClick={() => setActive(i)}
                    className={`flex items-start gap-4 rounded-[14px] border-[1.5px] px-5 py-5 text-left transition-all duration-300 ${
                      isActive
                        ? "scale-[1.02] border-[#D8F3DC] bg-white shadow-md"
                        : "border-transparent hover:border-warm-200 hover:bg-white"
                    }`}
                  >
                    <div
                      className={`grid size-11 shrink-0 place-items-center rounded-xl transition-all duration-300 ${
                        isActive ? "bg-brand-500 text-white shadow-sm" : "bg-brand-50 text-brand-500"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <div className="text-[15px] font-semibold text-warm-900">{f.title}</div>
                      <div className="mt-1 text-[13px] leading-relaxed text-warm-500">
                        {f.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Visual — dynamic preview */}
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-warm-200 bg-white shadow-lg transition-all duration-500">
              <div key={active} className="h-full">
                {renderPreview()}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
