"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Tag, BadgePercent, Calculator, Gift } from "lucide-react";
import type { Currency } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

export const round2 = (value: number) => Math.round(value * 100) / 100;

export function parseDiscountInput(raw: string, total: number): number {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const trimmed = (raw ?? "").trim();
  if (!trimmed || safeTotal <= 0) return 0;
  const normalized = trimmed.replace(/,/g, "");
  if (normalized.endsWith("%")) {
    const pct = Number(normalized.slice(0, -1).trim());
    if (!Number.isFinite(pct) || pct <= 0) return 0;
    return Math.min(safeTotal, (safeTotal * pct) / 100);
  }
  const flat = Number(normalized);
  if (!Number.isFinite(flat) || flat <= 0) return 0;
  return Math.min(safeTotal, flat);
}

export function formatDiscountValue(value: number, total: number): string {
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const safe = Number.isFinite(value) ? Math.min(Math.max(value, 0), safeTotal) : 0;
  const rounded = Math.round(safe * 100) / 100;
  return rounded > 0 ? String(rounded) : "";
}


interface PricingSectionProps {
  currency: Currency;
  totalPrice: number;
  offerPrice: number;
  discountInput: string;
  optionalTours: Array<{ title: string; price: number }>;
  specialRequestItems: Array<{ description: string; price: number }>;
}

interface FormValues {
  offerPrice: number;
  discountInput: string;
  offerTitle: string;
  offerNote: string;
  currency: Currency;
  depositPercentage: number;
}

export function PricingSection({
  currency,
  totalPrice,
  offerPrice,
  discountInput,
  optionalTours,
  specialRequestItems,
}: PricingSectionProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FormValues>();

  // Calculate extras total for live preview
  const optionalTotal = optionalTours.reduce(
    (sum, t) => sum + (Number.isFinite(t.price) && t.price > 0 ? t.price : 0),
    0
  );
  const extrasTotal = specialRequestItems.reduce(
    (sum, it) => sum + (Number.isFinite(it.price) && it.price > 0 ? it.price : 0),
    0
  );
  const grandTotal = round2(totalPrice + optionalTotal + extrasTotal);

  // 2-Way Discount binding refs
  const discountSourceRef = React.useRef<"discount" | "offer" | null>(null);
  const discountPrevRef = React.useRef<string>("");
  const offerPrevRef = React.useRef<number>(0);

  // Watch for changes to implement 2-way binding
  React.useEffect(() => {
    const disc = discountInput ?? "";
    const offer = offerPrice ?? 0;
    const base = grandTotal;

    if (discountSourceRef.current === "discount") {
      const discountValue = parseDiscountInput(disc, base);
      const newOffer = round2(base - discountValue);
      if (newOffer !== offer) {
        offerPrevRef.current = newOffer;
        setValue("offerPrice", newOffer, { shouldValidate: true });
      }
      discountPrevRef.current = disc;
      return;
    }

    if (discountSourceRef.current === "offer") {
      const diff = round2(base - offer);
      const newDisc = formatDiscountValue(diff, base);
      if (newDisc !== disc) {
        discountPrevRef.current = newDisc;
        setValue("discountInput", newDisc, { shouldValidate: true });
      }
      offerPrevRef.current = offer;
      return;
    }

    const diff2 = round2(base - (offer > 0 ? offer : 0));
    const expectedDisc = offer > 0 ? formatDiscountValue(diff2, base) : "";
    if (offer > 0 && expectedDisc !== disc && disc === discountPrevRef.current) {
      discountPrevRef.current = expectedDisc;
      setValue("discountInput", expectedDisc, { shouldValidate: true });
    }
    if (offer !== offerPrevRef.current && offer <= base && offer > 0) {
      offerPrevRef.current = offer;
    }
  }, [discountInput, offerPrice, grandTotal, setValue]);

  const offerTitle = watch("offerTitle") || "";
  const offerNote = watch("offerNote") || "";
  const hasOffer = offerPrice > 0;
  const savings = hasOffer ? round2(grandTotal - offerPrice) : 0;
  const discountPct = hasOffer && savings > 0 && grandTotal > 0
    ? Math.round((savings / grandTotal) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Label className="text-xs font-semibold text-slate-700">Currency</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={currency === "USD" ? "default" : "outline"}
            size="sm"
            onClick={() => setValue("currency", "USD" as const)}
            className="gap-1.5"
          >
            $ USD
          </Button>
          <Button
            type="button"
            variant={currency === "EUR" ? "default" : "outline"}
            size="sm"
            onClick={() => setValue("currency", "EUR" as const)}
            className="gap-1.5"
          >
            € EUR
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="flex items-center gap-2 text-slate-600">
          <Calculator className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">Grand Total Preview</span>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
          <span className="text-slate-500">Base Price:</span>
          <span className="font-semibold text-slate-700">{formatCurrency(totalPrice, currency)}</span>
          {optionalTotal > 0 && (
            <>
              <span className="text-slate-500">Optional Tours:</span>
              <span className="font-semibold text-emerald-600">+{formatCurrency(optionalTotal, currency)}</span>
            </>
          )}
          {extrasTotal > 0 && (
            <>
              <span className="text-slate-500">Extras:</span>
              <span className="font-semibold text-emerald-600">+{formatCurrency(extrasTotal, currency)}</span>
            </>
          )}
          <Separator orientation="vertical" className="h-4" />
          <span className="text-slate-700 font-bold">
            Grand Total: <span className="text-emerald-600">{formatCurrency(grandTotal, currency)}</span>
          </span>
        </div>
      </div>
      {/* Special Offer / Discount Section */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex items-center gap-2 text-slate-600">
          <Gift className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">Special Offer</span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[320px,1fr]">
          {/* Offer input */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">
                Offer Price ({currency})
              </Label>
              {hasOffer && (
                <button
                  type="button"
                  onClick={() => {
                    setValue("offerPrice", 0);
                    setValue("discountInput", "");
                  }}
                  className="text-[11px] font-semibold text-red-500 hover:underline"
                >
                  Remove offer
                </button>
              )}
            </div>

            <Input
              type="number"
              step="0.01"
              min={0}
              placeholder="0.00"
              {...register("offerPrice", {
                setValueAs: (v) =>
                  v === "" || v == null || Number.isNaN(Number(v)) ? 0 : Number(v),
                onChange: (v) => {
                  discountSourceRef.current = "offer";
                  offerPrevRef.current = Number(v) || 0;
                },
              })}
              className="mt-1.5"
            />

            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              Type the discounted price for this booking. The original price
              stays recorded as the &ldquo;total price&rdquo; for reference.
            </p>
          </div>

          {/* Discount input */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Label className="text-xs font-semibold text-slate-700">
              Discount ({currency} or %)
            </Label>
            <Input
              type="text"
              placeholder="e.g. 15% or 150"
              {...register("discountInput")}
              onChange={(e) => {
                discountSourceRef.current = "discount";
                discountPrevRef.current = e.target.value;
              }}
              className="mt-1.5 font-mono text-sm"
            />
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              Enter a percentage (e.g. &ldquo;15%&rdquo;) or a flat discount amount (e.g. &ldquo;150&rdquo;).
            </p>
          </div>
        </div>

        {/* Live offer preview */}
        {hasOffer && (
          <div className="relative mt-4 rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-[#C9A962]/15 p-5">
            <div className="absolute right-4 top-4 rotate-6 rounded-lg bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md">
              Special Offer
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
                <Tag className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest">Offer Applied</span>
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <span className="text-lg font-semibold text-slate-400 line-through decoration-red-400 decoration-[2.5px]">
                {formatCurrency(grandTotal, currency)}
              </span>
              <span className="text-3xl font-black tracking-tight text-emerald-600">
                {formatCurrency(offerPrice, currency)}
              </span>
            </div>
            {offerTitle?.trim() && (
              <p className="mt-2 text-sm font-bold text-emerald-800">{offerTitle}</p>
            )}
            {savings > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                <BadgePercent className="h-3.5 w-3.5" />
                You save {formatCurrency(savings, currency)} ({discountPct}%)
              </div>
            )}
          </div>
        )}

        {!hasOffer && (
          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-5 text-center">
            <BadgePercent className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-500">No offer on this booking</p>
          </div>
        )}
      </div>

      {/* Deposit Percentage */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Gift className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider">Booking Deposit</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="text-xs font-semibold text-slate-700">Deposit Percentage (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              {...register("depositPercentage", { valueAsNumber: true })}
              className="mt-1.5"
            />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Split Preview</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Deposit ({watch("depositPercentage") ?? 35}%)</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(
                    (hasOffer ? offerPrice : grandTotal) * ((watch("depositPercentage") ?? 35) / 100),
                    currency
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Remaining ({100 - (watch("depositPercentage") ?? 35)}%)</span>
                <span className="font-semibold text-[#1E3A8A]">
                  {formatCurrency(
                    (hasOffer ? offerPrice : grandTotal) *
                      ((100 - (watch("depositPercentage") ?? 35)) / 100),
                    currency
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Title & Note */}
      {hasOffer && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Offer Title</Label>
            <Input
              {...register("offerTitle")}
              placeholder="e.g. Early Bird Special"
              className="mt-1.5"
            />
            {errors.offerTitle && (
              <p className="mt-1 text-xs text-red-600">{errors.offerTitle.message as string}</p>
            )}
          </div>
          <div>
            <Label>Offer Note</Label>
            <Textarea
              {...register("offerNote")}
              placeholder="e.g. Valid for bookings confirmed this week..."
              rows={2}
              className="mt-1 min-h-[52px] resize-none text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

