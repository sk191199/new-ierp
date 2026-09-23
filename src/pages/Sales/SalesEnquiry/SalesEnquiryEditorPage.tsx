import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {  Button, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { ROUTES } from "@/constants/routes";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { salesEnquiryRecords } from "./salesEnquiry.mock";
import { createSalesEnquiryDraft, SalesEnquiryForm, type SalesEnquiryDraft } from "./SalesEnquiryForm";

interface SalesEnquiryEditorPageProps {
  mode: "create" | "edit";
}

export const SalesEnquiryEditorPage = ({ mode }: SalesEnquiryEditorPageProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const record = useMemo(() => salesEnquiryRecords.find((item) => item.id === id), [id]);
  const [draft, setDraft] = useState<SalesEnquiryDraft>(() => createSalesEnquiryDraft(record));
  const [submitting, setSubmitting] = useState(false);

  const save = () => {
    setSubmitting(true);
    dispatch(toastShown({ message: `${draft.enquiryCode} saved for UI testing.`, severity: "success" }));
    setSubmitting(false);
    navigate(ROUTES.sales.enquiries);
  };

  return (
    <Stack gap={2.25}>
      <PageHeader
        eyebrow="Terminal · Sales"
        title={mode === "create" ? "New Sales Enquiry" : "Edit Sales Enquiry"}
        uppercase
        actions={<Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(ROUTES.sales.enquiries)}>Back to enquiries</Button>}
      />
      {!record && mode === "edit" ? <Typography color="error.main">Sales enquiry was not found.</Typography> : <SalesEnquiryForm value={draft} mode={mode} submitting={submitting} onChange={setDraft} onSubmit={save} onCancel={() => navigate(ROUTES.sales.enquiries)} />}
    </Stack>
  );
};
