import type { MainCategory, SubCategory, Tour } from "@/types";

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: "mc-001",
    name: "Cairo Day Tours",
    slug: "cairo-day-tours",
    description: "Explore Cairo's iconic landmarks and hidden treasures",
    icon: "Landmark",
  },
  {
    id: "mc-002",
    name: "Nile Cruises",
    slug: "nile-cruises",
    description: "Luxury cruises between Luxor and Aswan",
    icon: "Ship",
  },
  {
    id: "mc-003",
    name: "Packages",
    slug: "packages",
    description: "Complete multi-day travel packages across Egypt",
    icon: "Package",
  },
  {
    id: "mc-004",
    name: "Luxor & Aswan",
    slug: "luxor-aswan",
    description: "Ancient wonders of Upper Egypt",
    icon: "Building2",
  },
  {
    id: "mc-005",
    name: "Red Sea & Hurghada",
    slug: "red-sea",
    description: "Beaches, diving and resort experiences",
    icon: "Umbrella",
  },
  {
    id: "mc-006",
    name: "Alexandria & North Coast",
    slug: "alexandria-north-coast",
    description: "Mediterranean charm and coastal cities",
    icon: "Anchor",
  },
  {
    id: "mc-007",
    name: "Siwa & Western Desert",
    slug: "siwa-desert",
    description: "Oases, deserts and adventure tours",
    icon: "Mountain",
  },
  {
    id: "mc-008",
    name: "Custom & Private Tours",
    slug: "custom-private",
    description: "Tailor-made and private experiences",
    icon: "Sparkles",
  },
];

export const SUB_CATEGORIES: SubCategory[] = [
  // Cairo Day Tours
  {
    id: "sc-001",
    mainCategoryId: "mc-001",
    name: "Giza Pyramids Complex",
    slug: "giza-pyramids",
  },
  {
    id: "sc-002",
    mainCategoryId: "mc-001",
    name: "Egyptian Museum & Old Cairo",
    slug: "egyptian-museum-old-cairo",
  },
  {
    id: "sc-003",
    mainCategoryId: "mc-001",
    name: "Coptic & Islamic Cairo",
    slug: "coptic-islamic-cairo",
  },
  {
    id: "sc-004",
    mainCategoryId: "mc-001",
    name: "Memphis, Saqqara & Dahshur",
    slug: "memphis-saqqara-dahshur",
  },
  {
    id: "sc-005",
    mainCategoryId: "mc-001",
    name: "Cairo Food & Cultural Tours",
    slug: "cairo-food-cultural",
  },
  // Nile Cruises
  {
    id: "sc-006",
    mainCategoryId: "mc-002",
    name: "5-Star Nile Cruises (Luxor-Aswan)",
    slug: "5-star-nile-cruises",
  },
  {
    id: "sc-007",
    mainCategoryId: "mc-002",
    name: "Luxury Dahabiya Cruises",
    slug: "luxury-dahabiya",
  },
  {
    id: "sc-008",
    mainCategoryId: "mc-002",
    name: "Felucca Sailing Experience",
    slug: "felucca-sailing",
  },
  {
    id: "sc-009",
    mainCategoryId: "mc-002",
    name: "Lake Nasser Cruises",
    slug: "lake-nasser-cruises",
  },
  // Packages
  {
    id: "sc-010",
    mainCategoryId: "mc-003",
    name: "Classic Egypt Packages (7-10 days)",
    slug: "classic-egypt-7-10",
  },
  {
    id: "sc-011",
    mainCategoryId: "mc-003",
    name: "Grand Egypt Packages (11-14 days)",
    slug: "grand-egypt-11-14",
  },
  {
    id: "sc-012",
    mainCategoryId: "mc-003",
    name: "Honeymoon Packages",
    slug: "honeymoon-packages",
  },
  {
    id: "sc-013",
    mainCategoryId: "mc-003",
    name: "Family Holiday Packages",
    slug: "family-packages",
  },
  {
    id: "sc-014",
    mainCategoryId: "mc-003",
    name: "Luxury & VIP Packages",
    slug: "luxury-vip-packages",
  },
  {
    id: "sc-015",
    mainCategoryId: "mc-003",
    name: "Budget Egypt Packages",
    slug: "budget-packages",
  },
  // Luxor & Aswan
  {
    id: "sc-016",
    mainCategoryId: "mc-004",
    name: "Luxor East Bank Tours",
    slug: "luxor-east-bank",
  },
  {
    id: "sc-017",
    mainCategoryId: "mc-004",
    name: "Luxor West Bank Tours",
    slug: "luxor-west-bank",
  },
  {
    id: "sc-018",
    mainCategoryId: "mc-004",
    name: "Aswan City & Abu Simbel",
    slug: "aswan-abu-simbel",
  },
  {
    id: "sc-019",
    mainCategoryId: "mc-004",
    name: "Hot Air Balloon Rides",
    slug: "hot-air-balloon",
  },
  // Red Sea & Hurghada
  {
    id: "sc-020",
    mainCategoryId: "mc-005",
    name: "Hurghada Beach Resorts",
    slug: "hurghada-resorts",
  },
  {
    id: "sc-021",
    mainCategoryId: "mc-005",
    name: "Giftun Island Snorkeling",
    slug: "giftun-island",
  },
  {
    id: "sc-022",
    mainCategoryId: "mc-005",
    name: "Sharm El Sheikh Packages",
    slug: "sharm-el-sheikh",
  },
  {
    id: "sc-023",
    mainCategoryId: "mc-005",
    name: "Diving & Water Sports",
    slug: "diving-water-sports",
  },
  {
    id: "sc-024",
    mainCategoryId: "mc-005",
    name: "Marsa Alam Holidays",
    slug: "marsa-alam",
  },
  // Alexandria
  {
    id: "sc-025",
    mainCategoryId: "mc-006",
    name: "Alexandria Day Tours",
    slug: "alexandria-day-tours",
  },
  {
    id: "sc-026",
    mainCategoryId: "mc-006",
    name: "North Coast Getaways",
    slug: "north-coast",
  },
  // Siwa
  {
    id: "sc-027",
    mainCategoryId: "mc-007",
    name: "Siwa Oasis Packages",
    slug: "siwa-oasis",
  },
  {
    id: "sc-028",
    mainCategoryId: "mc-007",
    name: "White & Black Desert Camping",
    slug: "white-black-desert",
  },
  {
    id: "sc-029",
    mainCategoryId: "mc-007",
    name: "Bahariya & Farafra Oases",
    slug: "bahariya-farafra",
  },
  // Custom
  {
    id: "sc-030",
    mainCategoryId: "mc-008",
    name: "Tailor-Made Tours",
    slug: "tailor-made",
  },
  {
    id: "sc-031",
    mainCategoryId: "mc-008",
    name: "Private Guided Tours",
    slug: "private-guided",
  },
  {
    id: "sc-032",
    mainCategoryId: "mc-008",
    name: "Group Tour Add-Ons & Extensions",
    slug: "add-ons-extensions",
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

function buildItinerary(days: number, theme: string): any[] {
  const itineraries: any[] = [];
  for (let i = 1; i <= days; i++) {
    itineraries.push({
      day: i,
      title: `${theme} - Day ${i}`,
      description: `Detailed description for Day ${i} of the ${theme}. Professional guided tour with pickup from your hotel. Explore magnificent ancient sites, enjoy authentic Egyptian cuisine, and experience unforgettable moments.`,
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

const TOUR_TITLES: Record<string, string[]> = {
  "sc-001": [
    "Giza Pyramids, Sphinx & Valley Temple Half-Day Tour",
    "Giza Pyramids, Sphinx & Solar Boat Museum Full Day",
    "Pyramids Sound & Light Show at Night",
    "Giza Pyramids with Camel Ride & Lunch",
    "Inside the Great Pyramid of Khufu Experience",
  ],
  "sc-002": [
    "Egyptian Museum in Tahrir Tour",
    "Grand Egyptian Museum (GEM) Tour",
    "Museum of Egyptian Civilization & Mummies Hall",
    "Old Cairo Walking Tour - Khan el-Khalili Bazaar",
  ],
  "sc-003": [
    "Coptic Cairo - Hanging Church & Fortress of Babylon",
    "Islamic Cairo Citadel of Salah El Din",
    "Mohamed Ali Alabaster Mosque & Sultan Hassan Mosque",
    "Cairo Old Market & Souq Tour",
  ],
  "sc-004": [
    "Memphis, Saqqara Step Pyramid & Dahshur Day Trip",
    "Saqqara Pyramid Complex Full Day Excursion",
    "Dahshur Bent & Red Pyramid Private Tour",
  ],
  "sc-005": [
    "Cairo Food Tour - Traditional Egyptian Cuisine",
    "Cairo by Night - Nile Dinner Cruise",
    "Local Life Cultural Walking Tour",
  ],
  "sc-006": [
    "4-Day Nile Cruise Luxor to Aswan 5-Star",
    "5-Day Nile Cruise Luxor-Aswan-Luxor",
    "7-Day Luxury Nile Cruise Package",
    "3-Day Aswan to Luxor Nile Cruise",
  ],
  "sc-007": [
    "Luxury Dahabiya Cruise Luxor to Aswan 7 Days",
    "Dahabiya Private Sailing 5 Days Experience",
    "Royal Dahabiya Family Cruise Package",
  ],
  "sc-008": [
    "Felucca Sailing on the Nile - 2 Days Aswan",
    "Sunset Felucca Ride in Luxor",
    "Nile Felucca with Lunch Experience",
  ],
  "sc-009": [
    "4-Day Lake Nasser Cruise from Aswan",
    "Lake Nasser Abu Simbel Cruise Experience",
    "7-Day Lake Nasser Luxury Cruise",
  ],
  "sc-010": [
    "8-Day Classic Egypt: Cairo, Nile Cruise & Hurghada",
    "10-Day Egypt Wonders of the Pharaohs",
    "7-Day Cairo, Luxor & Aswan Package",
    "9-Day All Inclusive Egypt Explorer",
  ],
  "sc-011": [
    "12-Day Grand Tour of Egypt",
    "14-Day Ultimate Egypt Discovery",
    "11-Day Egypt Deep Dive Package",
  ],
  "sc-012": [
    "7-Day Romantic Honeymoon in Egypt",
    "10-Day Luxury Honeymoon Package with Nile Cruise",
    "Romantic Egypt Honeymoon with Hurghada Extension",
  ],
  "sc-013": [
    "8-Day Family Friendly Egypt Tour",
    "10-Day Egypt Family Adventure",
    "Family Package with Kids Activities",
  ],
  "sc-014": [
    "10-Day Luxury VIP Egypt Experience",
    "Luxury Egypt: Cairo, Nile Cruise & Hurghada 12 Days",
    "Royal Egypt Private Jet VIP 5-Star Package",
  ],
  "sc-015": [
    "5-Day Budget Cairo & Luxor on a Budget",
    "7-Day Affordable Egypt Highlights",
    "Budget Backpacker Egypt 10 Days",
  ],
  "sc-016": [
    "Luxor East Bank: Karnak & Luxor Temples",
    "Karnak Temple Sound & Light Show",
    "Luxor Museum & Mummification Museum",
  ],
  "sc-017": [
    "Luxor West Bank: Valley of the Kings & Hatshepsut",
    "Tomb of Nefertari & Valley of the Queens",
    "Deir el-Medina Workers Village Tour",
    "Temple of Seti I & Abydos Day Trip from Luxor",
    "Dendera Temple Complex Half-Day",
  ],
  "sc-018": [
    "Aswan City Tour: High Dam, Obelisk & Philae Temple",
    "Abu Simbel Temples Day Trip from Aswan",
    "Philae Temple Sound & Light Show",
    "Nubian Village Tour by Boat",
  ],
  "sc-019": [
    "Luxor Hot Air Balloon Ride at Sunrise",
    "Luxor Balloon Ride + West Bank Combined",
  ],
  "sc-020": [
    "3-Day Hurghada Beach Holiday",
    "5-Day Hurghada Resort Getaway",
    "7-Day All-Inclusive Hurghada Package",
  ],
  "sc-021": [
    "Giftun Island Snorkeling Day Trip",
    "Hurghada Snorkeling with Dolphin House",
    "Orange Bay Island Snorkeling Trip",
  ],
  "sc-022": [
    "5-Day Sharm El Sheikh Beach & Relax",
    "7-Day Sharm el Sheikh with Ras Mohammed",
    "Sharm el Sheikh Luxury Resort 10 Days",
  ],
  "sc-023": [
    "PADI Open Water Diving Course Hurghada",
    "Intro Diving Experience",
    "Water Sports Package - Hurghada",
    "Thistlegorm Wreck Dive Day Trip",
  ],
  "sc-024": [
    "5-Day Marsa Alam Beach Escape",
    "Marsa Alam Snorkeling & Diving Holiday",
    "7-Day Marsa Alam Family Beach Package",
  ],
  "sc-025": [
    "Alexandria Full-Day Tour from Cairo",
    "Alexandria 2-Day City Break",
    "Montaza Palace & Qaitbay Citadel Tour",
    "Alexandria Library & Catacombs Tour",
  ],
  "sc-026": [
    "3-Day North Coast Sahel Getaway",
    "5-Day North Coast Resort Holiday",
    "Alamein & Wadi El Natrun Tour",
  ],
  "sc-027": [
    "3-Day Siwa Oasis from Cairo",
    "5-Day Siwa Oasis Adventure",
    "Siwa Safari & Desert Camp Experience",
    "Siwa Oracle & Salt Lakes Tour",
  ],
  "sc-028": [
    "2-Day White & Black Desert from Cairo",
    "3-Day White Desert Camping Safari",
    "Crystal Mountain & Black Desert Tour",
  ],
  "sc-029": [
    "4-Day Bahariya & Farafra Oases",
    "Desert Safari Oases Expedition 5 Days",
  ],
  "sc-030": [
    "Build Your Own Custom Egypt Itinerary",
    "Fully Tailored Egypt Tour Package",
  ],
  "sc-031": [
    "Private Egyptologist-Guided Cairo",
    "Private Luxor & Aswan Guided Tour",
    "Private Family Tour Egypt",
  ],
  "sc-032": [
    "Cairo Stopover Extension 2 Days",
    "Luxor or Aswan Add-On 3 Days",
    "Hurghada Beach Extension Package",
  ],
};

let tourCounter = 1;
function generateTours(): Tour[] {
  const tours: Tour[] = [];
  for (const subCategory of SUB_CATEGORIES) {
    const titles = TOUR_TITLES[subCategory.id] || [
      `${subCategory.name} - Tour A`,
      `${subCategory.name} - Tour B`,
    ];
    titles.forEach((title, idx) => {
      const days = [1, 2, 3, 4, 5, 7, 8, 10, 12, 14][
        Math.floor(Math.random() * 10)
      ];
      const actualDays = subCategory.mainCategoryId === "mc-001" ? 1 : days;
      const price =
        actualDays * (85 + Math.floor(Math.random() * 400) + 150);

      tours.push({
        id: `tour-${String(tourCounter++).padStart(3, "0")}`,
        subCategoryId: subCategory.id,
        mainCategoryId: subCategory.mainCategoryId,
        title,
        slug: title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        durationDays: actualDays,
        durationNights: Math.max(actualDays - 1, 0),
        shortDescription: `Experience the best of ${subCategory.name} with our professional guided ${actualDays}-day tour.`,
        longDescription: `This exclusive ${actualDays}-day experience takes you through the heart of ${subCategory.name}. Led by an expert Egyptologist guide, you'll discover ancient monuments, meet local communities, and savor authentic cuisine. Perfect for travelers seeking a deeply immersive cultural experience with comfort and professionalism.`,
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
        itinerary: buildItinerary(actualDays, subCategory.name),
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
