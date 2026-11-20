"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
import { useSiteSettings, useLocale } from "@/components/store/settings-provider";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { useUI } from "@/store/ui";

export function SiteFooter() {
  const s = useSiteSettings();
  const { t } = useLocale();
  const router = useRouter();
  const [brandFirst = "", ...brandRest] = s.brandName.trim().split(/\s+/);
  const setSelectedCategory = useUI((s) => s.setSelectedCategory);

  /** Category links jump to the full products page with the filter applied. */
  const goToCategory = (id: string) => {
    setSelectedCategory(id);
    router.push("/products");
  };

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#070709]">
      <div className="container mx-auto px-4 pb-24 pt-12 sm:pb-20">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src={s.logoUrl}
                alt={`${s.brandName} logo`}
                width={48}
                height={48}
                className="rounded-lg border border-white/10"
              />
              <span className="text-base font-black tracking-[0.22em]">
                <span className="text-silver">{brandFirst.toUpperCase()}</span>
                {brandRest.length > 0 && (
                  <span className="text-brand-light">{brandRest.join(" ").toUpperCase()}</span>
                )}
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {s.footer.about}
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <a
                href={waLink(t("waGreeting"), s.whatsappIntl)}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-10 w-10 place-items-center rounded-full border border-wa/40 text-wa transition-colors hover:bg-wa/10"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppIcon className="h-4.5 w-4.5" />
              </a>
              {s.instagram !== "" && (
                <a
                  href={s.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full border border-pink-400/40 text-pink-400 transition-colors hover:bg-pink-400/10"
                  aria-label="Follow us on Instagram"
                >
                  <InstagramIcon className="h-4.5 w-4.5" />
                </a>
              )}
              {s.facebook !== "" && (
                <a
                  href={s.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full border border-sky-400/40 text-sky-400 transition-colors hover:bg-sky-400/10"
                  aria-label="Visit our Facebook page"
                >
                  <FacebookIcon className="h-4.5 w-4.5" />
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          <nav aria-label="Shop categories">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
              {s.footer.shopTitle}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {s.categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => goToCategory(cat.id)}
                    className="text-sm text-muted-foreground transition-colors hover:text-brand-light"
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
              <li>
                <Link href="/products" className="text-sm text-muted-foreground transition-colors hover:text-brand-light">
                  {s.footer.allProductsLabel}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support links">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
              {s.footer.supportTitle}
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={waLink(t("supportText"), s.whatsappIntl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-brand-light"
                >
                  WhatsApp — {s.phoneDisplay}
                </a>
              </li>
              <li>
                <Link href="/#features" className="text-sm text-muted-foreground transition-colors hover:text-brand-light">
                  {s.footer.deliveryLabel}
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-sm text-muted-foreground transition-colors hover:text-brand-light">
                  {s.footer.contactLabel}
                </Link>
              </li>
              {s.footer.showAdminLink && (
                <li>
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-brand-light"
                  >
                    <Lock className="h-3 w-3" />
                    {s.footer.adminLabel}
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} {s.brandName}. {t("rightsReserved")}
          </span>
          <span>{s.footer.note}</span>
        </div>
      </div>
    </footer>
  );
}
