"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart, useCartItems, cartSubtotal, cartCount } from "@/store/cart";
import { useUI } from "@/store/ui";
import { formatDA } from "@/lib/format";
import { useSiteSettings, useLocale } from "@/components/store/settings-provider";

export function CartSheet() {
  const s = useSiteSettings();
  const { t, locale } = useLocale();
  const items = useCartItems();
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const cartOpen = useUI((s) => s.cartOpen);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const setCheckoutOpen = useUI((s) => s.setCheckoutOpen);

  const lines = items;
  const subtotal = cartSubtotal(lines);
  const count = cartCount(lines);
  const freeShipping = subtotal >= s.freeShippingThreshold;
  const progress = Math.min(100, (subtotal / s.freeShippingThreshold) * 100);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col border-white/10 bg-card sm:max-w-md"
      >
        <SheetHeader className="space-y-1">
          <SheetTitle className="flex items-center gap-2 text-lg font-black text-white">
            <ShoppingBag className="h-5 w-5 text-brand-light" />
            {t("cartTitle")}
            {count > 0 && (
              <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {t("cartReview")}
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-secondary">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-white">{t("cartEmpty")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("cartEmptyHint")}</p>
            </div>
            <Button
              asChild
              className="rounded-full bg-brand hover:bg-brand-light"
            >
              <Link href="/products" onClick={() => setCartOpen(false)}>
                {t("browseProducts")}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="mt-2 flex-1 space-y-3 overflow-y-auto pr-1">
              {lines.map((line) => {
                const name = line.names?.[locale] ?? line.name;
                return (
                <div
                  key={line.productId}
                  className="flex gap-4 rounded-2xl border border-white/8 bg-secondary/60 p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d12]">
                    <Image
                      src={line.image}
                      alt={name}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-bold leading-snug text-white">
                        {name}
                      </p>
                      <button
                        onClick={() => remove(line.productId)}
                        className="text-muted-foreground transition-colors hover:text-red-400"
                        aria-label={t("removeAria").replace("{name}", name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      {formatDA(line.price)} {t("eachSuffix")}
                    </span>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-white/10 bg-background">
                        <button
                          onClick={() => setQty(line.productId, line.quantity - 1)}
                          className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-white"
                          aria-label={t("qtyDecrease")}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-white">
                          {line.quantity}
                        </span>
                        <button
                          onClick={() => setQty(line.productId, line.quantity + 1)}
                          disabled={line.quantity >= (line.stock && line.stock > 0 ? Math.min(line.stock, 99) : 99)}
                          className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={t("qtyIncrease")}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-black text-white">
                        {formatDA(line.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              {/* Free shipping progress */}
              <div className={`rounded-xl border p-3 ${freeShipping ? "border-emerald-500/30 bg-emerald-500/8" : "border-white/10 bg-secondary/60"}`}>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Truck className={`h-4 w-4 ${freeShipping ? "text-emerald-400" : "text-brand-light"}`} />
                  {freeShipping ? (
                    <span className="text-emerald-400">{t("unlockedFree")}</span>
                  ) : (
                    <span className="text-white">{t("addMoreForFree").replace("{amount}", formatDA(s.freeShippingThreshold - subtotal))}</span>
                  )}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all ${freeShipping ? "bg-emerald-400" : "bg-brand"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span className="font-black text-white">{formatDA(subtotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{t("deliveryNote")}</p>

              <Separator className="bg-white/10" />

              <Button
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                className="glow-brand h-12 w-full rounded-full bg-brand text-sm font-bold uppercase tracking-wider hover:bg-brand-light"
              >
                {t("proceedCheckout")}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
