import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Button, Stack } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { FieldGrid, SelectField, TextFieldControl } from "@/components/forms/fields";
import { FormSection } from "@/components/forms/FormSection";
import { ROUTES } from "@/constants/routes";
import { emptyLeadDraft, type LeadDraft } from "@/models/lead/lead";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import { createLead } from "@/configurations/api/leadsApi";
import { convertLeadToOpportunity } from "@/configurations/api/opportunityApi";
import { LEAD_FORM_ID, LeadForm } from "../Leads/LeadForm";
import { OPPORTUNITY_STAGES, type OpportunityFormData } from "./ConvertOpportunityDialog";
import { leadAssigneeOptions } from "../Leads/leadOptions";

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
  const [leadDraft, setLeadDraft] = useState<LeadDraft>(() => ({ ...emptyLeadDraft(), status: "Converted" }));
  const [form, setForm] = useState<OpportunityFormData>(emptyForm);
  const [attempted, setAttempted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
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
  }, [form]);

  const updateField = (field: keyof OpportunityFormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
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

  const confirmSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const savedLead = await createLead({ ...leadDraft, status: "Converted" });
      await convertLeadToOpportunity(savedLead.id, form);
      dispatch(toastShown({ message: "Opportunity created and lead converted.", severity: "success" }));
      setConfirmOpen(false);
      navigate(ROUTES.crm.opportunities);
    } catch (cause) {
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack gap={2.25}>
      <PageHeader
        eyebrow="TERMINAL · CRM & CUSTOMER ENGAGEMENT"
        title="New Opportunity"
        description="Create a converted lead and its opportunity in one transaction."
        actions={
          <Stack direction="row" gap={1}>
            <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(ROUTES.crm.opportunities)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<SaveOutlinedIcon />} type="submit" form={LEAD_FORM_ID} disabled={submitting}>
              Submit Transaction
            </Button>
          </Stack>
        }
      />
      <LeadForm
        value={leadDraft}
        mode="create"
        submitting={submitting}
        onChange={setLeadDraft}
        onSubmit={() => {
          setAttempted(true);
          if (Object.keys(errors).length === 0) setConfirmOpen(true);
        }}
        onClose={() => navigate(ROUTES.crm.opportunities)}
        hideConvertToOpportunity
        extraContent={<OpportunityInformation form={form} attempted={attempted} errors={errors} updateField={updateField} handleStageChange={handleStageChange} />}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Opportunity"
        description={`Create a converted lead for ${leadDraft.companyName || "this customer"} and link the new opportunity to it?`}
        confirmLabel="Confirm & Submit"
        loading={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void confirmSubmit()}
      />
    </Stack>
  );
};

const OpportunityInformation = ({ form, attempted, errors, updateField, handleStageChange }: { form: OpportunityFormData; attempted: boolean; errors: Record<string, string>; updateField: (field: keyof OpportunityFormData, value: string) => void; handleStageChange: (stage: string) => void }) => (
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
);
