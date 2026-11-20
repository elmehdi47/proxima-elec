"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Truck } from "lucide-react";
import { waLink } from "@/lib/whatsapp";
import { useSiteSettings, useLocale } from "@/components/store/settings-provider";
import { WhatsAppIcon } from "@/components/icons";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const EQ_DELAYS = ["0s", "0.15s", "0.3s", "0.45s", "0.6s", "0.75s", "0.9s"];

export function Hero() {
  const s = useSiteSettings();
  const { t } = useLocale();
  return (
    <section id="hero" className="relative overflow-hidden">
      {/* Background layers */}
      <div className="bg-grid absolute inset-0" aria-hidden="true" />
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand/20 blur-[120px]" aria-hidden="true" />
      <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-brand-dark/25 blur-[120px]" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" aria-hidden="true" />

      <div className="container relative mx-auto grid items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2 lg:py-28">
        {/* Copy */}
        <div className="max-w-xl">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-xs font-semibold text-brand-light">
              <span className="animate-pulse-dot h-2 w-2 rounded-full bg-emerald-400" />
              {s.hero.badge}
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-6 text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="text-silver">{s.hero.titleLine1}</span>
            <br />
            <span className="text-blue-glow">{s.hero.titleLine2}</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {s.hero.subtitle}
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href="#catalog"
              className="glow-brand inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-7 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-brand-light"
            >
              {s.hero.primaryCta}
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </a>
            <a
              href={waLink(t("heroWaText").replace("{name}", s.shortName), s.whatsappIntl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-wa/50 px-7 text-sm font-bold uppercase tracking-wider text-wa transition-colors hover:bg-wa/10"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {s.hero.secondaryCta}
            </a>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.32 }}
            className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6"
          >
            {s.hero.stats.map((stat, i) => (
              <div key={`${i}-${stat.label}`}>
                <div className="text-xl font-black text-white sm:text-2xl">{stat.value}</div>
                <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative"
        >
          <div className="glow-brand relative rounded-3xl border border-white/10 bg-card p-2">
            <Image
              src={s.hero.image}
              alt={s.hero.imageAlt}
              width={880}
              height={440}
              priority
              className="w-full rounded-2xl object-cover"
            />

            {/* Equalizer bars */}
            <div className="glass absolute bottom-5 start-5 flex h-9 items-end gap-1 rounded-lg px-2.5 py-2">
              {EQ_DELAYS.map((delay, i) => (
                <span
                  key={i}
                  className="eq-bar h-full w-1 rounded-sm bg-brand-light"
                  style={{ animationDelay: delay }}
                />
              ))}
            </div>
          </div>

          {/* Floating chips */}
          <div className="glass animate-floaty absolute start-4 top-6 flex items-center gap-2 rounded-xl px-3.5 py-2.5 sm:-start-6">
            <Truck className="h-4 w-4 text-brand-light" />
            <span className="text-xs font-semibold text-white">{s.hero.chipTop}</span>
          </div>
          <div
            className="glass animate-floaty absolute end-4 bottom-10 flex items-center gap-2 rounded-xl px-3.5 py-2.5 sm:-end-6"
            style={{ animationDelay: "1.6s" }}
          >
            <BadgeCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white">{s.hero.chipBottom}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
