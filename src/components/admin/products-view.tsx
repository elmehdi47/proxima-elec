"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  Loader2,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { adminFetch } from "@/lib/admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DEFAULT_SETTINGS } from "@/lib/site-settings";
import { fetchAdminSettings } from "./settings-view";
import { formatDA } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductFormDialog } from "./product-form-dialog";

async function fetchProducts(): Promise<Product[]> {
  const res = await adminFetch("/api/products?includeInactive=1");
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

export function ProductsView() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const qc = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchProducts,
  });

  /* Live CMS categories — falls back to the defaults until loaded. */
  const { data: s } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: fetchAdminSettings,
  });
  const categories = s?.categories ?? DEFAULT_SETTINGS.categories;

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (categoryFilter !== "all") list = list.filter((p) => p.category === categoryFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, categoryFilter, search]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete product");
        return;
      }
      toast.success(`"${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      void qc.invalidateQueries({ queryKey: ["admin-products"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
    } catch {
      toast.error("Network error while deleting");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="h-10 w-full rounded-full border border-white/10 bg-secondary pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
              aria-label="Search products"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-10 w-40 rounded-full border-white/10 bg-secondary text-xs font-semibold">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-popover">
              <SelectItem value="all" className="text-sm">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-sm">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setEditing("new")}
          className="h-10 rounded-full bg-brand px-5 text-xs font-bold uppercase tracking-wider hover:bg-brand-light"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add product
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-card p-12 text-center">
          <PackagePlus className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold text-white">No products found</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {products && products.length > 0
              ? "Try a different search or category filter."
              : "Add your first product to start the catalog."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b border-white/8 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Product</th>
                  <th className="hidden px-4 py-3 md:table-cell">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="hidden px-4 py-3 text-center lg:table-cell">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0d0d12]">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="48px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate font-semibold text-white">
                            {product.name}
                          </p>
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="rounded-full border border-white/10 bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {categories.find((c) => c.id === product.category)?.label ?? product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-black text-white">{formatDA(product.price)}</p>
                      {product.oldPrice && (
                        <p className="text-[11px] text-muted-foreground line-through">
                          {formatDA(product.oldPrice)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${
                          product.stock <= 0
                            ? "bg-red-500/15 text-red-400"
                            : product.stock <= 3
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-center lg:table-cell">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          product.active
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-white/10 text-muted-foreground"
                        }`}
                      >
                        {product.active ? "Live" : "Hidden"}
                      </span>
                      {product.featured && (
                        <span className="ml-1.5 rounded-full bg-brand/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-light">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditing(product)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand-light"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-white/8 px-4 py-3 text-[11px] text-muted-foreground">
            {filtered.length} of {products?.length ?? 0} products
          </p>
        </div>
      )}

      {/* Add / Edit dialog */}
      <ProductFormDialog
        target={editing}
        onClose={() => setEditing(null)}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete &quot;{deleteTarget?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This permanently removes the product from the catalog. Past orders keep
              their item records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/15 bg-secondary text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
