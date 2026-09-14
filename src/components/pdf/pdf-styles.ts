"use client";
import { StyleSheet } from "@react-pdf/renderer";
import { C, CARD_BG, CARD_BORDER } from "./pdf-primitives";

export const S = StyleSheet.create({
  // IMPORTANT: the footer band is a DIRECT child of <Page> and absolutely
  // positioned 20pt above the page edge (its own containing block), so the
  // 140pt paddingBottom below is a hard safe zone that body text can never
  // cross. Never wrap the page sections in a flex container — a wrapper both
  // displaces the absolute footer by `paddingBottom` (pushing it *into* the
  // content area → overlap) and stops react-pdf from paginating the sections.
  page: { width: "100%", height: "100%", paddingTop: 160, paddingBottom: 140, paddingHorizontal: 32, backgroundColor: C.parchment },
  section: { marginBottom: 9 },
  headerBox: { flexDirection: "column", alignItems: "center", marginBottom: 8 },
  headerLogo: { width: 100, height: 100, marginBottom: 6 },
  headerText: { alignItems: "center" },
  brandTitle: { fontSize: 15, color: C.deepBrown, letterSpacing: 2, textTransform: "uppercase", fontWeight: 400, textAlign: "center" },
  brandTagline: { fontSize: 8, color: C.agedBrown, letterSpacing: 0.6, marginTop: 3, textAlign: "center" },
  refBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.deepLapis, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 3, alignSelf: "flex-start", marginBottom: 8 },
  refText: { fontSize: 8.5, color: C.paleGold, letterSpacing: 1, fontWeight: 400 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  sectionNum: { backgroundColor: C.deepBrown, borderRadius: 2, paddingVertical: 2, paddingHorizontal: 5, marginRight: 6 },
  sectionNumText: { fontSize: 7, color: C.paleGold, fontWeight: 400 },
  sectionIcon: { marginRight: 6 },
  sectionTitle: { flex: 1, fontSize: 9, color: C.deepBrown, letterSpacing: 1, textTransform: "uppercase", fontWeight: 400 },
  sectionLine: { marginTop: 4, height: 1, backgroundColor: C.royalGold, opacity: 0.5, width: 50 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  summaryCard: { width: "48%", flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER, padding: 7 },
  summaryIcon: { width: 20, height: 20, justifyContent: "center", alignItems: "center" },
  summaryLabel: { fontSize: 6, color: C.agedBrown, textTransform: "uppercase", letterSpacing: 0.3, fontWeight: 400 },
  summaryValue: { fontSize: 8, color: C.deepBrown, marginTop: 1 },
  offerBanner: { flexDirection: "row", borderWidth: 1.2, borderColor: C.antiqueGold, borderRadius: 4, overflow: "hidden", backgroundColor: "rgba(232,215,177,0.2)" },
  offerBadge: { backgroundColor: C.rust, paddingVertical: 4, paddingHorizontal: 6, alignItems: "center", justifyContent: "center", minWidth: 40 },
  offerBadgeText: { color: C.paleGold, fontSize: 9, fontWeight: 400 },
  offerBody: { flex: 1, padding: 8 },
  offerTitle: { fontSize: 11, color: C.deepBrown, marginBottom: 2 },
  offerNote: { fontSize: 7.5, color: C.agedBrown, fontStyle: "italic", marginBottom: 4 },
  offerPriceRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  offerOld: { fontSize: 8.5, color: C.rust, textDecoration: "line-through" },
  offerNew: { fontSize: 12, color: C.scarab, fontWeight: 400 },
  offerSave: { fontSize: 7, color: C.scarab, marginLeft: "auto" },
  tourTitle: { fontSize: 14, color: C.deepBrown, marginTop: 3, marginBottom: 4 },
  tourDesc: { fontSize: 8.5, color: C.warmBrown, lineHeight: 1.5, marginBottom: 6 },
  dayCard: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 3, padding: 7, marginBottom: 6 },
  dayHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5, gap: 6 },
  dayBadge: { backgroundColor: C.deepBrown, borderRadius: 2, paddingVertical: 1, paddingHorizontal: 5 },
  dayBadgeText: { fontSize: 7, color: C.paleGold, fontWeight: 400 },
  dayTitle: { fontSize: 10, color: C.deepBrown, flex: 1, fontWeight: 400 },
  dayDesc: { fontSize: 8, color: C.warmBrown, lineHeight: 1.5, marginBottom: 5 },
  panel: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 3, padding: 7, marginBottom: 5 },
  panelTitle: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 5 },
  panelTitleText: { fontSize: 9, color: C.deepBrown, fontWeight: 400 },
  priceRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: CARD_BORDER },
  priceLeft: { flex: 1 },
  priceLeftText: { fontSize: 8.5, color: C.warmBrown, lineHeight: 1.5 },
  priceSub: { fontSize: 7, color: C.agedBrown, marginTop: 1 },
  priceRight: { fontSize: 9, color: C.lapis, fontWeight: 400 },
  // ── PRICING AT A GLANCE — financial breakdown table ───────────────────────
  // Light parchment card with clean horizontal separators, alternating row
  // tint, deep-brown labels and bold right-aligned currency figures.
  pricingTable: { borderWidth: 1, borderColor: CARD_BORDER, borderRadius: 3, overflow: "hidden", backgroundColor: "rgba(245,235,211,0.35)" },
  pricingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6, paddingHorizontal: 9, borderBottomWidth: 0.8, borderBottomColor: "rgba(184,150,58,0.45)" },
  pricingRowAlt: { backgroundColor: CARD_BG },
  pricingRowTotal: { backgroundColor: "rgba(232,215,177,0.55)" },
  pricingRowLast: { borderBottomWidth: 0 },
  pricingLabel: { flex: 1, fontSize: 7.5, color: C.warmBrown, letterSpacing: 0.6, textTransform: "uppercase", fontWeight: 400, paddingRight: 8 },
  pricingValueBlock: { alignItems: "flex-end", justifyContent: "center" },
  pricingValueBig: { fontSize: 15, color: C.deepBrown, fontWeight: 700, textAlign: "right" },
  pricingValue: { fontSize: 11, color: C.deepBrown, fontWeight: 700, textAlign: "right" },
  pricingValueSub: { fontSize: 6.5, color: C.agedBrown, textAlign: "right", marginTop: 1.5 },
  pricingOldValue: { fontSize: 8.5, color: C.rust, textDecoration: "line-through", marginRight: 6 },
  pricingOfferRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "flex-end" },
  pricingOfferValue: { fontSize: 15, color: C.scarab, fontWeight: 700, textAlign: "right" },
  pricingSave: { fontSize: 6.5, color: C.scarab, textAlign: "right", marginTop: 1.5 },
  pricingOfferNotes: { marginBottom: 5 },
  pricingOfferTitle: { fontSize: 8.5, color: C.deepBrown, fontWeight: 700, marginBottom: 1 },
  pricingOfferNote: { fontSize: 7.5, color: C.agedBrown, fontStyle: "italic", lineHeight: 1.4 },
  notesText: { fontSize: 8.5, color: C.warmBrown, lineHeight: 1.5, marginTop: 5 },
  twoCol: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  col: { width: "48%" },
  colFull: { width: "100%" },
  termsNum: { backgroundColor: C.deepLapis, borderRadius: 2, width: 14, height: 14, justifyContent: "center", alignItems: "center", marginRight: 6 },
  termsNumText: { fontSize: 6, color: C.paleGold, fontWeight: 400 },
  termsText: { fontSize: 7.5, color: C.warmBrown, lineHeight: 1.4 },
  termsLink: { fontSize: 7, color: C.lapis, marginTop: 4, textDecoration: "underline" },
  // Universal footer band — a DIRECT child of <Page> and absolute, so it is
  // repeated at the bottom of every page and sits 20pt above the page edge
  // (inside the bottom margin reserved by `page.paddingBottom`).
  footerBand: { position: "absolute", bottom: 20, left: 30, right: 30, borderTopWidth: 0.7, borderTopColor: C.royalGold, paddingTop: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center", opacity: 0.95 },
  footerBrand: { fontSize: 7.5, color: C.deepBrown, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 400 },
  footerInfo: { fontSize: 6.5, color: C.agedBrown, textAlign: "right", lineHeight: 1.4 },
});