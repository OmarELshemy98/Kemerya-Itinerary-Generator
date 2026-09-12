"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, FileText, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

const DEFAULT_TERMS = [
  "Booking Confirmation: A booking is locked in only when Kemerya Tours confirms availability in writing, the required deposit is paid, and the official Booking Confirmation is issued. The lead traveler accepts these terms for every person included in the reservation.",
  "Deposits & Balance: A non-refundable deposit equal to 35% of the total trip cost is required upon booking confirmation. The remaining 65% balance must be paid upon arrival.",
  "Pricing & Fees: Quotes are issued in USD or EUR. Bank conversion rates and card processing fees are the traveler's responsibility. If government agencies increase monument ticket fees, taxes, port fees, or fuel surcharges before the trip, the total will be updated to cover those mandatory charges.",
  "Services & Suppliers: Certain travel components are provided by independent third-party suppliers (hotels, airlines, cruise operators, carriers, and site authorities). Services included are strictly those detailed in the confirmed quotation and itinerary.",
  "Cancellations & Changes: Most bookings can be changed or canceled depending on the airline, hotel, or service provider's policy. Deposits are non-refundable; cancellation fees follow the confirmed booking terms.",
  "Liability: Kemerya Tours' maximum financial liability for any dispute, injury, damage, or expense connected to the trip never exceeds the total amount paid for the specific booking. Indirect or consequential damages are excluded.",
  "In-Trip Complaints: Report any issue to your guide or local representative immediately so it can be fixed on the spot; otherwise send a detailed email complaint within 15 days of finishing the trip.",
  "Emergency & Governing Law: A 24/7 emergency line is printed on the confirmation voucher. Egyptian law governs these booking terms.",
];

const DEFAULT_PRIVACY = [
  "Who We Are: Kemerya Tours is an Egyptian travel company providing tours, accommodation, transfers, guiding services and Nile cruises.",
  "Information We Collect: Name, nationality, email, phone / WhatsApp, country of residence, travel dates, destinations, accommodation preferences, and passport details only when required for bookings or permits.",
  "Children's Privacy: We never collect children's data directly — any required details must be provided by a parent or legal guardian.",
  "How We Use Your Data: Strictly to prepare itineraries and quotations, manage bookings, process secure payments, communicate before / during / after your trip, and comply with Egyptian legal requirements.",
  "Sharing: We never sell your data. Details are shared only with trusted partners (hotels, cruises, airlines, guides) to fulfil your booking.",
  "Cookies & Marketing: Essential cookies keep the website running and help us understand visits. Marketing messages are sent only with your consent — you can opt out anytime.",
  "Data Retention & Your Rights: Data is kept only as long as needed for your trip, accounting or legal duties, then securely deleted. You may request access, correction or deletion via info@kemeryatours.com (subject: Privacy Request — Kemerya Tours).",
];

function TermsSettingsPage() {
  const [terms, setTerms] = React.useState<string[]>(DEFAULT_TERMS);
  const [privacy, setPrivacy] = React.useState<string[]>(DEFAULT_PRIVACY);
  const [saved, setSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const updateTerm = (index: number, value: string) => {
    setTerms((prev) => prev.map((t, i) => (i === index ? value : t)));
    setSaved(false);
  };

  const addTerm = () => {
    setTerms((prev) => [...prev, ""]);
    setSaved(false);
  };

  const removeTerm = (index: number) => {
    setTerms((prev) => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const saveTerms = async () => {
    setSaving(true);
    try {
      localStorage.setItem("kemerya_terms", JSON.stringify(terms));
      localStorage.setItem("kemerya_privacy", JSON.stringify(privacy));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save terms:", e);
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    const stored = localStorage.getItem("kemerya_terms");
    if (stored) {
      try {
        setTerms(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    const storedPrivacy = localStorage.getItem("kemerya_privacy");
    if (storedPrivacy) {
      try {
        setPrivacy(JSON.parse(storedPrivacy));
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Terms, Privacy & Policies</h1>
          <p className="mt-1 text-sm text-slate-500">
            Edit the terms, conditions and privacy items that appear on the itinerary PDF
          </p>
        </div>
        <Button variant="gold" size="sm" onClick={saveTerms} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-600" />
            Terms & Conditions Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {terms.map((term, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C5A059] text-xs font-bold text-white">
                {index + 1}
              </div>
              <div className="flex-1">
                <Textarea
                  value={term}
                  onChange={(e) => updateTerm(index, e.target.value)}
                  placeholder="Enter term or condition..."
                  rows={2}
                  className="resize-none"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTerm(index)}
                className="h-8 w-8 shrink-0 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                ×
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addTerm} className="w-full border-dashed">
            + Add Term / Condition
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-slate-600" />
            Privacy Policy Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {privacy.map((item, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {index + 1}
              </div>
              <div className="flex-1">
                <Textarea
                  value={item}
                  onChange={(e) =>
                    setPrivacy((prev) => prev.map((t, i) => (i === index ? e.target.value : t)))
                  }
                  placeholder="Enter privacy item..."
                  rows={2}
                  className="resize-none"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPrivacy((prev) => prev.filter((_, i) => i !== index))}
                className="h-8 w-8 shrink-0 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPrivacy((prev) => [...prev, ""])}
            className="w-full border-dashed"
          >
            + Add Privacy Item
          </Button>
          <p className="text-xs text-slate-500">
            Source:{" "}
            <a
              href="https://www.kemeryatours.com/page/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="text-[#8b7435] underline"
            >
              kemeryatours.com/page/privacy-policy
            </a>{" "}
            · Terms source:{" "}
            <a
              href="https://www.kemeryatours.com/page/terms-and-conditions"
              target="_blank"
              rel="noreferrer"
              className="text-[#8b7435] underline"
            >
              kemeryatours.com/page/terms-and-conditions
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TermsSettingsPageWrapper() {
  return (
    <DashboardLayout>
      <TermsSettingsPage />
    </DashboardLayout>
  );
}