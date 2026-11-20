"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { formatDA } from "@/lib/format";
import { waLink, productInquiryMessage } from "@/lib/whatsapp";
import {
  productName,
  productDescription,
  productNames,
} from "@/lib/i18n";
import { useSiteSettings, useLocale } from "@/components/store/settings-provider";
import { WhatsAppIcon } from "@/components/icons";
import type { Product } from "@/lib/types";

export function ProductDialog() {
  const product = useUI((s) => s.selectedProduct);
  const setSelectedProduct = useUI((s) => s.setSelectedProduct);

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && setSelectedProduct(null)}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto border-white/10 bg-card p-0 sm:rounded-3xl">
        {/* key resets quantity when a different product is opened */}
        {product && <ProductDialogInner key={product.id} product={product} />}
      </DialogContent>
    </Dialog>
  );
}

function ProductDialogInner({ product }: { product: Product }) {
  const s = useSiteSettings();
  const { t, locale } = useLocale();
  const add = useCart((s) => s.add);
  const setSelectedProduct = useUI((s) => s.setSelectedProduct);
  const [qty, setQty] = useState(1);

  const close = () => setSelectedProduct(null);
  const name = productName(product, locale);
  const description = productDescription(product, locale);

  const handleAdd = () => {
    add(
      {
        productId: product.id,
        name: product.name,
        names: productNames(product),
        price: product.price,
        image: product.image,
        stock: product.stock,
      },
      qty
    );
    toast.success(t("addedToast").replace("{name}", `${qty} × ${name}`), {
      action: { label: t("viewCart"), onClick: () => useUI.getState().setCartOpen(true) },
    });
    close();
  };

  const categoryLabel = s.categories.find((c) => c.id === product.category)?.label ?? product.category;

  return (
    <div className="grid gap-0 md:grid-cols-2">
      {/* Image side */}
      <div className="relative flex items-center justify-center bg-[radial-gradient(circle_at_50%_75%,rgba(30,111,224,0.16),transparent_65%)] p-8">
        <div className="relative aspect-square w-full max-w-sm">
          <Image
            src={product.image}
            alt={name}
            fill
            sizes="(max-width: 768px) 90vw, 40vw"
            className="object-contain"
          />
          {product.badge && (
            <span className="absolute start-0 top-0 rounded-full bg-brand px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
              {product.badge}
            </span>
          )}
        </div>
      </div>

      {/* Details side */}
      <div className="flex flex-col gap-4 p-6 md:p-8">
        <DialogHeader className="gap-2 space-y-0 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-light">
              {product.brand} · {categoryLabel}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              {product.rating.toFixed(1)}
              <span className="font-normal text-muted-foreground">
                ({product.reviewsCount} {t("reviews")})
              </span>
            </span>
          </div>
          <DialogTitle className="text-xl font-black leading-tight text-white sm:text-2xl">
            {name}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-white">{formatDA(product.price)}</span>
          {product.oldPrice && (
            <>
              <span className="text-sm font-medium text-muted-foreground line-through">
                {formatDA(product.oldPrice)}
              </span>
              <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
                {t("saveLabel").replace("{amount}", formatDA(product.oldPrice - product.price))}
              </span>
            </>
          )}
        </div>

        {/* Stock */}
        <div className="text-xs font-medium">
          {product.stock <= 0 ? (
            <span className="text-red-400">{t("outOfStockContact")}</span>
          ) : product.stock <= 3 ? (
            <span className="text-amber-400">
              {t("hurryOnly").replace("{n}", String(product.stock))}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {t("inStockShip")}
            </span>
          )}
        </div>

        {/* Perks */}
        <ul className="grid gap-2">
          {[
            { icon: BadgeCheck, label: t("perkAuthentic") },
            { icon: Truck, label: t("perkDelivery") },
            { icon: ShieldCheck, label: t("perkWarranty") },
          ].map((perk) => (
            <li
              key={perk.label}
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
            >
              <perk.icon className="h-3.5 w-3.5 text-brand-light" />
              {perk.label}
            </li>
          ))}
        </ul>

        {/* Qty + actions */}
        <div className="mt-auto space-y-3 pt-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-full border border-white/10 bg-secondary">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-10 w-10 place-items-center text-muted-foreground hover:text-white"
                aria-label={t("qtyDecrease")}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-white">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="grid h-10 w-10 place-items-center text-muted-foreground hover:text-white"
                aria-label={t("qtyIncrease")}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">
              {t("subtotal")}: <span className="font-bold text-white">{formatDA(product.price * qty)}</span>
            </span>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleAdd}
              disabled={product.stock <= 0}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-brand text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingCart className="h-4 w-4" />
              {t("addToCart")}
            </button>
            <a
              href={waLink(productInquiryMessage(product, locale), s.whatsappIntl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-wa/50 text-xs font-bold uppercase tracking-wider text-wa transition-colors hover:bg-wa/10"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {t("orderWhatsApp")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
