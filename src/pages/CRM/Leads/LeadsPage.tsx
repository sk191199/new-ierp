import AddIcon from "@mui/icons-material/Add";
import BoltIcon from "@mui/icons-material/Bolt";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { HighValueLeadCard } from "@/components/cards/HighValueLeadCard/HighValueLeadCard";
import { KpiCard } from "@/components/cards/KpiCard/KpiCard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { FilterPanel } from "@/components/common/FilterPanel/FilterPanel";
import { PermissionGate } from "@/components/common/PermissionGate/PermissionGate";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { SelectField } from "@/components/forms/fields";
import { DataTable } from "@/components/tables/DataTable/DataTable";
import { PERMISSIONS } from "@/constants/permissions";
import { ROUTES } from "@/constants/routes";
import { useTableState } from "@/hooks/useTableState";
import type { Lead } from "@/models/lead/lead";
import {
  formatLeadDisplayId,
  resolveAiNextAction,
} from "@/models/lead/lead";
import type { KpiMetric } from "@/models/dashboard/dashboard";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import { getStatusTone } from "./leadOptions";
import {
  deleteLead,
  getAllMockLeads,
  getLeadKpis,
  listLeads,
} from "@/configurations/api/leadsApi";

const buildKpis = (items: Lead[]): KpiMetric[] => {
  const snapshot = getLeadKpis(items);

  return [
    {
      id: "total",
      label: "Total Leads",
      value: String(snapshot.total),
      icon: "people",
      trendPercent: 24,
      trendLabel: "+24%",
    },
    {
      id: "qualified",
      label: "Qualified",
      value: String(snapshot.qualified),
      icon: "check",
      trendPercent: 8,
      trendLabel: "+8%",
    },
    {
      id: "score",
      label: "Avg Lead Score",
      value: snapshot.averageScore.toFixed(1),
      icon: "trend",
      trendPercent: 8,
      trendLabel: "+5pts",
    },
  ];
};

export const LeadsPage = () => {
const getLeadConfidenceByStatus = (status: string): number => {
  switch (status) {
    case "New":
      return 20;
    case "Qualified":
      return 50;
    case "Disqualified":
      return 0;
    case "Converted":
      return 100;
    default:
      return 0;
  }
};

const getLeadConfidenceColor = (status: string): string => {
  switch (status) {
    case "New":
      return "warning.main";
    case "Qualified":
      return "info.main";
    case "Disqualified":
      return "error.main";
    case "Converted":
      return "success.main";
    default:
      return "warning.main";
  }
};
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const tableState = useTableState({
    pageSize: 8,
    sortBy: "createdDate",
    sortDir: "desc",
  });

  const [rows, setRows] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);
  const [kpis, setKpis] = useState<KpiMetric[]>([]);

  const sorting = useMemo<SortingState>(
    () =>
      tableState.query.sortBy
        ? [
            {
              id: tableState.query.sortBy,
              desc: tableState.query.sortDir === "desc",
            },
          ]
        : [],
    [tableState.query.sortBy, tableState.query.sortDir],
  );

  const query = tableState.query;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listLeads({
        ...query,
        status: statusFilter || undefined,
      });

      setRows(result.data);
      setTotal(result.pagination.total);
      setKpis(buildKpis(getAllMockLeads()));
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, [query, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const featuredLead = getAllMockLeads()
    .filter((lead) => lead.leadScore >= 80)
    .sort((left, right) => right.leadScore - left.leadScore)[0];

  const announceAction = useCallback(
    (action: string, lead: Lead) => {
      dispatch(
        toastShown({
          message: `${action} queued for ${lead.leadName}.`,
          severity: "info",
        }),
      );
    },
    [dispatch],
  );

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: "leadId",
        header: "Lead ID",
        size: 116,
        minSize: 104,
        cell: ({ row, getValue }) => (
          <Link
            component="button"
            type="button"
            onClick={() => navigate(ROUTES.crm.leadView(row.original.id))}
            sx={{
              border: 0,
              p: 0,
              bgcolor: "transparent",
              fontSize: "12px",
              lineHeight: 1.3,
              fontWeight: 600,
              color: "primary.main",
              cursor: "pointer",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {row.original.isBackendLead
              ? String(getValue())
              : formatLeadDisplayId(String(getValue()))}
          </Link>
        ),
      },
      {
        accessorKey: "leadName",
        header: "Lead Name",
        size: 132,
        minSize: 92,
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
        accessorKey: "companyName",
        header: "Company",
        size: 142,
        minSize: 100,
        cell: ({ getValue }) => (
          <Typography sx={{ fontSize: "12px", lineHeight: 1.3, fontWeight: 500 }}>
            {String(getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: "leadSource",
        header: "Lead Source",
        size: 100,
        minSize: 84,
        cell: ({ getValue }) => (
          <Typography sx={{ fontSize: "12px", lineHeight: 1.3, fontWeight: 500 }}>
            {String(getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 96,
        minSize: 82,
        cell: ({ getValue }) => (
            <Chip
              label={String(getValue())}
              color={getStatusTone(String(getValue())) as any}
              variant="outlined"
              size="small"
              sx={{
                fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                fontSize: "10px",
                lineHeight: "22px",
                letterSpacing: "normal",
              }}
            />
        ),
      },
      {
        id: "confidence",
        header: "Confidence",
        size: 122,
        minSize: 104,
        accessorFn: (row) => getLeadConfidenceByStatus(row.status),
        cell: ({ getValue, row }) => {
          const value = Number(getValue());
          const color = getLeadConfidenceColor(row.original.status);

          return (
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              sx={{ minWidth: 0 }}
            >
              <LinearProgress
                variant="determinate"
                value={value}
                sx={{
                  width: 48,
                  flexShrink: 0,
                  height: 4,
                  "& .MuiLinearProgress-bar": {
                    bgcolor: color,
                  },
                }}
              />

              <Typography sx={{ fontSize: "12px", lineHeight: 1.2 }}>
                {value}%
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: "aiNextAction",
        header: "AI Next Action",
        size: 148,
        minSize: 128,
        accessorFn: (row) =>
          row.aiNextAction ??
          resolveAiNextAction(row.leadScore),
        cell: ({ row, getValue }) => (
          <Button
            size="small"
            variant="outlined"
            startIcon={<BoltIcon fontSize="small" />}
            onClick={() =>
              announceAction(String(getValue()), row.original)
            }
            sx={{
              borderRadius: 999,
              borderColor: "primary.main",
              color: "primary.light",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              px: 1.5,
            }}
          >
            {String(getValue())}
          </Button>
        ),
      },
    ],
    [announceAction, navigate],
  );

  return (
    <Stack
      gap={2.25}
      sx={{
        textTransform: "uppercase",

        // Keep form inputs usable while still displaying their values
        // in uppercase.
        "& input": {
          textTransform: "uppercase",
        },

        "& textarea": {
          textTransform: "uppercase",
        },

        "& .MuiSelect-select": {
          textTransform: "uppercase",
        },

        "& .MuiInputBase-input": {
          textTransform: "uppercase",
        },

        "& .MuiFormLabel-root": {
          textTransform: "uppercase",
        },

        "& .MuiMenuItem-root": {
          textTransform: "uppercase",
        },
      }}
    >
      <PageHeader
        eyebrow="Terminal › CRM & Customer Engagement"
        title="Lead Management"
        uppercase
        actions={
          <Stack direction="row" gap={1} alignItems="center">
            <PermissionGate permission={PERMISSIONS.crm.leads.create}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(ROUTES.crm.leadNew)}
                sx={{
                  letterSpacing: "0.08em",
                  boxShadow: (theme) =>
                    `0 0 22px ${alpha(
                      theme.palette.primary.main,
                      0.45,
                    )}`,
                }}
              >
                NEW LEAD
              </Button>
            </PermissionGate>

            <Tooltip title="Worklist settings">
              <IconButton
                aria-label="Worklist settings"
                onClick={() => navigate(ROUTES.settings)}
                sx={{
                  width: 40,
                  height: 40,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1.5,
                }}
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
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(3, minmax(0, 1fr))",
          },
        }}
      >
        {kpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </Box>

      {featuredLead ? (
        <Box
          sx={{
            width: { xs: "100%", md: "66%" },
            maxWidth: 720,
          }}
        >
          <HighValueLeadCard
            leadName={featuredLead.leadName}
            leadScore={featuredLead.leadScore}
            onStart={() =>
              announceAction("START ENGAGEMENT", featuredLead)
            }
          />
        </Box>
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        total={total}
        page={tableState.query.page}
        pageSize={tableState.query.pageSize}
        search={tableState.search}
        sorting={sorting}
        loading={loading}
        error={error}
        variant="cards"
        actionColumnSize={120}
        fluidColumnIds={["leadName", "companyName", "leadSource", "aiNextAction"]}
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
          "& .MuiTableBody-root .MuiButton-root": {
            fontSize: "11px",
            px: 1,
          },
        }}
        paginationStyle="count"
        revealActionsOnHover
        searchPlaceholder="Search records..."
        onSearchChange={tableState.setSearch}
        onPageChange={tableState.setPage}
        onRetry={() => void load()}
        getRowId={(row) => row.id}
        onSortingChange={(updater) => {
          const next =
            typeof updater === "function"
              ? updater(sorting)
              : updater;

          const first = next[0];

          tableState.setSort(
            first?.id,
            first
              ? first.desc
                ? "desc"
                : "asc"
              : undefined,
          );
        }}
        filters={
          <FilterPanel
            onClear={() => {
              setStatusFilter("");
              tableState.setPage(1);
            }}
          >
            <SelectField
              name="status"
              label="Status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                tableState.setPage(1);
              }}
              options={[
                {
                  value: "",
                  label: "All statuses",
                },
                {
                  value: "New",
                  label: "New",
                },
                {
                  value: "Qualified",
                  label: "Qualified",
                },
                {
                  value: "Disqualified",
                  label: "Disqualified",
                },
                {
                  value: "Converted",
                  label: "Converted",
                },
              ]}
            />
          </FilterPanel>
        }
        rowActions={(row) => (
            <Box
              sx={{
                position: "relative",
                minWidth: 120,
                minHeight: 36,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Box className="ierp-row-actions-compact">
                <IconButton
                  aria-label={`Actions for ${row.leadId}`}
                  size="small"
                >
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
                  <IconButton
                    aria-label={`View ${row.leadId}`}
                    size="small"
                    onClick={() =>
                      navigate(ROUTES.crm.leadView(row.id))
                    }
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <PermissionGate
                  permission={PERMISSIONS.crm.leads.update}
                >
                  <Tooltip title="Edit">
                    <IconButton
                      aria-label={`Edit ${row.leadId}`}
                      size="small"
                      onClick={() => navigate(ROUTES.crm.leadEdit(row.id))}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </PermissionGate>

                <PermissionGate
                  permission={PERMISSIONS.crm.leads.print}
                >
                  <Tooltip title="Print">
                    <IconButton
                      aria-label={`Print ${row.leadId}`}
                      size="small"
                      onClick={() =>
                        dispatch(
                          toastShown({
                            message:
                              "Print engine is reserved for a later phase.",
                            severity: "info",
                          }),
                        )
                      }
                    >
                      <PrintOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </PermissionGate>

                <PermissionGate
                  permission={PERMISSIONS.crm.leads.delete}
                >
                  <Tooltip title="Delete">
                    <IconButton
                      aria-label={`Delete ${row.leadId}`}
                      size="small"
                      onClick={() => setPendingDelete(row)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </PermissionGate>
              </Stack>
            </Box>
        )}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete lead"
        description={`Delete ${pendingDelete?.leadId} (${pendingDelete?.leadName})? This is a soft operational delete in the worklist.`}
        confirmLabel="Delete"
        tone="error"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) {
            return;
          }

          void deleteLead(pendingDelete.id)
            .then(() => {
              dispatch(
                toastShown({
                  message: `${pendingDelete.leadId} deleted.`,
                  severity: "success",
                }),
              );

              setPendingDelete(null);

              void load();
            })
            .catch((cause) => {
              dispatch(
                toastShown({
                  message: getErrorMessage(cause),
                  severity: "error",
                }),
              );
            });
        }}
      />
    </Stack>
  );
};