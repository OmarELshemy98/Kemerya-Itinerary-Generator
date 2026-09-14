"use client";
import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { S2 } from "../pdf-styles-2";
import { AnkhIcon, DigitalSignature } from "../pdf-primitives";
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

function getAgentName(c?: CompanyInfo): string {
  return c?.operationsManager?.name || KEMERYA_COMPANY_INFO.operationsManager.name;
}

export function AgentSignature({ ctx, companyInfo, sectionNumber }: Props) {
  const { S: s, label, cinzelStyle } = ctx;
  const agentName = getAgentName(companyInfo);
  const agentPhone = companyInfo?.operationsManager?.phone || KEMERYA_COMPANY_INFO.operationsManager.phone;
  const agentEmail = companyInfo?.operationsManager?.email || KEMERYA_COMPANY_INFO.operationsManager.email;

  return (
    <View style={s.section}>
      <View style={s.sectionHeader} wrap={false}>
        <View style={s.sectionNum}><Text style={s.sectionNumText}>{sectionNumber}</Text></View>
        <AnkhIcon s={10} />
        <Text style={s.sectionTitle}>{label("section.agent", "Your Agent")}</Text>
      </View>

      <View style={S2.agentCard}>
        <View style={S2.agentRow}>
          <View style={S2.agentAvatar}><AnkhIcon s={20} c="#E8D7B1" /></View>
          <View>
            <Text style={[S2.agentName, cinzelStyle]}>{agentName}</Text>
            <Text style={S2.agentRole}>{label("agent.role", "Operations Manager")}</Text>
          </View>
        </View>

        <View style={S2.agentContactRow}>
          <View>
            <Text style={S2.agentContactLabel}>{label("general.phone", "Phone")}</Text>
            <Text style={S2.agentContact}>{agentPhone}</Text>
          </View>
          <View>
            <Text style={S2.agentContactLabel}>{label("general.email", "Email")}</Text>
            <Text style={S2.agentContact}>{agentEmail}</Text>
          </View>
          <View>
            <Text style={S2.agentContactLabel}>{label("general.whatsapp", "WhatsApp")}</Text>
            <Text style={S2.agentContact}>{agentPhone}</Text>
          </View>
        </View>

        <View style={S2.agentSigBox}>
          <Text style={S2.agentSigLabel}>{label("agent.signedBy", "Arranged & Signed by")}</Text>
          <DigitalSignature w={140} h={40} />
        </View>
      </View>
    </View>
  );
}
