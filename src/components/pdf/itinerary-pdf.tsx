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
  Rect,
  ClipPath,
} from "@react-pdf/renderer";
import type {
  Tour,
  BookingConfig,
  CompanyInfo,
  ItineraryDay,
  Currency,
} from "@/types";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import {
  formatDateShort,
  formatCurrency,
  calculateNights,
} from "@/lib/utils";
import { CheckIcon, CrossIcon, UserIcon } from "./pdf-icons";
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
import type { Style } from "@react-pdf/types";

/* ============================================================================
 * Kemerya Itinerary PDF — clean, modular rebuild.
 *
 * The previous version was one giant, patched component where every section,
 * its styles and its layout logic lived in a 1500+ line file. That made it
 * impossible to reason about, and produced layout conflicts, overlaps and
 * missing translations.
 *
 * This rebuild splits the document into small, single-purpose functional
 * components that are assembled inside <ItineraryPDF /> in a fixed order:
 *
 *   1. BookingReference      6. OptionalTours        11. AgentSignature
 *   2. BookingSummary        7. ExtraServices        12. CompanyDetails
 *   3. SpecialOffer          8. InclusionsExclusions
 *   4. TourDescription       9. TermsConditions
 *   5. DayByDayItinerary    10. PrivacyPolicy
 *
 * ALL content after the header is ONE continuous flow inside a single
 * <Page>. react-pdf paginates that flow automatically (never force-slicing
 * sections onto fixed pages), and the fixed header/footer + the dynamic
 * `render={({pageNumber, totalPages})}` callback give you accurate page
 * numbers on every physical sheet — this is what eliminates the overlap and
 * blank-page bugs.
 * ==========================================================================*/

export interface ItineraryPDFProps {
  tour: Tour | null;
  booking: BookingConfig;
  companyInfo?: CompanyInfo;
  translatedData?: Record<string, unknown>;
  languageCode?: string;
}

Font.registerHyphenationCallback((word) => [word]);

/* ============================================================================
 * THEME / CONSTANTS
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
  rust: "#8B3A2E",
} as const;

const CARD_BG = "rgba(253, 251, 247, 0.5)";
const CARD_BORDER = "rgba(184, 150, 58, 0.55)";
const CARD = { backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER } as const;

const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 30 } as const;

/** True only when a value is a real, non-blank string. Nothing with empty
 * content is ever rendered. */
const hasText = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

/** Resolve the agent name shown on the signature block / company details. */
function getAgentName(companyInfo?: CompanyInfo): string {
  return companyInfo?.operationsManager?.name || KEMERYA_COMPANY_INFO.operationsManager.name;
}

/* ============================================================================
 * ICONOGRAPHY — small pharaonic SVG markers used across the document.
 * ==========================================================================*/

const ScarabBullet = ({ size = 11, color = COLOR.scarabGreen }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Ellipse cx={12} cy={13} rx={8} ry={9.5} fill={color} />
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
    </G>
  </Svg>
);

const PyramidBullet = ({ size = 11, color = COLOR.royalGold }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Path d="M12 1 L 23 22 L 1 22 Z" fill={color} />
      <Path d="M12 1 L 12 22" stroke="#FDFBF7" strokeWidth={0.55} fill="none" opacity={0.75} />
      <Path d="M5 11 L 19 11" stroke="#FDFBF7" strokeWidth={0.55} fill="none" opacity={0.6} />
    </G>
  </Svg>
);

const LotusBullet = ({ size = 11, color = "#C43E6B" }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Path
        d="M12 2 C 9 5 7 10 7 14 C 7 16 9 17 12 17 C 15 17 17 16 17 14 C 17 10 15 5 12 2 Z"
        fill={color}
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

type SectionGlyphKind = "summary" | "overview" | "roadmap" | "list" | "price" | "contact" | "terms" | "offer" | "extra";

const SectionGlyph = ({ kind, size = 15 }: { kind: SectionGlyphKind; size?: number }) => {
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
        <Path d="M1.5 18l1.3 1.3L5 16.6" />
      </>
    ),
    price: (
      <>
        <Path d="M2 7.5h20v9H2Z" />
        <Circle cx={12} cy={12} r={2.6} />
      </>
    ),
    contact: (
      <Path d="M4 3h4l1.6 4.4-2.1 1.8a13.5 13.5 0 0 0 7.3 7.3l1.8-2.1L21 16v4a2 2 0 0 1-2 2A17 17 0 0 1 2 5a2 2 0 0 1 2-2Z" />
    ),
    terms: (
      <>
        <Path d="M12 2l8 3v6.2C20 16 16.5 19.7 12 22 7.5 19.7 4 16 4 11.2V5Z" />
        <Path d="M9 12l2 2 4-4" />
      </>
    ),
    offer: (
      <>
        <Path d="M12 2l2.4 5.2 5.6.6-4.2 3.8 1.2 5.6L12 14.4 7 17.2l1.2-5.6L4 7.8l5.6-.6Z" />
      </>
    ),
    extra: (
      <>
        <Path d="M8 4h8v16l-4-2.5L8 20Z" />
        <Path d="M10 9h4M10 12h4" />
      </>
    ),
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G fill="none" stroke={COLOR.royalGold} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        {glyphs[kind]}
      </G>
    </Svg>
  );
};

/* ============================================================================
 * REUSABLE PRIMITIVES
 * ==========================================================================*/

/** The single decorative divider used throughout the document. */
const Divider = ({ compact = false, color = COLOR.royalGold, style = {} }: { compact?: boolean; color?: string; style?: Style }) => (
  <View style={[{ flexDirection: "row", alignItems: "center", marginVertical: compact ? SPACE.xs : SPACE.sm }, style]}>
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
    <View style={{ flex: 1, height: 0.75, backgroundColor: color, opacity: 0.55 }} />
  </View>
);

/** Standard numbered section heading with pharaonic glyph + underline. */
function SectionHeader({ S, number, icon, title, titleStyle = {} }: {
  S: typeof styles;
  number: string;
  icon: SectionGlyphKind;
  title: string;
  titleStyle?: Record<string, string>;
}) {
  return (
    <View style={S.sectionHeader} wrap={false}>
      <View style={S.sectionNumber}><Text>{number}</Text></View>
      <View style={S.sectionIcon}><SectionGlyph kind={icon} size={15} /></View>
      <Text style={[S.sectionTitle, titleStyle]}>{title}</Text>
      <View style={S.sectionUnderline} />
    </View>
  );
}

/** A summary "metric" card — label + value, with an auto-selected icon. */
function SummaryCard({ S, label, value }: { S: typeof styles; label: string; value: React.ReactNode }) {
  const l = label.toLowerCase();
  let icon: React.ReactNode;
  if (l.includes("duration") || l.includes("period") || l.includes("date") || l.includes("return") || l.includes("arrival")) {
    icon = <Svg width={13} height={13} viewBox="0 0 24 24"><G fill="none" stroke={COLOR.royalGold} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><Path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></G></Svg>;
  } else if (l.includes("meeting") || l.includes("location") || l.includes("pickup") || l.includes("destination")) {
    icon = <Svg width={13} height={13} viewBox="0 0 24 24"><G fill="none" stroke={COLOR.royalGold} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><Path d="M15 10a3 3 0 11-6 0 3 3 0 016 0z M19.5 10c0 7.142-7.5 11.25-7.5 11.25S4.5 17.142 4.5 10a7.5 7.5 0 0115 0z" /></G></Svg>;
  } else if (l.includes("traveler") || l.includes("client") || l.includes("adult") || l.includes("child")) {
    icon = <UserIcon />;
  } else if (l.includes("amount") || l.includes("price") || l.includes("total")) {
    icon = <SunDiscBullet size={16} />;
  } else {
    icon = <View style={S.summaryItemIcon} />;
  }
  return (
    <View style={S.summaryItem} wrap={false}>
      <View style={S.summaryItemIcon}>{icon}</View>
      <View style={S.summaryItemTextWrap}>
        <Text style={S.summaryItemLabel}>{shapeForPdf(label)}</Text>
        {typeof value === "string" ? <Text style={S.summaryItemValue}>{shapeForPdf(value)}</Text> : value}
      </View>
    </View>
  );
}

/** A small labeled meta row used inside day cards / offers (e.g. "Meals · …"). */
function MetaItem({ S, icon, label, value }: {
  S: typeof styles;
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={S.metaItem} wrap={false}>
      {icon && <View style={{ flexShrink: 0, marginTop: 1 }}>{icon}</View>}
      <Text style={S.metaLabel}>{label} ·</Text>
      <Text style={S.metaValue}>{value}</Text>
    </View>
  );
}

/**
 * Day-by-Day itinerary card. Per the requirement this version presents ONLY
 * the clean essentials — title, description, meals and accommodation. The
 * old "Today's Roadmap" block (route stops) has been removed entirely so a
 * single day's text can never duplicate itself or collide with another row.
 * The card itself is allowed to wrap across pages; only its header row stays
 * atomic so a day title is never orphaned alone at the bottom of a sheet.
 */
function DayCard({ S, day, translatedTitle, translatedDescription, translatedAccommodation, translatedMeals, tLabels, headingStyle = {}, cinzelStyle = {} }: {
  S: typeof styles;
  day: ItineraryDay;
  translatedTitle?: string;
  translatedDescription?: string;
  translatedAccommodation?: string;
  translatedMeals?: string;
  tLabels?: { day?: string; stay?: string; meals?: string };
  headingStyle?: Record<string, string>;
  cinzelStyle?: Record<string, string>;
}) {
  const dayTitle = shapeForPdf(translatedTitle || day.title);
  const dayDescription = shapeForPdf(translatedDescription || day.description);
  const accommodationText = shapeForPdf(translatedAccommodation || day.accommodation || "");
  const mealsText = shapeForPdf(translatedMeals || (day.meals ? day.meals.join(", ") : ""));
  const showMeta = hasText(accommodationText) || hasText(mealsText);

  return (
    <View style={S.dayCard}>
      <View style={S.dayHeader} wrap={false}>
        <View style={S.dayBadge}>
          <Text style={[S.dayBadgeText, headingStyle]}>{tLabels?.day || "Day"} {day.day}</Text>
        </View>
        <Text style={[S.dayTitle, headingStyle]}>{dayTitle}</Text>
      </View>
      <View style={S.dayContent}>
        {hasText(dayDescription) ? <Text style={S.dayDescription}>{dayDescription}</Text> : null}
        {showMeta ? (
          <View style={S.metaRow}>
            {hasText(accommodationText) ? (
              <MetaItem S={S} icon={<PyramidBullet size={9} />} label={tLabels?.stay || "Stay"} value={accommodationText} />
            ) : null}
            {hasText(mealsText) ? (
              <MetaItem S={S} icon={<SunDiscBullet size={9} />} label={tLabels?.meals || "Meals"} value={mealsText} />
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}
/* ============================================================================
 * PHRARAONIC WATERMARK + DIGITAL SIGNATURE (inline SVG)
 * ==========================================================================*/

/**
 * A subtle, full-page pharaonic watermark drawn as inline SVG and placed
 * BEHIND the content layer. Rendering it from vector paths (instead of a
 * raster PNG) keeps it crisp at any size and avoids the blurry/failed asset
 * boxes the old raster images produced.
 */
const PharaonicWatermark = () => (
  <Svg viewBox="0 0 595 842" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.04 }}>
    <G transform="translate(140, 180)" opacity={0.6}>
      {/* Pyramids */}
      <Path d="M0 220 L60 60 L120 220 Z" fill="none" stroke={COLOR.deepBrown} strokeWidth={3} />
      <Path d="M120 220 L180 110 L240 220 Z" fill="none" stroke={COLOR.deepBrown} strokeWidth={3} />
      <Path d="M12 220 L60 60 L108 220 Z" fill={COLOR.royalGold} />
      {/* Sun disc */}
      <Circle cx={300} cy={40} r={30} fill="none" stroke={COLOR.deepBrown} strokeWidth={3} />
      <G stroke={COLOR.deepBrown} strokeWidth={2.5} strokeLinecap="round">
        <Path d="M300 6 V-4" />
        <Path d="M300 74 V84" />
        <Path d="M266 40 H256" />
        <Path d="M334 40 H344" />
        <Path d="M276 16 L269 9" />
        <Path d="M324 64 L331 71" />
        <Path d="M324 16 L331 9" />
        <Path d="M276 64 L269 71" />
      </G>
      {/* Ankh */}
      <G stroke={COLOR.deepBrown} strokeWidth={4} fill="none" strokeLinecap="round" transform="translate(360, 120)">
        <Path d="M20 4 C 10 4 4 12 4 20 C 4 28 10 34 20 34 C 30 34 36 28 36 20 C 36 12 30 4 20 4 Z" />
        <Path d="M20 34 V 78 M 8 78 H 32" />
      </G>
    </G>
  </Svg>
);

/**
 * A stylized cursive agent signature drawn as inline SVG paths. Used inside
 * the AgentSignature section so the PDF carries a real, vector-based
 * handwritten-style signature without depending on an uploaded image.
 */
const DigitalSignature = ({ width = 190, height = 62 }: { width?: number; height?: number }) => (
  <Svg width={width} height={height} viewBox="0 0 240 80">
    <G fill="none" stroke={COLOR.deepLapis} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 52 C 22 20 30 16 34 28 C 38 40 30 48 30 56 C 30 66 40 64 42 56 C 44 48 40 42 46 40 C 54 36 56 50 60 56" />
      <Path d="M62 50 C 66 40 72 38 78 44 C 84 50 82 58 88 56 C 94 54 96 52 102 54" />
      <Path d="M108 40 C 112 32 118 34 120 42 C 122 52 116 60 126 58" />
    </G>
    <Path d="M197 60 C 212 42 218 46 224 52" fill="none" stroke={COLOR.deepLapis} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
);


/* ============================================================================
 * PAGE FRAME
 * ==========================================================================*/

/**
 * ParchmentPage is the reusable page shell: warm parchment background,
 * a fixed brand header and a company-details footer, plus the pharaonic
 * watermark. All body content is ONE continuous flow inside a single
 * flowing <Page>, so react-pdf paginates it correctly and repeats the fixed
 * bands + dynamic page number on every physical sheet it needs (this is what
 * removes the old overlaps and wasted blank space).
 */
function ParchmentPage({
  children,
  companyInfo,
  languageCode = "en",
  rtl,
  footerTagline,
  footerWhatsAppLabel = "WhatsApp",
  footerPageLabel = "Page",
  S,
}: {
  children: React.ReactNode;
  companyInfo?: CompanyInfo;
  languageCode?: string;
  rtl: boolean;
  footerTagline?: string;
  footerWhatsAppLabel?: string;
  footerPageLabel?: string;
  S: typeof styles;
}) {
  const bodyFont = getGlobalFont(languageCode);
  const latinDisplay = isLatinDisplayLanguage(languageCode);
  const brandFont = latinDisplay ? "Cinzel" : bodyFont;

  return (
    <Page size="A4" style={[S.page, { direction: rtl ? "rtl" : "ltr", fontFamily: bodyFont }]} wrap>
      <Image src={PARCHMENT_SRC} style={S.parchmentBg} fixed />
      <Image src={BORDER_SRC} style={S.borderFrame} fixed />
      <PharaonicWatermark />

      <View style={[S.contentLayer, { fontFamily: bodyFont, direction: rtl ? "rtl" : "ltr" }]}>
        {/* Keep the header atomic so the brand is never separated from the
            start of the content. */}
        <View style={S.headerBox} fixed>
          <Image src={LOGO_SRC} style={S.officialLogoSmall} />
          <View style={S.headerText}>
            <Text style={[S.brandTitle, { fontFamily: brandFont }]}>{companyInfo?.name || "KEMERYA TOURS"}</Text>
            {hasText(companyInfo?.tagline) ? (
              <Text style={[S.brandTagline, { fontFamily: bodyFont }]}>{shapeForPdf(companyInfo!.tagline!)}</Text>
            ) : null}
          </View>
        </View>
        <Divider compact color={COLOR.paleGold} />

        {children}
      </View>

      <View style={S.footerBand} fixed>
        <View style={S.companyRect}>
          <View style={S.companyRectRow}>
            {hasText(companyInfo?.phone) ? (
              <View style={S.companyRectCell}>
                <View style={S.companyRectIcon}><SunDiscBullet size={8} /></View>
                <Text style={S.companyRectText}>{companyInfo!.phone}</Text>
              </View>
            ) : null}
            {hasText(companyInfo?.email) ? (
              <View style={S.companyRectCell}>
                <View style={S.companyRectIcon}><EyeOfHorusBullet size={8} /></View>
                <Text style={S.companyRectText}>{companyInfo!.email}</Text>
              </View>
            ) : null}
            {hasText(companyInfo?.website) ? (
              <View style={S.companyRectCell}>
                <View style={S.companyRectIcon}><ScarabBullet size={8} /></View>
                <Text style={S.companyRectText}>{companyInfo!.website}</Text>
              </View>
            ) : null}
            {hasText(companyInfo?.whatsapp) ? (
              <View style={S.companyRectCell}>
                <View style={S.companyRectIcon}><LotusBullet size={8} /></View>
                <Text style={S.companyRectText}>{footerWhatsAppLabel} {companyInfo!.whatsapp}</Text>
              </View>
            ) : null}
          </View>
          {hasText(companyInfo?.address) ? (
            <View style={S.companyRectAddressRow}>
              <View style={S.companyRectIcon}><AnkhGlyph size={8} /></View>
              <Text style={S.companyRectAddress}>{shapeForPdf(companyInfo!.address!)}</Text>
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
          <Text
            style={S.footerPage}
            render={({ pageNumber, totalPages }) => `${footerPageLabel} ${pageNumber} / ${totalPages}`}
          />
        </View>
      </View>
    </Page>
  );
}

/* ============================================================================
 * MODULAR SECTION COMPONENTS
 *
 * Every section is a small, single-purpose functional component. Each one
 * receives exactly the props it needs (data + the shared `label` translator
 * + directional styles + heading fonts) and is independently testable as a
 * building block. The main <ItineraryPDF /> component below simply assembles
 * them in the fixed content order.
 * ==========================================================================*/

/**
 * Shared per-section context. Keeping the coupling to a single object makes
 * each section read cleanly while still sharing the directional styles and
 * the language-aware label helper needed everywhere.
 */
interface SectionCtx {
  S: typeof styles;
  label: (key: string, fallback: string) => string;
  headingStyle: Record<string, string>;
  cinzelStyle: Record<string, string>;
}

/* ----- 1. Booking Reference ---------------------------------------------- */

/** A booking-reference badge aligned to the very top of the document. */
function BookingReference({ S, label, bookingRef, cinzelStyle }: {
  S: typeof styles;
  label: (key: string, fallback: string) => string;
  bookingRef: string;
  cinzelStyle: Record<string, string>;
}) {
  return (
    <View style={S.bookingRefBadge} wrap={false}>
      <AnkhGlyph size={11} color={COLOR.paleGold} />
      <Text style={[S.bookingRefText, cinzelStyle]}>
        {label("hero.refLabel", "Ref")}: {bookingRef}
      </Text>
    </View>
  );
}

/* ----- 2. Booking Summary & Travelers ------------------------------------ */

/* ----- 2. Booking Summary & Travelers ------------------------------------ */

function BookingSummary({ ctx, booking, daysCount, nights, travelersSummary, travelersText, hasOffer, sectionNumber }: {
  ctx: SectionCtx;
  booking: BookingConfig;
  daysCount: number;
  nights: number;
  travelersSummary: string;
  travelersText: string;
  hasOffer: boolean;
  sectionNumber: string;
}) {
  const { S, label, headingStyle } = ctx;
  const fmt = (v: number) => formatCurrency(v, booking.currency);

  return (
    <View style={S.section}>
      <SectionHeader S={S} number={sectionNumber} icon="summary" title={label("section.summary", "Booking Summary")} titleStyle={headingStyle} />
      <View style={S.summaryGrid}>
        <SummaryCard S={S} label={label("summary.totalTravelers", "Total Travelers")} value={`${travelersSummary} (${travelersText})`} />
        <SummaryCard S={S} label={label("summary.tourDuration", "Tour Duration")} value={`${daysCount} ${label("general.days", "Days")} / ${nights} ${label("general.nights", "Nights")}`} />
        <SummaryCard S={S} label={label("summary.travelPeriod", "Travel Period")} value={`${formatDateShort(booking.startDate)} → ${formatDateShort(booking.endDate)}`} />
        <SummaryCard
          S={S}
          label={`${label("summary.totalAmount", "Total Amount")} (${booking.currency})`}
          value={
            hasOffer ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <Text style={[S.summaryItemValue, S.summaryStrikethrough]}>{fmt(booking.totalPrice)}</Text>
                <Text style={S.summaryOfferValue}>{fmt(booking.offerPrice!)}</Text>
              </View>
            ) : (
              fmt(booking.totalPrice)
            )
          }
        />
        {hasText(booking.clientName) ? (
          <SummaryCard S={S} label={label("summary.clientName", "Client Name")} value={booking.clientName!} />
        ) : null}
        {hasText(booking.clientEmail) ? (
          <SummaryCard S={S} label={label("summary.clientEmail", "Client Email")} value={booking.clientEmail!} />
        ) : null}
        {hasText(booking.clientPhone) ? (
          <SummaryCard S={S} label={label("summary.clientPhone", "Client Phone")} value={booking.clientPhone!} />
        ) : null}
        {hasText(booking.clientWhatsapp) ? (
          <SummaryCard S={S} label={label("summary.clientWhatsapp", "Client WhatsApp")} value={booking.clientWhatsapp!} />
        ) : null}
        {hasText(booking.meetingPoint) ? (
          <SummaryCard S={S} label={label("summary.meetingPoint", "Meeting Point")} value={booking.meetingPoint!} />
        ) : null}
        {hasText(booking.flightArrival) ? (
          <SummaryCard S={S} label={label("summary.airportArrival", "Airport Arrival / Tour Start")} value={booking.flightArrival!.replace("T", " · ")} />
        ) : null}
        {hasText(booking.pickupTime) ? (
          <SummaryCard S={S} label={label("summary.pickupTime", "Pickup Time")} value={booking.pickupTime!} />
        ) : null}
      </View>
    </View>
  );
}

/* ----- 3. Special Offer (conditional banner) ----------------------------- */

function SpecialOffer({ ctx, booking, sectionNumber }: {
  ctx: SectionCtx;
  booking: BookingConfig;
  sectionNumber: string;
}) {
  const { S, label, headingStyle, cinzelStyle } = ctx;
  const totalPrice = booking.totalPrice;
  const offerPrice = booking.offerPrice ?? 0;
  const show = offerPrice > 0 && totalPrice > offerPrice;
  if (!show) return null;

  const savings = totalPrice - offerPrice;
  const pct = totalPrice > 0 ? Math.round((savings / totalPrice) * 100) : 0;
  const title = hasText(booking.offerTitle) ? booking.offerTitle! : "Exclusive Limited-Time Offer";
  const note = hasText(booking.offerNote) ? booking.offerNote! : "";

  return (
    <View style={S.section} wrap={false}>
      <SectionHeader S={S} number={sectionNumber} icon="offer" title={label("offer.special", "Special Offer")} titleStyle={headingStyle} />
      <View style={S.offerBanner}>
        <View style={S.offerBadge}>
          <Text style={S.offerBadgeText}>{pct}% {label("general.off", "OFF")}</Text>
        </View>
        <View style={S.offerBody}>
          <Text style={[S.offerTitle, cinzelStyle]}>{shapeForPdf(title)}</Text>
          {hasText(note) ? <Text style={S.offerNote}>{shapeForPdf(note)}</Text> : null}
          <View style={S.offerPriceRow}>
            <Text style={[S.offerOld, cinzelStyle]}>{formatCurrency(totalPrice, booking.currency)}</Text>
            <Text style={S.offerNew}>{formatCurrency(offerPrice, booking.currency)}</Text>
            <Text style={S.offerSave}>{label("offer.youSave", "You save")} {formatCurrency(savings, booking.currency)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ----- 4. Tour Description ----------------------------------------------- */

function TourDescription({ ctx, tourTitle, description, meta, sectionNumber }: {
  ctx: SectionCtx;
  tourTitle: string;
  description: string;
  meta: Array<{ label: string; value: string }>;
  sectionNumber: string;
}) {
  const { S, label, headingStyle } = ctx;

  return (
    <View style={S.section}>
      <SectionHeader S={S} number={sectionNumber} icon="overview" title={label("section.overview", "Tour Description")} titleStyle={headingStyle} />
      <Text style={S.tourTitle}>{shapeForPdf(tourTitle)}</Text>
      {hasText(description) ? <Text style={S.tourDescription}>{shapeForPdf(description)}</Text> : null}
      {meta.length > 0 ? (
        <View style={[S.summaryGrid, { marginTop: SPACE.sm }]}>
          {meta.map((m, i) => (
            <SummaryCard key={i} S={S} label={m.label} value={m.value} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
/* ----- 5. Day-by-Day Itinerary (clean, NO roadmap) ----------------------- */

function DayByDayItinerary({ ctx, itinerary, dayField, sectionNumber, fallbackDay }: {
  ctx: SectionCtx;
  itinerary: ItineraryDay[];
  dayField: (idx: number, field: string) => string | undefined;
  sectionNumber: string;
  fallbackDay: ItineraryDay | null;
}) {
  const { S, label, headingStyle } = ctx;
  const tLabels = {
    day: label("day.day", "Day"),
    stay: label("day.stay", "Stay"),
    meals: label("day.meals", "Meals"),
  };

  return (
    <View style={S.section}>
      <SectionHeader S={S} number={sectionNumber} icon="roadmap" title={label("section.roadmap", "Day-by-Day Itinerary")} titleStyle={headingStyle} />
      {itinerary.map((day, idx) => (
        <DayCard
          key={day.day}
          S={S}
          day={day}
          translatedTitle={dayField(idx, "day.title")}
          translatedDescription={dayField(idx, "day.description")}
          translatedAccommodation={dayField(idx, "day.accommodation")}
          translatedMeals={dayField(idx, "day.meals")}
          tLabels={tLabels}
          headingStyle={ctx.headingStyle}
          cinzelStyle={ctx.cinzelStyle}
        />
      ))}
      {itinerary.length === 0 && fallbackDay ? (
        <DayCard
          S={S}
          day={fallbackDay}
          tLabels={tLabels}
          headingStyle={ctx.headingStyle}
          cinzelStyle={ctx.cinzelStyle}
        />
      ) : null}
    </View>
  );
}

/* ----- 6. Optional Tours (conditional, with pricing) --------------------- */

export interface OptionalTourItem {
  title: string;
  description?: string;
  price: number;
}

function OptionalTours({ ctx, items, sectionNumber }: {
  ctx: SectionCtx;
  items: OptionalTourItem[];
  sectionNumber: string;
}) {
  const { S, label, headingStyle, cinzelStyle } = ctx;
  if (items.length === 0) return null;

  return (
    <View style={S.section}>
      <SectionHeader S={S} number={sectionNumber} icon="extra" title={label("section.optionalTours", "Optional Tours")} titleStyle={headingStyle} />
      <View style={S.panelCard}>
        {items.map((item, i) => (
          <View key={i} style={i === items.length - 1 ? [S.pricingRow, S.pricingRowLast] : S.pricingRow} wrap={false}>
            <View style={S.pricingLeft}>
              <SunDiscBullet size={9} />
              <Text style={S.pricingLeftText}>
                {shapeForPdf(item.title)}
                {hasText(item.description) ? <Text style={S.pricingSub}>{shapeForPdf(item.description!)}</Text> : null}
              </Text>
            </View>
            <Text style={S.pricingRight}>{formatCurrency(item.price, "USD")}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ----- 7. Detailed Requests / Extra Services ----------------------------- */

function ExtraServices({ ctx, notes, specialRequests, specialRequestItems, currency, sectionNumber }: {
  ctx: SectionCtx;
  notes: string;
  specialRequests: string;
  specialRequestItems: BookingConfig["specialRequestItems"];
  currency: Currency;
  sectionNumber: string;
}) {
  const { S, label, headingStyle } = ctx;
  const hasNotes = hasText(notes);
  const hasRequests = hasText(specialRequests);
  const items = (specialRequestItems ?? []).filter((it) => hasText(it.description) || it.price > 0);
  if (!hasNotes && !hasRequests && items.length === 0) return null;

  return (
    <View style={S.section}>
      <SectionHeader S={S} number={sectionNumber} icon="list" title={label("section.extraRequests", "Detailed Requests & Extra Services")} titleStyle={headingStyle} />
      {hasNotes ? (
        <View style={S.panelCard}>
          <View style={[S.sectionCardTitle, headingStyle]}>
            <CartoucheSeal size={12} />
            <Text>{label("notes.title", "Itinerary Notes")}</Text>
          </View>
          <Text style={S.notesText}>{shapeForPdf(notes)}</Text>
        </View>
      ) : null}
      {hasRequests || items.length > 0 ? (
        <View style={hasNotes ? [S.panelCard, { marginTop: SPACE.sm }] : S.panelCard}>
          <View style={[S.sectionCardTitle, headingStyle]}>
            <LotusBullet size={11} />
            <Text>{label("notes.specialRequests", "Special Requests & Extra Services")}</Text>
          </View>
          {hasRequests ? <Text style={S.notesText}>{shapeForPdf(specialRequests)}</Text> : null}
          {items.length > 0 ? (
            <>
              <Divider compact />
              {items.map((item, i) => (
                <View key={item.id || i} style={S.listItem} wrap={false}>
                  <View style={S.listItemIcon}><SunDiscBullet size={9} /></View>
                  <Text style={S.listItemText}>
                    <Text style={{ fontWeight: 700, color: COLOR.deepBrown }}>{shapeForPdf(item.description)}</Text>
                    {item.price > 0 ? <Text style={{ color: COLOR.lapis }}> — {formatCurrency(item.price, currency)}</Text> : null}
                  </Text>
                </View>
              ))}
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
/* ----- 8. Inclusions & Exclusions ---------------------------------------- */

function InclusionsExclusions({ ctx, inclusions, exclusions, sectionNumber }: {
  ctx: SectionCtx;
  inclusions: string[];
  exclusions: string[];
  sectionNumber: string;
}) {
  const { S, label, headingStyle } = ctx;
  const hasInclusions = inclusions.length > 0;
  const hasExclusions = exclusions.length > 0;
  if (!hasInclusions && !hasExclusions) return null;

  const title =
    hasInclusions && hasExclusions
      ? `${label("section.inclusions", "Inclusions")} & ${label("section.exclusions", "Exclusions")}`
      : hasInclusions
        ? label("section.inclusions", "Inclusions")
        : label("section.exclusions", "Exclusions");

  const colStyle = hasInclusions && hasExclusions ? S.col : S.colFull;

  return (
    <View style={S.section}>
      <SectionHeader S={S} number={sectionNumber} icon="list" title={title} titleStyle={headingStyle} />
      <View style={hasInclusions && hasExclusions ? S.twoCol : undefined}>
        {hasInclusions ? (
          <View style={colStyle}>
            <View style={S.panelCard}>
              <View style={[S.sectionCardTitle, { color: COLOR.deepBrown }, headingStyle]}>
                <CheckIcon />
                <Text>{label("tour.inclusions", "What's Included")}</Text>
              </View>
              {inclusions.map((inc, i) => (
                <View key={i} style={S.listItem}>
                  <View style={S.listItemIcon}><CheckIcon /></View>
                  <Text style={S.listItemText}>{inc}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
        {hasExclusions ? (
          <View style={colStyle}>
            <View style={S.panelCard}>
              <View style={[S.sectionCardTitle, { color: COLOR.deepBrown }, headingStyle]}>
                <CrossIcon />
                <Text>{label("tour.exclusions", "What's Not Included")}</Text>
              </View>
              {exclusions.map((exc, i) => (
                <View key={i} style={S.listItem}>
                  <View style={S.listItemIcon}><CrossIcon /></View>
                  <Text style={S.listItemText}>{exc}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/* ----- 9. Terms & Conditions ---------------------------------------------- */

function TermsConditions({ ctx, items, companyName, sectionNumber }: {
  ctx: SectionCtx;
  items: string[];
  companyName: string;
  sectionNumber: string;
}) {
  const { S, label, headingStyle } = ctx;
  if (items.length === 0) return null;

  const resolved = items.map((it) => it.replace("{companyName}", companyName));

  return (
    <View style={S.section}>
      <SectionHeader S={S} number={sectionNumber} icon="terms" title={label("section.terms", "Terms & Conditions")} titleStyle={headingStyle} />
      <View style={S.termsCard}>
        {resolved.map((item, i) => (
          <View key={i} style={S.termsItemRow}>
            <SunDiscBullet size={9} />
            <Text style={S.termsItemText}>{item}</Text>
          </View>
        ))}
        <Text style={[S.termsItemText, { marginTop: SPACE.xs }]}>
          {label("terms.readFull", "Read the full terms on our website:")}{" "}
          <Link src={TERMS_URL} style={S.termsLinkText}>{TERMS_URL}</Link>
        </Text>
      </View>
    </View>
  );
}

/* ----- 10. Privacy Policy ------------------------------------------------ */

function PrivacyPolicy({ ctx, items, sectionNumber }: {
  ctx: SectionCtx;
  items: string[];
  sectionNumber: string;
}) {
  const { S, label, headingStyle } = ctx;
  if (items.length === 0) return null;

  return (
    <View style={S.section}>
      <SectionHeader S={S} number={sectionNumber} icon="terms" title={label("general.privacyPolicy", "Privacy Policy")} titleStyle={headingStyle} />
      <View style={S.termsCard}>
        {items.map((item, i) => (
          <View key={i} style={S.termsItemRow}>
            <PyramidBullet size={9} />
            <Text style={S.termsItemText}>{item}</Text>
          </View>
        ))}
        <Text style={[S.termsItemText, { marginTop: SPACE.xs }]}>
          {label("privacy.readFull", "Read the full privacy policy:")}{" "}
          <Link src={PRIVACY_URL} style={S.termsLinkText}>{PRIVACY_URL}</Link>
        </Text>
      </View>
    </View>
  );
}
/* ----- 11. Agent / Employee Details + Digital Signature ------------------ */

function AgentSignature({ ctx, companyInfo, sectionNumber }: {
  ctx: SectionCtx;
  companyInfo: CompanyInfo;
  sectionNumber: string;
}) {
  const { S, label, headingStyle, cinzelStyle } = ctx;
  const manager = companyInfo.operationsManager;
  const name = manager?.name || getAgentName(companyInfo);
  const role = label("ops.manager", "Operations Manager");
  const phone = manager?.phone || companyInfo.phone || companyInfo.whatsapp || "";
  const email = manager?.email || companyInfo.email || "";

  return (
    <View style={S.section}>
      <SectionHeader S={S} number={sectionNumber} icon="contact" title={label("section.contact", "Agent / Employee Details")} titleStyle={headingStyle} />
      <View style={[S.panelCard, { flexDirection: "row" }]}>
        <View style={S.signatureBlock}>
          <Text style={[S.signatureAgentName, cinzelStyle]}>{shapeForPdf(name)}</Text>
          <Text style={S.signatureRoleLabel}>{role}</Text>
          {hasText(phone) ? (
            <View style={S.contactLine}><View style={S.contactLineIcon}><SunDiscBullet size={8} /></View><Text style={S.contactLineText}>{phone}</Text></View>
          ) : null}
          {hasText(email) ? (
            <View style={S.contactLine}><View style={S.contactLineIcon}><EyeOfHorusBullet size={8} /></View><Text style={S.contactLineText}>{email}</Text></View>
          ) : null}
        </View>
        <View style={S.signatureSvg}>
          <DigitalSignature />
          <View style={{ alignItems: "center" }}>
            <View style={S.signatureLine} />
            <Text style={S.signatureCaption}>{label("general.signature", "Digital Signature")}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/* ----- 12. Company Details & Logo ---------------------------------------- */

function CompanyDetails({ ctx, companyInfo, sectionNumber }: {
  ctx: SectionCtx;
  companyInfo: CompanyInfo;
  sectionNumber: string;
}) {
  const { S, label, headingStyle } = ctx;
  const social = companyInfo.socialMedia;

  return (
    <View style={S.section}>
      <SectionHeader S={S} number={sectionNumber} icon="contact" title={label("section.company", "Company Details")} titleStyle={headingStyle} />
      <View style={[S.panelCard, { flexDirection: "row", alignItems: "center" }]}>
        <View style={S.companyLogoBox}>
          <Image src={LOGO_SRC} style={S.companyLogo} />
        </View>
        <View style={S.companyDetailsBlock}>
          <Text style={[S.companyDetailsTitle, headingStyle]}>{shapeForPdf(companyInfo.name)}</Text>
          {hasText(companyInfo.tagline) ? <Text style={S.companyDetailsTagline}>{shapeForPdf(companyInfo.tagline!)}</Text> : null}
          <View style={S.companyDetailsRows}>
            {hasText(companyInfo.phone) ? <View style={S.contactLine}><View style={S.contactLineIcon}><SunDiscBullet size={8} /></View><Text style={S.contactLineText}>{companyInfo.phone}</Text></View> : null}
            {hasText(companyInfo.email) ? <View style={S.contactLine}><View style={S.contactLineIcon}><EyeOfHorusBullet size={8} /></View><Text style={S.contactLineText}>{companyInfo.email}</Text></View> : null}
            {hasText(companyInfo.website) ? <View style={S.contactLine}><View style={S.contactLineIcon}><ScarabBullet size={8} /></View><Text style={S.contactLineText}>{companyInfo.website}</Text></View> : null}
            {hasText(companyInfo.address) ? <View style={S.contactLine}><View style={S.contactLineIcon}><LotusBullet size={8} /></View><Text style={S.contactLineText}>{shapeForPdf(companyInfo.address!)}</Text></View> : null}
          </View>
        </View>
      </View>
      {social && (social.facebook || social.instagram || social.youtube || social.twitter || social.googleBusiness) ? (
        <View style={S.socialRow} wrap={false}>
          {social.facebook ? <Link src={social.facebook} style={S.socialLinkItem}>{label("social.facebook", "Facebook")}</Link> : null}
          {social.instagram ? <Link src={social.instagram} style={S.socialLinkItem}>{label("social.instagram", "Instagram")}</Link> : null}
          {social.youtube ? <Link src={social.youtube} style={S.socialLinkItem}>{label("social.youtube", "YouTube")}</Link> : null}
          {social.twitter ? <Link src={social.twitter} style={S.socialLinkItem}>{label("social.twitter", "X (Twitter)")}</Link> : null}
          {social.googleBusiness ? <Link src={social.googleBusiness} style={S.socialLinkItem}>{label("social.googleBusiness", "Google Business")}</Link> : null}
        </View>
      ) : null}
    </View>
  );
}

/* ============================================================================
 * DATA HELPERS
 * ==========================================================================*/

/** Resolve a /public/images asset for the browser or the Node renderer. */
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
const LOGO_SRC = resolvePdfAsset("pdf-kemerya-logo.png");

/** Effective day-by-day itinerary: custom days, else the tour's itinerary. */
function buildItineraryList(tour: Tour | null, booking: BookingConfig): ItineraryDay[] {
  if (booking.isCustomTour) {
    if (booking.customItinerary && booking.customItinerary.length > 0) return booking.customItinerary;
    return [
      {
        day: 1,
        title: "Custom Arranged Itinerary",
        description:
          "This is a fully customized tour. Your dedicated Operations Manager will design each day according to your preferences and provide a detailed schedule shortly.",
      },
    ];
  }
  return tour?.itinerary ?? [];
}

/** Effective tour display title. */
function getTourTitle(tour: Tour | null, booking: BookingConfig): string {
  if (booking.isCustomTour) return booking.customTourTitle || "Custom Private Tour";
  return tour?.title || "Kemerya Tours - Arranged Journey";
}

/** Number of days = nights + 1. */
function getTourDurationDays(tour: Tour | null, booking: BookingConfig): number {
  const nights = calculateNights(new Date(booking.startDate), new Date(booking.endDate));
  return nights + 1;
}

/** Effective inclusions (booking override → custom → tour). */
function getInclusions(tour: Tour | null, booking: BookingConfig): string[] {
  if (booking.inclusions?.length) return booking.inclusions;
  if (booking.isCustomTour && booking.customInclusions?.length) return booking.customInclusions;
  return tour?.inclusions ?? [];
}

/** Effective exclusions (booking override → custom → tour). */
function getExclusions(tour: Tour | null, booking: BookingConfig): string[] {
  if (booking.exclusions?.length) return booking.exclusions;
  if (booking.isCustomTour && booking.customExclusions?.length) return booking.customExclusions;
  return tour?.exclusions ?? [];
}

/**
 * Effective optional-tour offers. This is a single source of truth for the
 * Optional Tours section so that, when a future data source (e.g. a
 * `booking.optionalTours` field) arrives, only this function needs to change.
 * Currently returns an empty list, so the section renders conditionally in a
 * hidden state — nothing shows until real optional-tour data is provided.
 */
function getOptionalTours(_tour: Tour | null, _booking: BookingConfig): OptionalTourItem[] {
  return [];
}

/* ============================================================================
 * RTL SUPPORT — pure per-render mirroring, no shared/global mutable state
 * (mutating a module-level style object via globalThis is unsafe under
 * concurrent server rendering).
 * ==========================================================================*/

const LR_PAIRS: Array<[string, string]> = [
  ["paddingLeft", "paddingRight"],
  ["marginLeft", "marginRight"],
  ["borderLeftWidth", "borderRightWidth"],
  ["borderLeftColor", "borderRightColor"],
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
  if ("textAlign" in style) {
    if (style.textAlign === "left") out.textAlign = "right";
    else if (style.textAlign === "right") out.textAlign = "left";
  } else if ("fontSize" in style || "color" in style || "fontFamily" in style || "lineHeight" in style) {
    out.textAlign = "right";
  }
  return out;
}

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
 * STYLESHEET
 * ==========================================================================*/

const styles = StyleSheet.create({
  page: {
    width: "100%",
    height: "100%",
    paddingTop: 116,
    paddingBottom: 118,
    paddingHorizontal: 36,
    backgroundColor: COLOR.parchmentLight,
  },
  parchmentBg: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  borderFrame: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  contentLayer: { flex: 1 },

  // Header (fixed, repeated on every sheet)
  headerBox: { flexDirection: "row", alignItems: "center", marginBottom: SPACE.sm },
  headerText: { flex: 1, marginLeft: SPACE.sm },
  officialLogoSmall: { width: 44, height: 44 },
  brandTitle: { fontSize: 13, color: COLOR.deepBrown, letterSpacing: 1.1, textTransform: "uppercase", fontWeight: 700 },
  brandTagline: { fontSize: 8.4, color: COLOR.agedBrown, letterSpacing: 0.5, marginTop: 2 },

  // Booking reference badge
  bookingRefBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.xs,
    backgroundColor: COLOR.deepLapis,
    paddingVertical: 6,
    paddingHorizontal: SPACE.md,
    borderRadius: 4,
    marginBottom: SPACE.lg,
    alignSelf: "flex-start",
  },
  bookingRefText: { fontSize: 9.5, color: COLOR.paleGold, letterSpacing: 1.4, fontWeight: 700 },

  // Sections
  section: { marginBottom: SPACE.xl },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: SPACE.md },
  sectionNumber: {
    backgroundColor: COLOR.deepBrown,
    color: COLOR.paleGold,
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginRight: SPACE.xs,
    fontSize: 8,
    fontWeight: 700,
  },
  sectionIcon: { marginRight: SPACE.xs },
  sectionTitle: { flex: 1, fontSize: 10, color: COLOR.deepBrown, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700 },
  sectionUnderline: { marginTop: 6, height: 1.5, backgroundColor: COLOR.royalGold, opacity: 0.6, width: 60 },

  // Summary grid
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm },
  summaryItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: SPACE.sm,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: SPACE.md,
  },
  summaryItemIcon: { width: 24, height: 24, justifyContent: "center", alignItems: "center" },
  summaryItemTextWrap: { flex: 1 },
  summaryItemLabel: { fontSize: 6.6, color: COLOR.agedBrown, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 700 },
  summaryItemValue: { fontSize: 8.8, color: COLOR.deepBrown, marginTop: 2, lineHeight: 1.4 },
  summaryStrikethrough: { textDecoration: "line-through", color: COLOR.rust, fontSize: 7.6 },
  summaryOfferValue: { color: COLOR.scarabGreen, fontSize: 10, fontWeight: 700 },

  // Special offer banner
  offerBanner: {
    flexDirection: "row",
    borderWidth: 1.4,
    borderColor: COLOR.antiqueGold,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "rgba(184, 150, 58, 0.10)",
  },
  offerBadge: {
    backgroundColor: COLOR.rust,
    paddingVertical: SPACE.md,
    paddingHorizontal: SPACE.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  offerBadgeText: { color: "#FDE8E4", fontSize: 15, fontWeight: 700, letterSpacing: 0.5 },
  offerBody: { flex: 1, padding: SPACE.md },
  offerTitle: { fontSize: 11.5, color: COLOR.deepBrown, fontWeight: 700, letterSpacing: 0.5, marginBottom: 3 },
  offerNote: { fontSize: 8.4, color: COLOR.warmBrown, lineHeight: 1.5, marginBottom: SPACE.sm },
  offerPriceRow: { flexDirection: "row", alignItems: "baseline", gap: SPACE.sm, flexWrap: "wrap" },
  offerOld: { fontSize: 10, color: COLOR.rust, textDecoration: "line-through" },
  offerNew: { fontSize: 16, color: COLOR.scarabGreen, fontWeight: 700 },
  offerSave: { fontSize: 8, color: COLOR.agedBrown, fontStyle: "italic" },

  // Tour description
  tourTitle: { fontSize: 13, color: COLOR.deepBrown, fontWeight: 700, marginBottom: SPACE.xs, lineHeight: 1.4 },
  tourDescription: { fontSize: 8.8, color: COLOR.ink, lineHeight: 1.7, textAlign: "justify" },

  // Day cards
  dayCard: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER, marginBottom: SPACE.md, overflow: "hidden" },
  dayHeader: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(232, 215, 177, 0.4)", padding: SPACE.sm },
  dayBadge: { backgroundColor: COLOR.royalGold, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 3, marginRight: SPACE.sm },
  dayBadgeText: { color: COLOR.deepBrown, fontSize: 8, letterSpacing: 0.5, fontWeight: 700 },
  dayTitle: { flex: 1, fontSize: 9.8, color: COLOR.deepBrown, fontWeight: 700, letterSpacing: 0.3 },
  dayContent: { padding: SPACE.md },
  dayDescription: { fontSize: 8.8, color: COLOR.ink, lineHeight: 1.7, marginBottom: SPACE.sm, textAlign: "justify" },

  // Meta rows
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACE.xs, marginTop: SPACE.xs },
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
  metaLabel: { fontSize: 6.8, color: COLOR.agedBrown, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 700 },
  metaValue: { fontSize: 7.6, color: COLOR.deepBrown, fontWeight: 700 },
// Layout helpers
  twoCol: { flexDirection: "row", gap: SPACE.sm },
  col: { flex: 1, width: "49%" },
  colFull: { flex: 1, width: "100%" },
  panelCard: { ...CARD, padding: SPACE.md, marginBottom: SPACE.sm },
  sectionCardTitle: { fontSize: 9, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: SPACE.sm, flexDirection: "row", alignItems: "center", gap: SPACE.xs },
  listItem: { flexDirection: "row", marginBottom: SPACE.xs + 2, gap: SPACE.xs + 2, alignItems: "flex-start" },
  listItemIcon: { width: 12, height: 12, flexShrink: 0, marginTop: 1 },
  listItemText: { fontSize: 8.6, lineHeight: 1.55, flex: 1, color: COLOR.ink },

  // Optional-tour / pricing rows
  pricingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACE.xs + 3,
    paddingHorizontal: SPACE.sm,
    borderBottomWidth: 0.7,
    borderBottomColor: COLOR.paleGold,
  },
  pricingRowLast: { borderBottomWidth: 0 },
  pricingLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: SPACE.xs, paddingRight: SPACE.sm },
  pricingLeftText: { flex: 1, fontSize: 8.8, color: COLOR.deepBrown },
  pricingSub: { fontSize: 7.4, color: COLOR.agedBrown },
  pricingRight: { flexShrink: 0, textAlign: "right", fontSize: 9, color: COLOR.deepBrown, fontWeight: 600 },

  // Text blocks (notes / terms)
  notesText: { fontSize: 8.6, color: COLOR.deepBrown, lineHeight: 1.6, textAlign: "justify" },
  termsCard: { ...CARD, padding: SPACE.md },
  termsItemRow: { flexDirection: "row", gap: SPACE.xs + 1, marginBottom: SPACE.xs + 1, alignItems: "flex-start" },
  termsItemText: { flex: 1, fontSize: 7.6, color: COLOR.deepBrown, lineHeight: 1.55, textAlign: "justify" },
  termsLinkText: { fontSize: 7.6, color: COLOR.lapis, textDecoration: "underline" },

  // Contact lines
  contactLine: { flexDirection: "row", alignItems: "center", gap: SPACE.xs, marginTop: 3 },
  contactLineIcon: { width: 12, height: 12, justifyContent: "center", alignItems: "center" },
  contactLineText: { fontSize: 8.2, color: COLOR.deepBrown },

  // Agent signature
  signatureBlock: { flex: 1, paddingRight: SPACE.lg },
  signatureAgentName: { fontSize: 12.5, color: COLOR.deepLapis, fontWeight: 700, letterSpacing: 0.5 },
  signatureRoleLabel: { fontSize: 8, color: COLOR.agedBrown, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: SPACE.xs },
  signatureSvg: { width: 210, justifyContent: "flex-end", alignItems: "center" },
  signatureLine: { width: 170, height: 1, backgroundColor: COLOR.deepLapis, marginTop: SPACE.xs },
  signatureCaption: { fontSize: 7, color: COLOR.agedBrown, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 },

  // Company details
  companyLogoBox: { width: 96, alignItems: "center", justifyContent: "center" },
  companyLogo: { width: 72, height: 72 },
  companyDetailsBlock: { flex: 1 },
  companyDetailsTitle: { fontSize: 12, color: COLOR.deepBrown, fontWeight: 700, letterSpacing: 0.5 },
  companyDetailsTagline: { fontSize: 8.4, color: COLOR.agedBrown, marginBottom: SPACE.xs },
  companyDetailsRows: { marginTop: 2 },

  // Social links
  socialRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACE.sm, marginTop: SPACE.sm },
  socialLinkItem: { fontSize: 8, color: COLOR.lapis, textDecoration: "underline" },

  // Footer (fixed, repeated on every sheet)
  footerBand: { position: "absolute", left: 36, right: 36, bottom: 18 },
  companyRect: {
    backgroundColor: COLOR.deepBrown,
    borderRadius: 5,
    paddingVertical: SPACE.sm,
    paddingHorizontal: SPACE.md,
    marginBottom: SPACE.sm,
  },
  companyRectRow: { flexDirection: "row", flexWrap: "wrap", gap: SPACE.md },
  companyRectCell: { flexDirection: "row", alignItems: "center", gap: 4 },
  companyRectIcon: { width: 12, height: 12, justifyContent: "center", alignItems: "center" },
  companyRectText: { fontSize: 7, color: COLOR.paleGold, letterSpacing: 0.2 },
  companyRectAddressRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: SPACE.xs },
  companyRectAddress: { fontSize: 6.8, color: COLOR.paleGold, lineHeight: 1.4 },
  footerCaption: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  footerBrand: { fontSize: 10, color: COLOR.deepBrown, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 },
  footerTagline: { fontSize: 7.4, color: COLOR.agedBrown, fontStyle: "italic" },
  footerPage: { fontSize: 7.6, color: COLOR.warmBrown, letterSpacing: 0.6 },
});

/* ============================================================================
 * MAIN DOCUMENT — assembles the modular sections in the fixed content order.
 * ==========================================================================*/

export function ItineraryPDF({ tour, booking, companyInfo = KEMERYA_COMPANY_INFO, translatedData, languageCode }: ItineraryPDFProps) {
  const tourTitle = getTourTitle(tour, booking);
  const daysCount = getTourDurationDays(tour, booking);
  const nights = Math.max(daysCount - 1, calculateNights(new Date(booking.startDate), new Date(booking.endDate)));
  const itinerary = buildItineraryList(tour, booking);
  const inclusions = getInclusions(tour, booking);
  const exclusions = getExclusions(tour, booking);
  const totalTravelers = booking.travelers.adults + booking.travelers.children + booking.travelers.infants;
  const bookingRef = booking.id.replace(/^bk-/, "").toUpperCase();

  const langCode = languageCode ?? "en";
  const rtl = isRTL(langCode);
  const S = useDirectionalStyles(rtl);
  const sh = shapeForPdf;

  const hasTranslation = Boolean(translatedData && languageCode);

  // Language-aware label helper. Falls back to English and always shapes
  // Arabic so non-Latin scripts render connected in the PDF.
  const label = (key: string, fallback: string): string => {
    if (!translatedData) return sh(fallback);
    const ui = translatedData["ui"] as Record<string, string> | undefined;
    const labels = translatedData["_labels"] as Record<string, string> | undefined;
    const hit = ui?.[key] || labels?.[key];
    if (hasText(hit)) return sh(hit as string);
    return sh(fallback);
  };

  const t = (key: string, fallback: string): string =>
    sh(getTranslatedValue(translatedData, key, fallback) || fallback);

  const tList = (key: string, fallback: string[]): string[] => {
    if (!translatedData) return fallback;
    const raw = translatedData[key];
    if (!Array.isArray(raw)) return fallback;
    const strings = raw.filter((v): v is string => hasText(v));
    if (strings.length === 0) return fallback;
    return fallback.map((fb, i) => (i < strings.length && hasText(strings[i]) ? sh(strings[i]) : sh(fb)));
  };

  const translatedDays = Array.isArray(translatedData?.["itinerary.days"])
    ? (translatedData!["itinerary.days"] as Array<Record<string, unknown>>)
    : [];

  const dayField = (idx: number, field: string): string | undefined => {
    const day = translatedDays[idx];
    if (!day) return undefined;
    const value = day[field];
    return hasText(value) ? sh(value as string) : undefined;
  };

  const termsItems = getTranslatedArray(translatedData, "terms.items", getTermsItems(booking)).map(sh).filter(hasText);
  const privacyItems = getTranslatedArray(translatedData, "privacy.items", getPrivacyItems(booking)).map(sh).filter(hasText);
  const inclusionItems = tList("inclusions", inclusions).filter(hasText);
  const exclusionItems = tList("exclusions", exclusions).filter(hasText);

  // Font families
  const bodyFont = getGlobalFont(langCode);
  const latinDisplay = isLatinDisplayLanguage(langCode);
  const cinzelStyle = { fontFamily: latinDisplay ? "Cinzel" : bodyFont };
  const headingStyle = { fontFamily: latinDisplay ? "Cinzel Decorative" : bodyFont };

  // Traveler breakdown text in the target language.
  const travelerParts: string[] = [];
  if (booking.travelers.adults > 0) travelerParts.push(`${booking.travelers.adults} ${label(booking.travelers.adults > 1 ? "general.adults" : "general.adult", booking.travelers.adults > 1 ? "Adults" : "Adult")}`);
  if (booking.travelers.children > 0) travelerParts.push(`${booking.travelers.children} ${label(booking.travelers.children > 1 ? "general.children" : "general.child", booking.travelers.children > 1 ? "Children" : "Child")}`);
  if (booking.travelers.infants > 0) travelerParts.push(`${booking.travelers.infants} ${label(booking.travelers.infants > 1 ? "general.infants" : "general.infant", booking.travelers.infants > 1 ? "Infants" : "Infant")}`);
  const travelersText = travelerParts.join(", ");

  // Tour description text.
  const tourDescription =
    booking.isCustomTour
      ? booking.customTourDescription || tourTitle
      : tour?.overview && tour.overview.length > 0
        ? tour.overview.join(" ")
        : tour?.longDescription || tour?.shortDescription || tourTitle;

  // Meta cards for the Tour Description section.
  const tourMeta: Array<{ label: string; value: string }> = [];
  if (hasText(tour?.durationLabel)) tourMeta.push({ label: label("overview.duration", "Duration"), value: tour!.durationLabel! });
  if (hasText(tour?.location)) tourMeta.push({ label: label("overview.location", "Location"), value: tour!.location! });
  if (hasText(tour?.group)) tourMeta.push({ label: label("overview.group", "Group"), value: tour!.group! });
  if (hasText(tour?.language)) tourMeta.push({ label: label("overview.language", "Language"), value: tour!.language! });

  // Section numbers are computed locally as we render so they always match
  // what is actually visible (sections with no content are skipped cleanly).
  let sectionCounter = 0;
  const nextSectionNumber = () => String(++sectionCounter).padStart(2, "0");

  const ctx: SectionCtx = { S, label, headingStyle, cinzelStyle };
  const optionalTours = getOptionalTours(tour, booking);
  const footerTagline = label("footer.tagline", "Curated Egyptian Journeys · Est. Luxury");
  const footerWhatsApp = label("footer.whatsapp", "WhatsApp");
  const footerPage = label("footer.page", "Page");

return (
    <Document title={`${tourTitle} - Kemerya Tours Itinerary`} author="Kemerya Tours" creator="Kemerya Tours Dashboard">
      <ParchmentPage
        companyInfo={companyInfo}
        languageCode={langCode}
        rtl={rtl}
        footerTagline={footerTagline}
        footerWhatsAppLabel={footerWhatsApp}
        footerPageLabel={footerPage}
        S={S}
      >
        {/* 1. Booking Reference aligned to the top */}
        <BookingReference S={S} label={label} bookingRef={bookingRef} cinzelStyle={cinzelStyle} />

        {/* 2. Booking Summary & Travelers */}
        <BookingSummary
          ctx={ctx}
          booking={booking}
          daysCount={daysCount}
          nights={nights}
          travelersSummary={String(totalTravelers)}
          travelersText={travelersText}
          hasOffer={booking.offerPrice != null && booking.offerPrice > 0}
          sectionNumber={nextSectionNumber()}
        />

        {/* 3. Special Offer (conditional banner) */}
        <SpecialOffer ctx={ctx} booking={booking} sectionNumber={nextSectionNumber()} />

        {/* 4. Tour Description */}
        <TourDescription
          ctx={ctx}
          tourTitle={hasTranslation ? (booking.isCustomTour ? t("booking.customTourTitle", tourTitle) : t("tour.title", tourTitle)) : tourTitle}
          description={tourDescription}
          meta={tourMeta}
          sectionNumber={nextSectionNumber()}
        />

        {/* 5. Day-by-Day Itinerary (clean, no roadmap) */}
        <DayByDayItinerary
          ctx={ctx}
          itinerary={itinerary}
          dayField={dayField}
          sectionNumber={nextSectionNumber()}
          fallbackDay={
            itinerary.length === 0
              ? { day: 1, title: "Custom Arranged Itinerary", description: "This is a fully customized tour. Your dedicated Operations Manager will design each day according to your preferences and provide a detailed schedule shortly." }
              : null
          }
        />

        {/* 6. Optional Tours (conditional, with pricing) */}
        <OptionalTours ctx={ctx} items={optionalTours} sectionNumber={nextSectionNumber()} />

        {/* 7. Detailed Requests / Extra Services */}
        <ExtraServices
          ctx={ctx}
          notes={booking.notes || ""}
          specialRequests={booking.specialRequests || ""}
          specialRequestItems={booking.specialRequestItems}
          currency={booking.currency}
          sectionNumber={nextSectionNumber()}
        />

        {/* 8. Inclusions & Exclusions */}
        <InclusionsExclusions ctx={ctx} inclusions={inclusionItems} exclusions={exclusionItems} sectionNumber={nextSectionNumber()} />

        {/* 9. Terms & Conditions */}
        <TermsConditions ctx={ctx} items={termsItems} companyName={companyInfo.name} sectionNumber={nextSectionNumber()} />

        {/* 10. Privacy Policy */}
        <PrivacyPolicy ctx={ctx} items={privacyItems} sectionNumber={nextSectionNumber()} />

        {/* 11. Agent / Employee Details + Digital Signature */}
        <AgentSignature ctx={ctx} companyInfo={companyInfo} sectionNumber={nextSectionNumber()} />

        {/* 12. Company Details & Logo */}
        <CompanyDetails ctx={ctx} companyInfo={companyInfo} sectionNumber={nextSectionNumber()} />
      </ParchmentPage>
    </Document>
  );
}
