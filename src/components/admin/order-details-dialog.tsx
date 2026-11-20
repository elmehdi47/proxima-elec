"use client";

import Image from "next/image";
import {
  Banknote,
  MapPin,
  Phone,
  StickyNote,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ORDER_STATUSES, statusMeta } from "@/lib/constants";
import { formatDA, formatDateTime } from "@/lib/format";
import { adminCustomerLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/icons";
import type { Order } from "@/lib/types";

export function OrderDetailsDialog({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (order: Order, status: string) => void;
}) {
  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto border-white/10 bg-card sm:rounded-3xl">
        {order && (
          <>
            <DialogHeader className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <DialogTitle className="font-mono text-lg font-black text-white">
                  {order.orderNumber}
                </DialogTitle>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusMeta(order.status).classes}`}
                >
                  {statusMeta(order.status).label}
                </span>
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {formatDateTime(order.createdAt)}
                </span>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Full command details — use the status buttons below as the order progresses.
              </DialogDescription>
            </DialogHeader>

            {/* Customer */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-secondary/60 p-4">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <User className="h-3.5 w-3.5 text-brand-light" /> Customer
                </p>
                <p className="mt-2 text-sm font-bold text-white">{order.customerName}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" /> {order.phone}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {order.wilaya}
                  {order.address ? ` — ${order.address}` : ""}
                </p>
                {order.notes && (
                  <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/8 p-2 text-xs text-amber-300">
                    <StickyNote className="mt-0.5 h-3 w-3 shrink-0" /> {order.notes}
                  </p>
                )}
                <a
                  href={adminCustomerLink(order.phone, order.orderNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-wa/40 px-4 py-2 text-xs font-bold text-wa transition-colors hover:bg-wa/10"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  Contact customer
                </a>
              </div>

              {/* Totals */}
              <div className="rounded-xl border border-white/10 bg-secondary/60 p-4">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Banknote className="h-3.5 w-3.5 text-brand-light" /> Payment (cash on delivery)
                </p>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-white">{formatDA(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold text-white">
                      {order.deliveryFee === 0 ? (
                        <span className="text-emerald-400">FREE</span>
                      ) : (
                        formatDA(order.deliveryFee)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-1.5">
                    <span className="font-bold text-white">Total</span>
                    <span className="font-black text-brand-light">{formatDA(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Items ({order.items?.length ?? 0})
              </p>
              <ul className="mt-2 divide-y divide-white/5 rounded-xl border border-white/10 bg-secondary/60">
                {(order.items ?? []).map((item) => (
                  <li key={item.id} className="flex items-center gap-3 p-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0d0d12]">
                      {item.productImage && (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          sizes="56px"
                          className="object-contain p-1"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {item.productName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDA(item.price)} x {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-black text-white">
                      {formatDA(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Status actions */}
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Update status
              </p>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onUpdateStatus(order, s.id)}
                    disabled={order.status === s.id}
                    className={`rounded-full border px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                      order.status === s.id
                        ? statusMeta(s.id).classes + " opacity-60"
                        : "border-white/10 bg-secondary text-muted-foreground hover:border-brand/40 hover:text-brand-light"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
