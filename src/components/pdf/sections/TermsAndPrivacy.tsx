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

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader} wrap={false} minPresenceAhead={60}>
        <View style={styles.sectionNum}><Text style={styles.sectionNumText}>{sectionNumber}</Text></View>
        <CartoucheIcon s={10} />
        <Text style={styles.sectionTitle}>{label("section.terms", "Terms & Privacy")}</Text>
      </View>

      {termsItems.length > 0 && (
        <View style={styles.flowBlock}>
          {/* Unbordered flow block: rigid S.panel cards clip in half across pages. */}
          {/* Title + first item travel together — never orphan the title. */}
          <View wrap={false}>
            <View style={styles.panelTitle}><CartoucheIcon s={10} /><Text style={styles.panelTitleText}>{label("terms.title", "Terms & Conditions")}</Text></View>
            {termsItems.length > 0 && (
              <View wrap={false} style={{ flexDirection: "row", marginBottom: 4, gap: 6 }}>
                <View style={styles.termsNum}><Text style={styles.termsNumText}>01</Text></View>
                <Text style={styles.termsText}>{termsItems[0]}</Text>
              </View>
            )}
          </View>
          {termsItems.slice(1).map((item, i) => (
            <View key={i + 1} wrap={false} style={{ flexDirection: "row", marginBottom: 4, gap: 6 }}>
              <View style={styles.termsNum}><Text style={styles.termsNumText}>{String(i + 2).padStart(2, "0")}</Text></View>
              <Text style={styles.termsText}>{item}</Text>
            </View>
          ))}
          <Link src={TERMS_URL} style={styles.termsLink}>{label("terms.readMore", "Read full terms")}: {TERMS_URL}</Link>
        </View>
      )}

      {privacyItems.length > 0 && (
        <View style={termsItems.length > 0 ? [styles.flowBlock, { marginTop: 6 }] : styles.flowBlock}>
          {/* Same unbordered flow for privacy — title glued to its first item. */}
          <View wrap={false}>
            <View style={styles.panelTitle}><EyeIcon s={10} /><Text style={styles.panelTitleText}>{label("privacy.title", "Privacy Policy")}</Text></View>
            {privacyItems.length > 0 && (
              <View wrap={false} style={{ flexDirection: "row", marginBottom: 4, gap: 6 }}>
                <View style={styles.termsNum}><Text style={styles.termsNumText}>01</Text></View>
                <Text style={styles.termsText}>{privacyItems[0]}</Text>
              </View>
            )}
          </View>
          {privacyItems.slice(1).map((item, i) => (
            <View key={i + 1} wrap={false} style={{ flexDirection: "row", marginBottom: 4, gap: 6 }}>
              <View style={styles.termsNum}><Text style={styles.termsNumText}>{String(i + 2).padStart(2, "0")}</Text></View>
              <Text style={styles.termsText}>{item}</Text>
            </View>
          ))}
          <Link src={PRIVACY_URL} style={styles.termsLink}>{label("privacy.readMore", "Read full policy")}: {PRIVACY_URL}</Link>
        </View>
      )}
    </View>
  );
}
