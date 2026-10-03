/**
 * SUTRA STUDIO — Browser Fetch Helper (Client Only)
 *
 * The counterpart to the server-only `lib/api/response.ts`.
 *
 * Every call goes to a same-origin `/api/*` route with the session cookie
 * attached, and every response is unwrapped to a typed value. A `503
 * NOT_CONFIGURED` response becomes a typed `NotConfiguredError` carrying the
 * MISSING KEY NAMES (never values), so any view can render the honest
 * "not configured" state instead of an empty screen.
 */

export interface ApiFailure {
  status: number;
  code: string;
  error: string;
  missingKeys?: string[];
  fields?: Record<string, string>;
}

/** Thrown for any non-2xx response. `status`/`code` allow precise handling. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly missingKeys: string[];
  readonly fields?: Record<string, string>;

  constructor(failure: ApiFailure) {
    super(failure.error);
    this.name = "ApiError";
    this.status = failure.status;
    this.code = failure.code;
    this.missingKeys = failure.missingKeys ?? [];
    this.fields = failure.fields;
  }

  /** True when the server is missing integration keys rather than broken. */
  get isNotConfigured(): boolean {
    return this.code === "NOT_CONFIGURED" || this.status === 503;
  }

  get isUnauthorised(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

/** Shared request implementation used by json() and jsonRaw(). */
async function request<T>(
  path: string,
  init: RequestInit & { method?: string } = {}
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });

  const body = (await parseBody(res)) as Record<string, unknown>;

  if (!res.ok) {
    throw new ApiError({
      status: res.status,
      code: typeof body.code === "string" ? body.code : "ERROR",
      error:
        typeof body.error === "string" && body.error
          ? body.error
          : "Something went wrong. Please try again.",
      missingKeys: Array.isArray(body.missingKeys) ? (body.missingKeys as string[]) : undefined,
      fields: body.fields as Record<string, string> | undefined,
    });
  }

  return body as T;
}

export function json<T>(path: string, method: "GET" | "DELETE" = "GET"): Promise<T> {
  return request<T>(path, { method });
}

export function jsonRaw<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH",
  body: unknown
): Promise<T> {
  return request<T>(path, { method, body: JSON.stringify(body ?? {}) });
}

/** Normalises any thrown value into a displayable string. */
export function errorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
