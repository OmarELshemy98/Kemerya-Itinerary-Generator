"use client";
import React from "react";
import { View, Text, Image, Link } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { S2 } from "../pdf-styles-2";
import { PyramidIcon } from "../pdf-primitives";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import type { CompanyInfo } from "@/types";

interface Ctx {
  S: typeof S;
  label: (k: string, fb: string) => string;
  headingStyle: Record<string, string>;
  cinzelStyle: Record<string, string>;
}

interface Props {
  ctx: Ctx;
  companyInfo?: CompanyInfo;
  sectionNumber: string;
}

export function CompanyDetails({ ctx, companyInfo, sectionNumber }: Props) {
  const { S: s, label, cinzelStyle } = ctx;
  const c = companyInfo || KEMERYA_COMPANY_INFO;

  return (
    <View style={s.section}>
      <View style={s.sectionHeader} wrap={false}>
        <View style={s.sectionNum}><Text style={s.sectionNumText}>{sectionNumber}</Text></View>
        <PyramidIcon s={10} />
        <Text style={s.sectionTitle}>{label("section.company", "Company Details")}</Text>
      </View>

      <View style={S2.companyCard}>
        {c.logo && <Image src={c.logo} style={S2.companyLogo} />}
        <Text style={[S2.companyName, cinzelStyle]}>{c.name}</Text>
        {c.tagline && <Text style={S2.companyTagline}>{c.tagline}</Text>}

        <View style={S2.companyRow}>
          <View style={S2.companyRowText}>
            <Text style={S2.companyRowLabel}>{label("general.address", "Address")}:</Text>
            <Text>{c.address}</Text>
          </View>
          <View style={S2.companyRowText}>
            <Text style={S2.companyRowLabel}>{label("general.phone", "Phone")}:</Text>
            <Text>{c.phone}</Text>
          </View>
        </View>

        <View style={S2.companyRow}>
          <View style={S2.companyRowText}>
            <Text style={S2.companyRowLabel}>{label("general.email", "Email")}:</Text>
            <Link href={`mailto:${c.email}`} style={{ fontSize: 7.5, color: "#1E3A8A" }}>{c.email}</Link>
          </View>
          <View style={S2.companyRowText}>
            <Text style={S2.companyRowLabel}>{label("general.website", "Website")}:</Text>
            <Link href={`https://${c.website}`} style={{ fontSize: 7.5, color: "#1E3A8A" }}>{c.website}</Link>
          </View>
        </View>

        {c.socialMedia && (
          <View style={S2.companySocialRow}>
            {c.socialMedia.facebook && <Link href={c.socialMedia.facebook} style={S2.companySocialLink}>Facebook</Link>}
            {c.socialMedia.instagram && <Link href={c.socialMedia.instagram} style={S2.companySocialLink}>Instagram</Link>}
            {c.socialMedia.youtube && <Link href={c.socialMedia.youtube} style={S2.companySocialLink}>YouTube</Link>}
          </View>
        )}

        <View style={S2.companyFooter}>
          <Text style={S2.companyFooterText}>{label("footer.tagline", "Curated Egyptian Journeys")}</Text>
        </View>
      </View>
    </View>
  );
}
