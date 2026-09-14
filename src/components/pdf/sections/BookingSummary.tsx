"use client";
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { SunIcon, CompassIcon, LotusIcon } from "../pdf-primitives";
import type { BookingConfig } from "@/types";

interface Ctx {
  S: typeof S;
  label: (k: string, fb: string) => string;
  headingStyle: Record<string, string>;
}

interface Props {
  ctx: Ctx;
  booking: BookingConfig;
  daysCount: number;
  nights: number;
  travelersText: string;
  tourTitle: string;
  sectionNumber: string;
}

function SummaryCard({ S: styles, label, value }: { S: typeof S; label: string; value: string }) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}><SunIcon s={12} /></View>
      <View>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </View>
  );
}

export function BookingSummary({ ctx, booking, daysCount, nights, travelersText, tourTitle, sectionNumber }: Props) {
  const { S: styles, label } = ctx;
  const meta = [
    { label: label("booking.reference", "Ref Number"), value: booking.id },
    { label: label("tour.name", "Tour Name"), value: tourTitle },
    { label: label("booking.clientName", "Client Name"), value: booking.clientName || "—" },
    { label: label("booking.clientPhone", "Phone"), value: booking.clientPhone || "—" },
    { label: label("booking.clientCountry", "Client Country"), value: booking.clientCountry || "—" },
    { label: label("overview.duration", "Duration"), value: `${daysCount} ${label("general.days", "Days")} / ${nights} ${label("overview.nights", "Nights")}` },
    { label: label("general.travelers", "Travelers"), value: travelersText || "—" },
    { label: label("booking.startDate", "Start Date"), value: booking.startDate || "—" },
    { label: label("booking.endDate", "End Date"), value: booking.endDate || "—" },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader} wrap={false} minPresenceAhead={60}>
        <View style={styles.sectionNum}><Text style={styles.sectionNumText}>{sectionNumber}</Text></View>
        <View style={styles.sectionIcon}><CompassIcon s={12} /></View>
        <Text style={styles.sectionTitle}>{label("section.summary", "Booking Summary")}</Text>
      </View>
      <View style={styles.summaryGrid}>
        {meta.map((m, i) => <SummaryCard key={i} S={styles} label={m.label} value={m.value} />)}
      </View>
    </View>
  );
}
