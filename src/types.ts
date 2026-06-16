// Core domain types for the Commercial Property Intelligence Platform

// ── Auth ─────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  color: string;
  firmId?: string;
  firmName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  firmName?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: AuthUser;
}

// ── Domain types ─────────────────────────────────────────

export type PropertyType =
  | "Office"
  | "Retail"
  | "Industrial"
  | "Multifamily"
  | "Mixed-Use"
  | "Medical"
  | "Flex"
  | "Land";

export type PropertyStatus =
  | "Active"
  | "Off-Market"
  | "Under Contract"
  | "Sold"
  | "Prospect";

export type BuildingClass = "Class A" | "Class B" | "Class C" | "N/A";

export interface BuildingIntelligence {
  parkingRatio: string;
  ceilingHeight: string;
  hvac: string;
  yearRenovated?: number;
  ownershipType: string;
  zoning: string;
  lotSize: string;
  electric: string;
  energyStar: boolean;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: PropertyType;
  status: PropertyStatus;
  classType: BuildingClass;
  yearBuilt: number;
  totalSF: number;
  stories: number;
  askingRentPSF: number;
  salePrice: number;
  description: string;
  amenities: string[];
  ownerId: string | null;
  occupancyPct: number;
  availSF: number;
  dateAdded: string;
  lastUpdated: string;
  tags: string[];
  imageUrl?: string;
  building: BuildingIntelligence;
  notes: string;
  internalNotes: string;
  sharedWith: string[];
  isStarred: boolean;
}

export type VacancyStatus =
  | "Available"
  | "Leased"
  | "Hold"
  | "Negotiating";

export interface Vacancy {
  id: string;
  propertyId: string;
  suite: string;
  floor: string;
  sf: number;
  askingRentPSF: number;
  availableDate: string;
  type: "Direct" | "Sublease";
  status: VacancyStatus;
  divisible: boolean;
  notes: string;
}

export type ContactType =
  | "Owner"
  | "Broker"
  | "Tenant"
  | "Investor"
  | "Property Manager";

export interface Contact {
  id: string;
  name: string;
  company: string;
  title: string;
  type: ContactType;
  email: string;
  phone: string;
  linkedin?: string;
  propertyIds: string[];
  notes: string;
  dateAdded: string;
  lastContacted?: string;
  isStarred: boolean;
}

export type DealStage =
  | "Sourcing"
  | "Qualified"
  | "Touring"
  | "LOI"
  | "Under Contract"
  | "Closed"
  | "Lost";

export type DealType = "Lease" | "Sale" | "Acquisition" | "Disposition";

export interface KeyDate {
  label: string;
  date: string;
}

export interface Deal {
  id: string;
  title: string;
  propertyId: string | null;
  type: DealType;
  stage: DealStage;
  value: number;
  probability: number;
  assignedTo: string;
  contactIds: string[];
  keyDates: KeyDate[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  expectedClose: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  color: string;
}

export type ActivityType =
  | "property"
  | "contact"
  | "deal"
  | "vacancy"
  | "share"
  | "note";

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: ActivityType;
  description: string;
  user: string;
}

export interface AppData {
  properties: Property[];
  contacts: Contact[];
  vacancies: Vacancy[];
  deals: Deal[];
  team: TeamMember[];
  activity: ActivityLog[];
}
