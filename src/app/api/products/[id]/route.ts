import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminRequest, requireAdmin } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().min(3).max(2000).optional(),
  nameFr: z.string().max(120).nullable().optional(),
  descriptionFr: z.string().max(2000).nullable().optional(),
  nameAr: z.string().max(120).nullable().optional(),
  descriptionAr: z.string().max(2000).nullable().optional(),
  price: z.number().int().min(1).optional(),
  oldPrice: z.number().int().min(1).nullable().optional(),
  category: z.string().regex(/^[a-z0-9-]{2,40}$/).optional(),
  brand: z.string().min(1).max(60).optional(),
  // http(s) links, or a path to an uploaded image served by this app
  image: z
    .string()
    .max(400)
    .regex(
      /^https?:\/\/.+|^\/api\/images\/[a-z0-9]+$/i,
      "Image must be an http(s) URL or an uploaded /api/images/ path"
    )
    .optional(),
  stock: z.number().int().min(0).max(9999).optional(),
  featured: z.boolean().optional(),
  badge: z.string().max(24).nullable().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewsCount: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

/** GET /api/products/[id] — public single product (inactive = admin only) */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({ where: { id } });
    // unpublished products are not exposed publicly, even by direct id
    if (!product || (!product.active && !(await isAdminRequest(req)))) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}

/** PATCH /api/products/[id] — admin only */
export async function PATCH(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    if (data.name) {
      const existing = await db.product.findFirst({
        where: { name: data.name, NOT: { id } },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Another product already uses this name" },
          { status: 409 }
        );
      }
    }

    const product = await db.product.update({ where: { id }, data });
    return NextResponse.json(product);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid product data", details: error.issues },
        { status: 400 }
      );
    }
    console.error("PATCH /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

/** DELETE /api/products/[id] — admin only */
export async function DELETE(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
