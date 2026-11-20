/** Format a price in Algerian Dinars, e.g. 18500 -> "18 500 DA" */
export function formatDA(value: number): string {
  return `${new Intl.NumberFormat("fr-FR").format(value)} DA`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

/** Normalize an Algerian phone number to international format (213XXXXXXXXX) */
export function phoneIntl(phone: string): string {
  const cleaned = phone.replace(/[\s\-().]/g, "");
  if (cleaned.startsWith("+213")) return cleaned.slice(1);
  if (cleaned.startsWith("213")) return cleaned;
  if (cleaned.startsWith("0")) return `213${cleaned.slice(1)}`;
  return cleaned;
}

/** Simple validation for Algerian mobile numbers (05/06/07) */
export function isValidDzPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, "");
  return /^(0|\+213|213)(5|6|7)\d{8}$/.test(cleaned);
}
