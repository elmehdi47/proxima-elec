import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/constants";
import { isValidDzPhone } from "@/lib/format";
import { orderMessage, waLink } from "@/lib/whatsapp";
import { getSettings, findWilaya } from "@/lib/site-settings";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { OrderItem } from "@prisma/client";

const createOrderSchema = z.object({
  customerName: z.string().min(3).max(80),
  phone: z.string().min(8).max(20),
  wilaya: z.string().min(2).max(60),
  address: z.string().max(200).optional(),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1)
    .max(30),
});

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 5).toUpperCase();
}

/** Error whose message is safe to show to the customer (never leaks internals). */
class OrderError extends Error {}

/** Clamp a requested quantity against the product's current stock inside the tx. */
async function reserveStock(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  productId: string,
  productName: string,
  quantity: number
): Promise<void> {
  // atomic: only decrements when enough stock remains — no oversell race
  const result = await tx.product.updateMany({
    where: { id: productId, stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  });
  if (result.count === 0) {
    const fresh = await tx.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });
    throw new OrderError(
      fresh && fresh.stock > 0
        ? `Only ${fresh.stock} left in stock for "${productName}"`
        : `"${productName}" just went out of stock`
    );
  }
}

/** POST /api/orders — public: place an order (commande) */
export async function POST(req: NextRequest) {
  // anti-spam: 6 orders per minute per IP
  const rl = rateLimit(`order:${clientIp(req)}`, 6, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many orders — please wait a moment and try again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const data = createOrderSchema.parse(body);

    if (!isValidDzPhone(data.phone)) {
      return NextResponse.json(
        { error: "Invalid Algerian phone number" },
        { status: 400 }
      );
    }

    // live settings: wilaya fees + free-shipping threshold + WhatsApp number
    const settings = await getSettings();
    const wilaya = findWilaya(settings, data.wilaya);
    if (!wilaya) {
      return NextResponse.json(
        { error: "Unknown wilaya — please choose one from the list" },
        { status: 400 }
      );
    }

    const order = await db.$transaction(async (tx) => {
      const productIds = data.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, active: true },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // Validate all products exist (stock is enforced atomically below)
      for (const item of data.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new OrderError("One of the products is no longer available");
        }
      }

      const subtotal = data.items.reduce(
        (acc, item) => acc + (productMap.get(item.productId)?.price ?? 0) * item.quantity,
        0
      );
      const deliveryFee =
        subtotal >= settings.freeShippingThreshold ? 0 : wilaya.fee;
      const total = subtotal + deliveryFee;

      const count = await tx.order.count();
      let orderNumber = `PX-${1001 + count}`;

      let created;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          created = await tx.order.create({
            data: {
              orderNumber,
              customerName: data.customerName,
              phone: data.phone,
              wilaya: data.wilaya,
              address: data.address ?? null,
              notes: data.notes ?? null,
              subtotal,
              deliveryFee,
              total,
              status: "pending",
            },
          });
          break;
        } catch {
          orderNumber = `PX-${1001 + count}-${randomSuffix()}`;
        }
      }

      if (!created) throw new OrderError("Could not create order — please retry");

      const items: OrderItem[] = [];
      for (const item of data.items) {
        const product = productMap.get(item.productId)!;
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: created.id,
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            price: product.price,
            quantity: item.quantity,
          },
        });
        items.push(orderItem);

        // atomic decrement — concurrent orders can never oversell
        await reserveStock(tx, product.id, product.name, item.quantity);
      }

      return { ...created, items };
    });

    const whatsappUrl = waLink(
      orderMessage({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        phone: order.phone,
        wilaya: order.wilaya,
        address: order.address,
        notes: order.notes,
        items: order.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
      }),
      settings.whatsappIntl
    );

    return NextResponse.json({ order, whatsappUrl }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid order data", details: error.issues },
        { status: 400 }
      );
    }
    // whitelisted customer-facing messages (stock/availability) — anything
    // else (Prisma internals etc.) never reaches the client
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}

/** GET /api/orders — admin only: list all orders */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim();

    const where: Record<string, unknown> = {};
    if (status && ORDER_STATUSES.some((s) => s.id === status)) {
      where.status = status;
    }
    if (q) {
      where.OR = [
        { customerName: { contains: q } },
        { phone: { contains: q } },
        { orderNumber: { contains: q } },
        { wilaya: { contains: q } },
      ];
    }

    const orders = await db.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
