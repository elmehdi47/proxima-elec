"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  User,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart, useCartItems, cartSubtotal } from "@/store/cart";
import { useUI } from "@/store/ui";
import { formatDA, isValidDzPhone } from "@/lib/format";
import { useSiteSettings, useLocale } from "@/components/store/settings-provider";
import { WhatsAppIcon } from "@/components/icons";
import type { CreatedOrder } from "@/lib/types";

interface FormState {
  customerName: string;
  phone: string;
  wilaya: string;
  address: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  customerName: "",
  phone: "",
  wilaya: "",
  address: "",
  notes: "",
};

const inputCls =
  "h-11 w-full rounded-xl border border-white/10 bg-secondary ps-10 pe-4 text-sm text-white placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30";

export function CheckoutDialog() {
  const checkoutOpen = useUI((s) => s.checkoutOpen);
  const setCheckoutOpen = useUI((s) => s.setCheckoutOpen);

  return (
    <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto border-white/10 bg-card sm:rounded-3xl">
        {/* Inner component remounts on every open — always-fresh form */}
        {checkoutOpen && <CheckoutForm />}
      </DialogContent>
    </Dialog>
  );
}

function CheckoutForm() {
  const s = useSiteSettings();
  const { t } = useLocale();
  const lines = useCartItems();
  const clear = useCart((s) => s.clear);
  const setCheckoutOpen = useUI((s) => s.setCheckoutOpen);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<CreatedOrder | null>(null);

  const subtotal = cartSubtotal(lines);

  const fee = useMemo(() => {
    if (!form.wilaya) return null;
    const wilaya = s.wilayas.find((w) => w.name === form.wilaya);
    return subtotal >= s.freeShippingThreshold ? 0 : (wilaya?.fee ?? null);
  }, [form.wilaya, subtotal, s.wilayas, s.freeShippingThreshold]);

  const total = subtotal + (fee ?? 0);
  const itemCount = lines.reduce((acc, l) => acc + l.quantity, 0);

  const set =
    (key: keyof FormState) =>
    (value: string) =>
      setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.customerName.trim().length < 3) {
      toast.error(t("errName"));
      return;
    }
    if (!isValidDzPhone(form.phone)) {
      toast.error(t("errPhone"));
      return;
    }
    if (!form.wilaya) {
      toast.error(t("errWilaya"));
      return;
    }
    if (form.address.trim().length < 3) {
      toast.error(t("errAddress"));
      return;
    }
    if (lines.length === 0) {
      toast.error(t("errEmptyCart"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          phone: form.phone.trim(),
          wilaya: form.wilaya,
          address: form.address.trim(),
          notes: form.notes.trim() || undefined,
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error || t("errGeneric"));
        return;
      }

      setSuccess(data as CreatedOrder);
      clear();
    } catch {
      toast.error(t("errNetwork"));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">{t("orderPlaced")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("yourOrder")}{" "}
            <span className="font-bold text-brand-light">{success.order.orderNumber}</span>{" "}
            {t("hasBeenReceived")}{" "}
            <span className="font-semibold text-amber-400">{t("pendingConfirmation")}</span>.
          </p>
        </div>

        <div className="w-full space-y-2 rounded-xl border border-white/10 bg-secondary/60 p-4 text-start text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("customer")}</span>
            <span className="font-semibold text-white">{success.order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("deliverTo")}</span>
            <span className="max-w-[55%] truncate font-semibold text-white">
              {success.order.wilaya}
              {success.order.address ? ` — ${success.order.address}` : ""}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("total")}</span>
            <span className="font-black text-brand-light">{formatDA(success.order.total)}</span>
          </div>
        </div>

        <a
          href={success.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-wa text-sm font-bold uppercase tracking-wider text-white transition-transform hover:scale-[1.02]"
        >
          <WhatsAppIcon className="h-5 w-5" />
          {t("confirmWhatsApp")}
        </a>
        <p className="text-[11px] text-muted-foreground">{t("confirmHint")}</p>
        <Button
          variant="outline"
          onClick={() => setCheckoutOpen(false)}
          className="w-full rounded-full border-white/15 text-muted-foreground hover:bg-white/5 hover:text-white"
        >
          {t("continueShopping")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-xl font-black text-white">
          {t("completeOrder")}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          {itemCount} {itemCount === 1 ? t("itemSingular") : t("itemPlural")} · {formatDA(subtotal)} — {t("fillDetails")}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="checkout-name" className="text-xs font-semibold text-white">
            {t("fullName")} <span className="text-brand-light">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="checkout-name"
              value={form.customerName}
              onChange={(e) => set("customerName")(e.target.value)}
              placeholder={t("namePlaceholder")}
              autoComplete="name"
              className={inputCls}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label htmlFor="checkout-phone" className="text-xs font-semibold text-white">
            {t("phoneLabel")} <span className="text-brand-light">*</span>
          </label>
          <div className="relative">
            <Phone className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="checkout-phone"
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
              placeholder="06 52 29 61 24"
              inputMode="tel"
              autoComplete="tel"
              className={inputCls}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">{t("phoneHint")}</p>
        </div>

        {/* Wilaya */}
        <div className="space-y-1.5">
          <label htmlFor="checkout-wilaya" className="text-xs font-semibold text-white">
            {t("wilayaLabel")} <span className="text-brand-light">*</span>
          </label>
          <Select value={form.wilaya} onValueChange={set("wilaya")}>
            <SelectTrigger
              id="checkout-wilaya"
              className="h-11 w-full rounded-xl border-white/10 bg-secondary text-sm text-white"
            >
              <div className="flex w-full items-center gap-2 px-3">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder={t("selectWilaya")} />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-64 border-white/10 bg-popover">
              {s.wilayas.map((w) => (
                <SelectItem key={w.code} value={w.name} className="text-sm">
                  {w.name} — {formatDA(w.fee)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <label htmlFor="checkout-address" className="text-xs font-semibold text-white">
            {t("addressLabel")} <span className="text-brand-light">*</span>
          </label>
          <input
            id="checkout-address"
            value={form.address}
            onChange={(e) => set("address")(e.target.value)}
            placeholder={t("addressPlaceholder")}
            autoComplete="street-address"
            className="h-11 w-full rounded-xl border border-white/10 bg-secondary px-4 text-sm text-white placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label htmlFor="checkout-notes" className="text-xs font-semibold text-white">
            {t("notesLabel")} <span className="text-muted-foreground">{t("optional")}</span>
          </label>
          <textarea
            id="checkout-notes"
            value={form.notes}
            onChange={(e) => set("notes")(e.target.value)}
            placeholder={t("notesPlaceholder")}
            rows={2}
            className="w-full resize-none rounded-xl border border-white/10 bg-secondary px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>

        {/* Totals */}
        <div className="space-y-2 rounded-xl border border-white/10 bg-secondary/60 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("subtotal")}</span>
            <span className="font-semibold text-white">{formatDA(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("deliveryLabel")}</span>
            {fee === null ? (
              <span className="text-xs italic text-muted-foreground">{t("selectWilayaHint")}</span>
            ) : fee === 0 ? (
              <span className="font-bold text-emerald-400">{t("free")}</span>
            ) : (
              <span className="font-semibold text-white">{formatDA(fee)}</span>
            )}
          </div>
          <div className="flex justify-between border-t border-white/10 pt-2 text-base">
            <span className="font-bold text-white">{t("totalToPay")}</span>
            <span className="font-black text-brand-light">{formatDA(total)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/8 px-3 py-2 text-[11px] font-semibold text-emerald-400">
            <Banknote className="h-3.5 w-3.5" />
            {t("codNote")}
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting || lines.length === 0}
          className="glow-brand h-12 w-full rounded-full bg-brand text-sm font-bold uppercase tracking-wider hover:bg-brand-light"
        >
          {submitting ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t("placingOrder")}
            </>
          ) : (
            t("confirmOrder").replace("{total}", formatDA(total))
          )}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">{t("confirmNote")}</p>
      </form>
    </>
  );
}
