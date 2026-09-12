export interface MainCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
}

export interface SubCategory {
  id: string;
  mainCategoryId: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  highlights?: string[];
  meals?: ("Breakfast" | "Lunch" | "Dinner")[];
  accommodation?: string;
  /** Route stops for this specific day */
  routeStops?: DayRouteStop[];
  /** Per-day journey map stops — destinations visited THIS day (employee-editable) */
  dayRoute?: string[];
}

export interface DayRouteStop {
  id: string;
  name: string;
  order: number;
}

/** Per-day journey route — places the client visits THAT day (per-day map) */
export interface DayRoute {
  day: number;
  stops: string[];
}

export interface SpecialRequestItem {
  id: string;
  description: string;
  price: number;
}

export interface TripNote {
  question: string;
  answer: string;
}

export interface Tour {
  id: string;
  subCategoryId: string;
  mainCategoryId: string;
  title: string;
  slug: string;
  durationDays: number;
  durationNights?: number;
  /** Raw duration label from the website hero, e.g. "Full Day", "8 hours", "1 Day" */
  durationLabel?: string;
  /** Location / group / language meta from the hero, e.g. "Cairo & Giza", "All Language" */
  location?: string;
  group?: string;
  language?: string;
  shortDescription?: string;
  longDescription?: string;
  /** Full overview paragraphs exactly as on the website (#overview-text) */
  overview?: string[];
  /** Overview HTML (paragraphs) preserved for faithful rendering */
  overviewHtml?: string;
  /** Meeting point section (#meeting_point .td-about) */
  meetingPoint?: string;
  meetingPointHtml?: string;
  meetingPointImages?: string[];
  image?: string;
  /** All gallery images from the hero slider */
  galleryImages?: string[];
  /** Canonical URL of the tour on kemeryatours.com */
  sourceUrl?: string;
  basePriceEUR?: number;
  basePriceUSD?: number;
  /** Per-person pricing tiers from the website, e.g. [{personsLabel: "1 Person", priceUSD: 132}, {personsLabel: "2 - 3 Persons", priceUSD: 86}, ...] */
  pricesTable?: { personsLabel: string; priceUSD: number }[];
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  tripNotes?: TripNote[];
  itinerary: ItineraryDay[];
  tags?: string[];
  isPopular?: boolean;
  schedule?: string;
}

export type Currency = "EUR" | "USD";

export interface BookingTravelers {
  adults: number;
  children: number;
  infants: number;
}

export interface BookingConfig {
  id: string;
  isCustomTour: boolean;
  tourId?: string;
  customTourTitle?: string;
  customTourDescription?: string;
  customItinerary?: ItineraryDay[];
  /** Per-day roadmap strings for a custom tour (index-aligned with customItinerary) */
  customDayRoutes?: string[][];
  customInclusions?: string[];
  customExclusions?: string[];
  travelers: BookingTravelers;
  currency: Currency;
  totalPrice: number;
  pricePerPerson?: number;
  startDate: string;
  endDate: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientWhatsapp?: string;
  notes?: string;
  specialRequests?: string;
  specialRequestItems?: SpecialRequestItem[];
  flightArrival?: string;
  pickupTime?: string;
  /** Meeting/pickup point for the tour, e.g. "Cairo Airport arrivals hall" */
  meetingPoint?: string;
  flightDeparture?: string;
  tourEndTime?: string;
  tourStartTime?: string;
  inclusions?: string[];
  exclusions?: string[];
  includesAll?: boolean;
  excludesAll?: boolean;
  createdAt: string;
  /** Optional Geoapify static map image URL for the itinerary */
  mapUrl?: string;
  /** Custom route stops - editable list of destinations for the journey roadmap */
  customRouteStops?: RouteStop[];
  /** Per-day journey routes — one mini-map per day (places visited THAT day) */
  dayRoutes?: DayRoute[];
  /** Whether this itinerary has been approved */
  isApproved?: boolean;
  /** Special offer price — when > 0 it replaces totalPrice everywhere
   *  and the original price is shown struck through. */
  offerPrice?: number;
  /** Luxury offer headline shown on the PDF offer banner (editable) */
  offerTitle?: string;
  /** Extra offer note shown under the offer price (editable) */
  offerNote?: string;
  /** Custom terms & conditions for this specific itinerary */
  customTerms?: string[];
  /** Custom privacy-policy items for this specific itinerary (editable) */
  customPrivacy?: string[];
}

export interface RouteStop {
  id: string;
  name: string;
  order: number;
}

export interface ItineraryPDFData {
  tour: Tour | null;
  booking: BookingConfig;
  companyInfo: CompanyInfo;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  operationsManager: {
    name: string;
    phone: string;
    email: string;
  };
  whatsapp: string;
  supportPhone?: string;
  developer?: {
    name: string;
    website: string;
  };
  invoiceLogo?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    googleBusiness?: string;
  };
}

export interface CategoryTreeNode {
  mainCategory: MainCategory;
  subCategories: (SubCategory & {
    tours: Tour[];
  })[];
}

export type UserRole = "super_admin" | "admin" | "operator" | "viewer";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AdminUser extends Profile {}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  full_name?: string;
  phone_number?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface Itinerary {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  tour_id?: string;
  tour_title?: string;
  is_custom_tour: boolean;
  custom_tour_title?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  travelers_adults: number;
  travelers_children: number;
  travelers_infants: number;
  total_price: number;
  currency: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

