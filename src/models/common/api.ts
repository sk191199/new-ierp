import type { ErrorCode } from "@/constants/errorCodes";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiPaginatedSuccess<T> {
  success: true;
  data: T[];
  pagination: ApiPagination;
  message?: string;
}

export interface ApiErrorBody {
  success: false;
  error: ErrorCode | string;
  message: string;
  field?: string;
  errors?: string[];
  details?: string[];
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiErrorBody;
export type ApiListEnvelope<T> = ApiPaginatedSuccess<T> | ApiErrorBody;

export interface ListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}

export class NormalizedApiError extends Error {
  readonly code: string;
  readonly field?: string;
  readonly status: number;

  constructor(code: string, message: string, status: number, field?: string) {
    super(message);
    this.name = "NormalizedApiError";
    this.code = code;
    this.status = status;
    this.field = field;
  }
}
