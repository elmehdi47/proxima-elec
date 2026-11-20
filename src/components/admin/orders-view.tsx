"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AUTH_EXPIRED_EVENT, adminFetch } from "@/lib/admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ORDER_STATUSES, statusMeta } from "@/lib/constants";
import { formatDA, formatDateTime } from "@/lib/format";
import { adminCustomerLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";
import type { Order } from "@/lib/types";
import { OrderDetailsDialog } from "./order-details-dialog";

async function fetchOrders(status: string, q: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (q) params.set("q", q);
  const res = await adminFetch(`/api/orders?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

function playBeep() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => ctx.close();
  } catch {
    // audio not available
  }
}

export function OrdersView() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data: orders, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin-orders", status, debouncedSearch],
    queryFn: () => fetchOrders(status, debouncedSearch),
    refetchInterval: 15_000,
  });

  // New-order notification (compare latest createdAt against previous snapshot)
  const prevMaxRef = useRef<string | null>(null);
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    const maxCreated = orders.reduce(
      (max, o) => (o.createdAt > max ? o.createdAt : max),
      orders[0].createdAt
    );
    if (prevMaxRef.current !== null && maxCreated > prevMaxRef.current) {
      const fresh = orders.filter((o) => o.createdAt > (prevMaxRef.current ?? ""));
      if (fresh.length > 0) {
        playBeep();
        toast.success(
          fresh.length === 1
            ? `New command received — ${fresh[0].orderNumber} (${formatDA(fresh[0].total)})`
            : `${fresh.length} new commands received!`
        );
        void qc.invalidateQueries({ queryKey: ["admin-stats"] });
      }
    }
    prevMaxRef.current = maxCreated;
  }, [orders, qc]);

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: 0, pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
    for (const order of orders ?? []) {
      base.all++;
      if (base[order.status] !== undefined) base[order.status]++;
    }
    return base;
  }, [orders]);

  const updateStatus = async (order: Order, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Failed to update status");
        return;
      }
      toast.success(`${order.orderNumber} marked as ${statusMeta(newStatus).label.toLowerCase()}`);
      void qc.invalidateQueries({ queryKey: ["admin-orders"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
      if (selectedOrder?.id === order.id) {
        const updated: Order = await res.json();
        setSelectedOrder(updated);
      }
    } catch {
      toast.error("Network error while updating status");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/orders/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete order");
        return;
      }
      toast.success(`${deleteTarget.orderNumber} deleted`);
      setDeleteTarget(null);
      void qc.invalidateQueries({ queryKey: ["admin-orders"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch {
      toast.error("Network error while deleting");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {[{ id: "all", label: "All" }, ...ORDER_STATUSES].map((s) => {
            const meta = "classes" in s ? statusMeta(s.id) : null;
            const active = status === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStatus(s.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-white/10 bg-secondary text-muted-foreground hover:border-brand/40 hover:text-brand-light"
                }`}
              >
                {s.label}
                <span
                  className={`rounded-full px-1.5 text-[10px] ${
                    active ? "bg-white/20" : "bg-white/10"
                  } ${meta && !active ? meta.classes.split(" ")[0] : ""}`}
                >
                  {counts[s.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 lg:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, name, phone..."
              className="h-10 w-full rounded-full border border-white/10 bg-secondary pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/30"
              aria-label="Search orders"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-secondary text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand-light"
            aria-label="Refresh orders"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      ) : (orders ?? []).length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-card p-12 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold text-white">No orders found</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {status === "all" && !debouncedSearch
              ? "Commands placed on the storefront will appear here in real time."
              : "Try a different filter or search term."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-white/8 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="hidden px-4 py-3 md:table-cell">Wilaya</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Items</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(orders ?? []).map((order) => {
                  const meta = statusMeta(order.status);
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="font-mono text-xs font-bold text-brand-light hover:underline"
                        >
                          {order.orderNumber}
                        </button>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-white">{order.customerName}</p>
                        <p className="text-[11px] text-muted-foreground">{order.phone}</p>
                      </td>
                      <td className="hidden px-4 py-3.5 text-xs text-muted-foreground md:table-cell">
                        {order.wilaya}
                      </td>
                      <td className="hidden px-4 py-3.5 text-xs text-muted-foreground lg:table-cell">
                        {order.items?.length ?? 0} item{order.items?.length === 1 ? "" : "s"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-white">
                        {formatDA(order.total)}
                      </td>
                      <td className="px-4 py-3.5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider ${meta.classes}`}
                            >
                              {meta.label}
                              <ChevronDown className="h-3 w-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="border-white/10 bg-popover">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                              Set status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/10" />
                            {ORDER_STATUSES.map((s) => (
                              <DropdownMenuItem
                                key={s.id}
                                onClick={() => updateStatus(order, s.id)}
                                disabled={order.status === s.id}
                                className="gap-2 text-xs font-semibold"
                              >
                                <span className={`h-2 w-2 rounded-full ${statusMeta(s.id).classes.split(" ").find(c => c.startsWith("bg-")) ?? ""}`} />
                                {s.label}
                                {order.status === s.id && (
                                  <span className="ml-auto text-[10px] text-muted-foreground">current</span>
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={adminCustomerLink(order.phone, order.orderNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="grid h-8 w-8 place-items-center rounded-full border border-wa/40 text-wa transition-colors hover:bg-wa/10"
                            aria-label={`WhatsApp ${order.customerName}`}
                            title="Contact customer on WhatsApp"
                          >
                            <WhatsAppIcon className="h-3.5 w-3.5" />
                          </a>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-lg border border-white/10 bg-secondary px-2.5 py-1.5 text-[11px] font-bold text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand-light"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => setDeleteTarget(order)}
                            className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                            aria-label={`Delete ${order.orderNumber}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-white/8 px-4 py-3 text-[11px] text-muted-foreground">
            Showing {(orders ?? []).length} order{(orders ?? []).length === 1 ? "" : "s"} · auto-refresh every 15s
          </p>
        </div>
      )}

      {/* Details dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={updateStatus}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete {deleteTarget?.orderNumber}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This permanently removes the order and its items. Stock is NOT restored —
              use this only for test or duplicate orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/15 bg-secondary text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
