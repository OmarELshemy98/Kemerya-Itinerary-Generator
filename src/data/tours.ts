import type { MainCategory, SubCategory, Tour } from "@/types";

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: "mc-001",
    name: "Egypt Day Tours",
    slug: "egypt-day-tours",
    description: "Single and multi-day guided tours across Egypt's iconic destinations",
    icon: "Landmark",
  },
  {
    id: "mc-002",
    name: "Egypt Nile Cruise",
    slug: "egypt-nile-cruise",
    description: "Luxury Nile cruises between Luxor, Aswan and beyond",
    icon: "Ship",
  },
  {
    id: "mc-003",
    name: "Egypt Shore Excursion",
    slug: "egypt-shore-excursion",
    description: "Port excursions for cruise ship passengers visiting Egypt",
    icon: "Anchor",
  },
  {
    id: "mc-004",
    name: "Egypt Travel Packages",
    slug: "egypt-travel-packages",
    description: "Complete multi-day packages covering Egypt's must-see destinations",
    icon: "Package",
  },
];

export const SUB_CATEGORIES: SubCategory[] = [
  // Egypt Day Tours Sub-categories
  {
    id: "sc-001",
    mainCategoryId: "mc-001",
    name: "Cairo Day Tours",
    slug: "cairo-day-tours",
  },
  {
    id: "sc-002",
    mainCategoryId: "mc-001",
    name: "Alexandria Day Tours",
    slug: "alexandria-day-tours",
  },
  {
    id: "sc-003",
    mainCategoryId: "mc-001",
    name: "Luxor Day Tour",
    slug: "luxor-day-tour",
  },
  {
    id: "sc-004",
    mainCategoryId: "mc-001",
    name: "Aswan Day Tour",
    slug: "aswan-day-tour",
  },
  {
    id: "sc-005",
    mainCategoryId: "mc-001",
    name: "Hurghada Day Tours",
    slug: "hurghada-day-tours",
  },
  {
    id: "sc-006",
    mainCategoryId: "mc-001",
    name: "Sharm Elsheikh Day Tours",
    slug: "sharm-elsheikh-day-tours",
  },
  {
    id: "sc-007",
    mainCategoryId: "mc-001",
    name: "Dahab Day Tour",
    slug: "dahab-day-tour",
  },
  {
    id: "sc-008",
    mainCategoryId: "mc-001",
    name: "Nuweiba Day Tours",
    slug: "nuweiba-day-tours",
  },
  {
    id: "sc-009",
    mainCategoryId: "mc-001",
    name: "Taba Day Tours",
    slug: "taba-day-tours",
  },
  {
    id: "sc-010",
    mainCategoryId: "mc-001",
    name: "Marsa Alam Day Tours",
    slug: "marsa-alam-day-tours",
  },
  {
    id: "sc-011",
    mainCategoryId: "mc-001",
    name: "Wheelchair Day Tours",
    slug: "wheelchair-day-tours",
  },
  // Egypt Nile Cruise Sub-categories
  {
    id: "sc-012",
    mainCategoryId: "mc-002",
    name: "Luxor & Aswan Nile Cruise",
    slug: "luxor-aswan-nile-cruise",
  },
  {
    id: "sc-013",
    mainCategoryId: "mc-002",
    name: "Dahabyia Nile Cruise",
    slug: "dahabyia-nile-cruise",
  },
  // Egypt Shore Excursion Sub-categories
  {
    id: "sc-014",
    mainCategoryId: "mc-003",
    name: "Alexandria Shore Excursion",
    slug: "alexandria-shore-excursion",
  },
  {
    id: "sc-015",
    mainCategoryId: "mc-003",
    name: "Port Said Short Excursion",
    slug: "port-said-short-excursion",
  },
  {
    id: "sc-016",
    mainCategoryId: "mc-003",
    name: "Safaga Short Excursion",
    slug: "safaga-short-excursion",
  },
  {
    id: "sc-017",
    mainCategoryId: "mc-003",
    name: "Sokhana Short Excursion",
    slug: "sokhana-short-excursion",
  },
  // Egypt Travel Packages Sub-categories
  {
    id: "sc-018",
    mainCategoryId: "mc-004",
    name: "Best Egypt Holiday Packages 2026",
    slug: "best-egypt-holiday-packages-2026",
  },
  {
    id: "sc-019",
    mainCategoryId: "mc-004",
    name: "Cairo Short Break Packages",
    slug: "cairo-short-break-packages",
  },
  {
    id: "sc-020",
    mainCategoryId: "mc-004",
    name: "Egypt Budget Tours",
    slug: "egypt-budget-tours",
  },
  {
    id: "sc-021",
    mainCategoryId: "mc-004",
    name: "Egypt Christmas Tours",
    slug: "egypt-christmas-tours",
  },
  {
    id: "sc-022",
    mainCategoryId: "mc-004",
    name: "Egypt Classic Tours",
    slug: "egypt-classic-tours",
  },
  {
    id: "sc-023",
    mainCategoryId: "mc-004",
    name: "Egypt Desert Safari Tours",
    slug: "egypt-desert-safari-tours",
  },
  {
    id: "sc-024",
    mainCategoryId: "mc-004",
    name: "Egypt Easter Tours",
    slug: "egypt-easter-tours",
  },
  {
    id: "sc-025",
    mainCategoryId: "mc-004",
    name: "Egypt Family Tours",
    slug: "egypt-family-tours",
  },
  {
    id: "sc-026",
    mainCategoryId: "mc-004",
    name: "Egypt Honeymoon Packages",
    slug: "egypt-honeymoon-packages",
  },
  {
    id: "sc-027",
    mainCategoryId: "mc-004",
    name: "Egypt Luxury Small Group Tours",
    slug: "egypt-luxury-small-group-tours",
  },
  {
    id: "sc-028",
    mainCategoryId: "mc-004",
    name: "Egypt Luxury Tours",
    slug: "egypt-luxury-tours",
  },
  {
    id: "sc-029",
    mainCategoryId: "mc-004",
    name: "Egypt Nile Cruise Tours",
    slug: "egypt-nile-cruise-tours",
  },
  {
    id: "sc-030",
    mainCategoryId: "mc-004",
    name: "Egypt Tour Itineraries",
    slug: "egypt-tour-itineraries",
  },
  {
    id: "sc-031",
    mainCategoryId: "mc-004",
    name: "Egypt Vacation",
    slug: "egypt-vacation",
  },
  {
    id: "sc-032",
    mainCategoryId: "mc-004",
    name: "Egypt Wheelchair Accessible Tours",
    slug: "egypt-wheelchair-accessible-tours",
  },
  {
    id: "sc-033",
    mainCategoryId: "mc-004",
    name: "Egypt and Holy Land Tours",
    slug: "egypt-and-holy-land-tours",
  },
  {
    id: "sc-034",
    mainCategoryId: "mc-004",
    name: "Egypt Group Tour Packages",
    slug: "egypt-group-tour-packages",
  },
];

const sampleInclusions = [
  "Private Egyptologist English-Speaking Guide",
  "Air-conditioned Vehicle throughout the tour",
  "Hotel pickup and drop-off",
  "All entrance fees to mentioned sites",
  "Bottled water during transfers",
  "Lunch at local restaurant",
  "All taxes and service charges",
];

const sampleExclusions = [
  "International flights",
  "Visa to Egypt (we can assist)",
  "Tipping (Baksheesh)",
  "Personal expenses",
  "Drinks and meals not specified",
  "Travel insurance (recommended)",
];

function extractDaysFromTitle(title: string): number {
  const match = title.match(/(\d+)[-\s]?(day|Day|DAYS|Days)/);
  if (match) return parseInt(match[1], 10);
  const match2 = title.match(/^(\d+)[-\s]/);
  if (match2) {
    const d = parseInt(match2[1], 10);
    if (d >= 2 && d <= 30) return d;
  }
  return 1;
}

function buildItinerary(days: number, theme: string): any[] {
  const itineraries: any[] = [];
  for (let i = 1; i <= days; i++) {
    itineraries.push({
      day: i,
      title: `${theme} - Day ${i}`,
      description: `Detailed description for Day ${i} of the ${theme}. Professional guided tour with pickup from your hotel. Explore magnificent ancient sites, enjoy authentic Egyptian cuisine, and experience unforgettable moments. Full itinerary details will be customized for your booking.`,
      highlights: [
        "Guided site visit with Egyptologist",
        "Authentic local lunch",
        "Photo opportunities",
        "Free time for shopping",
      ],
      meals: ["Breakfast", "Lunch"] as any,
      accommodation:
        i < days ? "4-Star Hotel / Nile Cruise Cabin" : undefined,
    });
  }
  return itineraries;
}

const TOUR_DATASET: { subCategoryId: string; titles: string[] }[] = [
  // Cairo Day Tours
  {
    subCategoryId: "sc-001",
    titles: [
      "Private Grand Museum Coptic Islamic Cairo Tour",
      "St Catherine Mt Sinai Program",
      "VIP Private Giza Pyramids Grand Museum Tour",
      "Cairo by Night",
      "Cairo Pyramids Saqqara Memphis Private Day Tour",
      "Fayoum Cairo Day",
      "Felucca Ride Cairo",
      "Horse Riding Giza Pyramids",
      "Luxury Nile Dinner Cruise Cairo Live Entertainment",
      "Private Coptic Islamic Cairo Heritage Tour",
      "Private Giza Pyramids Grand Egyptian Museum Tour",
      "Two Day Mt Sinai and St Catherine Trip from Cairo",
      "White Desert Bahariya Oasis Overnight Safari from Cairo",
    ],
  },
  // Alexandria Day Tours
  {
    subCategoryId: "sc-002",
    titles: [
      "Alexandria in One Day History Mediterranean Coast",
      "Alexandria to Cairo Day Tour",
    ],
  },
  // Luxor Day Tour
  {
    subCategoryId: "sc-003",
    titles: [
      "2 Day Luxor Highlights Tour with Hot Air Balloon",
      "Luxor East Bank",
      "Luxor West Bank",
      "Karnak Temple Sound and Light Show Tour from Luxor",
      "Luxor Museum Ramesseum Valley of the Kings Tour",
      "Private Luxor East West Bank Highlights Tour",
      "Sunrise Hot Air Balloon Adventure over Luxor",
    ],
  },
  // Aswan Day Tour
  {
    subCategoryId: "sc-004",
    titles: [
      "Abu Simbel Day Trip from Aswan",
      "Aswan Day Tour Philae Temple High Dam",
      "Aswan Felucca Sailing Tour on the Nile",
      "Aswan Highlights Philae Temple High Dam Unfinished Obelisk Tour",
      "Aswan Horse Carriage Ride",
      "Aswan Nubian Village Day Tour",
      "Kom Ombo Edfu Temples Day Tour from Aswan",
      "Philae Temple Sound Light Show Experience",
    ],
  },
  // Hurghada Day Tours
  {
    subCategoryId: "sc-005",
    titles: [
      "2 Days Cairo Tour from Hurghada",
      "2 Days Luxor Tour from Hurghada",
      "Cairo by Air Day Trip Hurghada",
      "Full Day Giftun Island Snorkeling Tour",
      "Hurghada Desert Safari Bedouin Village Experience",
      "Jungle Aqua Park Day Out Hurghada",
      "Orange Bay Island Snorkeling Adventure Hurghada",
      "Sindbad Submarine Adventure Hurghada",
    ],
  },
  // Sharm Elsheikh Day Tours
  {
    subCategoryId: "sc-006",
    titles: [
      "2 Days Cairo Alexandria Tour from Sharm El Sheikh by Plane",
      "2 Days Cairo Tour from Sharm El Sheikh by Plane",
      "Cairo Day Tour from Sharm El Sheikh by Flight",
      "Mount Sinai St Catherines Monastery Day Trip",
      "Ras Mohamed Boat Trip from Sharm El Sheikh",
      "Sharm El Sheikh Bedouin Dinner Stargazing Experience",
    ],
  },
  // Dahab Day Tour
  {
    subCategoryId: "sc-007",
    titles: [
      "Dahab Desert and Sea Adventure",
      "Tour from Dahab to the Pyramids",
    ],
  },
  // Nuweiba Day Tours
  {
    subCategoryId: "sc-008",
    titles: [
      "Nuweiba Colored Canyon Aqaba Bay Adventure",
      "Nuweiba to Cairo Pyramids Saqqara Tour",
    ],
  },
  // Taba Day Tours
  {
    subCategoryId: "sc-009",
    titles: [
      "Giza Pyramids Saqqara Tour from Taba by Flight",
      "Luxor Day Trip from Taba by Flight",
    ],
  },
  // Marsa Alam Day Tours
  {
    subCategoryId: "sc-010",
    titles: [
      "Cairo Day Tour from Marsa Alam by Flight",
      "Luxor Day Tour from Marsa Alam",
    ],
  },
  // Wheelchair Day Tours
  {
    subCategoryId: "sc-011",
    titles: [
      "Wheelchair Accessible Alexandria Day Tour from Cairo",
      "Wheelchair Accessible Giza Pyramids Tour",
    ],
  },
  // Luxor & Aswan Nile Cruise
  {
    subCategoryId: "sc-012",
    titles: [
      "4 Day Nile Cruise from Aswan to Luxor",
      "5 Day Luxury Nile Cruise Luxor to Aswan",
      "8 Day Cairo Nile Cruise Tour by Air",
    ],
  },
  // Dahabyia Nile Cruise
  {
    subCategoryId: "sc-013",
    titles: ["Nebyt Dahabiya Luxury Nile Cruise"],
  },
  // Alexandria Shore Excursion
  {
    subCategoryId: "sc-014",
    titles: [
      "Alexandria Day Tour from Alexandria Port",
      "Cairo Day Tour from Alexandria Port",
    ],
  },
  // Port Said Short Excursion
  {
    subCategoryId: "sc-015",
    titles: [
      "Cairo Day Tour from Port Said",
      "Port Said City Tour from Port Said Port",
    ],
  },
  // Safaga Short Excursion
  {
    subCategoryId: "sc-016",
    titles: [
      "Hurghada Snorkeling Trip from Safaga Port",
      "Luxor Day Tour from Safaga Port",
    ],
  },
  // Sokhana Short Excursion
  {
    subCategoryId: "sc-017",
    titles: [
      "Cairo Day Tour from Sokhna Port",
      "Saqqara Dahshur Pyramids Tour from Sokhna Port",
    ],
  },
  // Best Egypt Holiday Packages 2026
  {
    subCategoryId: "sc-018",
    titles: [
      "11 Days Egypt Afrcon 2019 Budget Tour",
      "15 Days Egypt and Afrcon 2019 Tour",
    ],
  },
  // Cairo Short Break Packages
  {
    subCategoryId: "sc-019",
    titles: [
      "2 Days Cairo Short Break",
      "3 Days Cairo Stopover",
    ],
  },
  // Egypt Budget Tours
  {
    subCategoryId: "sc-020",
    titles: [
      "5 Days Cairo Alexandria Budget Tour",
      "8 Days Cairo Nile Cruise Budget Holiday Package",
    ],
  },
  // Egypt Christmas Tours
  {
    subCategoryId: "sc-021",
    titles: [
      "13 Days Cairo Nile Cruise Bahariya Oasis Christmas Holiday Package",
      "4 Days Cairo Christmas City Break Package",
      "5 Days Cairo Alexandria Christmas Holiday Package",
      "6 Days Cairo Hurghada Christmas Holiday Package",
      "6 Days Cairo White Desert Christmas Adventure Tour Package",
      "8 Days Cairo Nile Cruise Christmas Holiday",
      "8 Days Cairo Christmas Nile Cruise",
      "9 Days in Pyramids and NileCruise and Train",
      "9 Days Egypt Christmas Tour Cairo Alexandria Siwa",
    ],
  },
  // Egypt Classic Tours
  {
    subCategoryId: "sc-022",
    titles: [
      "13 Days Cairo Nile Cruise Bahariya Oasis Tour Package",
      "4 Days Cairo City Break Tour Package",
      "5 Days Cairo Alexandria Tour Package",
      "6 Days Cairo Hurghada Holiday Package",
      "6 Days Cairo White Desert Adventure Tour Package",
      "8 Days Cairo Nile Cruise Tour Package by Air",
      "9 Days Cairo and Siwa Desert Safari",
    ],
  },
  // Egypt Desert Safari Tours
  {
    subCategoryId: "sc-023",
    titles: [
      "13 Day Egypt Desert and Nile Cruise Tour",
      "Bahariya Oasis Safari Trip",
      "Private Fayoum Desert Safari Tour",
    ],
  },
  // Egypt Easter Tours
  {
    subCategoryId: "sc-024",
    titles: [
      "13 Days Egypt Easter Holiday Cairo Nile Cruise Bahariya Oasis",
      "4 Days Easter Cairo City Break Tour Package",
      "5 Days Easter Cairo Alexandria Tour Package",
      "6 Days Egypt Easter Cairo Hurghada Holiday Package",
      "6 Days Egypt Easter Cairo White Desert Adventure Package",
      "7 Days in Cairo and Sharm",
      "8 Days in Cairo and Nile",
      "8 Days Egypt Easter Cairo Nile Cruise Package",
      "9 Days Egypt Easter Discovery Tour Package",
    ],
  },
  // Egypt Family Tours
  {
    subCategoryId: "sc-025",
    titles: [
      "10 Days Best Egypt Family Tour",
      "15 Days Egypt Family Adventure",
    ],
  },
  // Egypt Honeymoon Packages
  {
    subCategoryId: "sc-026",
    titles: [
      "6 Days Cairo and Alexandria Honeymoon",
      "7 Days Cairo and Sharm Honeymoon",
    ],
  },
  // Egypt Luxury Small Group Tours
  {
    subCategoryId: "sc-027",
    titles: [
      "7 Days Luxury Small Group Tour",
      "7 Days White Desert and Bahariya Oasis Adventure",
    ],
  },
  // Egypt Luxury Tours
  {
    subCategoryId: "sc-028",
    titles: [
      "12 Days in Cairo and NileCruise and RedSea",
      "13 Days Luxury Cairo Nile Cruise Fayoum Bahariya Oasis Tour",
      "8 Days in Egypt and The Nile Tour",
    ],
  },
  // Egypt Nile Cruise Tours
  {
    subCategoryId: "sc-029",
    titles: [
      "4 Days in NileCruise in Aswan and Luxor",
      "5 Days Nile Cruise Luxor Aswan",
    ],
  },
  // Egypt Tour Itineraries
  {
    subCategoryId: "sc-030",
    titles: [
      "3 Days Cairo Short Break",
      "Egypt Itinerary 1 Day Tour in Cairo",
    ],
  },
  // Egypt Vacation
  {
    subCategoryId: "sc-031",
    titles: [
      "Egypatin Romance",
      "Egypt Beyond the Ordinary",
      "Red Sea and Sinai Adventure",
      "The Timeless Egypt Journey 10 Days",
    ],
  },
  // Egypt Wheelchair Accessible Tours
  {
    subCategoryId: "sc-032",
    titles: [
      "5 Days Accessible Cairo and Luxor Accessible Tour Package",
      "8 Day Cairo and Nile Cruise Accessible Tour",
    ],
  },
  // Egypt and Holy Land Tours
  {
    subCategoryId: "sc-033",
    titles: [
      "12 Days Egypt and Jordan and Jerusalem Tour",
      "14 Days Biblical Egypt and Holy Land Tour",
    ],
  },
  // Egypt Group Tour Packages
  {
    subCategoryId: "sc-034",
    titles: [
      "10 Days Egypt Group Package",
      "8 Days Cairo and Nile Cruise for Groups",
    ],
  },
];

let tourCounter = 1;
function generateTours(): Tour[] {
  const tours: Tour[] = [];
  for (const dataset of TOUR_DATASET) {
    const subCat = SUB_CATEGORIES.find(
      (s) => s.id === dataset.subCategoryId
    );
    const mainCat = subCat
      ? MAIN_CATEGORIES.find((m) => m.id === subCat.mainCategoryId)
      : null;

    dataset.titles.forEach((title, idx) => {
      const detectedDays = extractDaysFromTitle(title);
      const durationDays = detectedDays;
      const isDayTour = mainCat?.id === "mc-001";
      const actualDays = isDayTour ? Math.max(1, durationDays) : durationDays;
      const basePricePerDay = 95 + Math.floor(Math.random() * 200) + 80;
      const price = actualDays * basePricePerDay;

      tours.push({
        id: `tour-${String(tourCounter++).padStart(3, "0")}`,
        subCategoryId: dataset.subCategoryId,
        mainCategoryId: subCat?.mainCategoryId ?? "mc-001",
        title,
        slug: title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        durationDays: actualDays,
        durationNights: Math.max(actualDays - 1, 0),
        shortDescription: `Experience ${title} with our professional guided${actualDays > 1 ? ` ${actualDays}-day` : ""} tour.${subCat ? ` Part of our ${subCat.name} collection.` : ""}`,
        longDescription: `This exclusive ${actualDays}-day experience takes you through the heart of Egypt. ${subCat ? `${subCat.name}.` : ""} Led by an expert Egyptologist guide, you'll discover ancient monuments, meet local communities, and savor authentic cuisine. Perfect for travelers seeking a deeply immersive cultural experience with comfort and professionalism.`,
        basePriceEUR: price,
        basePriceUSD: Math.round(price * 1.08),
        highlights: [
          "Expert Egyptologist guide",
          "All entrance fees included",
          "Private air-conditioned transport",
          "Authentic local meals",
        ],
        inclusions: sampleInclusions,
        exclusions: sampleExclusions,
        itinerary: buildItinerary(actualDays, subCat?.name || "Tour"),
        tags: idx === 0 ? ["Best Seller", "Top Rated"] : idx === 1 ? ["Popular"] : [],
        isPopular: idx <= 1,
      });
    });
  }
  return tours;
}

export const TOURS: Tour[] = generateTours();

export function getMainCategoriesWithSubs() {
  return MAIN_CATEGORIES.map((mc) => ({
    ...mc,
    subCategories: SUB_CATEGORIES.filter((sc) => sc.mainCategoryId === mc.id),
  }));
}

export function getToursBySubCategory(subCategoryId: string): Tour[] {
  return TOURS.filter((t) => t.subCategoryId === subCategoryId);
}

export function getSubCategoriesByMain(
  mainCategoryId: string
): SubCategory[] {
  return SUB_CATEGORIES.filter((sc) => sc.mainCategoryId === mainCategoryId);
}

export function searchTours(query: string): Tour[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return TOURS.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.shortDescription?.toLowerCase().includes(q) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(q))
  ).slice(0, 20);
}

export function getTourById(id: string): Tour | undefined {
  return TOURS.find((t) => t.id === id);
}

export function getSubCategoryById(id: string): SubCategory | undefined {
  return SUB_CATEGORIES.find((sc) => sc.id === id);
}

export function getMainCategoryById(id: string): MainCategory | undefined {
  return MAIN_CATEGORIES.find((mc) => mc.id === id);
}
