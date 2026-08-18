import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";

//import opportunitypopup
import ConvertOpportunityDialog, {
  type OpportunityFormData,
} from "../Opportunities/ConvertOpportunityDialog";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useMemo, useState } from "react";

import {
  CreatableSelectField,
  FieldGrid,
  SelectField,
  TextFieldControl,
} from "@/components/forms/fields";

import { FormSection } from "@/components/forms/FormSection";

import type { LeadStatus } from "@/constants/statuses";
import { emptyLeadDraft, type LeadDraft } from "@/models/lead/lead";

import { isBlank, isValidEmail } from "@/utils/validators/required";

import {
  addCustomIndustry,
  getLeadIndustryOptions,
  leadAssigneeOptions,
  leadFollowUpTypeOptions,
  leadFollowUpStatus,
  leadProjectOptions,
  leadRevenueOptions,
  leadSizeOptions,
  leadSourceOptions,
  leadStatusOptions,
  leadSubsidiaryOptions,
} from "./leadOptions";

export const LEAD_FORM_ID = "lead-editor-form";

interface LeadFormProps {
  value: LeadDraft;
  submitting?: boolean;
  onChange: (value: LeadDraft) => void;
  onSubmit: () => void;
  onClose?: () => void;
  onReset?: () => void;
}

export const LeadForm = ({
  value,
  submitting,
  onChange,
  onSubmit,
  onClose,
  onReset,
}: LeadFormProps) => {
  const [attempted, setAttempted] = useState(false);

  // ============================================================
  // DIALOG STATES
  // ============================================================

  // Convert Lead -> Opportunity dialog
  const [conversionOpen, setConversionOpen] = useState(false);

  // Discard changes confirmation dialog
  const [discardOpen, setDiscardOpen] = useState(false);

  // NEW:
  // Save / Submit confirmation dialog
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  // ============================================================
  // INDUSTRY OPTIONS
  // ============================================================

  const [industryOptions, setIndustryOptions] = useState(getLeadIndustryOptions);

  // ============================================================
  // CURRENT DATE
  // ============================================================

  /**
   * Returns today's date in YYYY-MM-DD format.
   *
   * Browser local date is used instead of UTC.
   */
  const getCurrentDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const currentDate = getCurrentDate();

  // ============================================================
  // FORM VALIDATION
  // ============================================================

  const errors = useMemo(() => {
    const next: Partial<Record<keyof LeadDraft, string>> = {};

    // ============================================================
    // PRIMARY INFORMATION VALIDATION
    // ============================================================

    if (isBlank(value.companyName)) {
      next.companyName = "Company name is required.";
    }

    if (isBlank(value.contactPerson)) {
      next.contactPerson = "Contact person is required.";
    }

    if (isBlank(value.phone)) {
      next.phone = "Phone number is required.";
    }

    if (isBlank(value.email) || !isValidEmail(value.email)) {
      next.email = "A valid email is required.";
    }

    if (isBlank(value.address)) {
      next.address = "Address is required.";
    }

    // ============================================================
    // FOLLOW-UP DATE VALIDATION
    // Follow-up Date must always be today's date.
    // ============================================================

    if (value.followUpDate && value.followUpDate !== currentDate) {
      next.followUpDate = "Follow-up date must be today's date.";
    }

    // ============================================================
    // NEW FOLLOW-UP DATE VALIDATION
    // Today or future dates are allowed.
    // Past dates are not allowed.
    // ============================================================

    if (value.newFollowUpDate && value.newFollowUpDate < currentDate) {
      next.newFollowUpDate = "New follow-up date cannot be before today.";
    }

    return next;
  }, [value, currentDate]);

  // ============================================================
  // UPDATE FORM VALUE
  // ============================================================

  const patch = (key: keyof LeadDraft, next: string) =>
    onChange({
      ...value,
      [key]: next,
    });

  // ============================================================
  // DISCARD CHANGES
  // ============================================================

  const discardChanges = () => {
    if (onReset) {
      onReset();
    } else {
      onChange(emptyLeadDraft());
    }

    setAttempted(false);
    setDiscardOpen(false);
  };

  // ============================================================
  // SAVE BUTTON CLICK
  // ============================================================

  /**
   * This function is called when the user clicks
   * "SUBMIT TRANSACTION".
   *
   * First we validate the form.
   * If validation passes, we show the confirmation dialog.
   * Actual onSubmit() is called only after confirmation.
   */
  const handleSaveClick = () => {
    if (submitting) {
      return;
    }

    setAttempted(true);

    // Do not open confirmation dialog if validation fails.
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Open save confirmation dialog.
    setSaveConfirmOpen(true);
  };

  // ============================================================
  // CONFIRM SAVE
  // ============================================================

  /**
   * Called when the user clicks "CONFIRM & SUBMIT"
   * inside the confirmation dialog.
   */
  const handleConfirmSave = () => {
    if (submitting) {
      return;
    }

    setSaveConfirmOpen(false);

    // Finally submit the transaction.
    onSubmit();
  };

  return (
    <>
      {/* ============================================================
          MAIN LEAD FORM
          ============================================================ */}

      <Stack
        gap={2}
        component="form"
        id={LEAD_FORM_ID}
        sx={{
          color: "text.primary",
          "& .MuiTypography-root, & .MuiInputLabel-root, & .MuiButton-root": {
            fontFamily: "Inter, sans-serif",
            textTransform: "uppercase",
          },
          "& .MuiInputLabel-root": {
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.04em",
          },
          "& .MuiInputBase-root, & .MuiInputBase-input, & .MuiSelect-select": {
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
          },
          "& .MuiInputBase-input::placeholder": {
            fontFamily: "Inter, sans-serif",
            fontSize: "11px",
            textTransform: "uppercase",
            opacity: 0.7,
          },
          "& .MuiFormHelperText-root": {
            fontFamily: "Inter, sans-serif",
            fontSize: "10px",
            textTransform: "uppercase",
          },
        }}
        onSubmit={(event) => {
          event.preventDefault();

          handleSaveClick();
        }}
      >
        {/* ============================================================
            PRIMARY INFORMATION
            ============================================================ */}

        <FormSection title="Primary Information" description="Capture the essential lead details.">
          <Stack
            spacing={2}
            sx={{
              px: 1,
              pb: 1,
            }}
          >
            <FieldGrid>
              <TextFieldControl
                name="company"
                label="Company Name"
                required
                value={value.companyName}
                onChange={(next) => patch("companyName", next)}
                error={attempted ? errors.companyName : undefined}
              />

              <TextFieldControl
                name="contactPerson"
                label="Contact Person"
                required
                value={value.contactPerson}
                onChange={(next) => patch("contactPerson", next)}
                error={attempted ? errors.contactPerson : undefined}
              />

              <TextFieldControl
                name="phone"
                label="Phone Number"
                required
                type="tel"
                value={value.phone}
                onChange={(next) => patch("phone", next)}
                error={attempted ? errors.phone : undefined}
              />

              <TextFieldControl
                name="email"
                label="Email"
                required
                type="email"
                value={value.email}
                onChange={(next) => patch("email", next)}
                error={attempted ? errors.email : undefined}
              />

              <CreatableSelectField
                name="industry"
                label="Industry"
                value={value.industry}
                onChange={(next) => patch("industry", next)}
                options={industryOptions}
                createTitle="Add industry"
                onCreateOption={(name) => {
                  const created = addCustomIndustry(name);

                  setIndustryOptions(getLeadIndustryOptions());

                  patch("industry", created);
                }}
              />

              <SelectField
                name="projectType"
                label="Project Type"
                value={value.projectType}
                onChange={(next) => patch("projectType", next)}
                options={leadProjectOptions}
                includeEmpty
              />

              <SelectField
                name="leadSource"
                label="Lead Source"
                value={value.leadSource}
                onChange={(next) => patch("leadSource", next)}
                options={leadSourceOptions}
                includeEmpty
              />

              <SelectField
                name="status"
                label="Status"
                value={value.status}
                onChange={(next) => patch("status", next as LeadStatus)}
                options={leadStatusOptions}
              />

              <SelectField
                name="assignedTo"
                label="Assigned To"
                value={value.assignedTo}
                onChange={(next) => patch("assignedTo", next)}
                options={leadAssigneeOptions}
                includeEmpty
              />

              <TextFieldControl
                name="website"
                label="Website"
                type="url"
                value={value.website}
                onChange={(next) => patch("website", next)}
              />

              <SelectField
                name="companySize"
                label="Company Size"
                value={value.companySize}
                onChange={(next) => patch("companySize", next)}
                options={leadSizeOptions}
                includeEmpty
              />

              <SelectField
                name="annualRevenue"
                label="Annual Revenue"
                value={value.annualRevenue}
                onChange={(next) => patch("annualRevenue", next)}
                options={leadRevenueOptions}
                includeEmpty
              />
            </FieldGrid>

            <TextFieldControl
              name="address"
              label="Address"
              required
              multiline
              minRows={3}
              value={value.address}
              onChange={(next) => patch("address", next)}
              error={attempted ? errors.address : undefined}
            />
          </Stack>
        </FormSection>

        {/* ============================================================
            CLASSIFICATION
            ============================================================ */}

        <FormSection
          title="Classification"
          description="Map the lead to the correct subsidiary."
          collapsible
          defaultExpanded={false}
        >
          <Stack
            spacing={2}
            sx={{
              px: 1,
              pb: 1,
            }}
          >
            <SelectField
              name="subsidiary"
              label="Subsidiary"
              value={value.subsidiary}
              onChange={(next) => patch("subsidiary", next)}
              options={leadSubsidiaryOptions}
              includeEmpty
            />
          </Stack>
        </FormSection>

        {/* ============================================================
            ADDITIONAL INFORMATION
            ============================================================ */}

        <FormSection
          title="Additional Information"
          description="Capture context, scope and notes."
          collapsible
          defaultExpanded={false}
        >
          <Stack
            spacing={2}
            sx={{
              px: 1,
              pb: 1,
            }}
          >
            <TextFieldControl
              name="projectDescription"
              label="Project Description"
              multiline
              minRows={4}
              value={value.projectDescription}
              onChange={(next) => patch("projectDescription", next)}
            />

            <TextFieldControl
              name="notes"
              label="Notes"
              multiline
              minRows={4}
              value={value.notes}
              onChange={(next) => patch("notes", next)}
            />
          </Stack>
        </FormSection>

        {/* ============================================================
            FOLLOW-UPS
            ============================================================ */}

        <FormSection
          title="Follow-ups"
          description="Optional next action for this lead. These fields are not required."
          collapsible
          defaultExpanded={false}
        >
          <Stack
            spacing={2}
            sx={{
              px: 1,
              pb: 1,
            }}
          >
            <FieldGrid>
              {/* ========================================================
                  FOLLOW-UP DATE
                  Automatically uses today's date.
                  User cannot change it.
                  ======================================================== */}

              <TextFieldControl
                name="followUpDate"
                label="Follow-up Date"
                type="date"
                value={currentDate}
                readOnly
                onChange={() => {}}
                error={attempted ? errors.followUpDate : undefined}
              />

              {/* ========================================================
                  NEW FOLLOW-UP DATE
                  Today or future dates only.
                  ======================================================== */}

              <TextFieldControl
                name="newFollowUpDate"
                label="New Follow-up Date"
                type="date"
                value={value.newFollowUpDate}
                min={currentDate}
                onChange={(next) => patch("newFollowUpDate", next)}
                error={attempted ? errors.newFollowUpDate : undefined}
              />

              {/* ========================================================
                  FOLLOW-UP STATUS
                  ======================================================== */}

              <SelectField
                name="followUpStatus"
                label="Follow-up Status"
                value={value.followUpStatus}
                onChange={(next) => patch("followUpStatus", next)}
                options={leadFollowUpStatus}
                includeEmpty
              />

              {/* ========================================================
                  FOLLOW-UP TYPE
                  ======================================================== */}

              <SelectField
                name="followUpType"
                label="Follow-up Type"
                value={value.followUpType}
                onChange={(next) => patch("followUpType", next)}
                options={leadFollowUpTypeOptions}
                includeEmpty
              />

              {/* ========================================================
                  FOLLOW-UP FILE
                  ======================================================== */}

              <TextField
                fullWidth
                label="Follow-up File"
                type="file"
                slotProps={{
                  input: {
                    inputProps: {
                      accept: "*/*",
                    },
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(event) => {
                  const target = event.target as HTMLInputElement;

                  const file = target.files?.[0];

                  onChange({
                    ...value,
                    followUpFile: file ?? null,
                  });
                }}
              />
            </FieldGrid>

            {/* ==========================================================
                FOLLOW-UP NOTES
                ========================================================== */}

            <TextFieldControl
              name="followUpNotes"
              label="Follow-up Notes"
              multiline
              minRows={3}
              value={value.followUpNotes}
              onChange={(next) => patch("followUpNotes", next)}
            />
          </Stack>
        </FormSection>

        {/* ============================================================
            FORM ACTION BUTTONS
            ============================================================ */}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={1.25}
          sx={{
            mt: 1,
            pt: 2,
            borderTop: 1,
            borderColor: "divider",

            "& .MuiButton-root": {
              minHeight: 40,
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            },
          }}
        >
          {/* CONVERT TO OPPORTUNITY */}

          <Button
            type="button"
            variant="outlined"
            startIcon={<SwapHorizOutlinedIcon />}
            onClick={() => setConversionOpen(true)}
            sx={{
              flex: 1,
              bgcolor: "#e8f9f3",
              color: "#0aae83",
              borderColor: "#b9eadc",

              "&:hover": {
                bgcolor: "#d9f5ec",
                borderColor: "#0aae83",
              },
            }}
          >
            CONVERT TO OPPORTUNITY
          </Button>

          {/* DISCARD CHANGES */}

          <Button
            type="button"
            variant="outlined"
            startIcon={<DeleteOutlineOutlinedIcon />}
            onClick={() => setDiscardOpen(true)}
            sx={{
              flex: 1,
              color: "text.secondary",
              borderColor: "divider",

              "&:hover": {
                borderColor: "text.secondary",
                bgcolor: "action.hover",
              },
            }}
          >
            DISCARD CHANGES
          </Button>

          {/* SUBMIT TRANSACTION */}

          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            disabled={submitting}
            sx={{
              flex: 1,
            }}
          >
            SUBMIT TRANSACTION
          </Button>

          {/* CLOSE */}

          <Button
            type="button"
            variant="outlined"
            startIcon={<CloseOutlinedIcon />}
            onClick={onClose}
            sx={{
              flex: 1,
              color: "text.secondary",
              borderColor: "divider",

              "&:hover": {
                borderColor: "text.secondary",
                bgcolor: "action.hover",
              },
            }}
          >
            CLOSE
          </Button>
        </Stack>
      </Stack>

      {/* ================================================================
          CONVERT TO OPPORTUNITY DIALOG
          ================================================================ */}

      <ConvertOpportunityDialog
        open={conversionOpen}
        companyName={value.companyName}
        submitting={submitting}
        onClose={() => setConversionOpen(false)}
        onConvert={(data: OpportunityFormData) => {
          console.log("Opportunity conversion data:", data);

          // ============================================================
          // HERE YOU CAN CALL YOUR CONVERSION API
          // ============================================================

          /*
      Example:

      await convertLeadToOpportunity({
        leadId: value.id,
        opportunityValue: Number(data.opportunityValue),
        stage: data.stage,
        probability: Number(data.probability),
        competitors: data.competitors,
        nextSteps: data.nextSteps,
        closeReason: data.closeReason,
      });
    */

          setConversionOpen(false);
        }}
      />

      {/* ================================================================
          DISCARD CHANGES CONFIRMATION DIALOG
          ================================================================ */}

      <Dialog open={discardOpen} onClose={() => setDiscardOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Are you sure you want to discard all changes?</DialogTitle>

        <DialogActions>
          <Button type="button" onClick={() => setDiscardOpen(false)}>
            CANCEL
          </Button>

          <Button type="button" color="error" onClick={discardChanges}>
            DISCARD
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================================================================
          SAVE / SUBMIT CONFIRMATION DIALOG
          ================================================================

          This dialog appears only after:
          1. User clicks SUBMIT TRANSACTION
          2. Form validation succeeds

          The actual onSubmit() is triggered only after the user
          clicks CONFIRM & SUBMIT.
          ================================================================ */}

      <Dialog
        open={saveConfirmOpen}
        onClose={() => {
          if (!submitting) {
            setSaveConfirmOpen(false);
          }
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        {/* ============================================================
            DIALOG TITLE
            ============================================================ */}

        <DialogTitle
          sx={{
            px: 3,
            pt: 2.5,
            pb: 1.5,
            fontFamily: "Inter, sans-serif",
            fontSize: "15px",
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          Confirm Transaction
        </DialogTitle>

        {/* ============================================================
            DIALOG CONTENT
            ============================================================ */}

        <DialogContent
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Stack spacing={1}>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                lineHeight: 1.6,
                color: "text.secondary",
              }}
            >
              Are you sure you want to submit this lead transaction?
            </Typography>

            {/* Company name preview */}

            {!isBlank(value.companyName) && (
              <Stack
                sx={{
                  mt: 0.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 1.5,
                  bgcolor: "action.hover",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    color: "text.secondary",
                  }}
                >
                  Company
                </Typography>

                <Typography
                  sx={{
                    mt: 0.25,
                    fontFamily: "Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  {value.companyName}
                </Typography>
              </Stack>
            )}

            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "10px",
                lineHeight: 1.5,
                color: "text.secondary",
              }}
            >
              Please verify the entered information before submitting.
            </Typography>
          </Stack>
        </DialogContent>

        {/* ============================================================
            DIALOG ACTIONS
            ============================================================ */}

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            gap: 1,
            borderTop: 1,
            borderColor: "divider",

            "& .MuiButton-root": {
              minHeight: 38,
              px: 2,
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            },
          }}
        >
          {/* CANCEL */}

          <Button
            type="button"
            variant="outlined"
            onClick={() => setSaveConfirmOpen(false)}
            disabled={submitting}
            sx={{
              flex: 1,
              color: "text.secondary",
              borderColor: "divider",

              "&:hover": {
                borderColor: "text.secondary",
                bgcolor: "action.hover",
              },
            }}
          >
            CANCEL
          </Button>

          {/* CONFIRM & SUBMIT */}

          <Button
            type="button"
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            onClick={handleConfirmSave}
            disabled={submitting}
            sx={{
              flex: 1,
              bgcolor: "#0aae83",

              "&:hover": {
                bgcolor: "#099a74",
              },
            }}
          >
            {submitting ? "SUBMITTING..." : "CONFIRM & SUBMIT"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
