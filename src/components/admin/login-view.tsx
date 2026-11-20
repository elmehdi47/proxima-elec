"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function LoginView() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter the admin password.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        toast.error("Incorrect password. Please try again.");
        return;
      }
      await qc.invalidateQueries({ queryKey: ["admin-auth"] });
      toast.success("Welcome back!");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4">
      <div className="bg-grid absolute inset-0" aria-hidden="true" />
      <div className="absolute -top-24 h-72 w-72 rounded-full bg-brand/20 blur-[110px]" aria-hidden="true" />
      <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-brand-dark/25 blur-[110px]" aria-hidden="true" />

      <div className="glass relative w-full max-w-sm rounded-3xl p-8">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo.jpg"
            alt="Proxima Elec logo"
            width={72}
            height={72}
            className="rounded-2xl border border-white/10"
            priority
          />
          <div className="text-center">
            <h1 className="text-lg font-black tracking-[0.18em]">
              <span className="text-silver">PROXIMA</span>
              <span className="text-brand-light">ELEC</span>
            </h1>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Admin panel access
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="text-xs font-semibold text-white">
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="admin-password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                className="h-11 w-full rounded-xl border border-white/10 bg-secondary pl-10 pr-11 text-sm text-white placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Admin password — change it anytime from the Content tab once
              signed in.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="glow-brand h-11 w-full rounded-full bg-brand text-xs font-bold uppercase tracking-wider hover:bg-brand-light"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-brand-light"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to the store
        </Link>
      </div>
    </div>
  );
}
