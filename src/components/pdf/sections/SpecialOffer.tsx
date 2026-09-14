"use client";
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { formatCurrency } from "@/lib/utils";
import type { BookingConfig } from "@/types";

interface Ctx {
  S: typeof S;
  label: (k: string, fb: string) => string;
  headingStyle: Record<string, string>;
  cinzelStyle: Record<string, string>;
}

interface Props {
  ctx: Ctx;
  booking: BookingConfig;
  sectionNumber: string;
}

export function SpecialOffer({ ctx, booking, sectionNumber }: Props) {
  const { S: styles, label, cinzelStyle } = ctx;
  const offerPrice = booking.offerPrice ?? 0;
  if (!offerPrice || offerPrice <= 0) return null;

  const total = booking.totalPrice;
  const savings = total - offerPrice;
  const pct = total > 0 ? Math.round((savings / total) * 100) : 0;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader} wrap={false}>
        <View style={styles.sectionNum}><Text style={styles.sectionNumText}>{sectionNumber}</Text></View>
        <Text style={styles.sectionTitle}>{label("offer.special", "Special Offer")}</Text>
      </View>
      <View style={styles.offerBanner} wrap={false}>
        <View style={styles.offerBadge}><Text style={styles.offerBadgeText}>{pct}% OFF</Text></View>
        <View style={styles.offerBody}>
          <Text style={[styles.offerTitle, cinzelStyle]}>{booking.offerTitle || label("offer.special.title", "Exclusive Tour Offer")}</Text>
          {booking.offerNote && <Text style={styles.offerNote}>{booking.offerNote}</Text>}
          <View style={styles.offerPriceRow}>
            <Text style={styles.offerOld}>{formatCurrency(total, booking.currency)}</Text>
            <Text style={styles.offerNew}>{formatCurrency(offerPrice, booking.currency)}</Text>
            <Text style={styles.offerSave}>Save {formatCurrency(savings, booking.currency)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
