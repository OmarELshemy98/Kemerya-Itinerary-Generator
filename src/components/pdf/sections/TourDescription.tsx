"use client";
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { LotusIcon, PharaonicScene } from "../pdf-primitives";

interface Ctx {
  S: typeof S;
  label: (k: string, fb: string) => string;
  headingStyle: Record<string, string>;
}

interface Props {
  ctx: Ctx;
  tourTitle: string;
  description: string;
  meta: Array<{ label: string; value: string }>;
  sectionNumber: string;
}

export function TourDescription({ ctx, tourTitle, description, meta, sectionNumber }: Props) {
  const { S: styles, label } = ctx;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader} wrap={false}>
        <View style={styles.sectionNum}><Text style={styles.sectionNumText}>{sectionNumber}</Text></View>
        <View style={styles.sectionIcon}><LotusIcon s={12} /></View>
        <Text style={styles.sectionTitle}>{label("section.overview", "Tour Description")}</Text>
      </View>
      <Text style={styles.tourTitle}>{tourTitle}</Text>
      {description ? <Text style={styles.tourDesc}>{description}</Text> : null}
      {meta.length > 0 && (
        <View style={styles.summaryGrid}>
          {meta.map((m, i) => (
            <View key={i} style={styles.summaryCard}>
              <View style={styles.summaryIcon}><LotusIcon s={10} /></View>
              <View>
                <Text style={styles.summaryLabel}>{m.label}</Text>
                <Text style={styles.summaryValue}>{m.value}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      {/* Decorative Pharaonic scene fills all remaining space below the text */}
      <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", marginTop: 14 }}>
        <PharaonicScene />
      </View>
    </View>
  );
}
