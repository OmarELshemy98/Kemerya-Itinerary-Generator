"use client";

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
  Link,
  Image,
  Svg,
  Path,
  G,
  Circle,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
} from "@react-pdf/renderer";
import type { Tour, BookingConfig, CompanyInfo, ItineraryDay } from "@/types";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import {
  formatDateShort,
  formatCurrency,
  calculateNights,
} from "@/lib/utils";
import { resolveLogoSrc } from "@/lib/pdf-assets";
import { EGYPT_LOCATIONS } from "@/utils/mapGenerator";
import {
  KemeryaLogoSvg,
  CheckIcon,
  CrossIcon,
  UserIcon,
  CalendarIcon,
  MapPinIcon,
} from "./pdf-icons";
import {
  isRTL,
  getGlobalFont,
  isLatinDisplayLanguage,
} from "@/lib/pdf-fonts";
import {
  getTranslatedValue,
  getTranslatedArray,
  getTermsItems,
  getPrivacyItems,
  TERMS_URL,
  PRIVACY_URL,
} from "@/lib/translate-client";
import { shapeForPdf } from "@/lib/arabic-shaper";

interface ItineraryPDFProps {
  tour: Tour | null;
  booking: BookingConfig;
  companyInfo?: CompanyInfo;
  translatedData?: Record<string, unknown>;
  languageCode?: string;
}

Font.registerHyphenationCallback((word) => [word]);

const PARCHMENT_COLORS = {
  deepBrown: "#3D2B17",
  warmBrown: "#5A4226",
  agedBrown: "#7A6448",
  antiqueGold: "#B8963A",
  royalGold: "#C9A962",
  paleGold: "#E8D7B1",
  lapis: "#1E3A8A",
  deepLapis: "#172554",
  parchmentLight: "#F5EBD3",
  parchmentMid: "#EBD9B4",
  parchmentDark: "#BF9F6E",
  ink: "#2C1E10",
  scarabGreen: "#1F6B45",
};

function getOfferMeta(booking: BookingConfig): { title: string; note: string } {
  return {
    title: booking.offerTitle?.trim() || "Exclusive Limited-Time Offer",
    note: booking.offerNote?.trim() || "",
  };
}

const AnkhDivider = ({ color = PARCHMENT_COLORS.royalGold }: { color?: string }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
    <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.45 }} />
    <View style={{ width: 3, height: 3, backgroundColor: color, opacity: 0.8, marginHorizontal: 6 }} />
    <View style={{ marginHorizontal: 4 }}>
      <Svg width={26} height={22} viewBox="0 0 26 22">
        <G stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M13 7 C 8.5 7 5.5 10 5.5 13 C 5.5 16 8.5 18.5 13 18.5 C 17.5 18.5 20.5 16 20.5 13 C 20.5 10 17.5 7 13 7 Z" />
          <Path d="M13 14.5 L 13 20 M 8.5 20 L 17.5 20" />
        </G>
        <Circle cx={13} cy={13} r={1.5} fill={color} opacity={0.8} />
      </Svg>
    </View>
    <View style={{ width: 3, height: 3, backgroundColor: color, opacity: 0.8, marginHorizontal: 6 }} />
    <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.45 }} />
  </View>
);

const SmallAnkhDivider = ({ color = PARCHMENT_COLORS.antiqueGold }: { color?: string }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
    <View style={{ flex: 1, height: 0.6, backgroundColor: color, opacity: 0.5 }} />
    <Svg width={16} height={14} viewBox="0 0 16 14" style={{ marginHorizontal: 5 }}>
      <G stroke={color} strokeWidth={1.2} fill="none" strokeLinecap="round">
        <Path d="M8 4 C 5.5 4 3.5 6 3.5 8 C 3.5 10 5.5 11.5 8 11.5 C 10.5 11.5 12.5 10 12.5 8 C 12.5 6 10.5 4 8 4 Z" />
        <Path d="M8 9 L 8 13 M 5 13 L 11 13" />
      </G>
    </Svg>
    <View style={{ flex: 1, height: 0.6, backgroundColor: color, opacity: 0.5 }} />
  </View>
);

const ScarabBullet = ({ size = 14 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Ellipse cx={12} cy={13} rx={8} ry={9.5} fill={PARCHMENT_COLORS.scarabGreen} />
      <Path d="M4 13 C 4 6.5 7.5 3 12 3 C 16.5 3 20 6.5 20 13 C 20 19.5 16.5 23 12 23 C 7.5 23 4 19.5 4 13 Z"
        fill="none" stroke={PARCHMENT_COLORS.royalGold} strokeWidth={1.1} />
      <Path d="M12 4 L 12 22" stroke="#0F4D2E" strokeWidth={1} fill="none" opacity={0.8} />
      <Ellipse cx={12} cy={12} rx={4} ry={5.5} fill="#E8F8EE" opacity={0.3} />
      <Path d="M12 1.5 C 9.5 1.5 8 3.5 8 5.5 L 16 5.5 C 16 3.5 14.5 1.5 12 1.5 Z"
        fill={PARCHMENT_COLORS.scarabGreen} />
      <Path
        d="M2 9 L 6 10.2 M 2 14 L 6 13.3 M 22 9 L 18 10.2 M 22 14 L 18 13.3"
        stroke={PARCHMENT_COLORS.scarabGreen} strokeWidth={1.3} fill="none" />
    </G>
  </Svg>
);

const EyeOfHorusBullet = ({ size = 14 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Path d="M2 11 C 6 4 11 2 14 2 C 17 2 22 4 26 11 C 22 18 17 20 14 20 C 11 20 6 18 2 11 Z"
        transform="translate(-1, 1)" fill={PARCHMENT_COLORS.lapis} opacity={0.88} />
      <Path d="M2 11 C 6 4 11 2 14 2 C 17 2 22 4 26 11 C 22 18 17 20 14 20 C 11 20 6 18 2 11 Z"
        transform="translate(-1, 1)" fill="none" stroke={PARCHMENT_COLORS.royalGold} strokeWidth={1.1} />
      <Path d="M13 8 C 10.5 8 8.5 10 8.5 12 C 8.5 14 10.5 16 13 16" fill="none"
        stroke={PARCHMENT_COLORS.paleGold} strokeWidth={1.4} strokeLinecap="round" />
      <Circle cx={13} cy={12} r={2.5} fill={PARCHMENT_COLORS.paleGold} />
      <Circle cx={13} cy={12} r={1.1} fill="#0F172A" />
      <G stroke={PARCHMENT_COLORS.royalGold} strokeWidth={1.1} fill="none" strokeLinecap="round">
        <Path d="M0 14 L 5 13" />
        <Path d="M1 18 Q 4 21 7 20" />
        <Path d="M24 14 C 22 17 20 19 17 20" />
        <Path d="M13 20 C 13 22 12 24.5 10 25" />
      </G>
    </G>
  </Svg>
);

const PyramidBullet = ({ size = 14 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Path d="M12 1 L 23 22 L 1 22 Z" fill={PARCHMENT_COLORS.royalGold} />
      <Path d="M12 1 L 23 22 L 1 22 Z" fill="none" stroke="#8B6F3A" strokeWidth={0.7} opacity={0.9} />
      <Path d="M12 1 L 12 22" stroke="#FDFBF7" strokeWidth={0.55} fill="none" opacity={0.75} />
      <Path d="M5 11 L 19 11" stroke="#FDFBF7" strokeWidth={0.55} fill="none" opacity={0.65} />
      <Path d="M12 1 L 23 22" stroke="#0F172A" strokeWidth={0.45} fill="none" opacity={0.35} />
    </G>
  </Svg>
);

const LotusBullet = ({ size = 14 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Path d="M12 2 C 9 5 7 10 7 14 C 7 16 9 17 12 17 C 15 17 17 16 17 14 C 17 10 15 5 12 2 Z"
        fill="#C43E6B" opacity={0.85} />
      <Path d="M4 12 C 6 8 9 6 12 5 C 9 9 8 12 8 14 C 8 15.5 10 16.5 12 17 C 8 16.5 5 15.5 4 14 C 3 13.4 3 12.6 4 12 Z"
        fill="#F472B6" opacity={0.7} />
      <Path d="M20 12 C 18 8 15 6 12 5 C 15 9 16 12 16 14 C 16 15.5 14 16.5 12 17 C 16 16.5 19 15.5 20 14 C 21 13.4 21 12.6 20 12 Z"
        fill="#F472B6" opacity={0.7} />
      <Ellipse cx={12} cy={18} rx={4.5} ry={1.6} fill={PARCHMENT_COLORS.scarabGreen} opacity={0.88} />
      <Path d="M12 19 L 12 22 M 6 22 L 9 19 M 18 22 L 15 19"
        stroke={PARCHMENT_COLORS.scarabGreen} strokeWidth={1.1} fill="none" strokeLinecap="round" />
    </G>
  </Svg>
);

const SunDiscBullet = ({ size = 14 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Circle cx={12} cy={12} r={8} fill={PARCHMENT_COLORS.royalGold} />
      <Circle cx={12} cy={12} r={8} fill="none" stroke="#8B6F3A" strokeWidth={0.7} />
      <Circle cx={12} cy={12} r={4} fill="#F39516" opacity={0.9} />
      <Circle cx={12} cy={12} r={2.2} fill="#FDE68A" />
      <G stroke={PARCHMENT_COLORS.royalGold} strokeWidth={1.2} fill="none" strokeLinecap="round">
        <Path d="M12 1 V 4 M 12 20 V 23 M 1 12 H 4 M 20 12 H 23" />
        <Path d="M3 3 L 5.5 5.5 M 18.5 18.5 L 21 21 M 21 3 L 18.5 5.5 M 5.5 18.5 L 3 21" />
      </G>
    </G>
  </Svg>
);

const CartoucheSeal = ({ size = 13 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G fill="none" stroke={PARCHMENT_COLORS.royalGold} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 3 H 17 V 19 H 9 L 7 21 Z" />
      <G strokeWidth={1.1}>
        <Path d="M10 6 H 14 M 10 9 H 14 M 10 12 H 14" />
      </G>
    </G>
  </Svg>
);

const styles = StyleSheet.create({
  page: {
    width: "100%",
    height: "100%",
    backgroundColor: PARCHMENT_COLORS.parchmentLight,
  },
  parchmentBg: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 595,
    height: 842,
  },
  borderFrame: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 595,
    height: 842,
  },
  contentLayer: {
    paddingTop: 52,
    paddingLeft: 52,
    paddingRight: 52,
    paddingBottom: 12,
    marginBottom: 170,
    flexDirection: "column",
  },
  footerBand: {
    position: "absolute",
    bottom: 28,
    left: 40,
    right: 40,
    width: 515,
    flexDirection: "column",
  },
  nileImageWrap: {
    width: "100%",
    height: 108,
    borderWidth: 1.2,
    borderColor: PARCHMENT_COLORS.royalGold,
    overflow: "hidden",
  },
  nileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  footerCaption: {
    marginTop: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerBrand: {
    fontSize: 7.5,
    color: PARCHMENT_COLORS.warmBrown,
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  footerPage: {
    fontSize: 7.5,
    color: PARCHMENT_COLORS.agedBrown,
    fontWeight: 700,
    letterSpacing: 1,
  },
  footerTagline: {
    fontSize: 6.5,
    color: PARCHMENT_COLORS.antiqueGold,
    letterSpacing: 3,
    textTransform: "uppercase" as const,
    marginTop: 2,
  },
  headerBox: {
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 8,
  },
  brandTitle: {
    fontSize: 21,
    color: PARCHMENT_COLORS.deepBrown,
    letterSpacing: 4.5,
    marginTop: 5,
  },
  bookingRefBadge: {
    backgroundColor: PARCHMENT_COLORS.deepBrown,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: "flex-start",
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: PARCHMENT_COLORS.royalGold,
  },
  bookingRefText: {
    color: PARCHMENT_COLORS.royalGold,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.2,
  },
  heroCard: {
    backgroundColor: "rgba(253, 251, 247, 0.35)",
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: PARCHMENT_COLORS.royalGold,
    position: "relative",
    overflow: "hidden",
  },
  heroInnerFrame: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 0.6,
    borderColor: PARCHMENT_COLORS.antiqueGold,
    opacity: 0.7,
  },
  clientBadge: {
    backgroundColor: PARCHMENT_COLORS.antiqueGold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  clientBadgeText: {
    color: PARCHMENT_COLORS.deepBrown,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: "uppercase" as const,
  },
  heroSubtitle: {
    color: PARCHMENT_COLORS.lapis,
    fontSize: 8.5,
    letterSpacing: 3.5,
    textTransform: "uppercase" as const,
    marginBottom: 8,
  },
  heroTourName: {
    color: PARCHMENT_COLORS.ink,
    fontSize: 19,
    marginBottom: 8,
    lineHeight: 1.3,
  },
  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 8,
  },
  heroStat: {
    width: "31.5%",
    paddingRight: 6,
    borderRightWidth: 0.8,
    borderRightColor: PARCHMENT_COLORS.antiqueGold,
    marginBottom: 6,
  },
  heroStatLast: {
    width: "31.5%",
    paddingRight: 0,
    borderRightWidth: 0,
    marginBottom: 6,
  },
  heroStatLabel: {
    color: PARCHMENT_COLORS.agedBrown,
    fontSize: 7,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginBottom: 3,
  },
  heroStatValue: {
    color: PARCHMENT_COLORS.deepBrown,
    fontSize: 10.5,
    fontWeight: 700,
  },
  strikethroughOldPrice: {
    color: "#94714A",
    textDecorationLine: "line-through" as const,
    textDecorationThickness: 1.2,
    textDecorationColor: "#A23F2E",
    fontSize: 9.5,
  },
  offerPriceValue: {
    color: PARCHMENT_COLORS.scarabGreen,
    fontSize: 11,
    fontWeight: 700,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  sectionNumber: {
    width: 28,
    height: 28,
    backgroundColor: PARCHMENT_COLORS.deepLapis,
    borderWidth: 1,
    borderColor: PARCHMENT_COLORS.royalGold,
    color: PARCHMENT_COLORS.royalGold,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 28,
  },
  sectionTitle: {
    fontSize: 13,
    color: PARCHMENT_COLORS.deepBrown,
    letterSpacing: 0.5,
  },
  sectionUnderline: {
    flex: 1,
    height: 1,
    backgroundColor: PARCHMENT_COLORS.royalGold,
    opacity: 0.75,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
    justifyContent: "space-between",
    backgroundColor: "rgba(253, 251, 247, 0.3)",
    borderWidth: 0.8,
    borderColor: PARCHMENT_COLORS.antiqueGold,
    padding: 2,
  },
  summaryItem: {
    width: "48.5%",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 9,
    borderBottomWidth: 0.7,
    borderBottomColor: PARCHMENT_COLORS.paleGold,
    gap: 7,
  },
  summaryItemIcon: {
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryItemLabel: {
    fontSize: 7,
    color: PARCHMENT_COLORS.agedBrown,
    letterSpacing: 0.7,
    textTransform: "uppercase" as const,
    marginBottom: 2,
  },
  summaryItemValue: {
    fontSize: 9,
    color: PARCHMENT_COLORS.ink,
    fontWeight: 600,
  },
  summaryItemTextWrap: {
    flex: 1,
    flexDirection: "column",
  },
  summaryStrikethrough: {
    fontSize: 8.5,
    color: "#94714A",
    textDecorationLine: "line-through" as const,
    textDecorationThickness: 1,
    textDecorationColor: "#A23F2E",
  },
  summaryOfferValue: {
    fontSize: 11,
    color: PARCHMENT_COLORS.scarabGreen,
    fontWeight: 700,
  },
  offerBanner: {
    marginTop: 8,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: PARCHMENT_COLORS.royalGold,
    backgroundColor: "rgba(255, 248, 224, 0.5)",
    padding: 10,
    position: "relative",
  },
  offerBannerTop: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  offerBannerBadge: {
    backgroundColor: PARCHMENT_COLORS.deepLapis,
    color: PARCHMENT_COLORS.royalGold,
    fontSize: 6.5,
    fontWeight: 700,
    letterSpacing: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  offerBannerTitle: {
    fontSize: 10.5,
    color: PARCHMENT_COLORS.deepBrown,
    marginBottom: 4,
  },
  offerBannerPrices: { flexDirection: "row", alignItems: "flex-end", flexWrap: "wrap" },
  offerBannerOld: {
    fontSize: 10.5,
    color: "#94714A",
    textDecorationLine: "line-through" as const,
    textDecorationColor: "#A23F2E",
    marginRight: 8,
  },
  offerBannerNew: { fontSize: 18, color: PARCHMENT_COLORS.deepBrown, fontWeight: 700, marginRight: 8 },
  offerBannerPct: { fontSize: 7.5, color: PARCHMENT_COLORS.deepBrown, fontWeight: 700, marginBottom: 3 },
  offerBannerNote: { fontSize: 8, color: PARCHMENT_COLORS.warmBrown, marginTop: 4, lineHeight: 1.5 },
  offerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: PARCHMENT_COLORS.scarabGreen,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  offerBadgeText: {
    color: "#FFFFFF",
    fontSize: 6.5,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  dayCard: {
    backgroundColor: "rgba(253, 251, 247, 0.35)",
    marginBottom: 7,
    padding: 0,
    borderWidth: 1,
    borderColor: PARCHMENT_COLORS.antiqueGold,
    overflow: "hidden",
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PARCHMENT_COLORS.deepLapis,
    color: PARCHMENT_COLORS.royalGold,
    padding: 9,
    marginBottom: 0,
    gap: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: PARCHMENT_COLORS.royalGold,
  },
  dayBadge: {
    backgroundColor: PARCHMENT_COLORS.royalGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dayBadgeText: {
    color: PARCHMENT_COLORS.deepBrown,
    fontSize: 8.5,
    letterSpacing: 0.6,
    fontWeight: 700,
  },
  dayTitle: {
    color: PARCHMENT_COLORS.royalGold,
    fontSize: 11.5,
    flex: 1,
  },
  dayContent: {
    padding: 10,
  },
  dayDescription: {
    fontSize: 9.5,
    color: PARCHMENT_COLORS.ink,
    lineHeight: 1.7,
    marginBottom: 8,
    textAlign: "justify",
  },
  dayRoadmap: {
    marginTop: 6,
    borderWidth: 0.8,
    borderColor: PARCHMENT_COLORS.antiqueGold,
    backgroundColor: "rgba(255, 253, 245, 0.55)",
    padding: 7,
  },
  dayRoadmapTitle: {
    fontSize: 7,
    color: PARCHMENT_COLORS.warmBrown,
    letterSpacing: 1,
    marginBottom: 5,
    fontWeight: 700,
  },
  dayRoadmapRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 3 },
  dayRoadmapIcon: {
    width: 11,
    height: 11,
    marginTop: 2,
    marginRight: 6,
    flexShrink: 0,
  },
  dayRoadmapStop: { flex: 1, fontSize: 8.2, color: PARCHMENT_COLORS.deepBrown, lineHeight: 1.45 },
  dayRoadmapArrow: { fontSize: 7.5, color: PARCHMENT_COLORS.antiqueGold, marginLeft: 17, marginBottom: 1 },
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 250, 232, 0.5)",
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderWidth: 0.6,
    borderColor: PARCHMENT_COLORS.paleGold,
  },
  metaLabel: {
    fontSize: 7,
    color: PARCHMENT_COLORS.agedBrown,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    fontWeight: 700,
  },
  metaValue: {
    fontSize: 7.8,
    color: PARCHMENT_COLORS.deepBrown,
    fontWeight: 700,
  },
  twoCol: {
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
    width: "49%",
  },
  inclusionsCard: {
    backgroundColor: "rgba(253, 251, 247, 0.35)",
    padding: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: PARCHMENT_COLORS.royalGold,
  },
  exclusionsCard: {
    backgroundColor: "rgba(253, 251, 247, 0.35)",
    padding: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: PARCHMENT_COLORS.royalGold,
  },
  sectionCardTitle: {
    fontSize: 10,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inclusionTitleText: {
    color: PARCHMENT_COLORS.deepBrown,
  },
  exclusionTitleText: {
    color: PARCHMENT_COLORS.deepBrown,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 7,
    gap: 7,
    alignItems: "flex-start",
  },
  listItemIcon: {
    width: 13,
    height: 13,
    flexShrink: 0,
    marginTop: 1,
  },
  listItemText: {
    fontSize: 9,
    lineHeight: 1.5,
    flex: 1,
  },
  inclusionsText: {
    color: PARCHMENT_COLORS.ink,
  },
  exclusionsText: {
    color: PARCHMENT_COLORS.ink,
  },
  pricingTable: {
    backgroundColor: "rgba(253, 251, 247, 0.4)",
    padding: 12,
    borderWidth: 1,
    borderColor: PARCHMENT_COLORS.royalGold,
    overflow: "hidden",
  },
  pricingRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderBottomWidth: 0.7,
    borderBottomColor: PARCHMENT_COLORS.paleGold,
  },
  pricingRowLast: {
    borderBottomWidth: 0,
  },
  pricingCell: {
    flex: 1,
    fontSize: 9.5,
    color: PARCHMENT_COLORS.deepBrown,
  },
  pricingCellRight: {
    flex: 1,
    textAlign: "right",
    fontSize: 9.5,
    color: PARCHMENT_COLORS.deepBrown,
    fontWeight: 600,
  },
  pricingHeaderCell: {
    fontSize: 7.5,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    color: PARCHMENT_COLORS.agedBrown,
    fontWeight: 700,
  },
  pricingTotalLabel: {
    color: PARCHMENT_COLORS.deepBrown,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  pricingTotalValue: {
    color: PARCHMENT_COLORS.deepBrown,
    fontSize: 15,
    fontWeight: 700,
  },
  termsBlock: {
    backgroundColor: "rgba(253, 251, 247, 0.35)",
    padding: 12,
    borderWidth: 1,
    borderColor: PARCHMENT_COLORS.royalGold,
    marginTop: 10,
  },
  termsTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: PARCHMENT_COLORS.lapis,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 7,
  },
  termsText: {
    fontSize: 8,
    color: PARCHMENT_COLORS.deepBrown,
    lineHeight: 1.7,
    textAlign: "justify",
  },
  termsSection: {
    marginTop: 4,
  },
  termsCard: {
    backgroundColor: "rgba(253, 251, 247, 0.35)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: PARCHMENT_COLORS.royalGold,
    padding: 12,
  },
  termsItemRow: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 5,
  },
  termsBullet: {
    color: PARCHMENT_COLORS.antiqueGold,
    fontSize: 8,
    fontWeight: 700,
  },
  termsItemText: {
    flex: 1,
    fontSize: 8,
    color: PARCHMENT_COLORS.deepBrown,
    lineHeight: 1.55,
    textAlign: "justify",
  },
  termsLinkText: {
    fontSize: 8,
    color: PARCHMENT_COLORS.lapis,
    textDecoration: "underline",
  },
  notesBlock: {
    backgroundColor: "rgba(253, 251, 247, 0.35)",
    padding: 16,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: PARCHMENT_COLORS.royalGold,
    marginBottom: 14,
  },
  notesTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: PARCHMENT_COLORS.lapis,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    color: PARCHMENT_COLORS.deepBrown,
    lineHeight: 1.6,
  },
  dropCap: {
    fontSize: 28,
    color: PARCHMENT_COLORS.lapis,
    lineHeight: 1,
    marginRight: 3,
    fontWeight: 700,
  },
  reviewCard: {
    backgroundColor: "rgba(253, 251, 247, 0.35)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: PARCHMENT_COLORS.royalGold,
    padding: 22,
    alignItems: "center",
    marginTop: 10,
  },
  reviewTitle: {
    color: PARCHMENT_COLORS.deepBrown,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  reviewSubtitle: {
    color: PARCHMENT_COLORS.agedBrown,
    fontSize: 8.5,
    textAlign: "center",
    marginTop: 5,
    lineHeight: 1.5,
  },
  reviewBadge: {
    backgroundColor: PARCHMENT_COLORS.royalGold,
    paddingHorizontal: 13,
    paddingVertical: 6,
    marginTop: 10,
    borderWidth: 0.8,
    borderColor: PARCHMENT_COLORS.deepBrown,
  },
  reviewBadgeText: {
    color: PARCHMENT_COLORS.deepBrown,
    fontSize: 9,
    letterSpacing: 0.8,
    fontWeight: 700,
  },
  reviewLink: {
    color: PARCHMENT_COLORS.agedBrown,
    fontSize: 7.5,
    marginTop: 8,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 0.8,
    borderTopStyle: "solid",
    borderTopColor: PARCHMENT_COLORS.antiqueGold,
  },
  socialLinkItem: {
    fontSize: 8,
    color: PARCHMENT_COLORS.deepBrown,
    fontWeight: 700,
  },
  operationsCard: {
    backgroundColor: "rgba(253, 251, 247, 0.35)",
    padding: 22,
    marginTop: 14,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: PARCHMENT_COLORS.royalGold,
  },
  operationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  opsBadge: {
    backgroundColor: PARCHMENT_COLORS.lapis,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  opsBadgeText: {
    color: PARCHMENT_COLORS.royalGold,
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  opsCardTitle: {
    color: PARCHMENT_COLORS.deepBrown,
    fontSize: 11.5,
  },
  opsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  opsItem: {
    width: "48%",
    flexDirection: "column",
    gap: 2,
  },
  opsLabel: {
    fontSize: 7,
    color: PARCHMENT_COLORS.agedBrown,
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  opsValue: {
    fontSize: 9.5,
    color: PARCHMENT_COLORS.deepBrown,
    fontWeight: 600,
  },
});

function resolvePdfAsset(filename: string): string {
  if (typeof window !== "undefined") {
    return `/images/${filename}`;
  }
  return `${process.cwd()}/public/images/${filename}`;
}

const PARCHMENT_SRC = resolvePdfAsset("parchment.svg");
const BORDER_SRC = resolvePdfAsset("border_pattern.svg");
const NILE_SRC = resolvePdfAsset("nile_sunset.svg");

function ParchmentPage({
  children,
  companyInfo,
  languageCode = "en",
  pageLabel,
  rtlPageStyle,
  footerTagline,
}: {
  children: React.ReactNode;
  companyInfo?: CompanyInfo;
  languageCode?: string;
  pageLabel?: string;
  rtlPageStyle?: { direction: "rtl" };
  footerTagline?: string;
}) {
  const rtl = isRTL(languageCode);
  const bodyFont = getGlobalFont(languageCode);
  const latinDisplay = isLatinDisplayLanguage(languageCode);
  const brandFont = latinDisplay ? "Cinzel" : bodyFont;

  return (
    <Page
      size="A4"
      style={[styles.page, { direction: rtl ? "rtl" : "ltr", fontFamily: bodyFont }, rtlPageStyle ?? {}]}
    >
      <Image src={PARCHMENT_SRC} style={styles.parchmentBg} fixed={true} />
      <Image src={BORDER_SRC} style={styles.borderFrame} fixed={true} />

      <View style={[styles.contentLayer, { fontFamily: bodyFont, direction: rtl ? "rtl" : "ltr" }]}>
        <View style={styles.headerBox}>
          <KemeryaLogoSvg />
          <Text style={[styles.brandTitle, { fontFamily: brandFont }]}>
            {companyInfo?.name || "KEMERYA TOURS"}
          </Text>
          <AnkhDivider />
        </View>
        {children}
      </View>

      <View style={styles.footerBand} fixed={true}>
        <View style={styles.nileImageWrap}>
          <Image src={NILE_SRC} style={styles.nileImage} />
        </View>
        <View style={styles.footerCaption}>
          <View>
            <Text style={[styles.footerBrand, { fontFamily: brandFont }]}>
              {companyInfo?.name || "KEMERYA TOURS"}
            </Text>
            <Text style={[styles.footerTagline, { fontFamily: brandFont }]}>
              {footerTagline || "Curated Egyptian Journeys · Est. Luxury"}
            </Text>
          </View>
          <Text style={styles.footerPage}>
            {pageLabel || "Page 1"}
          </Text>
        </View>
      </View>
    </Page>
  );
}

function buildItineraryList(
  tour: Tour | null,
  booking: BookingConfig
): ItineraryDay[] {
  if (booking.isCustomTour) {
    if (booking.customItinerary && booking.customItinerary.length > 0) {
      return booking.customItinerary;
    }
    return [
      {
        day: 1,
        title: "Arrival Day",
        description:
          "Custom tour itinerary - details to be arranged by the Operations Team based on client requirements.",
        highlights: ["Meet & Greet at Airport", "Hotel Transfer", "Welcome Drink"],
        accommodation: "To be confirmed",
      },
    ];
  }
  return tour?.itinerary ?? [];
}

function getTourTitle(tour: Tour | null, booking: BookingConfig): string {
  if (booking.isCustomTour) {
    return booking.customTourTitle || "Custom Private Tour";
  }
  return tour?.title || "Kemerya Tours - Arranged Journey";
}

function getTourDurationDays(
  tour: Tour | null,
  booking: BookingConfig
): number {
  const nights = calculateNights(
    new Date(booking.startDate),
    new Date(booking.endDate)
  );
  return nights + 1;
}

function getInclusions(
  tour: Tour | null,
  booking: BookingConfig
): string[] {
  if (booking.inclusions?.length) {
    return booking.inclusions;
  }
  if (booking.isCustomTour && booking.customInclusions?.length) {
    return booking.customInclusions;
  }
  return tour?.inclusions ?? [];
}

function getExclusions(
  tour: Tour | null,
  booking: BookingConfig
): string[] {
  if (booking.exclusions?.length) {
    return booking.exclusions;
  }
  if (booking.isCustomTour && booking.customExclusions?.length) {
    return booking.customExclusions;
  }
  return tour?.exclusions ?? [];
}

export function ItineraryPDF({
  tour,
  booking,
  companyInfo = KEMERYA_COMPANY_INFO,
  translatedData,
  languageCode,
}: ItineraryPDFProps) {
  const tourTitle = getTourTitle(tour, booking);
  const daysCount = getTourDurationDays(tour, booking);
  const nights = Math.max(
    daysCount - 1,
    calculateNights(new Date(booking.startDate), new Date(booking.endDate))
  );
  const itinerary = buildItineraryList(tour, booking);
  const inclusions = getInclusions(tour, booking);
  const exclusions = getExclusions(tour, booking);
  const totalTravelers =
    booking.travelers.adults + booking.travelers.children + booking.travelers.infants;
  const bookingRef = booking.id.replace(/^bk-/, "").toUpperCase();
  const totalTravelersTextParts: string[] = [];
  if (booking.travelers.adults > 0) totalTravelersTextParts.push(`${booking.travelers.adults} Adult${booking.travelers.adults > 1 ? "s" : ""}`);
  if (booking.travelers.children > 0) totalTravelersTextParts.push(`${booking.travelers.children} Child${booking.travelers.children > 1 ? "ren" : ""}`);
  if (booking.travelers.infants > 0) totalTravelersTextParts.push(`${booking.travelers.infants} Infant${booking.travelers.infants > 1 ? "s" : ""}`);
  const travelersText = totalTravelersTextParts.join(", ");

  const rtl = isRTL(languageCode ?? "en");
  const languageIsRTL = rtl;
  // FIX #4 (CRITICAL): idempotent RTL mirror. `styles` is module-shared, so
  // each render first RESTORES the pristine LTR snapshot, then applies the
  // L↔R mirror only when rtl. This keeps every existing `styles.*` reference
  // working while guaranteeing Left↔Right flips never compound.
  const styleBag = styles as unknown as Record<string, Record<string, unknown>>;
  const pristine = (globalThis as unknown as { __kemeryaPristine?: Record<string, Record<string, unknown>> }).__kemeryaPristine;
  if (!pristine) {
    const snap: Record<string, Record<string, unknown>> = {};
    for (const k of Object.keys(styleBag)) snap[k] = { ...(styleBag[k] as object) } as Record<string, unknown>;
    (globalThis as unknown as { __kemeryaPristine?: Record<string, Record<string, unknown>> }).__kemeryaPristine = snap;
  }
  const base = (globalThis as unknown as { __kemeryaPristine: Record<string, Record<string, unknown>> }).__kemeryaPristine;
  for (const key of Object.keys(base)) {
    const target = styleBag[key];
    if (!target) continue;
    for (const k of Object.keys(target)) delete target[k];
    Object.assign(target, { ...base[key] });
  }
  if (rtl) {
    for (const key of Object.keys(styleBag)) {
      const s = styleBag[key];
      const orig = base[key];
      if (!s || !orig) continue;
      if ("paddingLeft" in orig && "paddingRight" in orig) {
        s.paddingLeft = orig.paddingRight;
        s.paddingRight = orig.paddingLeft;
      } else if ("paddingLeft" in orig) {
        (s as Record<string, unknown>).paddingRight = orig.paddingLeft;
      } else if ("paddingRight" in orig) {
        (s as Record<string, unknown>).paddingLeft = orig.paddingRight;
      }
      if ("marginLeft" in orig && "marginRight" in orig) {
        s.marginLeft = orig.marginRight;
        s.marginRight = orig.marginLeft;
      } else if ("marginLeft" in orig) {
        (s as Record<string, unknown>).marginRight = orig.marginLeft;
      } else if ("marginRight" in orig) {
        (s as Record<string, unknown>).marginLeft = orig.marginRight;
      }
      const borderLR = ["Width", "Color", "Style"] as const;
      for (const suf of borderLR) {
        const lk = `borderLeft${suf}`;
        const rk = `borderRight${suf}`;
        if (lk in orig && rk in orig) {
          (s as Record<string, unknown>)[lk] = orig[rk];
          (s as Record<string, unknown>)[rk] = orig[lk];
        } else if (lk in orig) {
          (s as Record<string, unknown>)[rk] = orig[lk];
        } else if (rk in orig) {
          (s as Record<string, unknown>)[lk] = orig[rk];
        }
      }
      if (orig.flexDirection === "row") s.flexDirection = "row-reverse";
      if (orig.justifyContent === "flex-start") s.justifyContent = "flex-end";
      else if (orig.justifyContent === "flex-end") s.justifyContent = "flex-start";
      const cornerPairs: Array<[string, string]> = [
        ["borderTopLeftRadius", "borderTopRightRadius"],
        ["borderBottomLeftRadius", "borderBottomRightRadius"],
      ];
      for (const [lk, rk] of cornerPairs) {
        if (lk in orig && rk in orig) {
          (s as Record<string, unknown>)[lk] = orig[rk];
          (s as Record<string, unknown>)[rk] = orig[lk];
        } else if (lk in orig) {
          (s as Record<string, unknown>)[rk] = orig[lk];
        } else if (rk in orig) {
          (s as Record<string, unknown>)[lk] = orig[rk];
        }
      }
      if (!("textAlign" in orig) && ("fontSize" in orig || "color" in orig || "fontFamily" in orig || "lineHeight" in orig)) {
        s.textAlign = "right";
      }
    }
  } else {
    for (const key of Object.keys(styleBag)) {
      const s = styleBag[key];
      const orig = base[key];
      if (!s || !orig) continue;
      if (!("textAlign" in orig) && ("fontSize" in orig || "color" in orig || "fontFamily" in orig || "lineHeight" in orig)) {
        s.textAlign = "left";
      }
    }
  }
  // FIX #4: every content Page flows RTL (direction) when Arabic/Hebrew/…
  const rtlPageStyle = rtl ? { direction: "rtl" as const } : undefined;
  const sh = shapeForPdf;

  const hasTranslation = Boolean(translatedData && languageCode);

  const label = (key: string, fallback: string): string => {
    if (!translatedData) return sh(fallback);
    // FIX #3: look in BOTH `_labels` (flat keys) and `ui` (protocol
    // namespace, e.g. translatedData?.ui?.terms || "TERMS & CONDITIONS"),
    // plus alias pairs shared with the translate route.
    const aliases: Record<string, string[]> = {
      "section.summary": ["BOOKING SUMMARY"],
      "tour.inclusions": ["WHAT'S INCLUDED"],
      "section.terms": ["TERMS & CONDITIONS"],
      "hero.subtitle": ["YOUR EXCLUSIVE TRAVEL ITINERARY"],
    };
    const labels = translatedData["_labels"] as Record<string, string> | undefined;
    const ui = translatedData["ui"] as Record<string, string> | undefined;
    for (const candidate of [key, ...(aliases[key] || [])]) {
      const hit = ui?.[candidate] || labels?.[candidate];
      if (typeof hit === "string" && hit.trim().length > 0) return sh(hit);
    }
    return sh(fallback);
  };

  const t = (key: string, fallback: string): string =>
    sh(getTranslatedValue(translatedData, key, fallback) || fallback);

  const tList = (key: string, fallback: string[]): string[] => {
    if (!translatedData) return fallback;
    const raw = translatedData[key];
    if (!Array.isArray(raw)) return fallback;
    const strings = raw.filter(
      (v): v is string => typeof v === "string" && v.trim().length > 0
    );
    if (strings.length === 0) return fallback;
    return fallback.map((fb, i) =>
      i < strings.length && strings[i].trim().length > 0 ? sh(strings[i]) : sh(fb)
    );
  };

  const translatedDays = Array.isArray(translatedData?.["itinerary.days"])
    ? (translatedData!["itinerary.days"] as Array<Record<string, unknown>>)
    : [];

  const dayField = (idx: number, field: string): string | undefined => {
    const day = translatedDays[idx];
    if (!day) return undefined;
    const value = day[field];
    return typeof value === "string" && value.trim().length > 0 ? sh(value) : undefined;
  };

  const termsItems = getTranslatedArray(translatedData, "terms.items", getTermsItems(booking)).map(sh);
  const privacyItems = getTranslatedArray(
    translatedData,
    "privacy.items",
    getPrivacyItems(booking)
  ).map(sh);

  const overviewParas = getTranslatedArray(translatedData, "tour.overview", tour?.overview ?? []).map(
    sh
  );

  const displayTourTitle = hasTranslation
    ? booking.isCustomTour
      ? t("booking.customTourTitle", tourTitle)
      : t("tour.title", tourTitle)
    : tourTitle;

  const langCode = languageCode ?? "en";
  const bodyFont = getGlobalFont(langCode);
  const latinDisplay = isLatinDisplayLanguage(langCode);
  const cinzelFont = latinDisplay ? "Cinzel" : bodyFont;
  const headingFont = latinDisplay ? "Cinzel Decorative" : bodyFont;
  const cinzelStyle = { fontFamily: cinzelFont };
  const headingStyle = { fontFamily: headingFont };

  return (
    <Document title={`${tourTitle} - Kemerya Tours Itinerary`} author="Kemerya Tours" creator="Kemerya Tours Dashboard">
      <ParchmentPage companyInfo={companyInfo} languageCode={langCode} pageLabel="Page 1" rtlPageStyle={rtlPageStyle} footerTagline={label("footer.tagline", "Curated Egyptian Journeys · Est. Luxury")}>
        <View style={styles.bookingRefBadge}>
          <Text style={[styles.bookingRefText, cinzelStyle]}>Ref: {bookingRef}</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroInnerFrame} />
          <View style={styles.clientBadge}>
            <Text style={styles.clientBadgeText}>Booking Reference · {bookingRef}</Text>
          </View>
          <Text style={[styles.heroSubtitle, cinzelStyle]}>{label("hero.subtitle", "Your Exclusive Travel Itinerary")}</Text>
          <Text style={[styles.heroTourName, headingStyle]}>{displayTourTitle}</Text>
          <SmallAnkhDivider />
          <View style={styles.heroGrid}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>{label("hero.departureDate", "Departure Date")}</Text>
              <Text style={styles.heroStatValue}>
                {formatDateShort(booking.startDate)}
              </Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>{label("hero.returnDate", "Return Date")}</Text>
              <Text style={styles.heroStatValue}>
                {formatDateShort(booking.endDate)}
              </Text>
            </View>
            <View style={styles.heroStatLast}>
              <Text style={styles.heroStatLabel}>{label("hero.duration", "Duration")}</Text>
              <Text style={styles.heroStatValue}>
                {daysCount} Days / {nights} Nights
              </Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>{label("hero.travelers", "Travelers")}</Text>
              <Text style={styles.heroStatValue}>{totalTravelers} Guest{totalTravelers > 1 ? "s" : ""}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>{label("hero.totalPrice", "Total Price")}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                {booking.offerPrice != null && booking.offerPrice > 0 ? (
                  <>
                    <Text style={[styles.heroStatValue, styles.strikethroughOldPrice]}>
                      {formatCurrency(booking.totalPrice, booking.currency)}
                    </Text>
                    <Text style={styles.offerPriceValue}>
                      {formatCurrency(booking.offerPrice, booking.currency)}
                    </Text>
                    {booking.totalPrice > 0 && (
                      <View style={styles.offerBadge}>
                        <Svg width={7} height={7} viewBox="0 0 24 24">
                          <G fill="#FFFFFF">
                            <Path d="M12 2 L15 8 H21 L16 12 L18 18 L12 15 L6 18 L8 12 L3 8 H9 Z" />
                          </G>
                        </Svg>
                        <Text style={styles.offerBadgeText}>
                          {Math.round(((booking.totalPrice - booking.offerPrice) / booking.totalPrice) * 100)}% OFF
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={styles.heroStatValue}>
                    {formatCurrency(booking.totalPrice, booking.currency)}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.heroStatLast}>
              <Text style={styles.heroStatLabel}>{label("hero.reference", "Reference")}</Text>
              <Text style={styles.heroStatValue}>#{bookingRef}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}><Text>01</Text></View>
            <Text style={[styles.sectionTitle, headingStyle]}>{label("section.summary", "Booking Summary")}</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <View style={styles.summaryGrid}>
            <SummaryCard
              label={label("summary.totalTravelers", "Total Travelers")}
              value={`${totalTravelers} (${travelersText})`}
            />
            <SummaryCard
              label={label("summary.tourDuration", "Tour Duration")}
              value={`${daysCount} Days / ${nights} Nights`}
            />
            <SummaryCard
              label={label("summary.travelPeriod", "Travel Period")}
              value={`${formatDateShort(booking.startDate)} → ${formatDateShort(booking.endDate)}`}
            />
            <SummaryCard
              label={`${label("summary.totalAmount", "Total Amount")} (${booking.currency})`}
              value={booking.offerPrice && booking.offerPrice > 0 ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={[styles.summaryItemValue, styles.summaryStrikethrough]}>
                    {formatCurrency(booking.totalPrice, booking.currency)}
                  </Text>
                  <Text style={styles.summaryOfferValue}>
                    {formatCurrency(booking.offerPrice, booking.currency)}
                  </Text>
                </View>
              ) : formatCurrency(booking.totalPrice, booking.currency)}
            />
            {booking.clientName ? (
              <SummaryCard label={label("summary.clientName", "Client Name")} value={booking.clientName} />
            ) : null}
            {booking.clientEmail ? (
              <SummaryCard label={label("summary.clientEmail", "Client Email")} value={booking.clientEmail} />
            ) : null}
            {booking.clientPhone ? (
              <SummaryCard label={label("summary.clientPhone", "Client Phone")} value={booking.clientPhone} />
            ) : null}
            {booking.clientWhatsapp ? (
              <SummaryCard label={label("summary.clientWhatsapp", "Client WhatsApp")} value={booking.clientWhatsapp} />
            ) : null}
            {booking.meetingPoint ? (
              <SummaryCard label={label("summary.meetingPoint", "Meeting Point")} value={booking.meetingPoint} />
            ) : null}
            {booking.flightArrival ? (
              <SummaryCard
                label={label("summary.airportArrival", "Airport Arrival / Tour Start")}
                value={booking.flightArrival.replace("T", " · ")}
              />
            ) : null}
            {booking.pickupTime ? (
              <SummaryCard label={label("summary.pickupTime", "Pickup Time")} value={booking.pickupTime} />
            ) : null}
          </View>
        </View>

        {booking.offerPrice != null && booking.offerPrice > 0 && (() => {
          const meta = getOfferMeta(booking);
          const pct = Math.round(((booking.totalPrice - booking.offerPrice) / booking.totalPrice) * 100);
          return (
            <View style={styles.offerBanner}>
              <View style={styles.offerBannerTop} wrap={false}>
                <View style={{ marginRight: 6 }}>
                  <ScarabBullet size={15} />
                </View>
                <Text style={[styles.offerBannerBadge, cinzelStyle]}>
                  {pct > 0 ? `SPECIAL OFFER · SAVE ${pct}%` : "SPECIAL OFFER"}
                </Text>
              </View>
              <Text style={[styles.offerBannerTitle, cinzelStyle]}>{meta.title}</Text>
              <View style={styles.offerBannerPrices}>
                <Text style={styles.offerBannerOld}>
                  {formatCurrency(booking.totalPrice, booking.currency)}
                </Text>
                <Text style={styles.offerBannerNew}>
                  {formatCurrency(booking.offerPrice, booking.currency)}
                </Text>
                {pct > 0 && (
                  <Text style={styles.offerBannerPct}>
                    You save {formatCurrency(booking.totalPrice - booking.offerPrice, booking.currency)}
                  </Text>
                )}
              </View>
              {meta.note ? (
                <Text style={styles.offerBannerNote}>{meta.note}</Text>
              ) : null}
            </View>
          );
        })()}

        {!booking.isCustomTour && tour ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}><Text>02</Text></View>
              <Text style={[styles.sectionTitle, headingStyle]}>{label("section.overview", "Tour Overview")}</Text>
              <View style={styles.sectionUnderline} />
            </View>
            {overviewParas.map((para, i) =>
              i === 0 && para.length > 0 && !rtl ? (
                <Text key={i} style={{ ...styles.notesText, marginBottom: 6 }}>
                  <Text style={[styles.dropCap, headingStyle]}>{para.charAt(0)}</Text>
                  {para.slice(1)}
                </Text>
              ) : (
                <Text key={i} style={{ ...styles.notesText, marginBottom: 6 }}>
                  {para}
                </Text>
              )
            )}
            {(tour.location || tour.group || tour.language || tour.durationLabel) ? (
              <View style={{ ...styles.summaryGrid, marginTop: 8 }}>
                {tour.durationLabel ? (
                  <SummaryCard label="Duration" value={tour.durationLabel} />
                ) : null}
                {tour.location ? (
                  <SummaryCard label="Location" value={tour.location} />
                ) : null}
                {tour.group ? (
                  <SummaryCard label="Group" value={tour.group} />
                ) : null}
                {tour.language ? (
                  <SummaryCard label="Language" value={tour.language} />
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {(booking.notes || booking.specialRequests) ? (
          <View style={styles.notesBlock}>
            {booking.notes ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5, gap: 6 }}>
                  <PyramidBullet size={12} />
                  <Text style={styles.notesTitle}>{label("notes.title", "Itinerary Notes")}</Text>
                </View>
                <Text style={styles.notesText}>{shapeForPdf(booking.notes)}</Text>
              </>
            ) : null}
            {booking.specialRequests ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: booking.notes ? 10 : 0, marginBottom: 5, gap: 6 }}>
                  <LotusBullet size={12} />
                  <Text style={styles.notesTitle}>
                    {label("notes.specialRequests", "Special Requests")}
                  </Text>
                </View>
                <Text style={styles.notesText}>{shapeForPdf(booking.specialRequests)}</Text>
              </>
            ) : null}
          </View>
        ) : null}
      </ParchmentPage>

      <ParchmentPage companyInfo={companyInfo} languageCode={langCode} pageLabel="Page 2">
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}><Text>03</Text></View>
            <Text style={[styles.sectionTitle, headingStyle]}>{label("section.roadmap", "Day-by-Day Itinerary")}</Text>
            <View style={styles.sectionUnderline} />
          </View>

          {itinerary.slice(0, 3).map((day, idx) => {
            return (
              <DayCard
                key={day.day}
                day={day}
                roadmap={undefined}
                translatedTitle={dayField(idx, "day.title")}
                translatedDescription={dayField(idx, "day.description")}
                translatedAccommodation={dayField(idx, "day.accommodation")}
                translatedMeals={dayField(idx, "day.meals")}
                translatedRoadmap={dayField(idx, "day.transport")}
                tLabels={{
                  roadmap: label("day.roadmap", "Today's Roadmap"),
                  stay: label("day.stay", "Stay"),
                  meals: label("day.meals", "Meals"),
                }}
                headingStyle={headingStyle}
                cinzelStyle={cinzelStyle}
              />
            );
          })}

          {itinerary.length === 0 && (
            <DayCard
              day={{
                day: 1,
                title: "Custom Arranged Itinerary",
                description:
                  "This is a fully customized tour. Your dedicated Operations Manager will design each day according to your preferences and provide a detailed schedule shortly.",
              }}
              headingStyle={headingStyle}
              cinzelStyle={cinzelStyle}
            />
          )}
        </View>
      </ParchmentPage>

      {itinerary.length > 3 && (
        <ParchmentPage companyInfo={companyInfo} languageCode={langCode} pageLabel="Page 3">
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}><Text>03</Text></View>
              <Text style={[styles.sectionTitle, headingStyle]}>{label("section.roadmap", "Itinerary (Continued)")}</Text>
              <View style={styles.sectionUnderline} />
            </View>

            {itinerary.slice(3, 7).map((day, idx) => {
              return (
                <DayCard
                  key={day.day}
                  day={day}
                  roadmap={undefined}
                  translatedTitle={dayField(idx + 3, "day.title")}
                  translatedDescription={dayField(idx + 3, "day.description")}
                  translatedAccommodation={dayField(idx + 3, "day.accommodation")}
                  translatedMeals={dayField(idx + 3, "day.meals")}
                  translatedRoadmap={dayField(idx + 3, "day.transport")}
                  tLabels={{
                    roadmap: label("day.roadmap", "Today's Roadmap"),
                    stay: label("day.stay", "Stay"),
                    meals: label("day.meals", "Meals"),
                  }}
                  headingStyle={headingStyle}
                  cinzelStyle={cinzelStyle}
                />
              );
            })}
          </View>
        </ParchmentPage>
      )}

      <ParchmentPage companyInfo={companyInfo} languageCode={langCode} pageLabel={itinerary.length > 3 ? "Page 4" : "Page 3"}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}><Text>04</Text></View>
            <Text style={[styles.sectionTitle, headingStyle]}>
              {label("section.inclusions", "Inclusions")} & {label("section.exclusions", "Exclusions")}
            </Text>
            <View style={styles.sectionUnderline} />
          </View>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <View style={styles.inclusionsCard}>
                <View style={[styles.sectionCardTitle, styles.inclusionTitleText, headingStyle]}>
                  <ScarabBullet size={13} />
                  <Text>{label("tour.inclusions", "What's Included")}</Text>
                </View>
                {tList("inclusions", inclusions).length > 0 ? (
                  tList("inclusions", inclusions).map((inc, i) => (
                    <View key={i} style={styles.listItem}>
                      <View style={styles.listItemIcon}>
                        <ScarabBullet size={13} />
                      </View>
                      <Text style={{ ...styles.listItemText, ...styles.inclusionsText }}>
                        {inc}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ ...styles.listItemText, ...styles.inclusionsText }}>
                    {label("fallback.inclusions", "Customized inclusions to be confirmed by Operations team.")}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.col}>
              <View style={styles.exclusionsCard}>
                <View style={[styles.sectionCardTitle, styles.exclusionTitleText, headingStyle]}>
                  <EyeOfHorusBullet size={13} />
                  <Text>{label("tour.exclusions", "What's Not Included")}</Text>
                </View>
                {tList("exclusions", exclusions).length > 0 ? (
                  tList("exclusions", exclusions).map((exc, i) => (
                    <View key={i} style={styles.listItem}>
                      <View style={styles.listItemIcon}>
                        <EyeOfHorusBullet size={13} />
                      </View>
                      <Text style={{ ...styles.listItemText, ...styles.exclusionsText }}>
                        {exc}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ ...styles.listItemText, ...styles.exclusionsText }}>
                    {label("fallback.exclusions", "Standard exclusion terms apply.")}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}><Text>05</Text></View>
            <Text style={[styles.sectionTitle, headingStyle]}>{label("section.pricing", "Pricing & Payment")}</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <View style={styles.pricingTable}>
            <View style={{ ...styles.pricingRow, backgroundColor: "rgba(232, 215, 177, 0.25)" }}>
              <Text style={{ ...styles.pricingCell, ...styles.pricingHeaderCell }}>{label("pricing.description", "Description")}</Text>
              <Text style={{ ...styles.pricingCellRight, ...styles.pricingHeaderCell }}>{label("pricing.amount", "Amount")} ({booking.currency})</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingCell}>
                {label("pricing.tourPackage", "Tour Package")} ({displayTourTitle})
              </Text>
              <Text style={styles.pricingCellRight}>
                {formatCurrency(booking.totalPrice, booking.currency)}
              </Text>
            </View>
            {booking.travelers.adults > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingCell}>
                  · {label("pricing.adults", "Adults")} ({booking.travelers.adults})
                </Text>
                <Text style={styles.pricingCellRight}>
                  —
                </Text>
              </View>
            )}
            {booking.travelers.children > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingCell}>
                  · {label("pricing.children", "Children")} ({booking.travelers.children})
                </Text>
                <Text style={styles.pricingCellRight}>
                  —
                </Text>
              </View>
            )}
            {booking.travelers.infants > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingCell}>
                  · {label("pricing.infants", "Infants")} ({booking.travelers.infants})
                </Text>
                <Text style={styles.pricingCellRight}>
                  —
                </Text>
              </View>
            )}
            {(booking.specialRequestItems ?? []).map((item, i) => (
              <View key={i} style={styles.pricingRow}>
                <Text style={styles.pricingCell}>
                  Extra Request · {item.description}
                </Text>
                <Text style={styles.pricingCellRight}>
                  {formatCurrency(item.price, booking.currency)}
                </Text>
              </View>
            ))}
            <View style={{ ...styles.pricingRow, ...styles.pricingRowLast }}>
              <Text style={{ ...styles.pricingCell, ...styles.pricingTotalLabel }}>
                {label("pricing.totalAmountDue", "Total Amount Due")}
              </Text>
              <Text style={{ ...styles.pricingCellRight, ...styles.pricingTotalValue }}>
                {formatCurrency(booking.totalPrice, booking.currency)}
              </Text>
            </View>
          </View>

          <View style={styles.termsBlock}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 7, gap: 6 }}>
              <SunDiscBullet size={12} />
              <Text style={styles.termsTitle}>{label("section.terms", "Payment & Booking Terms")}</Text>
            </View>
            {[
              { key: "terms.payment.1", fallback: "A 30% non-refundable deposit is required to confirm the booking." },
              { key: "terms.payment.2", fallback: "The remaining balance must be paid no later than 14 days prior to departure." },
              { key: "terms.payment.3", fallback: "Accepted payment methods: Bank transfer, credit/debit card, or cash at our office." },
              { key: "terms.payment.4", fallback: "Cancellations received 30+ days before departure: Deposit retained. 14–29 days: 50% of total due. Less than 14 days: No refund." },
              { key: "terms.payment.5", fallback: `${companyInfo.name} reserves the right to modify the itinerary due to local conditions, safety, or force majeure.` },
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: i < 4 ? 4 : 0 }}>
                <SunDiscBullet size={9} />
                <Text style={styles.termsText}>
                  {label(item.key, item.fallback).replace("{companyName}", companyInfo.name)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}><Text>06</Text></View>
            <Text style={[styles.sectionTitle, headingStyle]}>{label("section.contact", "Operations & Contact Info")}</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <View style={styles.operationsCard}>
            <View style={styles.operationsHeader}>
              <View style={styles.opsBadge}>
                <Text style={styles.opsBadgeText}>{label("general.247", "24/7 Support")}</Text>
              </View>
              <Text style={[styles.opsCardTitle, headingStyle]}>
                {label("ops.roundClock", "Your Operations Team \u2014 Available Round the Clock")}
              </Text>
            </View>
            <SmallAnkhDivider />
            <View style={styles.opsGrid}>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>{label("ops.manager", "Operations Manager")}</Text>
                <Text style={styles.opsValue}>{shapeForPdf(companyInfo.operationsManager.name)}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>{label("ops.directMobile", "Direct Mobile")}</Text>
                <Text style={styles.opsValue}>{companyInfo.operationsManager.phone}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>{label("ops.email", "Operations Email")}</Text>
                <Text style={styles.opsValue}>{companyInfo.operationsManager.email}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>{label("ops.whatsapp", "WhatsApp Hotline")}</Text>
                <Text style={styles.opsValue}>{companyInfo.whatsapp}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>{label("ops.headOffice", "Head Office")}</Text>
                <Text style={styles.opsValue}>{companyInfo.phone}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>{label("ops.companyEmail", "Company Email")}</Text>
                <Text style={styles.opsValue}>{companyInfo.email}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>{label("ops.website", "Website")}</Text>
                <Text style={styles.opsValue}>{companyInfo.website}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>{label("ops.address", "Office Address")}</Text>
                <Text style={styles.opsValue}>{shapeForPdf(companyInfo.address)}</Text>
              </View>
            </View>
          </View>
        </View>
      </ParchmentPage>

      <ParchmentPage companyInfo={companyInfo} languageCode={langCode} pageLabel={itinerary.length > 3 ? "Page 5" : "Page 4"}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}><Text>07</Text></View>
            <Text style={[styles.sectionTitle, headingStyle]}>{label("terms.policy", "Terms & Policy")}</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <View style={styles.termsCard}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <View style={{ marginRight: 6 }}>
                <CartoucheSeal size={13} />
              </View>
              <Text style={{ ...cinzelStyle, fontSize: 9, color: PARCHMENT_COLORS.deepLapis, fontWeight: 700 }}>
                {label("section.terms", "Terms & Conditions")}
              </Text>
            </View>
            {termsItems.map((item, i) => (
              <View key={i} style={styles.termsItemRow}>
                <SunDiscBullet size={10} />
                <Text style={styles.termsItemText}>{item}</Text>
              </View>
            ))}
            <Text style={styles.termsItemText}>
              {label("terms.readFull", "Read the full terms on our website:")}{" "}
              <Link src={TERMS_URL} style={styles.termsLinkText}>
                {TERMS_URL}
              </Link>
            </Text>
            <AnkhDivider color={PARCHMENT_COLORS.antiqueGold} />
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 6 }}>
              <View style={{ marginRight: 6 }}>
                <EyeOfHorusBullet size={13} />
              </View>
              <Text style={{ ...cinzelStyle, fontSize: 9, color: PARCHMENT_COLORS.deepLapis, fontWeight: 700 }}>
                {label("general.privacyPolicy", "Privacy Policy")}
              </Text>
            </View>
            {privacyItems.map((item, i) => (
              <View key={i} style={styles.termsItemRow}>
                <PyramidBullet size={10} />
                <Text style={styles.termsItemText}>{item}</Text>
              </View>
            ))}
            <Text style={styles.termsItemText}>
              {label("privacy.readFull", "Read the full privacy policy:")}{" "}
              <Link src={PRIVACY_URL} style={styles.termsLinkText}>
                {PRIVACY_URL}
              </Link>
            </Text>
          </View>
        </View>

        <View style={styles.reviewCard}>
          <Text style={[styles.reviewTitle, headingStyle]}>{label("review.title", "Leave a Review")}</Text>
          <SmallAnkhDivider />
          <Text style={styles.reviewSubtitle}>
            {label("review.subtitle", "Loved your tour? Your feedback on Google Business helps travelers like you find us.")}
          </Text>
          <Link src={companyInfo.socialMedia?.googleBusiness || "https://share.google/RLldzNlk9YFVuIGbD"}>
            <View style={styles.reviewBadge}>
              <Text style={[styles.reviewBadgeText, headingStyle]}>
                {label("review.cta", "★ Write a Review")}
              </Text>
            </View>
          </Link>
          <Text style={styles.reviewLink}>
            {companyInfo.socialMedia?.googleBusiness || "https://share.google/RLldzNlk9YFVuIGbD"}
          </Text>
        </View>

        <View style={styles.socialRow}>
          {companyInfo.socialMedia?.facebook ? (
            <Link src={companyInfo.socialMedia.facebook} style={styles.socialLinkItem}>
              {label("social.facebook", "Facebook")}
            </Link>
          ) : null}
          {companyInfo.socialMedia?.instagram ? (
            <Link src={companyInfo.socialMedia.instagram} style={styles.socialLinkItem}>
              {label("social.instagram", "Instagram")}
            </Link>
          ) : null}
          {companyInfo.socialMedia?.youtube ? (
            <Link src={companyInfo.socialMedia.youtube} style={styles.socialLinkItem}>
              {label("social.youtube", "YouTube")}
            </Link>
          ) : null}
          {companyInfo.socialMedia?.twitter ? (
            <Link src={companyInfo.socialMedia.twitter} style={styles.socialLinkItem}>
              {label("social.twitter", "X (Twitter)")}
            </Link>
          ) : null}
          {companyInfo.socialMedia?.googleBusiness ? (
            <Link src={companyInfo.socialMedia.googleBusiness} style={styles.socialLinkItem}>
              {label("social.googleBusiness", "Google Business")}
            </Link>
          ) : null}
        </View>
      </ParchmentPage>
    </Document>
  );
}

function SummaryCard({ label, value }: { label: string; value: React.ReactNode }) {
  const getIcon = () => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("total traveler") || lowerLabel.includes("client name")) {
      return <UserIcon />;
    }
    if (lowerLabel.includes("duration") || lowerLabel.includes("period") || lowerLabel.includes("date") || lowerLabel.includes("return")) {
      return <CalendarIcon />;
    }
    if (lowerLabel.includes("meeting") || lowerLabel.includes("location") || lowerLabel.includes("destination") || lowerLabel.includes("pickup")) {
      return <MapPinIcon />;
    }
    if (lowerLabel.includes("amount") || lowerLabel.includes("price") || lowerLabel.includes("email") || lowerLabel.includes("phone") || lowerLabel.includes("whatsapp")) {
      return <SunDiscBullet size={18} />;
    }
    return <View style={styles.summaryItemIcon} />;
  };

  return (
    <View style={styles.summaryItem}>
      <View style={styles.summaryItemIcon}>
        {getIcon()}
      </View>
      <View style={styles.summaryItemTextWrap}>
        <Text style={styles.summaryItemLabel}>{shapeForPdf(label)}</Text>
        {typeof value === "string" ? (
          <Text style={styles.summaryItemValue}>{shapeForPdf(value)}</Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
}

function DayCard({
  day,
  roadmap,
  translatedTitle,
  translatedDescription,
  translatedAccommodation,
  translatedMeals,
  translatedRoadmap,
  tLabels,
  headingStyle = {},
  cinzelStyle = {},
}: {
  day: ItineraryDay;
  roadmap?: string[];
  translatedTitle?: string;
  translatedDescription?: string;
  translatedAccommodation?: string;
  translatedMeals?: string;
  translatedRoadmap?: string;
  tLabels?: { roadmap?: string; stay?: string; meals?: string };
  headingStyle?: Record<string, string>;
  cinzelStyle?: Record<string, string>;
}) {
  const stops = (translatedRoadmap ? translatedRoadmap.split(",").map((s) => s.trim()).filter(Boolean) : roadmap && roadmap.length > 0 ? roadmap : []).map(shapeForPdf);
  const dayTitle = shapeForPdf(translatedTitle || day.title);
  const dayDescription = shapeForPdf(translatedDescription || day.description);
  const accommodation = translatedAccommodation || day.accommodation || "";
  const mealsJoined = translatedMeals || (day.meals ? day.meals.join(", ") : "");
  const accommodationText = shapeForPdf(accommodation);
  const mealsText = shapeForPdf(mealsJoined);
  return (
    <View>
      <View break={false} style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <View style={styles.dayBadge}>
            <Svg width={11} height={11} viewBox="0 0 24 24" style={{ marginRight: 4 }}>
              <G stroke={PARCHMENT_COLORS.deepBrown} strokeWidth={1.8} fill="none" strokeLinecap="round">
                <Path d="M12 5 C 9 5 6.5 7.5 6.5 10.5 C 6.5 13 8.5 15 12 15 C 15.5 15 17.5 13 17.5 10.5 C 17.5 7.5 15 5 12 5 Z" />
                <Path d="M12 13 L 12 18.5 M 9 18.5 L 15 18.5" />
              </G>
            </Svg>
            <Text style={[styles.dayBadgeText, headingStyle]}>DAY {day.day}</Text>
          </View>
          <Text style={[styles.dayTitle, headingStyle]}>{dayTitle}</Text>
        </View>
        <View style={styles.dayContent}>
          <Text style={styles.dayDescription}>{dayDescription}</Text>
          {stops.length > 0 && (
            <View style={styles.dayRoadmap}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 5 }}>
                <PyramidBullet size={10} />
                <Text style={[styles.dayRoadmapTitle, cinzelStyle]}>{tLabels?.roadmap || "Today's Roadmap"}</Text>
              </View>
              {stops.map((stop, i) => (
                <View key={i}>
                  <View style={styles.dayRoadmapRow}>
                    <View style={styles.dayRoadmapIcon}>
                      <LotusBullet size={11} />
                    </View>
                    <Text style={styles.dayRoadmapStop}>{stop}</Text>
                  </View>
                  {i < stops.length - 1 && (
                    <Text style={styles.dayRoadmapArrow}>↓</Text>
                  )}
                </View>
              ))}
            </View>
          )}
          {(accommodation || mealsJoined) ? (
            <View style={styles.metaRow}>
              {accommodation ? (
                <View style={styles.metaItem}>
                  <Svg width={10} height={10} viewBox="0 0 24 24">
                    <G fill={PARCHMENT_COLORS.lapis} opacity={0.85}>
                      <Path d="M2 20 V 10 L 12 4 L 22 10 V 20 H 16 V 13 H 8 V 20 Z" />
                    </G>
                  </Svg>
                  <Text style={styles.metaLabel}>{tLabels?.stay || "Stay"} ·</Text>
                  <Text style={styles.metaValue}>{accommodationText}</Text>
                </View>
              ) : null}
              {mealsJoined ? (
                <View style={styles.metaItem}>
                  <Svg width={10} height={10} viewBox="0 0 24 24">
                    <G fill="none" stroke={PARCHMENT_COLORS.lapis} strokeWidth={2} strokeLinecap="round">
                      <Path d="M4 3 V 19 C 4 20 5 21 6 21 M 8 3 V 19 C 8 20 9 21 10 21 M 14 3 C 12 4 12 7 14 9 C 16 7 16 4 14 3 Z M 14 9 V 21" />
                    </G>
                  </Svg>
                  <Text style={styles.metaLabel}>{tLabels?.meals || "Meals"} ·</Text>
                  <Text style={styles.metaValue}>{mealsText}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      </View>
      <SmallAnkhDivider />
    </View>
  );
}
