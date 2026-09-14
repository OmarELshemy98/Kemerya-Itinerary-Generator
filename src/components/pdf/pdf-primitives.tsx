"use client";

import React from "react";
import { View, Text, Svg, Path, G, Circle, Ellipse, StyleSheet } from "@react-pdf/renderer";

export const C = {
  deepBrown: "#3D2B17",
  warmBrown: "#5A4226",
  agedBrown: "#7A6448",
  antiqueGold: "#B8963A",
  royalGold: "#C9A962",
  paleGold: "#E8D7B1",
  lapis: "#1E3A8A",
  deepLapis: "#172554",
  parchment: "#F5EBD3",
  scarab: "#1F6B45",
  rust: "#8B3A2E",
} as const;

export const CARD_BG = "rgba(253, 251, 247, 0.5)";
export const CARD_BORDER = "rgba(184, 150, 58, 0.55)";

export const hasText = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

export const ScarabIcon = ({ s = 10, c = C.scarab }: { s?: number; c?: string }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Ellipse cx={12} cy={13} rx={8} ry={9.5} fill={c} />
    <Path d="M4 13C4 6.5 7.5 3 12 3s8 3.5 8 10-4 13-8 13-8-3.5-8-10z" fill="none" stroke={C.royalGold} strokeWidth={1} />
  </Svg>
);

export const EyeIcon = ({ s = 10 }: { s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Path d="M2 11C6 4 11 2 14 2s8 2 12 9c-4 7-9 9-12 9S6 18 2 11z" fill={C.lapis} opacity={0.9} />
    <Circle cx={12} cy={12} r={2.5} fill={C.paleGold} />
    <Circle cx={12} cy={12} r={1} fill="#0F172A" />
  </Svg>
);

export const PyramidIcon = ({ s = 10, c = C.royalGold }: { s?: number; c?: string }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Path d="M12 1 L23 22 L1 22z" fill={c} />
    <Path d="M12 1 V22" stroke="#FDFBF7" strokeWidth={0.5} fill="none" opacity={0.7} />
  </Svg>
);

export const LotusIcon = ({ s = 10, c = "#C43E6B" }: { s?: number; c?: string }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Path d="M12 2C9 5 7 10 7 14s2 5 5 5 5-2 5-5-2-9-5-12z" fill={c} opacity={0.85} />
    <Ellipse cx={12} cy={18} rx={4} ry={1.5} fill={C.scarab} opacity={0.9} />
  </Svg>
);

export const SunIcon = ({ s = 10 }: { s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={7} fill={C.royalGold} />
    <Circle cx={12} cy={12} r={3} fill="#F39516" opacity={0.9} />
    <Circle cx={12} cy={12} r={1.5} fill="#FDE68A" />
  </Svg>
);

export const AnkhIcon = ({ s = 10, c = C.royalGold }: { s?: number; c?: string }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Path d="M12 2C6 2 2 6 2 12s4 10 10 10 10-4 10-10S18 2 12 2z" fill={c} opacity={0.8} />
    <Path d="M12 22V32M4 32H20" stroke={c} strokeWidth={1.5} strokeLinecap="round" />
  </Svg>
);

export const CompassIcon = ({ s = 10, c = C.lapis }: { s?: number; c?: string }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <Path d="M12 2l3.5 6.5L22 12l-6.5 3.5L12 22l-3.5-6.5L2 12l6.5-3.5z" fill={c} opacity={0.8} />
    <Circle cx={12} cy={12} r={2.5} fill={C.paleGold} />
  </Svg>
);

export const CartoucheIcon = ({ s = 10 }: { s?: number }) => (
  <Svg width={s} height={s} viewBox="0 0 24 24">
    <G fill="none" stroke={C.royalGold} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M7 3h10v16h-8l-2 2z" />
      <Path d="M10 6h4M10 9h4M10 12h4" />
    </G>
  </Svg>
);

export const DigitalSignature = ({ w = 150, h = 45 }: { w?: number; h?: number }) => (
  <Svg width={w} height={h} viewBox="0 0 200 60">
    <G fill="none" stroke={C.deepLapis} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M10 40C20 15 28 12 32 22s-2 16 0 24c2 8 10 6 12-2s-2-12 4-14 8 4 12 10" />
      <Path d="M60 35c4-8 10-10 14-4s4 12 8 10 6-2 10 0" />
      <Path d="M100 25c4-6 10-8 12-2s2 10 8 8" />
    </G>
  </Svg>
);

export const Divider = ({ style }: { style?: Record<string, unknown> }) => (
  <View style={[{ height: 1, backgroundColor: CARD_BORDER, marginVertical: 6, opacity: 0.5 }, style]} />
);

export const BulletItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
    <View style={{ width: 14, height: 14, justifyContent: "center", alignItems: "center", marginTop: 1 }}>{icon}</View>
    <Text style={{ fontSize: 8.5, color: C.warmBrown, lineHeight: 1.5, flex: 1 }}>{text}</Text>
  </View>
);

export const MetaRow = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
    {icon && <View style={{ flexShrink: 0 }}>{icon}</View>}
    <Text style={{ fontSize: 7, color: C.agedBrown, textTransform: "uppercase", letterSpacing: 0.3 }}>{label} </Text>
    <Text style={{ fontSize: 8.5, color: C.deepBrown }}>{value}</Text>
  </View>
);