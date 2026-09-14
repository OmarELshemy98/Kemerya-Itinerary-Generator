"use client";

import React from "react";
import { View, Text, Svg, Path, G, Circle, Ellipse, Rect, Line, StyleSheet, type Styles } from "@react-pdf/renderer";

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

export const Divider = ({ style }: { style?: Styles }) => (
  <View style={[{ height: 1, backgroundColor: CARD_BORDER, marginVertical: 6, opacity: 0.5 }, ...(style ? [style] : [])]} />
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

/**
 * Large decorative Pharaonic scene, drawn entirely as inline vector art
 * (no external raster assets — cannot fail to load).
 * Composition: royal frame, winged sun disc, Giza pyramids, ankh pillars
 * and a lotus-petal frieze. Place at the bottom of a page to fill the
 * remaining space with an elegant, royal finish.
 */
export const PharaonicScene = ({ w = 500, h = 300 }: { w?: number; h?: number }) => (
  <Svg width={w} height={h} viewBox="0 0 500 300">
    {/* Double royal frame */}
    <Rect x={2} y={2} width={496} height={296} fill="none" stroke={C.royalGold} strokeWidth={1.4} rx={4} />
    <Rect x={9} y={9} width={482} height={282} fill="none" stroke={C.antiqueGold} strokeWidth={0.6} opacity={0.65} rx={3} />

    {/* Winged sun disc */}
    <G>
      <Path d="M250 44 C230 36 196 34 158 44 C120 54 92 56 70 52 C96 64 128 66 158 62 C196 57 230 56 250 54 Z" fill={C.antiqueGold} opacity={0.9} />
      <Path d="M250 44 C270 36 304 34 342 44 C380 54 408 56 430 52 C404 64 372 66 342 62 C304 57 270 56 250 54 Z" fill={C.antiqueGold} opacity={0.9} />
      <Path d="M250 50 C238 46 216 46 192 52 C170 57 152 58 138 56 C158 64 184 64 204 60 C224 57 240 56 250 56 Z" fill={C.royalGold} opacity={0.75} />
      <Path d="M250 50 C262 46 284 46 308 52 C330 57 348 58 362 56 C342 64 316 64 296 60 C276 57 260 56 250 56 Z" fill={C.royalGold} opacity={0.75} />
      <Circle cx={250} cy={52} r={15} fill={C.royalGold} />
      <Circle cx={250} cy={52} r={7} fill="#F39516" opacity={0.95} />
      <Circle cx={250} cy={52} r={3} fill="#FDE68A" />
    </G>

    {/* Sun rays above the pyramids */}
    <G stroke={C.royalGold} strokeWidth={1} strokeLinecap="round" opacity={0.8}>
      <Line x1={250} y1={88} x2={250} y2={104} />
      <Line x1={214} y1={92} x2={222} y2={106} />
      <Line x1={286} y1={92} x2={278} y2={106} />
      <Line x1={188} y1={104} x2={200} y2={114} />
      <Line x1={312} y1={104} x2={300} y2={114} />
    </G>

    {/* Giza pyramids — Khufu, Khafre (capped), Menkaure */}
    <G>
      <Path d="M96 218 L172 128 L248 218 Z" fill={C.royalGold} opacity={0.18} />
      <Path d="M96 218 L172 128 L248 218 Z" fill="none" stroke={C.antiqueGold} strokeWidth={1.6} />
      <Path d="M172 128 L172 218" stroke="#FDFBF7" strokeWidth={0.8} opacity={0.8} />
      <Path d="M216 218 L290 136 L364 218 Z" fill="none" stroke={C.antiqueGold} strokeWidth={1.8} />
      <Path d="M262 158 L290 136 L318 158 L304 158 L290 146 L276 158 Z" fill={C.deepLapis} opacity={0.85} />
      <Path d="M330 218 L386 152 L442 218 Z" fill={C.royalGold} opacity={0.18} />
      <Path d="M330 218 L386 152 L442 218 Z" fill="none" stroke={C.antiqueGold} strokeWidth={1.4} />
    </G>

    {/* Ground line */}
    <Line x1={60} y1={218} x2={440} y2={218} stroke={C.deepBrown} strokeWidth={1.2} opacity={0.7} />

    {/* Ankh pillars flanking the scene */}
    <G stroke={C.lapis} strokeWidth={1.4} fill="none" strokeLinecap="round">
      <Circle cx={60} cy={62} r={9} />
      <Line x1={60} y1={71} x2={60} y2={110} />
      <Line x1={48} y1={82} x2={72} y2={82} />
      <Circle cx={440} cy={62} r={9} />
      <Line x1={440} y1={71} x2={440} y2={110} />
      <Line x1={428} y1={82} x2={452} y2={82} />
    </G>

    {/* Lotus-petal frieze along the bottom */}
    <G>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <G key={i} transform={`translate(${42 + i * 38}, 258)`}>
          <Path d="M0 12 C-6 6 -6 -2 0 -10 C6 -2 6 6 0 12 Z" fill={C.royalGold} opacity={0.8} />
          <Path d="M0 -10 C4 -6 6 0 5 6" fill="none" stroke={C.antiqueGold} strokeWidth={0.6} />
          <Path d="M0 -10 C-4 -6 -6 0 -5 6" fill="none" stroke={C.antiqueGold} strokeWidth={0.6} />
          <Line x1={14} y1={0} x2={24} y2={0} stroke={C.antiqueGold} strokeWidth={1} opacity={0.7} />
        </G>
      ))}
    </G>

    {/* Corner cartouches */}
    <G stroke={C.royalGold} strokeWidth={1} fill="none">
      <Path d="M18 30 h20 M18 30 v20" />
      <Path d="M482 30 h-20 M482 30 v20" />
      <Path d="M18 270 h20 M18 270 v-20" />
      <Path d="M482 270 h-20 M482 270 v-20" />
    </G>
  </Svg>
);