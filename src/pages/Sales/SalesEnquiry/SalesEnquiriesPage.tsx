import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Button, Chip, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { KpiCard } from "@/components/cards/KpiCard/KpiCard";
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
import { salesEnquiryRecords, type SalesEnquiry, type SalesEnquiryStatus } from "./salesEnquiry.mock";

const statusOptions = ["Open", "Quotation", "Converted", "Lost", "Cancelled"] as const;
const subsidiaryOptions = ["i-ERP India", "i-ERP US", "i-ERP Europe", "i-ERP MEA"] as const;

const statusTone = (status: SalesEnquiryStatus): "default" | "success" | "warning" | "error" | "info" => {
  if (status === "Converted") return "success";
  if (status === "Open") return "info";
  if (status === "Quotation") return "warning";
  return "error";
};

const formatDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));

const kpis: KpiMetric[] = [
  { id: "total", label: "Total Enquiries", value: "35", icon: "people", trendLabel: "LIVE", trendPercent: 1 },
  { id: "open", label: "Open Enquiries", value: "18", icon: "trend", trendLabel: "ACTIVE", trendPercent: 1 },
  { id: "converted", label: "Converted Enquiries", value: "10", icon: "check", trendLabel: "WON", trendPercent: 1 },
];

const toCsv = (rows: SalesEnquiry[]) => [
  ["Enquiry ID", "Opportunity", "Customer", "Contact", "Probability", "Expected Close", "Status", "Win/Loss", "Subsidiary"],
  ...rows.map((row) => [row.enquiryId, row.opportunity, row.customer, row.contact, `${row.probability}%`, row.expectedClose, row.status, row.winLoss, row.subsidiary]),
].map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");

export const SalesEnquiriesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tableState = useTableState({ pageSize: 10, sortBy: "expectedClose", sortDir: "asc" });
  const [status, setStatus] = useState("");
  const [subsidiary, setSubsidiary] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredRows = useMemo(() => {
    const search = tableState.query.search.trim().toLowerCase();
    const filtered = salesEnquiryRecords.filter((row) => {
      const matchesSearch = !search || [row.enquiryId, row.opportunity, row.customer, row.contact, row.status, row.subsidiary].join(" ").toLowerCase().includes(search);
      const matchesStatus = !status || row.status === status;
      const matchesSubsidiary = !subsidiary || row.subsidiary === subsidiary;
      const matchesFrom = !fromDate || row.expectedClose >= fromDate;
      const matchesTo = !toDate || row.expectedClose <= toDate;
      return matchesSearch && matchesStatus && matchesSubsidiary && matchesFrom && matchesTo;
    });
    const sortBy = tableState.query.sortBy as keyof SalesEnquiry | undefined;
    return filtered.sort((left, right) => {
      if (!sortBy) return 0;
      const comparison = String(left[sortBy]).localeCompare(String(right[sortBy]), undefined, { numeric: true });
      return tableState.query.sortDir === "desc" ? -comparison : comparison;
    });
  }, [fromDate, status, subsidiary, tableState.query, toDate]);

  const rows = filteredRows.slice((tableState.query.page - 1) * tableState.query.pageSize, tableState.query.page * tableState.query.pageSize);
  const sorting = useMemo<SortingState>(() => tableState.query.sortBy ? [{ id: tableState.query.sortBy, desc: tableState.query.sortDir === "desc" }] : [], [tableState.query.sortBy, tableState.query.sortDir]);

  const announce = (message: string) => dispatch(toastShown({ message, severity: "info" }));
  const exportRows = () => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([toCsv(filteredRows)], { type: "text/csv;charset=utf-8" }));
    link.download = "sales-enquiries.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const columns = useMemo<ColumnDef<SalesEnquiry>[]>(() => [
    { accessorKey: "enquiryId", header: "Enquiry ID", size: 125, minSize: 110, cell: ({ getValue }) => <Typography variant="body2" sx={{ fontWeight: 800 }}>{String(getValue())}</Typography> },
    { accessorKey: "opportunity", header: "Opportunity", size: 150, minSize: 130 },
    { accessorKey: "customer", header: "Customer", size: 150, minSize: 120, cell: ({ getValue }) => <Typography variant="body2" sx={{ fontWeight: 700 }}>{String(getValue())}</Typography> },
    { accessorKey: "contact", header: "Contact", size: 145, minSize: 125 },
    { accessorKey: "probability", header: "Probability", size: 120, minSize: 105, cell: ({ getValue }) => `${String(getValue())}%` },
    { accessorKey: "expectedClose", header: "Expected Close", size: 145, minSize: 125, cell: ({ getValue }) => formatDate(String(getValue())) },
    { accessorKey: "status", header: "Status", size: 110, minSize: 95, cell: ({ getValue }) => <StatusChip label={String(getValue())} tone={statusTone(String(getValue()) as SalesEnquiryStatus)} /> },
    { accessorKey: "winLoss", header: "Win / Loss", size: 100, minSize: 90, cell: ({ getValue }) => <Chip label={String(getValue())} size="small" variant="outlined" color={String(getValue()) === "Won" ? "success" : String(getValue()) === "Lost" ? "error" : "default"} /> },
    { accessorKey: "subsidiary", header: "Subsidiary", size: 125, minSize: 110 },
  ], []);

  return <Stack gap={2.25}>
    <PageHeader
      eyebrow="Terminal · Sales"
      title="Sales Enquiry"
      uppercase
      actions={<Stack direction="row" gap={1} flexWrap="wrap">
        <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={exportRows}>Export</Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(ROUTES.sales.enquiryNew)}>Add Sales Enquiry</Button>
      </Stack>}
    />
    <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" } }}>{kpis.map((metric) => <KpiCard key={metric.id} metric={metric} />)}</Box>
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
      searchPlaceholder="Search sales enquiries..."
      onSearchChange={tableState.setSearch}
      onPageChange={tableState.setPage}
      onSortingChange={(updater) => {
        const next = typeof updater === "function" ? updater(sorting) : updater;
        tableState.setSort(next[0]?.id, next[0] ? (next[0].desc ? "desc" : "asc") : undefined);
      }}
      filters={<FilterPanel onClear={() => { setStatus(""); setSubsidiary(""); setFromDate(""); setToDate(""); tableState.setPage(1); }}>
        <SelectField name="status" label="Status" value={status} onChange={(value) => { setStatus(value); tableState.setPage(1); }} options={[{ value: "", label: "All Statuses" }, ...statusOptions.map((value) => ({ value, label: value }))]} />
        <SelectField name="subsidiary" label="Subsidiary" value={subsidiary} onChange={(value) => { setSubsidiary(value); tableState.setPage(1); }} options={[{ value: "", label: "All Subsidiaries" }, ...subsidiaryOptions.map((value) => ({ value, label: value }))]} />
        <Stack direction="row" gap={1}><TextField label="From" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /><TextField label="To" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Stack>
      </FilterPanel>}
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
            <IconButton aria-label={`Actions for ${row.enquiryId}`} size="small">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
          <Stack
            className="ierp-row-actions-expanded"
            direction="row"
            sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}
          >
            <Tooltip title="View">
              <IconButton size="small" aria-label={`View ${row.enquiryId}`} onClick={() => announce(`${row.enquiryId} details opened.`)}>
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" aria-label={`Edit ${row.enquiryId}`} onClick={() => navigate(ROUTES.sales.enquiryEdit(row.id))}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton size="small" aria-label={`Print ${row.enquiryId}`} onClick={() => announce(`${row.enquiryId} print queued.`)}>
                <PrintOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" aria-label={`Delete ${row.enquiryId}`} onClick={() => announce(`${row.enquiryId} delete queued.`)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      )}
      revealActionsOnHover
      fluidColumnIds={["opportunity", "customer", "contact", "subsidiary"]}
      getRowId={(row) => row.id}
    />
  </Stack>;
};
