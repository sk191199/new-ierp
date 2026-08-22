import type { LeadStatus } from "@/constants/statuses";

// API INTEGRATION: Typed follow-up attachments returned by the lead-by-id API.
export interface LeadAttachment {
  fileName?: string;
  filePath?: string;
  contentType?: string;
  fileSize?: number;
  createdAt?: string;
}

// API INTEGRATION: Typed follow-up history returned with a lead detail response.
export interface LeadFollowUp {
  id?: string;
  activityType?: string;
  followUpDate?: string;
  nextFollowUpDate?: string;
  remarks?: string;
  status?: string;
  createdAt?: string;
  createdBy?: string;
  attachments?: LeadAttachment[];
}

export interface Lead {
  id: string;
  leadId: string;
  // API INTEGRATION: Marks rows normalized from backend leadNumber values.
  isBackendLead?: boolean;
  leadName: string;
  companyName: string;
  email: string;
  phone: string;
  leadSource: string;
  status: LeadStatus;
  leadScore: number;
  assignedTo: string;
  // API INTEGRATION: Retains the backend assigned-user UUID while the form
  // displays the existing human-readable assignee option.
  assignedToUserId?: string;
  createdDate: string;
  confidence?: number;
  aiNextAction?: string;
  industry?: string;
  projectType?: string;
  website?: string;
  companySize?: string;
  annualRevenue?: string;
  address?: string;
  subsidiary?: string;
  // API INTEGRATION: Retains the backend subsidiary UUID for update requests.
  subsidiaryId?: string;
  notes?: string;
  // API INTEGRATION: Additional lead-detail fields preserved for the view page.
  projectDescription?: string;
  createdBy?: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
  version?: number;
  followUps?: LeadFollowUp[];
  // The backend does not return leadScore; this distinguishes compatibility
  // fallback data from a real score so the UI can render an em dash.
  leadScoreAvailable?: boolean;
  followUpDate?: string;
  followUpType?: string;
  followUpStatus?: string;
  followUpNotes?: string;
}

export interface LeadDraft {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  industry: string;
  projectType: string;
  leadSource: string;
  status: LeadStatus;
  assignedTo: string;
  // API INTEGRATION: Keeps the backend UUID available for update requests.
  assignedToUserId?: string;
  website: string;
  companySize: string;
  annualRevenue: string;
  address: string;
  subsidiary: string;
  // API INTEGRATION: Preserves the loaded subsidiary UUID without exposing a new UI field.
  subsidiaryId?: string;
  projectDescription: string;
  notes: string;
  followUpDate: string;
  newFollowUpDate: string;
  followUpType: string;
  followUpStatus: string;
  followUpNotes: string;
  followUpFile: File | null;
}

export const resolveLeadConfidence = (score: number, status: LeadStatus): number =>
  Math.min(99, Math.max(20, score + (status === "Qualified" ? 4 : status === "Disqualified" ? -8 : 0)));

export const formatLeadDisplayId = (leadId: string): string => {
  const digits = leadId.replace(/\D/g, "").slice(-3);
  return `LID-${digits.padStart(3, "0")}`;
};

export const resolveAiNextAction = (score: number): string => {
  if (score >= 80) {
    return "START ENGAGEMENT";
  }
  if (score >= 60) {
    return "SCHEDULE DEMO";
  }
  return "INITIAL OUTREACH";
};

export const emptyLeadDraft = (): LeadDraft => ({
  companyName: "",
  contactPerson: "",
  phone: "",
  email: "",
  industry: "",
  projectType: "",
  leadSource: "",
  status: "New",
  assignedTo: "",
  website: "",
  companySize: "",
  annualRevenue: "",
  address: "",
  subsidiary: "",
  projectDescription: "",
  notes: "",
  followUpDate: "",
  newFollowUpDate: "",
  followUpType: "",
  followUpStatus: "",
  followUpNotes: "",
  followUpFile: null,
});
