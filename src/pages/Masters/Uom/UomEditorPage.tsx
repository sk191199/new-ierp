import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Button, Stack } from "@mui/material";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { BooleanField, FieldGrid, TextFieldControl } from "@/components/forms/fields";
import { FormSection } from "@/components/forms/FormSection";
import { ROUTES } from "@/constants/routes";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { uomMockData, type UomRecord } from "./uomMockData";

type UomDraft = Omit<UomRecord, "decimalPrecision"> & { decimalPrecision: string };

const emptyUom = (): UomDraft => ({
  id: "",
  code: "",
  name: "",
  symbol: "",
  description: "",
  inactive: false,
  status: "Active",
  decimalPrecision: "2",
  notes: "",
});

const getNextUomId = (records: UomRecord[]): string => {
  const highestId = records.reduce((highest, record) => {
    const numericId = Number(record.id.match(/(\d+)$/)?.[1] ?? 0);
    return Math.max(highest, numericId);
  }, 0);
  return `UOM-${String(highestId + 1).padStart(3, "0")}`;
};

export const UomEditorPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const existingRecords =
    (location.state as { records?: UomRecord[] } | null)?.records ?? uomMockData;
  const [draft, setDraft] = useState<UomDraft>(emptyUom);
  const [attempted, setAttempted] = useState(false);

  const save = () => {
    setAttempted(true);
    const precision = draft.decimalPrecision.trim();
    if (
      !draft.code.trim() ||
      !draft.name.trim() ||
      !draft.symbol.trim() ||
      (precision && (!Number.isFinite(Number(precision)) || Number(precision) < 0))
    ) {
      return;
    }

    const createdUom: UomRecord = {
      ...draft,
      id: getNextUomId(existingRecords),
      decimalPrecision: precision ? Number(precision) : 2,
      status: draft.inactive ? "Inactive" : "Active",
    };
    dispatch(toastShown({ message: "UOM created successfully.", severity: "success" }));
    navigate(ROUTES.masters.uom, { state: { createdUom } });
  };

  return (
    <Stack gap={2.25}>
      <PageHeader
        eyebrow="Master Data"
        title="New UOM"
        actions={
          <Stack direction="row" gap={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate(ROUTES.masters.uom)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              type="submit"
              form="uom-editor-form"
            >
              Save UOM
            </Button>
          </Stack>
        }
      />

      <Stack
        component="form"
        id="uom-editor-form"
        noValidate
        gap={2}
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <FormSection title="General Information" collapsible defaultExpanded>
          <FieldGrid>
            <TextFieldControl
              name="uom-code"
              label="UOM Code"
              required
              value={draft.code}
              onChange={(code) => setDraft((current) => ({ ...current, code }))}
              placeholder="PCS"
              error={attempted && !draft.code.trim() ? "UOM Code is required." : undefined}
            />
            <TextFieldControl
              name="uom-name"
              label="UOM Name"
              required
              value={draft.name}
              onChange={(name) => setDraft((current) => ({ ...current, name }))}
              placeholder="Piece"
              error={attempted && !draft.name.trim() ? "UOM Name is required." : undefined}
            />
            <TextFieldControl
              name="uom-symbol"
              label="Symbol"
              required
              value={draft.symbol}
              onChange={(symbol) => setDraft((current) => ({ ...current, symbol }))}
              placeholder="pcs"
              error={attempted && !draft.symbol.trim() ? "Symbol is required." : undefined}
            />
            <TextFieldControl
              name="uom-description"
              label="Description"
              value={draft.description}
              onChange={(description) => setDraft((current) => ({ ...current, description }))}
            />
            <BooleanField
              name="uom-inactive"
              label="Inactive"
              value={draft.inactive}
              onChange={(inactive) => setDraft((current) => ({ ...current, inactive }))}
            />
          </FieldGrid>
        </FormSection>

        <FormSection title="Additional Information" collapsible defaultExpanded>
          <FieldGrid>
            <TextFieldControl
              name="uom-decimal-precision"
              label="Decimal Precision"
              type="number"
              min="0"
              value={draft.decimalPrecision}
              onChange={(decimalPrecision) =>
                setDraft((current) => ({ ...current, decimalPrecision }))
              }
              error={
                attempted &&
                draft.decimalPrecision.trim() &&
                (!Number.isFinite(Number(draft.decimalPrecision)) || Number(draft.decimalPrecision) < 0)
                  ? "Enter a valid non-negative number."
                  : undefined
              }
            />
            <TextFieldControl
              name="uom-notes"
              label="Notes"
              value={draft.notes}
              onChange={(notes) => setDraft((current) => ({ ...current, notes }))}
            />
          </FieldGrid>
        </FormSection>
      </Stack>
    </Stack>
  );
};