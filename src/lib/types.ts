export interface LineItem {
  label: string;
  year1: number | null;
  year0: number | null;
}

export interface ExtractionResult {
  businessName: string;
  year1Label: string;
  year0Label: string;
  revenue: LineItem[];
  cogs: LineItem[];
  expenses: LineItem[];
  totalRevenue: { year1: number | null; year0: number | null };
  totalCogs: { year1: number | null; year0: number | null };
  grossProfit: { year1: number | null; year0: number | null };
  totalExpenses: { year1: number | null; year0: number | null };
  netIncome: { year1: number | null; year0: number | null };
}

export interface FolderNode {
  name: string;
  type: "folder";
  children?: FolderNode[];
}

export interface FolderRequest {
  businessName: string;
  location: string;
  businessType: "sale-of-business" | "residential";
  mode: "preview" | "live";
  shareWith?: string;
}

export interface FolderResult {
  tree: FolderNode;
  driveUrl?: string;
  mode: "preview" | "live";
}

export interface ClientRecord {
  id: string;
  clientName: string;
  clientEmail: string;
  buyerStage: "Initial Inquiry" | "Has Initial Information" | "Full Info" | "Ready to Rate";
  businessesOfInquiry: string;
  dateOfLastContact: string;
  notes: string;
  documentStatus: "red" | "yellow" | "green";
  daysOnMarket: number;
  missingDocs: string[];
}

export interface QuestionData {
  id: number;
  question: string;
  answer: string;
  demoLink?: string;
  demoLabel?: string;
}

export interface TimelinePhase {
  phase: number;
  title: string;
  weeks: string;
  tasks: string[];
  status: "upcoming" | "current" | "completed";
}
