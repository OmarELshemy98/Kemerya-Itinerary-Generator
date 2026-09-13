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
  Ellipse,
} from "@react-pdf/renderer";
import type { Tour, BookingConfig, CompanyInfo, ItineraryDay } from "@/types";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import {
  formatDateShort,
  formatCurrency,
  calculateNights,
} from "@/lib/utils";
import { UserIcon, CalendarIcon, MapPinIcon } from "./pdf-icons";
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

/* ============================================================================
 * DESIGN SYSTEM
 * A single source of truth for color + spacing so every panel, border and
 * gap in the document reads as ONE coherent product instead of a collage.
 * ==========================================================================*/

const COLOR = {
  deepBrown: "#3D2B17",
  warmBrown: "#5A4226",
  agedBrown: "#7A6448",
  antiqueGold: "#B8963A",
  royalGold: "#C9A962",
  paleGold: "#E8D7B1",
  lapis: "#1E3A8A",
  deepLapis: "#172554",
  parchmentLight: "#F5EBD3",
  ink: "#2C1E10",
  scarabGreen: "#1F6B45",
  rust: "#8B3A2E", // strike-through / sale-price accent (was ad-hoc before)
  white: "#FDFBF7",
};

// Every "card" panel in the document shares the exact same skin.
const CARD_BG = "rgba(253, 251, 247, 0.5)";
const CARD_BORDER = "rgba(184, 150, 58, 0.55)";
const CARD = {
  backgroundColor: CARD_BG,
  borderWidth: 1,
  borderColor: CARD_BORDER,
} as const;

// One spacing scale used everywhere — nothing outside this set.
const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 30 };

function getOfferMeta(booking: BookingConfig): { title: string; note: string } {
  return {
    title: booking.offerTitle?.trim() || "Exclusive Limited-Time Offer",
    note: booking.offerNote?.trim() || "",
  };
}

/* ============================================================================
 * ICONOGRAPHY — small, purposeful pharaonic glyphs used as list bullets.
 * Kept intentionally restrained: one glyph per icon, no stacked ornaments.
 * ==========================================================================*/

const ScarabBullet = ({ size = 11 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Ellipse cx={12} cy={13} rx={8} ry={9.5} fill={COLOR.scarabGreen} />
      <Path
        d="M4 13 C 4 6.5 7.5 3 12 3 C 16.5 3 20 6.5 20 13 C 20 19.5 16.5 23 12 23 C 7.5 23 4 19.5 4 13 Z"
        fill="none"
        stroke={COLOR.royalGold}
        strokeWidth={1.1}
      />
      <Path d="M12 4 L 12 22" stroke="#0F4D2E" strokeWidth={1} fill="none" opacity={0.8} />
      <Ellipse cx={12} cy={12} rx={4} ry={5.5} fill="#E8F8EE" opacity={0.3} />
    </G>
  </Svg>
);

const EyeOfHorusBullet = ({ size = 11 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Path
        d="M2 11 C 6 4 11 2 14 2 C 17 2 22 4 26 11 C 22 18 17 20 14 20 C 11 20 6 18 2 11 Z"
        transform="translate(-1, 1)"
        fill={COLOR.lapis}
        opacity={0.88}
      />
      <Circle cx={13} cy={12} r={2.5} fill={COLOR.paleGold} />
      <Circle cx={13} cy={12} r={1.1} fill="#0F172A" />
      <Path
        d="M0 14 L 5 13 M 1 18 Q 4 21 7 20 M 13 20 C 13 22 12 24.5 10 25"
        stroke={COLOR.royalGold}
        strokeWidth={1.1}
        fill="none"
        strokeLinecap="round"
      />
    </G>
  </Svg>
);

const PyramidBullet = ({ size = 11 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Path d="M12 1 L 23 22 L 1 22 Z" fill={COLOR.royalGold} />
      <Path d="M12 1 L 12 22" stroke="#FDFBF7" strokeWidth={0.55} fill="none" opacity={0.75} />
      <Path d="M5 11 L 19 11" stroke="#FDFBF7" strokeWidth={0.55} fill="none" opacity={0.6} />
    </G>
  </Svg>
);

const LotusBullet = ({ size = 11 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Path
        d="M12 2 C 9 5 7 10 7 14 C 7 16 9 17 12 17 C 15 17 17 16 17 14 C 17 10 15 5 12 2 Z"
        fill="#C43E6B"
        opacity={0.85}
      />
      <Ellipse cx={12} cy={18} rx={4.5} ry={1.6} fill={COLOR.scarabGreen} opacity={0.88} />
    </G>
  </Svg>
);

const SunDiscBullet = ({ size = 11 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Circle cx={12} cy={12} r={8} fill={COLOR.royalGold} />
      <Circle cx={12} cy={12} r={4} fill="#F39516" opacity={0.9} />
      <Circle cx={12} cy={12} r={2} fill="#FDE68A" />
    </G>
  </Svg>
);

const CartoucheSeal = ({ size = 12 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G fill="none" stroke={COLOR.royalGold} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 3 H 17 V 19 H 9 L 7 21 Z" />
      <G strokeWidth={1.1}>
        <Path d="M10 6 H 14 M 10 9 H 14 M 10 12 H 14" />
      </G>
    </G>
  </Svg>
);

const AnkhGlyph = ({ size = 12, color = COLOR.royalGold }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3 C 8.5 3 6 5.8 6 8.6 C 6 11.4 8.5 13.5 12 13.5 C 15.5 13.5 18 11.4 18 8.6 C 18 5.8 15.5 3 12 3 Z" />
      <Path d="M12 13.5 L 12 21 M 8.5 21 L 15.5 21" />
    </G>
  </Svg>
);

/* --------------------------------------------------------------------------
 * SECTION TITLE ICONOGRAPHY
 * A small, themed gold glyph that sits next to each numbered section title so
 * the reader instantly recognises what a page is about without reading a word.
 * --------------------------------------------------------------------------*/

type SectionGlyphKind =
  | "summary"
  | "overview"
  | "roadmap"
  | "list"
  | "price"
  | "contact"
  | "terms";

const SectionGlyph = ({ kind, size = 15 }: { kind: SectionGlyphKind; size?: number }) => {
  const W = 24;
  const c = COLOR.royalGold;
  const glyphs: Record<SectionGlyphKind, React.ReactNode> = {
    summary: (
      <>
        <Path d="M6 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <Path d="M9 8h4M9 12h5M9 16h3" />
      </>
    ),
    overview: (
      <>
        <Path d="M2 12s3.7-6.5 10-6.5S22 12 22 12s-3.7 6.5-10 6.5S2 12 2 12Z" />
        <Circle cx={12} cy={12} r={3} />
      </>
    ),
    roadmap: (
      <>
        <Path d="M4 5h11a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h11" />
        <Circle cx={4} cy={5} r={2} />
        <Circle cx={20} cy={17} r={2} />
      </>
    ),
    list: (
      <>
        <Path d="M9 5h11M9 12h11M9 19h11" />
        <Path d="M3.5 4.5h0M3.5 11.5h0M3.5 18.5h0" />
        <Path d="M1.5 18l1.3 1.3L5 16.6" />
      </>
    ),
    price: (
      <>
        <Path d="M2 7.5h20v9H2Z" />
        <Circle cx={12} cy={12} r={2.6} />
        <Path d="M6 10.5h0M18 13.5h0" />
      </>
    ),
    contact: (
      <>
        <Path d="M4 3h4l1.6 4.4-2.1 1.8a13.5 13.5 0 0 0 7.3 7.3l1.8-2.1L21 16v4a2 2 0 0 1-2 2A17 17 0 0 1 2 5a2 2 0 0 1 2-2Z" />
      </>
    ),
    terms: (
      <>
        <Path d="M12 2l8 3v6.2C20 16 16.5 19.7 12 22 7.5 19.7 4 16 4 11.2V5Z" />
        <Path d="M9 12l2 2 4-4" />
      </>
    ),
  };
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${W} ${W}`}>
      <G fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        {glyphs[kind]}
      </G>
    </Svg>
  );
};

/** Numbered + iconed section title with the trailing gold rule. */
function SectionHeader({
  S,
  number,
  icon,
  title,
  titleStyle = {},
}: {
  S: typeof styles;
  number: string;
  icon: SectionGlyphKind;
  title: string;
  titleStyle?: Record<string, string>;
}) {
  return (
    <View style={S.sectionHeader}>
      <View style={S.sectionNumber}><Text>{number}</Text></View>
      <View style={S.sectionIcon}><SectionGlyph kind={icon} size={15} /></View>
      <Text style={[S.sectionTitle, titleStyle]}>{title}</Text>
      <View style={S.sectionUnderline} />
    </View>
  );
}

/**
 * The ONE divider used throughout the document. A single hairline with a
 * small gold medallion — replaces the five competing divider styles from
 * the previous version so pages read as calm and premium, not busy.
 */
const Divider = ({
  compact = false,
  color = COLOR.royalGold,
}: {
  compact?: boolean;
  color?: string;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginVertical: compact ? SPACE.xs : SPACE.sm,
    }}
  >
    <View style={{ flex: 1, height: 0.75, backgroundColor: color, opacity: 0.55 }} />
    {!compact && (
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: COLOR.deepLapis,
          borderWidth: 1,
          borderColor: color,
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: SPACE.sm,
        }}
      >
        <AnkhGlyph size={11} color={color} />
      </View>
    )}
    {compact && <View style={{ width: SPACE.sm }} />}
    <View style={{ flex: 1, height: 0.75, backgroundColor: color, opacity: 0.55 }} />
  </View>
);

/* ============================================================================
 * STYLESHEET
 * ==========================================================================*/

const styles = StyleSheet.create({
  page: {
    width: "100%",
    height: "100%",
    backgroundColor: COLOR.parchmentLight,
  },
  parchmentBg: { position: "absolute", top: 0, left: 0, width: 595, height: 842 },
  borderFrame: { position: "absolute", top: 0, left: 0, width: 595, height: 842 },

  contentLayer: {
    // Bottom clearance keeps text safely above the fixed footer band
    // (bottom:18 + ~92pt footer) with a small buffer — no wasted margin
    // beyond what's needed to guarantee zero overlap.
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 124,
    flexDirection: "column",
  },

  footerBand: { position: "absolute", bottom: 18, left: 38, right: 38, width: 519, flexDirection: "column" },
  nileImageWrap: { width: "100%", height: 30, borderWidth: 1, borderColor: COLOR.royalGold, overflow: "hidden", marginBottom: SPACE.xs },
  nileImage: { width: "100%", height: "100%", objectFit: "cover" },
  companyRect: {
    borderWidth: 1,
    borderColor: COLOR.royalGold,
    backgroundColor: "rgba(253, 251, 247, 0.78)",
    paddingVertical: SPACE.xs + 1,
    paddingHorizontal: SPACE.sm,
  },
  companyRectRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: SPACE.md },
  companyRectCell: { flexDirection: "row", alignItems: "center", gap: 3 },
  companyRectIcon: { width: 12, height: 12, justifyContent: "center", alignItems: "center" },
  companyRectText: { fontSize: 7, color: COLOR.deepBrown, fontWeight: 700, letterSpacing: 0.2 },
  companyRectAddressRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3, marginTop: 3 },
  companyRectAddress: { fontSize: 6.6, color: COLOR.warmBrown, fontWeight: 600, maxWidth: 420 },
  footerCaption: {
    marginTop: SPACE.xs,
    paddingHorizontal: SPACE.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerBrand: { fontSize: 7.5, color: COLOR.warmBrown, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const },
  footerPage: { fontSize: 7.5, color: COLOR.agedBrown, fontWeight: 700, letterSpacing: 1 },
  footerTagline: { fontSize: 6.5, color: COLOR.antiqueGold, letterSpacing: 2.5, textTransform: "uppercase" as const, marginTop: 1 },

  // ---- Header -------------------------------------------------------------
  headerBox: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: SPACE.md,
    gap: SPACE.xs,
  },
  officialLogo: { width: 168, height: 64, objectFit: "contain", alignSelf: "center" },
  officialLogoSmall: { width: 118, height: 46, objectFit: "contain", alignSelf: "center" },
  brandTitle: {
    fontSize: 20,
    color: COLOR.deepBrown,
    letterSpacing: 2.5,
    fontWeight: 700,
    textAlign: "center",
    lineHeight: 1.3,
  },
  brandTagline: {
    fontSize: 8.5,
    color: COLOR.agedBrown,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    textAlign: "center",
  },

  bookingRefBadge: {
    backgroundColor: COLOR.deepBrown,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs + 2,
    alignSelf: "flex-start",
    marginBottom: SPACE.md,
    borderLeftWidth: 3,
    borderLeftColor: COLOR.royalGold,
  },
  bookingRefText: { color: COLOR.royalGold, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2 },

  // ---- Hero card ------------------------------------------------------------
  heroCard: {
    ...CARD,
    borderWidth: 1.4,
    padding: SPACE.md,
    marginBottom: SPACE.md,
  },
  clientBadge: {
    backgroundColor: COLOR.antiqueGold,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs - 1,
    alignSelf: "center",
    marginBottom: SPACE.sm,
  },
  clientBadgeText: { color: COLOR.deepBrown, fontSize: 7.5, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" as const },
  heroSubtitle: {
    color: COLOR.lapis,
    fontSize: 8.5,
    letterSpacing: 3,
    textTransform: "uppercase" as const,
    textAlign: "center",
    marginBottom: SPACE.xs,
  },
  heroTourName: {
    color: COLOR.ink,
    fontSize: 17,
    lineHeight: 1.4,
    textAlign: "center",
    marginBottom: SPACE.sm,
  },
  heroGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm, marginTop: SPACE.sm },
  heroStat: { width: "31.5%", paddingRight: SPACE.xs, borderRightWidth: 0.8, borderRightColor: COLOR.paleGold, marginBottom: SPACE.sm },
  heroStatLast: { width: "31.5%", marginBottom: SPACE.sm },
  heroStatLabel: { color: COLOR.agedBrown, fontSize: 6.8, letterSpacing: 1.3, textTransform: "uppercase" as const, marginBottom: 2 },
  heroStatValue: { color: COLOR.deepBrown, fontSize: 10, fontWeight: 700 },

  strikethroughOldPrice: {
    color: COLOR.agedBrown,
    textDecorationLine: "line-through" as const,
    textDecorationColor: COLOR.rust,
    fontSize: 9,
  },
  offerPriceValue: { color: COLOR.scarabGreen, fontSize: 10.5, fontWeight: 700 },

  // ---- Sections -------------------------------------------------------------
  section: { marginBottom: SPACE.md },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: SPACE.sm, gap: SPACE.sm },
  sectionNumber: {
    width: 24,
    height: 24,
    backgroundColor: COLOR.deepLapis,
    borderWidth: 1,
    borderColor: COLOR.royalGold,
    color: COLOR.royalGold,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 24,
  },
  sectionTitle: { fontSize: 12.5, color: COLOR.deepBrown, letterSpacing: 0.4, flexShrink: 1 },
  sectionIcon: { width: 20, height: 20, justifyContent: "center", alignItems: "center" },
  sectionUnderline: { flex: 1, height: 1, backgroundColor: COLOR.royalGold, opacity: 0.6 },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACE.xs + 2,
    ...CARD,
    padding: SPACE.sm,
  },
  summaryItem: {
    width: "48.7%",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: SPACE.sm,
    borderWidth: 0.7,
    borderColor: COLOR.paleGold,
    backgroundColor: "rgba(255, 253, 247, 0.35)",
    gap: SPACE.xs + 3,
  },
  summaryItemIcon: { width: 18, height: 18, justifyContent: "center", alignItems: "center" },
  summaryItemLabel: { fontSize: 6.8, color: COLOR.agedBrown, letterSpacing: 0.6, textTransform: "uppercase" as const, marginBottom: 2 },
  summaryItemValue: { fontSize: 8.8, color: COLOR.ink, fontWeight: 600 },
  summaryItemTextWrap: { flex: 1, flexDirection: "column" },
  summaryStrikethrough: { fontSize: 8, color: COLOR.agedBrown, textDecorationLine: "line-through" as const, textDecorationColor: COLOR.rust },
  summaryOfferValue: { fontSize: 10.5, color: COLOR.scarabGreen, fontWeight: 700 },

  offerBanner: {
    marginTop: SPACE.sm,
    borderWidth: 1,
    borderColor: COLOR.royalGold,
    backgroundColor: "rgba(255, 248, 224, 0.55)",
    padding: SPACE.sm + 2,
  },
  offerBannerTop: { flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginBottom: SPACE.xs },
  offerBannerBadge: {
    backgroundColor: COLOR.deepLapis,
    color: COLOR.royalGold,
    fontSize: 6.5,
    fontWeight: 700,
    letterSpacing: 1,
    paddingHorizontal: SPACE.xs + 2,
    paddingVertical: 3,
  },
  offerBannerTitle: { fontSize: 10, color: COLOR.deepBrown, marginBottom: SPACE.xs },
  offerBannerPrices: { flexDirection: "row", alignItems: "flex-end", flexWrap: "wrap", gap: SPACE.sm },
  offerBannerOld: { fontSize: 10, color: COLOR.agedBrown, textDecorationLine: "line-through" as const, textDecorationColor: COLOR.rust },
  offerBannerNew: { fontSize: 16, color: COLOR.deepBrown, fontWeight: 700 },
  offerBannerPct: { fontSize: 7.5, color: COLOR.scarabGreen, fontWeight: 700 },
  offerBannerNote: { fontSize: 7.8, color: COLOR.warmBrown, marginTop: SPACE.xs, lineHeight: 1.5 },
  offerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLOR.scarabGreen,
    paddingHorizontal: SPACE.xs + 2,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  offerBadgeText: { color: "#FFFFFF", fontSize: 6.5, fontWeight: 700, letterSpacing: 0.5 },

  // ---- Day cards --------------------------------------------------------------
  dayCard: { ...CARD, marginBottom: SPACE.sm, overflow: "hidden" },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLOR.deepLapis,
    padding: SPACE.sm,
    gap: SPACE.sm,
    borderBottomWidth: 1.4,
    borderBottomColor: COLOR.royalGold,
  },
  dayBadge: {
    backgroundColor: COLOR.royalGold,
    paddingHorizontal: SPACE.xs + 3,
    paddingVertical: SPACE.xs - 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dayBadgeText: { color: COLOR.deepBrown, fontSize: 8, letterSpacing: 0.5, fontWeight: 700 },
  dayTitle: { color: COLOR.royalGold, fontSize: 11, flex: 1 },
  dayContent: { padding: SPACE.md },
  dayDescription: { fontSize: 9.3, color: COLOR.ink, lineHeight: 1.7, marginBottom: SPACE.sm, textAlign: "justify" },
  dayRoadmap: { marginTop: SPACE.xs, borderWidth: 0.8, borderColor: COLOR.royalGold, backgroundColor: "rgba(255, 253, 245, 0.6)", padding: SPACE.sm },
  dayRoadmapTitle: { fontSize: 6.8, color: COLOR.warmBrown, letterSpacing: 1, marginBottom: SPACE.xs, fontWeight: 700 },
  dayRoadmapRow: { flexDirection: "row", alignItems: "flex-start", gap: SPACE.xs + 2, marginBottom: 3 },
  dayRoadmapStop: { flex: 1, fontSize: 8, color: COLOR.deepBrown, lineHeight: 1.4 },
  metaRow: { flexDirection: "row", gap: SPACE.sm, marginTop: SPACE.xs, flexWrap: "wrap" },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 250, 232, 0.55)",
    paddingHorizontal: SPACE.xs + 2,
    paddingVertical: 3,
    borderWidth: 0.6,
    borderColor: COLOR.paleGold,
  },
  metaLabel: { fontSize: 6.8, color: COLOR.agedBrown, textTransform: "uppercase" as const, letterSpacing: 0.4, fontWeight: 700 },
  metaValue: { fontSize: 7.6, color: COLOR.deepBrown, fontWeight: 700 },

  twoCol: { flexDirection: "row", gap: SPACE.sm },
  col: { flex: 1, width: "49%" },
  panelCard: { ...CARD, padding: SPACE.md },
  sectionCardTitle: { fontSize: 9.5, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: SPACE.sm, flexDirection: "row", alignItems: "center", gap: SPACE.xs },
  listItem: { flexDirection: "row", marginBottom: SPACE.xs + 2, gap: SPACE.xs + 2, alignItems: "flex-start" },
  listItemIcon: { width: 11, height: 11, flexShrink: 0, marginTop: 2 },
  listItemText: { fontSize: 9, lineHeight: 1.55, flex: 1, color: COLOR.ink },

  pricingTable: { ...CARD, padding: SPACE.md, overflow: "hidden" },
  pricingRow: {
    flexDirection: "row",
    paddingVertical: SPACE.xs + 3,
    paddingHorizontal: SPACE.sm,
    borderBottomWidth: 0.7,
    borderBottomColor: COLOR.paleGold,
  },
  pricingRowLast: { borderBottomWidth: 0 },
  pricingCell: { flex: 1, fontSize: 9, color: COLOR.deepBrown },
  pricingCellRight: { flex: 1, textAlign: "right", fontSize: 9, color: COLOR.deepBrown, fontWeight: 600 },
  pricingHeaderCell: { fontSize: 7, textTransform: "uppercase" as const, letterSpacing: 0.8, color: COLOR.agedBrown, fontWeight: 700 },
  pricingTotalLabel: { color: COLOR.deepBrown, fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.8 },
  pricingTotalValue: { color: COLOR.deepBrown, fontSize: 14, fontWeight: 700 },

  termsBlock: { ...CARD, padding: SPACE.md, marginTop: SPACE.sm },
  termsTitle: { fontSize: 8, fontWeight: 700, color: COLOR.lapis, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: SPACE.xs + 2 },
  termsText: { fontSize: 7.6, color: COLOR.deepBrown, lineHeight: 1.6, textAlign: "justify", flex: 1 },
  termsCard: { ...CARD, padding: SPACE.md },
  termsItemRow: { flexDirection: "row", gap: SPACE.xs + 1, marginBottom: SPACE.xs + 1, alignItems: "flex-start" },
  termsItemText: { flex: 1, fontSize: 7.6, color: COLOR.deepBrown, lineHeight: 1.5, textAlign: "justify" },
  termsLinkText: { fontSize: 7.6, color: COLOR.lapis, textDecoration: "underline" },

  notesBlock: { ...CARD, padding: SPACE.md, marginBottom: SPACE.lg },
  notesTitle: { fontSize: 8, fontWeight: 700, color: COLOR.lapis, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: SPACE.xs },
  notesText: { fontSize: 8.6, color: COLOR.deepBrown, lineHeight: 1.55 },
  dropCap: { fontSize: 24, color: COLOR.lapis, lineHeight: 1, marginRight: 3, fontWeight: 700 },

  reviewCard: { ...CARD, padding: SPACE.lg, alignItems: "center", marginTop: SPACE.sm },
  reviewTitle: { color: COLOR.deepBrown, fontSize: 11.5, letterSpacing: 0.4 },
  reviewSubtitle: { color: COLOR.agedBrown, fontSize: 8, textAlign: "center", marginTop: SPACE.xs, lineHeight: 1.5 },
  reviewBadge: { backgroundColor: COLOR.royalGold, paddingHorizontal: SPACE.md, paddingVertical: SPACE.xs + 2, marginTop: SPACE.sm, borderWidth: 0.8, borderColor: COLOR.deepBrown },
  reviewBadgeText: { color: COLOR.deepBrown, fontSize: 8.5, letterSpacing: 0.6, fontWeight: 700 },
  reviewLink: { color: COLOR.agedBrown, fontSize: 7, marginTop: SPACE.xs },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACE.md,
    marginTop: SPACE.sm,
    paddingTop: SPACE.sm,
    borderTopWidth: 0.8,
    borderTopColor: COLOR.antiqueGold,
  },
  socialLinkItem: { fontSize: 7.6, color: COLOR.deepBrown, fontWeight: 700 },

  operationsCard: { ...CARD, borderWidth: 1.2, padding: SPACE.md, marginTop: SPACE.sm },
  operationsHeader: { flexDirection: "row", alignItems: "center", marginBottom: SPACE.xs, gap: SPACE.sm },
  opsBadge: { backgroundColor: COLOR.lapis, paddingHorizontal: SPACE.xs + 2, paddingVertical: 3 },
  opsBadgeText: { color: COLOR.royalGold, fontSize: 7, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" as const },
  opsCardTitle: { color: COLOR.deepBrown, fontSize: 10.5, flex: 1, flexShrink: 1, lineHeight: 1.35 },
  opsGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm },
  opsItem: { width: "48%", flexDirection: "column", gap: 2, paddingVertical: SPACE.xs, paddingRight: SPACE.xs, borderBottomWidth: 0.6, borderBottomColor: COLOR.paleGold },
  opsLabel: { fontSize: 6.6, color: COLOR.agedBrown, textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 1 },
  opsValue: { fontSize: 9, color: COLOR.deepBrown, fontWeight: 600, lineHeight: 1.35 },

  companyShowcase: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: COLOR.deepLapis,
    borderWidth: 1.4,
    borderColor: COLOR.royalGold,
    padding: SPACE.md,
    marginTop: SPACE.sm,
    gap: SPACE.xs + 2,
  },
  companyShowcaseLogo: { width: 140, height: 54, objectFit: "contain", alignSelf: "center" },
  companyShowcaseName: { fontSize: 14, color: COLOR.royalGold, letterSpacing: 2, fontWeight: 700, textAlign: "center", lineHeight: 1.35 },
  companyShowcaseTagline: { fontSize: 8, color: COLOR.paleGold, letterSpacing: 1.5, textTransform: "uppercase" as const, textAlign: "center", lineHeight: 1.4 },
  companyShowcaseAbout: { fontSize: 8, color: "#F5EBD3", textAlign: "center", lineHeight: 1.55, marginTop: 2 },
  companyShowcaseContact: { width: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: SPACE.xs, paddingHorizontal: SPACE.xs },
  companyContactCell: { width: "48%", flexDirection: "row", alignItems: "center", gap: SPACE.xs + 2, marginBottom: SPACE.xs + 2 },
  companyContactIcon: { width: 11, height: 11, flexShrink: 0, marginTop: 1 },
  companyContactTextWrap: { flex: 1, flexDirection: "column", gap: 1 },
  companyContactLabel: { fontSize: 6.2, color: COLOR.royalGold, letterSpacing: 0.8, textTransform: "uppercase" as const, fontWeight: 700, lineHeight: 1.3 },
  companyContactValue: { fontSize: 7.6, color: "#F5EBD3", letterSpacing: 0.2, lineHeight: 1.4 },
});

/* ============================================================================
 * ASSETS
 * ==========================================================================*/

function resolvePdfAsset(filename: string): string {
  if (typeof window !== "undefined") return `/images/${filename}`;
  try {
    const sep = typeof process !== "undefined" && process.platform === "win32" ? "\\" : "/";
    const cwd = typeof process !== "undefined" && typeof process.cwd === "function" ? process.cwd() : "";
    if (cwd) return `${cwd}${sep}public${sep}images${sep}${filename}`;
  } catch {
    /* fall through */
  }
  return `${process.cwd()}/public/images/${filename}`;
}

const PARCHMENT_SRC = resolvePdfAsset("parchment.svg");
const BORDER_SRC = resolvePdfAsset("border_pattern.svg");
const NILE_SRC = resolvePdfAsset("nile_sunset.svg");
const LOGO_SRC = resolvePdfAsset("pdf-kemerya-logo.png");

/* ============================================================================
 * RTL SUPPORT (fixed)
 * The previous version mutated the module-level `styles` object AND wrote to
 * `globalThis`, which is unsafe: any two PDFs rendered concurrently (e.g. one
 * Arabic + one English request at the same time on the server) would corrupt
 * each other's layout. This version computes mirrored styles PURELY, on every
 * render, into a local object — no shared/global state, no race conditions.
 * ==========================================================================*/

const LR_PAIRS: Array<[string, string]> = [
  ["paddingLeft", "paddingRight"],
  ["marginLeft", "marginRight"],
  ["borderLeftWidth", "borderRightWidth"],
  ["borderLeftColor", "borderRightColor"],
  ["borderTopLeftRadius", "borderTopRightRadius"],
  ["borderBottomLeftRadius", "borderBottomRightRadius"],
];

function mirrorOne(style: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...style };
  for (const [l, r] of LR_PAIRS) {
    if (l in style || r in style) {
      out[l] = style[r];
      out[r] = style[l];
    }
  }
  if (style.flexDirection === "row") out.flexDirection = "row-reverse";
  if (style.justifyContent === "flex-start") out.justifyContent = "flex-end";
  else if (style.justifyContent === "flex-end") out.justifyContent = "flex-start";
  if (
    !("textAlign" in style) &&
    ("fontSize" in style || "color" in style || "fontFamily" in style || "lineHeight" in style)
  ) {
    out.textAlign = "right";
  }
  return out;
}

/** Builds an RTL-mirrored copy of the whole stylesheet, or returns the
 * original (LTR) stylesheet untouched. Pure function — safe under
 * concurrent renders. */
function useDirectionalStyles(rtl: boolean): typeof styles {
  return React.useMemo(() => {
    if (!rtl) return styles;
    const mirrored: Record<string, Record<string, unknown>> = {};
    for (const key of Object.keys(styles)) {
      mirrored[key] = mirrorOne((styles as unknown as Record<string, Record<string, unknown>>)[key]);
    }
    return mirrored as unknown as typeof styles;
  }, [rtl]);
}

/* ============================================================================
 * PAGE FRAME
 * ==========================================================================*/

function ParchmentPage({
  children,
  companyInfo,
  languageCode = "en",
  pageLabel,
  rtl,
  footerTagline,
  brandHeaderVariant = "compact",
  S,
}: {
  children: React.ReactNode;
  companyInfo?: CompanyInfo;
  languageCode?: string;
  pageLabel?: string;
  rtl: boolean;
  footerTagline?: string;
  brandHeaderVariant?: "full" | "compact";
  S: typeof styles;
}) {
  const bodyFont = getGlobalFont(languageCode);
  const latinDisplay = isLatinDisplayLanguage(languageCode);
  const brandFont = latinDisplay ? "Cinzel" : bodyFont;

  return (
    <Page size="A4" style={[S.page, { direction: rtl ? "rtl" : "ltr", fontFamily: bodyFont }]}>
      {/* Background layers first so they sit behind everything and repeat
          on every page without pushing content down. */}
      <Image src={PARCHMENT_SRC} style={S.parchmentBg} fixed />
      <Image src={BORDER_SRC} style={S.borderFrame} fixed />

      <View style={[S.contentLayer, { fontFamily: bodyFont, direction: rtl ? "rtl" : "ltr" }]}>
        {brandHeaderVariant === "full" ? (
          <View style={S.headerBox}>
            <Image src={LOGO_SRC} style={S.officialLogo} />
            <Text style={[S.brandTitle, { fontFamily: brandFont }]}>
              {companyInfo?.name || "KEMERYA TOURS"}
            </Text>
            {companyInfo?.tagline ? (
              <Text style={[S.brandTagline, { fontFamily: bodyFont }]}>{shapeForPdf(companyInfo.tagline)}</Text>
            ) : null}
            <Divider />
          </View>
        ) : (
          <View style={[S.headerBox, { marginBottom: SPACE.sm }]}>
            <Image src={LOGO_SRC} style={S.officialLogoSmall} />
            <Divider compact />
          </View>
        )}
        {children}
      </View>

      <View style={S.footerBand} fixed>
        <View style={S.nileImageWrap}>
          <Image src={NILE_SRC} style={S.nileImage} />
        </View>
        <View style={S.companyRect}>
          <View style={S.companyRectRow}>
              {companyInfo?.phone ? (
                <View style={S.companyRectCell}>
                  <View style={S.companyRectIcon}><SunDiscBullet size={8} /></View>
                  <Text style={S.companyRectText}>{companyInfo.phone}</Text>
                </View>
              ) : null}
              {companyInfo?.email ? (
                <View style={S.companyRectCell}>
                  <View style={S.companyRectIcon}><EyeOfHorusBullet size={8} /></View>
                  <Text style={S.companyRectText}>{companyInfo.email}</Text>
                </View>
              ) : null}
              {companyInfo?.website ? (
                <View style={S.companyRectCell}>
                  <View style={S.companyRectIcon}><ScarabBullet size={8} /></View>
                  <Text style={S.companyRectText}>{companyInfo.website}</Text>
                </View>
              ) : null}
              {companyInfo?.whatsapp ? (
                <View style={S.companyRectCell}>
                  <View style={S.companyRectIcon}><LotusBullet size={8} /></View>
                  <Text style={S.companyRectText}>WhatsApp {companyInfo.whatsapp}</Text>
                </View>
              ) : null}
            </View>
            {companyInfo?.address ? (
              <View style={S.companyRectAddressRow}>
                <View style={S.companyRectIcon}><AnkhGlyph size={8} /></View>
                <Text style={S.companyRectAddress}>{shapeForPdf(companyInfo.address)}</Text>
              </View>
            ) : null}
          </View>
        <View style={S.footerCaption}>
          <View>
            <Text style={[S.footerBrand, { fontFamily: brandFont }]}>{companyInfo?.name || "KEMERYA TOURS"}</Text>
            <Text style={[S.footerTagline, { fontFamily: brandFont }]}>
              {footerTagline || "Curated Egyptian Journeys · Est. Luxury"}
            </Text>
          </View>
          <Text style={S.footerPage}>{pageLabel || "Page 1"}</Text>
        </View>
      </View>
    </Page>
  );
}

/* ============================================================================
 * DATA HELPERS (unchanged behaviour)
 * ==========================================================================*/

function buildItineraryList(tour: Tour | null, booking: BookingConfig): ItineraryDay[] {
  if (booking.isCustomTour) {
    if (booking.customItinerary && booking.customItinerary.length > 0) return booking.customItinerary;
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
  if (booking.isCustomTour) return booking.customTourTitle || "Custom Private Tour";
  return tour?.title || "Kemerya Tours - Arranged Journey";
}

function getTourDurationDays(tour: Tour | null, booking: BookingConfig): number {
  const nights = calculateNights(new Date(booking.startDate), new Date(booking.endDate));
  return nights + 1;
}

function getInclusions(tour: Tour | null, booking: BookingConfig): string[] {
  if (booking.inclusions?.length) return booking.inclusions;
  if (booking.isCustomTour && booking.customInclusions?.length) return booking.customInclusions;
  return tour?.inclusions ?? [];
}

function getExclusions(tour: Tour | null, booking: BookingConfig): string[] {
  if (booking.exclusions?.length) return booking.exclusions;
  if (booking.isCustomTour && booking.customExclusions?.length) return booking.customExclusions;
  return tour?.exclusions ?? [];
}

/* ============================================================================
 * MAIN DOCUMENT
 * ==========================================================================*/

export function ItineraryPDF({
  tour,
  booking,
  companyInfo = KEMERYA_COMPANY_INFO,
  translatedData,
  languageCode,
}: ItineraryPDFProps) {
  const tourTitle = getTourTitle(tour, booking);
  const daysCount = getTourDurationDays(tour, booking);
  const nights = Math.max(daysCount - 1, calculateNights(new Date(booking.startDate), new Date(booking.endDate)));
  const itinerary = buildItineraryList(tour, booking);
  const inclusions = getInclusions(tour, booking);
  const exclusions = getExclusions(tour, booking);
  const totalTravelers = booking.travelers.adults + booking.travelers.children + booking.travelers.infants;
  const bookingRef = booking.id.replace(/^bk-/, "").toUpperCase();

  const totalTravelersTextParts: string[] = [];
  if (booking.travelers.adults > 0) totalTravelersTextParts.push(`${booking.travelers.adults} Adult${booking.travelers.adults > 1 ? "s" : ""}`);
  if (booking.travelers.children > 0) totalTravelersTextParts.push(`${booking.travelers.children} Child${booking.travelers.children > 1 ? "ren" : ""}`);
  if (booking.travelers.infants > 0) totalTravelersTextParts.push(`${booking.travelers.infants} Infant${booking.travelers.infants > 1 ? "s" : ""}`);
  const travelersText = totalTravelersTextParts.join(", ");

  const langCode = languageCode ?? "en";
  const rtl = isRTL(langCode);
  const S = useDirectionalStyles(rtl); // pure, per-render — no shared mutable state
  const sh = shapeForPdf;

  const hasTranslation = Boolean(translatedData && languageCode);

  const label = (key: string, fallback: string): string => {
    if (!translatedData) return sh(fallback);
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

  const t = (key: string, fallback: string): string => sh(getTranslatedValue(translatedData, key, fallback) || fallback);

  const tList = (key: string, fallback: string[]): string[] => {
    if (!translatedData) return fallback;
    const raw = translatedData[key];
    if (!Array.isArray(raw)) return fallback;
    const strings = raw.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
    if (strings.length === 0) return fallback;
    return fallback.map((fb, i) => (i < strings.length && strings[i].trim().length > 0 ? sh(strings[i]) : sh(fb)));
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
  const privacyItems = getTranslatedArray(translatedData, "privacy.items", getPrivacyItems(booking)).map(sh);
  const overviewParas = getTranslatedArray(translatedData, "tour.overview", tour?.overview ?? []).map(sh);

  const displayTourTitle = hasTranslation
    ? booking.isCustomTour
      ? t("booking.customTourTitle", tourTitle)
      : t("tour.title", tourTitle)
    : tourTitle;

  const bodyFont = getGlobalFont(langCode);
  const latinDisplay = isLatinDisplayLanguage(langCode);
  const cinzelFont = latinDisplay ? "Cinzel" : bodyFont;
  const headingFont = latinDisplay ? "Cinzel Decorative" : bodyFont;
  const cinzelStyle = { fontFamily: cinzelFont };
  const headingStyle = { fontFamily: headingFont };

  const page2Label = "Page 2";
  const hasExtraDays = itinerary.length > 3;

  return (
    <Document title={`${tourTitle} - Kemerya Tours Itinerary`} author="Kemerya Tours" creator="Kemerya Tours Dashboard">
      {/* ---------------- PAGE 1 — Cover + Summary ---------------- */}
      <ParchmentPage
        brandHeaderVariant="full"
        companyInfo={companyInfo}
        languageCode={langCode}
        pageLabel="Page 1"
        rtl={rtl}
        footerTagline={label("footer.tagline", "Curated Egyptian Journeys · Est. Luxury")}
        S={S}
      >
        <View style={S.bookingRefBadge}>
          <Text style={[S.bookingRefText, cinzelStyle]}>Ref: {bookingRef}</Text>
        </View>

        <View style={S.heroCard}>
          <View style={S.clientBadge}>
            <Text style={S.clientBadgeText}>Booking Reference · {bookingRef}</Text>
          </View>
          <Text style={[S.heroSubtitle, cinzelStyle]}>{label("hero.subtitle", "Your Exclusive Travel Itinerary")}</Text>
          <Text style={[S.heroTourName, headingStyle]}>{displayTourTitle}</Text>

          <View style={S.heroGrid}>
            <View style={S.heroStat}>
              <Text style={S.heroStatLabel}>{label("hero.departureDate", "Departure Date")}</Text>
              <Text style={S.heroStatValue}>{formatDateShort(booking.startDate)}</Text>
            </View>
            <View style={S.heroStat}>
              <Text style={S.heroStatLabel}>{label("hero.returnDate", "Return Date")}</Text>
              <Text style={S.heroStatValue}>{formatDateShort(booking.endDate)}</Text>
            </View>
            <View style={S.heroStatLast}>
              <Text style={S.heroStatLabel}>{label("hero.duration", "Duration")}</Text>
              <Text style={S.heroStatValue}>{daysCount} Days / {nights} Nights</Text>
            </View>
            <View style={S.heroStat}>
              <Text style={S.heroStatLabel}>{label("hero.travelers", "Travelers")}</Text>
              <Text style={S.heroStatValue}>{totalTravelers} Guest{totalTravelers > 1 ? "s" : ""}</Text>
            </View>
            <View style={S.heroStat}>
              <Text style={S.heroStatLabel}>{label("hero.totalPrice", "Total Price")}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                {booking.offerPrice != null && booking.offerPrice > 0 ? (
                  <>
                    <Text style={[S.heroStatValue, S.strikethroughOldPrice]}>{formatCurrency(booking.totalPrice, booking.currency)}</Text>
                    <Text style={S.offerPriceValue}>{formatCurrency(booking.offerPrice, booking.currency)}</Text>
                    {booking.totalPrice > 0 && (
                      <View style={S.offerBadge}>
                        <Text style={S.offerBadgeText}>
                          {Math.round(((booking.totalPrice - booking.offerPrice) / booking.totalPrice) * 100)}% OFF
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={S.heroStatValue}>{formatCurrency(booking.totalPrice, booking.currency)}</Text>
                )}
              </View>
            </View>
            <View style={S.heroStatLast}>
              <Text style={S.heroStatLabel}>{label("hero.reference", "Reference")}</Text>
              <Text style={S.heroStatValue}>#{bookingRef}</Text>
            </View>
          </View>
        </View>

        <View style={S.section}>
          <SectionHeader S={S} number="01" icon="summary" title={label("section.summary", "Booking Summary")} titleStyle={headingStyle} />
          <View style={S.summaryGrid}>
            <SummaryCard S={S} label={label("summary.totalTravelers", "Total Travelers")} value={`${totalTravelers} (${travelersText})`} />
            <SummaryCard S={S} label={label("summary.tourDuration", "Tour Duration")} value={`${daysCount} Days / ${nights} Nights`} />
            <SummaryCard
              S={S}
              label={label("summary.travelPeriod", "Travel Period")}
              value={`${formatDateShort(booking.startDate)} → ${formatDateShort(booking.endDate)}`}
            />
            <SummaryCard
              S={S}
              label={`${label("summary.totalAmount", "Total Amount")} (${booking.currency})`}
              value={
                booking.offerPrice && booking.offerPrice > 0 ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={[S.summaryItemValue, S.summaryStrikethrough]}>{formatCurrency(booking.totalPrice, booking.currency)}</Text>
                    <Text style={S.summaryOfferValue}>{formatCurrency(booking.offerPrice, booking.currency)}</Text>
                  </View>
                ) : (
                  formatCurrency(booking.totalPrice, booking.currency)
                )
              }
            />
            {booking.clientName ? <SummaryCard S={S} label={label("summary.clientName", "Client Name")} value={booking.clientName} /> : null}
            {booking.clientEmail ? <SummaryCard S={S} label={label("summary.clientEmail", "Client Email")} value={booking.clientEmail} /> : null}
            {booking.clientPhone ? <SummaryCard S={S} label={label("summary.clientPhone", "Client Phone")} value={booking.clientPhone} /> : null}
            {booking.clientWhatsapp ? <SummaryCard S={S} label={label("summary.clientWhatsapp", "Client WhatsApp")} value={booking.clientWhatsapp} /> : null}
            {booking.meetingPoint ? <SummaryCard S={S} label={label("summary.meetingPoint", "Meeting Point")} value={booking.meetingPoint} /> : null}
            {booking.flightArrival ? (
              <SummaryCard S={S} label={label("summary.airportArrival", "Airport Arrival / Tour Start")} value={booking.flightArrival.replace("T", " · ")} />
            ) : null}
            {booking.pickupTime ? <SummaryCard S={S} label={label("summary.pickupTime", "Pickup Time")} value={booking.pickupTime} /> : null}
          </View>
        </View>

        {booking.offerPrice != null && booking.offerPrice > 0 && (() => {
          const meta = getOfferMeta(booking);
          const pct = Math.round(((booking.totalPrice - booking.offerPrice) / booking.totalPrice) * 100);
          return (
            <View style={S.offerBanner}>
              <View style={S.offerBannerTop} wrap={false}>
                <ScarabBullet size={14} />
                <Text style={[S.offerBannerBadge, cinzelStyle]}>{pct > 0 ? `SPECIAL OFFER · SAVE ${pct}%` : "SPECIAL OFFER"}</Text>
              </View>
              <Text style={[S.offerBannerTitle, cinzelStyle]}>{meta.title}</Text>
              <View style={S.offerBannerPrices}>
                <Text style={S.offerBannerOld}>{formatCurrency(booking.totalPrice, booking.currency)}</Text>
                <Text style={S.offerBannerNew}>{formatCurrency(booking.offerPrice, booking.currency)}</Text>
                {pct > 0 && <Text style={S.offerBannerPct}>You save {formatCurrency(booking.totalPrice - booking.offerPrice, booking.currency)}</Text>}
              </View>
              {meta.note ? <Text style={S.offerBannerNote}>{meta.note}</Text> : null}
            </View>
          );
        })()}

        {!booking.isCustomTour && tour && (overviewParas.length > 0 || tour.location || tour.group || tour.language || tour.durationLabel) ? (
          <View style={S.section}>
            <SectionHeader S={S} number="02" icon="overview" title={label("section.overview", "Tour Overview")} titleStyle={headingStyle} />
            {overviewParas.map((para, i) =>
              i === 0 && para.length > 0 && !rtl ? (
                <Text key={i} style={{ ...S.notesText, marginBottom: SPACE.xs }}>
                  <Text style={[S.dropCap, headingStyle]}>{para.charAt(0)}</Text>
                  {para.slice(1)}
                </Text>
              ) : (
                <Text key={i} style={{ ...S.notesText, marginBottom: SPACE.xs }}>{para}</Text>
              )
            )}
            {(tour.location || tour.group || tour.language || tour.durationLabel) ? (
              <View style={{ ...S.summaryGrid, marginTop: SPACE.sm }}>
                {tour.durationLabel ? <SummaryCard S={S} label="Duration" value={tour.durationLabel} /> : null}
                {tour.location ? <SummaryCard S={S} label="Location" value={tour.location} /> : null}
                {tour.group ? <SummaryCard S={S} label="Group" value={tour.group} /> : null}
                {tour.language ? <SummaryCard S={S} label="Language" value={tour.language} /> : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {(booking.notes || booking.specialRequests) ? (
          <View style={S.notesBlock}>
            {booking.notes ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACE.xs, gap: SPACE.xs }}>
                  <PyramidBullet size={11} />
                  <Text style={S.notesTitle}>{label("notes.title", "Itinerary Notes")}</Text>
                </View>
                <Text style={S.notesText}>{shapeForPdf(booking.notes)}</Text>
              </>
            ) : null}
            {booking.specialRequests ? (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: booking.notes ? SPACE.sm : 0, marginBottom: SPACE.xs, gap: SPACE.xs }}>
                  <LotusBullet size={11} />
                  <Text style={S.notesTitle}>{label("notes.specialRequests", "Special Requests")}</Text>
                </View>
                <Text style={S.notesText}>{shapeForPdf(booking.specialRequests)}</Text>
              </>
            ) : null}
          </View>
        ) : null}
      </ParchmentPage>

      {/* ---------------- PAGE 2 — Day-by-day (1-3) ---------------- */}
      <ParchmentPage companyInfo={companyInfo} languageCode={langCode} pageLabel={page2Label} rtl={rtl} S={S}>
        <View style={S.section}>
          <SectionHeader S={S} number="03" icon="roadmap" title={label("section.roadmap", "Day-by-Day Itinerary")} titleStyle={headingStyle} />

          {itinerary.slice(0, 3).map((day, idx) => (
            <DayCard
              key={day.day}
              S={S}
              day={day}
              translatedTitle={dayField(idx, "day.title")}
              translatedDescription={dayField(idx, "day.description")}
              translatedAccommodation={dayField(idx, "day.accommodation")}
              translatedMeals={dayField(idx, "day.meals")}
              translatedRoadmap={dayField(idx, "day.transport")}
              tLabels={{ roadmap: label("day.roadmap", "Today's Roadmap"), stay: label("day.stay", "Stay"), meals: label("day.meals", "Meals") }}
              headingStyle={headingStyle}
              cinzelStyle={cinzelStyle}
            />
          ))}

          {itinerary.length === 0 && (
            <DayCard
              S={S}
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

      {/* ---------------- PAGE 3 (optional) — Day-by-day (4-7) ---------------- */}
      {hasExtraDays && (
        <ParchmentPage companyInfo={companyInfo} languageCode={langCode} pageLabel="Page 3" rtl={rtl} S={S}>
          <View style={S.section}>
            <SectionHeader S={S} number="03" icon="roadmap" title={label("section.roadmap", "Itinerary (Continued)")} titleStyle={headingStyle} />
            {itinerary.slice(3, 7).map((day, idx) => (
              <DayCard
                key={day.day}
                S={S}
                day={day}
                translatedTitle={dayField(idx + 3, "day.title")}
                translatedDescription={dayField(idx + 3, "day.description")}
                translatedAccommodation={dayField(idx + 3, "day.accommodation")}
                translatedMeals={dayField(idx + 3, "day.meals")}
                translatedRoadmap={dayField(idx + 3, "day.transport")}
                tLabels={{ roadmap: label("day.roadmap", "Today's Roadmap"), stay: label("day.stay", "Stay"), meals: label("day.meals", "Meals") }}
                headingStyle={headingStyle}
                cinzelStyle={cinzelStyle}
              />
            ))}
          </View>
        </ParchmentPage>
      )}

      {/* ---------------- Inclusions / Pricing / Ops ---------------- */}
      <ParchmentPage companyInfo={companyInfo} languageCode={langCode} pageLabel={hasExtraDays ? "Page 4" : "Page 3"} rtl={rtl} S={S}>
        <View style={S.section}>
          <SectionHeader S={S} number="04" icon="list" title={`${label("section.inclusions", "Inclusions")} & ${label("section.exclusions", "Exclusions")}`} titleStyle={headingStyle} />
          <View style={S.twoCol}>
            <View style={S.col}>
              <View style={S.panelCard}>
                <View style={[S.sectionCardTitle, { color: COLOR.deepBrown }, headingStyle]}>
                  <ScarabBullet size={12} />
                  <Text>{label("tour.inclusions", "What's Included")}</Text>
                </View>
                {tList("inclusions", inclusions).length > 0 ? (
                  tList("inclusions", inclusions).map((inc, i) => (
                    <View key={i} style={S.listItem}>
                      <View style={S.listItemIcon}><ScarabBullet size={12} /></View>
                      <Text style={S.listItemText}>{inc}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={S.listItemText}>{label("fallback.inclusions", "Customized inclusions to be confirmed by Operations team.")}</Text>
                )}
              </View>
            </View>
            <View style={S.col}>
              <View style={S.panelCard}>
                <View style={[S.sectionCardTitle, { color: COLOR.deepBrown }, headingStyle]}>
                  <EyeOfHorusBullet size={12} />
                  <Text>{label("tour.exclusions", "What's Not Included")}</Text>
                </View>
                {tList("exclusions", exclusions).length > 0 ? (
                  tList("exclusions", exclusions).map((exc, i) => (
                    <View key={i} style={S.listItem}>
                      <View style={S.listItemIcon}><EyeOfHorusBullet size={12} /></View>
                      <Text style={S.listItemText}>{exc}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={S.listItemText}>{label("fallback.exclusions", "Standard exclusion terms apply.")}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={S.section}>
          <SectionHeader S={S} number="05" icon="price" title={label("section.pricing", "Pricing & Payment")} titleStyle={headingStyle} />
          <View style={S.pricingTable}>
            <View style={{ ...S.pricingRow, backgroundColor: "rgba(232, 215, 177, 0.3)" }}>
              <Text style={{ ...S.pricingCell, ...S.pricingHeaderCell }}>{label("pricing.description", "Description")}</Text>
              <Text style={{ ...S.pricingCellRight, ...S.pricingHeaderCell }}>{label("pricing.amount", "Amount")} ({booking.currency})</Text>
            </View>
            <View style={S.pricingRow}>
              <Text style={S.pricingCell}>{label("pricing.tourPackage", "Tour Package")} ({displayTourTitle})</Text>
              <Text style={S.pricingCellRight}>{formatCurrency(booking.totalPrice, booking.currency)}</Text>
            </View>
            {booking.travelers.adults > 0 && (
              <View style={S.pricingRow}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: SPACE.xs, flex: 1 }}>
                  <SunDiscBullet size={9} />
                  <Text style={S.pricingCell}>{label("pricing.adults", "Adults")} ({booking.travelers.adults})</Text>
                </View>
                <Text style={S.pricingCellRight}>—</Text>
              </View>
            )}
            {booking.travelers.children > 0 && (
              <View style={S.pricingRow}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: SPACE.xs, flex: 1 }}>
                  <SunDiscBullet size={9} />
                  <Text style={S.pricingCell}>{label("pricing.children", "Children")} ({booking.travelers.children})</Text>
                </View>
                <Text style={S.pricingCellRight}>—</Text>
              </View>
            )}
            {booking.travelers.infants > 0 && (
              <View style={S.pricingRow}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: SPACE.xs, flex: 1 }}>
                  <SunDiscBullet size={9} />
                  <Text style={S.pricingCell}>{label("pricing.infants", "Infants")} ({booking.travelers.infants})</Text>
                </View>
                <Text style={S.pricingCellRight}>—</Text>
              </View>
            )}
            {(booking.specialRequestItems ?? []).map((item, i) => (
              <View key={i} style={S.pricingRow}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: SPACE.xs, flex: 1 }}>
                  <SunDiscBullet size={9} />
                  <Text style={S.pricingCell}>Extra Request · {item.description}</Text>
                </View>
                <Text style={S.pricingCellRight}>{formatCurrency(item.price, booking.currency)}</Text>
              </View>
            ))}
            <View style={{ ...S.pricingRow, ...S.pricingRowLast }}>
              <Text style={{ ...S.pricingCell, ...S.pricingTotalLabel }}>{label("pricing.totalAmountDue", "Total Amount Due")}</Text>
              <Text style={{ ...S.pricingCellRight, ...S.pricingTotalValue }}>{formatCurrency(booking.totalPrice, booking.currency)}</Text>
            </View>
          </View>

          <View style={S.termsBlock}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACE.xs + 2, gap: SPACE.xs }}>
              <SunDiscBullet size={11} />
              <Text style={S.termsTitle}>{label("section.terms", "Payment & Booking Terms")}</Text>
            </View>
            {[
              { key: "terms.payment.1", fallback: "A 30% non-refundable deposit is required to confirm the booking." },
              { key: "terms.payment.2", fallback: "The remaining balance must be paid no later than 14 days prior to departure." },
              { key: "terms.payment.3", fallback: "Accepted payment methods: Bank transfer, credit/debit card, or cash at our office." },
              { key: "terms.payment.4", fallback: "Cancellations received 30+ days before departure: Deposit retained. 14–29 days: 50% of total due. Less than 14 days: No refund." },
              { key: "terms.payment.5", fallback: `${companyInfo.name} reserves the right to modify the itinerary due to local conditions, safety, or force majeure.` },
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: SPACE.xs, marginBottom: i < 4 ? SPACE.xs : 0 }}>
                <SunDiscBullet size={8} />
                <Text style={S.termsText}>{label(item.key, item.fallback).replace("{companyName}", companyInfo.name)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={S.section}>
          <SectionHeader S={S} number="06" icon="contact" title={label("section.contact", "Operations & Contact Info")} titleStyle={headingStyle} />
          <View style={S.operationsCard}>
            <View style={S.operationsHeader}>
              <View style={S.opsBadge}><Text style={S.opsBadgeText}>{label("general.247", "24/7 Support")}</Text></View>
              <Text style={[S.opsCardTitle, headingStyle]}>{label("ops.roundClock", "Your Operations Team \u2014 Available Round the Clock")}</Text>
            </View>
            <Divider compact />
            <View style={S.opsGrid}>
              <View style={S.opsItem}>
                <Text style={S.opsLabel}>{label("ops.manager", "Operations Manager")}</Text>
                <Text style={S.opsValue}>{shapeForPdf(companyInfo.operationsManager.name)}</Text>
              </View>
              <View style={S.opsItem}>
                <Text style={S.opsLabel}>{label("ops.directMobile", "Direct Mobile")}</Text>
                <Text style={S.opsValue}>{companyInfo.operationsManager.phone}</Text>
              </View>
              <View style={S.opsItem}>
                <Text style={S.opsLabel}>{label("ops.email", "Operations Email")}</Text>
                <Text style={S.opsValue}>{companyInfo.operationsManager.email}</Text>
              </View>
              <View style={S.opsItem}>
                <Text style={S.opsLabel}>{label("ops.whatsapp", "WhatsApp Hotline")}</Text>
                <Text style={S.opsValue}>{companyInfo.whatsapp}</Text>
              </View>
              <View style={S.opsItem}>
                <Text style={S.opsLabel}>{label("ops.headOffice", "Head Office")}</Text>
                <Text style={S.opsValue}>{companyInfo.phone}</Text>
              </View>
              <View style={S.opsItem}>
                <Text style={S.opsLabel}>{label("ops.companyEmail", "Company Email")}</Text>
                <Text style={S.opsValue}>{companyInfo.email}</Text>
              </View>
              <View style={S.opsItem}>
                <Text style={S.opsLabel}>{label("ops.website", "Website")}</Text>
                <Text style={S.opsValue}>{companyInfo.website}</Text>
              </View>
              <View style={S.opsItem}>
                <Text style={S.opsLabel}>{label("ops.address", "Office Address")}</Text>
                <Text style={S.opsValue}>{shapeForPdf(companyInfo.address)}</Text>
              </View>
            </View>
          </View>

          <View wrap={false} style={S.companyShowcase}>
            <Image src={LOGO_SRC} style={S.companyShowcaseLogo} />
            <Text style={[S.companyShowcaseName, headingStyle]}>{shapeForPdf(companyInfo.name)}</Text>
            <Text style={S.companyShowcaseTagline}>{shapeForPdf(companyInfo.tagline || "Discover Egypt with Excellence")}</Text>
            <Text style={S.companyShowcaseAbout}>
              {label(
                "company.about",
                "Kemerya Tours crafts tailor-made Egyptian journeys — from the Pyramids of Giza to the temples of Luxor and the Nile — with expert guides, handpicked stays and 24/7 on-trip support."
              )}
            </Text>
            <View style={S.companyShowcaseContact}>
              <View style={S.companyContactCell}>
                <View style={S.companyContactIcon}><SunDiscBullet size={11} /></View>
                <View style={S.companyContactTextWrap}>
                  <Text style={S.companyContactLabel}>{label("ops.directMobile", "Phone")}</Text>
                  <Text style={S.companyContactValue}>{companyInfo.phone}</Text>
                </View>
              </View>
              <View style={S.companyContactCell}>
                <View style={S.companyContactIcon}><EyeOfHorusBullet size={11} /></View>
                <View style={S.companyContactTextWrap}>
                  <Text style={S.companyContactLabel}>{label("ops.companyEmail", "Email")}</Text>
                  <Text style={S.companyContactValue}>{companyInfo.email}</Text>
                </View>
              </View>
              <View style={S.companyContactCell}>
                <View style={S.companyContactIcon}><ScarabBullet size={11} /></View>
                <View style={S.companyContactTextWrap}>
                  <Text style={S.companyContactLabel}>{label("ops.website", "Website")}</Text>
                  <Text style={S.companyContactValue}>{companyInfo.website}</Text>
                </View>
              </View>
              <View style={S.companyContactCell}>
                <View style={S.companyContactIcon}><LotusBullet size={11} /></View>
                <View style={S.companyContactTextWrap}>
                  <Text style={S.companyContactLabel}>{label("ops.address", "Office")}</Text>
                  <Text style={S.companyContactValue}>{shapeForPdf(companyInfo.address)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ParchmentPage>

      {/* ---------------- Terms / Review / Social ---------------- */}
      <ParchmentPage companyInfo={companyInfo} languageCode={langCode} pageLabel={hasExtraDays ? "Page 5" : "Page 4"} rtl={rtl} S={S}>
        <View style={S.section}>
          <SectionHeader S={S} number="07" icon="terms" title={label("terms.policy", "Terms & Policy")} titleStyle={headingStyle} />
          <View style={S.termsCard}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACE.xs + 2, gap: SPACE.xs }}>
              <CartoucheSeal size={12} />
              <Text style={{ ...cinzelStyle, fontSize: 8.5, color: COLOR.deepLapis, fontWeight: 700 }}>{label("section.terms", "Terms & Conditions")}</Text>
            </View>
            {termsItems.map((item, i) => (
              <View key={i} style={S.termsItemRow}>
                <SunDiscBullet size={9} />
                <Text style={S.termsItemText}>{item}</Text>
              </View>
            ))}
            <Text style={S.termsItemText}>
              {label("terms.readFull", "Read the full terms on our website:")}{" "}
              <Link src={TERMS_URL} style={S.termsLinkText}>{TERMS_URL}</Link>
            </Text>

            <Divider compact />

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SPACE.xs + 2, gap: SPACE.xs }}>
              <EyeOfHorusBullet size={12} />
              <Text style={{ ...cinzelStyle, fontSize: 8.5, color: COLOR.deepLapis, fontWeight: 700 }}>{label("general.privacyPolicy", "Privacy Policy")}</Text>
            </View>
            {privacyItems.map((item, i) => (
              <View key={i} style={S.termsItemRow}>
                <PyramidBullet size={9} />
                <Text style={S.termsItemText}>{item}</Text>
              </View>
            ))}
            <Text style={S.termsItemText}>
              {label("privacy.readFull", "Read the full privacy policy:")}{" "}
              <Link src={PRIVACY_URL} style={S.termsLinkText}>{PRIVACY_URL}</Link>
            </Text>
          </View>
        </View>

        <View style={S.reviewCard}>
          <Text style={[S.reviewTitle, headingStyle]}>{label("review.title", "Leave a Review")}</Text>
          <Text style={S.reviewSubtitle}>
            {label("review.subtitle", "Loved your tour? Your feedback on Google Business helps travelers like you find us.")}
          </Text>
          <Link src={companyInfo.socialMedia?.googleBusiness || "https://share.google/RLldzNlk9YFVuIGbD"}>
            <View style={S.reviewBadge}>
              <Text style={[S.reviewBadgeText, headingStyle]}>{label("review.cta", "★ Write a Review")}</Text>
            </View>
          </Link>
          <Text style={S.reviewLink}>{companyInfo.socialMedia?.googleBusiness || "https://share.google/RLldzNlk9YFVuIGbD"}</Text>
        </View>

        <View style={S.socialRow}>
          {companyInfo.socialMedia?.facebook ? <Link src={companyInfo.socialMedia.facebook} style={S.socialLinkItem}>{label("social.facebook", "Facebook")}</Link> : null}
          {companyInfo.socialMedia?.instagram ? <Link src={companyInfo.socialMedia.instagram} style={S.socialLinkItem}>{label("social.instagram", "Instagram")}</Link> : null}
          {companyInfo.socialMedia?.youtube ? <Link src={companyInfo.socialMedia.youtube} style={S.socialLinkItem}>{label("social.youtube", "YouTube")}</Link> : null}
          {companyInfo.socialMedia?.twitter ? <Link src={companyInfo.socialMedia.twitter} style={S.socialLinkItem}>{label("social.twitter", "X (Twitter)")}</Link> : null}
          {companyInfo.socialMedia?.googleBusiness ? <Link src={companyInfo.socialMedia.googleBusiness} style={S.socialLinkItem}>{label("social.googleBusiness", "Google Business")}</Link> : null}
        </View>
      </ParchmentPage>
    </Document>
  );
}

/* ============================================================================
 * SMALL SUBCOMPONENTS
 * ==========================================================================*/

function SummaryCard({ S, label, value }: { S: typeof styles; label: string; value: React.ReactNode }) {
  const getIcon = () => {
    const l = label.toLowerCase();
    if (l.includes("total traveler") || l.includes("client name")) return <UserIcon />;
    if (l.includes("duration") || l.includes("period") || l.includes("date") || l.includes("return")) return <CalendarIcon />;
    if (l.includes("meeting") || l.includes("location") || l.includes("destination") || l.includes("pickup")) return <MapPinIcon />;
    if (l.includes("amount") || l.includes("price") || l.includes("email") || l.includes("phone") || l.includes("whatsapp")) return <SunDiscBullet size={16} />;
    return <View style={S.summaryItemIcon} />;
  };

  return (
    <View style={S.summaryItem}>
      <View style={S.summaryItemIcon}>{getIcon()}</View>
      <View style={S.summaryItemTextWrap}>
        <Text style={S.summaryItemLabel}>{shapeForPdf(label)}</Text>
        {typeof value === "string" ? <Text style={S.summaryItemValue}>{shapeForPdf(value)}</Text> : value}
      </View>
    </View>
  );
}

function DayCard({
  S,
  day,
  translatedTitle,
  translatedDescription,
  translatedAccommodation,
  translatedMeals,
  translatedRoadmap,
  tLabels,
  headingStyle = {},
  cinzelStyle = {},
}: {
  S: typeof styles;
  day: ItineraryDay;
  translatedTitle?: string;
  translatedDescription?: string;
  translatedAccommodation?: string;
  translatedMeals?: string;
  translatedRoadmap?: string;
  tLabels?: { roadmap?: string; stay?: string; meals?: string };
  headingStyle?: Record<string, string>;
  cinzelStyle?: Record<string, string>;
}) {
  const stops = (
    translatedRoadmap
      ? translatedRoadmap.split(",").map((s) => s.trim()).filter(Boolean)
      : day.highlights && day.highlights.length > 0
      ? day.highlights
      : []
  ).map(shapeForPdf);
  const dayTitle = shapeForPdf(translatedTitle || day.title);
  const dayDescription = shapeForPdf(translatedDescription || day.description);
  const accommodation = translatedAccommodation || day.accommodation || "";
  const mealsJoined = translatedMeals || (day.meals ? day.meals.join(", ") : "");
  const accommodationText = shapeForPdf(accommodation);
  const mealsText = shapeForPdf(mealsJoined);

  return (
    <View style={S.dayCard} break={false}>
      <View style={S.dayHeader}>
        <View style={S.dayBadge}>
          <Text style={[S.dayBadgeText, headingStyle]}>DAY {day.day}</Text>
        </View>
        <Text style={[S.dayTitle, headingStyle]}>{dayTitle}</Text>
      </View>
      <View style={S.dayContent}>
        <Text style={S.dayDescription}>{dayDescription}</Text>
        {stops.length > 0 && (
          <View style={S.dayRoadmap}>
            <Text style={[S.dayRoadmapTitle, cinzelStyle]}>{tLabels?.roadmap || "Today's Roadmap"}</Text>
            {stops.map((stop, i) => (
              <View key={i} style={S.dayRoadmapRow}>
                <LotusBullet size={9} />
                <Text style={S.dayRoadmapStop}>{stop}</Text>
              </View>
            ))}
          </View>
        )}
        {(accommodation || mealsJoined) ? (
          <View style={S.metaRow}>
            {accommodation ? (
              <View style={S.metaItem}>
                <PyramidBullet size={9} />
                <Text style={S.metaLabel}>{tLabels?.stay || "Stay"} ·</Text>
                <Text style={S.metaValue}>{accommodationText}</Text>
              </View>
            ) : null}
            {mealsJoined ? (
              <View style={S.metaItem}>
                <SunDiscBullet size={9} />
                <Text style={S.metaLabel}>{tLabels?.meals || "Meals"} ·</Text>
                <Text style={S.metaValue}>{mealsText}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
