import { useMemo, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/configurations/api/config";
import { useDebounce } from "./useDebounce";

export interface TableQueryState {
  page: number;
  pageSize: number;
  search: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

/**
 * Server-side table state stays in the page, not Redux. List filters are
 * local until a user navigates away, which matches ERP worklist usage.
 */
export const useTableState = (initial?: Partial<TableQueryState>) => {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [pageSize, setPageSize] = useState(initial?.pageSize ?? DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState(initial?.search ?? "");
  const [sortBy, setSortBy] = useState<string | undefined>(initial?.sortBy);
  const [sortDir, setSortDir] = useState<"asc" | "desc" | undefined>(initial?.sortDir);
  const debouncedSearch = useDebounce(search);

  const query = useMemo<TableQueryState>(
    () => ({
      page,
      pageSize,
      search: debouncedSearch,
      sortBy,
      sortDir,
    }),
    [page, pageSize, debouncedSearch, sortBy, sortDir],
  );

  return {
    query,
    search,
    setSearch: (value: string) => {
      setPage(1);
      setSearch(value);
    },
    setPage,
    setPageSize: (value: number) => {
      setPage(1);
      setPageSize(value);
    },
    setSort: (column?: string, direction?: "asc" | "desc") => {
      setSortBy(column);
      setSortDir(direction);
    },
  };
};
