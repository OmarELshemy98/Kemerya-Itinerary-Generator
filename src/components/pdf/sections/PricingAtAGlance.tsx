"use client";
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { SunIcon } from "../pdf-primitives";
import { formatCurrency } from "@/lib/utils";
import type { BookingConfig, Currency } from "@/types";

interface Ctx {
  S: typeof S;
  label: (k: string, fb: string) => string;
  headingStyle: Record<string, string>;
  cinzelStyle: Record<string, string>;
}

interface Props {
  ctx: Ctx;
  booking: BookingConfig;
  /** Localized traveler composition, e.g. "1 Adult, 2 Children" (from itinerary-pdf) */
  travelersText?: string;
  sectionNumber: string;
}

/** Non-refundable booking deposit and the balance paid upon arrival. */
const DEPOSIT_RATE = 0.35;
const BALANCE_RATE = 0.65;

/** Currency-safe rounding to 2 decimals (cents). */
const round2 = (value: number) => Math.round(value * 100) / 100;

interface PricingRow {
  key: string;
  label: string;
  value: React.ReactNode;
  caption?: string;
  /** Emphasized row (PACKAGE TOTAL) — tinted background + scarab caption. */
  emphasize?: boolean;
}

/** Every figure shown in PRICING AT A GLANCE (pure — fully unit-testable). */
export interface PricingBreakdown {
  currency: Currency;
  /** Original package total as entered on the booking form. */
  listTotal: number;
  /** Price the client actually pays (offer price when an offer exists). */
  finalTotal: number;
  hasOffer: boolean;
  savings: number;
  discountPct: number;
  /** Total travelers (adults + children + infants) — never below 1. */
  travelers: number;
  perPerson: number;
  deposit: number;
  remaining: number;
}

/**
 * Computes the financial breakdown of a booking:
 *  - the final total (offer price replaces the list price),
 *  - the per-person share of that final total,
 *  - the 35% booking deposit and the 65% balance paid upon arrival.
 */
export function computePricing(booking: BookingConfig): PricingBreakdown {
  const currency: Currency = booking.currency;
  const listTotal = Number.isFinite(booking.totalPrice) ? booking.totalPrice : 0;
  const offerPrice = booking.offerPrice ?? 0;
  const hasOffer = offerPrice > 0;
  const finalTotal = hasOffer ? offerPrice : listTotal;

  const travelers = Math.max(
    1,
    (booking.travelers?.adults || 0) + (booking.travelers?.children || 0) + (booking.travelers?.infants || 0)
  );
  // A manual per-person override wins only when there is no offer (an offer
  // re-prices the whole package, so the per-person figure must follow it).
  const manualPerPerson = !hasOffer && booking.pricePerPerson && booking.pricePerPerson > 0 ? booking.pricePerPerson : 0;

  const savings = round2(listTotal - finalTotal);

  return {
    currency,
    listTotal,
    finalTotal,
    hasOffer,
    savings,
    discountPct: listTotal > 0 && savings > 0 ? Math.round((savings / listTotal) * 100) : 0,
    travelers,
    perPerson: manualPerPerson > 0 ? manualPerPerson : finalTotal / travelers,
    deposit: round2(finalTotal * DEPOSIT_RATE),
    remaining: round2(finalTotal * BALANCE_RATE),
  };
}

/**
 * PRICING AT A GLANCE — the itinerary's financial breakdown table.
 *
 * Four rows, all derived from the booking at render time:
 *  1. PACKAGE TOTAL       → total (or struck-through total + offer price when an offer exists)
 *  2. PRICE PER PERSON    → final total ÷ total travelers, with the traveler breakdown
 *  3. 35% BOOKING DEPOSIT → 35% of the final total (offer price when an offer exists)
 *  4. REMAINING 65%       → 65% of the final total
 */
export function PricingAtAGlance({ ctx, booking, travelersText, sectionNumber }: Props) {
  const { S: styles, label } = ctx;
  const {
    currency,
    listTotal,
    finalTotal,
    hasOffer,
    savings,
    discountPct,
    travelers,
    perPerson,
    deposit,
    remaining,
  } = computePricing(booking);

  const composition =
    travelersText?.trim() ||
    `${travelers} ${label(travelers > 1 ? "general.guests" : "general.guest", travelers > 1 ? "Guests" : "Guest")}`;
  const perPersonUnit = label("pricing.perPersonUnit", "per person");

  const rows: PricingRow[] = [
    {
      key: "package-total",
      label: label("pricing.packageTotal", "PACKAGE TOTAL"),
      emphasize: true,
      value: hasOffer ? (
        <View style={styles.pricingOfferRow}>
          <Text style={styles.pricingOldValue}>{formatCurrency(listTotal, currency)}</Text>
          <Text style={styles.pricingOfferValue}>{formatCurrency(finalTotal, currency)}</Text>
        </View>
      ) : (
        <Text style={styles.pricingValueBig}>{formatCurrency(listTotal, currency)}</Text>
      ),
      caption: hasOffer && savings > 0
        ? `${label("offer.save", "Save")} ${formatCurrency(savings, currency)}${discountPct > 0 ? ` (${discountPct}% ${label("general.off", "OFF")})` : ""}`
        : undefined,
    },
    {
      key: "per-person",
      label: label("pricing.perPerson", "PRICE PER PERSON"),
      value: <Text style={styles.pricingValue}>{formatCurrency(perPerson, currency)}</Text>,
      caption: `${perPersonUnit} × ${composition}`,
    },
    {
      key: "deposit",
      label: label("pricing.bookingDeposit", "35% BOOKING DEPOSIT"),
      value: <Text style={styles.pricingValue}>{formatCurrency(deposit, currency)}</Text>,
      caption: `35% × ${formatCurrency(finalTotal, currency)}`,
    },
    {
      key: "remaining",
      label: label("pricing.remainingBalance", "REMAINING 65%"),
      value: <Text style={styles.pricingValue}>{formatCurrency(remaining, currency)}</Text>,
      caption: `65% × ${formatCurrency(finalTotal, currency)}`,
    },
  ];

  const offerTitle = booking.offerTitle?.trim();
  const offerNote = booking.offerNote?.trim();

  return (
    <View style={styles.section} wrap={false}>
      <View style={styles.sectionHeader} wrap={false} minPresenceAhead={60}>
        <View style={styles.sectionNum}><Text style={styles.sectionNumText}>{sectionNumber}</Text></View>
        <View style={styles.sectionIcon}><SunIcon s={12} /></View>
        <Text style={styles.sectionTitle}>{label("section.pricingGlance", "PRICING AT A GLANCE")}</Text>
      </View>

      {/* Offer headline / note (editable on the booking form) — rendered only when an offer is active */}
      {hasOffer && (offerTitle || offerNote) && (
        <View style={styles.pricingOfferNotes} wrap={false}>
          {offerTitle ? <Text style={styles.pricingOfferTitle}>{offerTitle}</Text> : null}
          {offerNote ? <Text style={styles.pricingOfferNote}>{offerNote}</Text> : null}
        </View>
      )}

      <View style={styles.pricingTable} wrap={false}>
        {rows.map((row, i) => (
          <View
            key={row.key}
            wrap={false}
            style={[
              styles.pricingRow,
              i % 2 === 1 ? styles.pricingRowAlt : {},
              row.emphasize ? styles.pricingRowTotal : {},
              i === rows.length - 1 ? styles.pricingRowLast : {},
            ]}
          >
            <Text style={styles.pricingLabel}>{row.label}</Text>
            <View style={styles.pricingValueBlock}>
              {row.value}
              {row.caption ? (
                <Text style={[styles.pricingValueSub, row.emphasize ? styles.pricingSave : {}]}>{row.caption}</Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}