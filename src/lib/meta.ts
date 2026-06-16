import type { Tone } from "../components/ui";
import type {
  BuildingClass,
  ContactType,
  DealStage,
  DealType,
  PropertyStatus,
  PropertyType,
  VacancyStatus,
} from "../types";

export const propertyStatusTone: Record<PropertyStatus, Tone> = {
  Active: "emerald",
  "Off-Market": "violet",
  "Under Contract": "amber",
  Sold: "slate",
  Prospect: "blue",
};

export const dealStageTone: Record<DealStage, Tone> = {
  Sourcing: "slate",
  Qualified: "blue",
  Touring: "cyan",
  LOI: "violet",
  "Under Contract": "amber",
  Closed: "emerald",
  Lost: "rose",
};

export const vacancyStatusTone: Record<VacancyStatus, Tone> = {
  Available: "emerald",
  Negotiating: "amber",
  Hold: "slate",
  Leased: "blue",
};

export const contactTypeTone: Record<ContactType, Tone> = {
  Owner: "blue",
  Broker: "violet",
  Tenant: "teal",
  Investor: "amber",
  "Property Manager": "cyan",
};

export const dealTypeTone: Record<DealType, Tone> = {
  Lease: "blue",
  Sale: "amber",
  Acquisition: "emerald",
  Disposition: "violet",
};

export const dealStages: DealStage[] = [
  "Sourcing",
  "Qualified",
  "Touring",
  "LOI",
  "Under Contract",
  "Closed",
  "Lost",
];

export const propertyTypes: PropertyType[] = [
  "Office",
  "Retail",
  "Industrial",
  "Multifamily",
  "Mixed-Use",
  "Medical",
  "Flex",
  "Land",
];

export const propertyStatuses: PropertyStatus[] = [
  "Active",
  "Off-Market",
  "Under Contract",
  "Sold",
  "Prospect",
];

export const buildingClasses: BuildingClass[] = [
  "Class A",
  "Class B",
  "Class C",
  "N/A",
];

export const contactTypes: ContactType[] = [
  "Owner",
  "Broker",
  "Tenant",
  "Investor",
  "Property Manager",
];

export const propertyTypeGradient: Record<PropertyType, string> = {
  Office: "from-blue-500 to-indigo-600",
  Retail: "from-rose-500 to-orange-500",
  Industrial: "from-amber-500 to-yellow-600",
  Multifamily: "from-emerald-500 to-teal-600",
  "Mixed-Use": "from-violet-500 to-fuchsia-600",
  Medical: "from-cyan-500 to-blue-600",
  Flex: "from-teal-500 to-emerald-600",
  Land: "from-lime-500 to-green-600",
};
