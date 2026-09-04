export interface InteriorComponent {
  id: string;
  name: string;
  area: number; // in Sft
  width: number; // in Inches
  height: number; // in Inches
  enabled: boolean;
  category?: string; // e.g. "Wardrobes & Storage", "Dressers & Vanity", "Feature Walls & TV", "Beds & Paneling", "Kitchen & Cabinetry"
  customRate?: number;
  carcass?: string;
  shutter?: string;
  finish?: string;
  hardware?: string;
  notes?: string;
}

// Backwards-compatibility alias
export type MillworkComponent = InteriorComponent;

export interface RoomConfig {
  id: string;
  name: string;
  subtitle: string;
  tier: "Bespoke Tier" | "Modern Luxury Tier" | "Signature Penthouse Tier";
  components: InteriorComponent[];
  carcass: string;
  shutter: string;
  finish: string;
  hardware: string;
  aiSuggestedRate: number;
  overrideRate: number | null;
  overrideTotalPrice: number | null;
  aiRationale?: string;
  durabilityScore?: number;
}

export interface MaterialOption {
  id: string;
  name: string;
  category: "carcass" | "shutter" | "finish" | "hardware";
  brand?: string;
  priceDelta: number;
  durability: number;
  warrantyYears: number;
  description: string;
  badges: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  location: string;
  areaSft: number;
  completionYear: string;
  image: string;
  budgetFormatted: string;
  budgetNumeric?: number;
  clientName?: string;
  clientContact?: string;
  status?: "Active" | "In Design" | "Under Fabrication" | "Completed";
  keySpecs: string[];
  materialsUsed: string[];
  architectId?: string;
  architectName?: string;
  architectFirm?: string;
}

export interface ArchitectEntry {
  id: string;
  name: string;
  firm: string;
  role: string;
  phone?: string;
  email?: string;
  city?: string;
  coaNumber?: string;
  projectId?: string;
  projectName?: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  stage: string;
  title: string;
  date: string;
  status: "completed" | "in_progress" | "pending";
  completionPercent: number;
  deliverables: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "vendor" | "approval" | "system";
}
