import { ApiError, type ApiErrorResponse, type ApiResponse } from "@/lib/types/api";

/**
 * Typed fetch wrapper over the BFF.
 *
 * - Calls same-origin `/api/bff/*` paths (proxied to the backend by next.config.ts
 *   rewrites), so the HttpOnly session cookie is sent automatically.
 * - Unwraps the backend envelope: returns `data` directly.
 * - Converts EVERY failure path (network, malformed response, HTTP/logic error)
 *   into a uniform `ApiError` with a stable `displayMessage`.
 *
 * The `/api/bff` prefix is essential: backend routes live at root (`/meters`, …)
 * which collide with Next page routes. `/api/bff/*` has no page routes, so
 * rewrites always fire. Call sites pass bare backend paths (e.g. `/meters`).
 */
export class ApiClient {
  constructor(private readonly baseUrl: string = "/api/bff") {}

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

    let response: Response;
    // 1. Network Error guard (CORS, offline, DNS, proxy down).
    try {
      response = await fetch(endpoint, {
        ...rest,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
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
        details: text.slice(0, 100), // first 100 chars for debugging
      });
    }

    // 3. HTTP Error or Backend Logic Error (envelope success === false).
    if (!response.ok || (json && json.success === false)) {
      const err = json as ApiErrorResponse | undefined;
      throw new ApiError(
        err?.statusCode ?? response.status,
        err?.error ?? response.statusText,
      );
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

/** Singleton client. Same-origin `/api/bff/*` paths, proxied to the backend. */
export const apiClient = new ApiClient();
