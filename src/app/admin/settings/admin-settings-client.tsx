"use client";

import { useMemo } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  Cpu,
  EyeOff,
  FileText,
  Globe,
  Laptop2,
  KeyRound,
  Link2,
  Lock,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";

import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Separator } from "@/components/shadcn/separator";
import { cn } from "@/lib/cn";
import { useAdminSettingsStore, type AdminEnvironment, type AdminRole } from "@/lib/store/admin-settings";

export default function AdminSettingsClient() {
  const {
    environment,
    platformName,
    defaultLocale,
    supportEmail,
    defaultRole,
    passwordPolicy,
    requireMfa,
    securityAlerts,
    activeSessions,
    deviceAudit,
    notificationChannels,
    alertThresholds,
    quietHours,
    exportTemplates,
    flags,
    webhooks,
    ops,
    updatedAt,
    setEnvironment,
    patchGeneral,
    patchPasswordPolicy,
    setRequireMfa,
    setSecurityAlerts,
    revokeSession,
    revokeDevice,
    patchNotificationChannels,
    patchAlertThresholds,
    patchQuietHours,
    toggleFlag,
    toggleWebhook,
    patchOps,
    updateExportTemplate,
    saveAll,
  } = useAdminSettingsStore();

  const enabledFlags = useMemo(() => flags.filter((f) => f.enabled).length, [flags]);
  const activeWebhooks = useMemo(() => webhooks.filter((w) => w.active).length, [webhooks]);

  return (
    <div className="w-full space-y-8">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-neutral-200 bg-white shadow-sm">
          <Settings className="size-5 text-neutral-700" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Paramètres plateforme</h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-neutral-500">
            Source de vérité mock du back-office: sécurité, notifications, exports et paramètres opérationnels propagés
            vers Support/Modération.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              Environnement: {environment.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              {enabledFlags} feature(s) actives
            </Badge>
            <Badge variant="outline" className="rounded-lg border-neutral-200 bg-white text-xs font-medium">
              {activeWebhooks} webhook(s) actifs
            </Badge>
            {updatedAt && (
              <Badge variant="outline" className="rounded-lg border-emerald-200 bg-emerald-50 text-xs font-medium text-emerald-800">
                <CheckCircle2 className="mr-1 inline size-3" />
                Sauvegardé à {new Date(updatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border-0 bg-white shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-neutral-950">
            <Cpu className="mr-2 inline size-4" />
            Environnements
          </CardTitle>
          <CardDescription className="text-xs">Profil courant Dev/Staging/Prod et paramètres sensibles masqués.</CardDescription>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-2">
            {(["dev", "staging", "prod"] as AdminEnvironment[]).map((env) => (
              <Button
                key={env}
                type="button"
                variant={environment === env ? "default" : "outline"}
                size="sm"
                className="h-9 rounded-xl text-xs"
                onClick={() => setEnvironment(env)}
              >
                {env.toUpperCase()}
              </Button>
            ))}
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-600">
            <EyeOff className="mr-1 inline size-3.5" />
            Secrets ({environment.toUpperCase()}): masqués en lecture seule depuis l’UI.
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">
              <Globe className="mr-2 inline size-4" />
              Général
            </CardTitle>
            <CardDescription className="text-xs">Identité plateforme et options globales.</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Nom plateforme</label>
              <Input value={platformName} onChange={(e) => patchGeneral({ platformName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Locale par défaut</label>
              <select
                value={defaultLocale}
                onChange={(e) => patchGeneral({ defaultLocale: e.target.value })}
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm"
              >
                <option value="fr-CM">fr-CM</option>
                <option value="fr-FR">fr-FR</option>
                <option value="en-US">en-US</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Email support principal</label>
              <Input value={supportEmail} onChange={(e) => patchGeneral({ supportEmail: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">
              <Shield className="mr-2 inline size-4" />
              Sécurité
            </CardTitle>
            <CardDescription className="text-xs">Session admin, MFA et alertes sécurité.</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Politique mot de passe (min chars)</label>
              <Input
                value={String(passwordPolicy.minLength)}
                onChange={(e) => patchPasswordPolicy({ minLength: Number(e.target.value || 10) })}
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5">
                <span className="text-xs text-neutral-700">Majuscule</span>
                <input
                  type="checkbox"
                  checked={passwordPolicy.requireUppercase}
                  onChange={(e) => patchPasswordPolicy({ requireUppercase: e.target.checked })}
                  className="size-4"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5">
                <span className="text-xs text-neutral-700">Minuscule</span>
                <input
                  type="checkbox"
                  checked={passwordPolicy.requireLowercase}
                  onChange={(e) => patchPasswordPolicy({ requireLowercase: e.target.checked })}
                  className="size-4"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5">
                <span className="text-xs text-neutral-700">Chiffre</span>
                <input
                  type="checkbox"
                  checked={passwordPolicy.requireNumber}
                  onChange={(e) => patchPasswordPolicy({ requireNumber: e.target.checked })}
                  className="size-4"
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5">
                <span className="text-xs text-neutral-700">Symbole</span>
                <input
                  type="checkbox"
                  checked={passwordPolicy.requireSymbol}
                  onChange={(e) => patchPasswordPolicy({ requireSymbol: e.target.checked })}
                  className="size-4"
                />
              </label>
            </div>
            <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5">
              <span className="text-sm text-neutral-700">MFA requis pour les admins</span>
              <input type="checkbox" checked={requireMfa} onChange={(e) => setRequireMfa(e.target.checked)} className="size-4" />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5">
              <span className="text-sm text-neutral-700">Alertes anomalies sécurité</span>
              <input
                type="checkbox"
                checked={securityAlerts}
                onChange={(e) => setSecurityAlerts(e.target.checked)}
                className="size-4"
              />
            </label>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-600">
              <KeyRound className="mr-1 inline size-3.5" />
              Rotation mot de passe: tous les {passwordPolicy.rotateEveryDays} jours
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">
              <Lock className="mr-2 inline size-4" />
              Sessions actives
            </CardTitle>
            <CardDescription className="text-xs">Révocation des sessions non courantes.</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-2.5 pt-4">
            {activeSessions.map((s) => (
              <div key={s.id} className="rounded-xl border border-neutral-200 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-800">
                    {s.user} · {s.location}
                  </p>
                  {s.current ? (
                    <Badge variant="outline" className="rounded-lg text-xs">
                      Session courante
                    </Badge>
                  ) : (
                    <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => revokeSession(s.id)}>
                      Révoquer
                    </Button>
                  )}
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  IP {s.ip} · dernier accès {new Date(s.lastSeenAt).toLocaleString("fr-FR")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">
              <Laptop2 className="mr-2 inline size-4" />
              Appareils / connexions récents
            </CardTitle>
            <CardDescription className="text-xs">Audit devices et révocation.</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-2.5 pt-4">
            {deviceAudit.map((d) => (
              <div key={d.id} className="rounded-xl border border-neutral-200 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-800">
                    {d.device} · {d.browser}
                  </p>
                  {d.status === "active" ? (
                    <Button type="button" variant="outline" size="sm" className="h-8 rounded-lg text-xs" onClick={() => revokeDevice(d.id)}>
                      Révoquer
                    </Button>
                  ) : (
                    <Badge variant="outline" className="rounded-lg text-xs">
                      Révoqué
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {d.os} · IP {d.ip} · {new Date(d.connectedAt).toLocaleString("fr-FR")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">
              <Bell className="mr-2 inline size-4" />
              Notifications avancées
            </CardTitle>
            <CardDescription className="text-xs">Canaux, seuils d’alertes et horaires de silence.</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-3 pt-4">
            <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5">
              <span className="text-sm text-neutral-700">Canal email</span>
              <input
                type="checkbox"
                checked={notificationChannels.email}
                onChange={(e) => patchNotificationChannels({ email: e.target.checked })}
                className="size-4"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5">
              <span className="text-sm text-neutral-700">Canal WhatsApp</span>
              <input
                type="checkbox"
                checked={notificationChannels.whatsapp}
                onChange={(e) => patchNotificationChannels({ whatsapp: e.target.checked })}
                className="size-4"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5">
              <span className="text-sm text-neutral-700">Canal webhook</span>
              <input
                type="checkbox"
                checked={notificationChannels.webhook}
                onChange={(e) => patchNotificationChannels({ webhook: e.target.checked })}
                className="size-4"
              />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Alerte SLA breach ></label>
                <Input
                  value={String(alertThresholds.slaBreaches)}
                  onChange={(e) => patchAlertThresholds({ slaBreaches: Number(e.target.value || 0) })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Erreurs / min ></label>
                <Input
                  value={String(alertThresholds.errorsPerMinute)}
                  onChange={(e) => patchAlertThresholds({ errorsPerMinute: Number(e.target.value || 0) })}
                />
              </div>
            </div>
            <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5">
              <span className="text-sm text-neutral-700">Horaires de silence</span>
              <input
                type="checkbox"
                checked={quietHours.enabled}
                onChange={(e) => patchQuietHours({ enabled: e.target.checked })}
                className="size-4"
              />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={quietHours.start} onChange={(e) => patchQuietHours({ start: e.target.value })} />
              <Input value={quietHours.end} onChange={(e) => patchQuietHours({ end: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">
              <Users className="mr-2 inline size-4" />
              Permissions & rôles
            </CardTitle>
            <CardDescription className="text-xs">Rôle initial et périmètre d’action.</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Rôle admin par défaut</label>
              <select
                value={defaultRole}
                onChange={(e) => patchGeneral({ defaultRole: e.target.value as AdminRole })}
                className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm"
              >
                <option value="admin">Admin</option>
                <option value="support">Support</option>
                <option value="readonly">Lecture seule</option>
              </select>
            </div>
            <div className="space-y-2 text-xs">
              <p className={cn("rounded-lg border px-2.5 py-1.5", defaultRole === "admin" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-neutral-200 text-neutral-600")}>
                <ShieldCheck className="mr-1 inline size-3.5" />
                Admin: accès complet
              </p>
              <p className={cn("rounded-lg border px-2.5 py-1.5", defaultRole === "support" ? "border-sky-200 bg-sky-50 text-sky-800" : "border-neutral-200 text-neutral-600")}>
                <Users className="mr-1 inline size-3.5" />
                Support: traitement opérationnel
              </p>
              <p className={cn("rounded-lg border px-2.5 py-1.5", defaultRole === "readonly" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-neutral-200 text-neutral-600")}>
                <Shield className="mr-1 inline size-3.5" />
                Lecture seule: consultation uniquement
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">
              <Wifi className="mr-2 inline size-4" />
              Feature flags
            </CardTitle>
            <CardDescription className="text-xs">Activation progressive des modules plateforme.</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-2.5 pt-4">
            {flags.map((flag) => (
              <label key={flag.id} className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2.5">
                <span>
                  <span className="block text-sm font-medium text-neutral-800">{flag.label}</span>
                  <span className="text-xs text-neutral-500">{flag.hint}</span>
                </span>
                <input
                  type="checkbox"
                  checked={flag.enabled}
                  onChange={(e) => toggleFlag(flag.id, e.target.checked)}
                  className="size-4"
                />
              </label>
            ))}
            <Separator className="bg-neutral-100" />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Source support/modération (mock)</label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  value={String(ops.supportSlaFirstResponseMin)}
                  onChange={(e) => patchOps({ supportSlaFirstResponseMin: Number(e.target.value || 0) })}
                />
                <Input
                  value={String(ops.supportSlaResolveMin)}
                  onChange={(e) => patchOps({ supportSlaResolveMin: Number(e.target.value || 0) })}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  value={String(ops.moderationSlaReviewMin)}
                  onChange={(e) => patchOps({ moderationSlaReviewMin: Number(e.target.value || 0) })}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl text-xs"
                  onClick={() =>
                    patchOps({
                      realtimeEnabled: !ops.realtimeEnabled,
                    })
                  }
                >
                  Realtime global: {ops.realtimeEnabled ? "on" : "off"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-soft">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-neutral-950">
              <Link2 className="mr-2 inline size-4" />
              Intégrations & webhooks
            </CardTitle>
            <CardDescription className="text-xs">Endpoints système branchés aux événements métier.</CardDescription>
          </CardHeader>
          <Separator className="bg-neutral-100" />
          <CardContent className="space-y-3 pt-4">
            {webhooks.map((w) => (
              <div key={w.id} className="rounded-xl border border-neutral-200 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-800">{w.name}</p>
                  <input
                    type="checkbox"
                    checked={w.active}
                    onChange={(e) => toggleWebhook(w.id, e.target.checked)}
                    className="size-4"
                  />
                </div>
                <p className="mt-1 truncate text-xs text-neutral-500">{w.url}</p>
                <p className="mt-0.5 text-[11px] text-neutral-400">Secret: {w.secretMasked}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-0 bg-white shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-neutral-950">
            <Clock3 className="mr-2 inline size-4" />
            Exports & reporting
          </CardTitle>
          <CardDescription className="text-xs">Templates, planification et destinataires de rapports.</CardDescription>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <CardContent className="space-y-3 pt-4">
          {exportTemplates.map((tpl) => (
            <div key={tpl.id} className="rounded-xl border border-neutral-200 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-neutral-800">{tpl.name}</p>
                <input
                  type="checkbox"
                  checked={tpl.enabled}
                  onChange={(e) => updateExportTemplate(tpl.id, { enabled: e.target.checked })}
                  className="size-4"
                />
              </div>
              <p className="mt-1 text-xs text-neutral-500">Colonnes: {tpl.columns.join(", ")}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <select
                  value={tpl.frequency}
                  onChange={(e) => updateExportTemplate(tpl.id, { frequency: e.target.value as "daily" | "weekly" })}
                  className="h-9 rounded-lg border border-neutral-200 px-2.5 text-xs"
                >
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                </select>
                <Input
                  value={tpl.recipients.join(", ")}
                  onChange={(e) =>
                    updateExportTemplate(tpl.id, {
                      recipients: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-0 bg-white shadow-soft">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-neutral-950">Journal système récent</CardTitle>
          <CardDescription className="text-xs">Historique synthétique des modifications (mock).</CardDescription>
        </CardHeader>
        <Separator className="bg-neutral-100" />
        <CardContent className="space-y-2.5 pt-4 text-sm">
          {[
            { id: "a1", at: "2025-03-24T09:12:00.000Z", actor: "Admin", action: "Activation realtime dashboards" },
            { id: "a2", at: "2025-03-24T08:58:00.000Z", actor: "Admin", action: "Mise à jour notifications avancées" },
            { id: "a3", at: "2025-03-24T08:31:00.000Z", actor: "Admin", action: "Révocation d'une session active" },
          ].map((a) => (
            <p key={a.id} className="rounded-lg border border-neutral-200 px-3 py-2 text-neutral-600">
              <span className="font-medium text-neutral-800">{a.actor}</span> · {a.action} ·{" "}
              <span className="tabular-nums">{new Date(a.at).toLocaleString("fr-FR")}</span>
            </p>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="outline" className="rounded-xl" disabled>
          <FileText className="mr-1.5 size-4" />
          Export PDF (bientôt)
        </Button>
        <Button type="button" className="rounded-xl" onClick={saveAll}>
          <Save className="mr-1.5 size-4" />
          Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  );
}
