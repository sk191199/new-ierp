import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Box, Button, Stack } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { BooleanField, FieldGrid, SelectField, TextFieldControl } from "@/components/forms/fields";
import { FormSection } from "@/components/forms/FormSection";
import { ROUTES } from "@/constants/routes";
import { subsidiaryMockData, type SubsidiaryRecord } from "./subsidiaryMockData";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";

interface SubsidiaryEditorPageProps {
  mode: "create";
}

const emptySubsidiary = (): SubsidiaryRecord => ({
  id: "",
  name: "",
  status: "Active",
  hasChildSubsidiary: false,
  stateProvince: "",
  country: "",
  legalName: "",
  parentSubsidiaryId: "",
  currency: "USD",
});

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const currencyOptions = ["USD", "INR", "EUR", "GBP", "AED", "SGD", "AUD", "CAD"].map((value) => ({
  value,
  label: value,
}));

const getNextId = (records: SubsidiaryRecord[]): string => {
  const highestId = records.reduce((highest, record) => {
    const numericId = Number(record.id.match(/(\d+)$/)?.[1] ?? 0);
    return Math.max(highest, numericId);
  }, 0);
  return `SUB-${String(highestId + 1).padStart(3, "0")}`;
};

export const SubsidiaryEditorPage = ({ mode }: SubsidiaryEditorPageProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const existingRecords =
    (location.state as { records?: SubsidiaryRecord[] } | null)?.records ?? subsidiaryMockData;
  const [draft, setDraft] = useState<SubsidiaryRecord>(emptySubsidiary);
  const [attempted, setAttempted] = useState(false);

  const parentOptions = [
    { value: "", label: "No parent" },
    ...existingRecords.map((record) => ({ value: record.id, label: record.name })),
  ];

  const save = () => {
    setAttempted(true);
    if (
      !draft.name.trim() ||
      !draft.legalName.trim() ||
      !draft.stateProvince.trim() ||
      !draft.country.trim() ||
      !draft.currency
    ) {
      return;
    }

    const createdSubsidiary = { ...draft, id: getNextId(existingRecords) };
    dispatch(toastShown({ message: "Subsidiary created successfully.", severity: "success" }));
    navigate(ROUTES.masters.subsidiaries, { state: { createdSubsidiary } });
  };

  return (
    <Stack gap={2.25}>
      <PageHeader
        eyebrow="Master Data"
        title={mode === "create" ? "New Subsidiary" : "Subsidiary Editor"}
        actions={
          <Stack direction="row" gap={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate(ROUTES.masters.subsidiaries)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              type="submit"
              form="subsidiary-editor-form"
            >
              Save Subsidiary
            </Button>
          </Stack>
        }
      />

      <Stack
        component="form"
        id="subsidiary-editor-form"
        gap={2}
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <FormSection title="Subsidiary Information" collapsible defaultExpanded>
          <FieldGrid>
            <TextFieldControl
              name="subsidiary-id"
              label="ID"
              value="Assigned on save"
              onChange={() => undefined}
              readOnly
            />
            <TextFieldControl
              name="subsidiary-name"
              label="Name"
              required
              value={draft.name}
              onChange={(name) => setDraft((current) => ({ ...current, name }))}
              error={attempted && !draft.name.trim() ? "Name is required." : undefined}
            />
            <TextFieldControl
              name="subsidiary-legal-name"
              label="Legal Name"
              required
              value={draft.legalName}
              onChange={(legalName) => setDraft((current) => ({ ...current, legalName }))}
              error={attempted && !draft.legalName.trim() ? "Legal name is required." : undefined}
            />
            <TextFieldControl
              name="subsidiary-state"
              label="State/Province"
              required
              value={draft.stateProvince}
              onChange={(stateProvince) => setDraft((current) => ({ ...current, stateProvince }))}
              error={attempted && !draft.stateProvince.trim() ? "State/Province is required." : undefined}
            />
            <TextFieldControl
              name="subsidiary-country"
              label="Country"
              required
              value={draft.country}
              onChange={(country) => setDraft((current) => ({ ...current, country }))}
              error={attempted && !draft.country.trim() ? "Country is required." : undefined}
            />
            <SelectField
              name="subsidiary-currency"
              label="Currency"
              required
              value={draft.currency}
              onChange={(currency) => setDraft((current) => ({ ...current, currency }))}
              options={currencyOptions}
            />
            <SelectField
              name="subsidiary-parent"
              label="Parent Subsidiary"
              value={draft.parentSubsidiaryId}
              onChange={(parentSubsidiaryId) =>
                setDraft((current) => ({ ...current, parentSubsidiaryId }))
              }
              options={parentOptions}
            />
            <SelectField
              name="subsidiary-status"
              label="Status"
              value={draft.status}
              onChange={(status) =>
                setDraft((current) => ({ ...current, status: status as SubsidiaryRecord["status"] }))
              }
              options={statusOptions}
            />
            <Box sx={{ display: "flex", alignItems: "center", minHeight: 56 }}>
              <BooleanField
                name="subsidiary-has-children"
                label="Has Child Subsidiary"
                value={draft.hasChildSubsidiary}
                onChange={(hasChildSubsidiary) =>
                  setDraft((current) => ({ ...current, hasChildSubsidiary }))
                }
                variant="switch"
              />
            </Box>
          </FieldGrid>
        </FormSection>
      </Stack>
    </Stack>
  );
};