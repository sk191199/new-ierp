import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { TextFieldProps } from "@mui/material/TextField";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

export const OPPORTUNITY_STAGES = [
  { value: "new", label: "New", probability: "" },
  { value: "qualification", label: "Qualification", probability: "10" },
  { value: "proposal", label: "Proposal", probability: "50" },
  { value: "negotiation", label: "Negotiation", probability: "80" },
  { value: "closed won", label: "Closed Won", probability: "100" },
  { value: "closed lost", label: "Closed Lost", probability: "0" },
];

export interface OpportunityFormData {
  opportunityName?: string;
  opportunityValue: string;
  currencyCode?: string;
  stage: string;
  probability: string;
  ownerUserId?: string;
  notes?: string;
  competitors: string;
  nextSteps: string;
  closeReason: string;
  expectedCloseDate: string;
}

interface ConvertOpportunityDialogProps {
  open: boolean;
  companyName?: string;
  submitting?: boolean;
  onClose: () => void;
  onConvert: (data: OpportunityFormData) => void;
}

type OpportunityFieldProps = Omit<TextFieldProps, "children" | "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
  children?: ReactNode;
  startAdornment?: ReactNode;
};

const OpportunityField = ({
  value,
  onChange,
  children,
  startAdornment,
  multiline,
  helperText,
  sx,
  ...props
}: OpportunityFieldProps) => (
  <TextField
    {...props}
    fullWidth
    value={value}
    onChange={(event) => onChange(event.target.value)}
    helperText={helperText}
    multiline={multiline}
    slotProps={startAdornment ? { input: { startAdornment } } : undefined}
    sx={
      [
        {
          "& .MuiInputBase-root": {
            fontFamily: "Inter, sans-serif",
            ...(multiline ? { fontSize: "12px" } : {}),
          },
          "& .MuiInputLabel-root": {
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
          },
          ...(helperText !== undefined
            ? {
                "& .MuiFormHelperText-root": {
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                },
              }
            : {}),
        },
        sx,
      ] as SxProps<Theme>
    }
  >
    {children}
  </TextField>
);

const DialogHeader = ({ submitting, onClose }: { submitting: boolean; onClose: () => void }) => (
  <>
    <DialogTitle sx={{ px: 3, pt: 2.5, pb: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#e8f9f3",
              color: "#0aae83",
            }}
          >
            <SwapHorizOutlinedIcon sx={{ fontSize: 21 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "15px",
                fontWeight: 700,
                lineHeight: 1.3,
                color: "text.primary",
              }}
            >
              Convert to Opportunity
            </Typography>
            <Typography
              sx={{
                mt: 0.35,
                fontFamily: "Inter, sans-serif",
                fontSize: "10px",
                fontWeight: 500,
                color: "text.secondary",
              }}
            >
              Create an opportunity from this lead
            </Typography>
          </Box>
        </Stack>
        <Button
          type="button"
          onClick={onClose}
          disabled={submitting}
          sx={{
            minWidth: 32,
            width: 32,
            height: 32,
            p: 0,
            borderRadius: 1,
            color: "text.secondary",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <CloseOutlinedIcon sx={{ fontSize: 19 }} />
        </Button>
      </Stack>
    </DialogTitle>
    <Divider />
  </>
);

const LeadPreview = ({ companyName }: { companyName?: string }) => (
  <Box
    sx={{
      px: 1.75,
      py: 1.5,
      borderRadius: 1.5,
      bgcolor: "#f7faf9",
      border: "1px solid",
      borderColor: "#e1ebe7",
    }}
  >
    <Typography
      sx={{
        fontFamily: "Inter, sans-serif",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "text.secondary",
      }}
    >
      Converting Lead
    </Typography>
    <Typography
      sx={{
        mt: 0.5,
        fontFamily: "Inter, sans-serif",
        fontSize: "13px",
        fontWeight: 700,
        color: "text.primary",
      }}
    >
      {companyName || "Unnamed Company"}
    </Typography>
  </Box>
);

const ClosedLostSection = ({
  form,
  attempted,
  error,
  onChange,
}: {
  form: OpportunityFormData;
  attempted: boolean;
  error?: string;
  onChange: (value: string) => void;
}) => (
  <Box
    sx={{
      p: 1.75,
      borderRadius: 1.5,
      bgcolor: "#fff8f8",
      border: "1px solid",
      borderColor: attempted && error ? "error.main" : "#f0d6d6",
    }}
  >
    <Typography
      sx={{
        mb: 1.25,
        fontFamily: "Inter, sans-serif",
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "error.main",
      }}
    >
      Closed Lost Details
    </Typography>
    <OpportunityField
      label="Close Reason"
      required
      multiline
      minRows={3}
      value={form.closeReason}
      onChange={onChange}
      placeholder="Enter the reason why this opportunity was lost..."
      error={attempted && Boolean(error)}
      helperText={attempted ? error : "Required when the stage is Closed Lost."}
      sx={{
        "& .MuiInputBase-root": {
          fontFamily: "Inter, sans-serif",
          fontSize: "12px",
          bgcolor: "#fff",
        },
      }}
    />
  </Box>
);

const DialogFooter = ({
  submitting,
  onClose,
  onConvert,
}: {
  submitting: boolean;
  onClose: () => void;
  onConvert: () => void;
}) => (
  <DialogActions
    sx={{
      px: 3,
      py: 2,
      gap: 1.25,
      borderTop: "1px solid",
      borderColor: "divider",
    }}
  >
    <Button
      type="button"
      variant="outlined"
      startIcon={<CloseOutlinedIcon />}
      onClick={onClose}
      disabled={submitting}
      sx={{
        minHeight: 40,
        px: 2.5,
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: "text.secondary",
        borderColor: "divider",
        "&:hover": {
          bgcolor: "action.hover",
          borderColor: "text.secondary",
        },
      }}
    >
      CANCEL
    </Button>
    <Button
      type="button"
      variant="contained"
      startIcon={<SwapHorizOutlinedIcon />}
      onClick={onConvert}
      disabled={submitting}
      sx={{
        minHeight: 40,
        px: 2.5,
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        bgcolor: "#0aae83",
        "&:hover": { bgcolor: "#099a74" },
      }}
    >
      {submitting ? "CONVERTING..." : "CONVERT TO OPPORTUNITY"}
    </Button>
  </DialogActions>
);

const ConvertOpportunityDialog = ({
  open,
  companyName,
  submitting = false,
  onClose,
  onConvert,
}: ConvertOpportunityDialogProps) => {
  const [form, setForm] = useState<OpportunityFormData>({
    opportunityValue: "",
    stage: "new",
    probability: "",
    competitors: "",
    nextSteps: "",
    closeReason: "",
    expectedCloseDate: "",
  });
  const [attempted, setAttempted] = useState(false);

  const updateField = (field: keyof OpportunityFormData, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const selectedStage = useMemo(
    () => OPPORTUNITY_STAGES.find((stage) => stage.value === form.stage),
    [form.stage],
  );
  const isClosedLost = form.stage === "closed lost";

  const handleStageChange = (stage: string) => {
    const selected = OPPORTUNITY_STAGES.find((item) => item.value === stage);
    setForm((previous) => ({
      ...previous,
      stage,
      probability: selected?.probability ?? "",
      closeReason: stage === "closed lost" ? previous.closeReason : "",
    }));
  };

  const errors = useMemo(() => {
    const next: Partial<Record<keyof OpportunityFormData, string>> = {};

    if (!form.opportunityValue.trim()) {
      next.opportunityValue = "Opportunity value is required.";
    } else if (Number.isNaN(Number(form.opportunityValue))) {
      next.opportunityValue = "Please enter a valid number.";
    } else if (Number(form.opportunityValue) < 0) {
      next.opportunityValue = "Opportunity value cannot be negative.";
    }

    if (!form.stage) {
      next.stage = "Stage is required.";
    }

    if (!form.expectedCloseDate.trim()) {
      next.expectedCloseDate = "Expected close date is required.";
    }

    if (form.stage !== "new" && !form.probability.trim()) {
      next.probability = "Probability is required.";
    }

    if (isClosedLost && !form.closeReason.trim()) {
      next.closeReason = "Close reason is required when the opportunity is closed lost.";
    }

    return next;
  }, [form, isClosedLost]);

  useEffect(() => {
    if (open) {
      setForm({
        opportunityValue: "",
        stage: "new",
        probability: "",
        competitors: "",
        nextSteps: "",
        closeReason: "",
        expectedCloseDate: "",
      });
      setAttempted(false);
    }
  }, [open]);

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  const handleConvert = () => {
    if (submitting) {
      return;
    }

    setAttempted(true);
    if (Object.keys(errors).length > 0) {
      return;
    }

    onConvert(form);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          overflow: "hidden",
          fontFamily: "Inter, sans-serif",
        },
      }}
    >
      <DialogHeader submitting={submitting} onClose={handleClose} />
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={2.25}>
          <LeadPreview companyName={companyName} />
          <OpportunityField
            label="Opportunity Value"
            required
            type="number"
            value={form.opportunityValue}
            onChange={(value) => updateField("opportunityValue", value)}
            error={attempted && Boolean(errors.opportunityValue)}
            helperText={
              attempted ? errors.opportunityValue : "Enter the estimated opportunity value."
            }
            placeholder="Enter opportunity value"
            startAdornment={
              <MonetizationOnOutlinedIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
            }
          />
          <OpportunityField
            label="Expected Close Date"
            required
            type="date"
            value={form.expectedCloseDate}
            onChange={(value) => updateField("expectedCloseDate", value)}
            InputLabelProps={{ shrink: true }}
            error={attempted && Boolean(errors.expectedCloseDate)}
            helperText={
              attempted ? errors.expectedCloseDate : "Select the expected opportunity close date."
            }
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <OpportunityField
              label="Stage"
              required
              select
              value={form.stage}
              onChange={handleStageChange}
              error={attempted && Boolean(errors.stage)}
              helperText={attempted ? errors.stage : "Select the current opportunity stage."}
            >
              {OPPORTUNITY_STAGES.map((stage) => (
                <MenuItem
                  key={stage.value}
                  value={stage.value}
                  sx={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}
                >
                  {stage.label}
                </MenuItem>
              ))}
            </OpportunityField>
            <OpportunityField
              label="Probability (%)"
              type="number"
              value={form.probability}
              onChange={(value) => updateField("probability", value)}
              disabled={form.stage !== "new"}
              placeholder={form.stage === "new" ? "0-100" : undefined}
              inputProps={{ min: 0, max: 100 }}
              error={attempted && Boolean(errors.probability)}
              helperText={
                attempted
                  ? errors.probability
                  : form.stage === "new"
                    ? "Optional for a new opportunity."
                    : `Auto-set to ${selectedStage?.probability}%`
              }
            />
          </Stack>
          <OpportunityField
            label="Competitors"
            multiline
            minRows={3}
            value={form.competitors}
            onChange={(value) => updateField("competitors", value)}
            placeholder="Enter known competitors..."
          />
          <OpportunityField
            label="Next Steps"
            multiline
            minRows={3}
            value={form.nextSteps}
            onChange={(value) => updateField("nextSteps", value)}
            placeholder="Describe the next action or follow-up..."
          />
          {isClosedLost && (
            <ClosedLostSection
              form={form}
              attempted={attempted}
              error={errors.closeReason}
              onChange={(value) => updateField("closeReason", value)}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogFooter submitting={submitting} onClose={handleClose} onConvert={handleConvert} />
    </Dialog>
  );
};

export default ConvertOpportunityDialog;
