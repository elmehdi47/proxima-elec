import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/constants";

const STATUS_IDS = ORDER_STATUSES.map((s) => s.id) as [string, ...string[]];

type Params = { params: Promise<{ id: string }> };

/** GET /api/orders/[id] — admin only */
export async function GET(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}

/** PATCH /api/orders/[id] — admin only: update status */
export async function PATCH(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await req.json();
    const data = z
      .object({
        status: z.enum(STATUS_IDS),
        notes: z.string().max(500).optional(),
      })
      .parse(body);

    // Read + adjust stock + flip status inside ONE transaction, with a
    // compare-and-swap on the current status so two admins clicking at the
    // same time can never double-restore or double-reserve stock.
    const result = await db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) return { notFound: true } as const;

      // cancelling: give the reserved stock back
      if (data.status === "cancelled" && order.status !== "cancelled") {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      } else if (order.status === "cancelled" && data.status !== "cancelled") {
        // un-cancelling: re-reserve stock — abort if not enough is available
        for (const item of order.items) {
          if (item.productId) {
            const dec = await tx.product.updateMany({
              where: { id: item.productId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (dec.count === 0) {
              return {
                insufficient: `"${item.productName}" no longer has enough stock to re-reserve`,
              } as const;
            }
          }
        }
      }

      // CAS: only apply when the status we acted on is still current
      const flipped = await tx.order.updateMany({
        where: { id, status: order.status },
        data: { status: data.status },
      });
      if (flipped.count === 0) return { conflict: true } as const;

      if (data.notes !== undefined) {
        await tx.order.update({ where: { id }, data: { notes: data.notes } });
      }

      return {
        order: await tx.order.findUnique({ where: { id }, include: { items: true } }),
      } as const;
    });

    if ("notFound" in result) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if ("insufficient" in result) {
      return NextResponse.json({ error: result.insufficient }, { status: 400 });
    }
    if ("conflict" in result) {
      return NextResponse.json(
        { error: "Order was changed by someone else — refresh and retry" },
        { status: 409 }
      );
    }

    return NextResponse.json(result.order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

/** DELETE /api/orders/[id] — admin only */
export async function DELETE(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await params;
    await db.order.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
