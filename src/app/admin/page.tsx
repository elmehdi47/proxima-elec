"use client";

import { useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LoginView } from "@/components/admin/login-view";
import { AdminShell } from "@/components/admin/admin-shell";

async function checkAuth(): Promise<{ authenticated: boolean }> {
  const res = await fetch("/api/admin/auth");
  if (!res.ok) throw new Error("Auth check failed");
  return res.json();
}

export default function AdminPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-auth"],
    queryFn: checkAuth,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo.jpg"
            alt="Proxima Elec"
            width={64}
            height={64}
            className="animate-pulse rounded-xl border border-white/10"
          />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Loading admin panel...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <Image
            src="/logo.jpg"
            alt="Proxima Elec"
            width={64}
            height={64}
            className="rounded-xl border border-white/10"
          />
          <p className="text-sm font-semibold text-white">
            Could not reach the admin panel
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Check your internet connection and try again.
          </p>
          <Button
            onClick={() => void refetch()}
            className="glow-brand h-10 rounded-full bg-brand px-5 text-xs font-bold uppercase tracking-wider hover:bg-brand-light"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return data.authenticated ? <AdminShell /> : <LoginView />;
}
