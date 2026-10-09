export type UserRole = "buyer" | "seller" | "support" | "admin";

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string | null;
  phone: string | null;
  wilayaId: number | null;
  language: "ar" | "fr";
  createdAt: string;
}

export interface Seller {
  id: string;
  slug: string;
  nameAr: string;
  nameFr: string;
  wilayaId: number;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
  descAr: string;
  descFr: string;
  status?: "pending" | "active" | "suspended" | "rejected";
  planCode?: "free" | "starter" | "pro" | "business";
}

export interface Plan {
  code: "free" | "starter" | "pro" | "business";
  nameAr: string;
  nameFr: string;
  monthlyPriceDzd: number;
  maxProducts: number | null;
  commissionPercent: number;
  featuresAr: string[];
  featuresFr: string[];
}

export interface Product {
  id: string;
  sellerId: string;
  categoryId: number;
  titleAr: string;
  titleFr: string;
  descAr: string;
  descFr: string;
  priceDzd: number;
  compareAtPriceDzd?: number;
  stock: number;
  weightGrams: number;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string; // ISO date
  status?: "draft" | "active" | "hidden" | "reported";
}

export interface SupportTicket {
  id: string;
  requesterId: string;
  subject: string;
  type: "order" | "return" | "payment" | "seller_complaint" | "other";
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "pending" | "resolved" | "closed";
  createdAt: string;
}
