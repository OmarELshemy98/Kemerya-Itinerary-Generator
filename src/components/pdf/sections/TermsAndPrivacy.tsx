"use client";
import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { CartoucheIcon, EyeIcon } from "../pdf-primitives";
import { TERMS_URL, PRIVACY_URL } from "@/lib/translate-client";

interface Ctx {
  S: typeof S;
  label: (k: string, fb: string) => string;
  headingStyle: Record<string, string>;
}

interface Props {
  ctx: Ctx;
  termsItems: string[];
  privacyItems: string[];
  sectionNumber: string;
}

export function TermsAndPrivacy({ ctx, termsItems, privacyItems, sectionNumber }: Props) {
  const { S: styles, label } = ctx;
  if (termsItems.length === 0 && privacyItems.length === 0) return null;

  const renderItems = (items: string[]) => items.map((item, i) => (
    <View key={i} style={{ flexDirection: "row", marginBottom: 4, gap: 6 }}>
      <View style={styles.termsNum}><Text style={styles.termsNumText}>{String(i + 1).padStart(2, "0")}</Text></View>
      <Text style={styles.termsText}>{item}</Text>
    </View>
  ));

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader} wrap={false}>
        <View style={styles.sectionNum}><Text style={styles.sectionNumText}>{sectionNumber}</Text></View>
        <CartoucheIcon s={10} />
        <Text style={styles.sectionTitle}>{label("section.terms", "Terms & Privacy")}</Text>
      </View>

      {termsItems.length > 0 && (
        <View style={styles.panel}>
          <View style={styles.panelTitle}><CartoucheIcon s={10} /><Text style={styles.panelTitleText}>{label("terms.title", "Terms & Conditions")}</Text></View>
          {renderItems(termsItems)}
          <Link src={TERMS_URL} style={styles.termsLink}>{label("terms.readMore", "Read full terms")}: {TERMS_URL}</Link>
        </View>
      )}

      {privacyItems.length > 0 && (
        <View style={[styles.panel, termsItems.length > 0 && { marginTop: 6 }]}>
          <View style={styles.panelTitle}><EyeIcon s={10} /><Text style={styles.panelTitleText}>{label("privacy.title", "Privacy Policy")}</Text></View>
          {renderItems(privacyItems)}
          <Link src={PRIVACY_URL} style={styles.termsLink}>{label("privacy.readMore", "Read full policy")}: {PRIVACY_URL}</Link>
        </View>
      )}
    </View>
  );
}
