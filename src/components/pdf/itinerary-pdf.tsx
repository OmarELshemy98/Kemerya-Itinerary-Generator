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
} from "@react-pdf/renderer";
import type { Tour, BookingConfig, CompanyInfo, ItineraryDay } from "@/types";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import {
  formatDateShort,
  formatCurrency,
  calculateNights,
} from "@/lib/utils";

// Fonts are served locally from /public/fonts (no external CDN) so PDF
// generation always works, even offline / behind firewalls.
Font.registerHyphenationCallback((word) => [word]);

Font.register({
  family: "Cinzel",
  fonts: [
    { src: "/fonts/cinzel-latin-400-normal.woff" },
    { src: "/fonts/cinzel-latin-700-normal.woff", fontWeight: 700 },
  ],
});

// Decorative display face — headings, tour titles & day numbers only.
Font.register({
  family: "Cinzel Decorative",
  fonts: [{ src: "/fonts/cinzel-decorative-latin-400-normal.woff" }],
});

Font.register({
  family: "Lora",
  fonts: [
    { src: "/fonts/lora-latin-400-normal.woff" },
    { src: "/fonts/lora-latin-400-italic.woff", fontStyle: "italic" },
    { src: "/fonts/lora-latin-700-normal.woff", fontWeight: 700 },
  ],
});

const BRAND_COLORS = {
  navy: "#1E3A8A", // Lapis Lazuli - links & small accents only
  gold: "#C5A059", // Muted Gold - Borders & Accents
  dark: "#2C1E16", // Dark Espresso - Primary Text
  lightGold: "#E8D7B1",
  bg: "#FDFBF7", // Premium Ivory
  text: "#2C1E16", // Dark Espresso - Primary Text
  muted: "#8A8171", // Warm muted stone for secondary text
  border: "#C5A059", // Muted Gold - Borders & Accents
  inclusionsBg: "#FFFFFF",
  inclusionsText: "#2C1E16",
  exclusionsBg: "#FFFFFF",
  exclusionsText: "#2C1E16",
};

const TERMS_URL = "https://www.kemeryatours.com/page/terms-and-conditions";
const TERMS_ITEMS = [
  "Booking Confirmation: A booking is locked in only when Kemerya Tours confirms availability in writing, the required deposit is paid, and the official Booking Confirmation is issued. The lead traveler accepts these terms for every person included in the reservation.",
  "Deposits & Balance: A non-refundable deposit equal to 35% of the total trip cost is required upon booking confirmation. The remaining 65% balance must be paid upon arrival.",
  "Pricing & Fees: Quotes are issued in USD or EUR. Bank conversion rates and card processing fees are the traveler's responsibility. If government agencies increase monument ticket fees, taxes, port fees, or fuel surcharges before the trip, the total will be updated to cover those mandatory charges.",
  "Services & Suppliers: Certain travel components are provided by independent third-party suppliers (hotels, airlines, cruise operators, carriers, and site authorities). Services included are strictly those detailed in the confirmed quotation and itinerary.",
  "Cancellations & Changes: Most bookings can be changed or canceled depending on the airline, hotel, or service provider's policy. Deposits are non-refundable; cancellation fees follow the confirmed booking terms.",
  "Liability: Kemerya Tours' maximum financial liability for any dispute, injury, damage, or expense connected to the trip never exceeds the total amount paid for the specific booking. Indirect or consequential damages are excluded.",
  "In-Trip Complaints: Report any issue to your guide or local representative immediately so it can be fixed on the spot; otherwise send a detailed email complaint within 15 days of finishing the trip.",
  "Emergency & Governing Law: A 24/7 emergency line is printed on the confirmation voucher. Egyptian law governs these booking terms.",
];

// ═══════════════════════════════════════════════════════════════
// Pharaonic SVG Icons — Luxury Gold (#C5A059)
// ═══════════════════════════════════════════════════════════════

/** Ankh — Ancient Egyptian symbol of life */
const AnkhIcon = ({
  size = 20,
  color = "#C5A059",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G fill={color}>
      <Path d="M12 2 L12 22 M12 4 C8 4 6 7 6 10 C6 13 8 15 12 15 C16 15 18 13 18 10 C18 7 16 4 12 4 Z" />
    </G>
  </Svg>
);

/** Pyramid — Icon of Egypt & Tourism */
const PyramidIcon = ({
  size = 18,
  color = "#C5A059",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G fill={color}>
      <Path d="M12 2 L22 20 L2 20 Z" />
      <Path d="M12 2 L12 20 M7 10 L17 10" fill="none" stroke={color} strokeWidth="0.5" />
    </G>
  </Svg>
);

/** Location Pin — For destinations & meeting points */
const LocationPinIcon = ({
  size = 14,
  color = "#C5A059",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G fill={color}>
      <Path d="M12 2 C7 2 3 6 3 11 C3 17 12 22 12 22 C12 22 21 17 21 11 C21 6 17 2 12 2 Z M12 13.5 C10.62 13.5 9.5 12.38 9.5 11 C9.5 9.62 10.62 8.5 12 8.5 C13.38 8.5 14.5 9.62 14.5 11 C14.5 12.38 13.38 13.5 12 13.5 Z" />
    </G>
  </Svg>
);

/** Lotus Divider — Horizontal SVG divider with central lotus/diamond motif */
const LotusDivider = ({
  width = 400,
  color = "#C5A059",
}: {
  width?: number;
  color?: string;
}) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
    <View style={{ flex: 1, height: 0.5, backgroundColor: color }} />
    <View style={{ marginHorizontal: 8 }}>
      <Svg width={20} height={20} viewBox="0 0 20 20">
        <G fill={color}>
          {/* Central diamond */}
          <Path d="M10 2 L18 10 L10 18 L2 10 Z" />
          {/* Inner lotus petals */}
          <Path d="M10 5 L13 10 L10 15 L7 10 Z" fill="#FDFBF7" />
        </G>
      </Svg>
    </View>
    <View style={{ flex: 1, height: 0.5, backgroundColor: color }} />
  </View>
);

/** Eye of Horus — Protection & ancient Egyptian motif */
const EyeOfHorusIcon = ({
  size = 16,
  color = "#C5A059",
}: {
  size?: number;
  color?: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      {/* Eye outline */}
      <Path d="M2 12 C5 6 9 4 12 4 C15 4 19 6 22 12 C19 18 15 20 12 20 C9 20 5 18 2 12 Z" fill={color} />
      {/* Inner eye curve */}
      <Path d="M12 8 C10 8 8 10 8 12 C8 14 10 16 12 16" fill="none" stroke="#FDFBF7" strokeWidth="1.5" />
      {/* Pupil circle using path */}
      <Path d="M12 10 C10.9 10 10 10.9 10 12 C10 13.1 10.9 14 12 14 C13.1 14 14 13.1 14 12 C14 10.9 13.1 10 12 10 Z" fill="#FDFBF7" />
    </G>
  </Svg>
);

const styles = StyleSheet.create({
  // ─── Core Layout ─────────────────────────────────────────────────────────────
  page: {
    backgroundColor: "#FDFBF7",
    padding: 22,
    fontFamily: "Lora",
  },
  pageFrame: {
    borderWidth: 1,
    borderColor: "#C5A059",
    padding: 18,
    position: "relative",
  },
  headerBox: {
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#C5A059",
  },
  brandTitle: {
    fontFamily: "Cinzel",
    fontSize: 24,
    color: "#1E3A8A",
    letterSpacing: 2,
    marginTop: 8,
  },
  coverPage: {
    backgroundColor: "#FDFBF7",
    padding: 30,
    fontFamily: "Lora",
  },
  innerPage: {
    backgroundColor: "#FDFBF7",
    fontFamily: "Lora",
  },
  bookingRefBadge: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  bookingRefText: {
    color: "white",
    fontSize: 11,
    fontFamily: "Cinzel",
    fontWeight: 700,
    letterSpacing: 1,
  },
  // --- Terms & Policy ---
  termsSection: {
    marginTop: 4,
  },
  termsCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: BRAND_COLORS.border,
    padding: 14,
  },
  termsItemRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 6,
  },
  termsBullet: {
    color: BRAND_COLORS.gold,
    fontSize: 8.5,
    fontWeight: "bold",
  },
  termsItemText: {
    flex: 1,
    fontSize: 8.5,
    color: BRAND_COLORS.text,
    fontFamily: "Lora",
    lineHeight: 1.55,
    textAlign: "justify",
  },
  termsLinkText: {
    fontSize: 8.5,
    color: BRAND_COLORS.navy,
    fontFamily: "Lora",
    textDecoration: "underline",
  },
  // --- Leave a Review block ---
  reviewCard: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: BRAND_COLORS.gold,
    padding: 24,
    alignItems: "center",
    marginTop: 10,
  },
  reviewTitle: {
    color: BRAND_COLORS.dark,
    fontSize: 13,
    fontFamily: "Cinzel Decorative",
    letterSpacing: 0.5,
  },
  reviewSubtitle: {
    color: BRAND_COLORS.muted,
    fontSize: 9,
    fontFamily: "Lora",
    textAlign: "center",
    marginTop: 5,
    lineHeight: 1.5,
  },
  reviewBadge: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginTop: 10,
  },
  reviewBadgeText: {
    color: "white",
    fontSize: 9.5,
    fontFamily: "Cinzel Decorative",
    letterSpacing: 0.8,
  },
  reviewLink: {
    color: BRAND_COLORS.muted,
    fontSize: 8,
    fontFamily: "Lora",
    marginTop: 8,
  },
  // --- Social links footer ---
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: BRAND_COLORS.border,
  },
  socialLinkItem: {
    fontSize: 8.5,
    color: BRAND_COLORS.navy,
    fontFamily: "Lora",
    fontWeight: "bold",
  },
  logoImg: {
    height: 55,
    width: 220,
    objectFit: "contain",
    marginBottom: 8,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: BRAND_COLORS.gold,
  },
  logoImgSmall: {
    height: 40,
    width: 160,
    objectFit: "contain",
    marginBottom: 6,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: BRAND_COLORS.gold,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 18,
    borderBottomWidth: 3,
    borderBottomColor: BRAND_COLORS.gold,
    borderBottomStyle: "solid",
  },
  brandBlock: {
    flexDirection: "column",
    gap: 4,
  },
  brandName: {
    fontSize: 26,
    fontFamily: "Cinzel Decorative",
    color: BRAND_COLORS.dark,
    letterSpacing: 1.2,
  },
  brandTagline: {
    fontSize: 9,
    color: BRAND_COLORS.gold,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  brandLine: {
    height: 2,
    width: 60,
    backgroundColor: BRAND_COLORS.gold,
    marginTop: 6,
  },
  headerContact: {
    textAlign: "right",
    fontSize: 8.5,
    color: BRAND_COLORS.muted,
    lineHeight: 1.6,
  },
  heroCard: {
    backgroundColor: "transparent",
    padding: 0,
    marginBottom: 24,
    borderRadius: 0,
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: BRAND_COLORS.gold,
    position: "relative",
    overflow: "hidden",
  },
  heroTopBar: {
    height: 3,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: BRAND_COLORS.gold,
  },
  heroTourName: {
    color: BRAND_COLORS.dark,
    fontSize: 22,
    fontFamily: "Cinzel Decorative",
    marginBottom: 10,
    lineHeight: 1.3,
  },
  heroSubtitle: {
    color: BRAND_COLORS.gold,
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 22,
  },
  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 15,
  },
  heroStat: {
    width: "31%",
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.1)",
  },
  heroStatLast: {
    flex: 1,
    minWidth: "30%",
    paddingRight: 0,
    borderRightWidth: 0,
  },
  heroStatLabel: {
    color: BRAND_COLORS.muted,
    fontSize: 7.5,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heroStatValue: {
    color: BRAND_COLORS.dark,
    fontSize: 14,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 14,
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
    borderRadius: 0,
    backgroundColor: BRAND_COLORS.gold,
    color: "white",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 28,
  },
  sectionTitle: {
    fontSize: 14,
    color: BRAND_COLORS.dark,
    fontFamily: "Cinzel Decorative",
    letterSpacing: 0.4,
  },
  sectionUnderline: {
    flex: 1,
    height: 1,
    backgroundColor: BRAND_COLORS.border,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  summaryItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#C5A059",
    borderRadius: 0,
    backgroundColor: "transparent",
    gap: 8,
  },
  summaryItemLabel: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  summaryItemValue: {
    fontSize: 11,
    color: BRAND_COLORS.text,
    fontWeight: "semibold",
  },
  summaryItemBullet: {
    width: 4,
    height: 12,
    backgroundColor: BRAND_COLORS.gold,
    borderRadius: 0,
  },
  summaryItemTextWrap: {
    flex: 1,
    flexDirection: "column",
  },
  dayCard: {
    backgroundColor: "transparent",
    borderRadius: 0,
    marginBottom: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border,
    overflow: "hidden",
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E3A8A",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: BRAND_COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  dayBadge: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dayBadgeText: {
    color: "white",
    fontSize: 9,
    fontFamily: "Cinzel Decorative",
    letterSpacing: 0.5,
  },
  dayTitle: {
    color: BRAND_COLORS.gold,
    fontSize: 12,
    fontFamily: "Cinzel Decorative",
    flex: 1,
  },
  dayContent: {
    padding: 20,
  },
  dayDescription: {
    fontSize: 10,
    color: BRAND_COLORS.text,
    fontFamily: "Lora",
    lineHeight: 1.7,
    marginBottom: 10,
    textAlign: "justify",
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: BRAND_COLORS.bg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
  },
  metaLabel: {
    fontSize: 7.5,
    color: BRAND_COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 8,
    color: BRAND_COLORS.dark,
    fontWeight: "bold",
  },
  twoCol: {
    flexDirection: "row",
    gap: 16,
  },
  col: {
    flex: 1,
    width: "50%",
  },
  inclusionsCard: {
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 14,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#C5A059",
  },
  exclusionsCard: {
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 14,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#C5A059",
  },
  sectionCardTitle: {
    fontSize: 11,
    fontFamily: "Cinzel Decorative",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  inclusionTitleText: {
    color: BRAND_COLORS.dark,
  },
  exclusionTitleText: {
    color: BRAND_COLORS.dark,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
    alignItems: "flex-start",
  },
  listItemBulletIncl: {
    width: 14,
    height: 14,
    borderRadius: 0,
    backgroundColor: BRAND_COLORS.gold,
    color: "white",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 14,
    flexShrink: 0,
    marginTop: 1,
  },
  listItemBulletExcl: {
    width: 14,
    height: 14,
    borderRadius: 0,
    backgroundColor: "#DC2626",
    color: "white",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 14,
    flexShrink: 0,
    marginTop: 1,
  },
  listItemText: {
    fontSize: 9.5,
    lineHeight: 1.5,
    flex: 1,
  },
  inclusionsText: {
    color: BRAND_COLORS.inclusionsText,
  },
  exclusionsText: {
    color: BRAND_COLORS.exclusionsText,
  },
  pricingTable: {
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 14,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border,
    overflow: "hidden",
  },
  pricingRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.border,
    backgroundColor: "transparent",
  },
  pricingRowLast: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
  },
  pricingCell: {
    flex: 1,
    fontSize: 10,
    color: BRAND_COLORS.text,
  },
  pricingCellRight: {
    flex: 1,
    textAlign: "right",
    fontSize: 10,
    color: BRAND_COLORS.text,
    fontWeight: "semibold",
  },
  pricingHeaderCell: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: BRAND_COLORS.muted,
    fontWeight: "bold",
  },
  pricingTotalLabel: {
    color: BRAND_COLORS.dark,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pricingTotalValue: {
    color: BRAND_COLORS.dark,
    fontSize: 16,
    fontWeight: "bold",
  },
  termsBlock: {
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 14,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border,
    marginBottom: 10,
  },
  termsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: BRAND_COLORS.gold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 8.5,
    color: BRAND_COLORS.text,
    lineHeight: 1.7,
    textAlign: "justify",
  },
  notesBlock: {
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 18,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: BRAND_COLORS.gold,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: BRAND_COLORS.gold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9.5,
    color: BRAND_COLORS.text,
    fontFamily: "Lora",
    lineHeight: 1.6,
  },
  // Drop cap for the first Tour Overview paragraph
  dropCap: {
    fontSize: 30,
    fontFamily: "Cinzel Decorative",
    color: BRAND_COLORS.gold,
    lineHeight: 1,
    marginRight: 3,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 40,
    right: 40,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerBrand: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
    fontWeight: "bold",
  },
  footerPage: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
  },
  operationsCard: {
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 24,
    marginTop: 16,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: BRAND_COLORS.gold,
  },
  operationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  opsBadge: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 0,
  },
  opsBadgeText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  opsCardTitle: {
    color: BRAND_COLORS.dark,
    fontSize: 12,
    fontFamily: "Cinzel Decorative",
  },
  opsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  opsItem: {
    width: "47%",
    flexDirection: "column",
    gap: 2,
  },
  opsLabel: {
    fontSize: 7.5,
    color: BRAND_COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  opsValue: {
    fontSize: 10,
    color: BRAND_COLORS.text,
    fontWeight: "semibold",
  },
  clientBadge: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  clientBadgeText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  pageNumber: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
  },
  pageCount: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
  },
});

function LuxuryPage({
  children,
  companyInfo,
}: {
  children: React.ReactNode;
  companyInfo?: CompanyInfo;
}) {
  const logoSrc = companyInfo?.logo;
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.pageFrame}>
        <View style={styles.headerBox}>
          {logoSrc ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image
              src={logoSrc}
              style={{
                width: 150,
                height: 50,
                objectFit: "contain",
                marginBottom: 10,
              }}
            />
          ) : (
            <AnkhIcon size={28} />
          )}
          <Text style={styles.brandTitle}>
            {companyInfo?.name || "KEMERYA TOURS"}
          </Text>
          <LotusDivider width={200} />
        </View>
        {children}
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
  // Employee-edited inclusions take priority (standard mode)
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
  // Employee-edited exclusions take priority (standard mode)
  if (booking.exclusions?.length) {
    return booking.exclusions;
  }
  if (booking.isCustomTour && booking.customExclusions?.length) {
    return booking.customExclusions;
  }
  return tour?.exclusions ?? [];
}

interface ItineraryPDFProps {
  tour: Tour | null;
  booking: BookingConfig;
  companyInfo?: CompanyInfo;
}

export function ItineraryPDF({
  tour,
  booking,
  companyInfo = KEMERYA_COMPANY_INFO,
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
  const bookingRef = booking.id.toUpperCase().replace(/-/g, "").slice(-8);
  const totalTravelersTextParts: string[] = [];
  if (booking.travelers.adults > 0) totalTravelersTextParts.push(`${booking.travelers.adults} Adult${booking.travelers.adults > 1 ? "s" : ""}`);
  if (booking.travelers.children > 0) totalTravelersTextParts.push(`${booking.travelers.children} Child${booking.travelers.children > 1 ? "ren" : ""}`);
  if (booking.travelers.infants > 0) totalTravelersTextParts.push(`${booking.travelers.infants} Infant${booking.travelers.infants > 1 ? "s" : ""}`);
  const travelersText = totalTravelersTextParts.join(", ");

  return (
    <Document title={`${tourTitle} - Kemerya Tours Itinerary`} author="Kemerya Tours" creator="Kemerya Tours Dashboard">
      <LuxuryPage companyInfo={companyInfo}>
        {/* Minimalist Booking Ref Badge - Floating above Tour Title */}
        <View style={styles.bookingRefBadge}>
          <Text style={styles.bookingRefText}>Ref: {bookingRef}</Text>
        </View>

        {/* HERO */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopBar} />
          <View style={styles.clientBadge}>
            <Text style={styles.clientBadgeText}>Booking Reference · {bookingRef}</Text>
          </View>
          <Text style={styles.heroSubtitle}>Your Exclusive Travel Itinerary</Text>
          <Text style={styles.heroTourName}>{tourTitle}</Text>
          <View style={styles.heroGrid}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Departure Date</Text>
              <Text style={styles.heroStatValue}>
                {formatDateShort(booking.startDate)}
              </Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Return Date</Text>
              <Text style={styles.heroStatValue}>
                {formatDateShort(booking.endDate)}
              </Text>
            </View>
            <View style={styles.heroStatLast}>
              <Text style={styles.heroStatLabel}>Duration</Text>
              <Text style={styles.heroStatValue}>
                {daysCount} Days / {nights} Nights
              </Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Travelers</Text>
              <Text style={styles.heroStatValue}>{totalTravelers} Guest{totalTravelers > 1 ? "s" : ""}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Total Price</Text>
              <Text style={styles.heroStatValue}>
                {formatCurrency(booking.totalPrice, booking.currency)}
              </Text>
            </View>
            <View style={styles.heroStatLast}>
              <Text style={styles.heroStatLabel}>Reference</Text>
              <Text style={styles.heroStatValue}>#{bookingRef}</Text>
            </View>
          </View>
        </View>

        {/* 01 - BOOKING SUMMARY */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>01</View>
            <Text style={styles.sectionTitle}>Booking Summary</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <View style={styles.summaryGrid}>
            <SummaryCard
              label="Total Travelers"
              value={`${totalTravelers} (${travelersText})`}
            />
            <SummaryCard
              label="Tour Duration"
              value={`${daysCount} Days / ${nights} Nights`}
            />
            <SummaryCard
              label="Travel Period"
              value={`${formatDateShort(booking.startDate)} → ${formatDateShort(booking.endDate)}`}
            />
            <SummaryCard
              label={booking.currency === "EUR" ? "Total Amount (EUR)" : "Total Amount (USD)"}
              value={formatCurrency(booking.totalPrice, booking.currency)}
            />
            {booking.clientName && (
              <SummaryCard label="Client Name" value={booking.clientName} />
            )}
            {booking.clientEmail && (
              <SummaryCard label="Client Email" value={booking.clientEmail} />
            )}
            {booking.clientPhone && (
              <SummaryCard label="Client Phone" value={booking.clientPhone} />
            )}
            {booking.clientWhatsapp && (
              <SummaryCard label="Client WhatsApp" value={booking.clientWhatsapp} />
            )}
            {booking.meetingPoint && (
              <SummaryCard label="Meeting Point" value={booking.meetingPoint} />
            )}
            {booking.flightArrival && (
              <SummaryCard
                label="Airport Arrival / Tour Start"
                value={booking.flightArrival.replace("T", " · ")}
              />
            )}
            {booking.pickupTime && (
              <SummaryCard label="Pickup Time" value={booking.pickupTime} />
            )}
          </View>
        </View>

        {/* TOUR OVERVIEW — same text as the website #overview section */}
        {!booking.isCustomTour && tour?.overview?.length ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>02</View>
              <Text style={styles.sectionTitle}>Tour Overview</Text>
              <View style={styles.sectionUnderline} />
            </View>
            {tour.overview.map((para, i) =>
              i === 0 && para.length > 0 ? (
                <Text key={i} style={{ ...styles.notesText, marginBottom: 6 }}>
                  {/* Drop cap on the first paragraph */}
                  <Text style={styles.dropCap}>{para.charAt(0)}</Text>
                  {para.slice(1)}
                </Text>
              ) : (
                <Text key={i} style={{ ...styles.notesText, marginBottom: 6 }}>
                  {para}
                </Text>
              )
            )}
            {(tour.location || tour.group || tour.language || tour.durationLabel) && (
              <View style={{ ...styles.summaryGrid, marginTop: 8 }}>
                {tour.durationLabel && (
                  <SummaryCard label="Duration" value={tour.durationLabel} />
                )}
                {tour.location && (
                  <SummaryCard label="Location" value={tour.location} />
                )}
                {tour.group && (
                  <SummaryCard label="Group" value={tour.group} />
                )}
                {tour.language && (
                  <SummaryCard label="Language" value={tour.language} />
                )}
              </View>
            )}
          </View>
        ) : null}

        {/* NOTES IF ANY */}
        {(booking.notes || booking.specialRequests) && (
          <View style={styles.notesBlock}>
            {booking.notes && (
              <>
                <Text style={styles.notesTitle}>Itinerary Notes</Text>
                <Text style={styles.notesText}>{booking.notes}</Text>
              </>
            )}
            {booking.specialRequests && (
              <>
                <Text style={{ ...styles.notesTitle, marginTop: booking.notes ? 10 : 0 }}>
                  Special Requests
                </Text>
                <Text style={styles.notesText}>{booking.specialRequests}</Text>
              </>
            )}
          </View>
        )}

        {/* FOOTER PAGE 1 */}
        <View style={styles.footer}>
          <Text style={styles.footerPage}>Page 1</Text>
        </View>
      </LuxuryPage>

      {/* =============================================== */}
      {/* PAGE 2 - ITINERARY DAYS 1-3                    */}
      {/* =============================================== */}
      <LuxuryPage companyInfo={companyInfo}>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>02</View>
            <Text style={styles.sectionTitle}>Day-by-Day Itinerary</Text>
            <View style={styles.sectionUnderline} />
          </View>

          {itinerary.slice(0, 3).map((day) => (
            <DayCard key={day.day} day={day} />
          ))}

          {itinerary.length === 0 && (
            <DayCard
              day={{
                day: 1,
                title: "Custom Arranged Itinerary",
                description:
                  "This is a fully customized tour. Your dedicated Operations Manager will design each day according to your preferences and provide a detailed schedule shortly.",
              }}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerPage}>Page 2</Text>
        </View>
      </LuxuryPage>

      {/* PAGE 3 - REMAINING ITINERARY DAYS */}
      {itinerary.length > 3 && (
        <LuxuryPage companyInfo={companyInfo}>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>02</View>
              <Text style={styles.sectionTitle}>Itinerary (Continued)</Text>
              <View style={styles.sectionUnderline} />
            </View>

            {itinerary.slice(3, 7).map((day) => (
              <DayCard key={day.day} day={day} />
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerPage}>Page 3</Text>
          </View>
        </LuxuryPage>
      )}

      {/* PAGE 4 - INCLUSIONS, EXCLUSIONS, PRICING, CONTACTS */}
      <LuxuryPage companyInfo={companyInfo}>

        {/* 03 - INCLUSIONS / EXCLUSIONS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>03</View>
            <Text style={styles.sectionTitle}>Inclusions & Exclusions</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <View style={styles.inclusionsCard}>
                <Text style={{ ...styles.sectionCardTitle, ...styles.inclusionTitleText }}>
                  ✔ What&apos;s Included
                </Text>
                {inclusions.length > 0 ? (
                  inclusions.map((inc, i) => (
                    <View key={i} style={styles.listItem}>
                      <Text style={styles.listItemBulletIncl}>✓</Text>
                      <Text style={{ ...styles.listItemText, ...styles.inclusionsText }}>
                        {inc}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ ...styles.listItemText, ...styles.inclusionsText }}>
                    Customized inclusions to be confirmed by Operations team.
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.col}>
              <View style={styles.exclusionsCard}>
                <Text style={{ ...styles.sectionCardTitle, ...styles.exclusionTitleText }}>
                  ✕ What&apos;s Not Included
                </Text>
                {exclusions.length > 0 ? (
                  exclusions.map((exc, i) => (
                    <View key={i} style={styles.listItem}>
                      <Text style={styles.listItemBulletExcl}>✕</Text>
                      <Text style={{ ...styles.listItemText, ...styles.exclusionsText }}>
                        {exc}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ ...styles.listItemText, ...styles.exclusionsText }}>
                    Standard exclusion terms apply.
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* 04 - PRICING */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>04</View>
            <Text style={styles.sectionTitle}>Pricing & Payment</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <View style={styles.pricingTable}>
            <View style={{ ...styles.pricingRow, backgroundColor: BRAND_COLORS.bg }}>
              <Text style={{ ...styles.pricingCell, ...styles.pricingHeaderCell }}>Description</Text>
              <Text style={{ ...styles.pricingCellRight, ...styles.pricingHeaderCell }}>Amount ({booking.currency})</Text>
            </View>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingCell}>
                Tour Package ({tourTitle})
              </Text>
              <Text style={styles.pricingCellRight}>
                {formatCurrency(booking.totalPrice, booking.currency)}
              </Text>
            </View>
            {booking.travelers.adults > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingCell}>
                  · Adults ({booking.travelers.adults})
                </Text>
                <Text style={styles.pricingCellRight}>
                  —
                </Text>
              </View>
            )}
            {booking.travelers.children > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingCell}>
                  · Children ({booking.travelers.children})
                </Text>
                <Text style={styles.pricingCellRight}>
                  —
                </Text>
              </View>
            )}
            {booking.travelers.infants > 0 && (
              <View style={styles.pricingRow}>
                <Text style={styles.pricingCell}>
                  · Infants ({booking.travelers.infants})
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
                Total Amount Due
              </Text>
              <Text style={{ ...styles.pricingCellRight, ...styles.pricingTotalValue }}>
                {formatCurrency(booking.totalPrice, booking.currency)}
              </Text>
            </View>
          </View>

          <View style={styles.termsBlock}>
            <Text style={styles.termsTitle}>Payment & Booking Terms</Text>
            <Text style={styles.termsText}>
              • A 30% non-refundable deposit is required to confirm the booking.{"\n"}
              • The remaining balance must be paid no later than 14 days prior to departure.{"\n"}
              • Accepted payment methods: Bank transfer, credit/debit card, or cash at our office.{"\n"}
              • Cancellations received 30+ days before departure: Deposit retained. 14–29 days: 50% of total due. Less than 14 days: No refund.{"\n"}
              • {companyInfo.name} reserves the right to modify the itinerary due to local conditions, safety, or force majeure.
            </Text>
          </View>
        </View>

        {/* 05 - OPERATIONS CONTACTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>05</View>
            <Text style={styles.sectionTitle}>Operations & Contact Info</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <View style={styles.operationsCard}>
            <View style={styles.operationsHeader}>
              <View style={styles.opsBadge}>
                <Text style={styles.opsBadgeText}>24/7 Support</Text>
              </View>
              <Text style={styles.opsCardTitle}>
                Your Operations Team — Available Round the Clock
              </Text>
            </View>
            <View style={styles.opsGrid}>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>Operations Manager</Text>
                <Text style={styles.opsValue}>{companyInfo.operationsManager.name}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>Direct Mobile</Text>
                <Text style={styles.opsValue}>{companyInfo.operationsManager.phone}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>Operations Email</Text>
                <Text style={styles.opsValue}>{companyInfo.operationsManager.email}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>WhatsApp Hotline</Text>
                <Text style={styles.opsValue}>{companyInfo.whatsapp}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>Head Office</Text>
                <Text style={styles.opsValue}>{companyInfo.phone}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>Company Email</Text>
                <Text style={styles.opsValue}>{companyInfo.email}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>Website</Text>
                <Text style={styles.opsValue}>{companyInfo.website}</Text>
              </View>
              <View style={styles.opsItem}>
                <Text style={styles.opsLabel}>Office Address</Text>
                <Text style={styles.opsValue}>{companyInfo.address}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerPage}>
            Page {itinerary.length > 3 ? "4" : "3"}
          </Text>
        </View>
      </LuxuryPage>

      {/* PAGE 5 - TERMS & POLICY + LEAVE A REVIEW */}
      <LuxuryPage companyInfo={companyInfo}>

        {/* 06 - TERMS & POLICY */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionNumber}>06</View>
            <Text style={styles.sectionTitle}>Terms & Policy</Text>
            <View style={styles.sectionUnderline} />
          </View>
          <View style={styles.termsCard}>
            {TERMS_ITEMS.map((item, i) => (
              <View key={i} style={styles.termsItemRow}>
                <Text style={styles.termsBullet}>▪</Text>
                <Text style={styles.termsItemText}>{item}</Text>
              </View>
            ))}
            <Text style={styles.termsItemText}>
              Read the full terms on our website:{" "}
              <Link src={TERMS_URL} style={styles.termsLinkText}>
                {TERMS_URL}
              </Link>
            </Text>
          </View>
        </View>

        {/* LEAVE A REVIEW */}
        <View style={styles.reviewCard}>
          <Text style={styles.reviewTitle}>Leave a Review</Text>
          <Text style={styles.reviewSubtitle}>
            Loved your tour? Your feedback on Google Business helps travelers
            like you find us.
          </Text>
          <Link src={companyInfo.socialMedia?.googleBusiness || "https://share.google/RLldzNlk9YFVuIGbD"}>
            <View style={styles.reviewBadge}>
              <Text style={styles.reviewBadgeText}>★ Write a Review</Text>
            </View>
          </Link>
          <Text style={styles.reviewLink}>
            {companyInfo.socialMedia?.googleBusiness || "https://share.google/RLldzNlk9YFVuIGbD"}
          </Text>
        </View>

        {/* SOCIAL MEDIA LINKS */}
        <View style={styles.socialRow}>
          {companyInfo.socialMedia?.facebook && (
            <Link src={companyInfo.socialMedia.facebook} style={styles.socialLinkItem}>
              Facebook
            </Link>
          )}
          {companyInfo.socialMedia?.instagram && (
            <Link src={companyInfo.socialMedia.instagram} style={styles.socialLinkItem}>
              Instagram
            </Link>
          )}
          {companyInfo.socialMedia?.youtube && (
            <Link src={companyInfo.socialMedia.youtube} style={styles.socialLinkItem}>
              YouTube
            </Link>
          )}
          {companyInfo.socialMedia?.twitter && (
            <Link src={companyInfo.socialMedia.twitter} style={styles.socialLinkItem}>
              X (Twitter)
            </Link>
          )}
          {companyInfo.socialMedia?.googleBusiness && (
            <Link src={companyInfo.socialMedia.googleBusiness} style={styles.socialLinkItem}>
              Google Business
            </Link>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerPage}>
            Page {itinerary.length > 3 ? "5" : "4"}
          </Text>
        </View>
      </LuxuryPage>
    </Document>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  const getIcon = () => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("meeting") || lowerLabel.includes("location") || lowerLabel.includes("destination")) {
      return <LocationPinIcon size={12} />;
    }
    if (lowerLabel.includes("duration") || lowerLabel.includes("period")) {
      return <PyramidIcon size={12} />;
    }
    return <View style={styles.summaryItemBullet} />;
  };

  return (
    <View style={styles.summaryItem}>
      {getIcon()}
      <View style={styles.summaryItemTextWrap}>
        <Text style={styles.summaryItemLabel}>{label}</Text>
        <Text style={styles.summaryItemValue}>{value}</Text>
      </View>
    </View>
  );
}

function DayCard({ day }: { day: ItineraryDay }) {
  return (
    <>
      <View style={styles.dayCard}>
        <View style={styles.dayHeader}>
          <View style={styles.dayBadge}>
            <AnkhIcon size={14} color="#C5A059" />
            <Text style={styles.dayBadgeText}>DAY {day.day}</Text>
          </View>
          <Text style={styles.dayTitle}>{day.title}</Text>
        </View>
        <View style={styles.dayContent}>
          <Text style={styles.dayDescription}>{day.description}</Text>
          {(day.meals || day.accommodation) && (
            <View style={styles.metaRow}>
              {day.accommodation && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Stay ·</Text>
                  <Text style={styles.metaValue}>{day.accommodation}</Text>
                </View>
              )}
              {day.meals && day.meals.length > 0 && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Meals ·</Text>
                  <Text style={styles.metaValue}>{day.meals.join(", ")}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
      <LotusDivider />
    </>
  );
}
