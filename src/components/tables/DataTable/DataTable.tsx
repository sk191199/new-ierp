import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnSizingState,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Box,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import type { SystemStyleObject } from "@mui/system";
import type { Theme } from "@mui/material/styles";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { EmptyState } from "@/components/common/EmptyState/EmptyState";
import { ErrorState } from "@/components/common/ErrorState/ErrorState";
import { ColumnResizeHandle } from "./ColumnResizeHandle";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableSkeleton } from "./DataTableSkeleton";
import { DataTableToolbar } from "./DataTableToolbar";

export interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  sorting?: SortingState;
  loading?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  filters?: ReactNode;
  extras?: ReactNode;
  enableSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onSortingChange?: OnChangeFn<SortingState>;
  onRetry?: () => void;
  getRowId?: (row: T) => string;
  rowActions?: (row: T) => ReactNode;
  /**
   * Hide row actions until hover/focus. Touch devices keep them visible.
   * Use alwaysRevealActions for rows that must stay interactive (inline edit).
   */
  revealActionsOnHover?: boolean;
  alwaysRevealActions?: (row: T) => boolean;
  emptyTitle?: string;
  /**
   * Virtualization stays inside DataTable so pages never import TanStack Virtual.
   * Enable only for unusually large in-memory sets; paginated ERP lists stay unvirtualized.
   */
  enableVirtualization?: boolean;
  virtualizeThreshold?: number;
  enableColumnResize?: boolean;
  variant?: "default" | "cards";
  paginationStyle?: "range" | "count";
  tableSx?: SystemStyleObject<Theme>;
  actionColumnSize?: number;
  fluidColumnIds?: string[];
}

export const DataTable = <T,>({
  columns,
  data,
  total,
  page,
  pageSize,
  search,
  sorting = [],
  loading = false,
  error = null,
  title,
  subtitle,
  searchPlaceholder,
  filters,
  extras,
  enableSelection = false,
  rowSelection,
  onRowSelectionChange,
  onSearchChange,
  onPageChange,
  onSortingChange,
  onRetry,
  getRowId,
  rowActions,
  revealActionsOnHover = true,
  alwaysRevealActions,
  emptyTitle,
  enableVirtualization = false,
  virtualizeThreshold = 80,
  enableColumnResize = true,
  variant = "default",
  paginationStyle = "range",
  tableSx,
  actionColumnSize,
  fluidColumnIds = [],
}: DataTableProps<T>) => {
  const tableColumns = useMemo<ColumnDef<T, unknown>[]>(() => {
    const selectionColumn: ColumnDef<T, unknown> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          size="small"
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={table.getIsSomePageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          inputProps={{ "aria-label": "Select all visible" }}
          sx={{ p: 0 }}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          size="small"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          inputProps={{ "aria-label": "Select row" }}
          sx={{ p: 0 }}
        />
      ),
      size: 52,
      minSize: 52,
      maxSize: 52,
      enableResizing: false,
      enableSorting: false,
    };

    const actionColumn: ColumnDef<T, unknown> = {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Box className="ierp-row-actions" sx={{ display: "inline-flex", justifyContent: "flex-end", width: "100%" }}>
          {rowActions?.(row.original)}
        </Box>
      ),
      enableSorting: false,
      size: actionColumnSize ?? (variant === "cards" ? 172 : 128),
      minSize: actionColumnSize ?? (variant === "cards" ? 148 : 88),
    };

    return [
      ...(enableSelection ? [selectionColumn] : []),
      ...columns,
      ...(rowActions ? [actionColumn] : []),
    ];
  }, [actionColumnSize, columns, enableSelection, rowActions, variant]);

  const columnVisibility: VisibilityState = {};
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});

  const table = useReactTable({
    data,
    columns: tableColumns,
    defaultColumn: {
      minSize: 72,
      size: 128,
      maxSize: 560,
    },
    state: {
      sorting,
      rowSelection: rowSelection ?? {},
      columnVisibility,
      columnSizing,
    },
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
    enableRowSelection: enableSelection,
    // Live resize so operators can shrink columns and keep a full row on screen
    // without a second horizontal pass.
    enableColumnResizing: enableColumnResize,
    columnResizeMode: "onChange",
    onSortingChange,
    onRowSelectionChange,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowSx = revealActionsOnHover
    ? {
        "& .ierp-row-actions-expanded": {
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 140ms ease",
        },
        "& .ierp-row-actions-compact": {
          opacity: 1,
          transition: "opacity 140ms ease",
        },
        "&:hover .ierp-row-actions-expanded, &:focus-within .ierp-row-actions-expanded": {
          opacity: 1,
          pointerEvents: "auto",
        },
        "&:hover .ierp-row-actions-compact, &:focus-within .ierp-row-actions-compact": {
          opacity: 0,
          pointerEvents: "none",
        },
        "&.ierp-row-actions-visible .ierp-row-actions-expanded": {
          opacity: 1,
          pointerEvents: "auto",
        },
        "&.ierp-row-actions-visible .ierp-row-actions-compact": {
          opacity: 0,
          pointerEvents: "none",
        },
        "@media (hover: none)": {
          "& .ierp-row-actions-expanded": {
            opacity: 1,
            pointerEvents: "auto",
          },
          "& .ierp-row-actions-compact": {
            opacity: 0,
            pointerEvents: "none",
          },
        },
      }
    : undefined;

  const rows = table.getRowModel().rows;
  const isCards = variant === "cards";
  const shouldVirtualize = !isCards && (enableVirtualization || rows.length >= virtualizeThreshold);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? rows.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 8,
  });

  return (
    <Paper sx={{ p: { xs: 1.5, md: isCards ? 2.5 : 2.25 }, borderRadius: isCards ? 2.5 : undefined }}>
      <DataTableToolbar
        title={title}
        subtitle={subtitle}
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        extras={extras}
      />

      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <TableContainer
          ref={parentRef}
          sx={{
            maxHeight: shouldVirtualize ? 560 : "none",
            overflow: "auto",
          }}
        >
          <Table
            stickyHeader={!isCards}
            size="small"
            sx={[
              (theme) => ({
                  tableLayout: fluidColumnIds.length > 0 ? "auto" : "fixed",
                  width: fluidColumnIds.length > 0 ? "100%" : table.getTotalSize(),
                minWidth: "100%",
              ...(isCards
                ? {
                    borderCollapse: "separate",
                    borderSpacing: "0 12px",
                    "& .MuiTableHead-root .MuiTableCell-root": {
                      backgroundColor: "transparent",
                      borderBottom: 0,
                      pb: 0.5,
                    },
                    "& .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root": {
                      borderBottom: 0,
                      backgroundColor: theme.palette.chrome.input,
                      py: 2.25,
                    },
                    "& .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root:first-of-type": {
                      borderTopLeftRadius: 16,
                      borderBottomLeftRadius: 16,
                      boxShadow: `inset 1px 0 0 ${theme.palette.divider}, inset 0 1px 0 ${theme.palette.divider}, inset 0 -1px 0 ${theme.palette.divider}`,
                    },
                    "& .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root:last-of-type": {
                      borderTopRightRadius: 16,
                      borderBottomRightRadius: 16,
                      boxShadow: `inset -1px 0 0 ${theme.palette.divider}, inset 0 1px 0 ${theme.palette.divider}, inset 0 -1px 0 ${theme.palette.divider}`,
                    },
                    "& .MuiTableBody-root .MuiTableRow-root .MuiTableCell-root:not(:first-of-type):not(:last-of-type)": {
                      boxShadow: `inset 0 1px 0 ${theme.palette.divider}, inset 0 -1px 0 ${theme.palette.divider}`,
                    },
                    "& .MuiTableBody-root .MuiTableRow-root:hover .MuiTableCell-root": {
                      backgroundColor: theme.palette.chrome.hover,
                    },
                  }
                : {}),
              }),
              tableSx ?? {},
            ]}
          >
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sorted = header.column.getIsSorted();
                    const width = header.getSize();
                    const isSelect = header.column.id === "select";
                    const isFluid = fluidColumnIds.includes(header.column.id);
                    return (
                      <TableCell
                        key={header.id}
                        sx={{
                          position: "relative",
                          width,
                          minWidth: isFluid ? header.column.columnDef.minSize ?? width : width,
                          maxWidth: isFluid ? "none" : width,
                          overflow: isSelect ? "visible" : "hidden",
                          px: isSelect ? 1 : 1.5,
                          textAlign: isSelect ? "center" : "left",
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          <Box
                            sx={{
                              pr: enableColumnResize && !isSelect ? 1.25 : 0,
                              overflow: isSelect ? "visible" : "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: isSelect ? "flex" : "block",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            {canSort && onSortingChange ? (
                              <TableSortLabel
                                active={Boolean(sorted)}
                                direction={sorted === "desc" ? "desc" : "asc"}
                                onClick={header.column.getToggleSortingHandler()}
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </TableSortLabel>
                            ) : (
                              flexRender(header.column.columnDef.header, header.getContext())
                            )}
                          </Box>
                        )}
                        {enableColumnResize && !isSelect ? <ColumnResizeHandle header={header} /> : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} sx={{ p: 0, border: 0 }}>
                    <DataTableSkeleton columns={tableColumns.length} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={tableColumns.length}>
                    <EmptyState title={emptyTitle} />
                  </TableCell>
                </TableRow>
              ) : shouldVirtualize ? (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} sx={{ p: 0, border: 0 }}>
                    <Box sx={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                      {virtualizer.getVirtualItems().map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        return (
                          <Box
                            key={row.id}
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              transform: `translateY(${virtualRow.start}px)`,
                            }}
                          >
                            <Table size="small">
                              <TableBody>
                                <TableRow
                                  hover
                                  selected={row.getIsSelected()}
                                  className={
                                    alwaysRevealActions?.(row.original) ? "ierp-row-actions-visible" : undefined
                                  }
                                  sx={rowSx}
                                >
                                  {row.getVisibleCells().map((cell) => (
                                      <TableCell
                                        key={cell.id}
                                        sx={bodyCellSx(
                                          cell.column.getSize(),
                                          cell.column.id,
                                          fluidColumnIds,
                                          cell.column.columnDef.minSize,
                                        )}
                                      >
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Box>
                        );
                      })}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    selected={row.getIsSelected()}
                    className={alwaysRevealActions?.(row.original) ? "ierp-row-actions-visible" : undefined}
                    sx={rowSx}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        sx={bodyCellSx(
                          cell.column.getSize(),
                          cell.column.id,
                          fluidColumnIds,
                          cell.column.columnDef.minSize,
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
        style={paginationStyle}
      />
    </Paper>
  );
};

const bodyCellSx = (
  width: number,
  columnId: string,
  fluidColumnIds: string[],
  minWidth = width,
) => {
  const isSelect = columnId === "select";
  const isActions = columnId === "actions";
  const isFluid = fluidColumnIds.includes(columnId);
  return {
    width,
    minWidth: isFluid ? minWidth : width,
    maxWidth: isFluid ? "none" : width,
    overflow: isSelect || isActions ? "visible" : "hidden",
    textOverflow: "ellipsis",
    whiteSpace: isSelect || isActions ? "normal" : "nowrap",
    px: isSelect ? 1 : 1.5,
    textAlign: isSelect ? ("center" as const) : isActions ? ("right" as const) : ("left" as const),
    "& .MuiTextField-root": {
      whiteSpace: "normal",
    },
  };
};
