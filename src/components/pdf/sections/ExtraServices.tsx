"use client";
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { SunIcon, LotusIcon, CartoucheIcon, BulletItem, Divider, formatCurrency } from "../pdf-primitives";
import type { BookingConfig, Currency } from "@/types";

interface Ctx {
  S: typeof S;
  label: (k: string, fb: string) => string;
  headingStyle: Record<string, string>;
}

interface Props {
  ctx: Ctx;
  notes: string;
  specialRequests: string;
  specialRequestItems: BookingConfig["specialRequestItems"];
  currency: Currency;
  sectionNumber: string;
}

export function ExtraServices({ ctx, notes, specialRequests, specialRequestItems, currency, sectionNumber }: Props) {
  const { S: styles, label } = ctx;
  const hasNotes = !!notes?.trim();
  const hasRequests = !!specialRequests?.trim();
  const items = (specialRequestItems ?? []).filter((it) => !!it.description?.trim() || it.price > 0);

  if (!hasNotes && !hasRequests && items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader} wrap={false}>
        <View style={styles.sectionNum}><Text style={[styles.sectionNumText, ctx.headingStyle]}>{sectionNumber}</Text></View>
        <Text style={styles.sectionTitle}>{label("section.extraRequests", "Detailed Requests & Extra Services")}</Text>
      </View>

      {hasNotes && (
        <View style={styles.panel}>
          <View style={styles.panelTitle}><CartoucheIcon s={10} /><Text style={styles.panelTitleText}>{label("notes.title", "Itinerary Notes")}</Text></View>
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}

      {(hasRequests || items.length > 0) && (
        <View style={[styles.panel, hasNotes && { marginTop: 6 }]}>
          <View style={styles.panelTitle}><LotusIcon s={10} /><Text style={styles.panelTitleText}>{label("notes.specialRequests", "Special Requests")}</Text></View>
          {hasRequests && <Text style={styles.notesText}>{specialRequests}</Text>}
          {items.length > 0 && (
            <>
              <Divider />
              {items.map((item) => (
                <BulletItem key={item.id || Math.random()} icon={<SunIcon s={8} />} text={`${item.description}${item.price > 0 ? ` - ${formatCurrency(item.price, currency)}` : ""}`} />
              ))}
            </>
          )}
        </View>
      )}
    </View>
  );
}
