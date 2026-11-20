"use client";

import { Languages } from "lucide-react";
import { LOCALES } from "@/lib/i18n";
import { useLocale } from "@/components/store/settings-provider";

/**
 * EN / FR / AR switcher. Compact pill — desktop header and mobile menu.
 * The choice is stored in a cookie, so the server renders the right
 * language on the next visit (no flash, no hydration mismatch).
 */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label="Language"
      className={`flex items-center gap-0.5 rounded-full border border-white/10 bg-secondary p-0.5 ${
        compact ? "" : "shrink-0"
      }`}
    >
      {!compact && (
        <Languages className="ms-2 hidden h-3.5 w-3.5 text-muted-foreground sm:block" aria-hidden="true" />
      )}
      {LOCALES.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => setLocale(l.id)}
          aria-pressed={locale === l.id}
          title={l.native}
          className={`min-w-9 rounded-full px-2.5 py-1.5 text-[11px] font-bold tracking-wide transition-colors ${
            locale === l.id
              ? "bg-brand text-white"
              : "text-muted-foreground hover:text-brand-light"
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
