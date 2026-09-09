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
} from "@react-pdf/renderer";
import type { Tour, BookingConfig, CompanyInfo, ItineraryDay } from "@/types";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import {
  formatDateShort,
  formatCurrency,
  calculateNights,
} from "@/lib/utils";

Font.registerHyphenationCallback((word) => [word]);

const BRAND_COLORS = {
  navy: "#0F172A",
  gold: "#C9A962",
  dark: "#1E293B",
  lightGold: "#E8D7B1",
  bg: "#FAF7F0",
  text: "#1E293B",
  muted: "#64748B",
  border: "#E2E8F0",
  inclusionsBg: "#F0FDF4",
  inclusionsText: "#166534",
  exclusionsBg: "#FEF2F2",
  exclusionsText: "#991B1B",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: BRAND_COLORS.bg,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
  },
  logoImg: {
    height: 55,
    width: 220,
    objectFit: "contain",
    marginBottom: 8,
  },
  logoImgSmall: {
    height: 40,
    width: 160,
    objectFit: "contain",
    marginBottom: 6,
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
    fontWeight: "bold",
    color: BRAND_COLORS.navy,
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
    backgroundColor: BRAND_COLORS.navy,
    padding: 28,
    marginBottom: 24,
    borderRadius: 6,
    position: "relative",
    overflow: "hidden",
  },
  heroTopBar: {
    height: 4,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: BRAND_COLORS.gold,
  },
  heroTourName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 1.25,
  },
  heroSubtitle: {
    color: BRAND_COLORS.lightGold,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  heroStat: {
    flex: 1,
    minWidth: "30%",
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)",
  },
  heroStatLast: {
    flex: 1,
    minWidth: "30%",
    paddingRight: 0,
    borderRightWidth: 0,
  },
  heroStatLabel: {
    color: BRAND_COLORS.lightGold,
    fontSize: 7.5,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  heroStatValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  sectionNumber: {
    width: 28,
    height: 28,
    borderRadius: 6,
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
    fontWeight: "bold",
    color: BRAND_COLORS.navy,
    letterSpacing: 0.3,
  },
  sectionUnderline: {
    flex: 1,
    height: 1,
    backgroundColor: BRAND_COLORS.border,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryItem: {
    width: "48%",
    flexDirection: "row",
    padding: 12,
    borderRadius: 5,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: BRAND_COLORS.border,
  },
  summaryItemLabel: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  summaryItemValue: {
    fontSize: 11,
    color: BRAND_COLORS.text,
    fontWeight: "semibold",
  },
  summaryItemBullet: {
    width: 4,
    height: "100%",
    backgroundColor: BRAND_COLORS.gold,
    marginRight: 10,
    borderRadius: 2,
  },
  summaryItemTextWrap: {
    flex: 1,
    flexDirection: "column",
  },
  dayCard: {
    backgroundColor: "white",
    borderRadius: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BRAND_COLORS.border,
    overflow: "hidden",
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND_COLORS.dark,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dayBadge: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  dayBadgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  dayTitle: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    flex: 1,
  },
  dayContent: {
    padding: 16,
  },
  dayDescription: {
    fontSize: 10,
    color: BRAND_COLORS.text,
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
    borderRadius: 4,
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
    backgroundColor: BRAND_COLORS.inclusionsBg,
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  exclusionsCard: {
    backgroundColor: BRAND_COLORS.exclusionsBg,
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  sectionCardTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  inclusionTitleText: {
    color: BRAND_COLORS.inclusionsText,
  },
  exclusionTitleText: {
    color: BRAND_COLORS.exclusionsText,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 7,
    gap: 8,
    alignItems: "flex-start",
  },
  listItemBulletIncl: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#16A34A",
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
    borderRadius: 7,
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
    backgroundColor: "white",
    borderRadius: 6,
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
  },
  pricingRowLast: {
    backgroundColor: BRAND_COLORS.navy,
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
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  pricingTotalValue: {
    color: BRAND_COLORS.gold,
    fontSize: 16,
    fontWeight: "bold",
  },
  termsBlock: {
    backgroundColor: "white",
    borderRadius: 6,
    padding: 16,
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
    backgroundColor: "#FFFBEB",
    borderRadius: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FDE68A",
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#92400E",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9.5,
    color: "#78350F",
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 30,
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
    backgroundColor: BRAND_COLORS.navy,
    borderRadius: 6,
    padding: 18,
    marginTop: 16,
    color: "white",
  },
  operationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  opsBadge: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  opsBadgeText: {
    color: BRAND_COLORS.navy,
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  opsCardTitle: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
    color: BRAND_COLORS.lightGold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  opsValue: {
    fontSize: 10,
    color: "white",
    fontWeight: "semibold",
  },
  clientBadge: {
    backgroundColor: BRAND_COLORS.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
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
  watermark: {
    position: "absolute",
    right: -40,
    bottom: 60,
    opacity: 0.04,
    fontSize: 140,
    fontWeight: "bold",
    color: BRAND_COLORS.navy,
    letterSpacing: -2,
    transform: "rotate(-45deg)",
  },
  pageNumber: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
  },
  pageCount: {
    fontSize: 8,
    color: BRAND_COLORS.muted,
  },
  socialSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BRAND_COLORS.border,
  },
  socialTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: BRAND_COLORS.navy,
    marginBottom: 8,
  },
  socialLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  socialLink: {
    fontSize: 9,
    color: BRAND_COLORS.gold,
    textDecoration: "underline",
  },
  reviewPrompt: {
    fontSize: 9,
    color: BRAND_COLORS.text,
    lineHeight: 1.6,
  },
});

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
  if (booking.isCustomTour && booking.customInclusions?.length) {
    return booking.customInclusions;
  }
  return tour?.inclusions ?? [];
}

function getExclusions(
  tour: Tour | null,
  booking: BookingConfig
): string[] {
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
      <Page size="A4" style={styles.page}>
        <View style={styles.watermark}>KEMERYA</View>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            {companyInfo.logo ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={companyInfo.logo} style={styles.logoImg} />
            ) : (
              <>
                <Text style={styles.brandName}>{companyInfo.name}</Text>
                <Text style={styles.brandTagline}>{companyInfo.tagline}</Text>
              </>
            )}
            <View style={styles.brandLine} />
          </View>
          <View style={styles.headerContact}>
            <Text>{companyInfo.address}</Text>
            <Text>{companyInfo.phone} | {companyInfo.email}</Text>
            <Text>{companyInfo.website} | WhatsApp: {companyInfo.whatsapp}</Text>
          </View>
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
            {booking.pricePerPerson !== undefined && (
              <SummaryCard
                label="Price Per Person"
                value={formatCurrency(booking.pricePerPerson, booking.currency)}
              />
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
            {tour.overview.map((para, i) => (
              <Text key={i} style={{ ...styles.notesText, marginBottom: 6 }}>
                {para}
              </Text>
            ))}
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
          <Text style={styles.footerBrand}>
            © {new Date().getFullYear()} {companyInfo.name} · All Rights Reserved
          </Text>
          <Text style={styles.footerPage}>Page 1</Text>
        </View>
      </Page>

      {/* =============================================== */}
      {/* PAGE 2 - ITINERARY DAYS 1-3                    */}
      {/* =============================================== */}
      <Page size="A4" style={styles.page}>
        <View style={styles.watermark}>KEMERYA</View>

        <View style={styles.header}>
          <View style={styles.brandBlock}>
            {companyInfo.logo ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={companyInfo.logo} style={styles.logoImgSmall} />
            ) : (
              <Text style={{ ...styles.brandName, fontSize: 18 }}>{companyInfo.name}</Text>
            )}
            <Text style={styles.brandTagline}>{tourTitle}</Text>
            <View style={styles.brandLine} />
          </View>
          <View style={styles.headerContact}>
            <Text>Ref: #{bookingRef}</Text>
            <Text>{formatDateShort(booking.startDate)} → {formatDateShort(booking.endDate)}</Text>
            <Text>Itinerary · Day-by-Day</Text>
          </View>
        </View>

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
          <Text style={styles.footerBrand}>
            © {new Date().getFullYear()} {companyInfo.name}
          </Text>
          <Text style={styles.footerPage}>Page 2</Text>
        </View>
      </Page>

      {/* PAGE 3 - REMAINING ITINERARY DAYS */}
      {itinerary.length > 3 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.watermark}>KEMERYA</View>

          <View style={styles.header}>
            <View style={styles.brandBlock}>
              {companyInfo.logo ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={companyInfo.logo} style={styles.logoImgSmall} />
              ) : (
                <Text style={{ ...styles.brandName, fontSize: 18 }}>{companyInfo.name}</Text>
              )}
              <Text style={styles.brandTagline}>{tourTitle}</Text>
              <View style={styles.brandLine} />
            </View>
            <View style={styles.headerContact}>
              <Text>Ref: #{bookingRef}</Text>
              <Text>{formatDateShort(booking.startDate)} → {formatDateShort(booking.endDate)}</Text>
              <Text>Itinerary Continued...</Text>
            </View>
          </View>

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
            <Text style={styles.footerBrand}>
              © {new Date().getFullYear()} {companyInfo.name}
            </Text>
            <Text style={styles.footerPage}>Page 3</Text>
          </View>
        </Page>
      )}

      {/* PAGE 4 - INCLUSIONS, EXCLUSIONS, PRICING, CONTACTS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.watermark}>KEMERYA</View>

        <View style={styles.header}>
          <View style={styles.brandBlock}>
            {companyInfo.logo ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={companyInfo.logo} style={styles.logoImgSmall} />
            ) : (
              <Text style={{ ...styles.brandName, fontSize: 18 }}>{companyInfo.name}</Text>
            )}
            <Text style={styles.brandTagline}>{tourTitle}</Text>
            <View style={styles.brandLine} />
          </View>
          <View style={styles.headerContact}>
            <Text>Ref: #{bookingRef}</Text>
            <Text>Inclusions · Exclusions · Pricing · Contacts</Text>
          </View>
        </View>

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
          <Text style={styles.footerBrand}>
            © {new Date().getFullYear()} {companyInfo.name} · All Rights Reserved
          </Text>
          <Text style={styles.footerPage}>
            Page {itinerary.length > 3 ? "4" : "3"}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <View style={styles.summaryItemBullet} />
      <View style={styles.summaryItemTextWrap}>
        <Text style={styles.summaryItemLabel}>{label}</Text>
        <Text style={styles.summaryItemValue}>{value}</Text>
      </View>
    </View>
  );
}

function DayCard({ day }: { day: ItineraryDay }) {
  return (
    <View style={styles.dayCard}>
      <View style={styles.dayHeader}>
        <View style={styles.dayBadge}>
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
  );
}
