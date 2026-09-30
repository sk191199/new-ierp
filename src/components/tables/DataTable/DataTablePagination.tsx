import { Button, Stack, Typography } from "@mui/material";

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  style?: "range" | "count";
  pageLabel?: string;
}

export const DataTablePagination = ({
  page,
  pageSize,
  total,
  onPageChange,
  style = "range",
  pageLabel,
}: DataTablePaginationProps) => {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const label =
    style === "count"
      ? `SHOWING ${total} RECORDS`
      : `SHOWING ${start}-${end} OF ${total} RECORDS`;

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      gap={1}
      sx={{ pt: 2 }}
    >
      <Stack direction="row" gap={1.5} flexWrap="wrap">
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
          {label}
        </Typography>
        {pageLabel ? (
          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
            {pageLabel}
          </Typography>
        ) : null}
      </Stack>
      <Stack direction="row" gap={1}>
        <Button variant="outlined" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          PREV
        </Button>
        <Button
          variant={page < totalPages ? "contained" : "outlined"}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          NEXT
        </Button>
      </Stack>
    </Stack>
  );
};
