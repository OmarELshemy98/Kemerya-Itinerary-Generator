"use client";

import * as React from "react";
import { Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

/** True when the booking has an active special offer. */
export function hasOffer(offerPrice?: number | null): boolean {
  return offerPrice != null && offerPrice > 0;
}

/** The price the client actually pays (offer price when set). */
export function activePrice(
  totalPrice: number,
  offerPrice?: number | null
): number {
  return hasOffer(offerPrice) ? (offerPrice as number) : totalPrice;
}

/** Discount percentage (0 when there is no offer or the total is 0). */
export function discountPercent(
  totalPrice: number,
  offerPrice?: number | null
): number {
  if (!hasOffer(offerPrice) || !totalPrice) return 0;
  return Math.round(((totalPrice - (offerPrice as number)) / totalPrice) * 100);
}

/**
 * Price display with special-offer styling: the offer price in emerald with
 * the original price struck through next to it.
 */
export function PriceWithOffer({
  totalPrice,
  offerPrice,
  currency,
  size = "default",
}: {
  totalPrice: number;
  offerPrice?: number | null;
  currency: string;
  size?: "default" | "sm";
}) {
  if (!hasOffer(offerPrice)) {
    return (
      <span className="font-semibold">{formatCurrency(totalPrice, currency)}</span>
    );
  }
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={
          size === "sm"
            ? "text-xs text-slate-400 line-through decoration-red-400 decoration-2"
            : "text-sm text-slate-400 line-through decoration-red-400 decoration-2"
        }
      >
        {formatCurrency(totalPrice, currency)}
      </span>
      <span
        className={
          size === "sm"
            ? "inline-flex items-center gap-0.5 font-bold text-emerald-600"
            : "inline-flex items-center gap-1 text-base font-extrabold text-emerald-600"
        }
      >
        {size !== "sm" && <Tag className="h-3.5 w-3.5" />}
        {formatCurrency(offerPrice as number, currency)}
      </span>
    </span>
  );
}