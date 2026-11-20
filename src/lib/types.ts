export interface Product {
  id: string;
  name: string;
  description: string;
  /** Optional French / Arabic translations — fall back to the base fields. */
  nameFr: string | null;
  descriptionFr: string | null;
  nameAr: string | null;
  descriptionAr: string | null;
  price: number;
  oldPrice: number | null;
  category: string;
  brand: string;
  image: string;
  stock: number;
  featured: boolean;
  badge: string | null;
  rating: number;
  reviewsCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartLine {
  productId: string;
  name: string;
  /** Name snapshot per language — resolves to the active locale at render. */
  names?: { en: string; fr: string; ar: string };
  price: number;
  image: string;
  quantity: number;
  /** Stock snapshot at add time — the cart clamps quantity to it. */
  stock?: number;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productName: string;
  productImage: string | null;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  wilaya: string;
  address: string | null;
  notes: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items?: OrderItem[];
}

export interface AdminStats {
  revenue: number;
  ordersTotal: number;
  ordersPending: number;
  ordersDelivered: number;
  productsTotal: number;
  productsLowStock: number;
  todayOrders: number;
  todayRevenue: number;
  recentOrders: Order[];
  salesByDay: { date: string; label: string; orders: number; revenue: number }[];
}

export interface CheckoutPayload {
  customerName: string;
  phone: string;
  wilaya: string;
  address?: string;
  notes?: string;
  items: { productId: string; quantity: number }[];
}

export interface CreatedOrder {
  order: Order;
  whatsappUrl: string;
}
