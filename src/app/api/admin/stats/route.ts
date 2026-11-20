import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/** GET /api/admin/stats — dashboard aggregates for the admin panel */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);

    const start14 = new Date(now);
    start14.setDate(now.getDate() - 13);
    start14.setHours(0, 0, 0, 0);

    const [
      revenueAgg,
      ordersTotal,
      ordersPending,
      ordersDelivered,
      productsTotal,
      productsLowStock,
      todayAgg,
      recentOrders,
      last14Orders,
    ] = await Promise.all([
      db.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "cancelled" } },
      }),
      db.order.count(),
      db.order.count({ where: { status: "pending" } }),
      db.order.count({ where: { status: "delivered" } }),
      db.product.count(),
      db.product.count({ where: { stock: { lte: 3 } } }),
      db.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: { createdAt: { gte: startToday }, status: { not: "cancelled" } },
      }),
      db.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      db.order.findMany({
        where: { createdAt: { gte: start14 }, status: { not: "cancelled" } },
        select: { total: true, createdAt: true },
      }),
    ]);

    // Group last 14 days into a chart-friendly series
    const salesByDay: {
      date: string;
      label: string;
      orders: number;
      revenue: number;
    }[] = [];
    for (let i = 0; i < 14; i++) {
      const day = new Date(start14);
      day.setDate(start14.getDate() + i);
      const dayOrders = last14Orders.filter(
        (o) => new Date(o.createdAt).toDateString() === day.toDateString()
      );
      salesByDay.push({
        date: day.toISOString(),
        label: day.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((acc, o) => acc + o.total, 0),
      });
    }

    return NextResponse.json({
      revenue: revenueAgg._sum.total ?? 0,
      ordersTotal,
      ordersPending,
      ordersDelivered,
      productsTotal,
      productsLowStock,
      todayOrders: todayAgg._count ?? 0,
      todayRevenue: todayAgg._sum.total ?? 0,
      recentOrders,
      salesByDay,
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
