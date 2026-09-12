"use client";

import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Users,
  Calendar,
  CreditCard,
  StickyNote,
  Wand2,
  FileText,
  Plus,
  Minus,
  Trash2,
  User,
  Mail,
  Phone,
  Info,
  MessageCircle,
  Eye,
  Map,
  GripVertical,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  Tag,
  BadgePercent,
  ShieldCheck,
} from "lucide-react";
import type { Tour, BookingConfig, Currency, ItineraryDay, RouteStop, DayRoute } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn, calculateNights, formatCurrency } from "@/lib/utils";
import { EGYPT_LOCATIONS } from "@/utils/mapGenerator";

/**
 * Popular Egyptian tourist destinations for quick selection
 */
const POPULAR_DESTINATIONS = [
  "Pyramids of Giza",
  "Egyptian Museum",
  "Khan El-Khalili",
  "Citadel of Saladin",
  "Old Cairo",
  "Coptic Cairo",
  "Islamic Cairo",
  "Saqqara",
  "Memphis",
  "Luxor",
  "Karnak Temple",
  "Luxor Temple",
  "Valley of the Kings",
  "Valley of the Queens",
  "Hatshepsut Temple",
  "Colossi of Memnon",
  "Aswan",
  "Abu Simbel",
  "Philae Temple",
  "High Dam",
  "Unfinished Obelisk",
  "Alexandria",
  "Bibliotheca Alexandrina",
  "Qaitbay Citadel",
  "Pompey Pillar",
  "Hurghada",
  "Sharm El Sheikh",
  "Dahab",
  "Mount Sinai",
  "St Catherine",
  "Blue Hole",
  "Siwa Oasis",
  "Bahariya",
  "White Desert",
  "Fayoum",
];

function RouteStopsEditor({
  stops,
  onChange,
}: {
  stops: RouteStop[] | undefined;
  onChange: (stops: RouteStop[]) => void;
}) {
  const currentStops = stops || [];

  const addStop = () => {
    const newStop: RouteStop = {
      id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: "",
      order: currentStops.length,
    };
    onChange([...currentStops, newStop]);
  };

  const removeStop = (id: string) => {
    onChange(currentStops.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i })));
  };

  const updateStop = (id: string, name: string) => {
    onChange(currentStops.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newStops = [...currentStops];
    [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
    onChange(newStops.map((s, i) => ({ ...s, order: i })));
  };

  const moveDown = (index: number) => {
    if (index === currentStops.length - 1) return;
    const newStops = [...currentStops];
    [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];
    onChange(newStops.map((s, i) => ({ ...s, order: i })));
  };

  const addPopularDestination = (name: string) => {
    if (currentStops.some((s) => s.name === name)) return;
    const newStop: RouteStop = {
      id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      order: currentStops.length,
    };
    onChange([...currentStops, newStop]);
  };

  return (
    <div className="space-y-4">
      {/* Current stops list */}
      {currentStops.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
          <Map className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">
            No destinations added yet. Add places the client will visit during this trip.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {currentStops.map((stop, index) => (
            <div
              key={stop.id}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2"
            >
              {/* Order number */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C5A059] text-xs font-bold text-white">
                {index + 1}
              </div>

              {/* Stop name input */}
              <Input
                value={stop.name}
                onChange={(e) => updateStop(stop.id, e.target.value)}
                placeholder="Enter destination name..."
                className="flex-1"
              />

              {/* Quick select dropdown */}
              <Select
                onValueChange={(val) => {
                  updateStop(stop.id, val);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Quick add" />
                </SelectTrigger>
                <SelectContent>
                  {POPULAR_DESTINATIONS.filter(
                    (d) => !currentStops.some((s) => s.name === d)
                  ).map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Move buttons */}
              <div className="flex flex-col gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="h-5 w-7 p-0"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => moveDown(index)}
                  disabled={index === currentStops.length - 1}
                  className="h-5 w-7 p-0"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              {/* Remove button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeStop(stop.id)}
                className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new stop button */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStop}
          className="border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Destination
        </Button>
      </div>

      {/* Quick add popular destinations */}
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <Label className="text-xs font-medium text-slate-600">Quick Add Popular Destinations</Label>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {POPULAR_DESTINATIONS.filter(
            (d) => !currentStops.some((s) => s.name === d)
          )
            .slice(0, 15)
            .map((dest) => (
              <Button
                key={dest}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addPopularDestination(dest)}
                className="h-6 px-2 text-[10px]"
              >
                + {dest}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Terms Editor - Editable terms & conditions per itinerary
 */
function PrivacyEditor({
  items,
  onChange,
}: {
  items: string[] | undefined;
  onChange: (items: string[]) => void;
}) {
  const normalized = items && items.length > 0 ? items : [""];
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
        Privacy Policy items for this itinerary
      </Label>
      {normalized.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <Textarea
            value={item}
            onChange={(e) => {
              const next = [...normalized];
              next[index] = e.target.value;
              onChange(next);
            }}
            placeholder="Privacy item…"
            rows={2}
            className="min-h-[52px] flex-1 resize-none text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(normalized.filter((_, i) => i !== index))}
            className="h-8 w-8 shrink-0 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...normalized, ""])}
        className="w-full border-dashed text-xs"
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add privacy item
      </Button>
    </div>
  );
}

function TermsEditor({
  terms,
  onChange,
}: {
  terms: string[];
  onChange: (terms: string[]) => void;
}) {
  const addTerm = () => {
    onChange([...terms, ""]);
  };

  const removeTerm = (index: number) => {
    onChange(terms.filter((_, i) => i !== index));
  };

  const updateTerm = (index: number, value: string) => {
    onChange(terms.map((t, i) => (i === index ? value : t)));
  };

  const resetToDefault = () => {
    const defaultTerms = [
      "Booking Confirmation: A booking is locked in only when Kemerya Tours confirms availability in writing, the required deposit is paid, and the official Booking Confirmation is issued.",
      "Deposits & Balance: A non-refundable deposit equal to 35% of the total trip cost is required upon booking confirmation. The remaining 65% balance must be paid upon arrival.",
      "Pricing & Fees: Quotes are issued in USD or EUR. Bank conversion rates and card processing fees are the traveler's responsibility.",
      "Services & Suppliers: Certain travel components are provided by independent third-party suppliers. Services included are strictly those detailed in the confirmed quotation and itinerary.",
      "Cancellations & Changes: Most bookings can be changed or canceled depending on the airline, hotel, or service provider's policy.",
      "Liability: Kemerya Tours' maximum financial liability never exceeds the total amount paid for the specific booking.",
      "In-Trip Complaints: Report any issue to your guide or local representative immediately.",
      "Emergency & Governing Law: A 24/7 emergency line is printed on the confirmation voucher. Egyptian law governs these booking terms.",
    ];
    onChange(defaultTerms);
  };

  return (
    <div className="space-y-3">
      {terms.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center">
          <p className="text-sm text-slate-500 mb-2">No custom terms added. Default terms will be used.</p>
          <Button type="button" variant="outline" size="sm" onClick={resetToDefault}>
            Load Default Terms
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {terms.map((term, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C5A059] text-xs font-bold text-white">
                {index + 1}
              </div>
              <Textarea
                value={term}
                onChange={(e) => updateTerm(index, e.target.value)}
                placeholder="Enter term or condition..."
                rows={2}
                className="flex-1 resize-none text-sm"
              />
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
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addTerm} className="border-dashed">
          <Plus className="mr-2 h-4 w-4" />
          Add Term
        </Button>
        {terms.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={resetToDefault}>
            Reset to Default
          </Button>
        )}
      </div>
    </div>
  );
}

export function pickPricePerPerson(pricesTable: { personsLabel: string; priceUSD: number }[] | undefined, travelers: number): number {
  if (!pricesTable || pricesTable.length === 0) return 0;
  const n = Math.max(1, travelers);
  // Try to find an exact range match, else fall back to the closest tier
  for (const tier of pricesTable) {
    const label = tier.personsLabel.toLowerCase();
    // Match patterns like "2 - 3 persons", "4-6 persons", "7 - 10 persons", "1 person"
    const rangeMatch = label.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (rangeMatch) {
      const lo = parseInt(rangeMatch[1], 10);
      const hi = parseInt(rangeMatch[2], 10);
      if (n >= lo && n <= hi) return tier.priceUSD;
    }
    const singleMatch = label.match(/^(\d+)\s*(?:person|people)/);
    if (singleMatch && n === parseInt(singleMatch[1], 10)) return tier.priceUSD;
    // "10+ persons" style
    const plusMatch = label.match(/(\d+)\s*\+/);
    if (plusMatch && n >= parseInt(plusMatch[1], 10)) return tier.priceUSD;
  }
  // Fallback: nearest tier by lower bound (small groups -> first tier,
  // oversized groups -> last tier) instead of always the cheapest tier.
  let best = pricesTable[0].priceUSD;
  let bestLo = -Infinity;
  for (const tier of pricesTable) {
    const nums = tier.personsLabel.match(/\d+/g)?.map(Number) ?? [0];
    const lo = Math.min(...nums);
    if (lo <= n && lo >= bestLo) {
      bestLo = lo;
      best = tier.priceUSD;
    }
  }
  return best;
}

const bookingSchema = z
  .object({
    isCustomTour: z.boolean(),
    customTourTitle: z.string().optional(),
    customTourDescription: z.string().optional(),
    adults: z.coerce.number().int().min(1, "At least 1 adult required").max(50, "Maximum 50 adults"),
    children: z.coerce.number().int().min(0).max(50),
    infants: z.coerce.number().int().min(0).max(50),
    currency: z.enum(["EUR", "USD"]),
    totalPrice: z.coerce.number().min(0, "Price cannot be negative"),
    // Optional manual per-person price — employee can type a number, or leave
    // blank to fall back to the auto tier price. Blank/0 → omitted from PDF.
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    clientName: z.string().min(2, "Client name is required"),
    clientEmail: z.string().min(1, "Email is required").email("Invalid email"),
    clientPhone: z.string().min(5, "Phone is required"),
    clientWhatsapp: z.string().optional().or(z.literal("")),
    /** Meeting/pickup point, e.g. "Cairo Airport arrivals hall" */
    meetingPoint: z.string().min(2, "Meeting point is required"),
    notes: z.string().optional().or(z.literal("")),
    specialRequests: z.string().optional().or(z.literal("")),
    /** Editable inclusions/exclusions (pre-filled from the tour for standard mode) */
    inclusions: z.array(z.string()).optional(),
    exclusions: z.array(z.string()).optional(),
    /** Flight arrival details, e.g. "MS1001 arriving Cairo 14:30" */
    flightArrival: z.string().optional().or(z.literal("")),
    /** Tour pickup time, e.g. "08:00 AM at your hotel" */
    pickupTime: z.string().optional().or(z.literal("")),
    /** Estimated tour end time, e.g. "06:00 PM at your hotel" */
    tourEndTime: z.string().optional().or(z.literal("")),
    /** Line items for extra services/requests with their prices */
    specialRequestItems: z.array(
      z.object({
        id: z.string(),
        description: z.string().min(1, "Description required"),
        price: z.coerce.number().min(0, "Price must be 0 or positive"),
      })
    ).optional(),
    /** Editable booking reference, auto-generated as YYYYMMDD-XXX */
    bookingRef: z.string().optional().or(z.literal("")),
    /** Custom route stops - editable list of destinations for the journey roadmap */
    customRouteStops: z.array(z.object({
      id: z.string(),
      name: z.string().min(1, "Location name required"),
      order: z.number().int().min(0),
    })).optional(),
    /** Whether this itinerary is approved */
    isApproved: z.boolean().optional().default(false),
    /** Special offer price (0 = no offer). Replaces totalPrice when set. */
    offerPrice: z.number().min(0).optional().default(0),
    /** Luxury offer headline + note (editable, shown on PDF offer banner) */
    offerTitle: z.string().optional().default(""),
    offerNote: z.string().optional().default(""),
    /** Custom terms & conditions for this specific itinerary */
    customTerms: z.array(z.string()).optional(),
    /** Custom privacy-policy items for this specific itinerary (editable) */
    customPrivacy: z.array(z.string()).optional(),
    /** Per-day journey map stops (simple strings per day) */
    dayRoutes: z.array(z.object({
      day: z.coerce.number().int().min(1),
      stops: z.array(z.string()),
    })).optional(),
    /** Route stops attached to each custom itinerary day (index-aligned) */
    customDayRoutes: z.array(z.array(z.string())).optional(),
    customInclusions: z.array(z.string()).optional(),
    customExclusions: z.array(z.string()).optional(),
    customItinerary: z.array(z.object({
      day: z.coerce.number().int().min(1),
      title: z.string().min(2),
      description: z.string().min(5),
    })).optional(),
  })
  .superRefine((val, ctx) => {
    const start = new Date(val.startDate);
    const end = new Date(val.endDate);
    if (start && end && end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }
    if (val.isCustomTour && !val.customTourTitle?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customTourTitle"],
        message: "Custom tour title is required",
      });
    }
  });

export type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingConfigurationFormProps {
  selectedTour: Tour | null;
  isCustomMode: boolean;
  onCustomModeChange: (custom: boolean) => void;
  onSubmit: (config: BookingConfig, mode: "download" | "view") => void;
  initialValues?: Partial<BookingFormValues>;
}

const todayISO = () => new Date().toISOString().split("T")[0];

/**
 * Generate a booking reference in format YYYYMMDD-XXX
 * where XXX is a daily-resetting sequential counter (001, 002, ...)
 * Counter resets each day and persists in localStorage.
 */
function generateBookingRef(): string {
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
  
  const storageKey = `kemerya_ref_counter_${dateStr}`;
  const lastDateKey = `kemerya_ref_last_date`;
  
  // Get the last date we generated a reference for
  const lastDate = typeof window !== "undefined" ? localStorage.getItem(lastDateKey) : null;
  
  let counter: number;
  if (lastDate === dateStr) {
    // Same day - increment counter
    counter = parseInt(localStorage.getItem(storageKey) || "0", 10) + 1;
  } else {
    // New day - reset counter
    counter = 1;
  }
  
  // Store updated values
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey, String(counter));
    localStorage.setItem(lastDateKey, dateStr);
  }
  
  return `${dateStr}-${String(counter).padStart(3, "0")}`;
}

export function BookingConfigurationForm({
  selectedTour,
  isCustomMode,
  onCustomModeChange,
  onSubmit,
  initialValues,
}: BookingConfigurationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
      resolver: zodResolver(bookingSchema),
      defaultValues: {
        isCustomTour: isCustomMode,
        customTourTitle: "",
        customTourDescription: "",
        adults: 1,
        children: 0,
        infants: 0,
        currency: "USD",
        totalPrice:
          selectedTour?.basePriceUSD ??
          (selectedTour?.basePriceEUR != null
            ? Math.round(selectedTour.basePriceEUR / 0.92)
            : 0),
        startDate: todayISO(),
        endDate: (() => {
          const d = new Date();
          // A tour of N days overnights (N - 1) times: one-day tours are
          // start = end (same day). Default to today for single-day tours.
          d.setDate(
            d.getDate() + Math.max(0, (selectedTour?.durationDays || 0) - 1)
          );
          return d.toISOString().split("T")[0];
        })(),
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientWhatsapp: "",
        meetingPoint: "",
        notes: "",
        specialRequests: "",
        specialRequestItems: [],
        inclusions: selectedTour?.inclusions ?? [],
        exclusions: selectedTour?.exclusions ?? [],
        customInclusions: [],
        customExclusions: [],
        customItinerary: [],
        customRouteStops: [],
        dayRoutes: [],
        isApproved: false,
        offerPrice: 0,
        offerTitle: "Exclusive Limited-Time Offer",
        offerNote: "",
        customTerms: [],
        customPrivacy: [],
        bookingRef: generateBookingRef(),
        ...initialValues,
      },
    });

  React.useEffect(() => {
    setValue("isCustomTour", isCustomMode);
  }, [isCustomMode, setValue]);

  const adults = watch("adults");
  const children = watch("children");
  const infants = watch("infants");
  const startDateSel = watch("startDate");
  const customRouteStops = watch("customRouteStops");
  const isApproved = watch("isApproved");
  const offerPrice = watch("offerPrice");
  const offerTitle = watch("offerTitle");
  const offerNote = watch("offerNote");
  const customTerms = watch("customTerms");
  const customPrivacy = watch("customPrivacy");
  const dayRoutes = watch("dayRoutes");

  React.useEffect(() => {
    if (selectedTour && !isCustomMode) {
      // Dates: N days → end = start + (N - 1) so a single-day tour is
      // start = end (same day, 0 overnights).
      const start = startDateSel || todayISO();
      const end = new Date(start);
      end.setDate(
        end.getDate() + Math.max(0, (selectedTour.durationDays || 0) - 1)
      );
      setValue("endDate", end.toISOString().split("T")[0]);

      // Pricing: always use the exact website tier for this group size.
      const travelers = Math.max(
        (adults || 0) + (children || 0) + (infants || 0),
        1
      );
      const tierPrice = pickPricePerPerson(selectedTour.pricesTable, travelers);
      const fallbackPerPax =
        selectedTour.basePriceUSD ??
        (selectedTour.basePriceEUR != null
          ? Math.round(selectedTour.basePriceEUR / 0.92)
          : 0);
      const perPax = tierPrice > 0 ? tierPrice : fallbackPerPax;
      if (perPax > 0) {
        setValue("totalPrice", Math.round(perPax * travelers * 100) / 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTour, isCustomMode, adults, children, infants, startDateSel]);

  const {
    fields: itineraryFields,
    append: appendDay,
    remove: removeDay,
  } = useFieldArray({
    control,
    name: "customItinerary",
  });

  const currency = watch("currency");
  const totalPrice = watch("totalPrice");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const customInclusions = watch("customInclusions");
  const customExclusions = watch("customExclusions");
  const tourInclusions = watch("inclusions");
  const tourExclusions = watch("exclusions");
  const specialRequestItems = watch("specialRequestItems");

  // Pre-fill editable inclusions/exclusions from the selected standard tour
  // (only when the employee hasn't customized them yet).
  React.useEffect(() => {
    if (isCustomMode || !selectedTour) return;
    if ((tourInclusions ?? []).length === 0 && (selectedTour.inclusions ?? []).length > 0) {
      setValue("inclusions", selectedTour.inclusions ?? []);
    }
    if ((tourExclusions ?? []).length === 0 && (selectedTour.exclusions ?? []).length > 0) {
      setValue("exclusions", selectedTour.exclusions ?? []);
    }
  }, [selectedTour, isCustomMode, tourInclusions, tourExclusions, setValue]);

  const totalTravelers = adults + children + infants;

  const nights =
    startDate && endDate ? calculateNights(new Date(startDate), new Date(endDate)) : 0;


  const handleFormSubmit = (values: BookingFormValues, mode: "download" | "view" = "download") => {
    const ref = values.bookingRef || generateBookingRef();
    const config: BookingConfig = {
      id: `bk-${ref}`,
      isCustomTour: values.isCustomTour,
      tourId: !values.isCustomTour ? selectedTour?.id : undefined,
      customTourTitle: values.isCustomTour ? values.customTourTitle : undefined,
      customTourDescription: values.isCustomTour ? values.customTourDescription : undefined,
      customItinerary: values.isCustomTour ? (values.customItinerary as ItineraryDay[]) : undefined,
      customInclusions: values.isCustomTour ? values.customInclusions : undefined,
      customExclusions: values.isCustomTour ? values.customExclusions : undefined,
      customRouteStops: values.customRouteStops && values.customRouteStops.length > 0 ? values.customRouteStops : undefined,
      dayRoutes: values.dayRoutes && values.dayRoutes.length > 0 ? (values.dayRoutes as any) : undefined,
      isApproved: values.isApproved || false,
      offerPrice:
        values.offerPrice && values.offerPrice > 0 ? values.offerPrice : undefined,
      offerTitle: values.offerTitle?.trim() ? values.offerTitle.trim() : undefined,
      offerNote: values.offerNote?.trim() ? values.offerNote.trim() : undefined,
      customTerms: values.customTerms && values.customTerms.length > 0 ? values.customTerms.filter((t) => t && t.trim()) : undefined,
      customPrivacy: values.customPrivacy && values.customPrivacy.length > 0 ? values.customPrivacy.filter((t) => t && t.trim()) : undefined,
      // Standard mode: employee-editable inclusions/exclusions (pre-filled from tour)
      inclusions: !values.isCustomTour ? values.inclusions : undefined,
      exclusions: !values.isCustomTour ? values.exclusions : undefined,
      travelers: {
        adults: values.adults,
        children: values.children,
        infants: values.infants,
      },
      currency: values.currency as Currency,
      totalPrice: values.totalPrice,
      startDate: values.startDate,
      endDate: values.endDate,
      clientName: values.clientName,
      clientEmail: values.clientEmail,
      clientPhone: values.clientPhone,
      clientWhatsapp: values.clientWhatsapp || undefined,
      meetingPoint: values.meetingPoint,
      flightArrival: values.flightArrival || undefined,
      notes: values.notes || undefined,
      specialRequests: values.specialRequests || undefined,
      specialRequestItems:
        values.specialRequestItems && values.specialRequestItems.length > 0
          ? values.specialRequestItems
          : undefined,
      createdAt: new Date().toISOString(),
    };
    onSubmit(config, mode);
  };

  return (
    <form onSubmit={handleSubmit((values) => handleFormSubmit(values, "download"))}>
      <Card className="border-slate-200 bg-white/60 backdrop-blur">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A962]/15 text-[#C9A962]">
                <FileText className="h-4 w-4" />
              </span>
                Booking & Itinerary Configuration
              </CardTitle>
              <CardDescription className="mt-1">
                Configure travelers, dates, pricing and notes for this booking
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
              <div className="flex flex-col text-right pr-2">
                <span className="text-xs font-semibold text-slate-900">
                  Custom Tour
                </span>
                <span className="text-[10px] text-slate-500">
                  Not in catalog
                </span>
              </div>
              <Switch
                  checked={isCustomMode}
                  onCheckedChange={onCustomModeChange}
                />
            </div>
          </div>

          {isCustomMode && (
            <div className="mt-4 space-y-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
              <div className="flex items-start gap-2">
                <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium">Custom Tour Mode</p>
                  <p className="mt-0.5 text-xs text-amber-700">
                    This booking is not among the 118+ pre-loaded tours. Fill in the
                    custom title and itinerary below to build it from scratch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isCustomMode && selectedTour && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-600 text-white">
                ✓
              </div>
              <div className="flex-1">
                <p className="font-semibold">{selectedTour.title}</p>
                <p className="text-xs text-emerald-700">
                  {selectedTour.durationDays} day{selectedTour.durationDays !== 1 ? "s" : ""}
                  {selectedTour.durationNights ? ` / ${selectedTour.durationNights} nights` : ""}
                  {" • "}Pre-loaded itinerary, inclusions and exclusions are applied
                  automatically.
                </p>
              </div>
              <Badge variant="emerald">Standard Tour</Badge>
            </div>
          )}

          {!isCustomMode && !selectedTour && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <Info className="h-5 w-5 text-slate-400" />
              <p>
                No tour selected yet. Choose one from the catalog above or use the
                search bar, or enable Custom Tour mode.
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6 p-4 sm:p-6">
          {/* Booking Reference Section */}
          <Section icon={<FileText className="h-4 w-4" />} title="Booking Reference">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Reference Number *</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    {...register("bookingRef")}
                    placeholder="e.g. 20260911-001"
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue("bookingRef", generateBookingRef())}
                    title="Generate new reference"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Format: YYYYMMDD-XXX (auto-generated, editable)
                </p>
              </div>
            </div>
          </Section>

          {isCustomMode && (
            <>
              <Section icon={<FileText className="h-4 w-4" />} title="Custom Tour Details">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Custom Tour Title *</Label>
                    <Input
                      {...register("customTourTitle")}
                      placeholder="e.g. Private Cairo & Red Sea Adventure"
                      className="mt-1.5"
                    />
                    {errors.customTourTitle && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.customTourTitle.message as string}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Tour Description</Label>
                    <Textarea
                      {...register("customTourDescription")}
                      placeholder="Describe the overall tour..."
                      rows={3}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </Section>
            </>
          )}

          <Section icon={<Users className="h-4 w-4" />} title="Travelers">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Counter
                label="Adults"
                hint="Age 13+"
                error={errors.adults?.message}
                {...register("adults", { valueAsNumber: true })}
                value={adults}
                onChange={(v) => setValue("adults", v)}
              />
              <Counter
                label="Children"
                hint="Age 2-12"
                error={errors.children?.message}
                {...register("children", { valueAsNumber: true })}
                value={children}
                onChange={(v) => setValue("children", v)}
              />
              <Counter
                label="Infants"
                hint="Under 2"
                error={errors.infants?.message}
                {...register("infants", { valueAsNumber: true })}
                value={infants}
                onChange={(v) => setValue("infants", v)}
              />
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#C9A962]/60 bg-[#C9A962]/5 p-3 text-center">
                <p className="text-xs text-slate-500">Total Travelers</p>
                <p className="text-2xl font-bold text-[#8b7435]">{totalTravelers}</p>
              </div>
            </div>
          </Section>

          <Section icon={<CreditCard className="h-4 w-4" />} title="Pricing">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label>Currency</Label>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">$ USD (US Dollar)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label>Total Price ({currency})</Label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...register("totalPrice", { valueAsNumber: true })}
                  className="mt-1.5"
                  placeholder="0.00"
                />
                {errors.totalPrice && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.totalPrice.message}
                  </p>
                )}
              </div>
            </div>
            {/* Pricing tiers from the website */}
            {!isCustomMode && selectedTour && selectedTour.pricesTable && selectedTour.pricesTable.length > 0 && (
              <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="mb-2 text-xs font-semibold text-blue-800">Website Pricing Tiers (per person)</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTour.pricesTable.map((tier, i) => {
                    const isApplicable = (() => {
                      const label = tier.personsLabel.toLowerCase();
                      const rangeMatch = label.match(/(\d+)\s*[-–]\s*(\d+)/);
                      if (rangeMatch) return totalTravelers >= parseInt(rangeMatch[1]) && totalTravelers <= parseInt(rangeMatch[2]);
                      const singleMatch = label.match(/^(\d+)\s*(?:person|people)/);
                      if (singleMatch) return totalTravelers === parseInt(singleMatch[1]);
                      const plusMatch = label.match(/(\d+)\s*\+/);
                      if (plusMatch) return totalTravelers >= parseInt(plusMatch[1]);
                      return false;
                    })();
                    return (
                      <div key={i} className={cn("rounded-md px-2.5 py-1.5 text-xs", isApplicable ? "bg-blue-600 text-white font-bold" : "bg-white text-blue-700 border border-blue-200")}>
                        <span>{tier.personsLabel}</span>
                        <span className="ml-1.5">${tier.priceUSD}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-[10px] text-blue-600">Highlighted tier applies to your group of {totalTravelers}. Total = {formatCurrency(pickPricePerPerson(selectedTour.pricesTable, totalTravelers) * totalTravelers, currency)}</p>
              </div>
            )}
          </Section>

          {/* Special Offer / Discount — attractive & unique */}
          <Section icon={<Tag className="h-4 w-4" />} title="Special Offer">
            <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
              {/* Offer input */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">
                    Offer Price ({currency})
                  </Label>
                  {offerPrice != null && offerPrice > 0 && (
                    <button
                      type="button"
                      onClick={() => setValue("offerPrice", 0)}
                      className="text-[11px] font-semibold text-red-500 hover:underline"
                    >
                      Remove offer
                    </button>
                  )}
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                  {...register("offerPrice", {
                    setValueAs: (v) =>
                      v === "" || v == null || Number.isNaN(Number(v)) ? 0 : Number(v),
                  })}
                  className="mt-1.5"
                />
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                  Type the discounted price for this booking. The original price
                  stays recorded, but the offer price becomes the price shown to
                  the client. Leave empty (or 0) if there is no offer.
                </p>
                <div className="mt-3 space-y-2">
                  <div>
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Offer headline (PDF banner)
                    </Label>
                    <Input
                      {...register("offerTitle")}
                      placeholder="Exclusive Limited-Time Offer"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Offer note (PDF banner)
                    </Label>
                    <Textarea
                      {...register("offerNote")}
                      placeholder="e.g. Valid for bookings confirmed this week — includes all transfers…"
                      rows={2}
                      className="mt-1 min-h-[52px] resize-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Live offer preview */}
              {offerPrice != null && offerPrice > 0 ? (
                <div className="relative overflow-hidden rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-[#C9A962]/15 p-5">
                  {/* corner ribbon */}
                  <div className="absolute right-4 top-4 rotate-6 rounded-lg bg-emerald-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-md">
                    Special Offer
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
                      <Tag className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Offer Applied
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    <span className="text-lg font-semibold text-slate-400 line-through decoration-red-400 decoration-[2.5px]">
                      {formatCurrency(totalPrice, currency)}
                    </span>
                    <span className="text-3xl font-black tracking-tight text-emerald-600">
                      {formatCurrency(offerPrice, currency)}
                    </span>
                  </div>
                  {offerTitle?.trim() && (
                    <p className="mt-2 text-sm font-bold text-emerald-800">
                      {offerTitle}
                    </p>
                  )}
                  {offerNote?.trim() && (
                    <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                      {offerNote}
                    </p>
                  )}
                  {totalPrice > offerPrice && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
                      <BadgePercent className="h-3.5 w-3.5" />
                      You save {formatCurrency(totalPrice - offerPrice, currency)} (
                      {Math.round(((totalPrice - offerPrice) / totalPrice) * 100)}%)
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-5 text-center">
                  <BadgePercent className="h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-500">No offer on this booking</p>
                  <p className="mt-1 max-w-xs text-xs text-slate-400">
                    Add an offer price to highlight a discount — the original
                    price will be crossed out everywhere and the offer price will
                    be shown instead.
                  </p>
                </div>
              )}
            </div>
          </Section>

          {/* Inclusions & Exclusions — editable for standard tours */}
          {!isCustomMode && selectedTour && (
            <Section icon={<Plus className="h-4 w-4" />} title="Inclusions & Exclusions (Editable)">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InclusionExclusionEditor
                  label="Inclusions"
                  badgeVariant="emerald"
                  value={tourInclusions ?? []}
                  onChange={(items) => setValue("inclusions", items as any)}
                  placeholder="Add an inclusion (e.g. Private Guide, Breakfast, Transfer...)"
                />
                <InclusionExclusionEditor
                  label="Exclusions"
                  badgeVariant="destructive"
                  value={tourExclusions ?? []}
                  onChange={(items) => setValue("exclusions", items as any)}
                  placeholder="Add an exclusion..."
                  isExclusion
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Pre-filled from the selected tour — add or remove items as needed before generating the PDF.
              </p>
            </Section>
          )}

          {/* Editable Itinerary for standard tours */}
          {!isCustomMode && selectedTour && selectedTour.itinerary.length > 0 && (
            <Section icon={<Calendar className="h-4 w-4" />} title="Itinerary (Editable)">
              <div className="space-y-3">
                {selectedTour.itinerary.map((day, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge variant="gold" className="rounded-md px-2.5 py-1 text-xs">
                        Day {day.day}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {day.meals?.join(" • ") || "Meals not specified"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label className="text-xs">Title</Label>
                        <Input
                          defaultValue={day.title}
                          onChange={(e) => {
                            const updated = [...selectedTour.itinerary];
                            updated[index] = { ...updated[index], title: e.target.value };
                            setValue("customItinerary", updated as any);
                          }}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          defaultValue={day.description}
                          onChange={(e) => {
                            const updated = [...selectedTour.itinerary];
                            updated[index] = { ...updated[index], description: e.target.value };
                            setValue("customItinerary", updated as any);
                          }}
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      {day.accommodation && (
                        <div>
                          <Label className="text-xs">Accommodation</Label>
                          <Input
                            defaultValue={day.accommodation}
                            onChange={(e) => {
                              const updated = [...selectedTour.itinerary];
                              updated[index] = { ...updated[index], accommodation: e.target.value };
                              setValue("customItinerary", updated as any);
                            }}
                            className="mt-1"
                          />
                        </div>
                      )}
                      <div>
                        <Label className="flex items-center gap-1.5 text-xs">
                          <Map className="h-3.5 w-3.5 text-slate-500" />
                          Roadmap — places visited this day (editable, one per line)
                        </Label>
                        <Textarea
                          defaultValue={(dayRoutes?.find((r: any) => r.day === day.day)?.stops || []).join("\n")}
                          onChange={(e) => {
                            const stops = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
                            const current = (dayRoutes || []) as any[];
                            const without = current.filter((r: any) => r.day !== day.day);
                            setValue("dayRoutes", stops.length > 0 ? [...without, { day: day.day, stops }] as any : without as any);
                          }}
                          placeholder={"Pyramids of Giza\nGreat Sphinx\nEgyptian Museum"}
                          rows={3}
                          className="mt-1 resize-none text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section icon={<Calendar className="h-4 w-4" />} title="Travel Dates">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  {...register("startDate")}
                  className="mt-1.5"
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <Label>End Date *</Label>
                <Input
                  type="date"
                  {...register("endDate")}
                  className="mt-1.5"
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-start justify-center rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Duration</p>
                <p className="text-xl font-bold text-slate-900">
                  {nights + 1} day{nights + 1 !== 1 ? "s" : ""}
                  <span className="text-sm font-medium text-slate-500"> / {nights} nights</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Airport Arrival / Tour Start *</Label>
                <Input
                  type="datetime-local"
                  {...register("flightArrival")}
                  placeholder="Flight landing or tour start moment"
                  className="mt-1.5"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  e.g. flight landing time at the airport, or when the tour program begins.
                </p>
              </div>
            </div>
          </Section>

          {/* Optional Tours */}
          {!isCustomMode && selectedTour && selectedTour.itinerary.length > 0 && (
            <Section icon={<Plus className="h-4 w-4" />} title="Optional Tours">
              <OptionalToursEditor selectedTour={selectedTour} />
            </Section>
          )}

          <Section icon={<User className="h-4 w-4" />} title="Client Information (Required)">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Client Name *</Label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    {...register("clientName")}
                    placeholder="John Doe"
                    className="pl-9"
                  />
                </div>
                {errors.clientName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.clientName.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Email *</Label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    {...register("clientEmail")}
                    placeholder="client@example.com"
                    className="pl-9"
                  />
                </div>
                {errors.clientEmail && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.clientEmail.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Phone *</Label>
                <div className="relative mt-1.5">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="tel"
                    {...register("clientPhone")}
                    placeholder="+20 1xx xxx xxxx"
                    className="pl-9"
                  />
                </div>
                {errors.clientPhone && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.clientPhone.message}
                  </p>
                )}
              </div>
              <div>
                <Label>WhatsApp</Label>
                <div className="relative mt-1.5">
                  <MessageCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                  <Input
                    type="tel"
                    {...register("clientWhatsapp")}
                    placeholder="+20 1xx xxx xxxx (for PDF)"
                    className="pl-9 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <Label>Meeting Point (نقطة الالتقاء) *</Label>
                <div className="relative mt-1.5">
                  <Info className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    {...register("meetingPoint")}
                    placeholder="e.g. Cairo Airport arrivals hall, hotel lobby, or Nile cruise dock..."
                    className="pl-9"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Where exactly the driver / guide will meet the client. Appears on the PDF itinerary.
                </p>
                {errors.meetingPoint && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.meetingPoint.message}
                  </p>
                )}
              </div>
            </div>
          </Section>

          <Section icon={<StickyNote className="h-4 w-4" />} title="Notes & Special Requests">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Notes for Itinerary</Label>
                <Textarea
                  {...register("notes")}
                  placeholder="Any notes to appear on the PDF itinerary (e.g. guide language, dress code, photography policy)..."
                  rows={5}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Special Requests</Label>
                <Textarea
                  {...register("specialRequests")}
                  placeholder="Client special requests (e.g. room preferences, allergies, dietary needs, accessibility requirements)..."
                  rows={5}
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Detailed special request items with optional price */}
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <Label className="text-xs font-semibold text-slate-700">
                  Detailed Requests / Extra Services (with prices)
                </Label>
                <span className="text-[10px] text-slate-400">Optional — shown on the PDF pricing table</span>
              </div>
              {(specialRequestItems ?? []).length === 0 && (
                <p className="text-xs text-slate-400">
                  No extra items added yet. Use this for things like &quot;Hot air balloon upgrade — $120&quot;.
                </p>
              )}
              <div className="space-y-2">
                {(specialRequestItems ?? []).map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...(specialRequestItems ?? [])];
                          updated[index] = { ...updated[index], description: e.target.value };
                          setValue("specialRequestItems", updated as any);
                        }}
                        placeholder="Item description (e.g. Hot air balloon upgrade)"
                      />
                    </div>
                    <div className="w-28 shrink-0">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={item.price || ""}
                        onChange={(e) => {
                          const updated = [...(specialRequestItems ?? [])];
                          updated[index] = { ...updated[index], price: Number(e.target.value) || 0 };
                          setValue("specialRequestItems", updated as any);
                        }}
                        placeholder="Price"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={() =>
                        setValue(
                          "specialRequestItems",
                          (specialRequestItems ?? []).filter((_, i) => i !== index) as any
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full border-dashed"
                onClick={() =>
                  setValue("specialRequestItems", [
                    ...(specialRequestItems ?? []),
                    { id: `sri-${Date.now()}`, description: "", price: 0 },
                  ] as any)
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Request / Extra Service
              </Button>
            </div>
          </Section>

          {isCustomMode && (
            <>
              <Section icon={<Plus className="h-4 w-4" />} title="Custom Inclusions & Exclusions">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InclusionExclusionEditor
                    label="Inclusions"
                    badgeVariant="emerald"
                    value={customInclusions ?? []}
                    onChange={(items) =>
                      setValue("customInclusions", items as any)
                    }
                    placeholder="Add an inclusion (e.g. Private Guide, Breakfast, Transfer...)"
                  />
                  <InclusionExclusionEditor
                    label="Exclusions"
                    badgeVariant="destructive"
                    value={customExclusions ?? []}
                    onChange={(items) =>
                      setValue("customExclusions", items as any)
                    }
                    placeholder="Add an exclusion..."
                    isExclusion
                  />
                </div>
              </Section>

              <Section icon={<Calendar className="h-4 w-4" />} title={`Custom Itinerary`}>
                <div className="space-y-4">
                  {/* Number of Days Input */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label className="text-xs">Number of Days</Label>
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        value={itineraryFields.length || ""}
                        onChange={(e) => {
                          const numDays = parseInt(e.target.value) || 0;
                          const currentLength = itineraryFields.length;
                          
                          if (numDays > currentLength) {
                            for (let i = currentLength; i < numDays; i++) {
                              appendDay({
                                day: i + 1,
                                title: `Day ${i + 1}`,
                                description: "",
                              });
                            }
                          } else if (numDays < currentLength && numDays >= 0) {
                            for (let i = currentLength - 1; i >= numDays; i--) {
                              removeDay(i);
                            }
                          }
                        }}
                        placeholder="Enter number of days..."
                        className="mt-1"
                      />
                      <p className="mt-1 text-[10px] text-slate-400">
                        Enter the number of days to auto-create itinerary inputs
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs">&nbsp;</Label>
                      <div className="flex gap-1 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (itineraryFields.length > 1) {
                              removeDay(itineraryFields.length - 1);
                            }
                          }}
                          disabled={itineraryFields.length <= 1}
                          className="h-9 w-9 p-0"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            appendDay({
                              day: itineraryFields.length + 1,
                              title: `Day ${itineraryFields.length + 1}`,
                              description: "",
                            });
                          }}
                          className="h-9 w-9 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Itinerary Days */}
                  {itineraryFields.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
                      <p className="text-sm text-slate-500">
                        Enter the number of days above to create itinerary inputs.
                      </p>
                    </div>
                  )}
                  {itineraryFields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <Badge variant="gold" className="rounded-md px-2.5 py-1 text-xs">
                          Day {index + 1}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDay(index)}
                          className="h-7 text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="hidden">
                          <Input
                            type="hidden"
                            {...register(`customItinerary.${index}.day` as const)}
                            value={index + 1}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs">Title</Label>
                          <Input
                            {...register(`customItinerary.${index}.title` as const)}
                            placeholder="Day title..."
                            className="mt-1"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            {...register(`customItinerary.${index}.description` as const)}
                            placeholder="Describe this day..."
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <Label className="flex items-center gap-1.5 text-xs">
                            <Map className="h-3.5 w-3.5 text-slate-500" />
                            Roadmap — places visited this day (editable, one per line)
                          </Label>
                          <Textarea
                            value={((dayRoutes || []) as any[]).find((r: any) => r.day === index + 1)?.stops?.join("\n") || ""}
                            onChange={(e) => {
                              const stops = e.target.value.split("\n").map((s) => s.trim()).filter(Boolean);
                              const current = ((dayRoutes || []) as any[]).filter((r: any) => r.day !== index + 1);
                              setValue("dayRoutes", stops.length > 0 ? [...current, { day: index + 1, stops }] as any : current as any);
                            }}
                            placeholder={"Pyramids of Giza\nGreat Sphinx\nEgyptian Museum"}
                            rows={3}
                            className="mt-1 resize-none text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* Journey Route Stops Editor - Always visible */}
          <Section icon={<Map className="h-4 w-4" />} title="Journey Route (Destinations)">
            <RouteStopsEditor
              stops={customRouteStops}
              onChange={(stops) => setValue("customRouteStops", stops)}
            />
          </Section>

          <Separator />

          {/* Custom Terms & Conditions */}
          <Section icon={<FileText className="h-4 w-4" />} title="Terms & Conditions (Custom)">
            <TermsEditor terms={customTerms || []} onChange={(terms) => setValue("customTerms", terms)} />
          </Section>

          <Separator />

          {/* Custom Privacy Policy */}
          <Section icon={<ShieldCheck className="h-4 w-4" />} title="Privacy Policy (Custom)">
            <PrivacyEditor items={customPrivacy || []} onChange={(items) => setValue("customPrivacy", items)} />
            <p className="text-[11px] leading-relaxed text-slate-500">
              Leave empty to use the default Privacy Policy. Items you type here
              appear on the PDF under Terms & Conditions, with a link to{" "}
              <span className="font-mono">kemeryatours.com/page/privacy-policy</span>.
            </p>
          </Section>

          <Separator />

          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={isSubmitting}
            >
              Reset Form
            </Button>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-0.5">
              <span className="pl-2 pr-0.5 text-xs font-semibold text-slate-600">Status</span>
              <button
                type="button"
                onClick={() => setValue("isApproved", false)}
                disabled={isSubmitting}
                className={cn(
                  "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  !isApproved
                    ? "bg-amber-400 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                Hold
              </button>
              <button
                type="button"
                onClick={() => setValue("isApproved", true)}
                disabled={isSubmitting}
                className={cn(
                  "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  isApproved
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approved
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={isSubmitting || (!isCustomMode && !selectedTour)}
              className="gap-2"
              onClick={handleSubmit((values) => handleFormSubmit(values, "view"))}
            >
              <Eye className="h-4 w-4" />
              View PDF
            </Button>
            <Button
              type="submit"
              variant="gold"
              size="lg"
              disabled={isSubmitting || (!isCustomMode && !selectedTour)}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate PDF Itinerary
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function OptionalToursEditor({ selectedTour }: { selectedTour: Tour }) {
  const [optionalTours, setOptionalTours] = React.useState<Array<{
    day: number;
    name: string;
    price: number;
    location: string;
  }>>([]);
  const [draft, setDraft] = React.useState({ day: 1, name: "", price: 0, location: "" });

  const addTour = () => {
    if (!draft.name.trim()) return;
    setOptionalTours([...optionalTours, { ...draft }]);
    setDraft({ day: 1, name: "", price: 0, location: "" });
  };

  const removeTour = (idx: number) => {
    setOptionalTours(optionalTours.filter((_, i) => i !== idx));
  };

  const totalOptional = optionalTours.reduce((sum, t) => sum + t.price, 0);

  return (
    <div className="space-y-3">
      {optionalTours.length > 0 && (
        <div className="space-y-2">
          {optionalTours.map((tour, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">Day {tour.day}</Badge>
                  <span className="text-sm font-medium text-slate-900">{tour.name}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                  {tour.location && <span>📍 {tour.location}</span>}
                  <span className="font-medium text-emerald-700">${tour.price}/pax</span>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeTour(i)} className="text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <div className="rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">
            Total optional tours: <span className="font-bold">${totalOptional}/pax</span>
          </div>
        </div>
      )}
      <div className="rounded-lg border border-dashed border-slate-300 p-3">
        <p className="mb-2 text-xs font-semibold text-slate-700">Add Optional Tour</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div>
            <Label className="text-[10px]">Day</Label>
            <select
              value={draft.day}
              onChange={(e) => setDraft({ ...draft, day: Number(e.target.value) })}
              className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white text-sm"
            >
              {selectedTour.itinerary.map((d) => (
                <option key={d.day} value={d.day}>Day {d.day}</option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-[10px]">Tour Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Hot Air Balloon"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-[10px]">Price/pax ($)</Label>
            <Input
              type="number"
              min={0}
              value={draft.price || ""}
              onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) || 0 })}
              placeholder="0"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-[10px]">Location</Label>
            <Input
              value={draft.location}
              onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              placeholder="e.g. Luxor"
              className="mt-1"
            />
          </div>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addTour} className="mt-2">
          <Plus className="mr-1 h-3 w-3" /> Add
        </Button>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-100 text-slate-600">
          {icon}
        </span>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

interface CounterProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  error?: string;
}

const Counter = React.forwardRef<HTMLInputElement, CounterProps>(
  function Counter({ label, hint, value, onChange, error, className, ...rest }, ref) {
  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white p-3", className)}>
      <div className="mb-2 flex items-baseline justify-between">
        <Label className="text-xs font-semibold text-slate-700">{label}</Label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 shrink-0"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0 || (label === "Adults" && value <= 1)}
        >
          −
        </Button>
        <input
          {...rest}
          ref={ref}
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 text-center text-lg font-bold text-slate-900 focus:outline-none"
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 shrink-0"
          onClick={() => onChange(value + 1)}
        >
          +
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});
Counter.displayName = "Counter";

interface InclusionExclusionEditorProps {
  label: string;
  value: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  badgeVariant?: "emerald" | "destructive" | "gold";
  isExclusion?: boolean;
}

function InclusionExclusionEditor({
  label,
  value,
  onChange,
  placeholder,
  badgeVariant = "emerald",
}: InclusionExclusionEditorProps) {
  const [draft, setDraft] = React.useState("");

  const add = () => {
    const item = draft.trim();
    if (!item) return;
    onChange([...value, item]);
    setDraft("");
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <Label className="mb-2 block text-xs font-semibold text-slate-700">
        {label}
      </Label>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {value.length === 0 && (
          <span className="text-xs text-slate-400">No {label.toLowerCase()} added.</span>
        )}
        {value.map((item, i) => (
          <div
            key={i}
            className={cn(
              "group inline-flex items-center gap-1 rounded-full pl-3 pr-1 py-1 text-xs",
              badgeVariant === "emerald" &&
                "bg-emerald-500/10 text-emerald-700",
              badgeVariant === "destructive" &&
                "bg-red-500/10 text-red-700",
              badgeVariant === "gold" &&
                "bg-[#C9A962]/15 text-[#8b7435]"
            )}
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full transition-colors",
                badgeVariant === "emerald" &&
                  "text-emerald-700 hover:bg-emerald-500/20",
                badgeVariant === "destructive" &&
                  "text-red-700 hover:bg-red-500/20",
                badgeVariant === "gold" &&
                  "text-[#8b7435] hover:bg-[#C9A962]/20"
              )}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKey}
          placeholder={placeholder}
          className="text-sm"
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

