import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Breadcrumbs,
  Box,
  Button,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { KpiCard } from "@/components/cards/KpiCard/KpiCard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { FilterPanel } from "@/components/common/FilterPanel/FilterPanel";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { StatusChip } from "@/components/common/StatusChip/StatusChip";
import { SelectField } from "@/components/forms/fields";
import { DataTable } from "@/components/tables/DataTable/DataTable";
import { ROUTES } from "@/constants/routes";
import { useTableState } from "@/hooks/useTableState";
import type { KpiMetric } from "@/models/dashboard/dashboard";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { uomMockData, type UomRecord, type UomStatus } from "./uomMockData";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const escapeCsv = (value: string): string => `"${value.replaceAll('"', '""')}"`;

const getStatusTone = (status: UomStatus): "default" | "success" =>
  status === "Active" ? "success" : "default";

export const UomMasterPage = () => {
  const dispatch = useAppDispatch();
  const tableState = useTableState({ pageSize: 8, sortBy: "code", sortDir: "asc" });
  const [records, setRecords] = useState<UomRecord[]>(() => uomMockData.map((record) => ({ ...record })));
  const [statusFilter, setStatusFilter] = useState("");
  const [pendingDelete, setPendingDelete] = useState<UomRecord | null>(null);

  const query = tableState.query;
  const filteredRows = useMemo(() => {
    const search = query.search.trim().toLowerCase();
    const filtered = records.filter((record) => {
      const searchable = [record.id, record.code, record.name, record.symbol, record.status]
        .join(" ")
        .toLowerCase();
      return (!search || searchable.includes(search)) && (!statusFilter || record.status === statusFilter);
    });

    return filtered.sort((left, right) => {
      if (!query.sortBy) return 0;
      const comparison = String(left[query.sortBy as keyof UomRecord]).localeCompare(
        String(right[query.sortBy as keyof UomRecord]),
        undefined,
        { numeric: true },
      );
      return query.sortDir === "desc" ? -comparison : comparison;
    });
  }, [query, records, statusFilter]);

  const rows = filteredRows.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
  const sorting = useMemo<SortingState>(
    () => query.sortBy ? [{ id: query.sortBy, desc: query.sortDir === "desc" }] : [],
    [query.sortBy, query.sortDir],
  );

  const kpis: KpiMetric[] = [
    { id: "total", label: "Total UOMs", value: String(records.length), icon: "people" },
    { id: "active", label: "Active", value: String(records.filter((record) => record.status === "Active").length), icon: "check" },
    { id: "inactive", label: "Inactive", value: String(records.filter((record) => record.status === "Inactive").length), icon: "trend" },
  ];

  const exportRecords = () => {
    const header = ["ID", "Code", "Name", "Symbol", "Status"];
    const csv = [
      header,
      ...filteredRows.map((record) => [record.id, record.code, record.name, record.symbol, record.status]),
    ].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "uoms.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const announceUnavailableAction = (action: string, record: UomRecord) => {
    dispatch(toastShown({ message: `${action} will be available when UOM editing is implemented. (${record.code})`, severity: "info" }));
  };

  const columns = useMemo<ColumnDef<UomRecord, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 120,
        minSize: 108,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {String(getValue())}
          </Typography>
        ),
      },
      { accessorKey: "code", header: "Code", size: 120, minSize: 100 },
      { accessorKey: "name", header: "Name", size: 180, minSize: 140 },
      { accessorKey: "symbol", header: "Symbol", size: 120, minSize: 100 },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        minSize: 100,
        cell: ({ getValue }) => {
          const status = String(getValue()) as UomStatus;
          return <StatusChip label={status} tone={getStatusTone(status)} />;
        },
      },
    ],
    [],
  );

  return (
    <Stack gap={2.25} sx={{ minWidth: 0 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0.75, fontSize: "0.8rem" }}>
          <Link component={RouterLink} to={ROUTES.dashboard} underline="hover" color="text.secondary">Home</Link>
          <Link component={RouterLink} to={ROUTES.settings} underline="hover" color="text.secondary">Settings</Link>
          <Typography color="text.secondary" variant="body2">Catalog</Typography>
          <Typography color="text.secondary" variant="body2">Masters</Typography>
          <Typography color="text.primary" variant="body2">UOM</Typography>
        </Breadcrumbs>
        <PageHeader
          eyebrow="Master Data"
          title="Unit of Measure Master"
          actions={
            <Stack direction="row" gap={1}>
              <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={exportRecords}>
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  dispatch(toastShown({ message: "New UOM form will be available in a future update.", severity: "info" }))
                }
              >
                New UOM
              </Button>
            </Stack>
          }
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
        }}
      >
        {kpis.map((metric) => (
          <KpiCard key={metric.id} metric={metric} />
        ))}
      </Box>

      <DataTable
        columns={columns}
        data={rows}
        total={filteredRows.length}
        page={query.page}
        pageSize={query.pageSize}
        search={tableState.search}
        sorting={sorting}
        variant="cards"
        paginationStyle="range"
        searchPlaceholder="Search UOMs..."
        onSearchChange={tableState.setSearch}
        onPageChange={tableState.setPage}
        onSortingChange={(updater) => {
          const next = typeof updater === "function" ? updater(sorting) : updater;
          const first = next[0];
          tableState.setSort(first?.id, first ? (first.desc ? "desc" : "asc") : undefined);
        }}
        getRowId={(record) => record.id}
        revealActionsOnHover
        fluidColumnIds={["name"]}
        actionColumnSize={132}
        filters={
          <FilterPanel onClear={() => { setStatusFilter(""); tableState.setPage(1); }}>
            <SelectField
              name="uom-status"
              label="Status"
              value={statusFilter}
              onChange={(value) => { setStatusFilter(value); tableState.setPage(1); }}
              options={statusOptions}
            />
          </FilterPanel>
        }
        rowActions={(record) => (
          <Box
            sx={{
              position: "relative",
              minWidth: 132,
              minHeight: 36,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Box className="ierp-row-actions-compact">
              <IconButton aria-label={`Actions for ${record.code}`} size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <Stack
              className="ierp-row-actions-expanded"
              direction="row"
              sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}
            >
              <Tooltip title="View">
                <IconButton aria-label={`View ${record.code}`} size="small" onClick={() => announceUnavailableAction("View", record)}>
                  <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton aria-label={`Edit ${record.code}`} size="small" onClick={() => announceUnavailableAction("Edit", record)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton aria-label={`Delete ${record.code}`} size="small" color="error" onClick={() => setPendingDelete(record)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        )}
        emptyTitle="No UOMs found"
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete UOM"
        description={`Delete ${pendingDelete?.code ?? "this UOM"} (${pendingDelete?.name ?? "Unnamed unit"})? This removes it from the temporary local list.`}
        confirmLabel="Delete"
        tone="error"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          setRecords((current) => current.filter((record) => record.id !== pendingDelete.id));
          setPendingDelete(null);
        }}
      />
    </Stack>
  );
};