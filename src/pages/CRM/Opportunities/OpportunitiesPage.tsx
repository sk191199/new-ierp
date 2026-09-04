import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { alpha } from "@mui/material/styles";
import { Box, Button, IconButton, LinearProgress, Link, Stack, Tooltip, Typography } from "@mui/material";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { KpiCard } from "@/components/cards/KpiCard/KpiCard";
import { ErrorState } from "@/components/common/ErrorState/ErrorState";
import { FilterPanel } from "@/components/common/FilterPanel/FilterPanel";
import { LoadingState } from "@/components/common/LoadingState/LoadingState";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { SelectField } from "@/components/forms/fields";
import { StatusChip } from "@/components/common/StatusChip/StatusChip";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { DataTable } from "@/components/tables/DataTable/DataTable";
import { ROUTES } from "@/constants/routes";
import { useTableState } from "@/hooks/useTableState";
import type { KpiMetric } from "@/models/dashboard/dashboard";
import type { Opportunity } from "@/models/opportunity/opportunity";
import { deleteOpportunity, listOpportunities } from "@/configurations/api/opportunityApi";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import { formatCurrency } from "@/utils/formatters";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";

const stageOptions = [
  { value: "", label: "All stages" },
  { value: "prospecting", label: "Prospecting" },
  { value: "new", label: "New" },
  { value: "qualification", label: "Qualification" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "closed won", label: "Closed Won" },
  { value: "closed lost", label: "Closed Lost" },
];

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "New", label: "New" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

const getKpis = (opportunities: Opportunity[]): KpiMetric[] => {
  const open = opportunities.filter((opportunity) => !isClosed(opportunity));
  const applicable = opportunities.filter((opportunity) =>
    Number.isFinite(opportunity.probability),
  );
  const pipelineValue = open.reduce(
    (total, opportunity) => total + opportunity.opportunityValue,
    0,
  );
  const averageProbability = applicable.length
    ? applicable.reduce((total, opportunity) => total + opportunity.probability, 0) /
      applicable.length
    : 0;

  return [
    {
      id: "pipeline-value",
      label: "Pipeline Value",
      value: formatCurrency(pipelineValue, open[0]?.currencyCode || "USD"),
      icon: "trend",
    },
    {
      id: "open-deals",
      label: "Open Deals",
      value: String(open.length),
      icon: "people",
    },
    {
      id: "win-rate",
      label: "Average Win Rate",
      value: `${averageProbability.toFixed(1)}%`,
      icon: "check",
    },
  ];
};

const isClosed = (opportunity: Opportunity): boolean => {
  const status = opportunity.status.trim().toLowerCase();
  const stage = opportunity.stage.trim().toLowerCase();
  return (
    status === "closed" ||
    status === "closed won" ||
    status === "closed lost" ||
    stage === "closed won" ||
    stage === "closed lost"
  );
};

const displayLabel = (value: unknown): string => String(value ?? "").toUpperCase() || "-";

const ProbabilityCell = ({ value }: { value: number }) => (
  <Stack direction="row" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
    <LinearProgress
      variant="determinate"
      value={Math.min(100, Math.max(0, value))}
      sx={{
        width: 48,
        flexShrink: 0,
        height: 4,
        "& .MuiLinearProgress-bar": { bgcolor: "primary.main" },
      }}
    />
    <Typography sx={{ fontSize: "12px", lineHeight: 1.2 }}>{value}%</Typography>
  </Stack>
);

export const OpportunitiesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const tableState = useTableState({ pageSize: 8, sortBy: "expectedCloseDate", sortDir: "asc" });
  const [rows, setRows] = useState<Opportunity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState("");
  const [status, setStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);
  const [deleting, setDeleting] = useState(false);

  const query = tableState.query;
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listOpportunities({
        ...query,
        stage: stage || undefined,
        status: status || undefined,
      });
      setRows(result.data);
      setTotal(result.pagination.total);
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [query, stage, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    try {
      await deleteOpportunity(deleteTarget.id);
      setRows((current) => current.filter((row) => row.id !== deleteTarget.id));
      setTotal((current) => Math.max(0, current - 1));
      setDeleteTarget(null);
      dispatch(toastShown({ message: `${deleteTarget.opportunityNumber} deleted.`, severity: "success" }));
      await load();
    } catch (cause) {
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
    } finally {
      setDeleting(false);
    }
  };

  const sorting = useMemo<SortingState>(
    () => (query.sortBy ? [{ id: query.sortBy, desc: query.sortDir === "desc" }] : []),
    [query.sortBy, query.sortDir],
  );

  const columns = useMemo<ColumnDef<Opportunity>[]>(
    () => [
      {
        accessorKey: "opportunityNumber",
        header: "Opportunity ID",
        size: 160,
        minSize: 148,
        cell: ({ getValue }) => (
          <Typography sx={{ fontSize: "12px", lineHeight: 1.3, fontWeight: 600 }}>
            {String(getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: "name",
        header: "Opportunity Name",
        size: 200,
        minSize: 140,
        cell: ({ getValue }) => (
          <Typography
            sx={{
              fontSize: "13px",
              lineHeight: 1.3,
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {String(getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: "leadNumber",
        header: "Lead ID",
        size: 140,
        minSize: 120,
        cell: ({ row, getValue }) => (
          <Link
            component={RouterLink}
            to={ROUTES.crm.leadView(row.original.leadId)}
            sx={{ fontSize: "12px", lineHeight: 1.3, fontWeight: 500 }}
          >
            {String(getValue())}
          </Link>
        ),
      },
      {
        accessorKey: "stage",
        header: "Stage",
        size: 130,
        minSize: 120,
        cell: ({ getValue }) => <StatusChip label={displayLabel(getValue())} />,
      },
      {
        accessorKey: "opportunityValue",
        header: "Deal Value",
        size: 150,
        minSize: 128,
        cell: ({ row }) => (
          <Typography sx={{ fontSize: "12px", lineHeight: 1.3, fontWeight: 500, whiteSpace: "nowrap" }}>
            {formatCurrency(row.original.opportunityValue, row.original.currencyCode || "USD")}
          </Typography>
        ),
      },
      {
        accessorKey: "probability",
        header: "Win Probability",
        size: 155,
        minSize: 140,
        cell: ({ getValue }) => <ProbabilityCell value={Number(getValue()) || 0} />,
      },
    ],
    [],
  );

  if (loading && rows.length === 0) {
    return (
      <Stack gap={2}>
        <PageHeader title="Opportunity Pipeline" />
        <LoadingState label="Loading opportunities…" />
      </Stack>
    );
  }

  if (error && rows.length === 0) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <Stack gap={2.25}>
      <PageHeader
        eyebrow="TERMINAL · CRM & CUSTOMER ENGAGEMENT"
        title="Opportunity Pipeline"
        description="Track active deals, forecast value, and close momentum."
        actions={
          <Stack direction="row" gap={1} alignItems="center">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(ROUTES.crm.opportunityNew)}
              sx={{
                letterSpacing: "0.08em",
                boxShadow: (theme) => `0 0 22px ${alpha(theme.palette.primary.main, 0.45)}`,
              }}
            >
              NEW OPPORTUNITY
            </Button>
            <Tooltip title="Worklist settings">
              <IconButton
                aria-label="Worklist settings"
                onClick={() => navigate(ROUTES.settings)}
                sx={{ width: 40, height: 40, border: 1, borderColor: "divider", borderRadius: 1.5 }}
              >
                <SettingsOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        }
      />
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
        }}
      >
        {getKpis(rows).map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </Box>
      <DataTable
        columns={columns}
        data={rows}
        total={total}
        page={query.page}
        pageSize={query.pageSize}
        search={tableState.search}
        sorting={sorting}
        loading={loading}
        error={error}
        searchPlaceholder="Search opportunities..."
        variant="cards"
        actionColumnSize={136}
        fluidColumnIds={["name"]}
        tableSx={{
          "& .MuiTableHead-root .MuiTableCell-root": {
            py: 0.5,
            fontSize: "11px",
          },
          "& .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root": {
            py: 1.25,
          },
          "& .MuiChip-label": {
            fontSize: "10px",
          },
        }}
        paginationStyle="count"
        onSearchChange={tableState.setSearch}
        onPageChange={tableState.setPage}
        onRetry={() => void load()}
        getRowId={(row) => row.id}
        rowActions={(row) => (
          <Box
            sx={{
              position: "relative",
              minWidth: 136,
              minHeight: 36,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Box className="ierp-row-actions-compact">
              <IconButton aria-label={`Actions for ${row.opportunityNumber}`} size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <Stack
              className="ierp-row-actions-expanded"
              direction="row"
              sx={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <Tooltip title="View">
                <IconButton aria-label={`View ${row.opportunityNumber}`} size="small" onClick={() => navigate(ROUTES.crm.opportunityView(row.id))}>
                  <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton aria-label={`Edit ${row.opportunityNumber}`} size="small">
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print">
                <IconButton aria-label={`Print ${row.opportunityNumber}`} size="small">
                  <PrintOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton aria-label={`Delete ${row.opportunityNumber}`} size="small" onClick={() => setDeleteTarget(row)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        )}
        onSortingChange={(updater) => {
          const next = typeof updater === "function" ? updater(sorting) : updater;
          const first = next[0];
          tableState.setSort(first?.id, first ? (first.desc ? "desc" : "asc") : undefined);
        }}
        filters={
          <FilterPanel
            onClear={() => {
              setStage("");
              setStatus("");
              tableState.setPage(1);
            }}
          >
            <SelectField
              name="opportunity-stage"
              label="Stage"
              value={stage}
              onChange={(value) => {
                setStage(value);
                tableState.setPage(1);
              }}
              options={stageOptions}
            />
            <SelectField
              name="opportunity-status"
              label="Status"
              value={status}
              onChange={(value) => {
                setStatus(value);
                tableState.setPage(1);
              }}
              options={statusOptions}
            />
          </FilterPanel>
        }
        emptyTitle="No opportunities found"
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete opportunity"
        description={`Delete ${deleteTarget?.opportunityNumber ?? "this opportunity"} (${deleteTarget?.name ?? "Unnamed opportunity"})? This action cannot be undone.`}
        confirmLabel="Delete"
        tone="error"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </Stack>
  );
};
