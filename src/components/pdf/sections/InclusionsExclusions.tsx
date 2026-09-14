"use client";
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { BulletItem, ScarabIcon } from "../pdf-primitives";
import { CheckIcon, CrossIcon } from "../pdf-icons";

interface Ctx {
  S: typeof S;
  label: (k: string, fb: string) => string;
  headingStyle: Record<string, string>;
}

interface Props {
  ctx: Ctx;
  inclusions: string[];
  exclusions: string[];
  sectionNumber: string;
}

export function InclusionsExclusions({ ctx, inclusions, exclusions, sectionNumber }: Props) {
  const { S: styles, label } = ctx;
  const hasInc = inclusions.length > 0;
  const hasExc = exclusions.length > 0;
  if (!hasInc && !hasExc) return null;

  const colStyle = hasInc && hasExc ? styles.col : styles.colFull;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader} wrap={false}>
        <View style={styles.sectionNum}><Text style={styles.sectionNumText}>{sectionNumber}</Text></View>
        <ScarabIcon s={10} />
        <Text style={styles.sectionTitle}>{hasInc && hasExc ? `${label("section.inclusions", "Inclusions")} & ${label("section.exclusions", "Exclusions")}` : hasInc ? label("section.inclusions", "Inclusions") : label("section.exclusions", "Exclusions")}</Text>
      </View>
      <View style={hasInc && hasExc ? styles.twoCol : undefined}>
        {hasInc && (
          <View style={colStyle}>
            <View style={styles.panel}>
              <View style={styles.panelTitle}><CheckIcon /><Text style={styles.panelTitleText}>{label("tour.inclusions", "What's Included")}</Text></View>
              {inclusions.map((inc, i) => <BulletItem key={i} icon={<CheckIcon />} text={inc} />)}
            </View>
          </View>
        )}
        {hasExc && (
          <View style={colStyle}>
            <View style={styles.panel}>
              <View style={styles.panelTitle}><CrossIcon /><Text style={styles.panelTitleText}>{label("tour.exclusions", "What's Not Included")}</Text></View>
              {exclusions.map((exc, i) => <BulletItem key={i} icon={<CrossIcon />} text={exc} />)}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
