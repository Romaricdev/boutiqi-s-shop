"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FileText, LifeBuoy, MessageSquare, RefreshCw } from "lucide-react";

import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Separator } from "@/components/shadcn/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table";
import { cn } from "@/lib/cn";
import {
  appendSupportMessage,
  autoPriorityAndTags,
  buildSupportKpiCards,
  createMockRealtimeSupportTicket,
  elapsedMinutes,
  getMockSupportTickets,
  markResolved,
  supportPermissions,
  supportPriorityBadgeClass,
  SUPPORT_PRIORITY_LABELS,
  supportSlaMetrics,
  supportStatusBadgeClass,
  SUPPORT_STATUS_LABELS,
  supportToCsv,
  type AdminOpsRole,
  type SupportTicket,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/admin/support";
import { useAdminSettingsStore } from "@/lib/store/admin-settings";

function downloadCsv(csv: string, name: string) {
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminSupportClient() {
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as AdminOpsRole) || "admin";
  const perms = supportPermissions(role);
  const ops = useAdminSettingsStore((s) => s.ops);

  const [tickets, setTickets] = useState<SupportTicket[]>(getMockSupportTickets());
  const [statusFilter, setStatusFilter] = useState<"all" | TicketStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TicketPriority>("all");
  const [selectedId, setSelectedId] = useState<string>(getMockSupportTickets()[0].id);
  const [noteDraft, setNoteDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [realtimeOn, setRealtimeOn] = useState(ops.realtimeEnabled);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setRealtimeOn(ops.realtimeEnabled);
  }, [ops.realtimeEnabled]);

  useEffect(() => {
    if (!realtimeOn) return;
    const t = setInterval(() => {
      setTickets((prev) => {
        const incoming = createMockRealtimeSupportTicket(prev.length + 1);
        return [incoming, ...prev];
      });
    }, 35_000);
    return () => clearInterval(t);
  }, [realtimeOn]);

  const enriched = useMemo(
    () =>
      tickets.map((t) => {
        const auto = autoPriorityAndTags(t);
        return {
          ...t,
          ...auto,
          slaFirstResponseTargetMin: ops.supportSlaFirstResponseMin,
          slaResolveTargetMin: ops.supportSlaResolveMin,
        };
      }),
    [tickets, ops.supportSlaFirstResponseMin, ops.supportSlaResolveMin],
  );

  const filtered = useMemo(
    () =>
      enriched.filter((ticket) => {
        if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
        if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;
        return true;
      }),
    [enriched, statusFilter, priorityFilter],
  );

  const selected = useMemo(() => enriched.find((t) => t.id === selectedId) ?? filtered[0] ?? null, [enriched, selectedId, filtered]);

  useEffect(() => {
    if (!selected && filtered[0]) setSelectedId(filtered[0].id);
  }, [selected, filtered]);

  const sla = useMemo(() => supportSlaMetrics(enriched, nowMs), [enriched, nowMs]);
  const counts = useMemo(
    () => ({
      open: enriched.filter((t) => t.status === "open").length,
      inProgress: enriched.filter((t) => t.status === "in_progress").length,
      waiting: enriched.filter((t) => t.status === "waiting_customer").length,
      firstResponseAvgMin: sla.firstResponseAvgMin,
    }),
    [enriched, sla.firstResponseAvgMin],
  );
  const kpiCards = buildSupportKpiCards(counts);

  const mutateTicket = (id: string, fn: (t: SupportTicket) => SupportTicket) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? fn(t) : t)));
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-white shadow-sm">
          <LifeBuoy className="size-5 text-neutral-700" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Support</h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-neutral-500">
            Workflow complet mocke: admin unique, notes internes, historique, conversation, SLA live, automation,
            export et entree realtime simulee.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-lg border-sky-200 bg-sky-50 text-xs font-medium text-sky-900">
              Mode operatoire actuel: admin unique
            </Badge>
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              Role: {role}
            </Badge>
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              SLA breach: {sla.breaches}
            </Badge>
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              Realtime {realtimeOn ? "on" : "off"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="rounded-2xl border-0 bg-white shadow-soft">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-medium text-neutral-400">{k.label}</p>
                  <span className={cn("grid size-10 place-items-center rounded-xl", k.accent)}>
                    <Icon className="size-5" strokeWidth={1.5} />
                  </span>
                </div>
                <p className="text-2xl font-bold tabular-nums tracking-tight text-neutral-950">{k.value}</p>
                <p className="text-xs text-neutral-400">{k.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold text-neutral-950">File de tickets</CardTitle>
                <CardDescription className="text-xs">Filtres + actions rapides + selection du detail.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs" onClick={() => setRealtimeOn((v) => !v)}>
                  <RefreshCw className="mr-1.5 size-3.5" />
                  Realtime {realtimeOn ? "on" : "off"}
                </Button>
                {perms.canExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl text-xs"
                    onClick={() => downloadCsv(supportToCsv(filtered), `support-${new Date().toISOString().slice(0, 10)}.csv`)}
                  >
                    Export CSV
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | TicketStatus)}
                className="h-10 rounded-xl border border-neutral-200 px-3 text-sm"
              >
                <option value="all">Tous statuts</option>
                <option value="open">Ouvert</option>
                <option value="in_progress">En cours</option>
                <option value="waiting_customer">En attente client</option>
                <option value="resolved">Resolu</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as "all" | TicketPriority)}
                className="h-10 rounded-xl border border-neutral-200 px-3 text-sm"
              >
                <option value="all">Toutes priorites</option>
                <option value="urgent">Urgente</option>
                <option value="high">Haute</option>
                <option value="medium">Moyenne</option>
                <option value="low">Faible</option>
              </select>
            </div>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-0">
                  <TableHead className="pl-6 text-[11px] uppercase tracking-wider text-neutral-400">Ticket</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-neutral-400">Sujet</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-neutral-400">Priorite</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-neutral-400">Statut</TableHead>
                  <TableHead className="pr-6 text-right text-[11px] uppercase tracking-wider text-neutral-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ticket) => (
                  <TableRow key={ticket.id} className={cn("border-neutral-100", selectedId === ticket.id && "bg-neutral-50/60")}>
                    <TableCell className="py-3 pl-6 align-top">
                      <button type="button" className="text-left" onClick={() => setSelectedId(ticket.id)}>
                        <p className="text-sm font-semibold text-neutral-900">{ticket.id}</p>
                        <p className="text-[11px] text-neutral-400">{ticket.shopName}</p>
                      </button>
                    </TableCell>
                    <TableCell className="max-w-[260px] align-top text-sm text-neutral-700">{ticket.subject}</TableCell>
                    <TableCell className="align-top">
                      <Badge variant="outline" className={cn("rounded-lg text-[11px] font-semibold", supportPriorityBadgeClass(ticket.priority))}>
                        {SUPPORT_PRIORITY_LABELS[ticket.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge variant="outline" className={cn("rounded-lg text-[11px] font-semibold", supportStatusBadgeClass(ticket.status))}>
                        {SUPPORT_STATUS_LABELS[ticket.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 align-top">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg text-xs"
                          disabled={!perms.canChangeStatus}
                          onClick={() =>
                            mutateTicket(ticket.id, (t) => ({
                              ...t,
                              assignedTo: "Admin",
                              status: "in_progress",
                              history: [
                                ...t.history,
                                {
                                  id: crypto.randomUUID(),
                                  at: new Date().toISOString(),
                                  actor: "Admin",
                                  action: "Ticket passe en cours",
                                },
                              ],
                            }))
                          }
                        >
                          En cours
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg text-xs text-amber-700"
                          disabled={!perms.canChangeStatus}
                          onClick={() =>
                            mutateTicket(ticket.id, (t) => ({
                              ...t,
                              assignedTo: "Admin",
                              status: "waiting_customer",
                              history: [
                                ...t.history,
                                {
                                  id: crypto.randomUUID(),
                                  at: new Date().toISOString(),
                                  actor: "Admin",
                                  action: "Ticket passe en attente client",
                                },
                              ],
                            }))
                          }
                        >
                          Attente
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg text-xs text-emerald-700"
                          disabled={!perms.canChangeStatus}
                          onClick={() => mutateTicket(ticket.id, (t) => markResolved({ ...t, assignedTo: "Admin" }))}
                        >
                          Resoudre
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">Detail ticket</CardTitle>
            <CardDescription className="text-xs">Conversation, notes, historique, SLA et exports avances.</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-4 pt-4">
            {!selected ? (
              <p className="text-sm text-neutral-500">Selectionnez un ticket.</p>
            ) : (
              <>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-neutral-900">{selected.subject}</p>
                  <p className="text-neutral-500">{selected.merchantName} · Traite par: Admin</p>
                  <p className="text-xs text-neutral-500">
                    En cours depuis {elapsedMinutes(selected.createdAt, nowMs)} min · SLA resolution {selected.slaResolveTargetMin} min
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Tags auto</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-md text-[11px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Conversation</p>
                  <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-neutral-200 p-3">
                    {selected.messages.map((m) => (
                      <div key={m.id} className="rounded-lg bg-neutral-50 px-2.5 py-2 text-xs">
                        <p className="font-semibold text-neutral-800">
                          {m.author} · {m.from}
                        </p>
                        <p className="mt-0.5 text-neutral-600">{m.text}</p>
                        {m.attachments?.length ? (
                          <p className="mt-1 text-[11px] text-neutral-500">
                            Pieces jointes: {m.attachments.map((a) => `${a.name} (${a.sizeKb}kb)`).join(", ")}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input value={messageDraft} onChange={(e) => setMessageDraft(e.target.value)} placeholder="Repondre au marchand..." />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!perms.canWriteMessages || !messageDraft.trim()}
                      onClick={() => {
                        mutateTicket(selected.id, (t) => appendSupportMessage(t, "support", "Admin", messageDraft.trim()));
                        setMessageDraft("");
                      }}
                    >
                      <MessageSquare className="mr-1 size-3.5" />
                      Envoyer
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Notes internes</p>
                  <div className="max-h-28 space-y-1 overflow-y-auto rounded-xl border border-neutral-200 p-3 text-xs">
                    {selected.notes.length === 0 ? <p className="text-neutral-400">Aucune note.</p> : selected.notes.map((n, i) => <p key={`${selected.id}-note-${i}`}>- {n}</p>)}
                  </div>
                  <div className="flex gap-2">
                    <Input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Ajouter une note interne..." />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!perms.canWriteNotes || !noteDraft.trim()}
                      onClick={() => {
                        const note = noteDraft.trim();
                        mutateTicket(selected.id, (t) => ({ ...t, notes: [...t.notes, note], history: [...t.history, { id: crypto.randomUUID(), at: new Date().toISOString(), actor: "Admin", action: "Note interne ajoutee" }] }));
                        setNoteDraft("");
                      }}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Historique d'actions</p>
                  <div className="max-h-28 space-y-1 overflow-y-auto rounded-xl border border-neutral-200 p-3 text-xs text-neutral-600">
                    {selected.history.map((h) => (
                      <p key={h.id}>
                        {new Date(h.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · {h.actor} · {h.action}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
                  <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg text-xs" disabled>
                    <FileText className="mr-1 size-3.5" />
                    PDF (bientot)
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg text-xs" disabled>
                    Rapport periodique (bientot)
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
