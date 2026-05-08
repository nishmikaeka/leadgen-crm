// All TypeScript interfaces shared across the frontend

export type Role = "ADMIN" | "SALESPERSON";

export type LeadStatus =
  | "NEW"
  | "QUALIFIED"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export type LeadSource =
  | "WEBSITE"
  | "REFERRAL"
  | "LINKEDIN"
  | "COLD_EMAIL"
  | "OTHER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: LeadSource;
  dealValue: number;
  assignedToId: string;
  assignedTo?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  content: string;
  leadId: string;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  lostLeads: number;
  totalEstimatedDealValue: number;
  totalValueOfWonDeals: number;
  sourceDistribution: Record<string, number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
