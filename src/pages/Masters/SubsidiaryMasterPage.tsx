import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Breadcrumbs,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import { KpiCard } from "@/components/cards/KpiCard/KpiCard";
import { ConfirmDialog } from "@/components/common/ConfirmDialog/ConfirmDialog";
import { FilterPanel } from "@/components/common/FilterPanel/FilterPanel";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { StatusChip } from "@/components/common/StatusChip/StatusChip";
import { BooleanField, FieldGrid, SelectField, TextFieldControl } from "@/components/forms/fields";
import { DataTable } from "@/components/tables/DataTable/DataTable";
import { ROUTES } from "@/constants/routes";
import { useTableState } from "@/hooks/useTableState";
import type { KpiMetric } from "@/models/dashboard/dashboard";
import { subsidiaryMockData, type SubsidiaryRecord, type SubsidiaryStatus } from "./subsidiaryMockData";

type DialogMode = "edit" | "view";

const emptySubsidiary = (): SubsidiaryRecord => ({
  id: "",
  name: "",
  status: "Active",
  hasChildSubsidiary: false,
  stateProvince: "",
  country: "",
  legalName: "",
  parentSubsidiaryId: "",
  currency: "USD",
});

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
];

const currencyOptions = ["USD", "INR", "EUR", "GBP", "AED", "SGD", "AUD", "CAD"].map((value) => ({
  value,
  label: value,
}));

const escapeCsv = (value: string): string => `"${value.replaceAll('"', '""')}"`;

const toCsv = (records: SubsidiaryRecord[], subsidiaries: SubsidiaryRecord[]): string => {
  const columns = [
    "ID",
    "Name",
    "Status",
    "Child Subsidiary",
    "State/Province",
    "Country",
    "Legal Name",
    "Parent Subsidiary",
    "Currency",
  ];
  const rows = records.map((record) => [
    record.id,
    record.name,
    record.status,
    record.hasChildSubsidiary ? "Yes" : "No",
    record.stateProvince,
    record.country,
    record.legalName,
    subsidiaries.find((item) => item.id === record.parentSubsidiaryId)?.name ?? "",
    record.currency,
  ]);
  return [columns, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");
};

export const SubsidiaryMasterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tableState = useTableState({ pageSize: 8, sortBy: "name", sortDir: "asc" });
  const { setPage } = tableState;
  const [records, setRecords] = useState<SubsidiaryRecord[]>(() => subsidiaryMockData.map((record) => ({ ...record })));
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [draft, setDraft] = useState<SubsidiaryRecord>(emptySubsidiary);
  const [attempted, setAttempted] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SubsidiaryRecord | null>(null);

  useEffect(() => {
    const createdSubsidiary = (location.state as { createdSubsidiary?: SubsidiaryRecord } | null)?.createdSubsidiary;
    if (!createdSubsidiary) {
      return;
    }

    setRecords((current) => current.some((record) => record.id === createdSubsidiary.id)
      ? current
      : [createdSubsidiary, ...current]);
    setPage(1);
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate, setPage]);

  const filteredRows = useMemo(() => {
    const search = tableState.query.search.trim().toLowerCase();
    const filtered = records.filter((record) => {
      const parentName = records.find((item) => item.id === record.parentSubsidiaryId)?.name ?? "";
      const searchable = [
        record.id,
        record.name,
        record.status,
        record.hasChildSubsidiary ? "child subsidiary" : "no child subsidiary",
        record.stateProvince,
        record.country,
        record.legalName,
        parentName,
        record.currency,
      ].join(" ").toLowerCase();
      return (!search || searchable.includes(search)) && (!statusFilter || record.status === statusFilter);
    });
    const sortBy = tableState.query.sortBy;
    return filtered.sort((left, right) => {
      if (!sortBy) return 0;
      const leftValue = sortBy === "parentSubsidiary"
        ? records.find((item) => item.id === left.parentSubsidiaryId)?.name ?? ""
        : left[sortBy as keyof SubsidiaryRecord];
      const rightValue = sortBy === "parentSubsidiary"
        ? records.find((item) => item.id === right.parentSubsidiaryId)?.name ?? ""
        : right[sortBy as keyof SubsidiaryRecord];
      const comparison = String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true });
      return tableState.query.sortDir === "desc" ? -comparison : comparison;
    });
  }, [records, statusFilter, tableState.query]);

  const rows = filteredRows.slice(
    (tableState.query.page - 1) * tableState.query.pageSize,
    tableState.query.page * tableState.query.pageSize,
  );
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / tableState.query.pageSize));
  const sorting = useMemo<SortingState>(
    () => tableState.query.sortBy
      ? [{ id: tableState.query.sortBy, desc: tableState.query.sortDir === "desc" }]
      : [],
    [tableState.query.sortBy, tableState.query.sortDir],
  );

  const kpis: KpiMetric[] = [
    { id: "total", label: "Total Subsidiaries", value: String(records.length), icon: "people" },
    { id: "active", label: "Active", value: String(records.filter((record) => record.status === "Active").length), icon: "check" },
    { id: "inactive", label: "Inactive", value: String(records.filter((record) => record.status === "Inactive").length), icon: "trend" },
  ];

  const closeDialog = () => {
    setDialogMode(null);
    setAttempted(false);
  };

  const openRecord = (record: SubsidiaryRecord, mode: DialogMode) => {
    setDraft({ ...record });
    setAttempted(false);
    setDialogMode(mode);
  };

  const saveDraft = () => {
    setAttempted(true);
    if (!draft.name.trim() || !draft.legalName.trim() || !draft.stateProvince.trim() || !draft.country.trim() || !draft.currency) {
      return;
    }

    if (dialogMode === "edit") {
      setRecords((current) => current.map((record) => record.id === draft.id ? { ...draft } : record));
    }
    closeDialog();
  };

  const exportRecords = () => {
    const url = URL.createObjectURL(new Blob([toCsv(filteredRows, records)], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "subsidiaries.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const parentOptions = [
    { value: "", label: "No parent" },
    ...records
      .filter((record) => record.id !== draft.id)
      .map((record) => ({ value: record.id, label: record.name })),
  ];

  const columns = useMemo<ColumnDef<SubsidiaryRecord, unknown>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 100,
        minSize: 92,
        cell: ({ getValue }) => <Typography variant="body2" sx={{ fontWeight: 800 }}>{String(getValue())}</Typography>,
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 180,
        minSize: 150,
        cell: ({ getValue }) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{String(getValue())}</Typography>,
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 112,
        minSize: 100,
        cell: ({ getValue }) => {
          const status = String(getValue()) as SubsidiaryStatus;
          return <StatusChip label={status} tone={status === "Active" ? "success" : "default"} />;
        },
      },
      {
        accessorKey: "hasChildSubsidiary",
        header: "Child Subsidiary",
        size: 136,
        minSize: 124,
        cell: ({ getValue }) => String(getValue() ? "Yes" : "No"),
      },
      { accessorKey: "stateProvince", header: "State/Province", size: 140, minSize: 120 },
      { accessorKey: "country", header: "Country", size: 132, minSize: 116 },
      { accessorKey: "legalName", header: "Legal Name", size: 230, minSize: 180 },
      {
        id: "parentSubsidiary",
        header: "Parent Subsidiary",
        size: 190,
        minSize: 155,
        accessorFn: (record) => records.find((item) => item.id === record.parentSubsidiaryId)?.name ?? "-",
      },
      { accessorKey: "currency", header: "Currency", size: 100, minSize: 88 },
    ],
    [records],
  );

  return (
    <Stack gap={2.25} sx={{ minWidth: 0 }}>
      <Box>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 0.75, fontSize: "0.8rem" }}>
          <Link component={RouterLink} to={ROUTES.dashboard} underline="hover" color="text.secondary">Home</Link>
          <Typography color="text.secondary" variant="body2">Masters</Typography>
          <Typography color="text.primary" variant="body2">Subsidiaries</Typography>
        </Breadcrumbs>
        <PageHeader
          eyebrow="Master Data"
          title="Subsidiary Master"
          actions={
            <>
              <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={exportRecords}>
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate(ROUTES.masters.subsidiaryNew, { state: { records } })}
              >
                New Subsidiary
              </Button>
            </>
          }
        />
      </Box>

      <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" } }}>
        {kpis.map((metric) => <KpiCard key={metric.id} metric={metric} />)}
      </Box>

      <DataTable
        columns={columns}
        data={rows}
        total={filteredRows.length}
        page={tableState.query.page}
        pageSize={tableState.query.pageSize}
        search={tableState.search}
        sorting={sorting}
        variant="cards"
        paginationStyle="range"
        paginationLabel={`Page ${tableState.query.page} of ${totalPages}`}
        searchPlaceholder="Search subsidiaries..."
        onSearchChange={tableState.setSearch}
        onPageChange={tableState.setPage}
        onSortingChange={(updater) => {
          const next = typeof updater === "function" ? updater(sorting) : updater;
          const first = next[0];
          tableState.setSort(first?.id, first ? (first.desc ? "desc" : "asc") : undefined);
        }}
        getRowId={(record) => record.id}
        revealActionsOnHover
        fluidColumnIds={["name", "stateProvince", "country", "legalName", "parentSubsidiary"]}
        actionColumnSize={132}
        tableSx={{
          "& .MuiTableHead-root .MuiTableCell-root": { py: 0.75, fontSize: "11px" },
          "& .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root": { py: 1.35 },
        }}
        filters={
          <FilterPanel onClear={() => { setStatusFilter(""); tableState.setPage(1); }}>
            <SelectField
              name="subsidiary-status"
              label="Status"
              value={statusFilter}
              onChange={(value) => { setStatusFilter(value); tableState.setPage(1); }}
              options={statusOptions}
            />
          </FilterPanel>
        }
        rowActions={(record) => (
          <Stack direction="row" justifyContent="flex-end">
            <Tooltip title="View">
              <IconButton aria-label={`View ${record.name}`} size="small" onClick={() => openRecord(record, "view")}>
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton aria-label={`Edit ${record.name}`} size="small" onClick={() => openRecord(record, "edit")}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton aria-label={`Delete ${record.name}`} size="small" color="error" onClick={() => setPendingDelete(record)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
        emptyTitle="No subsidiaries found"
      />

      <Dialog open={Boolean(dialogMode)} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === "edit" ? "Edit Subsidiary" : "Subsidiary Details"}
        </DialogTitle>
        <DialogContent dividers>
          <FieldGrid>
            <TextFieldControl name="subsidiary-id" label="ID" value={draft.id || "Assigned on save"} onChange={() => undefined} readOnly />
            <TextFieldControl name="subsidiary-name" label="Name" required value={draft.name} onChange={(name) => setDraft((current) => ({ ...current, name }))} error={attempted && !draft.name.trim() ? "Name is required." : undefined} readOnly={dialogMode === "view"} />
            <TextFieldControl name="subsidiary-legal-name" label="Legal Name" required value={draft.legalName} onChange={(legalName) => setDraft((current) => ({ ...current, legalName }))} error={attempted && !draft.legalName.trim() ? "Legal name is required." : undefined} readOnly={dialogMode === "view"} />
            <TextFieldControl name="subsidiary-state" label="State/Province" required value={draft.stateProvince} onChange={(stateProvince) => setDraft((current) => ({ ...current, stateProvince }))} error={attempted && !draft.stateProvince.trim() ? "State/Province is required." : undefined} readOnly={dialogMode === "view"} />
            <TextFieldControl name="subsidiary-country" label="Country" required value={draft.country} onChange={(country) => setDraft((current) => ({ ...current, country }))} error={attempted && !draft.country.trim() ? "Country is required." : undefined} readOnly={dialogMode === "view"} />
            <SelectField name="subsidiary-currency" label="Currency" required value={draft.currency} onChange={(currency) => setDraft((current) => ({ ...current, currency }))} options={currencyOptions} disabled={dialogMode === "view"} />
            <SelectField name="subsidiary-parent" label="Parent Subsidiary" value={draft.parentSubsidiaryId} onChange={(parentSubsidiaryId) => setDraft((current) => ({ ...current, parentSubsidiaryId }))} options={parentOptions} disabled={dialogMode === "view"} />
            <SelectField name="subsidiary-status" label="Status" value={draft.status} onChange={(status) => setDraft((current) => ({ ...current, status: status as SubsidiaryStatus }))} options={statusOptions.slice(1)} disabled={dialogMode === "view"} />
            <Box sx={{ display: "flex", alignItems: "center", minHeight: 56 }}>
              <BooleanField name="subsidiary-has-children" label="Has Child Subsidiary" value={draft.hasChildSubsidiary} onChange={(hasChildSubsidiary) => setDraft((current) => ({ ...current, hasChildSubsidiary }))} disabled={dialogMode === "view"} variant="switch" />
            </Box>
          </FieldGrid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog}>{dialogMode === "view" ? "Close" : "Cancel"}</Button>
          {dialogMode === "edit" ? <Button variant="contained" onClick={saveDraft}>Save Changes</Button> : null}
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete subsidiary"
        description={`Delete ${pendingDelete?.name ?? "this subsidiary"}? This removes it from the temporary local list.`}
        confirmLabel="Delete"
        tone="error"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            const nextRecords = records.filter((record) => record.id !== pendingDelete.id);
            const visibleTotal = filteredRows.length - (filteredRows.some((record) => record.id === pendingDelete.id) ? 1 : 0);
            setRecords(nextRecords);
            tableState.setPage(Math.min(
              tableState.query.page,
              Math.max(1, Math.ceil(visibleTotal / tableState.query.pageSize)),
            ));
            setPendingDelete(null);
          }
        }}
      />
    </Stack>
  );
};