import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/common/ErrorState/ErrorState";
import { LoadingState } from "@/components/common/LoadingState/LoadingState";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { SelectField } from "@/components/forms/fields";
import { ROUTES } from "@/constants/routes";
import type { Opportunity } from "@/models/opportunity/opportunity";
import { getOpportunityById, updateOpportunity, type OpportunityUpdate } from "@/configurations/api/opportunityApi";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";

const stageOptions = [
  { value: "new", label: "New" },
  { value: "qualification", label: "Qualification" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed won", label: "Closed Won" },
  { value: "closed lost", label: "Closed Lost" },
];

export const OpportunityEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [form, setForm] = useState<OpportunityUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError("An opportunity ID is required.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await getOpportunityById(id);
      setOpportunity(result);
      setForm({
        name: result.name,
        stage: result.stage,
        opportunityValue: result.opportunityValue,
        probability: result.probability,
        expectedCloseDate: result.expectedCloseDate,
        notes: result.notes,
      });
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateField = <K extends keyof OpportunityUpdate>(field: K, value: OpportunityUpdate[K]) => {
    setForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const save = async () => {
    if (!id || !form) return;
    setSaving(true);
    try {
      const saved = await updateOpportunity(id, form);
      dispatch(toastShown({ message: `${saved.opportunityNumber} saved.`, severity: "success" }));
      navigate(ROUTES.crm.opportunityView(id));
    } catch (cause) {
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading opportunity..." />;
  if (error || !opportunity || !form) {
    return <ErrorState message={error ?? "Opportunity was not found."} onRetry={() => void load()} />;
  }

  return (
    <Stack gap={2.25}>
      <PageHeader
        eyebrow={`CRM / OPPORTUNITIES / ${opportunity.opportunityNumber}`}
        title="Edit Opportunity"
        description="Update the opportunity details and save the transaction."
        actions={
          <Stack direction="row" gap={1}>
            <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(ROUTES.crm.opportunityView(opportunity.id))}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<SaveOutlinedIcon />} disabled={saving} onClick={() => void save()}>
              {saving ? "Saving..." : "Save Opportunity"}
            </Button>
          </Stack>
        }
      />
      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 }, "&:last-child": { pb: { xs: 2, md: 3 } } }}>
          <Stack gap={2.25}>
            <Typography variant="h3" sx={{ fontSize: "1rem", textTransform: "uppercase" }}>Primary Information</Typography>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
              <TextField label="Opportunity ID" value={opportunity.opportunityNumber} disabled />
              <TextField label="Lead ID" value={opportunity.leadNumber || "-"} disabled />
              <TextField label="Opportunity Name / Company" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
              <TextField label="Deal Value" type="number" value={form.opportunityValue} onChange={(event) => updateField("opportunityValue", Number(event.target.value) || 0)} required />
              <SelectField name="opportunity-stage" label="Stage" value={form.stage} onChange={(value) => updateField("stage", value)} options={stageOptions} />
              <TextField label="Win Probability (%)" type="number" value={form.probability} onChange={(event) => updateField("probability", Number(event.target.value) || 0)} inputProps={{ min: 0, max: 100 }} />
              <TextField label="Expected Close" type="date" value={form.expectedCloseDate ?? ""} onChange={(event) => updateField("expectedCloseDate", event.target.value || null)} InputLabelProps={{ shrink: true }} />
            </Box>
            <TextField label="Notes" multiline minRows={5} value={form.notes ?? ""} onChange={(event) => updateField("notes", event.target.value || null)} fullWidth />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
