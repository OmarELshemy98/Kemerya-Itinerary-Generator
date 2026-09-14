"use client";
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { SunIcon, CompassIcon } from "../pdf-primitives";
import { formatCurrency } from "@/lib/utils";
import type { OptionalTourItem, Currency } from "@/types";

interface Ctx {
  S: typeof S;
  label: (k: string, fb: string) => string;
  headingStyle: Record<string, string>;
}

interface Props {
  ctx: Ctx;
  items: OptionalTourItem[];
  currency: Currency;
  sectionNumber: string;
}

export function OptionalTours({ ctx, items, currency, sectionNumber }: Props) {
  const { S: styles, label } = ctx;
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.section} wrap={false}>
      {/* Cohesive unit: header + price table jump together — border never clipped. */}
      <View style={styles.sectionHeader} wrap={false} minPresenceAhead={60}>
        <View style={styles.sectionNum}><Text style={styles.sectionNumText}>{sectionNumber}</Text></View>
        <View style={styles.sectionIcon}><CompassIcon s={12} /></View>
        <Text style={styles.sectionTitle}>{label("section.optionalTours", "Optional Tours")}</Text>
      </View>
      <View style={styles.panel}>
        {items.map((item, i) => (
          <View key={i} style={i === items.length - 1 ? [styles.priceRow, { borderBottomWidth: 0 }] : styles.priceRow} wrap={false}>
            <View style={styles.priceLeft}>
              <SunIcon s={8} />
              <Text style={styles.priceLeftText}>{item.title}</Text>
              <Text style={styles.priceSub}>
                {[
                  `${label("day.day", "Day")} ${item.day}`,
                  item.location ? `📍 ${item.location}` : null,
                  item.time ? `🕐 ${item.time}` : null,
                ].filter(Boolean).join("  •  ")}
              </Text>
            </View>
            <Text style={styles.priceRight}>{formatCurrency(item.price, currency)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
