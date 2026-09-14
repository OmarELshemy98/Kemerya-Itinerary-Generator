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
    <View style={styles.section} wrap={false}>
      {/* Outermost wrap={false}: the whole Inclusions & Exclusions block jumps
          to a fresh page if it cannot fit completely — never torn in half. */}
      <View style={styles.sectionHeader} wrap={false} minPresenceAhead={60}>
        <View style={styles.sectionNum}><Text style={styles.sectionNumText}>{sectionNumber}</Text></View>
        <ScarabIcon s={10} />
        <Text style={styles.sectionTitle}>{hasInc && hasExc ? `${label("section.inclusions", "Inclusions")} & ${label("section.exclusions", "Exclusions")}` : hasInc ? label("section.inclusions", "Inclusions") : label("section.exclusions", "Exclusions")}</Text>
      </View>
      <View style={hasInc && hasExc ? styles.twoCol : undefined}>
        {hasInc && (
          <View style={colStyle}>
            <View style={styles.flowBlock}>
              {/* Unbordered flow block: rigid S.panel cards clip in half across pages; typography + icons + spacing carry the structure instead. */}
              <View wrap={false}>
                <View style={styles.panelTitle}><CheckIcon /><Text style={styles.panelTitleText}>{label("tour.inclusions", "What's Included")}</Text></View>
                {inclusions.length > 0 && (
                  <BulletItem icon={<CheckIcon />} text={inclusions[0]} />
                )}
              </View>
              {inclusions.slice(1).map((inc, i) => <BulletItem key={i + 1} icon={<CheckIcon />} text={inc} />)}
            </View>
          </View>
        )}
        {hasExc && (
          <View style={colStyle}>
            <View style={styles.flowBlock}>
              {/* Same unbordered flow for exclusions — title glued to its first item. */}
              <View wrap={false}>
                <View style={styles.panelTitle}><CrossIcon /><Text style={styles.panelTitleText}>{label("tour.exclusions", "What's Not Included")}</Text></View>
                {exclusions.length > 0 && (
                  <BulletItem icon={<CrossIcon />} text={exclusions[0]} />
                )}
              </View>
              {exclusions.slice(1).map((exc, i) => <BulletItem key={i + 1} icon={<CrossIcon />} text={exc} />)}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
