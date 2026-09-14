"use client";
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { SunIcon } from "../pdf-primitives";
import { formatCurrency } from "@/lib/utils";

interface Ctx {
  S: typeof S;
  label: (k: string, fb: string) => string;
  headingStyle: Record<string, string>;
}

export interface OptionalTourItem { title: string; description?: string; price: number; }

interface Props {
  ctx: Ctx;
  items: OptionalTourItem[];
  sectionNumber: string;
}

export function OptionalTours({ ctx, items, sectionNumber }: Props) {
  const { S: styles, label } = ctx;
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader} wrap={false}>
        <View style={styles.sectionNum}><Text style={styles.sectionNumText}>{sectionNumber}</Text></View>
        <Text style={styles.sectionTitle}>{label("section.optionalTours", "Optional Tours")}</Text>
      </View>
      <View style={styles.panel}>
        {items.map((item, i) => (
          <View key={i} style={[styles.priceRow, i === items.length - 1 && { borderBottomWidth: 0 }]} wrap={false}>
            <View style={styles.priceLeft}>
              <SunIcon s={8} />
              <Text style={styles.priceLeftText}>{item.title}</Text>
              {item.description && <Text style={styles.priceSub}>{item.description}</Text>}
            </View>
            <Text style={styles.priceRight}>{formatCurrency(item.price, "USD")}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
