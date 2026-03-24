import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Clock3, MessageSquareWarning, ShieldCheck, Siren } from "lucide-react";

import type { AdminOpsRole } from "@/lib/admin/support";

export type ModerationTarget = "shop" | "product" | "review";
export type ModerationPriority = "low" | "medium" | "high" | "critical";
export type ModerationStatus = "open" | "in_review" | "resolved" | "rejected";

export type ModerationAttachment = {
  id: string;
  name: string;
  type: "image" | "pdf" | "other";
  sizeKb: number;
};

export type ModerationMessage = {
  id: string;
  from: "merchant" | "moderator" | "system";
  author: string;
  text: string;
  createdAt: string;
  attachments?: ModerationAttachment[];
};

export type ModerationLog = {
  id: string;
  at: string;
  actor: string;
  action: string;
};

export type ModerationCase = {
  id: string;
  createdAt: string;
  targetType: ModerationTarget;
  targetLabel: string;
  shopName: string;
  reason: string;
  priority: ModerationPriority;
  status: ModerationStatus;
  reporter: string;
  assignedTo: string;
  tags: string[];
  slaReviewTargetMin: number;
  firstReviewAt?: string;
  resolvedAt?: string;
  notes: string[];
  messages: ModerationMessage[];
  history: ModerationLog[];
};

function log(action: string, actor = "Admin"): ModerationLog {
  return { id: crypto.randomUUID(), at: new Date().toISOString(), actor, action };
}

export const MODERATION_TARGET_LABELS: Record<ModerationTarget, string> = {
  product: "Produit",
  shop: "Boutique",
  review: "Avis",
};
export const MODERATION_STATUS_LABELS: Record<ModerationStatus, string> = {
  open: "Ouvert",
  in_review: "En analyse",
  resolved: "Resolu",
  rejected: "Rejete",
};
export const MODERATION_PRIORITY_LABELS: Record<ModerationPriority, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Haute",
  critical: "Critique",
};

export function moderationPriorityBadgeClass(p: ModerationPriority): string {
  if (p === "critical") return "border-red-200 bg-red-50 text-red-700";
  if (p === "high") return "border-orange-200 bg-orange-50 text-orange-700";
  if (p === "medium") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-neutral-200 bg-white text-neutral-600";
}
export function moderationStatusBadgeClass(s: ModerationStatus): string {
  if (s === "open") return "border-violet-200 bg-violet-50 text-violet-700";
  if (s === "in_review") return "border-sky-200 bg-sky-50 text-sky-700";
  if (s === "resolved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  return "border-neutral-200 bg-neutral-50 text-neutral-600";
}

export function moderationPermissions(role: AdminOpsRole) {
  return {
    canAssign: role !== "readonly",
    canModerate: role !== "readonly",
    canWriteMessages: role !== "readonly",
    canWriteNotes: role !== "readonly",
    canExport: role === "admin" || role === "support",
  };
}

export function autoModerationPriorityAndTags(c: ModerationCase): Pick<ModerationCase, "priority" | "tags"> {
  const text = `${c.reason} ${c.messages.map((m) => m.text).join(" ")}`.toLowerCase();
  const tags = [...c.tags];
  let priority = c.priority;
  if (/fraude|arnaque|faux|medical|danger|offensant/.test(text)) {
    priority = "critical";
    if (!tags.includes("risque")) tags.push("risque");
  } else if (/doublon|identite|copyright/.test(text)) {
    priority = priority === "low" ? "medium" : priority;
    if (!tags.includes("conformite")) tags.push("conformite");
  }
  return { priority, tags };
}

export function moderationToCsv(rows: ModerationCase[]): string {
  const lines = [
    "Case,Date,Type,Cible,Boutique,Reporter,Priorite,Statut,Assigne,Tags,SLAReview(min)",
    ...rows.map((r) =>
      [
        r.id,
        r.createdAt,
        MODERATION_TARGET_LABELS[r.targetType],
        r.targetLabel,
        r.shopName,
        r.reporter,
        MODERATION_PRIORITY_LABELS[r.priority],
        MODERATION_STATUS_LABELS[r.status],
        r.assignedTo,
        r.tags.join("|"),
        r.slaReviewTargetMin,
      ].join(","),
    ),
  ];
  return lines.join("\n");
}

export function moderationSlaMetrics(rows: ModerationCase[], nowMs: number) {
  const firstReviewDur = rows
    .filter((r) => r.firstReviewAt)
    .map((r) => (new Date(r.firstReviewAt as string).getTime() - new Date(r.createdAt).getTime()) / 60_000);
  const avgFirstReviewMin =
    firstReviewDur.length === 0 ? 0 : Math.round(firstReviewDur.reduce((s, n) => s + n, 0) / firstReviewDur.length);
  const breaches = rows.filter((r) => {
    const end = r.resolvedAt ? new Date(r.resolvedAt).getTime() : nowMs;
    const dur = (end - new Date(r.createdAt).getTime()) / 60_000;
    return dur > r.slaReviewTargetMin;
  }).length;
  return { avgFirstReviewMin, breaches };
}

export function getMockModerationCases(): ModerationCase[] {
  return [
    {
      id: "MOD-2451",
      createdAt: "2025-03-24T08:12:00.000Z",
      targetType: "product",
      targetLabel: "Creme premium visage",
      shopName: "Beauty House",
      reason: "Description trompeuse (promesse medicale)",
      priority: "high",
      status: "open",
      reporter: "Support",
      assignedTo: "Non assigne",
      tags: ["produit"],
      slaReviewTargetMin: 120,
      notes: ["Verifier promesse dans description."],
      messages: [{ id: "cm1", from: "system", author: "Systeme", text: "Signalement recu.", createdAt: "2025-03-24T08:12:10.000Z" }],
      history: [log("Case creee", "Systeme")],
    },
    {
      id: "MOD-2450",
      createdAt: "2025-03-23T17:42:00.000Z",
      targetType: "shop",
      targetLabel: "Negoce Plus",
      shopName: "Negoce Plus",
      reason: "Doublon de boutique / risque fraude",
      priority: "critical",
      status: "in_review",
      reporter: "Systeme",
      assignedTo: "A. Nguena",
      tags: ["risque", "identite"],
      slaReviewTargetMin: 90,
      firstReviewAt: "2025-03-23T18:00:00.000Z",
      notes: [],
      messages: [{ id: "cm2", from: "moderator", author: "A. Nguena", text: "Documents KYC demandes.", createdAt: "2025-03-23T18:03:00.000Z" }],
      history: [log("Case creee", "Systeme"), log("Assignee a A. Nguena")],
    },
    {
      id: "MOD-2449",
      createdAt: "2025-03-23T11:28:00.000Z",
      targetType: "review",
      targetLabel: "Avis #88917",
      shopName: "Tech Corner",
      reason: "Contenu offensant",
      priority: "medium",
      status: "resolved",
      reporter: "Client",
      assignedTo: "M. Toko",
      tags: ["avis"],
      slaReviewTargetMin: 180,
      firstReviewAt: "2025-03-23T12:10:00.000Z",
      resolvedAt: "2025-03-23T12:35:00.000Z",
      notes: ["Avis supprime + utilisateur averti."],
      messages: [],
      history: [log("Case creee", "Systeme"), log("Case resolue", "M. Toko")],
    },
  ];
}

export function createMockRealtimeModerationCase(seed: number): ModerationCase {
  const i = 3000 + seed;
  return {
    id: `MOD-${i}`,
    createdAt: new Date().toISOString(),
    targetType: seed % 2 === 0 ? "product" : "review",
    targetLabel: `Element signale #${i}`,
    shopName: `Boutique ${seed}`,
    reason: "Nouveau signalement entrant (simulation realtime)",
    priority: "low",
    status: "open",
    reporter: "Systeme",
    assignedTo: "Non assigne",
    tags: ["entrant"],
    slaReviewTargetMin: 180,
    notes: [],
    messages: [{ id: crypto.randomUUID(), from: "system", author: "Systeme", text: "Signalement recu.", createdAt: new Date().toISOString() }],
    history: [log("Case creee (realtime sim)", "Systeme")],
  };
}

export type ModerationKpiCard = { label: string; value: string; hint: string; icon: LucideIcon; accent: string };
export function buildModerationKpiCards(values: { open: number; inReview: number; critical: number; breaches: number }): ModerationKpiCard[] {
  return [
    { label: "Signalements ouverts", value: String(values.open), hint: "A traiter en priorite", icon: MessageSquareWarning, accent: "bg-violet-50 text-violet-700" },
    { label: "En analyse", value: String(values.inReview), hint: "Workflow en cours", icon: Clock3, accent: "bg-sky-50 text-sky-700" },
    { label: "Cas critiques", value: String(values.critical), hint: "Risque plateforme", icon: AlertTriangle, accent: "bg-red-50 text-red-700" },
    { label: "SLA depasses", value: String(values.breaches), hint: "Breach review", icon: Siren, accent: "bg-orange-50 text-orange-700" },
  ];
}

export function appendModerationMessage(
  row: ModerationCase,
  from: ModerationMessage["from"],
  author: string,
  text: string,
): ModerationCase {
  const now = new Date().toISOString();
  return {
    ...row,
    firstReviewAt: row.firstReviewAt ?? (from !== "merchant" ? now : undefined),
    messages: [...row.messages, { id: crypto.randomUUID(), from, author, text, createdAt: now }],
    history: [...row.history, log(`Nouveau message (${from})`, author)],
  };
}
