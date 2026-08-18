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

import { useEffect, useMemo, useState } from "react";

/* ============================================================
   OPPORTUNITY STAGE OPTIONS
   ============================================================ */

const OPPORTUNITY_STAGES = [
  {
    value: "new",
    label: "New",
    probability: "",
  },
  {
    value: "qualification",
    label: "Qualification",
    probability: "10",
  },
  {
    value: "proposal",
    label: "Proposal",
    probability: "50",
  },
  {
    value: "negotiation",
    label: "Negotiation",
    probability: "80",
  },
  {
    value: "closed won",
    label: "Closed Won",
    probability: "100",
  },
  {
    value: "closed lost",
    label: "Closed Lost",
    probability: "0",
  },
];

/* ============================================================
   OPPORTUNITY FORM DATA

   IMPORTANT:
   "export" is required because LeadForm.tsx also uses
   this type.
   ============================================================ */

export interface OpportunityFormData {
  opportunityValue: string;
  stage: string;
  probability: string;
  competitors: string;
  nextSteps: string;
  closeReason: string;
}

/* ============================================================
   COMPONENT PROPS
   ============================================================ */

interface ConvertOpportunityDialogProps {
  open: boolean;
  companyName?: string;
  submitting?: boolean;

  onClose: () => void;

  onConvert: (data: OpportunityFormData) => void;
}

/* ============================================================
   COMPONENT
   ============================================================ */

const ConvertOpportunityDialog = ({
  open,
  companyName,
  submitting = false,
  onClose,
  onConvert,
}: ConvertOpportunityDialogProps) => {
  /* ==========================================================
     FORM STATE
     ========================================================== */

  const [form, setForm] = useState<OpportunityFormData>({
    opportunityValue: "",
    stage: "new",
    probability: "",
    competitors: "",
    nextSteps: "",
    closeReason: "",
  });

  /* ==========================================================
     VALIDATION STATE

     We only show validation messages after the user tries
     to convert.
     ========================================================== */

  const [attempted, setAttempted] = useState(false);

  /* ==========================================================
     UPDATE FIELD
     ========================================================== */

  const updateField = (
    field: keyof OpportunityFormData,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* ==========================================================
     CURRENT STAGE
     ========================================================== */

  const selectedStage = useMemo(() => {
    return OPPORTUNITY_STAGES.find(
      (stage) => stage.value === form.stage,
    );
  }, [form.stage]);

  /* ==========================================================
     CLOSED LOST CHECK
     ========================================================== */

  const isClosedLost = form.stage === "closed lost";

  /* ==========================================================
     STAGE CHANGE

     Probability automatically changes based on the selected
     stage.

     New:
       probability remains empty.

     Qualification:
       10%

     Proposal:
       50%

     Negotiation:
       80%

     Closed Won:
       100%

     Closed Lost:
       0%
     ========================================================== */

  const handleStageChange = (stage: string) => {
    const selected = OPPORTUNITY_STAGES.find(
      (item) => item.value === stage,
    );

    setForm((previous) => ({
      ...previous,
      stage,
      probability: selected?.probability ?? "",
      closeReason:
        stage === "closed lost"
          ? previous.closeReason
          : "",
    }));
  };

  /* ==========================================================
     VALIDATION
     ========================================================== */

  const errors = useMemo(() => {
    const next: Partial<
      Record<keyof OpportunityFormData, string>
    > = {};

    /* Opportunity Value */

    if (!form.opportunityValue.trim()) {
      next.opportunityValue =
        "Opportunity value is required.";
    } else if (
      Number.isNaN(Number(form.opportunityValue))
    ) {
      next.opportunityValue =
        "Please enter a valid number.";
    } else if (Number(form.opportunityValue) < 0) {
      next.opportunityValue =
        "Opportunity value cannot be negative.";
    }

    /* Stage */

    if (!form.stage) {
      next.stage = "Stage is required.";
    }

    /* Probability */

    if (
      form.stage !== "new" &&
      !form.probability.trim()
    ) {
      next.probability =
        "Probability is required.";
    }

    /* Closed Lost */

    if (
      isClosedLost &&
      !form.closeReason.trim()
    ) {
      next.closeReason =
        "Close reason is required when the opportunity is closed lost.";
    }

    return next;
  }, [form, isClosedLost]);

  /* ==========================================================
     RESET FORM WHEN DIALOG OPENS

     This ensures every new conversion starts clean.
     ========================================================== */

  useEffect(() => {
    if (open) {
      setForm({
        opportunityValue: "",
        stage: "new",
        probability: "",
        competitors: "",
        nextSteps: "",
        closeReason: "",
      });

      setAttempted(false);
    }
  }, [open]);

  /* ==========================================================
     CLOSE DIALOG
     ========================================================== */

  const handleClose = () => {
    if (submitting) {
      return;
    }

    onClose();
  };

  /* ==========================================================
     CONVERT BUTTON
     ========================================================== */

  const handleConvert = () => {
    if (submitting) {
      return;
    }

    setAttempted(true);

    /* Stop if validation fails */

    if (Object.keys(errors).length > 0) {
      return;
    }

    /* Send data to LeadForm */

    onConvert(form);
  };

  /* ==========================================================
     RENDER
     ========================================================== */

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
      {/* ======================================================
          HEADER
          ====================================================== */}

      <DialogTitle
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Stack
            direction="row"
            alignItems="center"
            gap={1.5}
          >
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
              <SwapHorizOutlinedIcon
                sx={{ fontSize: 21 }}
              />
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
            onClick={handleClose}
            disabled={submitting}
            sx={{
              minWidth: 32,
              width: 32,
              height: 32,
              p: 0,
              borderRadius: 1,
              color: "text.secondary",

              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <CloseOutlinedIcon sx={{ fontSize: 19 }} />
          </Button>
        </Stack>
      </DialogTitle>

      <Divider />

      {/* ======================================================
          CONTENT
          ====================================================== */}

      <DialogContent
        sx={{
          px: 3,
          py: 2.5,
        }}
      >
        <Stack spacing={2.25}>
          {/* ==================================================
              LEAD PREVIEW
              ================================================== */}

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

          {/* ==================================================
              OPPORTUNITY VALUE
              ================================================== */}

          <TextField
            fullWidth
            required
            label="Opportunity Value"
            type="number"
            value={form.opportunityValue}
            onChange={(event) =>
              updateField(
                "opportunityValue",
                event.target.value,
              )
            }
            error={
              attempted &&
              Boolean(errors.opportunityValue)
            }
            helperText={
              attempted
                ? errors.opportunityValue
                : "Enter the estimated opportunity value."
            }
            placeholder="Enter opportunity value"
            slotProps={{
              input: {
                startAdornment: (
                  <MonetizationOnOutlinedIcon
                    sx={{
                      mr: 1,
                      fontSize: 18,
                      color: "text.secondary",
                    }}
                  />
                ),
              },
            }}
            sx={{
              "& .MuiInputBase-root": {
                fontFamily: "Inter, sans-serif",
              },

              "& .MuiInputLabel-root": {
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
              },

              "& .MuiFormHelperText-root": {
                fontFamily: "Inter, sans-serif",
                fontSize: "10px",
              },
            }}
          />

          {/* ==================================================
              STAGE + PROBABILITY
              ================================================== */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
          >
            {/* STAGE */}

            <TextField
              fullWidth
              required
              select
              label="Stage"
              value={form.stage}
              onChange={(event) =>
                handleStageChange(
                  event.target.value,
                )
              }
              error={
                attempted &&
                Boolean(errors.stage)
              }
              helperText={
                attempted
                  ? errors.stage
                  : "Select the current opportunity stage."
              }
              sx={{
                "& .MuiInputBase-root": {
                  fontFamily: "Inter, sans-serif",
                },

                "& .MuiInputLabel-root": {
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                },

                "& .MuiFormHelperText-root": {
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                },
              }}
            >
              {OPPORTUNITY_STAGES.map(
                (stage) => (
                  <MenuItem
                    key={stage.value}
                    value={stage.value}
                    sx={{
                      fontFamily:
                        "Inter, sans-serif",
                      fontSize: "12px",
                    }}
                  >
                    {stage.label}
                  </MenuItem>
                ),
              )}
            </TextField>

            {/* PROBABILITY */}

            <TextField
              fullWidth
              label="Probability (%)"
              type="number"
              value={form.probability}
              onChange={(event) =>
                updateField(
                  "probability",
                  event.target.value,
                )
              }
              disabled={
                form.stage !== "new"
              }
              placeholder={
                form.stage === "new"
                  ? "0-100"
                  : undefined
              }
              inputProps={{
                min: 0,
                max: 100,
              }}
              error={
                attempted &&
                Boolean(errors.probability)
              }
              helperText={
                attempted
                  ? errors.probability
                  : form.stage === "new"
                    ? "Optional for a new opportunity."
                    : `Auto-set to ${selectedStage?.probability}%`
              }
              sx={{
                "& .MuiInputBase-root": {
                  fontFamily: "Inter, sans-serif",
                },

                "& .MuiInputLabel-root": {
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                },

                "& .MuiFormHelperText-root": {
                  fontFamily: "Inter, sans-serif",
                  fontSize: "10px",
                },
              }}
            />
          </Stack>

          {/* ==================================================
              COMPETITORS
              ================================================== */}

          <TextField
            fullWidth
            label="Competitors"
            multiline
            minRows={3}
            value={form.competitors}
            onChange={(event) =>
              updateField(
                "competitors",
                event.target.value,
              )
            }
            placeholder="Enter known competitors..."
            sx={{
              "& .MuiInputBase-root": {
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
              },

              "& .MuiInputLabel-root": {
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
              },
            }}
          />

          {/* ==================================================
              NEXT STEPS
              ================================================== */}

          <TextField
            fullWidth
            label="Next Steps"
            multiline
            minRows={3}
            value={form.nextSteps}
            onChange={(event) =>
              updateField(
                "nextSteps",
                event.target.value,
              )
            }
            placeholder="Describe the next action or follow-up..."
            sx={{
              "& .MuiInputBase-root": {
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
              },

              "& .MuiInputLabel-root": {
                fontFamily: "Inter, sans-serif",
                fontSize: "12px",
              },
            }}
          />

          {/* ==================================================
              CLOSE REASON

              Only appears when Stage = Closed Lost.
              This field is mandatory.
              ================================================== */}

          {isClosedLost && (
            <Box
              sx={{
                p: 1.75,
                borderRadius: 1.5,
                bgcolor: "#fff8f8",
                border: "1px solid",
                borderColor:
                  attempted &&
                  errors.closeReason
                    ? "error.main"
                    : "#f0d6d6",
              }}
            >
              <Typography
                sx={{
                  mb: 1.25,
                  fontFamily:
                    "Inter, sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform:
                    "uppercase",
                  letterSpacing: "0.05em",
                  color: "error.main",
                }}
              >
                Closed Lost Details
              </Typography>

              <TextField
                fullWidth
                required
                label="Close Reason"
                multiline
                minRows={3}
                value={form.closeReason}
                onChange={(event) =>
                  updateField(
                    "closeReason",
                    event.target.value,
                  )
                }
                placeholder="Enter the reason why this opportunity was lost..."
                error={
                  attempted &&
                  Boolean(
                    errors.closeReason,
                  )
                }
                helperText={
                  attempted
                    ? errors.closeReason
                    : "Required when the stage is Closed Lost."
                }
                sx={{
                  "& .MuiInputBase-root": {
                    fontFamily:
                      "Inter, sans-serif",
                    fontSize: "12px",
                    bgcolor: "#fff",
                  },

                  "& .MuiInputLabel-root": {
                    fontFamily:
                      "Inter, sans-serif",
                    fontSize: "12px",
                  },

                  "& .MuiFormHelperText-root": {
                    fontFamily:
                      "Inter, sans-serif",
                    fontSize: "10px",
                  },
                }}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>

      {/* ======================================================
          FOOTER ACTIONS
          ====================================================== */}

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          gap: 1.25,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* CANCEL */}

        <Button
          type="button"
          variant="outlined"
          startIcon={
            <CloseOutlinedIcon />
          }
          onClick={handleClose}
          disabled={submitting}
          sx={{
            minHeight: 40,
            px: 2.5,
            fontFamily:
              "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing:
              "0.04em",
            textTransform:
              "uppercase",
            color: "text.secondary",
            borderColor: "divider",

            "&:hover": {
              bgcolor: "action.hover",
              borderColor:
                "text.secondary",
            },
          }}
        >
          CANCEL
        </Button>

        {/* CONVERT */}

        <Button
          type="button"
          variant="contained"
          startIcon={
            <SwapHorizOutlinedIcon />
          }
          onClick={handleConvert}
          disabled={submitting}
          sx={{
            minHeight: 40,
            px: 2.5,
            fontFamily:
              "Inter, sans-serif",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing:
              "0.04em",
            textTransform:
              "uppercase",

            bgcolor: "#0aae83",

            "&:hover": {
              bgcolor: "#099a74",
            },
          }}
        >
          {submitting
            ? "CONVERTING..."
            : "CONVERT TO OPPORTUNITY"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConvertOpportunityDialog;