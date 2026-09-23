import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Box, Button, IconButton, Stack, TextField, Tooltip, Typography } from "@mui/material";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { KpiCard } from "@/components/cards/KpiCard/KpiCard";
import { FilterPanel } from "@/components/common/FilterPanel/FilterPanel";
import { PageHeader } from "@/components/common/PageHeader/PageHeader";
import { SelectField } from "@/components/forms/fields";
import { StatusChip } from "@/components/common/StatusChip/StatusChip";
import { DataTable } from "@/components/tables/DataTable/DataTable";
import { ROUTES } from "@/constants/routes";
import { useTableState } from "@/hooks/useTableState";
import type { KpiMetric } from "@/models/dashboard/dashboard";
import type { SalesQuotation, SalesQuotationStatus } from "./salesQuotation.mock";
import { mockSalesQuotations } from "./salesQuotation.mock";
import { toastShown } from "@/redux/features/ui/uiSlice";
import { useAppDispatch } from "@/redux/hooks";
import { formatCurrency } from "@/utils/formatters";

const getQuotationStatusTone = (status: SalesQuotationStatus): "default" | "error" | "info" | "success" | "warning" => {
  switch (status) {
    case "Draft":
      return "default";
    case "Sent":
      return "info";
    case "Accepted":
      return "success";
    case "Rejected":
      return "error";
    case "Expired":
      return "warning";
    case "Cancelled":
      return "error";
    default:
      return "default";
  }
};

const quotationStatusOptions = [
  { value: "", label: "All Statuses" },
  { value: "Draft", label: "Draft" },
  { value: "Sent", label: "Sent" },
  { value: "Accepted", label: "Accepted" },
  { value: "Rejected", label: "Rejected" },
  { value: "Expired", label: "Expired" },
  { value: "Cancelled", label: "Cancelled" },
];

const subsidiaryOptions = [
  { value: "", label: "All Subsidiaries" },
  { value: "i-ERP India", label: "i-ERP India" },
  { value: "i-ERP US", label: "i-ERP US" },
  { value: "i-ERP Europe", label: "i-ERP Europe" },
  { value: "i-ERP MEA", label: "i-ERP MEA" },
];

const formatQuotationDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );

const kpis: KpiMetric[] = [
  { id: "total", label: "Total Quotations", value: "35", icon: "people", trendLabel: "LIVE", trendPercent: 1 },
  { id: "open", label: "Open Quotations", value: "19", icon: "trend", trendLabel: "ACTIVE", trendPercent: 1 },
  { id: "accepted", label: "Accepted Quotations", value: "7", icon: "check", trendLabel: "WON", trendPercent: 1 },
];

export const SalesQuotationsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const tableState = useTableState({
    pageSize: 10,
    sortBy: "quotationDate",
    sortDir: "desc",
  });

  const [statusFilter, setStatusFilter] = useState("");
  const [subsidiaryFilter, setSubsidiaryFilter] = useState("");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");

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

  const filteredRows = useMemo(() => {
    const search = query.search.trim().toLowerCase();
    const filtered = mockSalesQuotations.filter((row) => {
      const matchesSearch = !search || [row.quotationId, row.enquiryId, row.opportunity, row.customer, row.contact, row.status, row.subsidiary].join(" ").toLowerCase().includes(search);
      return matchesSearch &&
        (!statusFilter || row.status === statusFilter) &&
        (!subsidiaryFilter || row.subsidiary === subsidiaryFilter) &&
        (!fromDateFilter || row.quotationDate >= fromDateFilter) &&
        (!toDateFilter || row.quotationDate <= toDateFilter);
    });
    const sortBy = query.sortBy as keyof SalesQuotation | undefined;
    return filtered.sort((left, right) => {
      if (!sortBy) return 0;
      const comparison = String(left[sortBy]).localeCompare(String(right[sortBy]), undefined, { numeric: true });
      return query.sortDir === "desc" ? -comparison : comparison;
    });
  }, [fromDateFilter, query, statusFilter, subsidiaryFilter, toDateFilter]);

  const rows = filteredRows.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
  const announce = (message: string) => dispatch(toastShown({ message, severity: "info" }));

  const handleExportCsv = () => {
    const headers = [
      "Quotation ID",
      "Enquiry ID",
      "Opportunity",
      "Customer",
      "Contact",
      "Quotation Date",
      "Valid Until",
      "Amount",
      "Status",
      "Subsidiary",
    ];

    const csvContent = [
      headers.join(","),
      ...mockSalesQuotations.map((q) =>
        [
          q.quotationId,
          q.enquiryId,
          `"${q.opportunity}"`,
          `"${q.customer}"`,
          `"${q.contact}"`,
          q.quotationDate,
          q.validUntil,
          formatCurrency(q.amount),
          q.status,
          q.subsidiary,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "sales-quotations.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    dispatch(
      toastShown({
        message: "Sales Quotations exported successfully.",
        severity: "success",
      }),
    );
  };

  const columns = useMemo<ColumnDef<SalesQuotation, unknown>[]>(
    () => [
      {
        accessorKey: "quotationId",
        header: "Quotation ID",
        size: 116,
        minSize: 104,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {String(getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: "enquiryId",
        header: "Enquiry ID",
        size: 110,
        minSize: 100,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {String(getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: "opportunity",
        header: "Opportunity",
        size: 140,
        minSize: 120,
        cell: ({ getValue }) => (
          <Typography variant="body2">{String(getValue())}</Typography>
        ),
      },
      {
        accessorKey: "customer",
        header: "Customer",
        size: 130,
        minSize: 100,
        cell: ({ getValue }) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {String(getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: "quotationDate",
        header: "Quotation Date",
        size: 130,
        minSize: 120,
        cell: ({ getValue }) => (
          <Typography variant="body2">{formatQuotationDate(String(getValue()))}</Typography>
        ),
      },
      {
        accessorKey: "validUntil",
        header: "Valid Until",
        size: 120,
        minSize: 110,
        cell: ({ getValue }) => (
          <Typography variant="body2">{formatQuotationDate(String(getValue()))}</Typography>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        size: 110,
        minSize: 100,
        cell: ({ getValue }) => (
          <Typography variant="body2">{formatCurrency(Number(getValue()))}</Typography>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 100,
        minSize: 80,
        cell: ({ getValue }) => (
          <StatusChip label={String(getValue())} tone={getQuotationStatusTone(String(getValue()) as SalesQuotationStatus)} />
        ),
      },
      {
        accessorKey: "subsidiary",
        header: "Subsidiary",
        size: 130,
        minSize: 110,
        cell: ({ getValue }) => (
          <Typography variant="body2">{String(getValue())}</Typography>
        ),
      },
    ],
    [],
  );

  return (
    <Stack gap={2.25}>
      <PageHeader
        eyebrow="Terminal · Sales"
        title="Sales Quotation"
        uppercase
        actions={
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={handleExportCsv}>Export</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(ROUTES.sales.quotationNew)}>Add Sales Quotation</Button>
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

      <DataTable
          data={rows}
          columns={columns}
          total={filteredRows.length}
          page={query.page}
          pageSize={query.pageSize}
          search={tableState.search}
          sorting={sorting}
          variant="cards"
          paginationStyle="range"
          searchPlaceholder="Search sales quotations..."
          onSearchChange={tableState.setSearch}
          onPageChange={tableState.setPage}
          onSortingChange={(updater) => {
            const next = typeof updater === "function" ? updater(sorting) : updater;
            const first = next[0];
            tableState.setSort(first?.id, first ? (first.desc ? "desc" : "asc") : undefined);
          }}
          getRowId={(row) => row.id}
          revealActionsOnHover
          actionColumnSize={120}
          fluidColumnIds={["opportunity", "customer", "contact", "subsidiary"]}
          rowActions={(row) => (
            <Box sx={{ position: "relative", minWidth: 120, minHeight: 36, display: "flex", justifyContent: "flex-end" }}>
              <Box className="ierp-row-actions-compact">
                <IconButton aria-label={`Actions for ${row.quotationId}`} size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              <Stack className="ierp-row-actions-expanded" direction="row" sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
                <Tooltip title="View"><IconButton size="small" aria-label={`View ${row.quotationId}`} onClick={() => announce(`${row.quotationId} details opened.`)}><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Edit"><IconButton size="small" aria-label={`Edit ${row.quotationId}`} onClick={() => navigate(ROUTES.sales.quotationEdit(row.id))}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Print"><IconButton size="small" aria-label={`Print ${row.quotationId}`} onClick={() => announce(`${row.quotationId} print queued.`)}><PrintOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton size="small" aria-label={`Delete ${row.quotationId}`} onClick={() => announce(`${row.quotationId} delete queued.`)}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
              </Stack>
            </Box>
          )}
          filters={<FilterPanel onClear={() => { setStatusFilter(""); setSubsidiaryFilter(""); setFromDateFilter(""); setToDateFilter(""); tableState.setPage(1); }}>
            <SelectField name="quotation-status" label="Status" value={statusFilter} onChange={(value) => { setStatusFilter(value); tableState.setPage(1); }} options={quotationStatusOptions} />
            <SelectField name="quotation-subsidiary" label="Subsidiary" value={subsidiaryFilter} onChange={(value) => { setSubsidiaryFilter(value); tableState.setPage(1); }} options={subsidiaryOptions} />
            <Stack direction="row" gap={1}>
              <TextField label="From" type="date" value={fromDateFilter} onChange={(event) => { setFromDateFilter(event.target.value); tableState.setPage(1); }} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField label="To" type="date" value={toDateFilter} onChange={(event) => { setToDateFilter(event.target.value); tableState.setPage(1); }} slotProps={{ inputLabel: { shrink: true } }} />
            </Stack>
          </FilterPanel>}
      />
    </Stack>
  );
};
