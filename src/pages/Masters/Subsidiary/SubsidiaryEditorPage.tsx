import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Button, Stack } from "@mui/material";
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
  isChildSubsidiary: false,
  inactive: false,
  website: "",
  documentNumberPrefix: "",
  emailAddress: "",
  vatRegistrationNo: "",
  taxReferenceNo: "",
  organizationIdType: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  addressCountry: "",
});

const currencyOptions = ["USD", "INR", "EUR", "GBP", "AED", "SGD", "AUD", "CAD"].map((value) => ({
  value,
  label: value,
}));

const organizationIdTypeOptions = [
  { value: "UEN", label: "UEN" },
  { value: "VAT", label: "VAT Registration Number" },
  { value: "TIN", label: "Tax Identification Number" },
];

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

  const save = () => {
    setAttempted(true);
    if (
      !draft.name.trim() ||
      !draft.currency ||
      !draft.legalName.trim() ||
      !draft.addressLine1?.trim() ||
      (draft.isChildSubsidiary && !draft.parentSubsidiaryId)
    ) {
      return;
    }

    const createdSubsidiary = {
      ...draft,
      id: getNextId(existingRecords),
      status: draft.inactive ? "Inactive" : "Active",
      parentSubsidiaryId: draft.isChildSubsidiary ? draft.parentSubsidiaryId : "",
    };
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
        <FormSection title="General Information" collapsible defaultExpanded>
          <FieldGrid>
            <TextFieldControl
              name="subsidiary-name"
              label="Name"
              required
              value={draft.name}
              onChange={(name) => setDraft((current) => ({ ...current, name }))}
              error={attempted && !draft.name.trim() ? "Name is required." : undefined}
            />
            <BooleanField
              name="subsidiary-inactive"
              label="Inactive"
              value={draft.inactive ?? false}
              onChange={(inactive) => setDraft((current) => ({ ...current, inactive }))}
            />
            <BooleanField
              name="subsidiary-is-child"
              label="Is Child Subsidiary"
              value={draft.isChildSubsidiary ?? false}
              onChange={(hasChildSubsidiary) =>
                setDraft((current) => ({
                  ...current,
                  isChildSubsidiary: hasChildSubsidiary,
                  parentSubsidiaryId: hasChildSubsidiary ? current.parentSubsidiaryId : "",
                }))
              }
            />
            {draft.isChildSubsidiary ? (
              <SelectField
                name="subsidiary-parent"
                label="Parent Subsidiary"
                required
                value={draft.parentSubsidiaryId}
                onChange={(parentSubsidiaryId) =>
                  setDraft((current) => ({ ...current, parentSubsidiaryId }))
                }
                options={existingRecords.map((record) => ({ value: record.id, label: record.name }))}
                includeEmpty
                emptyLabel="Select Parent Subsidiary"
                error={attempted && !draft.parentSubsidiaryId ? "Parent subsidiary is required." : undefined}
              />
            ) : null}
            <SelectField
              name="subsidiary-currency"
              label="Currency"
              required
              value={draft.currency}
              onChange={(currency) => setDraft((current) => ({ ...current, currency }))}
              options={currencyOptions}
              error={attempted && !draft.currency ? "Currency is required." : undefined}
            />
            <TextFieldControl
              name="subsidiary-website"
              label="Website"
              value={draft.website ?? ""}
              onChange={(website) => setDraft((current) => ({ ...current, website }))}
            />
            <TextFieldControl
              name="subsidiary-document-prefix"
              label="Document Number Prefix"
              value={draft.documentNumberPrefix ?? ""}
              onChange={(documentNumberPrefix) =>
                setDraft((current) => ({ ...current, documentNumberPrefix }))
              }
            />
            <TextFieldControl
              name="subsidiary-state"
              label="State/Province"
              value={draft.stateProvince ?? ""}
              onChange={(stateProvince) => setDraft((current) => ({ ...current, stateProvince }))}
            />
            <TextFieldControl
              name="subsidiary-country"
              label="Country"
              value={draft.country ?? ""}
              onChange={(country) => setDraft((current) => ({ ...current, country }))}
            />
          </FieldGrid>
        </FormSection>

        <FormSection title="Legal & Tax" collapsible defaultExpanded>
          <FieldGrid>
            <TextFieldControl
              name="subsidiary-legal-name"
              label="Legal Name"
              required
              value={draft.legalName}
              onChange={(legalName) => setDraft((current) => ({ ...current, legalName }))}
              error={attempted && !draft.legalName.trim() ? "Legal name is required." : undefined}
            />
            <TextFieldControl
              name="subsidiary-email-address"
              label="Email Address"
              type="email"
              value={draft.emailAddress ?? ""}
              onChange={(emailAddress) => setDraft((current) => ({ ...current, emailAddress }))}
            />
            <TextFieldControl
              name="subsidiary-vat-registration"
              label="VAT Registration No"
              value={draft.vatRegistrationNo ?? ""}
              onChange={(vatRegistrationNo) =>
                setDraft((current) => ({ ...current, vatRegistrationNo }))
              }
            />
            <TextFieldControl
              name="subsidiary-tax-reference"
              label="Tax Ref No. / UEN"
              value={draft.taxReferenceNo ?? ""}
              onChange={(taxReferenceNo) =>
                setDraft((current) => ({ ...current, taxReferenceNo }))
              }
            />
            <SelectField
              name="subsidiary-organization-id-type"
              label="Organization ID Type"
              value={draft.organizationIdType ?? ""}
              onChange={(organizationIdType) =>
                setDraft((current) => ({ ...current, organizationIdType }))
              }
              options={organizationIdTypeOptions}
              includeEmpty
            />
          </FieldGrid>
        </FormSection>

        <FormSection title="Address" collapsible defaultExpanded>
          <FieldGrid>
            <TextFieldControl
              name="subsidiary-address-line-1"
              label="Address Line 1"
              required
              value={draft.addressLine1 ?? ""}
              onChange={(addressLine1) => setDraft((current) => ({ ...current, addressLine1 }))}
              error={attempted && !draft.addressLine1?.trim() ? "Address Line 1 is required." : undefined}
            />
            <TextFieldControl
              name="subsidiary-address-line-2"
              label="Address Line 2"
              value={draft.addressLine2 ?? ""}
              onChange={(addressLine2) => setDraft((current) => ({ ...current, addressLine2 }))}
            />
            <TextFieldControl
              name="subsidiary-city"
              label="City"
              value={draft.city ?? ""}
              onChange={(city) => setDraft((current) => ({ ...current, city }))}
            />
            <TextFieldControl
              name="subsidiary-address-state"
              label="State"
              value={draft.state ?? ""}
              onChange={(state) => setDraft((current) => ({ ...current, state }))}
            />
            <TextFieldControl
              name="subsidiary-postal-code"
              label="Postal Code"
              value={draft.postalCode ?? ""}
              onChange={(postalCode) => setDraft((current) => ({ ...current, postalCode }))}
            />
            <TextFieldControl
              name="subsidiary-address-country"
              label="Country"
              value={draft.addressCountry ?? ""}
              onChange={(addressCountry) => setDraft((current) => ({ ...current, addressCountry }))}
            />
          </FieldGrid>
        </FormSection>
      </Stack>
    </Stack>
  );
};