import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { KpiCard } from "@/components/cards/KpiCard/KpiCard";
import { BarChart } from "@/components/charts/BarChart";
import { ErrorState } from "@/components/common/ErrorState/ErrorState";
import { LoadingState } from "@/components/common/LoadingState/LoadingState";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { StatusChip } from "@/components/common/StatusChip/StatusChip";
import { KpiSkeletonRow } from "@/components/tables/DataTable/DataTableSkeleton";
import type { DashboardSnapshot } from "@/models/dashboard/dashboard";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import { getDashboardSnapshot } from "@/configurations/api/dashboardApi";

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setSnapshot(await getDashboardSnapshot());
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading && !snapshot) {
    return (
      <Stack gap={2}>
        <PageHeader title="Management Console" />
        <KpiSkeletonRow />
        <LoadingState label="Assembling management console…" />
      </Stack>
    );
  }

  if (error || !snapshot) {
    return <ErrorState message={error ?? "Dashboard data is unavailable."} onRetry={() => void load()} />;
  }

  return (
    <Stack gap={2.25}>
      <PageHeader
        title="Management Console"
        description={`FISCAL PERIOD: ${snapshot.fiscalPeriod}`}
      />

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", xl: "repeat(4, minmax(0, 1fr))" },
        }}
      >
        {snapshot.kpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.6fr) minmax(280px, 1fr)" },
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 2 }}>
              Commercial Performance
            </Typography>
            <BarChart points={snapshot.commercialPerformance} />
          </CardContent>
        </Card>

        <Stack gap={1.5}>
          <Card>
            <CardContent>
              <Typography variant="h3" sx={{ mb: 1.5 }}>
                Pending Approvals
              </Typography>
              {snapshot.pendingApprovals.map((item) => (
                <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                  <Typography variant="body2">
                    {item.count} {item.label}
                  </Typography>
                  <Stack direction="row" gap={1}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => dispatch(toastShown({ message: "Approval queued for workflow.", severity: "success" }))}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => dispatch(toastShown({ message: "Review workspace opens in workflow.", severity: "info" }))}
                    >
                      Review
                    </Button>
                  </Stack>
                </Stack>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h3">{snapshot.anomaly.title}</Typography>
                <StatusChip label="NEURAL STRATEGY" tone="info" />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {snapshot.anomaly.body}
              </Typography>
              <Stack gap={0.75} sx={{ mb: 2 }}>
                {snapshot.anomaly.checks.map((check) => (
                  <Stack key={check.id} direction="row" gap={1} alignItems="center">
                    {check.done ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <RadioButtonUncheckedIcon color="disabled" fontSize="small" />
                    )}
                    <Typography variant="body2">{check.label}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Button
                fullWidth
                variant="contained"
                onClick={() =>
                  dispatch(toastShown({ message: "Mitigation remains draft-first until approval.", severity: "info" }))
                }
              >
                Execute Mitigation
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h3" sx={{ mb: 1.5 }}>
            High-Value Audit Logs
          </Typography>
          <Stack gap={1.25}>
            {snapshot.auditLogs.map((item) => (
              <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2">{item.party}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.amount}
                  </Typography>
                </Box>
                <StatusChip label={item.status} />
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 1.5 }}>
              Executive Intelligence
            </Typography>
            <Stack gap={1.5}>
              {snapshot.intelligence.map((item) => (
                <Box key={item.id}>
                  <Typography variant="caption" color="primary.light">
                    {item.title.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.body}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h3" sx={{ mb: 1.5 }}>
              Activity Stream
            </Typography>
            <Stack gap={1.5}>
              {snapshot.activity.map((item) => (
                <Box key={item.id}>
                  <Typography variant="subtitle2">
                    {item.actor} ({item.role})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.action} · {item.occurredAgo}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Stack>
  );
};
