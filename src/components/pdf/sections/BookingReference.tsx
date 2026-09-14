"use client";
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { AnkhIcon } from "../pdf-primitives";

interface Props {
  S: typeof S;
  label: (k: string, fb: string) => string;
  bookingRef: string;
  cinzelStyle: Record<string, string>;
}

export function BookingReference({ S: styles, label, bookingRef, cinzelStyle }: Props) {
  return (
    <View style={styles.refBadge} wrap={false}>
      <AnkhIcon s={10} c="#E8D7B1" />
      <Text style={[styles.refText, cinzelStyle]}>
        {label("booking.reference", "Booking Reference")} {bookingRef}
      </Text>
    </View>
  );
}
