"use client";

import { motion } from "framer-motion";
import { waLink } from "@/lib/whatsapp";
import { useSiteSettings, useLocale } from "@/components/store/settings-provider";
import { WhatsAppIcon } from "@/components/icons";
import { useUI } from "@/store/ui";

export function WhatsappFab() {
  const s = useSiteSettings();
  const { t } = useLocale();
  const cartOpen = useUI((s) => s.cartOpen);
  const checkoutOpen = useUI((s) => s.checkoutOpen);

  if (!s.showWhatsappFab || cartOpen || checkoutOpen) return null;

  return (
    <motion.a
      href={waLink(t("waGreeting"), s.whatsappIntl)}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 16 }}
      className="group fixed bottom-5 end-5 z-50 flex items-center gap-2.5"
      aria-label="Chat with us on WhatsApp"
    >
      <span className="pointer-events-none absolute end-full me-3 hidden whitespace-nowrap rounded-full border border-white/10 bg-popover px-3.5 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 sm:block">
        {s.header.whatsappLabel} — {s.phoneDisplay}
      </span>
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-wa/40 [animation-duration:2.5s]" aria-hidden="true" />
      <span className="grid h-13 w-13 place-items-center rounded-full bg-wa text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition-transform group-hover:scale-105">
        <WhatsAppIcon className="h-6 w-6" />
      </span>
    </motion.a>
  );
}
