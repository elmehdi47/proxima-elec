"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  DatabaseBackup,
  Download,
  ImageIcon,
  KeyRound,
  Languages,
  Loader2,
  LayoutGrid,
  Monitor,
  PackageSearch,
  PanelBottom,
  PanelTop,
  PhoneCall,
  Plus,
  RotateCcw,
  Store,
  Tags,
  Trash2,
  Truck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin-api";
import { useUI } from "@/store/ui";
import type { SiteSettings, SettingsTranslations, Locale } from "@/lib/site-settings";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

/** Admin settings fetcher — shared queryFn for every CMS consumer. */
export async function fetchAdminSettings(): Promise<SiteSettings> {
  const res = await adminFetch("/api/admin/settings");
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

/**
 * Local draft model: every leaf is a string so inputs stay fully
 * controlled. Numbers and the brands strip are parsed back on save.
 */
interface DraftWilaya {
  code: string;
  name: string;
  fee: string;
}

interface DraftNavLink {
  label: string;
  href: string;
}

interface DraftSection {
  id: string;
  label: string;
  visible: boolean;
}

/** Every translation field as a plain string ("" = use the English value). */
interface DraftTranslation {
  tagline: string;
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    chipTop: string;
    chipBottom: string;
  };
  features: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    items: { title: string; desc: string }[];
  };
  catalog: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    searchPlaceholder: string;
  };
  contact: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    hoursLine: string;
    whatsappDesc: string;
    instagramDesc: string;
    facebookDesc: string;
  };
  footer: {
    about: string;
    note: string;
    shopTitle: string;
    supportTitle: string;
    allProductsLabel: string;
    deliveryLabel: string;
    contactLabel: string;
    adminLabel: string;
  };
}

const EMPTY_TRANSLATION: DraftTranslation = {
  tagline: "",
  hero: {
    badge: "",
    titleLine1: "",
    titleLine2: "",
    subtitle: "",
    primaryCta: "",
    secondaryCta: "",
    chipTop: "",
    chipBottom: "",
  },
  features: { kicker: "", titleLine1: "", titleLine2: "", subtitle: "", items: [] },
  catalog: { kicker: "", titleLine1: "", titleLine2: "", subtitle: "", searchPlaceholder: "" },
  contact: {
    kicker: "",
    titleLine1: "",
    titleLine2: "",
    subtitle: "",
    hoursLine: "",
    whatsappDesc: "",
    instagramDesc: "",
    facebookDesc: "",
  },
  footer: {
    about: "",
    note: "",
    shopTitle: "",
    supportTitle: "",
    allProductsLabel: "",
    deliveryLabel: "",
    contactLabel: "",
    adminLabel: "",
  },
};

/** Fill a translation draft from the stored overlay ("" where unset). */
function toDraftTranslation(
  tr: SettingsTranslations | undefined,
  baseItems: number
): DraftTranslation {
  const items = Array.from({ length: Math.max(baseItems, tr?.features?.items?.length ?? 0) }, (_, i) => {
    const over = tr?.features?.items?.[i];
    return { title: over?.title ?? "", desc: over?.desc ?? "" };
  });
  return {
    ...EMPTY_TRANSLATION,
    ...(tr ?? {}),
    hero: { ...EMPTY_TRANSLATION.hero, ...(tr?.hero ?? {}) },
    features: {
      ...EMPTY_TRANSLATION.features,
      ...(tr?.features ?? {}),
      items,
    },
    catalog: { ...EMPTY_TRANSLATION.catalog, ...(tr?.catalog ?? {}) },
    contact: { ...EMPTY_TRANSLATION.contact, ...(tr?.contact ?? {}) },
    footer: { ...EMPTY_TRANSLATION.footer, ...(tr?.footer ?? {}) },
  };
}

/** Strip empty strings — only fields the admin actually filled are saved. */
function overlayFromDraft(d: DraftTranslation): SettingsTranslations {
  const out: SettingsTranslations = {};
  if (d.tagline.trim()) out.tagline = d.tagline.trim();

  const hero = Object.fromEntries(
    Object.entries(d.hero).filter(([, v]) => v.trim() !== "")
  ) as SettingsTranslations["hero"];
  if (hero && Object.keys(hero).length > 0) out.hero = hero;

  const items = d.features.items
    .map((it) => ({ title: it.title.trim(), desc: it.desc.trim() }))
    .filter((it) => it.title !== "" || it.desc !== "");
  const features = {
    ...Object.fromEntries(
      Object.entries({
        kicker: d.features.kicker,
        titleLine1: d.features.titleLine1,
        titleLine2: d.features.titleLine2,
        subtitle: d.features.subtitle,
      }).filter(([, v]) => v.trim() !== "")
    ),
    ...(items.length > 0 ? { items } : {}),
  } as SettingsTranslations["features"];
  if (Object.keys(features).length > 0) out.features = features;

  const catalog = Object.fromEntries(
    Object.entries(d.catalog).filter(([, v]) => v.trim() !== "")
  ) as SettingsTranslations["catalog"];
  if (Object.keys(catalog).length > 0) out.catalog = catalog;

  const contact = Object.fromEntries(
    Object.entries(d.contact).filter(([, v]) => v.trim() !== "")
  ) as SettingsTranslations["contact"];
  if (Object.keys(contact).length > 0) out.contact = contact;

  const footer = Object.fromEntries(
    Object.entries(d.footer).filter(([, v]) => v.trim() !== "")
  ) as SettingsTranslations["footer"];
  if (Object.keys(footer).length > 0) out.footer = footer;

  return out;
}

/** Display names for the fixed set of home-page sections. */
const SECTION_LABELS: Record<string, string> = {
  hero: "Hero (top banner)",
  marquee: "Brands strip",
  features: "Features (why choose us)",
  catalog: "Product catalog",
  contact: "Contact",
};

interface DraftSettings {
  defaultLocale: Locale;
  translations: { fr: DraftTranslation; ar: DraftTranslation };
  brandName: string;
  shortName: string;
  tagline: string;
  logoUrl: string;
  phoneDisplay: string;
  whatsappIntl: string;
  instagram: string;
  instagramHandle: string;
  facebook: string;
  header: {
    subLabel: string;
    whatsappLabel: string;
    navLinks: DraftNavLink[];
  };
  sections: DraftSection[];
  showWhatsappFab: boolean;
  hero: SiteSettings["hero"];
  brandsMarquee: string;
  categories: SiteSettings["categories"];
  features: SiteSettings["features"];
  catalog: SiteSettings["catalog"];
  contact: SiteSettings["contact"];
  footer: SiteSettings["footer"];
  freeShippingThreshold: string;
  wilayas: DraftWilaya[];
}

function toDraft(s: SiteSettings): DraftSettings {
  return {
    defaultLocale: s.defaultLocale,
    translations: {
      fr: toDraftTranslation(s.translations?.fr, s.features.items.length),
      ar: toDraftTranslation(s.translations?.ar, s.features.items.length),
    },
    brandName: s.brandName,
    shortName: s.shortName,
    tagline: s.tagline,
    logoUrl: s.logoUrl,
    phoneDisplay: s.phoneDisplay,
    whatsappIntl: s.whatsappIntl,
    instagram: s.instagram,
    instagramHandle: s.instagramHandle,
    facebook: s.facebook,
    header: {
      subLabel: s.header.subLabel,
      whatsappLabel: s.header.whatsappLabel,
      navLinks: s.header.navLinks.map((l) => ({ ...l })),
    },
    sections: s.sections.map((sec) => ({
      id: sec.id,
      label: SECTION_LABELS[sec.id] ?? sec.id,
      visible: sec.visible,
    })),
    showWhatsappFab: s.showWhatsappFab,
    hero: structuredClone(s.hero),
    brandsMarquee: s.brandsMarquee.join(", "),
    categories: s.categories.map((c) => ({ ...c })),
    features: structuredClone(s.features),
    catalog: structuredClone(s.catalog),
    contact: structuredClone(s.contact),
    footer: structuredClone(s.footer),
    freeShippingThreshold: String(s.freeShippingThreshold),
    wilayas: s.wilayas.map((w) => ({ ...w, fee: String(w.fee) })),
  };
}

/** Parse a text field into a clamped integer (0 when invalid). */
function parseClamped(raw: string, min: number, max: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** Recursively trim every string in a plain object / array tree. */
function deepTrim(value: unknown): unknown {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(deepTrim);
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) out[key] = deepTrim(v);
    return out;
  }
  return value;
}

/** Build the exact payload sent to PUT /api/admin/settings. */
function buildPayload(d: DraftSettings): SiteSettings {
  const fr = overlayFromDraft(d.translations.fr);
  const ar = overlayFromDraft(d.translations.ar);
  const base = {
    ...d,
    defaultLocale: d.defaultLocale,
    translations: {
      ...(Object.keys(fr).length > 0 ? { fr } : {}),
      ...(Object.keys(ar).length > 0 ? { ar } : {}),
    },
    whatsappIntl: d.whatsappIntl.replace(/\s+/g, ""),
    header: {
      subLabel: d.header.subLabel,
      whatsappLabel: d.header.whatsappLabel,
      navLinks: d.header.navLinks
        .filter((l) => l.label.trim() !== "" && l.href.trim() !== "")
        .map((l) => ({ label: l.label, href: l.href })),
    },
    sections: d.sections.map(({ id, visible }) => ({ id, visible })),
    brandsMarquee: d.brandsMarquee
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean),
    freeShippingThreshold: parseClamped(d.freeShippingThreshold, 0, 10_000_000),
    wilayas: d.wilayas.map((w, i) => ({
      code: w.code.trim() || `n${i + 1}`,
      name: w.name.trim(),
      fee: parseClamped(w.fee, 0, 20_000),
    })),
    catalog: {
      ...d.catalog,
      maxOnHome: parseClamped(String(d.catalog.maxOnHome), 1, 24),
    },
  };
  return deepTrim(base) as SiteSettings;
}

/* ------------------------------------------------------------------ */
/* Small presentational helpers                                        */
/* ------------------------------------------------------------------ */

const inputCls =
  "h-10 w-full rounded-xl border border-white/10 bg-secondary px-3.5 text-sm text-white placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30";

const textareaCls =
  "w-full resize-none rounded-xl border border-white/10 bg-secondary px-3.5 py-3 text-sm text-white placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30";

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "url";
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-white">
        {label}
      </Label>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
      {hint && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 3,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-semibold text-white">
        {label}
      </Label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={textareaCls}
      />
      {hint && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  kicker,
  title,
  children,
}: {
  icon: typeof Store;
  kicker: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/8 bg-card p-5 sm:p-6">
      <div className="flex items-center gap-3 border-b border-white/8 pb-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-brand/30 bg-brand/10 text-brand-light">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {kicker}
          </p>
          <h3 className="truncate text-sm font-bold text-white">{title}</h3>
        </div>
      </div>
      <div className="space-y-4 pt-5">{children}</div>
    </section>
  );
}

function RemoveButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={disabled ? "At least one row is required" : label}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}

function AddRowButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand-light disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Backup — one-click full data export                                */
/* ------------------------------------------------------------------ */

const LAST_BACKUP_KEY = "px_last_backup";

function BackupCard() {
  // lazy initializer (runs once) — SSR renders an empty span, hydration
  // fills the text; suppressHydrationWarning covers the text difference.
  const [lastBackup, setLastBackup] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(LAST_BACKUP_KEY);
    } catch {
      /* private mode — ignore */
      return null;
    }
  });

  const handleDownload = () => {
    const now = new Date().toISOString();
    try {
      window.localStorage.setItem(LAST_BACKUP_KEY, now);
    } catch {
      /* ignore */
    }
    setLastBackup(now);
    // cookie-authenticated GET — browser handles the JSON file download
    window.location.href = "/api/admin/export";
    toast.success("Backup download started — keep the file somewhere safe");
  };

  return (
    <SectionCard icon={DatabaseBackup} kicker="Backup" title="Data backup">
      <div className="space-y-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Downloads every product, order and site setting as one JSON file.
          The hosted database is free, but policies can change over the years —
          grab a backup once a month (and before big edits) and keep it
          somewhere safe (Drive, email, USB). It is your insurance for the
          long run: the whole store can be restored from this file onto any
          new database.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleDownload}
            className="glow-brand h-10 rounded-full bg-brand px-5 text-xs font-bold uppercase tracking-wider hover:bg-brand-light"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Download backup
          </Button>
          {lastBackup ? (
            <span
              className="text-[11px] text-muted-foreground"
              suppressHydrationWarning
            >
              Last download: {new Date(lastBackup).toLocaleString()}
            </span>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Security — change password card                                     */
/* ------------------------------------------------------------------ */

function PasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Enter your current password first.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to change password");
        return;
      }
      toast.success("Password updated — other sessions were signed out");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      toast.error("Network error while changing password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard icon={KeyRound} kicker="Security" title="Admin password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="pw-current" className="text-xs font-semibold text-white">
              Current password
            </Label>
            <input
              id="pw-current"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw-new" className="text-xs font-semibold text-white">
              New password
            </Label>
            <input
              id="pw-new"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw-confirm" className="text-xs font-semibold text-white">
              Confirm new password
            </Label>
            <input
              id="pw-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Changing the password signs out every other session. You stay signed in
          on this device.
        </p>
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="h-10 rounded-full bg-brand px-5 text-xs font-bold uppercase tracking-wider hover:bg-brand-light"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

/* ------------------------------------------------------------------ */
/* Settings view (Content / CMS tab)                                   */
/* ------------------------------------------------------------------ */

type RootStringKey =
  | "brandName"
  | "shortName"
  | "tagline"
  | "logoUrl"
  | "phoneDisplay"
  | "whatsappIntl"
  | "instagram"
  | "instagramHandle"
  | "facebook";

export function SettingsView() {
  const qc = useQueryClient();
  const [trLang, setTrLang] = useState<"fr" | "ar">("fr");

  const { data: server, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: fetchAdminSettings,
  });

  const [draft, setDraft] = useState<DraftSettings | null>(null);
  const [saving, setSaving] = useState(false);

  /* Initialize the draft from the server snapshot (only once per load). */
  useEffect(() => {
    if (server && draft === null) setDraft(toDraft(server));
  }, [server, draft]);

  const dirty = useMemo(
    () =>
      draft && server
        ? JSON.stringify(buildPayload(draft)) !== JSON.stringify(server)
        : false,
    [draft, server]
  );

  /* Keep the shell's unsaved-changes guard in sync with this draft. */
  useEffect(() => {
    useUI.getState().setCmsDirty(dirty);
    return () => useUI.getState().setCmsDirty(false);
  }, [dirty]);

  /* --- field setters (draft leaves are all strings) --- */

  const setRoot = (key: RootStringKey, value: string) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const setDefaultLocale = (value: Locale) =>
    setDraft((d) => (d ? { ...d, defaultLocale: value } : d));

  const setMaxOnHome = (value: string) =>
    setDraft((d) =>
      d ? { ...d, catalog: { ...d.catalog, maxOnHome: parseClamped(value, 1, 24) } } : d
    );

  /** Patch one field inside the active language's translation overlay. */
  const setTr = (patch: (dt: DraftTranslation) => DraftTranslation) =>
    setDraft((d) =>
      d
        ? { ...d, translations: { ...d.translations, [trLang]: patch(d.translations[trLang]) } }
        : d
    );

  const setTrField =
    (group: "hero" | "features" | "catalog" | "contact" | "footer", key: string) =>
    (value: string) =>
      setTr((dt) => ({ ...dt, [group]: { ...dt[group], [key]: value } }));

  const setTrTagline = (value: string) => setTr((dt) => ({ ...dt, tagline: value }));

  const setTrFeatureItem = (index: number, key: "title" | "desc", value: string) =>
    setTr((dt) => ({
      ...dt,
      features: {
        ...dt.features,
        items: dt.features.items.map((it, i) => (i === index ? { ...it, [key]: value } : it)),
      },
    }));

  const setHero = (key: keyof DraftSettings["hero"], value: string) =>
    setDraft((d) => (d ? { ...d, hero: { ...d.hero, [key]: value } } : d));

  const setFeatures = (key: keyof DraftSettings["features"], value: string) =>
    setDraft((d) => (d ? { ...d, features: { ...d.features, [key]: value } } : d));

  const setCatalog = (key: keyof DraftSettings["catalog"], value: string) =>
    setDraft((d) => (d ? { ...d, catalog: { ...d.catalog, [key]: value } } : d));

  const setContact = (key: keyof DraftSettings["contact"], value: string) =>
    setDraft((d) => (d ? { ...d, contact: { ...d.contact, [key]: value } } : d));

  const setFooter = (key: keyof DraftSettings["footer"], value: string) =>
    setDraft((d) => (d ? { ...d, footer: { ...d.footer, [key]: value } } : d));

  const setFooterFlag = (key: "showAdminLink", value: boolean) =>
    setDraft((d) => (d ? { ...d, footer: { ...d.footer, [key]: value } } : d));

  const setHeaderField = (key: "subLabel" | "whatsappLabel", value: string) =>
    setDraft((d) => (d ? { ...d, header: { ...d.header, [key]: value } } : d));

  const setNavLink = (index: number, key: "label" | "href", value: string) =>
    setDraft((d) => {
      if (!d) return d;
      const navLinks = d.header.navLinks.map((l, i) =>
        i === index ? { ...l, [key]: value } : l
      );
      return { ...d, header: { ...d.header, navLinks } };
    });

  const addNavLink = () => {
    if (!draft) return;
    if (draft.header.navLinks.length >= 8) {
      toast.error("Navigation link limit reached (max 8).");
      return;
    }
    setDraft({
      ...draft,
      header: { ...draft.header, navLinks: [...draft.header.navLinks, { label: "", href: "#" }] },
    });
  };

  const removeNavLink = (index: number) => {
    if (!draft) return;
    setDraft({
      ...draft,
      header: {
        ...draft.header,
        navLinks: draft.header.navLinks.filter((_, i) => i !== index),
      },
    });
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    if (!draft) return;
    const target = index + direction;
    if (target < 0 || target >= draft.sections.length) return;
    const sections = [...draft.sections];
    [sections[index], sections[target]] = [sections[target], sections[index]];
    setDraft({ ...draft, sections });
  };

  const toggleSection = (index: number) =>
    setDraft((d) => {
      if (!d) return d;
      const sections = d.sections.map((sec, i) =>
        i === index ? { ...sec, visible: !sec.visible } : sec
      );
      return { ...d, sections };
    });

  const setShowWhatsappFab = (value: boolean) =>
    setDraft((d) => (d ? { ...d, showWhatsappFab: value } : d));

  const setStat = (index: number, key: "value" | "label", value: string) =>
    setDraft((d) => {
      if (!d) return d;
      const stats = d.hero.stats.map((s, i) => (i === index ? { ...s, [key]: value } : s));
      return { ...d, hero: { ...d.hero, stats } };
    });

  const addStat = () => {
    if (!draft || draft.hero.stats.length >= 6) return;
    setDraft({
      ...draft,
      hero: { ...draft.hero, stats: [...draft.hero.stats, { value: "", label: "" }] },
    });
  };

  const removeStat = (index: number) => {
    if (!draft || draft.hero.stats.length <= 1) return;
    setDraft({
      ...draft,
      hero: { ...draft.hero, stats: draft.hero.stats.filter((_, i) => i !== index) },
    });
  };

  const setCategory = (index: number, key: "id" | "label", value: string) =>
    setDraft((d) => {
      if (!d) return d;
      const categories = d.categories.map((c, i) =>
        i === index ? { ...c, [key]: value } : c
      );
      return { ...d, categories };
    });

  const addCategory = () => {
    if (!draft) return;
    if (draft.categories.length >= 20) {
      toast.error("Category limit reached (max 20).");
      return;
    }
    setDraft({ ...draft, categories: [...draft.categories, { id: "", label: "" }] });
  };

  const removeCategory = (index: number) => {
    if (!draft || draft.categories.length <= 1) return;
    setDraft({ ...draft, categories: draft.categories.filter((_, i) => i !== index) });
  };

  const setFeatureItem = (index: number, key: "title" | "desc", value: string) =>
    setDraft((d) => {
      if (!d) return d;
      const items = d.features.items.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      );
      return { ...d, features: { ...d.features, items } };
    });

  const addFeatureItem = () => {
    if (!draft || draft.features.items.length >= 6) return;
    setDraft({
      ...draft,
      features: {
        ...draft.features,
        items: [...draft.features.items, { title: "", desc: "" }],
      },
    });
  };

  const removeFeatureItem = (index: number) => {
    if (!draft || draft.features.items.length <= 1) return;
    setDraft({
      ...draft,
      features: {
        ...draft.features,
        items: draft.features.items.filter((_, i) => i !== index),
      },
    });
  };

  const setWilaya = (index: number, key: "code" | "name" | "fee", value: string) =>
    setDraft((d) => {
      if (!d) return d;
      const wilayas = d.wilayas.map((w, i) => (i === index ? { ...w, [key]: value } : w));
      return { ...d, wilayas };
    });

  const addWilaya = () => {
    if (!draft) return;
    if (draft.wilayas.length >= 150) {
      toast.error("Wilaya limit reached (max 150).");
      return;
    }
    setDraft({
      ...draft,
      wilayas: [...draft.wilayas, { code: "", name: "", fee: "" }],
    });
  };

  const removeWilaya = (index: number) => {
    if (!draft || draft.wilayas.length <= 1) return;
    setDraft({ ...draft, wilayas: draft.wilayas.filter((_, i) => i !== index) });
  };

  /* --- save / reset --- */

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const payload = buildPayload(draft);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        settings?: SiteSettings;
        error?: string;
      };
      if (!res.ok || !data.settings) {
        toast.error(data.error ?? "Failed to save settings");
        return;
      }
      qc.setQueryData(["admin-settings"], data.settings);
      setDraft(toDraft(data.settings));
      toast.success("Store updated — open the storefront to see the changes");
    } catch {
      toast.error("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!server) return;
    setDraft(toDraft(server));
    toast("Draft reset to the published version.");
  };

  /* --- render --- */

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-card p-12 text-center">
        <p className="text-sm font-semibold text-white">
          Could not load the store settings
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">
          The request failed. Check your connection and try again.
        </p>
        <Button
          onClick={() => void refetch()}
          className="h-10 rounded-full bg-brand px-5 text-xs font-bold uppercase tracking-wider hover:bg-brand-light"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading || !server || !draft) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56 rounded-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* a) Brand & contact */}
      <SectionCard icon={Store} kicker="Brand & contact" title="Store identity and public links">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-brandname"
            label="Brand name"
            value={draft.brandName}
            onChange={(v) => setRoot("brandName", v)}
            placeholder="Proxima Elec"
          />
          <TextField
            id="set-shortname"
            label="Short name"
            value={draft.shortName}
            onChange={(v) => setRoot("shortName", v)}
            placeholder="PROXIMA"
            hint="Used in compact headers and badges."
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="set-defaultlocale" className="text-xs font-semibold text-white">
            Default language
          </Label>
          <Select
            value={draft.defaultLocale}
            onValueChange={(v) => setDefaultLocale(v as Locale)}
          >
            <SelectTrigger id="set-defaultlocale" className="h-10 w-full rounded-xl border-white/10 bg-secondary text-sm text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-popover">
              <SelectItem value="en" className="text-sm">English (EN)</SelectItem>
              <SelectItem value="fr" className="text-sm">Français (FR)</SelectItem>
              <SelectItem value="ar" className="text-sm">العربية (AR)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            First visit without a chosen language. Visitors can still switch
            languages anytime from the header (EN · FR · AR).
          </p>
        </div>

        <TextAreaField
          id="set-tagline"
          label="Tagline"
          value={draft.tagline}
          onChange={(v) => setRoot("tagline", v)}
          placeholder="Electronic & Audio Visual Products"
          rows={2}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-logourl"
            label="Logo URL"
            value={draft.logoUrl}
            onChange={(v) => setRoot("logoUrl", v)}
            placeholder="/logo.jpg"
            hint="A site path (/logo.jpg) or an https URL."
          />
          <TextField
            id="set-phone"
            label="Phone (display)"
            value={draft.phoneDisplay}
            onChange={(v) => setRoot("phoneDisplay", v)}
            placeholder="0652 29 61 24"
            hint="Shown to customers — format freely."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-whatsapp"
            label="WhatsApp (international)"
            value={draft.whatsappIntl}
            onChange={(v) => setRoot("whatsappIntl", v)}
            placeholder="213652296124"
            inputMode="tel"
            hint="Country code + number, digits only — e.g. 213652296124."
          />
          <TextField
            id="set-instagramhandle"
            label="Instagram handle"
            value={draft.instagramHandle}
            onChange={(v) => setRoot("instagramHandle", v)}
            placeholder="@proximaelec_store"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-instagram"
            label="Instagram URL"
            value={draft.instagram}
            onChange={(v) => setRoot("instagram", v)}
            placeholder="https://www.instagram.com/..."
          />
          <TextField
            id="set-facebook"
            label="Facebook URL"
            value={draft.facebook}
            onChange={(v) => setRoot("facebook", v)}
            placeholder="https://www.facebook.com/..."
          />
        </div>
      </SectionCard>

      {/* a2) Header & navigation */}
      <SectionCard icon={PanelTop} kicker="Header" title="Top bar & navigation">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-header-sublabel"
            label="Text under the brand name"
            value={draft.header.subLabel}
            onChange={(v) => setHeaderField("subLabel", v)}
            placeholder="Audio & Electronics"
            hint="Leave empty to hide it."
          />
          <TextField
            id="set-header-walabel"
            label="WhatsApp button label"
            value={draft.header.whatsappLabel}
            onChange={(v) => setHeaderField("whatsappLabel", v)}
            placeholder="WhatsApp"
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-white">Menu links</p>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-[1fr_1fr_44px] gap-2 border-b border-white/8 bg-white/[0.03] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Label</span>
              <span>Link</span>
              <span className="sr-only">Remove</span>
            </div>
            <div className="divide-y divide-white/5">
              {draft.header.navLinks.map((link, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_44px] items-center gap-2 px-3 py-2">
                  <input
                    value={link.label}
                    onChange={(e) => setNavLink(i, "label", e.target.value)}
                    placeholder="Products"
                    aria-label={`Menu link ${i + 1} label`}
                    className={inputCls}
                  />
                  <input
                    value={link.href}
                    onChange={(e) => setNavLink(i, "href", e.target.value)}
                    placeholder="#catalog"
                    aria-label={`Menu link ${i + 1} target`}
                    className={`${inputCls} font-mono text-xs`}
                  />
                  <RemoveButton
                    label={`Remove menu link ${i + 1}`}
                    onClick={() => removeNavLink(i)}
                  />
                </div>
              ))}
              {draft.header.navLinks.length === 0 && (
                <p className="px-3 py-3 text-[11px] text-muted-foreground">
                  No menu links — the navigation is hidden.
                </p>
              )}
            </div>
          </div>
          <AddRowButton label="Add menu link" onClick={addNavLink} disabled={draft.header.navLinks.length >= 8} />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Targets: <span className="font-mono">#hero</span>,{" "}
            <span className="font-mono">#features</span>,{" "}
            <span className="font-mono">#catalog</span>,{" "}
            <span className="font-mono">#contact</span> — or any <span className="font-mono">/page</span> or
            https link. Empty rows are dropped on save.
          </p>
        </div>
      </SectionCard>

      {/* b) Hero section */}
      <SectionCard icon={Monitor} kicker="Hero section" title="Top-of-page banner">
        <TextField
          id="set-hero-badge"
          label="Badge"
          value={draft.hero.badge}
          onChange={(v) => setHero("badge", v)}
          placeholder="Algeria's audio & electronics store"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-hero-t1"
            label="Title — line 1"
            value={draft.hero.titleLine1}
            onChange={(v) => setHero("titleLine1", v)}
            placeholder="Legendary sound."
          />
          <TextField
            id="set-hero-t2"
            label="Title — line 2"
            value={draft.hero.titleLine2}
            onChange={(v) => setHero("titleLine2", v)}
            placeholder="Delivered to your door."
          />
        </div>
        <TextAreaField
          id="set-hero-subtitle"
          label="Subtitle"
          value={draft.hero.subtitle}
          onChange={(v) => setHero("subtitle", v)}
          rows={3}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-hero-cta1"
            label="Primary button"
            value={draft.hero.primaryCta}
            onChange={(v) => setHero("primaryCta", v)}
            placeholder="Shop the catalog"
          />
          <TextField
            id="set-hero-cta2"
            label="Secondary button"
            value={draft.hero.secondaryCta}
            onChange={(v) => setHero("secondaryCta", v)}
            placeholder="WhatsApp us"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="grid h-28 place-items-center overflow-hidden rounded-xl border border-white/10 bg-[#0d0d12]">
            {draft.hero.image.trim() ? (
              <img
                src={draft.hero.image.trim()}
                alt={draft.hero.imageAlt || "Hero image preview"}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-4">
            <TextField
              id="set-hero-image"
              label="Hero image"
              value={draft.hero.image}
              onChange={(v) => setHero("image", v)}
              placeholder="/hero-main.png or https://..."
              hint="A site path or a direct https URL."
            />
            <TextField
              id="set-hero-imagealt"
              label="Image alt text"
              value={draft.hero.imageAlt}
              onChange={(v) => setHero("imageAlt", v)}
              placeholder="Premium headphones and speakers"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-hero-chiptop"
            label="Floating chip — top"
            value={draft.hero.chipTop}
            onChange={(v) => setHero("chipTop", v)}
            placeholder="Fast delivery — 24/48h"
          />
          <TextField
            id="set-hero-chipbottom"
            label="Floating chip — bottom"
            value={draft.hero.chipBottom}
            onChange={(v) => setHero("chipBottom", v)}
            placeholder="Cash on delivery"
          />
        </div>

        {/* Hero stats editor */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-white">Hero stats</p>
          {draft.hero.stats.map((stat, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                value={stat.value}
                onChange={(e) => setStat(i, "value", e.target.value)}
                placeholder="1 000+"
                aria-label={`Stat ${i + 1} value`}
                className={`${inputCls} w-28 shrink-0`}
              />
              <input
                value={stat.label}
                onChange={(e) => setStat(i, "label", e.target.value)}
                placeholder="Happy customers"
                aria-label={`Stat ${i + 1} label`}
                className={`${inputCls} min-w-[160px] flex-1`}
              />
              <RemoveButton
                label={`Remove stat ${i + 1}`}
                onClick={() => removeStat(i)}
                disabled={draft.hero.stats.length <= 1}
              />
            </div>
          ))}
          <AddRowButton
            label="Add stat"
            onClick={addStat}
            disabled={draft.hero.stats.length >= 6}
          />
        </div>
      </SectionCard>

      {/* b2) Layout — section order & visibility */}
      <SectionCard icon={LayoutGrid} kicker="Layout" title="Home page — section order & visibility">
        <div className="space-y-2">
          <div className="overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-[1fr_44px_88px] items-center gap-2 border-b border-white/8 bg-white/[0.03] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Section (top to bottom)</span>
              <span className="text-center">Move</span>
              <span className="text-center">Visible</span>
            </div>
            <div className="divide-y divide-white/5">
              {draft.sections.map((section, i) => (
                <div
                  key={section.id}
                  className="grid grid-cols-[1fr_44px_88px] items-center gap-2 px-3 py-2.5"
                >
                  <span className="truncate text-sm font-semibold text-white">
                    {section.label}
                  </span>
                  <span className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move ${section.label} up`}
                      className="grid h-8 w-5 place-items-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand-light disabled:opacity-25"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(i, 1)}
                      disabled={i === draft.sections.length - 1}
                      aria-label={`Move ${section.label} down`}
                      className="grid h-8 w-5 place-items-center rounded-lg border border-white/10 text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand-light disabled:opacity-25"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </span>
                  <span className="flex items-center justify-center">
                    <Switch
                      checked={section.visible}
                      onCheckedChange={() => toggleSection(i)}
                      aria-label={`${section.label} visible`}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            The arrows change the order of the blocks on the home page; the
            switches turn each block on or off entirely.
          </p>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white">
                Floating WhatsApp button
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                The green round button in the bottom-right corner of the store.
              </p>
            </div>
            <Switch
              checked={draft.showWhatsappFab}
              onCheckedChange={setShowWhatsappFab}
              aria-label="Show floating WhatsApp button"
            />
          </div>
        </div>
      </SectionCard>

      {/* c) Brands strip */}
      <SectionCard icon={Tags} kicker="Brands marquee" title="Scrolling brand strip">
        <TextAreaField
          id="set-brands"
          label="Brand names"
          value={draft.brandsMarquee}
          onChange={(v) => setDraft((d) => (d ? { ...d, brandsMarquee: v } : d))}
          placeholder="JBL, SONY, MARSHALL, ANKER, APPLE, XIAOMI"
          rows={2}
          hint="Comma-separated — these scroll under the hero section."
        />
      </SectionCard>

      {/* d) Categories */}
      <SectionCard icon={LayoutGrid} kicker="Categories" title="Product catalog categories">
        <div className="space-y-2">
          {draft.categories.map((category, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                value={category.id}
                onChange={(e) => setCategory(i, "id", e.target.value)}
                placeholder="speakers"
                aria-label={`Category ${i + 1} id`}
                className={`${inputCls} w-40 shrink-0 font-mono text-xs`}
              />
              <input
                value={category.label}
                onChange={(e) => setCategory(i, "label", e.target.value)}
                placeholder="Speakers"
                aria-label={`Category ${i + 1} label`}
                className={`${inputCls} min-w-[160px] flex-1`}
              />
              <RemoveButton
                label={`Remove category ${i + 1}`}
                onClick={() => removeCategory(i)}
                disabled={draft.categories.length <= 1}
              />
            </div>
          ))}
          <AddRowButton label="Add category" onClick={addCategory} disabled={draft.categories.length >= 20} />
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          The id must be lowercase letters, digits or dashes (e.g. tv-projectors) —
          it is the key existing products point at.
        </p>
      </SectionCard>

      {/* e) Features section */}
      <SectionCard icon={BadgeCheck} kicker="Features" title="Why-choose-us section">
        <TextField
          id="set-features-kicker"
          label="Kicker"
          value={draft.features.kicker}
          onChange={(v) => setFeatures("kicker", v)}
          placeholder="Why Proxima Elec"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-features-t1"
            label="Title — line 1"
            value={draft.features.titleLine1}
            onChange={(v) => setFeatures("titleLine1", v)}
            placeholder="Built on trust."
          />
          <TextField
            id="set-features-t2"
            label="Title — line 2"
            value={draft.features.titleLine2}
            onChange={(v) => setFeatures("titleLine2", v)}
            placeholder="Delivered with care."
          />
        </div>
        <TextAreaField
          id="set-features-subtitle"
          label="Subtitle"
          value={draft.features.subtitle}
          onChange={(v) => setFeatures("subtitle", v)}
          rows={2}
        />
        <div className="space-y-2">
          <p className="text-xs font-semibold text-white">Feature items</p>
          {draft.features.items.map((item, i) => (
            <div
              key={i}
              className="space-y-2 rounded-xl border border-white/10 bg-secondary/40 p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={item.title}
                  onChange={(e) => setFeatureItem(i, "title", e.target.value)}
                  placeholder="100% Authentic"
                  aria-label={`Feature ${i + 1} title`}
                  className={`${inputCls} min-w-[160px] flex-1`}
                />
                <RemoveButton
                  label={`Remove feature ${i + 1}`}
                  onClick={() => removeFeatureItem(i)}
                  disabled={draft.features.items.length <= 1}
                />
              </div>
              <textarea
                value={item.desc}
                onChange={(e) => setFeatureItem(i, "desc", e.target.value)}
                placeholder="Official products sourced from authorized distributors."
                aria-label={`Feature ${i + 1} description`}
                rows={2}
                className={textareaCls}
              />
            </div>
          ))}
          <AddRowButton
            label="Add feature item"
            onClick={addFeatureItem}
            disabled={draft.features.items.length >= 6}
          />
        </div>
      </SectionCard>

      {/* f) Catalog heading */}
      <SectionCard icon={PackageSearch} kicker="Catalog heading" title="Product grid header">
        <TextField
          id="set-catalog-kicker"
          label="Kicker"
          value={draft.catalog.kicker}
          onChange={(v) => setCatalog("kicker", v)}
          placeholder="Our catalog"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-catalog-t1"
            label="Title — line 1"
            value={draft.catalog.titleLine1}
            onChange={(v) => setCatalog("titleLine1", v)}
            placeholder="Gear that hits"
          />
          <TextField
            id="set-catalog-t2"
            label="Title — line 2"
            value={draft.catalog.titleLine2}
            onChange={(v) => setCatalog("titleLine2", v)}
            placeholder="different."
          />
        </div>
        <TextAreaField
          id="set-catalog-subtitle"
          label="Subtitle"
          value={draft.catalog.subtitle}
          onChange={(v) => setCatalog("subtitle", v)}
          rows={2}
        />
        <TextField
          id="set-catalog-search"
          label="Search placeholder"
          value={draft.catalog.searchPlaceholder}
          onChange={(v) => setCatalog("searchPlaceholder", v)}
          placeholder="Search speakers, JBL, earbuds..."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-catalog-maxhome"
            label="Products shown on the home page"
            value={String(draft.catalog.maxOnHome)}
            onChange={setMaxOnHome}
            inputMode="numeric"
            placeholder="3"
            hint="Featured products first — everything else lives on the /products page."
          />
          <div className="flex items-end">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              The home catalog shows a short glimpse of the grid, with a
              “View all products” button to the full catalog page.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* g) Contact section */}
      <SectionCard icon={PhoneCall} kicker="Contact section" title="Get-in-touch block">
        <TextField
          id="set-contact-kicker"
          label="Kicker"
          value={draft.contact.kicker}
          onChange={(v) => setContact("kicker", v)}
          placeholder="Get in touch"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-contact-t1"
            label="Title — line 1"
            value={draft.contact.titleLine1}
            onChange={(v) => setContact("titleLine1", v)}
            placeholder="We're one message"
          />
          <TextField
            id="set-contact-t2"
            label="Title — line 2"
            value={draft.contact.titleLine2}
            onChange={(v) => setContact("titleLine2", v)}
            placeholder="away."
          />
        </div>
        <TextAreaField
          id="set-contact-subtitle"
          label="Subtitle"
          value={draft.contact.subtitle}
          onChange={(v) => setContact("subtitle", v)}
          rows={2}
        />
        <TextField
          id="set-contact-hours"
          label="Availability line"
          value={draft.contact.hoursLine}
          onChange={(v) => setContact("hoursLine", v)}
          placeholder="Available every day from 9:00 to 21:00"
        />
        <TextAreaField
          id="set-contact-wa"
          label="WhatsApp card text"
          value={draft.contact.whatsappDesc}
          onChange={(v) => setContact("whatsappDesc", v)}
          rows={2}
        />
        <TextAreaField
          id="set-contact-ig"
          label="Instagram card text"
          value={draft.contact.instagramDesc}
          onChange={(v) => setContact("instagramDesc", v)}
          rows={2}
        />
        <TextAreaField
          id="set-contact-fb"
          label="Facebook card text"
          value={draft.contact.facebookDesc}
          onChange={(v) => setContact("facebookDesc", v)}
          rows={2}
        />
      </SectionCard>

      {/* h) Footer */}
      <SectionCard icon={PanelBottom} kicker="Footer" title="Bottom of every page">
        <TextAreaField
          id="set-footer-about"
          label="About text"
          value={draft.footer.about}
          onChange={(v) => setFooter("about", v)}
          rows={3}
        />
        <TextField
          id="set-footer-note"
          label="Note line"
          value={draft.footer.note}
          onChange={(v) => setFooter("note", v)}
          placeholder="Cash on delivery · Fast shipping · 100 wilayas"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="set-footer-shoptitle"
            label="'Shop' column title"
            value={draft.footer.shopTitle}
            onChange={(v) => setFooter("shopTitle", v)}
            placeholder="Shop"
          />
          <TextField
            id="set-footer-supporttitle"
            label="'Support' column title"
            value={draft.footer.supportTitle}
            onChange={(v) => setFooter("supportTitle", v)}
            placeholder="Support"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            id="set-footer-allproducts"
            label="'All products' link"
            value={draft.footer.allProductsLabel}
            onChange={(v) => setFooter("allProductsLabel", v)}
            placeholder="All products"
          />
          <TextField
            id="set-footer-delivery"
            label="'Delivery' link"
            value={draft.footer.deliveryLabel}
            onChange={(v) => setFooter("deliveryLabel", v)}
            placeholder="Delivery & warranty"
          />
          <TextField
            id="set-footer-contactlabel"
            label="'Contact' link"
            value={draft.footer.contactLabel}
            onChange={(v) => setFooter("contactLabel", v)}
            placeholder="Contact us"
          />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
          <div className="min-w-0 flex-1">
            <Label
              htmlFor="set-footer-adminlink"
              className="text-xs font-semibold text-white"
            >
              Show admin link
            </Label>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              Adds a discreet link to the /admin panel in the footer.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              id="set-footer-adminlabel"
              type="text"
              value={draft.footer.adminLabel}
              onChange={(e) => setFooter("adminLabel", e.target.value)}
              placeholder="Admin panel"
              aria-label="Admin link text"
              className={`${inputCls} h-9 w-32`}
            />
            <Switch
              id="set-footer-adminlink"
              checked={draft.footer.showAdminLink}
              onCheckedChange={(v) => setFooterFlag("showAdminLink", v)}
              aria-label="Show admin link in footer"
            />
          </div>
        </div>
      </SectionCard>

      {/* i) Translations — FR / AR overlays */}
      <SectionCard icon={Languages} kicker="Languages" title="French & Arabic translations">
        <div className="flex flex-wrap items-center gap-2">
          {(["fr", "ar"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setTrLang(lang)}
              aria-pressed={trLang === lang}
              className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                trLang === lang
                  ? "bg-brand text-white"
                  : "border border-white/10 bg-secondary text-muted-foreground hover:border-brand/40 hover:text-brand-light"
              }`}
            >
              {lang === "fr" ? "Français" : "العربية"}
            </button>
          ))}
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Empty fields fall back to the English value — translate only what
            you want. The button texts (cart, checkout, filters) are translated
            automatically.
          </p>
        </div>

        {/* Active overlay */}
        {(() => {
          const tr = draft.translations[trLang];
          const ph = (en: string) => (trLang === "fr" ? `ex : ${en}` : `مثال: ${en}`);
          return (
            <div className="space-y-4" dir={trLang === "ar" ? "rtl" : "ltr"}>
              <TextField
                id={`tr-${trLang}-tagline`}
                label={trLang === "fr" ? "Tagline" : "الشعار"}
                value={tr.tagline}
                onChange={setTrTagline}
                placeholder={draft.tagline || "Tagline"}
              />

              <div className="space-y-2 rounded-xl border border-white/10 bg-secondary/40 p-3">
                <p className="text-xs font-semibold text-white">
                  {trLang === "fr" ? "Bannière hero" : "قسم الهيرو"}
                </p>
                <TextField
                  id={`tr-${trLang}-hero-badge`}
                  label={trLang === "fr" ? "Badge" : "الشارة"}
                  value={tr.hero.badge}
                  onChange={setTrField("hero", "badge")}
                  placeholder={draft.hero.badge || ph("Badge")}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id={`tr-${trLang}-hero-t1`}
                    label={trLang === "fr" ? "Titre — ligne 1" : "العنوان — السطر 1"}
                    value={tr.hero.titleLine1}
                    onChange={setTrField("hero", "titleLine1")}
                    placeholder={draft.hero.titleLine1 || ph("Title")}
                  />
                  <TextField
                    id={`tr-${trLang}-hero-t2`}
                    label={trLang === "fr" ? "Titre — ligne 2" : "العنوان — السطر 2"}
                    value={tr.hero.titleLine2}
                    onChange={setTrField("hero", "titleLine2")}
                    placeholder={draft.hero.titleLine2 || ph("Title")}
                  />
                </div>
                <TextAreaField
                  id={`tr-${trLang}-hero-subtitle`}
                  label={trLang === "fr" ? "Sous-titre" : "العنوان الفرعي"}
                  value={tr.hero.subtitle}
                  onChange={setTrField("hero", "subtitle")}
                  placeholder={draft.hero.subtitle || ph("Subtitle")}
                  rows={2}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id={`tr-${trLang}-hero-cta1`}
                    label={trLang === "fr" ? "Bouton principal" : "الزر الرئيسي"}
                    value={tr.hero.primaryCta}
                    onChange={setTrField("hero", "primaryCta")}
                    placeholder={draft.hero.primaryCta || ph("Button")}
                  />
                  <TextField
                    id={`tr-${trLang}-hero-cta2`}
                    label={trLang === "fr" ? "Bouton secondaire" : "الزر الثانوي"}
                    value={tr.hero.secondaryCta}
                    onChange={setTrField("hero", "secondaryCta")}
                    placeholder={draft.hero.secondaryCta || ph("Button")}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id={`tr-${trLang}-hero-chiptop`}
                    label={trLang === "fr" ? "Chip flottante — haut" : "الشريحة العائمة — أعلى"}
                    value={tr.hero.chipTop}
                    onChange={setTrField("hero", "chipTop")}
                    placeholder={draft.hero.chipTop || ph("Chip")}
                  />
                  <TextField
                    id={`tr-${trLang}-hero-chipbottom`}
                    label={trLang === "fr" ? "Chip flottante — bas" : "الشريحة العائمة — أسفل"}
                    value={tr.hero.chipBottom}
                    onChange={setTrField("hero", "chipBottom")}
                    placeholder={draft.hero.chipBottom || ph("Chip")}
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-white/10 bg-secondary/40 p-3">
                <p className="text-xs font-semibold text-white">
                  {trLang === "fr" ? "Section « Pourquoi nous »" : "قسم «لماذا نحن»"}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id={`tr-${trLang}-feat-kicker`}
                    label="Kicker"
                    value={tr.features.kicker}
                    onChange={setTrField("features", "kicker")}
                    placeholder={draft.features.kicker || "Kicker"}
                  />
                  <TextField
                    id={`tr-${trLang}-feat-t1`}
                    label={trLang === "fr" ? "Titre — ligne 1" : "العنوان — السطر 1"}
                    value={tr.features.titleLine1}
                    onChange={setTrField("features", "titleLine1")}
                    placeholder={draft.features.titleLine1 || ph("Title")}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id={`tr-${trLang}-feat-t2`}
                    label={trLang === "fr" ? "Titre — ligne 2" : "العنوان — السطر 2"}
                    value={tr.features.titleLine2}
                    onChange={setTrField("features", "titleLine2")}
                    placeholder={draft.features.titleLine2 || ph("Title")}
                  />
                  <TextField
                    id={`tr-${trLang}-feat-sub`}
                    label={trLang === "fr" ? "Sous-titre" : "العنوان الفرعي"}
                    value={tr.features.subtitle}
                    onChange={setTrField("features", "subtitle")}
                    placeholder={draft.features.subtitle || ph("Subtitle")}
                  />
                </div>
                {draft.features.items.map((item, i) => (
                  <div key={i} className="space-y-2 rounded-xl border border-white/10 p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {trLang === "fr" ? "Atout" : "ميزة"} {i + 1}
                    </p>
                    <input
                      value={tr.features.items[i]?.title ?? ""}
                      onChange={(e) => setTrFeatureItem(i, "title", e.target.value)}
                      placeholder={item.title || ph("Title")}
                      aria-label={`Feature ${i + 1} ${trLang} title`}
                      className={inputCls}
                    />
                    <textarea
                      value={tr.features.items[i]?.desc ?? ""}
                      onChange={(e) => setTrFeatureItem(i, "desc", e.target.value)}
                      placeholder={item.desc || ph("Description")}
                      aria-label={`Feature ${i + 1} ${trLang} description`}
                      rows={2}
                      className={textareaCls}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2 rounded-xl border border-white/10 bg-secondary/40 p-3">
                <p className="text-xs font-semibold text-white">
                  {trLang === "fr" ? "En-tête du catalogue" : "عنوان الكتالوج"}
                </p>
                <TextField
                  id={`tr-${trLang}-cat-kicker`}
                  label="Kicker"
                  value={tr.catalog.kicker}
                  onChange={setTrField("catalog", "kicker")}
                  placeholder={draft.catalog.kicker || "Kicker"}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id={`tr-${trLang}-cat-t1`}
                    label={trLang === "fr" ? "Titre — ligne 1" : "العنوان — السطر 1"}
                    value={tr.catalog.titleLine1}
                    onChange={setTrField("catalog", "titleLine1")}
                    placeholder={draft.catalog.titleLine1 || ph("Title")}
                  />
                  <TextField
                    id={`tr-${trLang}-cat-t2`}
                    label={trLang === "fr" ? "Titre — ligne 2" : "العنوان — السطر 2"}
                    value={tr.catalog.titleLine2}
                    onChange={setTrField("catalog", "titleLine2")}
                    placeholder={draft.catalog.titleLine2 || ph("Title")}
                  />
                </div>
                <TextAreaField
                  id={`tr-${trLang}-cat-sub`}
                  label={trLang === "fr" ? "Sous-titre" : "العنوان الفرعي"}
                  value={tr.catalog.subtitle}
                  onChange={setTrField("catalog", "subtitle")}
                  placeholder={draft.catalog.subtitle || ph("Subtitle")}
                  rows={2}
                />
              </div>

              <div className="space-y-2 rounded-xl border border-white/10 bg-secondary/40 p-3">
                <p className="text-xs font-semibold text-white">
                  {trLang === "fr" ? "Section contact" : "قسم التواصل"}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id={`tr-${trLang}-contact-kicker`}
                    label="Kicker"
                    value={tr.contact.kicker}
                    onChange={setTrField("contact", "kicker")}
                    placeholder={draft.contact.kicker || "Kicker"}
                  />
                  <TextField
                    id={`tr-${trLang}-contact-hours`}
                    label={trLang === "fr" ? "Ligne d'horaires" : "سطر التوفر"}
                    value={tr.contact.hoursLine}
                    onChange={setTrField("contact", "hoursLine")}
                    placeholder={draft.contact.hoursLine || ph("Hours")}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id={`tr-${trLang}-contact-t1`}
                    label={trLang === "fr" ? "Titre — ligne 1" : "العنوان — السطر 1"}
                    value={tr.contact.titleLine1}
                    onChange={setTrField("contact", "titleLine1")}
                    placeholder={draft.contact.titleLine1 || ph("Title")}
                  />
                  <TextField
                    id={`tr-${trLang}-contact-t2`}
                    label={trLang === "fr" ? "Titre — ligne 2" : "العنوان — السطر 2"}
                    value={tr.contact.titleLine2}
                    onChange={setTrField("contact", "titleLine2")}
                    placeholder={draft.contact.titleLine2 || ph("Title")}
                  />
                </div>
                <TextAreaField
                  id={`tr-${trLang}-contact-sub`}
                  label={trLang === "fr" ? "Sous-titre" : "العنوان الفرعي"}
                  value={tr.contact.subtitle}
                  onChange={setTrField("contact", "subtitle")}
                  placeholder={draft.contact.subtitle || ph("Subtitle")}
                  rows={2}
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <TextAreaField
                    id={`tr-${trLang}-contact-wa`}
                    label={trLang === "fr" ? "Texte carte WhatsApp" : "نص بطاقة واتساب"}
                    value={tr.contact.whatsappDesc}
                    onChange={setTrField("contact", "whatsappDesc")}
                    placeholder={draft.contact.whatsappDesc || ph("Card text")}
                    rows={2}
                  />
                  <TextAreaField
                    id={`tr-${trLang}-contact-ig`}
                    label={trLang === "fr" ? "Texte carte Instagram" : "نص بطاقة إنستغرام"}
                    value={tr.contact.instagramDesc}
                    onChange={setTrField("contact", "instagramDesc")}
                    placeholder={draft.contact.instagramDesc || ph("Card text")}
                    rows={2}
                  />
                  <TextAreaField
                    id={`tr-${trLang}-contact-fb`}
                    label={trLang === "fr" ? "Texte carte Facebook" : "نص بطاقة فيسبوك"}
                    value={tr.contact.facebookDesc}
                    onChange={setTrField("contact", "facebookDesc")}
                    placeholder={draft.contact.facebookDesc || ph("Card text")}
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-white/10 bg-secondary/40 p-3">
                <p className="text-xs font-semibold text-white">
                  {trLang === "fr" ? "Pied de page" : "تذييل الصفحة"}
                </p>
                <TextAreaField
                  id={`tr-${trLang}-footer-about`}
                  label={trLang === "fr" ? "Texte « à propos »" : "نص «من نحن»"}
                  value={tr.footer.about}
                  onChange={setTrField("footer", "about")}
                  placeholder={draft.footer.about || ph("About text")}
                  rows={3}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id={`tr-${trLang}-footer-note`}
                    label={trLang === "fr" ? "Ligne de note" : "سطر الملاحظة"}
                    value={tr.footer.note}
                    onChange={setTrField("footer", "note")}
                    placeholder={draft.footer.note || ph("Note")}
                  />
                  <TextField
                    id={`tr-${trLang}-footer-shop`}
                    label={trLang === "fr" ? "Titre colonne « boutique »" : "عنوان عمود «المتجر»"}
                    value={tr.footer.shopTitle}
                    onChange={setTrField("footer", "shopTitle")}
                    placeholder={draft.footer.shopTitle || ph("Shop")}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id={`tr-${trLang}-footer-support`}
                    label={trLang === "fr" ? "Titre colonne « assistance »" : "عنوان عمود «الدعم»"}
                    value={tr.footer.supportTitle}
                    onChange={setTrField("footer", "supportTitle")}
                    placeholder={draft.footer.supportTitle || ph("Support")}
                  />
                  <TextField
                    id={`tr-${trLang}-footer-allproducts`}
                    label={trLang === "fr" ? "Lien « tous les produits »" : "رابط «جميع المنتجات»"}
                    value={tr.footer.allProductsLabel}
                    onChange={setTrField("footer", "allProductsLabel")}
                    placeholder={draft.footer.allProductsLabel || ph("All products")}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    id={`tr-${trLang}-footer-delivery`}
                    label={trLang === "fr" ? "Lien « livraison »" : "رابط «التوصيل»"}
                    value={tr.footer.deliveryLabel}
                    onChange={setTrField("footer", "deliveryLabel")}
                    placeholder={draft.footer.deliveryLabel || ph("Delivery")}
                  />
                  <TextField
                    id={`tr-${trLang}-footer-contact`}
                    label={trLang === "fr" ? "Lien « contact »" : "رابط «تواصل»"}
                    value={tr.footer.contactLabel}
                    onChange={setTrField("footer", "contactLabel")}
                    placeholder={draft.footer.contactLabel || ph("Contact")}
                  />
                </div>
              </div>
            </div>
          );
        })()}
      </SectionCard>

      {/* j) Delivery */}
      <SectionCard icon={Truck} kicker="Delivery" title="Free shipping and wilaya fees">
        <TextField
          id="set-threshold"
          label="Free shipping threshold (DA)"
          value={draft.freeShippingThreshold}
          onChange={(v) => setDraft((d) => (d ? { ...d, freeShippingThreshold: v } : d))}
          placeholder="30000"
          inputMode="numeric"
          hint="Orders at or above this amount ship for free."
        />
        <div className="space-y-2">
          <p className="text-xs font-semibold text-white">
            Wilaya delivery fees
          </p>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-[1fr_100px_44px] gap-2 border-b border-white/8 bg-white/[0.03] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:grid-cols-[52px_1fr_130px_44px]">
              <span className="hidden sm:block">Code</span>
              <span>Wilaya</span>
              <span className="text-right">Fee (DA)</span>
              <span className="sr-only">Remove</span>
            </div>
            <div className="max-h-[420px] divide-y divide-white/5 overflow-y-auto">
              {draft.wilayas.map((w, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_100px_44px] items-center gap-2 px-3 py-2 sm:grid-cols-[52px_1fr_130px_44px]"
                >
                  <span className="hidden text-center font-mono text-[11px] font-semibold text-muted-foreground sm:block">
                    {w.code || "auto"}
                  </span>
                  <input
                    value={w.name}
                    onChange={(e) => setWilaya(i, "name", e.target.value)}
                    placeholder="Wilaya name"
                    aria-label={`Wilaya ${i + 1} name`}
                    className={inputCls}
                  />
                  <input
                    value={w.fee}
                    onChange={(e) => setWilaya(i, "fee", e.target.value)}
                    placeholder="700"
                    inputMode="numeric"
                    aria-label={`Wilaya ${i + 1} fee`}
                    className={`${inputCls} text-right`}
                  />
                  <RemoveButton
                    label={`Remove wilaya ${i + 1}`}
                    onClick={() => removeWilaya(i)}
                    disabled={draft.wilayas.length <= 1}
                  />
                </div>
              ))}
            </div>
          </div>
          <AddRowButton label="Add wilaya" onClick={addWilaya} disabled={draft.wilayas.length >= 150} />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Fees apply when an order is below the free-shipping threshold. New
            wilayas get an auto-assigned code on save.
          </p>
        </div>
      </SectionCard>

      {/* j) Security — change password */}
      <PasswordCard />

      {/* k) Backup — download full data export */}
      <BackupCard />

      {/* Save bar */}
      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-card/95 p-3 pl-4 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              dirty ? "bg-amber-400" : "bg-emerald-400"
            }`}
            aria-hidden="true"
          />
          <span className="truncate text-xs font-semibold text-muted-foreground">
            {dirty ? "Unsaved changes" : "All changes published"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={saving}
            className="h-10 rounded-full border-white/15 bg-transparent px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Reset changes
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="glow-brand h-10 rounded-full bg-brand px-5 text-xs font-bold uppercase tracking-wider hover:bg-brand-light"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Save & publish"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
