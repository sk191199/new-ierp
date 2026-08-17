import { Stack, TextField } from "@mui/material";
import { useMemo, useState } from "react";

import {
  CreatableSelectField,
  FieldGrid,
  SelectField,
  TextFieldControl,
} from "@/components/forms/fields";

import { FormSection } from "@/components/forms/FormSection";

import type { LeadStatus } from "@/constants/statuses";
import type { LeadDraft } from "@/models/lead/lead";

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
}

export const LeadForm = ({ value, submitting, onChange, onSubmit }: LeadFormProps) => {
  const [attempted, setAttempted] = useState(false);

  const [industryOptions, setIndustryOptions] = useState(getLeadIndustryOptions);

  const errors = useMemo(() => {
    const next: Partial<Record<keyof LeadDraft, string>> = {};

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

    return next;
  }, [value]);

  const patch = (key: keyof LeadDraft, next: string) =>
    onChange({
      ...value,
      [key]: next,
    });

  /**
   * Current date in YYYY-MM-DD format.
   *
   * This uses the browser's local date instead of UTC,
   * so users in India won't accidentally get yesterday/tomorrow.
   */
  const getCurrentDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const currentDate = getCurrentDate();

  return (
    <Stack
      gap={2}
      component="form"
      id={LEAD_FORM_ID}
      onSubmit={(event) => {
        event.preventDefault();

        if (submitting) {
          return;
        }

        setAttempted(true);

        if (Object.keys(errors).length === 0) {
          onSubmit();
        }
      }}
    >
      {/* ============================================================
          PRIMARY INFORMATION
          ============================================================ */}
      <FormSection title="Primary Information" description="Capture the essential lead details.">
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
        <SelectField
          name="subsidiary"
          label="Subsidiary"
          value={value.subsidiary}
          onChange={(next) => patch("subsidiary", next)}
          options={leadSubsidiaryOptions}
          includeEmpty
        />
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
        <FieldGrid>
          {/* ========================================================
              1. FOLLOW-UP DATE
              Automatically shows today's date
              ======================================================== */}
          <TextFieldControl
            name="followUpDate"
            label="Follow-up Date"
            type="date"
            value={value.followUpDate || currentDate}
            onChange={(next) => patch("followUpDate", next)}
          />

          {/* ========================================================
              2. NEW FOLLOW-UP DATE
              ======================================================== */}
          <TextFieldControl
            name="newFollowUpDate"
            label="New Follow-up Date"
            type="date"
            value={value.newFollowUpDate}
            onChange={(next) => patch("newFollowUpDate", next)}
          />

          {/* ========================================================
              3. FOLLOW-UP STATUS
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
              4. FOLLOW-UP TYPE
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
              5. FOLLOW-UP FILE
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
      </FormSection>
    </Stack>
  );
};
