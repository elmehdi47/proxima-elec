import { PrismaClient } from "@prisma/client";
import { wilayaFee, BRAND } from "../src/lib/constants";

const db = new PrismaClient();

interface DemoOrder {
  orderNumber: string;
  daysAgo: number;
  hoursAgo: number;
  customerName: string;
  phone: string;
  wilaya: string;
  address: string;
  status: string;
  items: { name: string; quantity: number }[];
}

const demoOrders: DemoOrder[] = [
  {
    orderNumber: "PX-1001",
    daysAgo: 12,
    hoursAgo: 5,
    customerName: "Yacine Belkacem",
    phone: "0550123456",
    wilaya: "Alger",
    address: "Hydra",
    status: "delivered",
    items: [{ name: "JBL Flip 6 Bluetooth Speaker", quantity: 1 }],
  },
  {
    orderNumber: "PX-1002",
    daysAgo: 10,
    hoursAgo: 2,
    customerName: "Amine Cherif",
    phone: "0661234567",
    wilaya: "Oran",
    address: "Bir El Djir",
    status: "delivered",
    items: [{ name: "Apple AirPods Pro 2 (USB-C)", quantity: 1 }],
  },
  {
    orderNumber: "PX-1003",
    daysAgo: 9,
    hoursAgo: 8,
    customerName: "Sarah Boumediene",
    phone: "0770123456",
    wilaya: "Constantine",
    address: "El Khroub",
    status: "delivered",
    items: [
      { name: "JBL Tune 770NC Wireless Headphones", quantity: 1 },
      { name: "JBL Wave Buds 2 True Wireless Earbuds", quantity: 1 },
    ],
  },
  {
    orderNumber: "PX-1004",
    daysAgo: 8,
    hoursAgo: 3,
    customerName: "Mehdi Larbi",
    phone: "0557123456",
    wilaya: "Sétif",
    address: "El Eulma",
    status: "confirmed",
    items: [{ name: "Sony WH-CH720N Wireless Headphones", quantity: 1 }],
  },
  {
    orderNumber: "PX-1005",
    daysAgo: 6,
    hoursAgo: 6,
    customerName: "Nour Haddad",
    phone: "0669123456",
    wilaya: "Béjaïa",
    address: "Tichy",
    status: "shipped",
    items: [{ name: "Marshall Emberton II Portable Speaker", quantity: 1 }],
  },
  {
    orderNumber: "PX-1006",
    daysAgo: 4,
    hoursAgo: 1,
    customerName: "Ilyes Ferhat",
    phone: "0778123456",
    wilaya: "Blida",
    address: "Boufarik",
    status: "pending",
    items: [{ name: "Apple AirPods (3rd Generation)", quantity: 1 }],
  },
  {
    orderNumber: "PX-1007",
    daysAgo: 2,
    hoursAgo: 4,
    customerName: "Rania Mansouri",
    phone: "0555123456",
    wilaya: "Tizi Ouzou",
    address: "Draa Ben Khedda",
    status: "confirmed",
    items: [{ name: "Proxima Mini LED Projector FHD 1080p", quantity: 1 }],
  },
  {
    orderNumber: "PX-1008",
    daysAgo: 0,
    hoursAgo: 2,
    customerName: "Karim Slimani",
    phone: "0663123456",
    wilaya: "Alger",
    address: "Kouba",
    status: "pending",
    items: [{ name: "Xiaomi Redmi Buds 5", quantity: 2 }],
  },
];

async function main() {
  // Clean slate for orders (restores nothing — stock stays as seeded)
  await db.order.deleteMany({});

  for (const demo of demoOrders) {
    const items: {
      productId: string;
      productName: string;
      productImage: string;
      price: number;
      quantity: number;
    }[] = [];
    let subtotal = 0;
    for (const line of demo.items) {
      const product = await db.product.findUnique({ where: { name: line.name } });
      if (!product) throw new Error(`Product not found: ${line.name}`);
      items.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: line.quantity,
      });
      subtotal += product.price * line.quantity;
    }
    const deliveryFee = subtotal >= BRAND.freeShippingThreshold ? 0 : wilayaFee(demo.wilaya);
    const createdAt = new Date(
      Date.now() - demo.daysAgo * 86_400_000 - demo.hoursAgo * 3_600_000
    );

    await db.order.create({
      data: {
        orderNumber: demo.orderNumber,
        customerName: demo.customerName,
        phone: demo.phone,
        wilaya: demo.wilaya,
        address: demo.address,
        notes: null,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        status: demo.status,
        createdAt,
        items: {
          create: items,
        },
      },
    });
    console.log(`Created ${demo.orderNumber} — ${demo.customerName} (${demo.status})`);
  }

  const count = await db.order.count();
  console.log(`Total orders in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
