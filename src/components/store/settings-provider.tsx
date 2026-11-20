"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SETTINGS,
  resolveSettings,
  type SiteSettings,
} from "@/lib/site-settings";
import {
  dirFor,
  LOCALE_COOKIE,
  translate,
  type Locale,
  type UIKeys,
} from "@/lib/i18n";

interface SettingsContextValue {
  /** Live settings resolved for the active locale (CMS overlay applied). */
  settings: SiteSettings;
  /** Raw base settings — needed by the language switcher / admin tooling. */
  base: SiteSettings;
  /** True once /api/settings responded. */
  loaded: boolean;
  /** Active storefront language. */
  locale: Locale;
  /** Switch language (also persists it in a cookie). */
  setLocale: (locale: Locale) => void;
  /** Translate a UI chrome string. */
  t: (key: UIKeys) => string;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  base: DEFAULT_SETTINGS,
  loaded: false,
  locale: "en",
  setLocale: () => undefined,
  t: (key) => translate("en", key),
});

/**
 * Provides editable site content + the active language to the whole storefront.
 *
 * - Renders with defaults (SSR-safe), then swaps in the live CMS values once
 *   /api/settings responds — no hydration mismatch.
 * - The locale starts from the server-provided cookie value (SSR == client
 *   first render), or the store's configured default language.
 * - Arabic flips the document direction to RTL on the wrapper element.
 */
export function SiteSettingsProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  /** Locale from the visitor's cookie (server component), or null. */
  initialLocale?: Locale | null;
}) {
  const [base, setBase] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  /** Language chosen from the switcher (null until the visitor picks one). */
  const [userLocale, setUserLocale] = useState<Locale | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("settings"))))
      .then((data: SiteSettings) => {
        if (!cancelled) setBase(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Priority: visitor's pick > cookie > store default > English.
     Derived — no effect, no cascading renders. */
  const locale: Locale =
    userLocale ?? initialLocale ?? (loaded ? base.defaultLocale : "en") ?? "en";

  const setLocale = (next: Locale) => {
    setUserLocale(next);
    try {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      /* ignore */
    }
  };

  /** Settings with the FR/AR text overlay applied for the active locale. */
  const settings = useMemo(() => resolveSettings(base, locale), [base, locale]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      base,
      loaded,
      locale,
      setLocale,
      t: (key: UIKeys) => translate(locale, key),
    }),
    [settings, base, loaded, locale]
  );

  return (
    <SettingsContext.Provider value={value}>
      <div dir={dirFor(locale)} className="flex min-h-screen flex-col bg-background">
        {children}
      </div>
    </SettingsContext.Provider>
  );
}

/** Live site settings (CMS-managed from the admin panel), locale-resolved. */
export function useSiteSettings(): SiteSettings {
  return useContext(SettingsContext).settings;
}

/** Raw base settings (no locale overlay). */
export function useBaseSettings(): SiteSettings {
  return useContext(SettingsContext).base;
}

/** Active locale + switcher + UI translator. */
export function useLocale() {
  const { locale, setLocale, t } = useContext(SettingsContext);
  return { locale, setLocale, t };
}
