"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, PackageSearch, SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteSettings, useLocale } from "@/components/store/settings-provider";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

/**
 * Home catalog: a short, curated glimpse of the catalog.
 * Shows the first `catalog.maxOnHome` products (featured first, then newest)
 * and links to the full /products page for everything else.
 */
export function Catalog() {
  const s = useSiteSettings();
  const { t, locale } = useLocale();
  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const shown = useMemo(() => {
    if (!products) return [];
    const featured = [...products].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return featured.slice(0, Math.max(1, s.catalog.maxOnHome));
  }, [products, s.catalog.maxOnHome]);

  return (
    <section id="catalog" className="container mx-auto px-4 py-16 md:py-24">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-light">
          {s.catalog.kicker}
        </span>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          <span className="text-silver">{s.catalog.titleLine1}</span>{" "}
          <span className="text-blue-glow">{s.catalog.titleLine2}</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">{s.catalog.subtitle}</p>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/8 bg-card">
              <Skeleton className="aspect-square w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center">
          <SearchX className="h-10 w-10 text-red-400" />
          <p className="text-sm font-semibold text-red-400">{t("catalogError")}</p>
          <button
            onClick={() => refetch()}
            className="rounded-full bg-brand px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-light"
          >
            {t("retry")}
          </button>
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-card p-10 text-center">
          <PackageSearch className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-semibold text-white">{t("noMatch")}</p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}

      {/* View-all CTA */}
      <div className="mt-10 flex justify-center">
        <Link
          href="/products"
          className="glow-brand inline-flex h-12 items-center gap-2 rounded-full bg-brand px-8 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-brand-light"
        >
          {t("viewAll")}
          <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
        </Link>
      </div>
    </section>
  );
}
