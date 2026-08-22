export interface OpportunityFollowUp {
  id: string;
  opportunityId: string;
  activityType: string;
  followUpDate: string;
  nextFollowUpDate: string;
  remarks: string;
  status: string;
  createdAt: string;
  createdBy: string;
}

export interface Opportunity {
  id: string;
  opportunityNumber: string;
  name: string;
  leadId: string;
  leadNumber: string;
  subsidiaryId: string | null;
  customerId: string | null;
  stage: string;
  opportunityValue: number;
  currencyCode: string;
  expectedCloseDate: string | null;
  ownerUserId: string | null;
  status: string;
  probability: number;
  computations: string | null;
  notes: string | null;
  closedReason: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  version: number;
  followUps: OpportunityFollowUp[];
}
