import { ERROR_CODES, ERROR_FALLBACK_MESSAGES, type ErrorCode } from "@/constants/errorCodes";
import { NormalizedApiError, type ApiErrorBody } from "@/models/common/api";
import { isAxiosError } from "axios";

const isErrorCode = (value: string): value is ErrorCode =>
  Object.values(ERROR_CODES).includes(value as ErrorCode);

const messageFor = (code: string, fallback?: string): string => {
  if (isErrorCode(code)) {
    return fallback || ERROR_FALLBACK_MESSAGES[code];
  }
  return fallback || ERROR_FALLBACK_MESSAGES.INTERNAL_ERROR;
};

const detailMessage = (body: ApiErrorBody | undefined): string | undefined => {
  const details = [...(body?.errors ?? []), ...(body?.details ?? [])].filter(Boolean);
  return details.length > 0 ? `${body?.message ?? "Request failed."} ${details.join(" ")}` : body?.message;
};

export const normalizeError = (error: unknown): NormalizedApiError => {
  if (error instanceof NormalizedApiError) {
    return error;
  }

  if (isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const body = error.response?.data as ApiErrorBody | undefined;
    const code = body?.error ?? (status === 401 ? ERROR_CODES.UNAUTHORIZED : ERROR_CODES.INTERNAL_ERROR);
    return new NormalizedApiError(code, messageFor(code, detailMessage(body)), status, body?.field);
  }

  if (error instanceof Error) {
    return new NormalizedApiError(ERROR_CODES.INTERNAL_ERROR, error.message, 0);
  }

  return new NormalizedApiError(ERROR_CODES.INTERNAL_ERROR, ERROR_FALLBACK_MESSAGES.INTERNAL_ERROR, 0);
};
