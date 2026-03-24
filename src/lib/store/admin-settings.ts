"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminEnvironment = "dev" | "staging" | "prod";
export type AdminRole = "admin" | "support" | "readonly";

export type PasswordPolicy = {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
  rotateEveryDays: number;
};

export type ActiveSession = {
  id: string;
  user: string;
  ip: string;
  location: string;
  startedAt: string;
  lastSeenAt: string;
  current: boolean;
};

export type DeviceAudit = {
  id: string;
  device: string;
  os: string;
  browser: string;
  ip: string;
  connectedAt: string;
  status: "active" | "revoked";
};

export type AlertThresholds = {
  slaBreaches: number;
  errorsPerMinute: number;
};

export type QuietHours = {
  enabled: boolean;
  start: string;
  end: string;
};

export type NotificationChannels = {
  email: boolean;
  whatsapp: boolean;
  webhook: boolean;
};

export type ExportTemplate = {
  id: string;
  name: string;
  columns: string[];
  frequency: "daily" | "weekly";
  recipients: string[];
  enabled: boolean;
};

export type OpsSourceSettings = {
  supportSlaFirstResponseMin: number;
  supportSlaResolveMin: number;
  moderationSlaReviewMin: number;
  autoPrioritization: boolean;
  realtimeEnabled: boolean;
};

type AdminSettingsState = {
  environment: AdminEnvironment;
  platformName: string;
  defaultLocale: string;
  supportEmail: string;
  defaultRole: AdminRole;

  passwordPolicy: PasswordPolicy;
  requireMfa: boolean;
  securityAlerts: boolean;
  activeSessions: ActiveSession[];
  deviceAudit: DeviceAudit[];

  notificationChannels: NotificationChannels;
  alertThresholds: AlertThresholds;
  quietHours: QuietHours;

  exportTemplates: ExportTemplate[];
  flags: { id: string; label: string; enabled: boolean; hint: string }[];
  webhooks: { id: string; name: string; url: string; active: boolean; secretMasked: string }[];

  ops: OpsSourceSettings;
  updatedAt: string | null;

  setEnvironment: (e: AdminEnvironment) => void;
  patchGeneral: (payload: Partial<Pick<AdminSettingsState, "platformName" | "defaultLocale" | "supportEmail" | "defaultRole">>) => void;
  patchPasswordPolicy: (payload: Partial<PasswordPolicy>) => void;
  setRequireMfa: (v: boolean) => void;
  setSecurityAlerts: (v: boolean) => void;
  revokeSession: (id: string) => void;
  revokeDevice: (id: string) => void;

  patchNotificationChannels: (payload: Partial<NotificationChannels>) => void;
  patchAlertThresholds: (payload: Partial<AlertThresholds>) => void;
  patchQuietHours: (payload: Partial<QuietHours>) => void;

  toggleFlag: (id: string, enabled: boolean) => void;
  toggleWebhook: (id: string, active: boolean) => void;
  patchOps: (payload: Partial<OpsSourceSettings>) => void;

  updateExportTemplate: (id: string, payload: Partial<ExportTemplate>) => void;
  saveAll: () => void;
};

const nowIso = () => new Date().toISOString();

export const useAdminSettingsStore = create<AdminSettingsState>()(
  persist(
    (set) => ({
      environment: "dev",
      platformName: "Boutiqi",
      defaultLocale: "fr-CM",
      supportEmail: "support@boutiqi.cm",
      defaultRole: "support",

      passwordPolicy: {
        minLength: 10,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSymbol: false,
        rotateEveryDays: 90,
      },
      requireMfa: true,
      securityAlerts: true,
      activeSessions: [
        {
          id: "sess-1",
          user: "admin@boutiqi.cm",
          ip: "105.112.88.14",
          location: "Douala",
          startedAt: "2025-03-24T07:58:00.000Z",
          lastSeenAt: "2025-03-24T09:05:00.000Z",
          current: true,
        },
        {
          id: "sess-2",
          user: "admin@boutiqi.cm",
          ip: "102.67.44.9",
          location: "Yaounde",
          startedAt: "2025-03-23T19:11:00.000Z",
          lastSeenAt: "2025-03-23T21:02:00.000Z",
          current: false,
        },
      ],
      deviceAudit: [
        {
          id: "dev-1",
          device: "MacBook Pro",
          os: "macOS",
          browser: "Chrome 123",
          ip: "105.112.88.14",
          connectedAt: "2025-03-24T07:58:00.000Z",
          status: "active",
        },
        {
          id: "dev-2",
          device: "Windows Laptop",
          os: "Windows 11",
          browser: "Edge 122",
          ip: "102.67.44.9",
          connectedAt: "2025-03-23T19:11:00.000Z",
          status: "active",
        },
      ],

      notificationChannels: { email: true, whatsapp: true, webhook: false },
      alertThresholds: { slaBreaches: 5, errorsPerMinute: 12 },
      quietHours: { enabled: false, start: "22:00", end: "06:00" },

      exportTemplates: [
        {
          id: "tpl-1",
          name: "Support hebdo",
          columns: ["ticket", "priorite", "statut", "sla"],
          frequency: "weekly",
          recipients: ["ops@boutiqi.cm"],
          enabled: true,
        },
        {
          id: "tpl-2",
          name: "Moderation quotidien",
          columns: ["case", "type", "priorite", "resolution"],
          frequency: "daily",
          recipients: ["compliance@boutiqi.cm"],
          enabled: false,
        },
      ],
      flags: [
        { id: "ff_realtime", label: "Realtime dashboards", enabled: true, hint: "Push live sur les vues admin." },
        { id: "ff_auto_moderation", label: "Auto-modération assistée", enabled: true, hint: "Tags et priorités automatiques." },
        { id: "ff_bulk_export", label: "Exports planifiés", enabled: false, hint: "Rapports périodiques (bientôt)." },
      ],
      webhooks: [
        { id: "wh_orders", name: "Orders webhook", url: "https://hooks.boutiqi.app/orders", active: true, secretMasked: "whsec_****8a1d" },
        { id: "wh_support", name: "Support webhook", url: "https://hooks.boutiqi.app/support", active: false, secretMasked: "whsec_****0f33" },
      ],

      ops: {
        supportSlaFirstResponseMin: 30,
        supportSlaResolveMin: 180,
        moderationSlaReviewMin: 120,
        autoPrioritization: true,
        realtimeEnabled: true,
      },
      updatedAt: null,

      setEnvironment: (environment) => set({ environment }),
      patchGeneral: (payload) => set((s) => ({ ...s, ...payload })),
      patchPasswordPolicy: (payload) => set((s) => ({ passwordPolicy: { ...s.passwordPolicy, ...payload } })),
      setRequireMfa: (requireMfa) => set({ requireMfa }),
      setSecurityAlerts: (securityAlerts) => set({ securityAlerts }),
      revokeSession: (id) =>
        set((s) => ({ activeSessions: s.activeSessions.filter((sess) => !(sess.id === id && !sess.current)) })),
      revokeDevice: (id) =>
        set((s) => ({
          deviceAudit: s.deviceAudit.map((d) => (d.id === id ? { ...d, status: "revoked" } : d)),
        })),

      patchNotificationChannels: (payload) =>
        set((s) => ({ notificationChannels: { ...s.notificationChannels, ...payload } })),
      patchAlertThresholds: (payload) => set((s) => ({ alertThresholds: { ...s.alertThresholds, ...payload } })),
      patchQuietHours: (payload) => set((s) => ({ quietHours: { ...s.quietHours, ...payload } })),

      toggleFlag: (id, enabled) =>
        set((s) => ({ flags: s.flags.map((f) => (f.id === id ? { ...f, enabled } : f)) })),
      toggleWebhook: (id, active) =>
        set((s) => ({ webhooks: s.webhooks.map((w) => (w.id === id ? { ...w, active } : w)) })),
      patchOps: (payload) => set((s) => ({ ops: { ...s.ops, ...payload } })),

      updateExportTemplate: (id, payload) =>
        set((s) => ({
          exportTemplates: s.exportTemplates.map((tpl) => (tpl.id === id ? { ...tpl, ...payload } : tpl)),
        })),
      saveAll: () => set({ updatedAt: nowIso() }),
    }),
    {
      name: "boutiqi-admin-settings",
      partialize: (state) => ({
        environment: state.environment,
        platformName: state.platformName,
        defaultLocale: state.defaultLocale,
        supportEmail: state.supportEmail,
        defaultRole: state.defaultRole,
        passwordPolicy: state.passwordPolicy,
        requireMfa: state.requireMfa,
        securityAlerts: state.securityAlerts,
        activeSessions: state.activeSessions,
        deviceAudit: state.deviceAudit,
        notificationChannels: state.notificationChannels,
        alertThresholds: state.alertThresholds,
        quietHours: state.quietHours,
        exportTemplates: state.exportTemplates,
        flags: state.flags,
        webhooks: state.webhooks,
        ops: state.ops,
        updatedAt: state.updatedAt,
      }),
    },
  ),
);
