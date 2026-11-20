"use client";

import { motion } from "framer-motion";
import { waLink } from "@/lib/whatsapp";
import { useSiteSettings, useLocale } from "@/components/store/settings-provider";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons";

export function ContactSection() {
  const s = useSiteSettings();
  const { t } = useLocale();

  const channels = [
    {
      title: "WhatsApp",
      subtitle: s.phoneDisplay,
      desc: s.contact.whatsappDesc,
      cta: t("ctaChat"),
      href: waLink(t("waGreeting"), s.whatsappIntl),
      icon: WhatsAppIcon,
      accent: "text-wa border-wa/40 hover:bg-wa/10 hover:border-wa/70",
      iconBox: "border-wa/30 bg-wa/10 text-wa",
    },
    {
      title: "Instagram",
      subtitle: s.instagramHandle,
      desc: s.contact.instagramDesc,
      cta: t("ctaFollow"),
      href: s.instagram,
      icon: InstagramIcon,
      accent: "text-pink-400 border-pink-400/40 hover:bg-pink-400/10 hover:border-pink-400/70",
      iconBox: "border-pink-400/30 bg-pink-400/10 text-pink-400",
    },
    {
      title: "Facebook",
      subtitle: s.brandName,
      desc: s.contact.facebookDesc,
      cta: t("ctaVisit"),
      href: s.facebook,
      icon: FacebookIcon,
      accent: "text-sky-400 border-sky-400/40 hover:bg-sky-400/10 hover:border-sky-400/70",
      iconBox: "border-sky-400/30 bg-sky-400/10 text-sky-400",
    },
  ].filter((channel) => channel.href !== "");

  return (
    <section id="contact" className="border-t border-white/5 bg-secondary/30">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-light">
            {s.contact.kicker}
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            <span className="text-silver">{s.contact.titleLine1}</span>{" "}
            <span className="text-blue-glow">{s.contact.titleLine2}</span>
          </h2>
          <p className="mt-4 text-muted-foreground">{s.contact.subtitle}</p>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {channels.map((channel, i) => (
            <motion.a
              key={channel.title}
              href={channel.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group flex flex-col rounded-2xl border border-white/8 bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand/40"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border ${channel.iconBox}`}
              >
                <channel.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{channel.title}</h3>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-light">
                {channel.subtitle}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {channel.desc}
              </p>
              <span
                className={`mt-5 inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${channel.accent}`}
              >
                {channel.cta}
              </span>
            </motion.a>
          ))}
        </div>

        <p className="mt-8 text-center text-xs font-medium text-muted-foreground">
          {s.contact.hoursLine}
        </p>
      </div>
    </section>
  );
}
