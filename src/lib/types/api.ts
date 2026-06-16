/**
 * Standardized API envelope types.
 * Mirrors backend: IOC_Customer/src/libs/shared/http/dtos/response.dto.ts (success)
 * and libs/shared/http/filters/global-exception.filter.ts (error).
 */
export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message?: string;
  data: T;
}

export type ApiErrorPayload =
  | string
  | {
      name: string;
      code: string;
      message: string;
      details?: unknown;
    };

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error: ApiErrorPayload;
}

/**
 * Thrown by the API client on any failure path: network errors, malformed
 * responses, or backend/logic errors. Carries a stable, human-readable
 * `displayMessage` plus the structured `error` payload for programmatic use.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly displayMessage: string;

  constructor(statusCode: number, errorPayload: ApiErrorPayload) {
    const msg =
      typeof errorPayload === "string"
        ? errorPayload
        : errorPayload?.message || "Đã xảy ra lỗi không xác định.";
    super(msg);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.displayMessage = msg;
    // Restore prototype chain — Error subclassing under es5 targets drops it.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Safe helper to extract an error message for UI (toasts, alerts).
 * Handles ApiError, plain Error, strings, or junk (undefined/object).
 */
export function getErrorMessage(error: unknown, fallback = "Đã xảy ra sự cố không mong muốn."): string {
  if (error instanceof ApiError) return error.displayMessage;
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "string") return error;
  return fallback;
}
