import { DEFAULT_SETTINGS } from "./site-settings";

/**
 * Legacy convenience constants. The storefront reads live values from the
 * SiteSettings CMS (see `src/lib/site-settings.ts`); these constants simply
 * re-export the defaults so any remaining consumer stays in sync.
 */
export const BRAND = {
  name: DEFAULT_SETTINGS.brandName,
  shortName: DEFAULT_SETTINGS.shortName,
  tagline: DEFAULT_SETTINGS.tagline,
  phoneDisplay: DEFAULT_SETTINGS.phoneDisplay,
  whatsappIntl: DEFAULT_SETTINGS.whatsappIntl,
  instagram: DEFAULT_SETTINGS.instagram,
  instagramHandle: DEFAULT_SETTINGS.instagramHandle,
  facebook: DEFAULT_SETTINGS.facebook,
  freeShippingThreshold: DEFAULT_SETTINGS.freeShippingThreshold,
} as const;

export const CATEGORIES = DEFAULT_SETTINGS.categories;

export const WILAYAS = DEFAULT_SETTINGS.wilayas;

export function wilayaFee(name: string): number {
  return WILAYAS.find((w) => w.name === name)?.fee ?? 700;
}

export const ORDER_STATUSES = [
  { id: "pending", label: "Pending", classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  { id: "confirmed", label: "Confirmed", classes: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
  { id: "shipped", label: "Shipped", classes: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  { id: "delivered", label: "Delivered", classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  { id: "cancelled", label: "Cancelled", classes: "bg-red-500/15 text-red-400 border-red-500/30" },
] as const;

export type OrderStatusId = (typeof ORDER_STATUSES)[number]["id"];

export function statusMeta(id: string) {
  return (
    ORDER_STATUSES.find((s) => s.id === id) ?? {
      id,
      label: id,
      classes: "bg-white/10 text-white/70 border-white/20",
    }
  );
}
