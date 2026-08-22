import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import {
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { ErrorState } from "@/components/common/ErrorState/ErrorState";
import { LoadingState } from "@/components/common/LoadingState/LoadingState";
import { StatusChip } from "@/components/common/StatusChip/StatusChip";
import type { Opportunity } from "@/models/opportunity/opportunity";
import { formatCurrency, formatDate } from "@/utils/formatters";

interface OpportunityViewDialogProps {
  open: boolean;
  opportunity: Opportunity | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}

export const OpportunityViewDialog = ({
  open,
  opportunity,
  loading,
  error,
  onClose,
  onRetry,
}: OpportunityViewDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={{ px: 3, py: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
        <Stack direction="row" alignItems="center" gap={1.25}>
          <Box sx={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 1.5, bgcolor: "primary.main", color: "primary.contrastText" }}>
            <BusinessCenterOutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "15px", fontWeight: 700 }}>Opportunity Details</Typography>
            {opportunity ? <Typography variant="caption" color="text.secondary">{opportunity.opportunityNumber}</Typography> : null}
          </Box>
        </Stack>
        <IconButton aria-label="Close opportunity details" size="small" onClick={onClose}>
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </DialogTitle>
    <Divider />
    <Box sx={{ px: 3, py: 2.5 }}>
      {loading ? <LoadingState label="Loading opportunity details..." /> : null}
      {!loading && error ? <ErrorState message={error} onRetry={onRetry} /> : null}
      {!loading && !error && opportunity ? <OpportunityDetails opportunity={opportunity} /> : null}
    </Box>
  </Dialog>
);

const OpportunityDetails = ({ opportunity }: { opportunity: Opportunity }) => (
  <Stack gap={2}>
    <Card variant="outlined">
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack gap={0.5}>
          <Typography variant="caption" color="text.secondary">Opportunity Name / Company</Typography>
          <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>{opportunity.name || "-"}</Typography>
          <Typography variant="body2" color="text.secondary">{opportunity.opportunityNumber || "-"}</Typography>
        </Stack>
      </CardContent>
    </Card>
    <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" } }}>
      <DetailItem label="Lead ID" value={opportunity.leadNumber} />
      <DetailItem label="Deal Value" value={formatCurrency(opportunity.opportunityValue, opportunity.currencyCode || "USD")} />
      <DetailItem label="Expected Close" value={formatDate(opportunity.expectedCloseDate ?? "")} />
      <DetailItem label="Owner" value={opportunity.ownerUserId} />
      <DetailItem label="Created" value={formatDate(opportunity.createdAt)} />
      <DetailItem label="Updated" value={formatDate(opportunity.updatedAt ?? "")} />
    </Box>
    <Card variant="outlined">
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={1.5}>
          <DetailItem label="Stage" value={<StatusChip label={String(opportunity.stage || "-").toUpperCase()} />} />
          <Stack gap={0.75} sx={{ minWidth: 190 }}>
            <Stack direction="row" justifyContent="space-between" gap={1}>
              <Typography variant="caption" color="text.secondary">WIN PROBABILITY</Typography>
              <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>{opportunity.probability}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={Math.min(100, Math.max(0, opportunity.probability))} sx={{ height: 5, borderRadius: 99 }} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
    <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
      <DetailItem label="Notes" value={opportunity.notes} />
      <DetailItem label="Closed Reason" value={opportunity.closedReason} />
      <DetailItem label="Computations" value={opportunity.computations} />
      <DetailItem label="Record Version" value={opportunity.version} />
    </Box>
  </Stack>
);

const DetailItem = ({ label, value }: { label: string; value?: ReactNode | null }) => (
  <Stack gap={0.5} sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Box sx={{ minHeight: 20, overflowWrap: "anywhere" }}>
      {value === null || value === undefined || value === "" ? <Typography variant="body2" color="text.disabled">-</Typography> : typeof value === "string" || typeof value === "number" ? <Typography variant="body2">{value}</Typography> : value}
    </Box>
  </Stack>
);
