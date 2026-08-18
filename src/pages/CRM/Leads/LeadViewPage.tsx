import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ErrorState } from "@/components/common/ErrorState/ErrorState";
import { LoadingState } from "@/components/common/LoadingState/LoadingState";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { StatusChip } from "@/components/common/StatusChip/StatusChip";
import { ROUTES } from "@/constants/routes";
import type { Lead } from "@/models/lead/lead";
import { formatCompactNumber, formatDate } from "@/utils/formatters";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import { getLead } from "@/configurations/api/leadsApi";

const stages = ["Lead Capture", "Contact", "Opportunity", "Follow-Up", "Quotation"] as const;

const stageIndexFor = (status: Lead["status"]): number => {
  if (status === "New") return 0;
  if (status === "Contacted") return 1;
  if (status === "Qualified") return 2;
  return 0;
};

export const LeadViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }
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

  if (loading) {
    return <LoadingState label="Loading lead…" />;
  }

  if (error || !lead) {
    return <ErrorState message={error ?? "Lead was not found."} onRetry={() => navigate(ROUTES.crm.leads)} />;
  }

  const currentStage = stageIndexFor(lead.status);

  return (
    <Stack gap={2}>
      <PageHeader
        eyebrow="TERMINAL / CRM & CUSTOMER ENGAGEMENT"
        title="Lead Management"
        badge={<Chip label="VIEW MODE" color="primary" size="small" />}
        actions={
          <Stack direction="row" gap={1}>
            <Button variant="outlined" onClick={() => navigate(ROUTES.crm.leads)}>
              Back to dataset
            </Button>
            <Button variant="contained" onClick={() => navigate(ROUTES.crm.leadEdit(lead.id))}>
              Edit
            </Button>
          </Stack>
        }
      />

      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            gap={1}
            sx={{ overflowX: "auto", pb: 1 }}
          >
            {stages.map((stage, index) => {
              const complete = index < currentStage;
              const current = index === currentStage;
              return (
                <Stack key={stage} alignItems="center" sx={{ minWidth: 96, flex: 1 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: complete || current ? "primary.main" : "chrome.hover",
                      color: "primary.contrastText",
                    }}
                  >
                    {complete ? <CheckCircleIcon fontSize="small" /> : <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "common.white" }} />}
                  </Box>
                  <Typography variant="caption" sx={{ mt: 1, textAlign: "center" }}>
                    {stage}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Contact Information
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            }}
          >
            <Field label="Lead ID" value={lead.leadId} />
            <Field label="Lead Name" value={lead.leadName} />
            <Field label="Company" value={lead.companyName} />
            <Field label="Email" value={lead.email} />
            <Field label="Phone" value={lead.phone} />
            <Field label="Created Date" value={formatDate(lead.createdDate)} />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Qualification
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            }}
          >
            <Field label="Lead Source" value={lead.leadSource} />
            <Stack>
              <Typography variant="caption" color="text.secondary">
                STATUS
              </Typography>
              <StatusChip label={lead.status} />
            </Stack>
            <Field label="Lead Score" value={lead.leadScoreAvailable === false ? "—" : String(lead.leadScore)} />
            <Field label="Assigned To" value={lead.assignedTo} />
            <Field label="Industry" value={lead.industry ?? "—"} />
            <Field label="Subsidiary" value={lead.subsidiary ?? "—"} />
            {/* API INTEGRATION: Displays the backend company-size field. */}
            <Field label="Company Size" value={lead.companySize} />
          </Box>
        </CardContent>
      </Card>

      {/* API INTEGRATION START: Extends the existing Card/Grid pattern with lead-detail fields. */}
      <Card>
        <CardContent>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Company Details
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            }}
          >
            <Field label="Address" value={lead.address} />
            <Field label="Website" value={lead.website} />
            <Field label="Annual Revenue" value={formatAnnualRevenue(lead.annualRevenue)} />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Project Information
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            }}
          >
            <Field label="Project Type" value={lead.projectType} />
            <Field label="Project Description" value={lead.projectDescription} />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Additional Information
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            }}
          >
            <Field label="Notes" value={lead.notes} />
            <Field label="Created By" value={lead.createdBy} />
            <Field label="Updated At" value={formatDate(lead.updatedAt ?? "")} />
            <Field label="Updated By" value={lead.updatedBy} />
            <Field label="Version" value={lead.version} />
          </Box>
        </CardContent>
      </Card>
      {/* API INTEGRATION END */}

      {/* API INTEGRATION: Displays every follow-up already returned by GET lead-by-id. */}
      <Card>
        <CardContent>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Follow-Up History
          </Typography>
          {lead.followUps && lead.followUps.length > 0 ? (
            <Stack gap={2}>
              {lead.followUps.map((followUp, index) => (
                <Stack key={followUp.id ?? `${followUp.followUpDate ?? "follow-up"}-${index}`} gap={1.5}>
                  <Typography variant="body1">Follow-up {index + 1}</Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 2,
                      gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                    }}
                  >
                    <Field label="Activity Type" value={followUp.activityType} />
                    <Field label="Follow-Up Date" value={formatDate(followUp.followUpDate ?? "")} />
                    <Field label="Next Follow-Up Date" value={formatDate(followUp.nextFollowUpDate ?? "")} />
                    <Field label="Status" value={followUp.status} />
                    <Field label="Remarks" value={followUp.remarks} />
                    <Field label="Created At" value={formatDate(followUp.createdAt ?? "")} />
                    <Field label="Created By" value={followUp.createdBy} />
                  </Box>
                  <Stack gap={1}>
                    <Typography variant="caption" color="text.secondary">
                      ATTACHMENTS
                    </Typography>
                    {followUp.attachments && followUp.attachments.length > 0 ? (
                      followUp.attachments.map((attachment, attachmentIndex) => (
                        <Box
                          key={`${attachment.fileName ?? "attachment"}-${attachmentIndex}`}
                          sx={{
                            display: "grid",
                            gap: 2,
                            gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" },
                          }}
                        >
                          <Field label="File Name" value={attachment.fileName} />
                          <Field label="Content Type" value={attachment.contentType} />
                          <Field label="File Size" value={formatFileSize(attachment.fileSize)} />
                          <Field label="Created At" value={formatDate(attachment.createdAt ?? "")} />
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body1">No attachments</Typography>
                    )}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography variant="body1">No follow-ups</Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

// API INTEGRATION: Safely renders nullable lead-detail values supplied by the backend.
const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
  <Stack>
    <Typography variant="caption" color="text.secondary">
      {label.toUpperCase()}
    </Typography>
    <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
      {value === null || value === undefined || value === "" ? "—" : value}
    </Typography>
  </Stack>
);

// API INTEGRATION: Formats backend numeric values without assuming a currency.
const formatAnnualRevenue = (value?: string): string => {
  if (!value?.trim()) {
    return "—";
  }
  const amount = Number(value);
  return Number.isFinite(amount) ? formatCompactNumber(amount) : "—";
};

// API INTEGRATION: Formats attachment byte counts without inventing a download URL.
const formatFileSize = (value?: number): string =>
  typeof value === "number" ? `${formatCompactNumber(value)} bytes` : "—";
