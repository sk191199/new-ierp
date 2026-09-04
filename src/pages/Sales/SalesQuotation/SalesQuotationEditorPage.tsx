import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Button, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { ROUTES } from "@/constants/routes";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { createSalesQuotationDraft, SalesQuotationForm, type SalesQuotationDraft } from "./SalesQuotationForm";
import { mockSalesQuotations } from "./salesQuotation.mock";

interface SalesQuotationEditorPageProps { mode: "create" | "edit"; }

export const SalesQuotationEditorPage = ({ mode }: SalesQuotationEditorPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const record = useMemo(() => mockSalesQuotations.find((quotation) => quotation.id === id), [id]);
  const [draft, setDraft] = useState<SalesQuotationDraft>(() => createSalesQuotationDraft(record));
  const [submitting, setSubmitting] = useState(false);
  const save = () => { setSubmitting(true); dispatch(toastShown({ message: "Sales quotation saved for UI testing.", severity: "success" })); setSubmitting(false); navigate(ROUTES.sales.quotations); };

  return <Stack gap={2.25}>
    <PageHeader eyebrow="Terminal · Sales" title={mode === "create" ? "New Sales Quotation" : "Edit Sales Quotation"} uppercase actions={<Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(ROUTES.sales.quotations)}>Back to quotations</Button>} />
    {!record && mode === "edit" ? <Typography color="error.main">Sales quotation was not found.</Typography> : <SalesQuotationForm value={draft} mode={mode} submitting={submitting} onChange={setDraft} onSubmit={save} onCancel={() => navigate(ROUTES.sales.quotations)} />}
  </Stack>;
};