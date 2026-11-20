"use client";

import { Hero } from "@/components/store/hero";
import { BrandMarquee } from "@/components/store/brand-marquee";
import { Features } from "@/components/store/features";
import { Catalog } from "@/components/store/catalog";
import { ContactSection } from "@/components/store/contact-section";
import { useSiteSettings } from "@/components/store/settings-provider";
import type { ComponentType } from "react";

/**
 * Renders the home-page sections in the exact order (and visibility)
 * configured from the admin panel (Admin → Content → Layout).
 * Unknown / not-yet-loaded ids fall back to the default order.
 */
const SECTION_COMPONENTS: Record<string, ComponentType> = {
  hero: Hero,
  marquee: BrandMarquee,
  features: Features,
  catalog: Catalog,
  contact: ContactSection,
};

export function HomeSections() {
  const s = useSiteSettings();

  return (
    <>
      {s.sections.map((section) => {
        const Component = SECTION_COMPONENTS[section.id];
        if (!Component || !section.visible) return null;
        return <Component key={section.id} />;
      })}
    </>
  );
}
