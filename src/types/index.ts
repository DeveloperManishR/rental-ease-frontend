/* ──────────────────────────────────────────────────────
   Shared Types – aligned with backend Mongoose models
   ────────────────────────────────────────────────────── */

// ─── API envelope ───
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Pagination (mongoose-paginate-v2) ───
export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// ─── User ───
export type UserRole = "admin" | "owner" | "tenant";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Property ───
export type PropertyStatus = "draft" | "review" | "published";

export interface Property {
  _id: string;
  ownerId: User | string;
  title: string;
  description: string;
  location: string;
  city: string;
  rent: number;
  deposit: number;
  amenities: string[];
  rules: string[];
  images: string[];
  availableFrom?: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Visit Request ───
export type VisitStatus = "requested" | "scheduled" | "visited" | "decision";

export interface VisitRequest {
  _id: string;
  tenantId: User | string;
  propertyId: Property | string;
  preferredDate: string;
  status: VisitStatus;
  ownerNote: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Move-In ───
export interface MoveInDocument {
  name: string;
  fileUrl: string;
}

export interface MoveIn {
  _id: string;
  tenantId: User | string;
  propertyId: Property | string;
  documents: MoveInDocument[];
  agreementAccepted: boolean;
  inventoryList: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Ticket ───
export interface TicketMessage {
  senderId: User | string;
  message: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  tenantId: User | string;
  title: string;
  messages: TicketMessage[];
  status: "open" | "closed";
  createdAt: string;
  updatedAt: string;
}

// ─── Admin Dashboard ───
export interface DashboardStats {
  totalTenants: number;
  totalOwners: number;
  totalProperties: number;
  totalVisitRequests: number;
  totalTickets: number;
  openTickets: number;
  propertyStats: {
    draft: number;
    review: number;
    published: number;
  };
  pendingReview: Property[];
}

// ─── Auth payloads ───
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "tenant" | "owner";
  phone?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
