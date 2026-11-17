export type Language = 'uz' | 'ru' | 'en' | 'tj';

export type Currency = 'USD' | 'UZS';

export interface LocalizedText {
  uz: string;
  ru: string;
  en: string;
  tj: string;
}

export interface Category {
  id: string;
  slug: string;
  name: LocalizedText;
  subtitle: LocalizedText;
  order: number;
}

export interface ItineraryDay {
  day: number;
  title: LocalizedText;
  description: LocalizedText;
}

export interface TourPackage {
  id: string;
  categoryId: string;
  title: LocalizedText;
  destination: LocalizedText;
  countryCode: string;
  priceUsd: number;
  priceUzs: number;
  durationDays: number;
  durationNights: number;
  hotelName: string;
  hotelStars: number;
  includesFlight: boolean;
  includesTransfer: boolean;
  includesInsurance: boolean;
  featured: boolean;
  active: boolean;
  photos: string[];
  summary: LocalizedText;
  itinerary: ItineraryDay[];
  createdAt: string;
}

export type LeadStatus = 'Yangi' | 'Aloqada' | 'Bron qilindi' | 'To‘lov qilindi';

export interface Lead {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  tourId?: string;
  tourTitle?: string;
  travelers: number;
  preferredDate?: string;
  message?: string;
  status: LeadStatus;
  assignedManager?: string;
  notes: string;
  dealAmountUsd: number;
  source: 'booking' | 'consultation' | 'quick_inquiry';
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'Flight'
  | 'Hotel'
  | 'Marketing'
  | 'Office'
  | 'Salary'
  | 'Visa'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amountUsd: number;
  amountUzs: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export type UserRole = 'Admin' | 'Manager' | 'Accountant';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorEmail: string;
  actorRole: UserRole | 'Public';
  action: string;
  targetType: 'Lead' | 'Tour' | 'Category' | 'Expense' | 'Staff' | 'Auth' | 'Newsletter';
  details: string;
  timestamp: string;
}

export interface NewsletterSubscriber {
  id: string;
  contact: string;
  language: Language;
  createdAt: string;
}

export interface PublicBootstrapData {
  categories: Category[];
  tours: TourPackage[];
  exchangeRateUzs: number;
}

export interface AdminDashboardData {
  categories: Category[];
  tours: TourPackage[];
  leads: Lead[];
  expenses: Expense[];
  staff: StaffUser[];
  auditLogs: AuditLog[];
  subscribers: NewsletterSubscriber[];
  exchangeRateUzs: number;
}
