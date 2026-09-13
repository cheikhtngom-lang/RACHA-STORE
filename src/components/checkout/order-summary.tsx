"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { CartItem } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";

export function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
}: {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-line bg-sand/40">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex lg:hidden items-center justify-between w-full p-5 cursor-pointer"
      >
        <span className="font-sans-wide text-xs uppercase">
          Récapitulatif ({items.reduce((s, i) => s + i.quantity, 0)} articles) — {formatPrice(total)}
        </span>
        <ChevronDown size={16} className={cn("transition-transform", open && "rotate-180")} />
      </button>

      <div className={cn("lg:block", open ? "block" : "hidden")}>
        <ul className="divide-y divide-line px-5 sm:px-6">
          {items.map((item) => (
            <li key={`${item.sku}-${item.color}-${item.size}`} className="flex gap-4 py-4">
              <div className="relative h-16 w-14 shrink-0 bg-sand">
                <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-ink text-cream text-[0.62rem] flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink line-clamp-1">{item.name}</p>
                <p className="text-xs text-stone-light mt-0.5">
                  {[item.color, item.size ? `Taille ${item.size}` : null].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span className="text-sm tabular-nums shrink-0">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="px-5 sm:px-6 py-5 border-t border-line flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between text-stone">
            <span>Sous-total</span>
            <span className="tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-stone">
            <span>Livraison</span>
            <span className="tabular-nums">{shipping === 0 ? "Offerte" : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2.5 mt-1 border-t border-line">
            <span className="font-sans-wide text-xs uppercase text-ink">Total</span>
            <span className="font-display text-2xl text-ink tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
