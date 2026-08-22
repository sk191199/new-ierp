import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { Box, Button, Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";
import { IconButton, Tooltip } from "@mui/material";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/common/ErrorState/ErrorState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { LoadingState } from "@/components/common/LoadingState/LoadingState";
import { StatusChip } from "@/components/common/StatusChip/StatusChip";
import { ROUTES } from "@/constants/routes";
import type { Opportunity } from "@/models/opportunity/opportunity";
import { convertOpportunityToSalesEnquiry, deleteOpportunity, getOpportunityById } from "@/configurations/api/opportunityApi";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";

export const OpportunityViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [converting, setConverting] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setError("An opportunity ID is required.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      setOpportunity(await getOpportunityById(id));
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <LoadingState label="Loading opportunity details..." />;
  }

  if (error || !opportunity) {
    return <ErrorState message={error ?? "Opportunity was not found."} onRetry={() => void load()} />;
  }

  const probability = Math.min(100, Math.max(0, Number(opportunity.probability) || 0));

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteOpportunity(id);
      dispatch(toastShown({ message: `${opportunity.opportunityNumber} deleted.`, severity: "success" }));
      navigate(ROUTES.crm.opportunities);
    } catch (cause) {
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
    } finally {
      setDeleting(false);
    }
  };

  const handleConvert = async () => {
    if (!id) return;
    setConverting(true);
    try {
      await convertOpportunityToSalesEnquiry(id);
      dispatch(toastShown({ message: `${opportunity.opportunityNumber} converted to Sales Enquiry.`, severity: "success" }));
    } catch (cause) {
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
    } finally {
      setConverting(false);
    }
  };

  return (
    <Stack gap={{ xs: 2, md: 2.5 }}>
      <Breadcrumbs opportunity={opportunity} />
      <Card sx={{ overflow: "hidden", background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}18 0%, ${theme.palette.background.paper} 52%)` }}>
        <CardContent sx={{ p: { xs: 2, md: 3 }, "&:last-child": { pb: { xs: 2, md: 3 } } }}>
          <Stack direction={{ xs: "column", lg: "row" }} justifyContent="space-between" gap={2.5}>
            <Stack direction="row" gap={1.5} alignItems="center" minWidth={0}>
              <Box sx={{ display: "grid", placeItems: "center", width: 58, height: 58, flexShrink: 0, borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
                <BusinessCenterOutlinedIcon sx={{ fontSize: 30 }} />
              </Box>
              <Stack gap={0.5} minWidth={0}>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.12em" }}>CRM / OPPORTUNITIES / DETAILS</Typography>
                <Typography variant="h1" sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, overflowWrap: "anywhere" }}>{opportunity.name || "Unnamed Opportunity"}</Typography>
                <Typography variant="body2" color="text.secondary">{opportunity.opportunityNumber} {opportunity.leadNumber ? ` / ${opportunity.leadNumber}` : ""}</Typography>
              </Stack>
            </Stack>
            <Stack direction="row" gap={0.75} flexWrap="wrap" justifyContent="flex-end" alignItems="center">
              <Tooltip title="Print opportunity">
                <IconButton aria-label="Print opportunity" size="small" onClick={() => window.print()} sx={{ width: 38, height: 38, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
                  <PrintOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete opportunity">
                <IconButton aria-label="Delete opportunity" size="small" color="error" onClick={() => setDeleteOpen(true)} sx={{ width: 38, height: 38, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button variant="outlined" size="small" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={() => navigate(ROUTES.crm.opportunityEdit(opportunity.id))} sx={{ minHeight: 38, px: 1.5, whiteSpace: "nowrap" }}>
                Edit Opportunity
              </Button>
              <Button variant="contained" color="error" size="small" startIcon={<SwapHorizOutlinedIcon fontSize="small" />} disabled={converting} onClick={() => void handleConvert} sx={{ minHeight: 38, px: 1.75, whiteSpace: "nowrap" }}>
                {converting ? "Converting..." : "Convert to Sales Enquiry"}
              </Button>
              <Tooltip title="Back to opportunities">
                <IconButton aria-label="Back to opportunities" size="small" onClick={() => navigate(ROUTES.crm.opportunities)} sx={{ width: 38, height: 38 }}>
                  <ArrowBackRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" } }}>
        <MetricCard icon={<MonetizationOnOutlinedIcon />} label="Deal Value" value={formatCurrency(opportunity.opportunityValue, opportunity.currencyCode || "USD")} />
        <MetricCard icon={<BusinessCenterOutlinedIcon />} label="Stage" value={<StatusChip label={displayLabel(opportunity.stage)} />} />
        <MetricCard icon={<TrendingUpRoundedIcon />} label="Win Probability" value={`${probability}%`} progress={probability} />
        <MetricCard icon={<CalendarTodayOutlinedIcon />} label="Expected Close" value={formatDate(opportunity.expectedCloseDate ?? "")} />
      </Box>
      <Box sx={{ display: "grid", gap: { xs: 2, md: 2.5 }, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.35fr) minmax(300px, 0.65fr)" }, alignItems: "start" }}>
        <Stack gap={{ xs: 2, md: 2.5 }}>
          <DetailCard title="Primary Information" icon={<BusinessCenterOutlinedIcon />}>
            <DetailGrid>
              <DetailItem label="Opportunity ID" value={opportunity.opportunityNumber} />
              <DetailItem label="Opportunity Name / Company" value={opportunity.name} />
              <DetailItem label="Lead ID" value={opportunity.leadNumber} link={opportunity.leadId ? ROUTES.crm.leadView(opportunity.leadId) : undefined} />
              <DetailItem label="Customer ID" value={opportunity.customerId} />
              <DetailItem label="Currency" value={opportunity.currencyCode} />
              <DetailItem label="Status" value={displayLabel(opportunity.status)} />
            </DetailGrid>
          </DetailCard>
          <DetailCard title="Additional Information" icon={<TrendingUpRoundedIcon />}>
            <DetailGrid>
              <DetailItem label="Notes" value={opportunity.notes} wide />
              <DetailItem label="Closed Reason" value={opportunity.closedReason} />
              <DetailItem label="Computations" value={opportunity.computations} />
            </DetailGrid>
          </DetailCard>
          <FollowUpCard opportunity={opportunity} />
        </Stack>
        <Stack gap={{ xs: 2, md: 2.5 }}>
          <DetailCard title="Classification" icon={<TrendingUpRoundedIcon />}>
            <DetailGrid singleColumn>
              <DetailItem label="Stage" value={<StatusChip label={displayLabel(opportunity.stage)} />} />
              <DetailItem label="Owner" value={opportunity.ownerUserId} />
              <DetailItem label="Subsidiary" value={opportunity.subsidiaryId} />
            </DetailGrid>
          </DetailCard>
          <DetailCard title="System Information" icon={<CalendarTodayOutlinedIcon />}>
            <DetailGrid singleColumn>
              <DetailItem label="Created" value={formatDate(opportunity.createdAt)} />
              <DetailItem label="Created By" value={opportunity.createdBy} />
              <DetailItem label="Updated" value={formatDate(opportunity.updatedAt ?? "")} />
              <DetailItem label="Updated By" value={opportunity.updatedBy} />
              <DetailItem label="Record Version" value={opportunity.version} />
            </DetailGrid>
          </DetailCard>
        </Stack>
      </Box>
      <ConfirmDialog
        open={deleteOpen}
        title="Delete opportunity"
        description={`Delete ${opportunity.opportunityNumber} (${opportunity.name || "Unnamed opportunity"})? This action cannot be undone.`}
        confirmLabel="Delete"
        tone="error"
        loading={deleting}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
      />
    </Stack>
  );
};

const Breadcrumbs = ({ opportunity }: { opportunity: Opportunity }) => (
  <Stack direction="row" gap={1} alignItems="center" sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: "background.paper", border: 1, borderColor: "divider", color: "text.secondary", overflow: "hidden" }}>
    <RouterLink to={ROUTES.dashboard} style={{ color: "inherit", textDecoration: "none" }}>Home</RouterLink>
    <Typography color="text.disabled">/</Typography>
    <RouterLink to={ROUTES.crm.opportunities} style={{ color: "inherit", textDecoration: "none" }}>CRM / Opportunities</RouterLink>
    <Typography color="text.disabled">/</Typography>
    <Typography color="text.primary" noWrap>{opportunity.opportunityNumber}</Typography>
  </Stack>
);

const MetricCard = ({ icon, label, value, progress }: { icon: ReactNode; label: string; value: ReactNode; progress?: number }) => (
  <Card><CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}><Stack direction="row" gap={1.25} alignItems="center"><Box sx={{ display: "grid", placeItems: "center", width: 42, height: 42, flexShrink: 0, borderRadius: 1.5, bgcolor: "action.hover", color: "primary.main" }}>{icon}</Box><Stack gap={0.35} minWidth={0}><Typography variant="caption" color="text.secondary">{label}</Typography><Box sx={{ fontSize: "1.15rem", fontWeight: 700, overflowWrap: "anywhere" }}>{value}</Box>{progress !== undefined ? <LinearProgress variant="determinate" value={progress} sx={{ mt: 0.5, height: 4, borderRadius: 99 }} /> : null}</Stack></Stack></CardContent></Card>
);

const DetailCard = ({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) => (
  <Card><CardContent sx={{ p: { xs: 2, md: 2.5 }, "&:last-child": { pb: { xs: 2, md: 2.5 } } }}><Stack direction="row" gap={1} alignItems="center" sx={{ mb: 2 }}><Box sx={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 1.25, bgcolor: "action.hover", color: "primary.main" }}>{icon}</Box><Typography variant="h3" sx={{ fontSize: "1rem", textTransform: "uppercase" }}>{title}</Typography></Stack>{children}</CardContent></Card>
);

const DetailGrid = ({ children, singleColumn = false }: { children: ReactNode; singleColumn?: boolean }) => <Box sx={{ display: "grid", gap: 1.75, gridTemplateColumns: singleColumn ? "1fr" : { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>{children}</Box>;

const DetailItem = ({ label, value, link, wide }: { label: string; value?: ReactNode | null; link?: string; wide?: boolean }) => (
  <Stack gap={0.5} sx={{ minWidth: 0, gridColumn: wide ? { sm: "1 / -1" } : undefined }}><Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.06em" }}>{label}</Typography>{value === null || value === undefined || value === "" ? <Typography variant="body2" color="text.disabled">-</Typography> : link ? <Typography component={RouterLink} to={link} variant="body2" color="primary.main" sx={{ fontWeight: 600, textDecoration: "none" }}>{value}</Typography> : <Typography variant="body2" sx={{ overflowWrap: "anywhere", whiteSpace: typeof value === "string" && value.length > 80 ? "pre-wrap" : "normal" }}>{value}</Typography>}</Stack>
);

const FollowUpCard = ({ opportunity }: { opportunity: Opportunity }) => (
  <DetailCard title="Follow-Up Activity" icon={<CalendarTodayOutlinedIcon />}>
    {opportunity.followUps.length === 0 ? <Typography variant="body2" color="text.secondary">No follow-up activity recorded.</Typography> : <Stack gap={1.5}>{opportunity.followUps.map((followUp) => <Box key={followUp.id} sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 1.5, bgcolor: "action.hover" }}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}><Typography variant="subtitle2">{followUp.activityType || "Follow-Up"}</Typography><Typography variant="caption" color="text.secondary">{formatDate(followUp.followUpDate)}</Typography></Stack><Typography variant="body2" sx={{ mt: 0.75 }}>{followUp.remarks || "No remarks recorded."}</Typography>{followUp.status ? <Box sx={{ mt: 1 }}><StatusChip label={displayLabel(followUp.status)} /></Box> : null}</Box>)}</Stack>}
  </DetailCard>
);

const displayLabel = (value: unknown): string => String(value ?? "").trim().toUpperCase() || "-";
