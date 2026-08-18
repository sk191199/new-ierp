import { ERROR_CODES } from "@/constants/errorCodes";
import type { ApiPaginatedSuccess, ListQuery } from "@/models/common/api";
import { NormalizedApiError } from "@/models/common/api";
import type { Lead, LeadDraft } from "@/models/lead/lead";
import { resolveAiNextAction, resolveLeadConfidence } from "@/models/lead/lead";
import { leadRecords } from "@/pages/CRM/Leads/leads.mock";
import { mockLatency } from "@/configurations/api/delay";
import { applyListQuery, enrichLead } from "./leadMapper";

let localLeads = [...leadRecords];

export const listMockLeads = async (query: ListQuery): Promise<ApiPaginatedSuccess<Lead>> => {
  await mockLatency();
  return applyListQuery(localLeads, query);
};

export const getMockLead = async (id: string): Promise<Lead> => {
  await mockLatency();
  const match = localLeads.find((lead) => lead.id === id || lead.leadId === id);
  if (!match) {
    throw new NormalizedApiError(ERROR_CODES.NOT_FOUND, "Lead was not found.", 404);
  }
  return enrichLead(match);
};

export const createMockLead = async (draft: LeadDraft): Promise<Lead> => {
  await mockLatency();
  const nextNumber = 1000 + localLeads.length + 1;
  const created: Lead = {
    id: `ld-${nextNumber}`,
    leadId: `LD-${nextNumber}`,
    leadName: draft.contactPerson,
    companyName: draft.companyName,
    email: draft.email,
    phone: draft.phone,
    leadSource: draft.leadSource || "Website",
    status: draft.status,
    leadScore: 40,
    confidence: resolveLeadConfidence(40, draft.status),
    aiNextAction: resolveAiNextAction(40),
    assignedTo: draft.assignedTo || "Unassigned",
    createdDate: new Date().toISOString().slice(0, 10),
    industry: draft.industry,
    projectType: draft.projectType,
    website: draft.website,
    companySize: draft.companySize,
    annualRevenue: draft.annualRevenue,
    address: draft.address,
    subsidiary: draft.subsidiary,
    notes: draft.notes,
    followUpDate: draft.followUpDate,
    followUpType: draft.followUpType,
    followUpNotes: draft.followUpNotes,
  };

  localLeads = [created, ...localLeads];
  return created;
};

export const updateMockLead = async (id: string, draft: LeadDraft): Promise<Lead> => {
  await mockLatency();
  const index = localLeads.findIndex((lead) => lead.id === id);
  if (index < 0) {
    throw new NormalizedApiError(ERROR_CODES.NOT_FOUND, "Lead was not found.", 404);
  }

  const updated: Lead = {
    ...localLeads[index],
    leadName: draft.contactPerson,
    companyName: draft.companyName,
    email: draft.email,
    phone: draft.phone,
    leadSource: draft.leadSource,
    status: draft.status,
    assignedTo: draft.assignedTo,
    industry: draft.industry,
    projectType: draft.projectType,
    website: draft.website,
    companySize: draft.companySize,
    annualRevenue: draft.annualRevenue,
    address: draft.address,
    subsidiary: draft.subsidiary,
    subsidiaryId: draft.subsidiaryId,
    projectDescription: draft.projectDescription,
    notes: draft.notes,
    followUpDate: draft.followUpDate,
    followUpType: draft.followUpType,
    followUpNotes: draft.followUpNotes,
  };

  localLeads = localLeads.map((lead, leadIndex) => (leadIndex === index ? updated : lead));
  return updated;
};

export const saveMockLead = async (next: Lead): Promise<Lead> => {
  await mockLatency();
  const index = localLeads.findIndex((lead) => lead.id === next.id);
  if (index < 0) {
    throw new NormalizedApiError(ERROR_CODES.NOT_FOUND, "Lead was not found.", 404);
  }
  localLeads = localLeads.map((lead, leadIndex) => (leadIndex === index ? next : lead));
  return next;
};

export const deleteMockLead = async (id: string): Promise<void> => {
  await mockLatency();
  localLeads = localLeads.filter((lead) => lead.id !== id);
};

export const getLocalLeads = (): Lead[] => localLeads;
