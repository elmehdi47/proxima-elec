import { DEFAULT_SETTINGS } from "./site-settings";
import { formatDA, phoneIntl } from "./format";
import { translate, productName, type Locale } from "./i18n";
import type { Product } from "./types";

/** Build a wa.me link. `intl` overrides the store number (e.g. from live settings). */
export function waLink(text: string, intl: string = DEFAULT_SETTINGS.whatsappIntl): string {
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

/** Pre-localized customer WhatsApp link target. */
export function waLinkLocalized(locale: Locale, intl: string): string {
  return waLink(translate(locale, "waGreeting"), intl);
}

export function productInquiryMessage(product: Product, locale: Locale = "en"): string {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return [
    t("inquiryLine1"),
    "",
    `*${productName(product, locale)}*`,
    `${t("inquiryPrice")} ${formatDA(product.price)}`,
    "",
    t("inquiryAvailable"),
  ].join("\n");
}

export interface WhatsAppOrderData {
  orderNumber: string;
  customerName: string;
  phone: string;
  wilaya: string;
  address?: string | null;
  notes?: string | null;
  items: { productName: string; quantity: number; price: number }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export function orderMessage(data: WhatsAppOrderData): string {
  const lines = [
    `*NEW ORDER — ${data.orderNumber}*`,
    "",
    `Customer: ${data.customerName}`,
    `Phone: ${data.phone}`,
    `Wilaya: ${data.wilaya}`,
  ];
  if (data.address) lines.push(`Address: ${data.address}`);
  lines.push("", "*Items:*");
  for (const item of data.items) {
    lines.push(`• ${item.productName} x${item.quantity} — ${formatDA(item.price * item.quantity)}`);
  }
  lines.push(
    "",
    `Subtotal: ${formatDA(data.subtotal)}`,
    `Delivery: ${formatDA(data.deliveryFee)}`,
    `*Total: ${formatDA(data.total)}*`
  );
  if (data.notes) lines.push("", `Notes: ${data.notes}`);
  lines.push("", "Sent from the Proxima Elec website");
  return lines.join("\n");
}

/** Link used by the admin to contact a customer directly on WhatsApp */
export function adminCustomerLink(phone: string, orderNumber?: string): string {
  const text = orderNumber
    ? `Hello! This is Proxima Elec regarding your order ${orderNumber}.`
    : `Hello! This is Proxima Elec.`;
  return `https://wa.me/${phoneIntl(phone)}?text=${encodeURIComponent(text)}`;
}
