"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DEFAULT_SETTINGS } from "@/lib/site-settings";
import { fetchAdminSettings } from "./settings-view";
import type { Product } from "@/lib/types";

interface FormValues {
  name: string;
  brand: string;
  category: string;
  price: string;
  oldPrice: string;
  stock: string;
  badge: string;
  rating: string;
  reviewsCount: string;
  description: string;
  image: string;
  featured: boolean;
  active: boolean;
  /** optional FR / AR translations */
  nameFr: string;
  descriptionFr: string;
  nameAr: string;
  descriptionAr: string;
}

const EMPTY: FormValues = {
  name: "",
  brand: "Proxima",
  category: "speakers",
  price: "",
  oldPrice: "",
  stock: "10",
  badge: "",
  rating: "4.5",
  reviewsCount: "0",
  description: "",
  image: "",
  featured: false,
  active: true,
  nameFr: "",
  descriptionFr: "",
  nameAr: "",
  descriptionAr: "",
};

function toForm(product: Product): FormValues {
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: String(product.price),
    oldPrice: product.oldPrice ? String(product.oldPrice) : "",
    stock: String(product.stock),
    badge: product.badge ?? "",
    rating: String(product.rating),
    reviewsCount: String(product.reviewsCount),
    description: product.description,
    image: product.image,
    featured: product.featured,
    active: product.active,
    nameFr: product.nameFr ?? "",
    descriptionFr: product.descriptionFr ?? "",
    nameAr: product.nameAr ?? "",
    descriptionAr: product.descriptionAr ?? "",
  };
}

const inputCls =
  "h-10 w-full rounded-xl border border-white/10 bg-secondary px-3.5 text-sm text-white placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30";

export function ProductFormDialog({
  target,
  onClose,
}: {
  target: Product | "new" | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto border-white/10 bg-card sm:rounded-3xl">
        {/* key resets the form whenever a different target is opened */}
        {target && (
          <ProductFormInner
            key={typeof target === "string" ? "new" : target.id}
            target={target}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProductFormInner({
  target,
  onClose,
}: {
  target: Product | "new";
  onClose: () => void;
}) {
  const isEdit = typeof target !== "string";
  const [values, setValues] = useState<FormValues>(() =>
    isEdit ? toForm(target) : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  /* Live CMS categories — falls back to the defaults until loaded. */
  const { data: s } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: fetchAdminSettings,
  });
  const categories = s?.categories ?? DEFAULT_SETTINGS.categories;

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  /** Upload a local image: compress server-side, store, fill the image field. */
  const handleUpload = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image is too large — pick a photo under 4 MB");
      return;
    }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      set("image", data.url);
      toast.success("Image uploaded — it will appear on the product when you save");
    } catch {
      toast.error("Network error while uploading");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = Math.round(Number(values.price));
    const oldPrice = values.oldPrice ? Math.round(Number(values.oldPrice)) : null;
    const stock = Math.round(Number(values.stock));
    const rating = Number(values.rating);
    const reviewsCount = Math.round(Number(values.reviewsCount));

    if (values.name.trim().length < 2) return toast.error("Name is too short.");
    if (values.description.trim().length < 3) return toast.error("Description is too short.");
    if (!Number.isFinite(price) || price <= 0) return toast.error("Enter a valid price.");
    if (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice <= price))
      return toast.error("Old price must be higher than the current price.");
    if (!Number.isFinite(stock) || stock < 0) return toast.error("Enter a valid stock quantity.");
    if (!Number.isFinite(rating) || rating < 0 || rating > 5)
      return toast.error("Rating must be between 0 and 5.");
    if (reviewsCount < 0) return toast.error("Reviews count must be positive.");
    if (!/^(https?:\/\/.+|\/api\/images\/[a-z0-9]+)$/i.test(values.image.trim()))
      return toast.error("Upload an image or paste a valid image URL (https://...).");

    const payload = {
      name: values.name.trim(),
      brand: values.brand.trim() || "Proxima",
      category: values.category,
      description: values.description.trim(),
      nameFr: values.nameFr.trim() || null,
      descriptionFr: values.descriptionFr.trim() || null,
      nameAr: values.nameAr.trim() || null,
      descriptionAr: values.descriptionAr.trim() || null,
      price,
      oldPrice,
      stock,
      badge: values.badge.trim() || null,
      rating,
      reviewsCount,
      image: values.image.trim(),
      featured: values.featured,
      active: values.active,
    };

    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/products/${target.id}` : "/api/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to save product");
        return;
      }
      toast.success(isEdit ? "Product updated" : "Product added to catalog");
      onClose();
      void qc.invalidateQueries({ queryKey: ["admin-products"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
    } catch {
      toast.error("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  const imagePreviewOk = /^(https?:\/\/.+|\/api\/images\/[a-z0-9]+|\/logo\.(jpg|png)|\/hero-main\.png)$/i.test(
    values.image.trim()
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-black text-white">
          {isEdit ? `Edit — ${values.name}` : "Add a new product"}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          {isEdit
            ? "Update the catalog entry. Changes appear on the store instantly."
            : "Fill in the details to publish a new product on the storefront."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Image + preview */}
        <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
          <div className="grid h-36 w-full place-items-center overflow-hidden rounded-xl border border-white/10 bg-[#0d0d12]">
            {imagePreviewOk ? (
              <Image
                src={values.image.trim()}
                alt="Product preview"
                width={140}
                height={144}
                unoptimized
                className="h-full w-full object-contain p-2"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-image" className="text-xs font-semibold text-white">
              Image
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="h-10 shrink-0 rounded-xl border-white/15 bg-transparent text-xs font-bold uppercase tracking-wider hover:bg-white/5 hover:text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Upload image
                  </>
                )}
              </Button>
              <input
                id="pf-image"
                value={values.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="…or paste an https:// link"
                className={inputCls}
              />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
              }}
            />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Pick a photo from your device (JPG/PNG/WebP, under 4 MB — it is
              compressed automatically), or paste a direct image link. Uploaded
              images are stored in the database, so they survive deployments.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="pf-name" className="text-xs font-semibold text-white">
              Name
            </Label>
            <input
              id="pf-name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="JBL Flip 6 Bluetooth Speaker"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-brand" className="text-xs font-semibold text-white">
              Brand
            </Label>
            <input
              id="pf-brand"
              value={values.brand}
              onChange={(e) => set("brand", e.target.value)}
              placeholder="JBL"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="pf-category" className="text-xs font-semibold text-white">
              Category
            </Label>
            <Select value={values.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger id="pf-category" className={`${inputCls} h-10`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-popover">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-sm">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-price" className="text-xs font-semibold text-white">
              Price (DA)
            </Label>
            <input
              id="pf-price"
              value={values.price}
              onChange={(e) => set("price", e.target.value)}
              inputMode="numeric"
              placeholder="18500"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-oldprice" className="text-xs font-semibold text-white">
              Old price (optional)
            </Label>
            <input
              id="pf-oldprice"
              value={values.oldPrice}
              onChange={(e) => set("oldPrice", e.target.value)}
              inputMode="numeric"
              placeholder="22000"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="pf-stock" className="text-xs font-semibold text-white">
              Stock
            </Label>
            <input
              id="pf-stock"
              value={values.stock}
              onChange={(e) => set("stock", e.target.value)}
              inputMode="numeric"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-badge" className="text-xs font-semibold text-white">
              Badge
            </Label>
            <input
              id="pf-badge"
              value={values.badge}
              onChange={(e) => set("badge", e.target.value)}
              placeholder="-15% / NEW / TOP"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-rating" className="text-xs font-semibold text-white">
              Rating (0-5)
            </Label>
            <input
              id="pf-rating"
              value={values.rating}
              onChange={(e) => set("rating", e.target.value)}
              inputMode="decimal"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-reviews" className="text-xs font-semibold text-white">
              Reviews count
            </Label>
            <input
              id="pf-reviews"
              value={values.reviewsCount}
              onChange={(e) => set("reviewsCount", e.target.value)}
              inputMode="numeric"
              className={inputCls}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pf-description" className="text-xs font-semibold text-white">
            Description
          </Label>
          <textarea
            id="pf-description"
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Key features, what's in the box, warranty..."
            className="w-full resize-none rounded-xl border border-white/10 bg-secondary px-3.5 py-3 text-sm text-white placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* Translations (optional) */}
        <fieldset className="space-y-4 rounded-xl border border-white/10 bg-secondary/40 p-4">
          <legend className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Translations (optional — shown to FR / AR visitors)
          </legend>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-white">
              <span className="me-1.5 inline-block rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold">
                FR
              </span>
              Nom &amp; description
            </p>
            <input
              value={values.nameFr}
              onChange={(e) => set("nameFr", e.target.value)}
              placeholder={`FR name (blank = English: ${values.name || "name"})`}
              aria-label="Nom du produit (français)"
              className={inputCls}
            />
            <textarea
              value={values.descriptionFr}
              onChange={(e) => set("descriptionFr", e.target.value)}
              rows={2}
              placeholder="Description du produit en français (facultatif)"
              aria-label="Description du produit (français)"
              className="w-full resize-none rounded-xl border border-white/10 bg-secondary px-3.5 py-3 text-sm text-white placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          <div className="space-y-2" dir="rtl">
            <p className="text-xs font-semibold text-white">
              <span className="me-1.5 inline-block rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold">
                AR
              </span>
              الاسم والوصف
            </p>
            <input
              value={values.nameAr}
              onChange={(e) => set("nameAr", e.target.value)}
              placeholder="اسم المنتج بالعربية (اختياري)"
              aria-label="اسم المنتج بالعربية"
              className={`${inputCls} text-start`}
            />
            <textarea
              value={values.descriptionAr}
              onChange={(e) => set("descriptionAr", e.target.value)}
              rows={2}
              placeholder="وصف المنتج بالعربية (اختياري)"
              aria-label="وصف المنتج بالعربية"
              className="w-full resize-none rounded-xl border border-white/10 bg-secondary px-3.5 py-3 text-sm text-white placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Leave any field empty to show the English version instead.
          </p>
        </fieldset>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6 rounded-xl border border-white/10 bg-secondary/60 p-4">
          <div className="flex items-center gap-3">
            <Switch
              id="pf-featured"
              checked={values.featured}
              onCheckedChange={(v) => set("featured", v)}
            />
            <Label htmlFor="pf-featured" className="text-xs font-semibold text-white">
              Featured product
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="pf-active"
              checked={values.active}
              onCheckedChange={(v) => set("active", v)}
            />
            <Label htmlFor="pf-active" className="text-xs font-semibold text-white">
              Visible on the store
            </Label>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-full border-white/15 bg-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="glow-brand flex-[2] rounded-full bg-brand text-xs font-bold uppercase tracking-wider hover:bg-brand-light"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Add product"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
