"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useCartCount } from "@/store/cart";
import { useUI } from "@/store/ui";
import { waLink } from "@/lib/whatsapp";
import { useSiteSettings, useLocale } from "@/components/store/settings-provider";
import { WhatsAppIcon } from "@/components/icons";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const s = useSiteSettings();
  const { t } = useLocale();
  const pathname = usePathname();
  const [brandFirst = "", ...brandRest] = s.brandName.trim().split(/\s+/);
  const count = useCartCount();
  const setCartOpen = useUI((s) => s.setCartOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  // starts false (SSR-safe); the effect syncs the real scroll position once
  // mounted and on every scroll event.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** "#section" links work from every page — off-home they route to "/#section". */
  const navHref = (href: string) =>
    href.startsWith("#") && pathname !== "/" ? `/${href}` : href;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled ? "border-white/10 bg-background/85 backdrop-blur-xl" : "border-white/5 bg-background"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3" aria-label={`${s.brandName} home`}>
          <Image
            src={s.logoUrl}
            alt={`${s.brandName} logo`}
            width={40}
            height={40}
            className="rounded-lg border border-white/10"
            priority
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-sm font-black tracking-[0.22em]">
              <span className="text-silver">{brandFirst.toUpperCase()}</span>
              {brandRest.length > 0 && (
                <span className="text-brand-light">{brandRest.join(" ").toUpperCase()}</span>
              )}
            </span>
            {s.header.subLabel.trim() !== "" && (
              <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                {s.header.subLabel}
              </span>
            )}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          {s.header.navLinks.map((link) => (
            <a
              key={`${link.label}-${link.href}`}
              href={navHref(link.href)}
              className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-brand-light"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <a
            href={waLink(t("waGreeting"), s.whatsappIntl)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full border border-wa/40 px-4 py-2 text-xs font-bold text-wa transition-colors hover:bg-wa/10 sm:flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {s.header.whatsappLabel}
          </a>

          <button
            onClick={() => setCartOpen(true)}
            className="relative rounded-full border border-white/10 bg-secondary p-2.5 text-foreground transition-colors hover:border-brand/60 hover:text-brand-light"
            aria-label={`Open cart${count ? `, ${count} items` : ""}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white shadow-lg">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full border border-white/10 bg-secondary p-2.5 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-popover/95 backdrop-blur-xl md:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-4" aria-label="Mobile navigation">
            {s.header.navLinks.map((link) => (
              <a
                key={`m-${link.label}-${link.href}`}
                href={navHref(link.href)}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-semibold uppercase tracking-wider text-foreground/90 hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-secondary/60 px-3 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("langLabel")}
              </span>
              <LanguageSwitcher compact />
            </div>
            <a
              href={waLink(t("waGreeting"), s.whatsappIntl)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-wa/40 px-3 py-2.5 text-sm font-bold text-wa"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {s.header.whatsappLabel} — {s.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
