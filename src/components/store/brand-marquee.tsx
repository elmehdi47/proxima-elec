"use client";

import { useSiteSettings } from "@/components/store/settings-provider";

export function BrandMarquee() {
  const s = useSiteSettings();
  const doubled = [...s.brandsMarquee, ...s.brandsMarquee];
  return (
    <section aria-label="Brands we carry" className="overflow-hidden border-y border-white/5 bg-secondary/40 py-5">
      <div className="animate-marquee flex w-max">
        {doubled.map((brand, i) => (
          <span
            key={`${brand}-${i}`}
            className="mx-8 whitespace-nowrap text-lg font-black tracking-[0.3em] text-white/25"
          >
            {brand}
          </span>
        ))}
      </div>
    </section>
  );
}
