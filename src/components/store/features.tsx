"use client";

import { motion } from "framer-motion";
import { BadgeCheck, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { useSiteSettings } from "@/components/store/settings-provider";

export function Features() {
  const s = useSiteSettings();
  return (
    <section id="features" className="container mx-auto px-4 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-light">
          {s.features.kicker}
        </span>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          <span className="text-silver">{s.features.titleLine1}</span>{" "}
          <span className="text-blue-glow">{s.features.titleLine2}</span>
        </h2>
        <p className="mt-4 text-muted-foreground">{s.features.subtitle}</p>
      </motion.div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {s.features.items.map((item, i) => {
          const Icon = [BadgeCheck, Truck, ShieldCheck, MessageCircle][i] ?? MessageCircle;
          return (
            <motion.div
              key={`${i}-${item.title}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="group rounded-2xl border border-white/8 bg-card p-6 transition-colors hover:border-brand/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand/30 bg-brand/10 text-brand-light transition-colors group-hover:bg-brand/20">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
