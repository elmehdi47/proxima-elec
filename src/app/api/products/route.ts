import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, requireAdmin } from "@/lib/auth";

const productSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(3).max(2000),
  nameFr: z.string().max(120).nullable().optional(),
  descriptionFr: z.string().max(2000).nullable().optional(),
  nameAr: z.string().max(120).nullable().optional(),
  descriptionAr: z.string().max(2000).nullable().optional(),
  price: z.number().int().min(1),
  oldPrice: z.number().int().min(1).nullable().optional(),
  // categories are managed by the admin CMS — accept any sane slug
  category: z.string().regex(/^[a-z0-9-]{2,40}$/),
  brand: z.string().min(1).max(60).default("Proxima"),
  // http(s) links, or a path to an uploaded image served by this app —
  // blocks javascript:/data: URLs in <img src>
  image: z
    .string()
    .max(400)
    .regex(
      /^https?:\/\/.+|^\/api\/images\/[a-z0-9]+$/i,
      "Image must be an http(s) URL or an uploaded /api/images/ path"
    ),
  stock: z.number().int().min(0).max(9999).default(10),
  featured: z.boolean().default(false),
  badge: z.string().max(24).nullable().optional(),
  rating: z.number().min(0).max(5).default(4.5),
  reviewsCount: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

/** GET /api/products — public catalog (admins can include inactive) */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q")?.slice(0, 100); // bounded search term
    const featured = searchParams.get("featured");
    const includeInactive = searchParams.get("includeInactive") === "1";

    // inactive products are admin-only (security: no catalog leaks)
    if (includeInactive && !(await isAdminRequest(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where: Record<string, unknown> = {};
    if (!includeInactive) where.active = true;
    if (category && category !== "all") where.category = category;
    if (featured === "1") where.featured = true;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { nameFr: { contains: q } },
        { nameAr: { contains: q } },
        { brand: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

/** POST /api/products — admin only */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const data = productSchema.parse(body);

    const existing = await db.product.findUnique({ where: { name: data.name } });
    if (existing) {
      return NextResponse.json(
        { error: "A product with this name already exists" },
        { status: 409 }
      );
    }

    const product = await db.product.create({
      data: {
        ...data,
        oldPrice: data.oldPrice ?? null,
        badge: data.badge ?? null,
        nameFr: data.nameFr ?? null,
        descriptionFr: data.descriptionFr ?? null,
        nameAr: data.nameAr ?? null,
        descriptionAr: data.descriptionAr ?? null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid product data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
