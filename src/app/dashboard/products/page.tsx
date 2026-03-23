"use client";

import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Tags,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  FolderPlus,
  Check,
} from "lucide-react";

import { useDashboardStore } from "@/lib/store/dashboard";
import type { DashboardCategory, DashboardProduct } from "@/lib/types/dashboard";
import { productSchema, type ProductFormData } from "@/lib/validations/onboarding";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type ViewMode = "grid" | "list";

function slugFromName(x: string) {
  return (
    x
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "autre"
  );
}

export default function DashboardProductsPage() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    removeProduct,
    addCategory,
    updateCategory,
    removeCategory,
  } = useDashboardStore();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DashboardProduct | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [editingCategory, setEditingCategory] = useState<DashboardCategory | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const categoriesSorted = useMemo(() => {
    const base = [...categories].sort((a, b) => a.name.localeCompare(b.name, "fr"));
    const other = base.find((c) => c.id === "autre");
    const rest = base.filter((c) => c.id !== "autre");
    return other ? [...rest, other] : rest;
  }, [categories]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => map.set(p.category, (map.get(p.category) ?? 0) + 1));
    return map;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => (activeCategoryId === "all" ? true : p.category === activeCategoryId))
      .filter((p) => {
        if (!q) return true;
        const cat = categoryNameById.get(p.category) ?? p.category;
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q)
        );
      });
  }, [products, activeCategoryId, query, categoryNameById]);

  const activeCount = useMemo(() => filteredProducts.filter((p) => p.isActive).length, [filteredProducts]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", price: 0, category: "", description: "" },
  });

  const openAdd = useCallback(() => {
    setEditingProduct(null);
    form.reset({
      name: "",
      price: 0,
      category: activeCategoryId !== "all" ? activeCategoryId : "",
      description: "",
      imageUrl: undefined,
    });
    setShowForm(true);
  }, [form, activeCategoryId]);

  const openEdit = useCallback(
    (p: DashboardProduct) => {
      setEditingProduct(p);
      form.reset({
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description ?? "",
        imageUrl: p.imageUrl ?? "",
      });
      setShowForm(true);
      setOpenMenuId(null);
    },
    [form],
  );

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingProduct(null);
  }, []);

  const onSubmit = useCallback(
    (data: ProductFormData) => {
      if (editingProduct) {
        updateProduct(editingProduct.id, {
          name: data.name,
          price: data.price,
          category: data.category,
          description: data.description || undefined,
          imageUrl: data.imageUrl || undefined,
        });
      } else {
        addProduct({
          name: data.name,
          price: data.price,
          category: data.category,
          description: data.description || undefined,
          imageUrl: data.imageUrl || undefined,
          isActive: true,
        });
      }
      closeForm();
    },
    [editingProduct, updateProduct, addProduct, closeForm],
  );

  const submitCategory = useCallback(() => {
    const name = categoryDraft.trim();
    if (!name) return;
    const id = slugFromName(name);
    if (editingCategory) {
      if (editingCategory.id === "autre") return;
      updateCategory(editingCategory.id, { name });
    } else {
      if (categories.some((c) => c.id === id)) return;
      addCategory({ id, name });
    }
    setEditingCategory(null);
    setCategoryDraft("");
    setShowCategoryForm(false);
  }, [categoryDraft, editingCategory, categories, addCategory, updateCategory]);

  const startEditCategory = useCallback((c: DashboardCategory) => {
    setEditingCategory(c);
    setCategoryDraft(c.name);
    setShowCategoryForm(true);
  }, []);

  const cancelCategoryForm = useCallback(() => {
    setEditingCategory(null);
    setCategoryDraft("");
    setShowCategoryForm(false);
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-warm-900 lg:text-2xl">Catalogue</h1>
          <p className="mt-0.5 text-sm text-warm-500">
            {products.length} produit{products.length > 1 ? "s" : ""} &middot;{" "}
            {categories.length} catégorie{categories.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button type="button" onClick={openAdd}>
          <Plus className="size-4" />
          Nouveau produit
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* ── Sidebar catégories ── */}
        <aside className="lg:col-span-3">
          <div className="rounded-xl border border-warm-200 bg-white">
            <div className="flex items-center justify-between border-b border-warm-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Tags className="size-4 text-brand-500" />
                <span className="text-sm font-semibold text-warm-900">Catégories</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryDraft("");
                  setShowCategoryForm(!showCategoryForm);
                }}
                className="grid size-7 place-items-center rounded-lg text-brand-600 transition hover:bg-brand-50"
                title="Ajouter une catégorie"
              >
                <FolderPlus className="size-4" />
              </button>
            </div>

            {/* Mini-form catégorie */}
            {showCategoryForm && (
              <div className="border-b border-warm-100 bg-warm-50/50 px-4 py-3">
                <label className="mb-1 block text-[11px] font-semibold text-warm-500">
                  {editingCategory ? "Renommer" : "Nouvelle catégorie"}
                </label>
                <div className="flex gap-2">
                  <input
                    value={categoryDraft}
                    onChange={(e) => setCategoryDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitCategory()}
                    placeholder="Ex: Chaussures"
                    className="h-8 flex-1 rounded-lg border border-warm-200 bg-white px-2.5 text-sm text-warm-900 outline-none placeholder:text-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={submitCategory}
                    className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-500 text-white transition hover:bg-brand-600"
                  >
                    <Check className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelCategoryForm}
                    className="grid size-8 shrink-0 place-items-center rounded-lg border border-warm-200 text-warm-400 transition hover:bg-warm-50 hover:text-warm-600"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
                {!editingCategory &&
                  categoryDraft.trim() &&
                  categories.some((c) => c.id === slugFromName(categoryDraft)) && (
                    <p className="mt-1.5 text-[11px] text-warm-400">Existe déjà.</p>
                  )}
              </div>
            )}

            {/* Liste catégories */}
            <nav className="max-h-[420px] overflow-y-auto p-2">
              <CategoryBtn
                active={activeCategoryId === "all"}
                label="Toutes"
                count={products.length}
                onClick={() => setActiveCategoryId("all")}
              />
              {categoriesSorted.map((c) => (
                <CategoryBtn
                  key={c.id}
                  active={activeCategoryId === c.id}
                  label={c.name}
                  count={categoryCounts.get(c.id) ?? 0}
                  onClick={() => setActiveCategoryId(c.id)}
                  onEdit={c.id !== "autre" ? () => startEditCategory(c) : undefined}
                  onDelete={c.id !== "autre" ? () => removeCategory(c.id) : undefined}
                />
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Zone principale ── */}
        <section className="space-y-4 lg:col-span-9">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-warm-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un produit…"
                className="h-10 w-full rounded-xl border border-warm-200 bg-white pl-10 pr-3 text-sm text-warm-900 outline-none placeholder:text-warm-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20"
              />
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-warm-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "grid size-8 place-items-center rounded-lg transition",
                  viewMode === "grid" ? "bg-brand-50 text-brand-600" : "text-warm-400 hover:text-warm-600",
                )}
                title="Vue grille"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "grid size-8 place-items-center rounded-lg transition",
                  viewMode === "list" ? "bg-brand-50 text-brand-600" : "text-warm-400 hover:text-warm-600",
                )}
                title="Vue liste"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>

          {/* Counter bar */}
          <div className="flex items-center gap-3 text-xs text-warm-500">
            <span>
              <span className="font-semibold text-warm-800">{filteredProducts.length}</span> produit
              {filteredProducts.length > 1 ? "s" : ""}
            </span>
            <span className="size-1 rounded-full bg-warm-300" />
            <span>
              <span className="font-semibold text-green-600">{activeCount}</span> actif
              {activeCount > 1 ? "s" : ""}
            </span>
            {activeCategoryId !== "all" && (
              <>
                <span className="size-1 rounded-full bg-warm-300" />
                <span className="rounded-md bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">
                  {categoryNameById.get(activeCategoryId)}
                </span>
              </>
            )}
          </div>

          {/* Slide-over form */}
          {showForm && (
            <ProductFormPanel
              form={form}
              onSubmit={onSubmit}
              onClose={closeForm}
              editing={!!editingProduct}
              categoriesSorted={categoriesSorted}
            />
          )}

          {/* Empty states */}
          {products.length === 0 ? (
            <EmptyState
              title="Aucun produit"
              subtitle="Ajoutez votre premier produit pour le rendre visible dans votre boutique."
              action={
                <Button type="button" onClick={openAdd}>
                  <Plus className="size-4" />
                  Ajouter un produit
                </Button>
              }
            />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              title="Aucun résultat"
              subtitle="Essayez un autre filtre ou une autre recherche."
            />
          ) : viewMode === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((p) => (
                <ProductCardGrid
                  key={p.id}
                  product={p}
                  categoryLabel={categoryNameById.get(p.category) ?? "Autre"}
                  onEdit={() => openEdit(p)}
                  onToggle={() => updateProduct(p.id, { isActive: !p.isActive })}
                  onRemove={() => removeProduct(p.id)}
                  menuOpen={openMenuId === p.id}
                  onMenuToggle={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-warm-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-warm-100 bg-warm-50/60 text-[11px] uppercase tracking-wide text-warm-400">
                    <th className="py-2.5 pl-4 pr-2 font-medium">Produit</th>
                    <th className="px-2 py-2.5 font-medium">Catégorie</th>
                    <th className="px-2 py-2.5 text-right font-medium">Prix</th>
                    <th className="px-2 py-2.5 text-center font-medium">Statut</th>
                    <th className="py-2.5 pl-2 pr-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100">
                  {filteredProducts.map((p) => (
                    <ProductRowList
                      key={p.id}
                      product={p}
                      categoryLabel={categoryNameById.get(p.category) ?? "Autre"}
                      onEdit={() => openEdit(p)}
                      onToggle={() => updateProduct(p.id, { isActive: !p.isActive })}
                      onRemove={() => removeProduct(p.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function CategoryBtn({
  active,
  label,
  count,
  onClick,
  onEdit,
  onDelete,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "group flex items-center gap-2 rounded-lg px-3 py-2 transition",
        active ? "bg-brand-50/70 text-brand-700" : "text-warm-700 hover:bg-warm-50",
      )}
    >
      <button type="button" onClick={onClick} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium">{label}</span>
      </button>
      {hover && (onEdit || onDelete) && (
        <div className="flex shrink-0 gap-0.5">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="grid size-6 place-items-center rounded-md text-warm-400 transition hover:bg-warm-100 hover:text-warm-600"
            >
              <Pencil className="size-3" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="grid size-6 place-items-center rounded-md text-warm-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="size-3" />
            </button>
          )}
        </div>
      )}
      <span
        className={cn(
          "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
          active ? "bg-brand-100/70 text-brand-700" : "bg-warm-100 text-warm-500",
        )}
      >
        {count}
      </span>
    </div>
  );
}

function ProductCardGrid({
  product: p,
  categoryLabel,
  onEdit,
  onToggle,
  onRemove,
  menuOpen,
  onMenuToggle,
}: {
  product: DashboardProduct;
  categoryLabel: string;
  onEdit: () => void;
  onToggle: () => void;
  onRemove: () => void;
  menuOpen: boolean;
  onMenuToggle: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onMenuToggle();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen, onMenuToggle]);

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-white transition",
        p.isActive ? "border-warm-200 hover:shadow-md hover:shadow-warm-100" : "border-warm-100 opacity-70",
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-warm-100">
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} className="size-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Package className="size-10 text-warm-300" />
          </div>
        )}
        {/* Status badge */}
        <span
          className={cn(
            "absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            p.isActive ? "bg-green-500/90 text-white" : "bg-warm-500/80 text-white",
          )}
        >
          {p.isActive ? "Actif" : "Inactif"}
        </span>
        {/* Category badge */}
        <span className="absolute bottom-2.5 left-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-warm-700 shadow-sm backdrop-blur-sm">
          {categoryLabel}
        </span>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-warm-900">{p.name}</h3>
            {p.description && (
              <p className="mt-0.5 line-clamp-1 text-xs text-warm-400">{p.description}</p>
            )}
          </div>
          {/* Context menu */}
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={onMenuToggle}
              className={cn(
                "grid size-7 place-items-center rounded-lg transition",
                menuOpen
                  ? "bg-warm-100 text-warm-700"
                  : "text-warm-400 hover:bg-warm-100 hover:text-warm-600",
              )}
            >
              <MoreHorizontal className="size-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 w-44 animate-in fade-in slide-in-from-top-1 rounded-xl border border-warm-200 bg-white p-1.5 shadow-xl shadow-warm-900/8">
                <MenuAction icon={<Pencil className="size-3.5" />} label="Modifier" onClick={onEdit} />
                <MenuAction
                  icon={p.isActive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  label={p.isActive ? "Désactiver" : "Activer"}
                  onClick={onToggle}
                />
                <div className="my-1 border-t border-warm-100" />
                <MenuAction
                  icon={<Trash2 className="size-3.5" />}
                  label="Supprimer"
                  onClick={onRemove}
                  danger
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 text-base font-bold text-brand-600">{p.price.toLocaleString()} FCFA</div>
      </div>
    </div>
  );
}

function ProductRowList({
  product: p,
  categoryLabel,
  onEdit,
  onToggle,
  onRemove,
}: {
  product: DashboardProduct;
  categoryLabel: string;
  onEdit: () => void;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <tr className={cn("group transition", !p.isActive && "opacity-60")}>
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-3">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt={p.name} className="size-10 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warm-100">
              <Package className="size-5 text-warm-400" />
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate font-medium text-warm-900">{p.name}</div>
            {p.description && (
              <div className="truncate text-xs text-warm-400">{p.description}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-2 py-3">
        <span className="rounded-md bg-warm-100 px-2 py-0.5 text-xs font-medium text-warm-600">
          {categoryLabel}
        </span>
      </td>
      <td className="px-2 py-3 text-right font-semibold text-warm-900">
        {p.price.toLocaleString()} F
      </td>
      <td className="px-2 py-3 text-center">
        <span
          className={cn(
            "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
            p.isActive ? "bg-green-50 text-green-600" : "bg-warm-100 text-warm-500",
          )}
        >
          {p.isActive ? "Actif" : "Inactif"}
        </span>
      </td>
      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onToggle}
            className="grid size-7 place-items-center rounded-lg text-warm-400 transition hover:bg-warm-100 hover:text-warm-600"
            title={p.isActive ? "Désactiver" : "Activer"}
          >
            {p.isActive ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="grid size-7 place-items-center rounded-lg text-warm-400 transition hover:bg-warm-100 hover:text-warm-600"
            title="Modifier"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="grid size-7 place-items-center rounded-lg text-warm-400 transition hover:bg-red-50 hover:text-red-500"
            title="Supprimer"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function ProductFormPanel({
  form,
  onSubmit,
  onClose,
  editing,
  categoriesSorted,
}: {
  form: ReturnType<typeof useForm<ProductFormData>>;
  onSubmit: (data: ProductFormData) => void;
  onClose: () => void;
  editing: boolean;
  categoriesSorted: DashboardCategory[];
}) {
  return (
    <div className="rounded-xl border border-warm-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-warm-100 px-5 py-3">
        <h2 className="text-sm font-semibold text-warm-900">
          {editing ? "Modifier le produit" : "Nouveau produit"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="grid size-7 place-items-center rounded-lg text-warm-400 transition hover:bg-warm-100 hover:text-warm-600"
        >
          <X className="size-4" />
        </button>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FileUpload
              label="Photo du produit"
              value={form.watch("imageUrl")}
              onChange={(url) => form.setValue("imageUrl", url)}
              error={form.formState.errors.imageUrl?.message}
            />
          </div>
          <Input
            label="Nom du produit"
            placeholder="Ex: Robe wax bleue"
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <Input
            label="Prix (FCFA)"
            type="number"
            placeholder="14 500"
            error={form.formState.errors.price?.message}
            {...form.register("price", { valueAsNumber: true })}
          />
          <div className="sm:col-span-2">
            <Select
              label="Catégorie"
              error={form.formState.errors.category?.message}
              {...form.register("category")}
            >
              <option value="">Catégorie…</option>
              {categoriesSorted.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Description (optionnelle)"
              placeholder="Courte description du produit"
              error={form.formState.errors.description?.message}
              {...form.register("description")}
            />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {editing ? "Enregistrer" : "Ajouter le produit"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-warm-200 bg-white py-14 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-warm-100">
        <Package className="size-8 text-warm-300" />
      </div>
      <p className="mt-4 text-sm font-semibold text-warm-700">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-warm-500">{subtitle}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function MenuAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-warm-700 hover:bg-warm-50",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
