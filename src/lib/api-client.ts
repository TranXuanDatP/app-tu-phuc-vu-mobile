import { ApiError, type ApiErrorResponse, type ApiResponse } from "@/lib/types/api";
import { env } from "@/lib/env";
import { getAuthCookie } from "@/lib/auth-token";

/**
 * Typed fetch wrapper over the backend (mobile port of web FE api-client.ts).
 *
 * Differences from web:
 *  - baseUrl = backend root (EXPO_PUBLIC_API_URL), not same-origin `/api/bff`. Call
 *    sites still pass bare backend paths (`/customers/profile`, `/billing/invoices`).
 *  - No cookie jar on RN → the better-auth session cookie (from expoClient's
 *    SecureStore) is attached as a `Cookie` header via `getAuthCookie()` instead of
 *    `credentials: "include"`.
 *
 * Unchanged: envelope unwrap (returns `data`), ApiError normalization for every
 * failure path (network / parse / HTTP / backend logic error).
 */
export class ApiClient {
  constructor(private readonly baseUrl: string = env.apiUrl) {}

  private buildUrl(path: string, query?: Record<string, unknown> | object): string {
    const url = `${this.baseUrl}${path}`;
    if (!query) return url;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      params.append(key, String(value));
    }
    const qs = params.toString();
    return qs ? `${url}?${qs}` : url;
  }

  async request<T>(
    path: string,
    options: RequestInit & { query?: Record<string, unknown> | object } = {},
  ): Promise<T> {
    const { query, headers, ...rest } = options;
    const endpoint = this.buildUrl(path, query);

    // Attach the better-auth session cookie (cookie-jar replacement for RN).
    const cookie = getAuthCookie();
    const authHeaders: Record<string, string> = cookie ? { Cookie: cookie } : {};

    let response: Response;
    // Only set Content-Type: application/json when there IS a body — a POST with
    // no body but Content-Type: application/json makes Fastify reject ("body
    // cannot be empty"), which broke check-registration (POST, no body).
    const hasBody = rest.body !== undefined && rest.body !== null;
    // 1. Network Error guard (CORS, offline, DNS, backend down).
    try {
      response = await fetch(endpoint, {
        ...rest,
        headers: {
          ...(hasBody ? { "Content-Type": "application/json" } : {}),
          ...authHeaders,
          ...headers,
        },
      });
    } catch {
      throw new ApiError(0, {
        name: "NetworkError",
        code: "FETCH_FAILED",
        message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền.",
      });
    }

    const text = await response.text();

    // 2. JSON.parse guard (proxy HTML, plain-text "Internal Server Error").
    let json: ApiResponse<T> | ApiErrorResponse | undefined;
    try {
      json = text ? (JSON.parse(text) as ApiResponse<T> | ApiErrorResponse) : undefined;
    } catch {
      throw new ApiError(response.status, {
        name: "ParseError",
        code: "INVALID_JSON",
        message: `Lỗi máy chủ (${response.status}): Phản hồi không đúng định dạng.`,
        details: text.slice(0, 100),
      });
    }

    // 3. HTTP Error or Backend Logic Error (envelope success === false).
    if (!response.ok || (json && json.success === false)) {
      const err = json as ApiErrorResponse | undefined;
      throw new ApiError(err?.statusCode ?? response.status, err?.error ?? response.statusText);
    }

    // Success — tolerate empty/no-content (e.g. 204) without crashing on `.data`.
    return (json as ApiResponse<T> | undefined)?.data as T;
  }

  get<T>(path: string, query?: Record<string, unknown> | object) {
    return this.request<T>(path, { method: "GET", query });
  }
  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

/** Singleton client. Calls backend root cross-origin; session cookie injected per-request. */
export const apiClient = new ApiClient();
