import type { LucideIcon } from "lucide-react";
import { AlertCircle, CheckCircle2, Clock3, MessageCircleQuestion, PlayCircle } from "lucide-react";

export type AdminOpsRole = "admin" | "support" | "readonly";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved";
export type TicketChannel = "whatsapp" | "email" | "dashboard";

export type SupportAttachment = {
  id: string;
  name: string;
  type: "image" | "pdf" | "other";
  sizeKb: number;
};

export type SupportMessage = {
  id: string;
  author: string;
  from: "merchant" | "support" | "system";
  text: string;
  createdAt: string;
  attachments?: SupportAttachment[];
};

export type SupportActionLog = {
  id: string;
  at: string;
  actor: string;
  action: string;
};

export type SupportTicket = {
  id: string;
  createdAt: string;
  merchantName: string;
  shopName: string;
  subject: string;
  channel: TicketChannel;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  tags: string[];
  slaFirstResponseTargetMin: number;
  slaResolveTargetMin: number;
  firstResponseAt?: string;
  resolvedAt?: string;
  notes: string[];
  messages: SupportMessage[];
  history: SupportActionLog[];
};

export const SUPPORT_AGENTS = ["A. Nguena", "M. Toko", "L. Ewane"];

function createHistory(action: string, actor = "Admin"): SupportActionLog {
  return { id: crypto.randomUUID(), at: new Date().toISOString(), actor, action };
}

export const SUPPORT_CHANNEL_LABELS: Record<TicketChannel, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  dashboard: "Dashboard",
};

export const SUPPORT_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  waiting_customer: "En attente client",
  resolved: "Résolu",
};

export const SUPPORT_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Faible",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente",
};

export function supportPriorityBadgeClass(priority: TicketPriority): string {
  if (priority === "urgent") return "border-red-200 bg-red-50 text-red-700";
  if (priority === "high") return "border-orange-200 bg-orange-50 text-orange-700";
  if (priority === "medium") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-neutral-200 bg-white text-neutral-600";
}

export function supportStatusBadgeClass(status: TicketStatus): string {
  if (status === "open") return "border-violet-200 bg-violet-50 text-violet-700";
  if (status === "in_progress") return "border-sky-200 bg-sky-50 text-sky-700";
  if (status === "waiting_customer") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function supportPermissions(role: AdminOpsRole) {
  return {
    canAssign: role !== "readonly",
    canChangeStatus: role !== "readonly",
    canWriteMessages: role !== "readonly",
    canWriteNotes: role !== "readonly",
    canExport: role === "admin" || role === "support",
  };
}

export function autoPriorityAndTags(ticket: SupportTicket): Pick<SupportTicket, "priority" | "tags"> {
  const body = `${ticket.subject} ${ticket.messages.map((m) => m.text).join(" ")}`.toLowerCase();
  const tags = [...ticket.tags];
  let priority: TicketPriority = ticket.priority;
  if (/paiement|payment|fraude|arnaque|bloqu/.test(body)) {
    priority = "urgent";
    if (!tags.includes("paiement")) tags.push("paiement");
    if (!tags.includes("risque")) tags.push("risque");
  } else if (/stock|commande|livraison/.test(body)) {
    priority = priority === "low" ? "medium" : priority;
    if (!tags.includes("ops")) tags.push("ops");
  }
  return { priority, tags };
}

export function appendSupportMessage(ticket: SupportTicket, from: SupportMessage["from"], author: string, text: string): SupportTicket {
  const msg: SupportMessage = {
    id: crypto.randomUUID(),
    author,
    from,
    text,
    createdAt: new Date().toISOString(),
  };
  return {
    ...ticket,
    messages: [...ticket.messages, msg],
    firstResponseAt: ticket.firstResponseAt ?? (from !== "merchant" ? msg.createdAt : undefined),
    history: [...ticket.history, createHistory(`Nouveau message (${from})`, author)],
  };
}

export function supportSlaMetrics(tickets: SupportTicket[], nowMs: number) {
  const firstResponse = tickets
    .filter((t) => t.firstResponseAt)
    .map((t) => (new Date(t.firstResponseAt as string).getTime() - new Date(t.createdAt).getTime()) / 60_000);
  const resolveTimes = tickets
    .filter((t) => t.resolvedAt)
    .map((t) => (new Date(t.resolvedAt as string).getTime() - new Date(t.createdAt).getTime()) / 60_000);
  const firstResponseAvgMin =
    firstResponse.length === 0 ? 0 : Math.round(firstResponse.reduce((s, n) => s + n, 0) / firstResponse.length);
  const resolveAvgMin =
    resolveTimes.length === 0 ? 0 : Math.round(resolveTimes.reduce((s, n) => s + n, 0) / resolveTimes.length);
  const breaches = tickets.filter((t) => {
    if (t.status === "resolved") {
      if (!t.resolvedAt) return false;
      const dur = (new Date(t.resolvedAt).getTime() - new Date(t.createdAt).getTime()) / 60_000;
      return dur > t.slaResolveTargetMin;
    }
    const elapsed = (nowMs - new Date(t.createdAt).getTime()) / 60_000;
    return elapsed > t.slaResolveTargetMin;
  }).length;
  return { firstResponseAvgMin, resolveAvgMin, breaches };
}

export function elapsedMinutes(fromIso: string, nowMs: number) {
  return Math.max(0, Math.round((nowMs - new Date(fromIso).getTime()) / 60_000));
}

export function supportToCsv(rows: SupportTicket[]): string {
  const lines = [
    "Ticket,Date,Marchand,Boutique,Canal,Priorite,Statut,Assigne,Tags,SLA1ereRep(min),SLAResolution(min)",
    ...rows.map((t) =>
      [
        t.id,
        t.createdAt,
        t.merchantName,
        t.shopName,
        SUPPORT_CHANNEL_LABELS[t.channel],
        SUPPORT_PRIORITY_LABELS[t.priority],
        SUPPORT_STATUS_LABELS[t.status],
        t.assignedTo,
        t.tags.join("|"),
        t.slaFirstResponseTargetMin,
        t.slaResolveTargetMin,
      ].join(","),
    ),
  ];
  return lines.join("\n");
}

export function getMockSupportTickets(): SupportTicket[] {
  return [
    {
      id: "SUP-9814",
      createdAt: "2025-03-24T08:18:00.000Z",
      merchantName: "Clarisse M.",
      shopName: "Beauty House",
      subject: "Impossible d'activer les paiements Mobile Money",
      channel: "whatsapp",
      priority: "urgent",
      status: "open",
      assignedTo: "Non assigne",
      tags: ["paiement"],
      slaFirstResponseTargetMin: 30,
      slaResolveTargetMin: 180,
      notes: ["Verifier les logs de la passerelle locale."],
      messages: [
        { id: "m1", author: "Clarisse M.", from: "merchant", text: "Le bouton payer echoue.", createdAt: "2025-03-24T08:19:00.000Z" },
      ],
      history: [createHistory("Ticket cree", "Systeme")],
    },
    {
      id: "SUP-9813",
      createdAt: "2025-03-24T07:42:00.000Z",
      merchantName: "Nathalie B.",
      shopName: "Maison Deco CMR",
      subject: "Erreur de stock apres import CSV",
      channel: "dashboard",
      priority: "high",
      status: "in_progress",
      assignedTo: "A. Nguena",
      tags: ["ops", "catalogue"],
      slaFirstResponseTargetMin: 30,
      slaResolveTargetMin: 240,
      firstResponseAt: "2025-03-24T08:00:00.000Z",
      notes: ["Importer un lot test pour reproduire."],
      messages: [
        { id: "m2", author: "Nathalie B.", from: "merchant", text: "Le stock devient negatif.", createdAt: "2025-03-24T07:45:00.000Z" },
        { id: "m3", author: "A. Nguena", from: "support", text: "On analyse le CSV envoye.", createdAt: "2025-03-24T08:00:00.000Z" },
      ],
      history: [createHistory("Ticket cree", "Systeme"), createHistory("Assigne a A. Nguena")],
    },
    {
      id: "SUP-9812",
      createdAt: "2025-03-23T16:20:00.000Z",
      merchantName: "Joel K.",
      shopName: "Tech Corner",
      subject: "Question sur le plan d'abonnement Pro",
      channel: "email",
      priority: "medium",
      status: "waiting_customer",
      assignedTo: "M. Toko",
      tags: ["abonnement"],
      slaFirstResponseTargetMin: 60,
      slaResolveTargetMin: 720,
      firstResponseAt: "2025-03-23T17:05:00.000Z",
      notes: [],
      messages: [
        { id: "m4", author: "Joel K.", from: "merchant", text: "Le plan Pro couvre combien de produits ?", createdAt: "2025-03-23T16:22:00.000Z" },
      ],
      history: [createHistory("Ticket cree", "Systeme")],
    },
  ];
}

export function createMockRealtimeSupportTicket(seed: number): SupportTicket {
  const num = 9900 + seed;
  return {
    id: `SUP-${num}`,
    createdAt: new Date().toISOString(),
    merchantName: "Nouveau marchand",
    shopName: `Boutique ${seed}`,
    subject: "Nouveau ticket entrant (simulation realtime)",
    channel: seed % 2 === 0 ? "whatsapp" : "dashboard",
    priority: "low",
    status: "open",
    assignedTo: "Non assigne",
    tags: ["entrant"],
    slaFirstResponseTargetMin: 30,
    slaResolveTargetMin: 180,
    notes: [],
    messages: [{ id: crypto.randomUUID(), author: "Marchand", from: "merchant", text: "Bonjour, besoin d'aide.", createdAt: new Date().toISOString() }],
    history: [createHistory("Ticket cree (realtime sim)", "Systeme")],
  };
}

export type SupportKpiCard = { label: string; value: string; hint: string; icon: LucideIcon; accent: string };
export function buildSupportKpiCards(
  counts: { open: number; inProgress: number; waiting: number; firstResponseAvgMin: number },
): SupportKpiCard[] {
  return [
    { label: "Tickets ouverts", value: String(counts.open), hint: "Nouveaux tickets a traiter", icon: MessageCircleQuestion, accent: "bg-violet-50 text-violet-700" },
    { label: "En cours", value: String(counts.inProgress), hint: "Pris en charge", icon: PlayCircle, accent: "bg-sky-50 text-sky-700" },
    { label: "En attente client", value: String(counts.waiting), hint: "Informations attendues", icon: AlertCircle, accent: "bg-amber-50 text-amber-700" },
    { label: "1ere reponse moyenne", value: `${counts.firstResponseAvgMin} min`, hint: "SLA calcule en live", icon: Clock3, accent: "bg-emerald-50 text-emerald-700" },
  ];
}

export function markResolved(ticket: SupportTicket, actor = "Admin"): SupportTicket {
  const at = new Date().toISOString();
  return {
    ...ticket,
    status: "resolved",
    resolvedAt: at,
    firstResponseAt: ticket.firstResponseAt ?? at,
    history: [...ticket.history, createHistory("Ticket resolu", actor)],
  };
}
