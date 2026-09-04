import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import { Button, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { ErrorState } from "@/components/common/ErrorState/ErrorState";
import { LoadingState } from "@/components/common/LoadingState/LoadingState";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { FieldGrid, SelectField, TextFieldControl } from "@/components/forms/fields";
import { FormSection } from "@/components/forms/FormSection";
import { ROUTES } from "@/constants/routes";
import type { Lead } from "@/models/lead/lead";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import { listLeads } from "@/configurations/api/leadsApi";
import { convertLeadToOpportunity } from "@/configurations/api/opportunityApi";
import { OPPORTUNITY_STAGES, type OpportunityFormData } from "./ConvertOpportunityDialog";
import { leadAssigneeOptions } from "../Leads/leadOptions";

const FORM_ID = "opportunity-create-form";
const currencyOptions = ["USD", "EUR", "GBP", "INR"].map((value) => ({ value, label: value }));

const emptyForm = (): OpportunityFormData => ({
  opportunityName: "",
  opportunityValue: "",
  currencyCode: "USD",
  stage: "new",
  probability: "",
  ownerUserId: "",
  competitors: "",
  nextSteps: "",
  closeReason: "",
  expectedCloseDate: "",
});

export const OpportunityCreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [leadSearch, setLeadSearch] = useState("");
  const [form, setForm] = useState<OpportunityFormData>(emptyForm);
  const [attempted, setAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadLeads = async () => {
      setLoading(true);
      try {
        const result = await listLeads({ page: 1, pageSize: 100, sortBy: "createdDate", sortDir: "desc" });
        if (active) {
          setLeads(result.data.filter((lead) => lead.status !== "Converted" && lead.status !== "Disqualified"));
        }
      } catch (cause) {
        if (active) {
          setError(getErrorMessage(cause));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadLeads();
    return () => {
      active = false;
    };
  }, []);

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId);
  const filteredLeads = useMemo(() => {
    const search = leadSearch.trim().toLowerCase();
    if (!search) return leads;
    return leads.filter((lead) =>
      [lead.leadId, lead.leadName, lead.companyName, lead.email].join(" ").toLowerCase().includes(search),
    );
  }, [leadSearch, leads]);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (!selectedLeadId) next.lead = "An existing lead is required.";
    if (!form.opportunityName?.trim()) next.opportunityName = "Opportunity name is required.";
    if (!form.opportunityValue.trim()) next.opportunityValue = "Opportunity value is required.";
    else if (Number.isNaN(Number(form.opportunityValue)) || Number(form.opportunityValue) < 0) next.opportunityValue = "Enter a valid non-negative value.";
    if (!form.currencyCode?.trim()) next.currencyCode = "Currency is required.";
    if (!form.stage.trim()) next.stage = "Stage is required.";
    if (form.stage !== "new" && !form.probability.trim()) next.probability = "Probability is required.";
    if (form.probability && (Number(form.probability) < 0 || Number(form.probability) > 100)) next.probability = "Probability must be between 0 and 100.";
    if (!form.expectedCloseDate.trim()) next.expectedCloseDate = "Expected close date is required.";
    if (!form.ownerUserId?.trim()) next.ownerUserId = "Owner is required.";
    if (form.stage === "closed lost" && !form.closeReason.trim()) next.closeReason = "Close reason is required for closed lost opportunities.";
    return next;
  }, [form, selectedLeadId]);

  const updateField = (field: keyof OpportunityFormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleLeadChange = (leadId: string) => {
    const lead = leads.find((item) => item.id === leadId);
    setSelectedLeadId(leadId);
    if (lead) {
      setForm((current) => ({
        ...current,
        opportunityName: lead.companyName,
        ownerUserId: lead.assignedTo,
      }));
    }
  };

  const handleStageChange = (stage: string) => {
    const selectedStage = OPPORTUNITY_STAGES.find((item) => item.value === stage);
    setForm((current) => ({
      ...current,
      stage,
      probability: selectedStage?.probability ?? "",
      closeReason: stage === "closed lost" ? current.closeReason : "",
    }));
  };

  const handleSubmit = () => {
    setAttempted(true);
    if (Object.keys(errors).length === 0) {
      setConfirmOpen(true);
    }
  };

  const confirmSubmit = async () => {
    if (!selectedLead || submitting) return;
    setSubmitting(true);
    try {
      await convertLeadToOpportunity(selectedLead.id, form);
      dispatch(toastShown({ message: "Opportunity created and lead converted.", severity: "success" }));
      setConfirmOpen(false);
      navigate(ROUTES.crm.opportunities);
    } catch (cause) {
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading available leads..." />;
  if (error) return <ErrorState message={error} onRetry={() => navigate(ROUTES.crm.opportunities)} />;

  return (
    <Stack gap={2.25} component="form" id={FORM_ID} onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
      <PageHeader
        eyebrow="TERMINAL · CRM & CUSTOMER ENGAGEMENT"
        title="New Opportunity"
        description="Create an opportunity from an existing lead and move it into the pipeline."
        actions={
          <Stack direction="row" gap={1}>
            <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(ROUTES.crm.opportunities)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<SaveOutlinedIcon />} type="submit" disabled={submitting}>
              Submit Transaction
            </Button>
          </Stack>
        }
      />

      <FormSection title="Lead Information" description="Select the source lead for this opportunity." collapsible defaultExpanded>
        <Stack gap={2}>
          <FieldGrid>
            <TextFieldControl name="lead-search" label="Search Existing Lead" value={leadSearch} onChange={setLeadSearch} placeholder="Search by lead ID, company, contact, or email" />
            <SelectField
              name="source-lead"
              label="Existing Lead"
              value={selectedLeadId}
              required
              error={attempted ? errors.lead : undefined}
              onChange={handleLeadChange}
              options={filteredLeads.map((lead) => ({ value: lead.id, label: `${lead.leadId} · ${lead.companyName} · ${lead.leadName}` }))}
              includeEmpty
              emptyLabel="Select a lead"
            />
          </FieldGrid>
          {selectedLead ? (
            <FieldGrid>
              <ReadOnlyField label="Company Name" value={selectedLead.companyName} />
              <ReadOnlyField label="Contact Person" value={selectedLead.leadName} />
              <ReadOnlyField label="Phone Number" value={selectedLead.phone} />
              <ReadOnlyField label="Email" value={selectedLead.email} />
              <ReadOnlyField label="Industry" value={selectedLead.industry} />
              <ReadOnlyField label="Project Type" value={selectedLead.projectType} />
              <ReadOnlyField label="Lead Source" value={selectedLead.leadSource} />
              <ReadOnlyField label="Status" value={selectedLead.status} />
              <ReadOnlyField label="Assigned To" value={selectedLead.assignedTo} />
              <ReadOnlyField label="Website" value={selectedLead.website} />
              <ReadOnlyField label="Company Size" value={selectedLead.companySize} />
              <ReadOnlyField label="Annual Revenue" value={selectedLead.annualRevenue} />
              <ReadOnlyField label="Address" value={selectedLead.address} multiline />
              <ReadOnlyField label="Subsidiary" value={selectedLead.subsidiary} />
              <ReadOnlyField label="Project Description" value={selectedLead.projectDescription} multiline />
              <ReadOnlyField label="Notes" value={selectedLead.notes} multiline />
            </FieldGrid>
          ) : (
            <Typography variant="body2" color="text.secondary">Select a lead to review its information before creating the opportunity.</Typography>
          )}
        </Stack>
      </FormSection>

      <FormSection title="Opportunity Information" description="Define the commercial opportunity and expected close." collapsible defaultExpanded>
        <FieldGrid>
          <TextFieldControl name="opportunity-name" label="Opportunity Name" required value={form.opportunityName ?? ""} onChange={(value) => updateField("opportunityName", value)} error={attempted ? errors.opportunityName : undefined} />
          <TextFieldControl name="opportunity-value" label="Opportunity Value" required type="number" value={form.opportunityValue} onChange={(value) => updateField("opportunityValue", value)} error={attempted ? errors.opportunityValue : undefined} />
          <SelectField name="opportunity-currency" label="Currency" required value={form.currencyCode ?? ""} onChange={(value) => updateField("currencyCode", value)} options={currencyOptions} error={attempted ? errors.currencyCode : undefined} />
          <SelectField name="opportunity-owner" label="Owner" required value={form.ownerUserId ?? ""} onChange={(value) => updateField("ownerUserId", value)} options={leadAssigneeOptions} includeEmpty error={attempted ? errors.ownerUserId : undefined} />
          <SelectField name="opportunity-stage" label="Stage" required value={form.stage} onChange={handleStageChange} options={OPPORTUNITY_STAGES} error={attempted ? errors.stage : undefined} />
          <TextFieldControl name="opportunity-probability" label="Probability (%)" type="number" value={form.probability} onChange={(value) => updateField("probability", value)} min="0" error={attempted ? errors.probability : undefined} />
          <TextFieldControl name="expected-close-date" label="Expected Close Date" required type="date" value={form.expectedCloseDate} onChange={(value) => updateField("expectedCloseDate", value)} error={attempted ? errors.expectedCloseDate : undefined} />
          <TextFieldControl name="competitors" label="Competitors" value={form.competitors} onChange={(value) => updateField("competitors", value)} multiline minRows={3} />
          <TextFieldControl name="next-steps" label="Next Steps" value={form.nextSteps} onChange={(value) => updateField("nextSteps", value)} multiline minRows={3} />
          {form.stage === "closed lost" ? <TextFieldControl name="close-reason" label="Close Reason" required value={form.closeReason} onChange={(value) => updateField("closeReason", value)} multiline minRows={3} error={attempted ? errors.closeReason : undefined} /> : null}
          <TextFieldControl name="opportunity-notes" label="Notes" value={form.notes ?? ""} onChange={(value) => updateField("notes", value)} multiline minRows={4} />
        </FieldGrid>
      </FormSection>

      <Stack direction={{ xs: "column", sm: "row" }} gap={1.25} sx={{ position: "sticky", bottom: 16, zIndex: 2, p: { xs: 1.25, md: 1.5 }, borderRadius: 2.5, bgcolor: "background.paper", boxShadow: (theme) => theme.shadows[6] }}>
        <Button type="button" variant="outlined" startIcon={<DeleteOutlineOutlinedIcon />} onClick={() => { setSelectedLeadId(""); setLeadSearch(""); setForm(emptyForm()); setAttempted(false); }} disabled={submitting} sx={{ flex: 1 }}>Discard Changes</Button>
        <Button type="button" variant="contained" startIcon={<SwapHorizOutlinedIcon />} onClick={handleSubmit} disabled={submitting} sx={{ flex: 1 }}>Submit Transaction</Button>
        <Button type="button" variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(ROUTES.crm.opportunities)} disabled={submitting} sx={{ flex: 1 }}>Close</Button>
      </Stack>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Opportunity"
        description={`Create an opportunity from ${selectedLead?.leadId ?? "the selected lead"} and mark the lead as converted?`}
        confirmLabel="Confirm & Submit"
        loading={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void confirmSubmit()}
      />
    </Stack>
  );
};

const ReadOnlyField = ({ label, value, multiline = false }: { label: string; value?: string | null; multiline?: boolean }) => (
  <TextFieldControl name={`lead-${label.toLowerCase().replaceAll(" ", "-")}`} label={label} value={value ?? ""} onChange={() => undefined} disabled multiline={multiline} minRows={multiline ? 3 : undefined} />
);
