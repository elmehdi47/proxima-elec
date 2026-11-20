"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, PackageSearch, Search, SearchX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteSettings, useLocale } from "@/components/store/settings-provider";
import { productName } from "@/lib/i18n";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { useUI } from "@/store/ui";

type SortId = "newest" | "price-asc" | "price-desc" | "rating";

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to load products");
  return res.json();
}

/**
 * Full catalog browser — search, category + brand filters and sorting.
 * Lives on /products; the home page shows only a short glimpse of the catalog.
 */
export function ProductsBrowser({ initialCategory }: { initialCategory?: string }) {
  const s = useSiteSettings();
  const { t, locale } = useLocale();
  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const selectedCategory = useUI((st) => st.selectedCategory);
  const setSelectedCategory = useUI((st) => st.setSelectedCategory);
  const [brand, setBrand] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortId>("newest");

  /* Deep-link support: /products?cat=x (e.g. from the footer). */
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
  }, [initialCategory, setSelectedCategory]);

  const brands = useMemo(() => {
    if (!products) return [];
    return [...new Set(products.map((p) => p.brand))].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    let list = [...products];
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (brand !== "all") {
      list = list.filter((p) => p.brand === brand);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nameFr ?? "").toLowerCase().includes(q) ||
          (p.nameAr ?? "").includes(search.trim()) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [products, selectedCategory, brand, search, sort]);

  const sortOptions: { id: SortId; label: string }[] = [
    { id: "newest", label: t("sortNewest") },
    { id: "price-asc", label: t("sortPriceAsc") },
    { id: "price-desc", label: t("sortPriceDesc") },
    { id: "rating", label: t("sortRating") },
  ];

  const reset = () => {
    setSearch("");
    setSelectedCategory("all");
    setBrand("all");
    setSort("newest");
  };

  return (
    <section id="catalog" className="container mx-auto px-4 py-10 md:py-16">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-light">
          {t("productsKicker")}
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
          <span className="text-silver">{t("productsTitle")}</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{t("productsSubtitle")}</p>
      </div>

      {/* Search */}
      <div className="mx-auto mt-8 w-full max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={s.catalog.searchPlaceholder}
            aria-label={t("searchAria")}
            className="h-11 w-full rounded-full border border-white/10 bg-secondary ps-11 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
          {[{ id: "all", label: t("all") }, ...s.categories].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                selectedCategory === cat.id
                  ? "border-brand bg-brand text-white"
                  : "border-white/10 bg-secondary text-muted-foreground hover:border-brand/40 hover:text-brand-light"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {[{ id: "all", label: t("allBrands") }, ...brands.map((b) => ({ id: b, label: b }))].map(
              (b) => (
                <button
                  key={b.id}
                  onClick={() => setBrand(b.id)}
                  title={t("brandLabel")}
                  className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition-colors ${
                    brand === b.id
                      ? "border-brand-light bg-brand/15 text-brand-light"
                      : "border-white/10 bg-secondary text-muted-foreground hover:border-brand/40 hover:text-brand-light"
                  }`}
                >
                  {b.label}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium text-muted-foreground sm:block">
              {isLoading
                ? t("loading")
                : `${filtered.length} ${
                    filtered.length === 1 ? t("productSingular") : t("productPlural")
                  }`}
            </span>
            <Select value={sort} onValueChange={(v) => setSort(v as SortId)}>
              <SelectTrigger className="h-10 w-full rounded-full border-white/10 bg-secondary text-xs font-semibold sm:w-52">
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder={t("sortBy")} />
                </div>
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-card p-10 text-center">
          <PackageSearch className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-semibold text-white">{t("noMatch")}</p>
          <p className="text-xs text-muted-foreground">{t("noMatchHint")}</p>
          <button
            onClick={reset}
            className="mt-2 rounded-full border border-white/15 px-6 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:border-brand/40 hover:text-brand-light"
          >
            {t("resetFilters")}
          </button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
