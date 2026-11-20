"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { formatDA } from "@/lib/format";
import { productName, productNames } from "@/lib/i18n";
import { useLocale } from "@/components/store/settings-provider";
import type { Product } from "@/lib/types";

function badgeClasses(badge: string): string {
  if (badge.startsWith("-")) return "bg-red-500/90 text-white";
  if (badge.toLowerCase().includes("top") || badge.toLowerCase().includes("best"))
    return "bg-brand text-white";
  if (badge.toLowerCase().includes("new")) return "bg-emerald-500/90 text-white";
  return "bg-white/90 text-black";
}

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const add = useCart((s) => s.add);
  const setSelectedProduct = useUI((s) => s.setSelectedProduct);
  const { t, locale } = useLocale();
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 3;
  const name = productName(product, locale);

  const handleAdd = () => {
    if (outOfStock) {
      toast.error(t("outOfStockToast"));
      return;
    }
    add({
      productId: product.id,
      name: product.name,
      names: productNames(product),
      price: product.price,
      image: product.image,
      stock: product.stock,
    });
    toast.success(t("addedToast").replace("{name}", name), {
      action: { label: t("viewCart"), onClick: () => useUI.getState().setCartOpen(true) },
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_12px_40px_-12px_rgba(30,111,224,0.35)]"
    >
      {/* Image */}
      <button
        onClick={() => setSelectedProduct(product)}
        className="relative block aspect-square w-full overflow-hidden bg-[radial-gradient(circle_at_50%_80%,rgba(30,111,224,0.10),transparent_65%)]"
        aria-label={t("viewProduct").replace("{name}", name)}
      >
        <Image
          src={product.image}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span
            className={`absolute start-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${badgeClasses(product.badge)}`}
          >
            {product.badge}
          </span>
        )}
        {outOfStock && (
          <span className="absolute end-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400 backdrop-blur">
            {t("outOfStock")}
          </span>
        )}
        <span className="absolute bottom-3 end-3 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-black/50 text-white/70 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <Eye className="h-4 w-4" />
        </span>
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {product.brand}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
            <Star className="h-3.5 w-3.5 fill-amber-400" />
            {product.rating.toFixed(1)}
          <span className="ms-0.5 font-normal text-muted-foreground">({product.reviewsCount})</span>
          </span>
        </div>

        <button
          onClick={() => setSelectedProduct(product)}
          className="text-start text-sm font-bold leading-snug text-white transition-colors hover:text-brand-light"
        >
          {name}
        </button>

        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-lg font-black text-white">{formatDA(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs font-medium text-muted-foreground line-through">
              {formatDA(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] font-medium">
          {outOfStock ? (
            <span className="text-red-400">{t("outOfStock")}</span>
          ) : lowStock ? (
            <span className="text-amber-400">{t("onlyLeft").replace("{n}", String(product.stock))}</span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {t("inStock")}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingCart className="h-4 w-4" />
          {t("addToCart")}
        </button>
      </div>
    </motion.article>
  );
}
