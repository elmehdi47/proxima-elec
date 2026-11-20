"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AUTH_EXPIRED_EVENT } from "@/lib/admin-api";
import { useUI } from "@/store/ui";
import { DashboardView } from "./dashboard-view";
import { OrdersView } from "./orders-view";
import { ProductsView } from "./products-view";
import { SettingsView } from "./settings-view";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "products", label: "Products", icon: Package },
  { id: "content", label: "Content", icon: SlidersHorizontal },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminShell() {
  const [tab, setTab] = useState<TabId>("dashboard");
  const qc = useQueryClient();

  /* Any admin API replying 401 means the session expired or was revoked —
     go straight back to the login view instead of showing empty data. */
  useEffect(() => {
    const onExpired = () => {
      qc.clear();
      qc.setQueryData(["admin-auth"], { authenticated: false });
      toast.error("Your session expired — please sign in again.");
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [qc]);

  /* Guard: never silently discard an unsaved CMS draft. */
  const switchTab = (next: TabId) => {
    if (next === tab) return;
    if (useUI.getState().cmsDirty) {
      const proceed = window.confirm(
        "You have unsaved changes in the Content tab.\nLeaving now will discard them. Continue?"
      );
      if (!proceed) return;
      useUI.getState().setCmsDirty(false);
    }
    setTab(next);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore network errors on logout
    }
    qc.clear();
    qc.setQueryData(["admin-auth"], { authenticated: false });
    toast.success("Signed out.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/85 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Proxima Elec logo"
              width={36}
              height={36}
              className="rounded-lg border border-white/10"
            />
            <div className="leading-none">
              <span className="text-xs font-black tracking-[0.2em]">
                <span className="text-silver">PROXIMA</span>
                <span className="text-brand-light">ELEC</span>
              </span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.26em] text-brand-light">
                Admin panel
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 sm:flex">
              <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </span>
            <Link
              href="/"
              target="_blank"
              className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-secondary px-3.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-brand/50 hover:text-brand-light"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View store</span>
              <span className="sm:hidden">Store</span>
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 rounded-full border-white/10 bg-secondary text-muted-foreground hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="container mx-auto flex gap-1.5 overflow-x-auto px-4 pb-3" aria-label="Admin sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                tab === t.id
                  ? "border-brand bg-brand text-white"
                  : "border-white/10 bg-secondary text-muted-foreground hover:border-brand/40 hover:text-brand-light"
              }`}
              aria-current={tab === t.id ? "page" : undefined}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="container mx-auto w-full flex-1 px-4 py-6">
        {tab === "dashboard" && <DashboardView onGoOrders={() => setTab("orders")} />}
        {tab === "orders" && <OrdersView />}
        {tab === "products" && <ProductsView />}
        {tab === "content" && <SettingsView />}
      </main>

      <footer className="mt-auto border-t border-white/5 py-4">
        <p className="container mx-auto px-4 text-center text-[11px] text-muted-foreground">
          Proxima Elec admin — orders refresh automatically every 15 seconds.
        </p>
      </footer>
    </div>
  );
}
