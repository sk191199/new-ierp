import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Button, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/common/ErrorState/ErrorState";
import { LoadingState } from "@/components/common/LoadingState/LoadingState";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { ROUTES } from "@/constants/routes";
import { emptyLeadDraft, type LeadDraft } from "@/models/lead/lead";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import { LEAD_FORM_ID, LeadForm } from "./LeadForm";
import { createLead, getLead, updateLead } from "@/configurations/api/leadsApi";

interface LeadEditorPageProps {
  mode: "create" | "edit";
}

export const LeadEditorPage = ({ mode }: LeadEditorPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState<LeadDraft>(emptyLeadDraft());
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "edit" || !id) {
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const lead = await getLead(id);
        setDraft({
          companyName: lead.companyName,
          contactPerson: lead.leadName,
          phone: lead.phone,
          email: lead.email,
          industry: lead.industry ?? "",
          projectType: lead.projectType ?? "",
          leadSource: lead.leadSource,
          status: lead.status,
          assignedTo: lead.assignedTo,
          website: lead.website ?? "",
          companySize: lead.companySize ?? "",
          annualRevenue: lead.annualRevenue ?? "",
          address: lead.address ?? "",
          subsidiary: lead.subsidiary ?? "",
          // API INTEGRATION: Preserve backend-only values through the existing edit form.
          subsidiaryId: lead.subsidiaryId,
          projectDescription: lead.projectDescription ?? "",
          notes: lead.notes ?? "",
          followUpDate: lead.followUpDate ?? "",
          newFollowUpDate: "",
          followUpType: lead.followUpType ?? "",
          followUpStatus: lead.followUpStatus ?? "",
          followUpNotes: lead.followUpNotes ?? "",
          followUpFile: null,
        });
      } catch (cause) {
        setError(getErrorMessage(cause));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, mode]);

  const save = async () => {
    setSubmitting(true);
    try {
      const saved = mode === "create" ? await createLead(draft) : await updateLead(id ?? "", draft);
      dispatch(toastShown({ message: `${saved.leadId} saved.`, severity: "success" }));
      navigate(ROUTES.crm.leads);
    } catch (cause) {
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading lead…" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => navigate(ROUTES.crm.leads)} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="TERMINAL · CRM & CUSTOMER ENGAGEMENT"
        title="Contact Information"
        uppercase
        actions={
          <Stack direction="row" gap={1}>
            <Button
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              type="submit"
              form={LEAD_FORM_ID}
              disabled={submitting}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={() => navigate(ROUTES.crm.leads)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </Stack>
        }
      />
      <LeadForm value={draft} submitting={submitting} onChange={setDraft} onSubmit={() => void save()} />
    </>
  );
};
