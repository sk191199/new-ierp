import AddIcon from "@mui/icons-material/Add";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Button, IconButton, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
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
import { LEAD_STATUSES, type LeadStatus } from "@/constants/statuses";
import { useTableState } from "@/hooks/useTableState";
import type { Lead } from "@/models/lead/lead";
import { formatLeadDisplayId, resolveAiNextAction, resolveLeadConfidence } from "@/models/lead/lead";
import type { KpiMetric } from "@/models/dashboard/dashboard";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { getErrorMessage } from "@/utils/errorHandling/getErrorMessage";
import { isBlank, isValidEmail } from "@/utils/validators/required";
import { InlineSelectField, InlineTextField } from "./InlineLeadField";
import { leadSourceOptions, leadStatusOptions } from "./leadOptions";
import { deleteLead, getAllMockLeads, getLeadKpis, listLeads, saveLead } from "./leadsApi";

const buildKpis = (items: Lead[]): KpiMetric[] => {
  const snapshot = getLeadKpis(items);
  return [
    { id: "total", label: "Total Leads", value: String(snapshot.total), icon: "people", trendPercent: 24, trendLabel: "+24%" },
    { id: "qualified", label: "Qualified", value: String(snapshot.qualified), icon: "check", trendPercent: 8, trendLabel: "+8%" },
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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tableState = useTableState({ pageSize: 8, sortBy: "createdDate", sortDir: "desc" });
  const [rows, setRows] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Lead | null>(null);
  const [kpis, setKpis] = useState<KpiMetric[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  const sorting = useMemo<SortingState>(
    () =>
      tableState.query.sortBy
        ? [{ id: tableState.query.sortBy, desc: tableState.query.sortDir === "desc" }]
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

  const patchDraft = (key: keyof Lead, value: string | number) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }
      const next = { ...current, [key]: value };
      if (key === "leadScore" || key === "status") {
        next.confidence = resolveLeadConfidence(Number(next.leadScore), next.status);
        next.aiNextAction = resolveAiNextAction(Number(next.leadScore));
      }
      return next;
    });
  };

  const beginInlineEdit = (row: Lead) => {
    setEditingId(row.id);
    setDraft({ ...row });
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const commitInlineEdit = async () => {
    if (!draft) {
      return;
    }
    if (isBlank(draft.leadName) || isBlank(draft.companyName) || isBlank(draft.phone) || !isValidEmail(draft.email)) {
      dispatch(
        toastShown({
          message: "Name, company, phone and a valid email are required.",
          severity: "warning",
        }),
      );
      return;
    }

    setSaving(true);
    try {
      const saved = await saveLead(draft);
      setRows((current) => current.map((row) => (row.id === saved.id ? saved : row)));
      cancelInlineEdit();
      dispatch(toastShown({ message: `${saved.leadId} updated.`, severity: "success" }));
      setKpis(buildKpis(getAllMockLeads()));
    } catch (cause) {
      dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
    } finally {
      setSaving(false);
    }
  };

  const announceAction = useCallback(
    (action: string, lead: Lead) => {
      dispatch(toastShown({ message: `${action} queued for ${lead.leadName}.`, severity: "info" }));
    },
    [dispatch],
  );

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: "leadId",
        header: "Lead ID",
        size: 100,
        minSize: 88,
        // API INTEGRATION: Show the normalized backend leadNumber while
        // retaining the existing generated display format for mock records.
        cell: ({ row, getValue }) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {row.original.isBackendLead ? String(getValue()) : formatLeadDisplayId(String(getValue()))}
          </Typography>
        ),
      },
      {
        accessorKey: "leadName",
        header: "Lead Name",
        size: 140,
        minSize: 96,
        cell: ({ row, getValue }) =>
          editingId === row.original.id && draft ? (
            <InlineTextField
              ariaLabel="Lead name"
              value={draft.leadName}
              onChange={(value) => patchDraft("leadName", value)}
            />
          ) : (
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {String(getValue())}
            </Typography>
          ),
      },
      {
        // API INTEGRATION: Use the normalized companyName field from the backend Lead response.
        accessorKey: "companyName",
        header: "Company",
        size: 148,
        minSize: 96,
        cell: ({ row, getValue }) =>
          editingId === row.original.id && draft ? (
            <InlineTextField
              ariaLabel="Company"
              value={draft.companyName}
              onChange={(value) => patchDraft("companyName", value)}
            />
          ) : (
            String(getValue())
          ),
      },
      {
        accessorKey: "leadSource",
        header: "Lead Source",
        size: 120,
        minSize: 96,
        cell: ({ row, getValue }) =>
          editingId === row.original.id && draft ? (
            <InlineSelectField
              ariaLabel="Lead source"
              value={draft.leadSource}
              onChange={(value) => patchDraft("leadSource", value)}
              options={leadSourceOptions}
            />
          ) : (
            String(getValue())
          ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        minSize: 96,
        cell: ({ row, getValue }) =>
          editingId === row.original.id && draft ? (
            <InlineSelectField
              ariaLabel="Status"
              value={draft.status}
              onChange={(value) => patchDraft("status", value as LeadStatus)}
              options={leadStatusOptions}
            />
          ) : (
            String(getValue())
          ),
      },
      {
        accessorKey: "leadScore",
        header: "Lead Score",
        size: 96,
        minSize: 80,
        cell: ({ row, getValue }) =>
          editingId === row.original.id && draft ? (
            <InlineTextField
              ariaLabel="Lead score"
              type="number"
              value={String(draft.leadScore)}
              onChange={(value) => patchDraft("leadScore", Number(value) || 0)}
            />
          ) : (
            String(getValue())
          ),
      },
      {
        id: "confidence",
        header: "Confidence",
        size: 148,
        minSize: 120,
        accessorFn: (row) => row.confidence ?? resolveLeadConfidence(row.leadScore, row.status),
        cell: ({ getValue }) => {
          const value = Number(getValue());
          return (
            <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
              <LinearProgress
                variant="determinate"
                value={value}
                sx={{
                  width: 56,
                  flexShrink: 0,
                  height: 4,
                  "& .MuiLinearProgress-bar": {
                    bgcolor: value >= 80 ? "success.main" : "warning.main",
                  },
                }}
              />
              <Typography variant="body2">{value}%</Typography>
            </Stack>
          );
        },
      },
      {
        id: "aiNextAction",
        header: "AI Next Action",
        size: 188,
        minSize: 160,
        accessorFn: (row) => row.aiNextAction ?? resolveAiNextAction(row.leadScore),
        cell: ({ row, getValue }) => (
          <Button
            size="small"
            variant="outlined"
            startIcon={<BoltIcon fontSize="small" />}
            onClick={() => announceAction(String(getValue()), row.original)}
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
    [announceAction, draft, editingId],
  );

  return (
    <Stack gap={2.25}>
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
                  boxShadow: (theme) => `0 0 22px ${alpha(theme.palette.primary.main, 0.45)}`,
                }}
              >
                NEW LEAD
              </Button>
            </PermissionGate>
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
        {kpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </Box>

      {featuredLead ? (
        <Box sx={{ width: { xs: "100%", md: "66%" }, maxWidth: 720 }}>
          <HighValueLeadCard
            leadName={featuredLead.leadName}
            leadScore={featuredLead.leadScore}
            onStart={() => announceAction("START ENGAGEMENT", featuredLead)}
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
        paginationStyle="count"
        revealActionsOnHover
        alwaysRevealActions={(row) => row.id === editingId}
        searchPlaceholder="Search records..."
        onSearchChange={tableState.setSearch}
        onPageChange={tableState.setPage}
        onRetry={() => void load()}
        getRowId={(row) => row.id}
        onSortingChange={(updater) => {
          const next = typeof updater === "function" ? updater(sorting) : updater;
          const first = next[0];
          tableState.setSort(first?.id, first ? (first.desc ? "desc" : "asc") : undefined);
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
                { value: "", label: "All statuses" },
                ...Object.values(LEAD_STATUSES).map((value) => ({ value, label: value })),
              ]}
            />
          </FilterPanel>
        }
        rowActions={(row) =>
          editingId === row.id ? (
            <Stack direction="row">
              <Tooltip title="Save">
                <IconButton
                  aria-label={`Save ${row.leadId}`}
                  size="small"
                  color="primary"
                  disabled={saving}
                  onClick={() => void commitInlineEdit()}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton aria-label="Cancel inline edit" size="small" disabled={saving} onClick={cancelInlineEdit}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ) : (
            <Box sx={{ position: "relative", minWidth: 148, minHeight: 36, display: "flex", justifyContent: "flex-end" }}>
              <Box className="ierp-row-actions-compact">
                <IconButton aria-label={`Actions for ${row.leadId}`} size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              <Stack
                className="ierp-row-actions-expanded"
                direction="row"
                sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}
              >
                <Tooltip title="View">
                  <IconButton
                    aria-label={`View ${row.leadId}`}
                    size="small"
                    onClick={() => navigate(ROUTES.crm.leadView(row.id))}
                  >
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <PermissionGate permission={PERMISSIONS.crm.leads.update}>
                  <Tooltip title="Edit inline">
                    <IconButton aria-label={`Edit ${row.leadId}`} size="small" onClick={() => beginInlineEdit(row)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </PermissionGate>
                <PermissionGate permission={PERMISSIONS.crm.leads.print}>
                  <Tooltip title="Print">
                    <IconButton
                      aria-label={`Print ${row.leadId}`}
                      size="small"
                      onClick={() =>
                        dispatch(toastShown({ message: "Print engine is reserved for a later phase.", severity: "info" }))
                      }
                    >
                      <PrintOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </PermissionGate>
                <PermissionGate permission={PERMISSIONS.crm.leads.delete}>
                  <Tooltip title="Delete">
                    <IconButton aria-label={`Delete ${row.leadId}`} size="small" onClick={() => setPendingDelete(row)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </PermissionGate>
              </Stack>
            </Box>
          )
        }
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
              dispatch(toastShown({ message: `${pendingDelete.leadId} deleted.`, severity: "success" }));
              setPendingDelete(null);
              if (editingId === pendingDelete.id) {
                cancelInlineEdit();
              }
              void load();
            })
            .catch((cause) => {
              dispatch(toastShown({ message: getErrorMessage(cause), severity: "error" }));
            });
        }}
      />
    </Stack>
  );
};
