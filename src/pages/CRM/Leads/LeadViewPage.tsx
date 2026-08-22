import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { ErrorState } from "@/components/common/ErrorState/ErrorState";
import { LoadingState } from "@/components/common/LoadingState/LoadingState";
import { StatusChip } from "@/components/common/StatusChip/StatusChip";
import { ROUTES } from "@/constants/routes";
import type { Lead, LeadFollowUp } from "@/models/lead/lead";
import { formatCompactNumber, formatDate } from "@/utils/formatters";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import { getLead } from "@/configurations/api/leadsApi";

const stages = ["Lead Capture", "Contact", "Opportunity", "Follow-Up", "Quotation"] as const;

const stageIndexFor = (status: Lead["status"]): number => {
  if (status === "New") return 0;
  if (status === "Qualified") return 2;
  return 0;
};

const cardSx = { height: "100%", borderRadius: 2.5, overflow: "hidden" };
const cardContentSx = { p: { xs: 2, md: 2.5 }, "&:last-child": { pb: { xs: 2, md: 2.5 } } };

export const LeadViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        setLead(await getLead(id));
      } catch (cause) {
        setError(getErrorMessage(cause));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  if (loading) return <LoadingState label="Loading lead…" />;
  if (error || !lead) {
    return <ErrorState message={error ?? "Lead was not found."} onRetry={() => navigate(ROUTES.crm.leads)} />;
  }

  const currentStage = stageIndexFor(lead.status);
  const score = lead.leadScoreAvailable === false ? undefined : lead.leadScore;

  return (
    <Stack gap={{ xs: 2, md: 2.5 }}>
      <ProfileHero
        lead={lead}
        onBack={() => navigate(ROUTES.crm.leads)}
        onEdit={() => navigate(ROUTES.crm.leadEdit(lead.id))}
      />
      <Pipeline currentStage={currentStage} />
      <Box
        sx={{
          display: "grid",
          gap: { xs: 2, md: 2.5 },
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.35fr) minmax(300px, 0.65fr)" },
          alignItems: "start",
        }}
      >
        <Stack gap={{ xs: 2, md: 2.5 }}>
          <DetailCard tone="info" title="Contact Information" icon={<PersonOutlineOutlinedIcon />}>
            <DetailGrid>
              <DetailField icon={<FolderOpenOutlinedIcon />} label="Lead ID" value={lead.leadId} />
              <DetailField icon={<PersonOutlineOutlinedIcon />} label="Contact Person" value={lead.leadName} />
              <DetailField icon={<BusinessOutlinedIcon />} label="Company" value={lead.companyName} />
              <DetailField icon={<EmailOutlinedIcon />} label="Email" value={lead.email} />
              <DetailField icon={<PhoneOutlinedIcon />} label="Phone" value={lead.phone} />
              <DetailField icon={<CalendarTodayOutlinedIcon />} label="Created Date" value={formatDate(lead.createdDate)} />
            </DetailGrid>
          </DetailCard>
          <DetailCard tone="success" title="Company Details" icon={<BusinessOutlinedIcon />}>
            <DetailGrid>
              <DetailField icon={<BusinessOutlinedIcon />} label="Company Size" value={lead.companySize} />
              <DetailField icon={<TrendingUpRoundedIcon />} label="Industry" value={lead.industry} />
              <DetailField icon={<LocationOnOutlinedIcon />} label="Address" value={lead.address} wide />
              <DetailField icon={<LanguageOutlinedIcon />} label="Website" value={lead.website} />
              <DetailField label="Annual Revenue" value={formatAnnualRevenue(lead.annualRevenue)} />
            </DetailGrid>
          </DetailCard>
          <DetailCard tone="warning" title="Project Information" icon={<NotesOutlinedIcon />}>
            <DetailGrid>
              <DetailField icon={<FolderOpenOutlinedIcon />} label="Project Type" value={lead.projectType} />
              <DetailField icon={<NotesOutlinedIcon />} label="Project Description" value={lead.projectDescription} wide multiline />
            </DetailGrid>
          </DetailCard>
          <ActivityTimeline followUps={lead.followUps ?? []} />
        </Stack>
        <Stack gap={{ xs: 2, md: 2.5 }}>
          <DetailCard tone="primary" title="Qualification" icon={<TrendingUpRoundedIcon />}>
            <Stack gap={2.25}>
              <ScorePanel score={score} />
              <DetailGrid singleColumn>
                <DetailField label="Lead Source" value={lead.leadSource} />
                <DetailField label="Assigned To" value={lead.assignedTo} icon={<AssignmentIndOutlinedIcon />} />
                <DetailField label="Industry" value={lead.industry} />
                <DetailField label="Subsidiary" value={lead.subsidiary} />
              </DetailGrid>
            </Stack>
          </DetailCard>
          <DetailCard tone="secondary" title="Additional Information" icon={<NotesOutlinedIcon />}>
            <DetailGrid singleColumn>
              <DetailField label="Notes" value={lead.notes} multiline />
              <DetailField label="Created By" value={lead.createdBy} />
              <DetailField label="Updated At" value={formatDate(lead.updatedAt ?? "")} />
              <DetailField label="Updated By" value={lead.updatedBy} />
              <DetailField label="Version" value={lead.version} />
            </DetailGrid>
          </DetailCard>
        </Stack>
      </Box>
    </Stack>
  );
};

const ProfileHero = ({ lead, onBack, onEdit }: { lead: Lead; onBack: () => void; onEdit: () => void }) => (
  <Card
    sx={{
      borderRadius: 3,
      overflow: "hidden",
      background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.13)} 0%, ${theme.palette.background.paper} 48%)`,
    }}
  >
    <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, "&:last-child": { pb: { xs: 2.5, md: 3.5 } } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={3}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems={{ xs: "flex-start", sm: "center" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.primary.main, 0.24)}`,
            }}
          >
            <BusinessOutlinedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Stack gap={0.75}>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.14em" }}>
              CRM / LEADS / LEAD DETAILS
            </Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: "1.65rem", md: "2.15rem" }, letterSpacing: "-0.02em" }}>
                {lead.companyName}
            </Typography>
            <Stack direction="row" gap={1} flexWrap="wrap" alignItems="center">
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>{lead.leadName}</Typography>
              <Typography variant="caption" color="text.disabled">• {lead.leadId}</Typography>
            </Stack>
            <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
              <StatusChip label={lead.status} />
              <Chip label={lead.leadSource || "SOURCE UNKNOWN"} size="small" variant="outlined" />
            </Stack>
          </Stack>
        </Stack>
        <Stack direction={{ xs: "row", md: "column" }} gap={1} alignItems={{ xs: "stretch", md: "flex-end" }}>
          <Button variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={onBack}>BACK TO LEADS</Button>
          <Button variant="contained" onClick={onEdit}>EDIT LEAD</Button>
        </Stack>
      </Stack>
      <Box
        sx={{
          mt: 3,
          pt: 2.25,
          borderTop: 1,
          borderColor: "divider",
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" },
        }}
      >
        <HeroMetric label="Lead Score" value={lead.leadScoreAvailable === false ? "—" : String(lead.leadScore)} />
        <HeroMetric label="Assigned To" value={lead.assignedTo} />
        <HeroMetric label="Created" value={formatDate(lead.createdDate)} />
      </Box>
    </CardContent>
  </Card>
);

const HeroMetric = ({ label, value }: { label: string; value?: string }) => (
  <Stack gap={0.35}>
    <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.1em" }}>{label}</Typography>
    <Typography variant="subtitle1" sx={{ overflowWrap: "anywhere" }}>{value || "—"}</Typography>
  </Stack>
);

const Pipeline = ({ currentStage }: { currentStage: number }) => (
  <Card sx={{ borderRadius: 2.5 }}>
    <CardContent sx={{ p: { xs: 2, md: 2.5 }, "&:last-child": { pb: { xs: 2, md: 2.5 } } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>Pipeline Progress</Typography>
          <Typography variant="body2" color="text.secondary">Current lead journey stage</Typography>
        </Box>
        <Chip label={`${currentStage + 1} / ${stages.length}`} size="small" color="primary" variant="outlined" />
      </Stack>
      <Box sx={{ display: "flex", minWidth: { xs: 610, md: 0 }, overflowX: "auto", pb: { xs: 0.5, md: 0 } }}>
        {stages.map((stage, index) => {
          const complete = index < currentStage;
          const current = index === currentStage;
          return (
            <Box key={stage} sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: { xs: 122, md: 0 } }}>
              <Stack alignItems="center" gap={0.8} sx={{ minWidth: 92, flex: 1 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: complete || current ? "primary.main" : "action.hover",
                    color: complete || current ? "primary.contrastText" : "text.disabled",
                    border: 1,
                    borderColor: complete || current ? "primary.main" : "divider",
                    boxShadow: current ? (theme) => `0 0 0 5px ${alpha(theme.palette.primary.main, 0.13)}` : "none",
                  }}
                >
                  {complete ? <CheckCircleIcon fontSize="small" /> : <Typography variant="caption">{index + 1}</Typography>}
                </Box>
                <Typography variant="caption" color={current ? "primary.main" : complete ? "text.primary" : "text.secondary"} sx={{ textAlign: "center", fontWeight: current ? 800 : 600 }}>{stage}</Typography>
              </Stack>
              {index < stages.length - 1 ? <Box sx={{ height: 2, flex: { xs: "0 0 28px", md: 1 }, bgcolor: index < currentStage ? "primary.main" : "divider", mb: 2.25 }} /> : null}
            </Box>
          );
        })}
      </Box>
    </CardContent>
  </Card>
);

const DetailCard = ({
  title,
  icon,
  children,
  tone = "primary",
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  tone?: "primary" | "info" | "success" | "warning" | "secondary";
}) => (
  <Card
    sx={(theme) => ({
      ...cardSx,
      position: "relative",
      background: `radial-gradient(circle at 100% 0%, ${alpha(theme.palette[tone].main, 0.14)} 0%, transparent 34%), linear-gradient(135deg, ${alpha(theme.palette[tone].main, 0.095)} 0%, ${theme.palette.background.paper} 48%)`,
      "&::before": {
        content: '""',
        position: "absolute",
        inset: "0 auto 0 0",
        width: 4,
        bgcolor: theme.palette[tone].main,
      },
    })}
  >
    <CardContent sx={cardContentSx}>
      <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 2.25 }}>
        <Box
          sx={(theme) => ({
            display: "grid",
            placeItems: "center",
            width: 34,
            height: 34,
            borderRadius: 1.5,
            bgcolor: alpha(theme.palette[tone].main, 0.13),
            color: theme.palette[tone].main,
          })}
        >
          {icon}
        </Box>
        <Typography variant="h3" sx={{ fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</Typography>
      </Stack>
      {children}
    </CardContent>
  </Card>
);

const DetailGrid = ({ children, singleColumn = false }: { children: ReactNode; singleColumn?: boolean }) => (
  <Box sx={{ display: "grid", gap: { xs: 1.75, md: 2 }, gridTemplateColumns: singleColumn ? "1fr" : { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>{children}</Box>
);

const DetailField = ({ label, value, icon, wide, multiline }: { label: string; value?: string | number | null; icon?: ReactNode; wide?: boolean; multiline?: boolean }) => (
  <Stack gap={0.5} sx={{ minWidth: 0, gridColumn: wide ? { sm: "1 / -1" } : undefined }}>
    <Stack direction="row" gap={0.6} alignItems="center">
      {icon ? <Box sx={{ display: "grid", placeItems: "center", color: "text.secondary" }}>{icon}</Box> : null}
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>{label.toUpperCase()}</Typography>
    </Stack>
    <Typography variant="body1" sx={{ whiteSpace: multiline ? "pre-wrap" : "normal", overflowWrap: "anywhere", color: value ? "text.primary" : "text.disabled" }}>
      {value === null || value === undefined || value === "" ? "—" : value}
    </Typography>
  </Stack>
);

const ScorePanel = ({ score }: { score?: number }) => (
  <Box
    sx={(theme) => ({
      p: 2,
      borderRadius: 2,
      border: 1,
      borderColor: alpha(theme.palette.primary.main, 0.28),
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)} 0%, ${alpha(theme.palette.info.main, 0.07)} 100%)`,
    })}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" gap={2}>
      <Stack gap={0.5}>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.1em" }}>LEAD SCORE</Typography>
        <Typography variant="h2" sx={{ color: score === undefined ? "text.disabled" : "primary.main" }}>{score === undefined ? "—" : score}</Typography>
      </Stack>
      <TrendingUpRoundedIcon color={score === undefined ? "disabled" : "primary"} sx={{ fontSize: 34 }} />
    </Stack>
    <LinearProgress variant="determinate" value={score === undefined ? 0 : Math.min(100, Math.max(0, score))} sx={{ mt: 1.5, height: 6, borderRadius: 99 }} />
  </Box>
);

const ActivityTimeline = ({ followUps }: { followUps: LeadFollowUp[] }) => (
  <Card
    sx={(theme) => ({
      ...cardSx,
      position: "relative",
      background: `radial-gradient(circle at 100% 0%, ${alpha(theme.palette.info.main, 0.15)} 0%, transparent 30%), linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.08)} 0%, ${theme.palette.background.paper} 44%)`,
      "&::before": {
        content: '""',
        position: "absolute",
        inset: "0 auto 0 0",
        width: 4,
        bgcolor: theme.palette.info.main,
      },
    })}
  >
    <CardContent sx={cardContentSx}>
      <Stack direction="row" gap={1} alignItems="center" sx={{ mb: 2.25 }}>
        <Box sx={(theme) => ({ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 1.5, bgcolor: alpha(theme.palette.info.main, 0.14), color: "info.main" })}><ScheduleOutlinedIcon /></Box>
        <Box>
          <Typography variant="h3" sx={{ fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>Follow-Up Activity</Typography>
          <Typography variant="body2" color="text.secondary">Read-only activity history</Typography>
        </Box>
      </Stack>
      {followUps.length === 0 ? <EmptyState title="No follow-up activity yet" description="Activity will appear here once the lead has a recorded follow-up." /> : <Stack>{[...followUps].reverse().map((followUp, index) => <ActivityItem key={followUp.id ?? `${followUp.followUpDate ?? "follow-up"}-${index}`} followUp={followUp} latest={index === 0} last={index === followUps.length - 1} />)}</Stack>}
    </CardContent>
  </Card>
);

const ActivityItem = ({ followUp, latest, last }: { followUp: LeadFollowUp; latest: boolean; last: boolean }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: "24px minmax(0, 1fr)", columnGap: 1.5 }}>
    <Stack alignItems="center" sx={{ height: "100%" }}>
      <Box sx={{ mt: 0.5, width: 12, height: 12, borderRadius: "50%", bgcolor: latest ? "primary.main" : "text.disabled", boxShadow: latest ? (theme) => `0 0 0 5px ${alpha(theme.palette.primary.main, 0.13)}` : "none", flexShrink: 0 }} />
      {!last ? <Box sx={{ width: 1, flex: 1, bgcolor: "divider", my: 0.75 }} /> : null}
    </Stack>
    <Box sx={{ pb: last ? 0 : 2.5 }}>
      <Box sx={{ p: { xs: 1.5, md: 2 }, border: 1, borderColor: latest ? "primary.main" : "divider", borderRadius: 2, bgcolor: latest ? "action.hover" : "background.paper" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1} sx={{ mb: 1.5 }}>
          <Stack gap={0.35}><Typography variant="subtitle1" sx={{ textTransform: "uppercase" }}>{followUp.activityType || "Follow-Up"}</Typography><Typography variant="caption" color="text.secondary">{formatDate(followUp.followUpDate ?? "")}</Typography></Stack>
          {followUp.status ? <StatusChip label={followUp.status} /> : null}
        </Stack>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", mb: 1.5 }}>{followUp.remarks || "No remarks recorded."}</Typography>
        <Box sx={{ display: "grid", gap: 1.25, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
          <DetailField label="Next Follow-Up" value={formatDate(followUp.nextFollowUpDate ?? "")} />
          <DetailField label="Created At" value={formatDate(followUp.createdAt ?? "")} />
          <DetailField label="Created By" value={followUp.createdBy} />
        </Box>
        <AttachmentList attachments={followUp.attachments ?? []} />
      </Box>
    </Box>
  </Box>
);

const AttachmentList = ({ attachments }: { attachments: NonNullable<LeadFollowUp["attachments"]> }) => (
  <Stack gap={1} sx={{ mt: 1.5 }}>
    <Stack direction="row" gap={0.75} alignItems="center">
      <AttachFileOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
        ATTACHMENTS
      </Typography>
    </Stack>
    {attachments.length === 0 ? (
      <Typography variant="body2" color="text.disabled">
        No attachments
      </Typography>
    ) : (
      <Stack gap={0.75}>
        {attachments.map((attachment, index) => (
          <Stack
            key={`${attachment.fileName ?? "attachment"}-${index}`}
            direction="row"
            gap={1}
            alignItems="center"
            sx={{ p: 1, borderRadius: 1.5, bgcolor: "action.hover", minWidth: 0 }}
          >
            <FolderOpenOutlinedIcon color="primary" fontSize="small" />
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                {attachment.fileName || "Unnamed file"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {[attachment.contentType, formatFileSize(attachment.fileSize), formatDate(attachment.createdAt ?? "")]
                  .filter((item) => item !== "—")
                  .join(" · ") || "—"}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>
    )}
  </Stack>
);

const formatAnnualRevenue = (value?: string): string => {
  if (!value?.trim()) {
    return "—";
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? formatCompactNumber(amount) : value;
};

const formatFileSize = (value?: number): string => {
  return typeof value === "number" ? `${formatCompactNumber(value)} bytes` : "—";
};
