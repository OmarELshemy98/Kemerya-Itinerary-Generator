"use client";
import React from "react";
import { View, Text, Link } from "@react-pdf/renderer";
import { S } from "../pdf-styles";
import { S2 } from "../pdf-styles-2";
import { AnkhIcon, DigitalSignature } from "../pdf-primitives";
import { KEMERYA_COMPANY_INFO } from "@/data/company";
import type { CompanyInfo } from "@/types";

/** The agent's portfolio site shown on the "Arranged & Signed by" line */
export const AGENT_PORTFOLIO_URL = "https://omarelshemy.vercel.app";

interface Ctx {
  S: typeof S;
  label: (k: string, fb: string) => string;
  headingStyle: Record<string, string>;
  cinzelStyle: Record<string, string>;
}

interface Props {
  ctx: Ctx;
  companyInfo?: CompanyInfo;
  /** Name of the agent (logged-in user) who created this itinerary */
  agentName?: string;
  /** When the itinerary was created */
  createdAt?: string;
  sectionNumber: string;
}

function getAgentName(c?: CompanyInfo): string {
  return c?.operationsManager?.name || KEMERYA_COMPANY_INFO.operationsManager.name;
}

export function AgentSignature({ ctx, companyInfo, agentName, createdAt, sectionNumber }: Props) {
  const { S: s, label, cinzelStyle } = ctx;
  const creatorName = agentName?.trim() || getAgentName(companyInfo);
  const agentPhone = companyInfo?.operationsManager?.phone || KEMERYA_COMPANY_INFO.operationsManager.phone;
  const agentEmail = companyInfo?.operationsManager?.email || KEMERYA_COMPANY_INFO.operationsManager.email;

  const createdAtText = createdAt
    ? new Date(createdAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : undefined;

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
            <Text style={[S2.agentName, cinzelStyle]}>{creatorName}</Text>
            {createdAtText && (
              <Text style={S2.agentRole}>
                {label("agent.createdAt", "Created")}: {createdAtText}
              </Text>
            )}
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
          <Link href={AGENT_PORTFOLIO_URL} style={{ textDecoration: "none" }}>
            <Text style={[{ fontSize: 10, color: "#1E3A8A", marginBottom: 4 }, cinzelStyle]}>
              Omar Elshemy
            </Text>
          </Link>
          <DigitalSignature w={140} h={40} />
        </View>
      </View>
    </View>
  );
}
