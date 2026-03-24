"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FileText, MessageSquare, RefreshCw, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Separator } from "@/components/shadcn/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/shadcn/table";
import { cn } from "@/lib/cn";
import {
  appendModerationMessage,
  autoModerationPriorityAndTags,
  buildModerationKpiCards,
  createMockRealtimeModerationCase,
  getMockModerationCases,
  moderationPermissions,
  moderationPriorityBadgeClass,
  MODERATION_PRIORITY_LABELS,
  moderationSlaMetrics,
  moderationStatusBadgeClass,
  MODERATION_STATUS_LABELS,
  MODERATION_TARGET_LABELS,
  moderationToCsv,
  type ModerationCase,
  type ModerationPriority,
  type ModerationStatus,
  type ModerationTarget,
} from "@/lib/admin/moderation";
import type { AdminOpsRole } from "@/lib/admin/support";
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

export default function AdminModerationClient() {
  const searchParams = useSearchParams();
  const role = (searchParams.get("role") as AdminOpsRole) || "admin";
  const perms = moderationPermissions(role);
  const ops = useAdminSettingsStore((s) => s.ops);

  const [items, setItems] = useState<ModerationCase[]>(getMockModerationCases());
  const [statusFilter, setStatusFilter] = useState<"all" | ModerationStatus>("all");
  const [targetFilter, setTargetFilter] = useState<"all" | ModerationTarget>("all");
  const [selectedId, setSelectedId] = useState<string>(getMockModerationCases()[0].id);
  const [noteDraft, setNoteDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [realtimeOn, setRealtimeOn] = useState(ops.realtimeEnabled);
  const [nowMs, setNowMs] = useState(() => Date.now());

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
      setItems((prev) => [createMockRealtimeModerationCase(prev.length + 1), ...prev]);
    }, 40_000);
    return () => clearInterval(t);
  }, [realtimeOn]);

  const enriched = useMemo(
    () =>
      items.map((it) => {
        const auto = autoModerationPriorityAndTags(it);
        return { ...it, ...auto, slaReviewTargetMin: ops.moderationSlaReviewMin };
      }),
    [items, ops.moderationSlaReviewMin],
  );

  const filtered = useMemo(() => {
    return enriched.filter((it) => {
      if (statusFilter !== "all" && it.status !== statusFilter) return false;
      if (targetFilter !== "all" && it.targetType !== targetFilter) return false;
      return true;
    });
  }, [enriched, statusFilter, targetFilter]);

  const selected = useMemo(
    () => enriched.find((it) => it.id === selectedId) ?? filtered[0] ?? null,
    [enriched, selectedId, filtered],
  );
  useEffect(() => {
    if (!selected && filtered[0]) setSelectedId(filtered[0].id);
  }, [selected, filtered]);

  const sla = useMemo(() => moderationSlaMetrics(enriched, nowMs), [enriched, nowMs]);

  const kpis = useMemo(() => {
    const open = enriched.filter((i) => i.status === "open").length;
    const inReview = enriched.filter((i) => i.status === "in_review").length;
    const critical = enriched.filter((i) => (i.priority === "high" || i.priority === "critical") && i.status !== "resolved").length;
    return { open, inReview, critical, breaches: sla.breaches };
  }, [enriched, sla.breaches]);
  const kpiCards = buildModerationKpiCards(kpis);

  const mutateRow = (id: string, fn: (c: ModerationCase) => ModerationCase) => {
    setItems((prev) => prev.map((r) => (r.id === id ? fn(r) : r)));
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-white shadow-sm">
          <ShieldAlert className="size-5 text-neutral-700" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Modération</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Workflow complet mocke: admin unique, conversation, notes, historique, SLA live, tags auto, export et realtime simule.
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
            <Card
              key={k.label}
              className="rounded-2xl border-0 bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
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
                <CardTitle className="text-base font-semibold text-neutral-950">File de moderation</CardTitle>
                <CardDescription className="text-xs">Filtres, actions, workflow, selection detail.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-9 rounded-xl text-xs" onClick={() => setRealtimeOn((v) => !v)}>
                  <RefreshCw className="mr-1 size-3.5" />
                  Realtime {realtimeOn ? "on" : "off"}
                </Button>
                {perms.canExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl text-xs"
                    onClick={() => downloadCsv(moderationToCsv(filtered), `moderation-${new Date().toISOString().slice(0, 10)}.csv`)}
                  >
                    Export CSV
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | ModerationStatus)}
                className="h-10 rounded-xl border border-neutral-200 px-3 text-sm"
              >
                <option value="all">Tous statuts</option>
                <option value="open">Ouvert</option>
                <option value="in_review">En analyse</option>
                <option value="resolved">Resolu</option>
                <option value="rejected">Rejete</option>
              </select>
              <select
                value={targetFilter}
                onChange={(e) => setTargetFilter(e.target.value as "all" | ModerationTarget)}
                className="h-10 rounded-xl border border-neutral-200 px-3 text-sm"
              >
                <option value="all">Tous types</option>
                <option value="shop">Boutique</option>
                <option value="product">Produit</option>
                <option value="review">Avis</option>
              </select>
            </div>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-0">
                  <TableHead className="pl-6 text-[11px] uppercase tracking-wider text-neutral-400">Case</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-neutral-400">Type</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-neutral-400">Motif</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-neutral-400">Priorite</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-neutral-400">Statut</TableHead>
                  <TableHead className="pr-6 text-right text-[11px] uppercase tracking-wider text-neutral-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id} className={cn("border-neutral-100", selectedId === row.id && "bg-neutral-50/60")}>
                    <TableCell className="py-3 pl-6 align-top">
                      <button type="button" className="text-left" onClick={() => setSelectedId(row.id)}>
                        <p className="text-sm font-semibold text-neutral-900">{row.id}</p>
                        <p className="text-[11px] text-neutral-400">{row.shopName}</p>
                      </button>
                    </TableCell>
                    <TableCell className="align-top text-sm text-neutral-700">{MODERATION_TARGET_LABELS[row.targetType]}</TableCell>
                    <TableCell className="max-w-[260px] align-top text-sm text-neutral-700">{row.reason}</TableCell>
                    <TableCell className="align-top">
                      <Badge variant="outline" className={cn("rounded-lg text-[11px] font-semibold", moderationPriorityBadgeClass(row.priority))}>
                        {MODERATION_PRIORITY_LABELS[row.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge variant="outline" className={cn("rounded-lg text-[11px] font-semibold", moderationStatusBadgeClass(row.status))}>
                        {MODERATION_STATUS_LABELS[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 align-top">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg text-xs"
                          disabled={!perms.canModerate}
                          onClick={() =>
                            mutateRow(row.id, (r) => ({
                              ...r,
                              assignedTo: "Admin",
                              status: "in_review",
                              firstReviewAt: r.firstReviewAt ?? new Date().toISOString(),
                              history: [
                                ...r.history,
                                { id: crypto.randomUUID(), at: new Date().toISOString(), actor: "Admin", action: "Analyse lancee" },
                              ],
                            }))
                          }
                        >
                          Analyser
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 rounded-lg text-xs text-emerald-700"
                          disabled={!perms.canModerate}
                          onClick={() => mutateRow(row.id, (r) => ({ ...r, assignedTo: "Admin", status: "resolved", resolvedAt: new Date().toISOString(), history: [...r.history, { id: crypto.randomUUID(), at: new Date().toISOString(), actor: "Admin", action: "Case resolue" }] }))}
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
            <CardTitle className="text-base font-semibold text-neutral-950">Detail case</CardTitle>
            <CardDescription className="text-xs">Conversation, notes internes, historique, exports avances.</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-4 pt-4">
            {!selected ? (
              <p className="text-sm text-neutral-500">Selectionnez un element.</p>
            ) : (
              <>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-neutral-900">{selected.targetLabel}</p>
                  <p className="text-neutral-500">{selected.shopName} · Traite par: Admin</p>
                  <p className="text-xs text-neutral-500">
                    Ouvert depuis {Math.round((nowMs - new Date(selected.createdAt).getTime()) / 60_000)} min · SLA review {selected.slaReviewTargetMin} min
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
                    <Input value={messageDraft} onChange={(e) => setMessageDraft(e.target.value)} placeholder="Ajouter un commentaire..." />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!perms.canWriteMessages || !messageDraft.trim()}
                      onClick={() => {
                        mutateRow(selected.id, (r) => appendModerationMessage(r, "moderator", "Admin", messageDraft.trim()));
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
                    {selected.notes.length === 0 ? <p className="text-neutral-400">Aucune note.</p> : selected.notes.map((n, i) => <p key={`${selected.id}-n-${i}`}>- {n}</p>)}
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
                        mutateRow(selected.id, (r) => ({ ...r, notes: [...r.notes, note], history: [...r.history, { id: crypto.randomUUID(), at: new Date().toISOString(), actor: "Admin", action: "Note interne ajoutee" }] }));
                        setNoteDraft("");
                      }}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Historique des actions</p>
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
