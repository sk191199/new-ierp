import { ERROR_FALLBACK_MESSAGES, type ErrorCode } from "@/constants/errorCodes";
import { NormalizedApiError } from "@/models/common/api";
import { normalizeError } from "@/configurations/api/errorNormalizer";

export const getErrorMessage = (error: unknown): string => {
  const normalized = error instanceof NormalizedApiError ? error : normalizeError(error);
  return normalized.message || ERROR_FALLBACK_MESSAGES[normalized.code as ErrorCode] || normalized.message;
};

export const getFieldError = (error: unknown): string | undefined => {
  const normalized = error instanceof NormalizedApiError ? error : normalizeError(error);
  return normalized.field;
};
