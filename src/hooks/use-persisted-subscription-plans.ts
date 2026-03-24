"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DEFAULT_SUBSCRIPTION_PLAN_CATALOG,
  sortPlanCatalog,
  type AdminSubscriptionPlanCatalogEntry,
} from "@/lib/admin/subscription-plans";
import type { AdminPlanSlug } from "@/lib/admin/subscriptions";

const STORAGE_KEY = "boutiqi-admin-subscription-plan-overrides";

type Overrides = Partial<Record<AdminPlanSlug, Partial<AdminSubscriptionPlanCatalogEntry>>>;

/** Retire commissionPct des overrides (plus utilisée tant que les paiements sont hors plateforme). */
function stripCommissionFromOverrides(o: Overrides): Overrides {
  const next: Overrides = { ...o };
  for (const slug of Object.keys(next) as AdminPlanSlug[]) {
    const e = next[slug];
    if (!e || !("commissionPct" in e)) continue;
    const rest = { ...e };
    delete rest.commissionPct;
    next[slug] = rest;
  }
  return next;
}

function loadOverrides(): Overrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Overrides;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function persistOverrides(o: Overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(o));
  } catch {
    /* ignore quota */
  }
}

function mergeEntry(
  base: AdminSubscriptionPlanCatalogEntry,
  patch?: Partial<AdminSubscriptionPlanCatalogEntry>,
): AdminSubscriptionPlanCatalogEntry {
  if (!patch) return { ...base, commissionPct: null };
  const { commissionPct: _ignored, ...patchWithoutCommission } = patch;
  return {
    ...base,
    ...patchWithoutCommission,
    features: Array.isArray(patch.features) ? patch.features : base.features,
    commissionPct: null,
  };
}

export function usePersistedSubscriptionPlanCatalog() {
  const [overrides, setOverrides] = useState<Overrides>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = loadOverrides();
    const cleaned = stripCommissionFromOverrides(raw);
    setOverrides(cleaned);
    if (JSON.stringify(cleaned) !== JSON.stringify(raw)) persistOverrides(cleaned);
    setHydrated(true);
  }, []);

  const plans = useMemo(() => {
    const merged = DEFAULT_SUBSCRIPTION_PLAN_CATALOG.map((p) => mergeEntry(p, overrides[p.slug]));
    return sortPlanCatalog(merged);
  }, [overrides]);

  const updatePlan = useCallback((slug: AdminPlanSlug, patch: Partial<AdminSubscriptionPlanCatalogEntry>) => {
    setOverrides((prev) => {
      const prevEntry = prev[slug] ?? {};
      const { commissionPct: _prevC, ...prevClean } = prevEntry;
      const { commissionPct: _patchC, ...patchClean } = patch;
      const next: Overrides = {
        ...prev,
        [slug]: { ...prevClean, ...patchClean },
      };
      persistOverrides(next);
      return next;
    });
  }, []);

  const resetPlan = useCallback((slug: AdminPlanSlug) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[slug];
      persistOverrides(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setOverrides({});
    persistOverrides({});
  }, []);

  const getPlan = useCallback(
    (slug: AdminPlanSlug) => plans.find((p) => p.slug === slug),
    [plans],
  );

  const hasOverride = useCallback((slug: AdminPlanSlug) => Boolean(overrides[slug]), [overrides]);

  return { plans, hydrated, updatePlan, resetPlan, resetAll, getPlan, hasOverride };
}
