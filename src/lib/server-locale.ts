import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE, type Locale } from "./i18n";

/**
 * Read the visitor's language choice (set by the storefront switcher).
 * Server components pass this to <SiteSettingsProvider initialLocale> so the
 * first render — server and client alike — already uses the right language.
 */
export async function getInitialLocale(): Promise<Locale | null> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value ?? null;
  return isLocale(value) ? value : null;
}
