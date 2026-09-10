/* Test-render the ItineraryPDF in Node to surface real render errors */
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ItineraryPDF } from "../src/components/pdf/itinerary-pdf";
import type { BookingConfig, Tour } from "../src/types";
import { generateDynamicMap } from "../src/utils/mapGenerator";

process.env.NEXT_PUBLIC_MAPTILER_API_KEY = "cYbsTvD4eueAzUHeHwco";

const tour: Tour = {
  id: "t-1",
  title: "2 Days Cairo Tour from Sharm El Sheikh by Plane",
  durationDays: 2,
  itinerary: [
    { day: 1, title: "Cairo Highlights", description: "Pyramids, Sphinx and the Egyptian Museum visit with a private guide.", meals: ["Lunch"] },
    { day: 2, title: "Old Cairo & Bazaar", description: "Islamic and Coptic Cairo then Khan el-Khalili bazaar shopping.", meals: ["Breakfast", "Lunch"] },
    { day: 3, title: "Extra", description: "Placeholder day three description long enough to render nicely." },
    { day: 4, title: "Extra2", description: "Placeholder day four description long enough to render nicely." },
    { day: 5, title: "Extra3", description: "Placeholder day five description long enough to render nicely." },
    { day: 6, title: "Extra4", description: "Placeholder day six description long enough to render nicely." },
    { day: 7, title: "Extra5", description: "Placeholder day seven description long enough to render nicely." },
    { day: 8, title: "Extra6", description: "Placeholder day eight description long enough to render nicely." },
  ],
  overview: ["Discover the wonders of ancient Egypt on this two-day adventure. Explore the Pyramids of Giza and the Sphinx with your personal Egyptologist guide, then dive into the treasures of the Egyptian Museum."],
  inclusions: ["Hotel transfer"],
  exclusions: ["Personal expenses"],
} as unknown as Tour;

(async () => {
  try {
    const mapUrl = await generateDynamicMap(tour.itinerary);
    const booking: BookingConfig = {
      id: "bk-test-76837901",
      isCustomTour: false,
      travelers: { adults: 1, children: 0, infants: 0 },
      currency: "USD",
      totalPrice: 768,
      startDate: "2026-09-09",
      endDate: "2026-09-10",
      clientName: "Omar Ibrahim",
      clientEmail: "omar@example.com",
      clientPhone: "+201234567890",
      meetingPoint: "Cairo Airport arrivals hall",
      flightArrival: "2026-09-09T14:30",
      notes: "Test note",
      specialRequests: "Window seat",
      specialRequestItems: [{ id: "sri-1", description: "Balloon upgrade", price: 120 }],
      inclusions: ["Private guide", "Entrance fees"],
      exclusions: ["Drinks"],
      createdAt: new Date().toISOString(),
      mapUrl: mapUrl || undefined,
    };
    const buffer = await renderToBuffer(
      React.createElement(ItineraryPDF, { tour, booking }) as never
    );
    console.log("PDF OK, bytes:", buffer.length);
    process.exit(0);
  } catch (e) {
    console.error("PDF RENDER FAILED:");
    console.error(e);
    process.exit(1);
  }
})();
