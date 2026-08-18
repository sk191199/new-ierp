import type { ApiPaginatedSuccess, ListQuery } from "@/models/common/api";
import type { Lead, LeadAttachment, LeadFollowUp } from "@/models/lead/lead";
import { resolveAiNextAction, resolveLeadConfidence } from "@/models/lead/lead";

export type BackendFollowUp = {
  id?: string;
  activityType?: string;
  followUpDate?: string;
  nextFollowUpDate?: string;
  status?: string;
  remarks?: string;
  createdAt?: string;
  createdBy?: string;
  attachments?: BackendAttachment[];
};

type BackendAttachment = {
  fileName?: string;
  filePath?: string;
  contentType?: string;
  fileSize?: number;
  createdAt?: string;
};

export type BackendLead = {
  id: string;
  leadNumber: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  industry?: string;
  address?: string;
  annualRevenue?: number;
  assignedToUserId?: string;
  companySize?: string;
  leadSource: string;
  projectType?: string;
  projectDescription?: string;
  status: Lead["status"];
  subsidiary?: string;
  subsidiaryId?: string;
  website?: string;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  version?: number;
  followUps?: BackendFollowUp[];
};

export type BackendLeadsResponse = {
  success: true;
  data: BackendLead[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  message?: string | null;
};

export const enrichLead = (lead: Lead): Lead => ({
  ...lead,
  confidence: lead.confidence ?? resolveLeadConfidence(lead.leadScore, lead.status),
  aiNextAction: lead.aiNextAction ?? resolveAiNextAction(lead.leadScore),
});

// Convert backend lead fields into the model used by the existing pages.
export const mapBackendLead = (lead: BackendLead): Lead => {
  const followUp = lead.followUps?.[0];
  const followUps: LeadFollowUp[] | undefined = lead.followUps?.map((item) => ({
    id: item.id,
    activityType: item.activityType,
    followUpDate: item.followUpDate,
    nextFollowUpDate: item.nextFollowUpDate,
    remarks: item.remarks,
    status: item.status,
    createdAt: item.createdAt,
    createdBy: item.createdBy,
    attachments: item.attachments?.map(
      (attachment): LeadAttachment => ({
        fileName: attachment.fileName,
        filePath: attachment.filePath,
        contentType: attachment.contentType,
        fileSize: attachment.fileSize,
        createdAt: attachment.createdAt,
      }),
    ),
  }));

  return enrichLead({
    id: lead.id,
    leadId: lead.leadNumber,
    isBackendLead: true,
    leadName: lead.contactPerson,
    companyName: lead.companyName,
    email: lead.email,
    phone: lead.phone,
    leadSource: lead.leadSource,
    status: lead.status,
    leadScore: 0,
    leadScoreAvailable: false,
    assignedTo: lead.assignedToUserId ?? "",
    createdDate: lead.createdAt?.slice(0, 10) ?? "",
    industry: lead.industry,
    projectType: lead.projectType,
    website: lead.website,
    companySize: lead.companySize,
    annualRevenue: lead.annualRevenue === undefined ? undefined : String(lead.annualRevenue),
    address: lead.address,
    subsidiary: lead.subsidiary,
    subsidiaryId: lead.subsidiaryId,
    notes: lead.notes,
    projectDescription: lead.projectDescription,
    createdBy: lead.createdBy,
    updatedAt: lead.updatedAt,
    updatedBy: lead.updatedBy,
    version: lead.version,
    followUps,
    followUpDate: followUp?.followUpDate,
    followUpType: followUp?.activityType,
    followUpStatus: followUp?.status,
    followUpNotes: followUp?.remarks,
  });
};

export const applyListQuery = (items: Lead[], query: ListQuery): ApiPaginatedSuccess<Lead> => {
  const search = query.search?.trim().toLowerCase() ?? "";
  const status = String(query.status ?? "");
  const filtered = items.filter((lead) => {
    const matchesSearch =
      !search ||
      [lead.leadId, lead.leadName, lead.companyName, lead.email, lead.assignedTo, lead.status]
        .join(" ")
        .toLowerCase()
        .includes(search);
    const matchesStatus = !status || lead.status === status;
    return matchesSearch && matchesStatus;
  });

  const sortBy = query.sortBy as keyof Lead | undefined;
  const sorted = [...filtered].sort((a, b) => {
    if (!sortBy) {
      return 0;
    }
    const left = String(a[sortBy] ?? "");
    const right = String(b[sortBy] ?? "");
    const result = left.localeCompare(right, undefined, { numeric: true });
    return query.sortDir === "desc" ? -result : result;
  });

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const data = sorted.slice(start, start + pageSize).map(enrichLead);

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      total: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / pageSize)),
    },
  };
};
