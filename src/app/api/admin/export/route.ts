import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/export — full business-data backup (JSON download).
 *
 * Downloads every product, every order (with its items) and the site
 * settings as a single JSON file. Intended as long-term insurance:
 * free database tiers are generous, but their policies can change —
 * with a recent backup the whole store can be restored onto any new
 * database in minutes.
 *
 * Triggered from Admin → Content → "Backup" card ("Download backup").
 */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const [products, orders, settings, images] = await Promise.all([
      db.product.findMany({ orderBy: { createdAt: "asc" } }),
      db.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }),
      db.siteSetting.findMany(),
      db.imageAsset.findMany({ orderBy: { createdAt: "asc" } }),
    ]);

    const backup = {
      app: "proxima-elec",
      schema: "1",
      exportedAt: new Date().toISOString(),
      counts: {
        products: products.length,
        orders: orders.length,
        images: images.length,
      },
      products,
      orders,
      settings: Object.fromEntries(settings.map((s) => [s.key, s.value])),
      images: images.map((img) => ({
        id: img.id,
        mime: img.mime,
        data: Buffer.from(img.data).toString("base64"),
      })),
    };

    const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="proxima-backup-${stamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/export error:", error);
    return NextResponse.json({ error: "Failed to build backup" }, { status: 500 });
  }
}
