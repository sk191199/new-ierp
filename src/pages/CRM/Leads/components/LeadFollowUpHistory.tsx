import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { Box, Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useState } from "react";

import { SelectField, TextFieldControl } from "@/components/forms/fields";

import type { LeadFollowUp } from "@/models/lead/lead";
import { formatDate } from "@/utils/formatters";

interface LeadFollowUpHistoryProps {
  followUps: LeadFollowUp[];
  onUpdateFollowUp?: (followUpId: string, data: FollowUpEditData) => Promise<void>;
}

export interface FollowUpEditData {
  activityType: string;
  status: string;
  nextFollowUpDate: string;
  remarks: string;
}

const FollowUpValue = ({ label, value }: { label: string; value?: string }) => (
  <Stack gap={0.25}>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{ fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}
    >
      {value || "-"}
    </Typography>
  </Stack>
);

export const LeadFollowUpHistory = ({ followUps, onUpdateFollowUp }: LeadFollowUpHistoryProps) => {
  const [editingFollowUpId, setEditingFollowUpId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<FollowUpEditData | null>(null);
  const [savingFollowUpId, setSavingFollowUpId] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | undefined>();

  const startEditing = (followUp: LeadFollowUp) => {
    if (!followUp.id || !onUpdateFollowUp) return;
    setEditingFollowUpId(followUp.id);
    setEditValue({
      activityType: followUp.activityType ?? "",
      status: followUp.status ?? "",
      nextFollowUpDate: followUp.nextFollowUpDate?.slice(0, 10) ?? "",
      remarks: followUp.remarks ?? "",
    });
    setDateError(undefined);
  };

  const cancelEditing = () => {
    setEditingFollowUpId(null);
    setEditValue(null);
    setDateError(undefined);
  };

  const saveEditing = async () => {
    if (!editingFollowUpId || !editValue || !onUpdateFollowUp) return;
    const today = new Date();
    const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (editValue.nextFollowUpDate && editValue.nextFollowUpDate < currentDate) {
      setDateError("Next follow-up date cannot be before today.");
      return;
    }

    setSavingFollowUpId(editingFollowUpId);
    try {
      await onUpdateFollowUp(editingFollowUpId, editValue);
      cancelEditing();
    } catch {
      // The parent reports the error and intentionally leaves this draft open.
    } finally {
      setSavingFollowUpId(null);
    }
  };

  if (followUps.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}
      >
        No previous follow-ups available.
      </Typography>
    );
  }

  return (
    <Stack gap={2}>
      {followUps.map((followUp, index) => (
        <Box
          key={followUp.id ?? `${followUp.followUpDate ?? "follow-up"}-${index}`}
          sx={{
            p: { xs: 1.5, md: 2 },
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "action.hover",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontFamily: "Inter, sans-serif", textTransform: "uppercase" }}>
              Follow-Up {index + 1}
            </Typography>
            {editingFollowUpId !== followUp.id && followUp.id && onUpdateFollowUp ? (
              <Tooltip title="Edit Follow-Up">
                <IconButton aria-label="Edit Follow-Up" size="small" onClick={() => startEditing(followUp)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
          {editingFollowUpId === followUp.id && editValue ? (
            <Stack gap={1.5}>
              <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                <SelectField name={`follow-up-type-${followUp.id}`} label="Activity Type" value={editValue.activityType} onChange={(value) => setEditValue({ ...editValue, activityType: value })} options={["Call", "Email", "Meeting", "Site Visit"].map((value) => ({ value, label: value }))} />
                <FollowUpValue label="Follow-Up Date" value={formatDate(followUp.followUpDate ?? "")} />
                <TextFieldControl name={`next-follow-up-date-${followUp.id}`} label="Next Follow-Up Date" type="date" value={editValue.nextFollowUpDate} onChange={(value) => setEditValue({ ...editValue, nextFollowUpDate: value })} error={dateError} />
                <SelectField name={`follow-up-status-${followUp.id}`} label="Status" value={editValue.status} onChange={(value) => setEditValue({ ...editValue, status: value })} options={["Pending", "Completed", "Rescheduled", "Cancelled"].map((value) => ({ value, label: value }))} />
                <TextFieldControl name={`follow-up-remarks-${followUp.id}`} label="Remarks" multiline minRows={2} value={editValue.remarks} onChange={(value) => setEditValue({ ...editValue, remarks: value })} />
                <FollowUpValue label="Created By" value={followUp.createdBy} />
              </Box>
              <Stack direction="row" justifyContent="flex-end" gap={1}>
                <Button type="button" variant="outlined" startIcon={<CloseIcon />} onClick={cancelEditing} disabled={savingFollowUpId === followUp.id}>Cancel</Button>
                <Button type="button" variant="contained" startIcon={<SaveOutlinedIcon />} onClick={() => void saveEditing()} disabled={savingFollowUpId === followUp.id}>{savingFollowUpId === followUp.id ? "Saving..." : "Save"}</Button>
              </Stack>
            </Stack>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" } }}>
              <FollowUpValue label="Activity Type" value={followUp.activityType} />
              <FollowUpValue label="Follow-Up Date" value={formatDate(followUp.followUpDate ?? "")} />
              <FollowUpValue label="Next Follow-Up Date" value={formatDate(followUp.nextFollowUpDate ?? "")} />
              <FollowUpValue label="Status" value={followUp.status} />
              <FollowUpValue label="Remarks" value={followUp.remarks} />
              <FollowUpValue label="Created By" value={followUp.createdBy} />
            </Box>
          )}
        </Box>
      ))}
    </Stack>
  );
};