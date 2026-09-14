"use client";
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { PyramidIcon, SunIcon, MetaRow } from "../pdf-primitives";
import type { ItineraryDay } from "@/types";

interface Ctx {
  S: typeof S;
  label: (k: string, fb: string) => string;
  headingStyle: Record<string, string>;
}

interface Props {
  ctx: Ctx;
  itinerary: ItineraryDay[];
  dayField: (idx: number, field: string) => string | undefined;
  sectionNumber: string;
  fallbackDay: ItineraryDay | null;
}

export function DayByDayItinerary({ ctx, itinerary, dayField, sectionNumber, fallbackDay }: Props) {
  const { S: styles, label, headingStyle } = ctx;
  const tLabels = { day: label("day.day", "Day"), stay: label("day.stay", "Stay"), meals: label("day.meals", "Meals") };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader} wrap={false} minPresenceAhead={80}>
        <View style={styles.sectionNum}><Text style={styles.sectionNumText}>{sectionNumber}</Text></View>
        <Text style={styles.sectionTitle}>{label("section.roadmap", "Day-by-Day Itinerary")}</Text>
      </View>
      {itinerary.map((day, idx) => (
        <View key={day.day} style={styles.dayCard} wrap={false}>
          <View style={styles.dayHeader} wrap={false}>
            <View style={styles.dayBadge}><Text style={[styles.dayBadgeText, headingStyle]}>{tLabels.day} {day.day}</Text></View>
            <Text style={[styles.dayTitle, headingStyle]}>{dayField(idx, "day.title") || day.title}</Text>
          </View>
          {(dayField(idx, "day.description") || day.description) && (
            <Text style={styles.dayDesc}>{dayField(idx, "day.description") || day.description}</Text>
          )}
          <MetaRow icon={<PyramidIcon s={8} />} label={tLabels.stay} value={dayField(idx, "day.accommodation") || day.accommodation || ""} />
          <MetaRow icon={<SunIcon s={8} />} label={tLabels.meals} value={dayField(idx, "day.meals") || (day.meals?.join(", ") || "")} />
        </View>
      ))}
      {itinerary.length === 0 && fallbackDay && (
        <View style={styles.dayCard} wrap={false}>
          <Text style={styles.dayDesc}>{fallbackDay.description}</Text>
        </View>
      )}
    </View>
  );
}
