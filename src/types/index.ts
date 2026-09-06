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
}

export interface Tour {
  id: string;
  subCategoryId: string;
  mainCategoryId: string;
  title: string;
  slug: string;
  durationDays: number;
  durationNights?: number;
  shortDescription?: string;
  longDescription?: string;
  image?: string;
  basePriceEUR?: number;
  basePriceUSD?: number;
  highlights?: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  tags?: string[];
  isPopular?: boolean;
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
  createdAt: string;
}

export interface ItineraryPDFData {
  tour: Tour | null;
  booking: BookingConfig;
  companyInfo: CompanyInfo;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  logo?: string;
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
  socialMedia?: {
    facebook?: string;
    instagram?: string;
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
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AdminUser extends Profile {}

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

