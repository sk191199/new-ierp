import CloseIcon from "@mui/icons-material/Close";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Button, Stack } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/common/ErrorState/ErrorState";
import { LoadingState } from "@/components/common/LoadingState/LoadingState";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { ROUTES } from "@/constants/routes";
import { emptyLeadDraft, type LeadDraft, type LeadFollowUp } from "@/models/lead/lead";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import type { OpportunityFormData } from "../Opportunities/ConvertOpportunityDialog";
import { convertLeadToOpportunity } from "@/configurations/api/opportunityApi";
import { LEAD_FORM_ID, LeadForm } from "./LeadForm";
import { addFollowUp, createLead, getLead, updateFollowUp, updateLead } from "@/configurations/api/leadsApi";
import type { FollowUpEditData } from "./components/LeadFollowUpHistory";

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
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([]);

  const loadLead = useCallback(
    async (showLoading = true) => {
      if (mode !== "edit" || !id) {
        return;
      }

      if (showLoading) {
        setLoading(true);
      }

      try {
        const lead = await getLead(id);
        // Preserve backend history separately from LeadDraft so historical
        // follow-ups remain visible and cannot be overwritten by form edits.
        setFollowUps(lead.followUps ?? []);
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
          assignedToUserId: lead.assignedToUserId,
          website: lead.website ?? "",
          companySize: lead.companySize ?? "",
          annualRevenue: lead.annualRevenue ?? "",
          address: lead.address ?? "",
          subsidiary: lead.subsidiary ?? "",
          // API INTEGRATION: Preserve backend-only values through the existing edit form.
          subsidiaryId: lead.subsidiaryId,
          projectDescription: lead.projectDescription ?? "",
          notes: lead.notes ?? "",
          // New follow-up entry fields start empty in edit mode. Existing
          // follow-ups are displayed through the read-only history section.
          followUpDate: "",
          newFollowUpDate: "",
          followUpType: "",
          followUpStatus: "",
          followUpNotes: "",
          followUpFile: null,
        });
      } catch (cause) {
        setError(getErrorMessage(cause));
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [id, mode],
  );

  useEffect(() => {
    void loadLead();
  }, [loadLead]);

  const saveFollowUp = async (nextDraft: LeadDraft) => {
    if (!id) {
      throw new Error("A Lead ID is required to add a follow-up.");
    }

    // NEW FOLLOW-UP: This creates a child follow-up resource through the
    // dedicated POST endpoint; it does not modify the Lead update payload.
    try {
      await addFollowUp(id, nextDraft);
      dispatch(toastShown({ message: "Follow-up added.", severity: "success" }));

      // Refresh GET /leads/{id} so the backend-created record appears in the
      // read-only history without changing any existing historical record.
      await loadLead(false);
    } catch (cause) {
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
      throw cause;
    }
  };

  const saveExistingFollowUp = async (followUpId: string, data: FollowUpEditData) => {
    try {
      const existingFollowUp = followUps.find((followUp) => followUp.id === followUpId);
      if (!existingFollowUp?.followUpDate) {
        throw new Error("The original follow-up date is required to update this follow-up.");
      }

      const updated = await updateFollowUp(followUpId, {
        ...data,
        followUpDate: existingFollowUp.followUpDate,
      });
      setFollowUps((current) => current.map((followUp) => {
        if (followUp.id !== followUpId) {
          return followUp;
        }

        return {
          ...followUp,
          ...updated,
          id: followUp.id,
          activityType: updated.activityType ?? data.activityType,
          followUpDate: followUp.followUpDate,
          nextFollowUpDate: updated.nextFollowUpDate ?? data.nextFollowUpDate,
          remarks: updated.remarks ?? data.remarks,
          status: updated.status ?? data.status,
          createdBy: followUp.createdBy,
        };
      }));
      dispatch(toastShown({ message: "Follow-up updated.", severity: "success" }));
    } catch (cause) {
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
      throw cause;
    }
  };

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

  const convertOpportunity = async (data: OpportunityFormData) => {
    if (!id) {
      const cause = new Error("A Lead ID is required to convert to an opportunity.");
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
      throw cause;
    }

    setSubmitting(true);
    try {
      await convertLeadToOpportunity(id, data);
      dispatch(toastShown({ message: "Lead converted to opportunity.", severity: "success" }));
      await loadLead(false);
      navigate(ROUTES.crm.opportunities);
    } catch (cause) {
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
      throw cause;
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
      <LeadForm
        value={draft}
        mode={mode}
        existingFollowUps={followUps}
        submitting={submitting}
        onAddFollowUp={mode === "edit" ? saveFollowUp : undefined}
        onUpdateFollowUp={mode === "edit" ? saveExistingFollowUp : undefined}
        onConvertToOpportunity={convertOpportunity}
        onChange={setDraft}
        onSubmit={() => void save()}
      />
    </>
  );
};
