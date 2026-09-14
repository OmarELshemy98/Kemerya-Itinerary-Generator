"use client";
import { StyleSheet } from "@react-pdf/renderer";
import { C, CARD_BG } from "./pdf-primitives";

export const S2 = StyleSheet.create({
  agentCard: { backgroundColor: CARD_BG, borderWidth: 1.2, borderColor: C.royalGold, borderRadius: 4, padding: 10, alignItems: "center" },
  agentRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  agentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.deepLapis, justifyContent: "center", alignItems: "center" },
  agentName: { fontSize: 11, color: C.deepBrown, fontWeight: 400 },
  agentRole: { fontSize: 7, color: C.agedBrown, textTransform: "uppercase", letterSpacing: 0.3, fontWeight: 400 },
  agentContactRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  agentContact: { fontSize: 7.5, color: C.warmBrown },
  agentContactLabel: { fontSize: 6, color: C.agedBrown, textTransform: "uppercase", letterSpacing: 0.3, fontWeight: 400 },
  agentSigBox: { backgroundColor: "rgba(245,235,211,0.5)", borderWidth: 1, borderColor: C.royalGold, borderRadius: 3, padding: 8, width: "100%", alignItems: "center" },
  agentSigLabel: { fontSize: 6.5, color: C.agedBrown, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4, fontWeight: 400 },
  companyCard: { backgroundColor: "rgba(30,58,138,0.05)", borderWidth: 1, borderColor: C.lapis, borderRadius: 4, padding: 10, marginTop: 8 },
  companyLogo: { width: 60, height: 60, marginBottom: 8, borderRadius: 3 },
  companyName: { fontSize: 14, color: C.deepBrown, fontWeight: 400, marginBottom: 1 },
  companyTagline: { fontSize: 8, color: C.agedBrown, fontStyle: "italic", marginBottom: 8 },
  companyRow: { flexDirection: "row", gap: 10, marginBottom: 3 },
  companyRowText: { fontSize: 7.5, color: C.warmBrown, flex: 1 },
  companyRowLabel: { fontSize: 6, color: C.agedBrown, textTransform: "uppercase", letterSpacing: 0.3, fontWeight: 400, marginRight: 3 },
  companySocialRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 8 },
  companySocialLink: { fontSize: 7, color: C.lapis, textDecoration: "underline" },
  companyFooter: { alignItems: "center", marginTop: 8, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: "rgba(184,150,58,0.55)" },
  companyFooterText: { fontSize: 6, color: C.agedBrown, textAlign: "center", letterSpacing: 0.3, textTransform: "uppercase" },
});