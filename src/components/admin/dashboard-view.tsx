"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Banknote,
  ClipboardList,
  Clock,
  Package,
  PackageX,
  TrendingUp,
  Truck,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-api";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDA, timeAgo } from "@/lib/format";
import { statusMeta } from "@/lib/constants";
import type { AdminStats } from "@/lib/types";

async function fetchStats(): Promise<AdminStats> {
  const res = await adminFetch("/api/admin/stats");
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof Banknote;
  label: string;
  value: string;
  sub?: string;
  tone: "brand" | "green" | "amber" | "violet" | "red" | "neutral";
}) {
  const tones: Record<string, string> = {
    brand: "border-brand/30 bg-brand/10 text-brand-light",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    violet: "border-violet-500/30 bg-violet-500/10 text-violet-400",
    red: "border-red-500/30 bg-red-500/10 text-red-400",
    neutral: "border-white/15 bg-white/5 text-white",
  };
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/8 bg-card p-5">
      <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate text-xl font-black text-white sm:text-2xl">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export function DashboardView({ onGoOrders }: { onGoOrders: () => void }) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchStats,
    refetchInterval: 30_000,
  });

  if (isLoading || !stats) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Banknote}
          label="Total revenue"
          value={formatDA(stats.revenue)}
          sub="Excluding cancelled orders"
          tone="brand"
        />
        <StatCard
          icon={TrendingUp}
          label="Today"
          value={formatDA(stats.todayRevenue)}
          sub={`${stats.todayOrders} order${stats.todayOrders === 1 ? "" : "s"} today`}
          tone="green"
        />
        <StatCard
          icon={Clock}
          label="Pending orders"
          value={String(stats.ordersPending)}
          sub="Awaiting confirmation"
          tone="amber"
        />
        <StatCard
          icon={Truck}
          label="Delivered"
          value={String(stats.ordersDelivered)}
          sub={`out of ${stats.ordersTotal} total orders`}
          tone="violet"
        />
        <StatCard
          icon={ClipboardList}
          label="Products"
          value={String(stats.productsTotal)}
          sub="In the catalog"
          tone="neutral"
        />
        <StatCard
          icon={PackageX}
          label="Low stock"
          value={String(stats.productsLowStock)}
          sub="3 units or fewer left"
          tone="red"
        />
        <StatCard
          icon={Package}
          label="All-time orders"
          value={String(stats.ordersTotal)}
          sub="Since launch"
          tone="neutral"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. order"
          value={formatDA(stats.ordersTotal > 0 ? Math.round(stats.revenue / stats.ordersTotal) : 0)}
          sub="Per order value"
          tone="brand"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/8 bg-card p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Revenue — last 14 days</h3>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              DA
            </span>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesByDay} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2e9bff" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#2e9bff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9aa1ac", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: "#9aa1ac", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(46,155,255,0.3)" }}
                  contentStyle={{
                    background: "#15151c",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#f2f4f8" }}
                  itemStyle={{ color: "#2e9bff" }}
                  formatter={(value: number | string) => [formatDA(Number(value)), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2e9bff"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Orders — last 14 days</h3>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.salesByDay} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9aa1ac", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#9aa1ac", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(46,155,255,0.08)" }}
                  contentStyle={{
                    background: "#15151c",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#f2f4f8" }}
                  itemStyle={{ color: "#2e9bff" }}
                  formatter={(value: number | string) => [String(value), "Orders"]}
                />
                <Bar dataKey="orders" fill="#1e6fe0" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-white/8 bg-card">
        <div className="flex items-center justify-between border-b border-white/8 p-5">
          <h3 className="text-sm font-bold text-white">Latest commands</h3>
          <button
            onClick={onGoOrders}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-light transition-colors hover:text-white"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <ul className="divide-y divide-white/5">
          {stats.recentOrders.length === 0 && (
            <li className="p-8 text-center text-sm text-muted-foreground">
              No orders yet — share your store link to start receiving commands!
            </li>
          )}
          {stats.recentOrders.map((order) => {
            const meta = statusMeta(order.status);
            return (
              <li
                key={order.id}
                className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
              >
                <span className="font-mono text-xs font-bold text-brand-light">
                  {order.orderNumber}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                  {order.customerName}
                </span>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {order.items?.length ?? 0} item{order.items?.length === 1 ? "" : "s"}
                </span>
                <span className="hidden text-xs text-muted-foreground md:inline">
                  {order.wilaya}
                </span>
                <span className="text-sm font-black text-white">{formatDA(order.total)}</span>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${meta.classes}`}
                >
                  {meta.label}
                </span>
                <span className="w-14 text-right text-[11px] text-muted-foreground">
                  {timeAgo(order.createdAt)}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-white/8 p-4 text-center">
          <Link
            href="/"
            target="_blank"
            className="text-xs font-semibold text-muted-foreground transition-colors hover:text-brand-light"
          >
            Open the storefront in a new tab
          </Link>
        </div>
      </div>
    </div>
  );
}
