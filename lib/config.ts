const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "")

/**
 * Base URL for the application.
 *
 * NOTE:
 * - `PAGE_RENDERING_SERVICE_URL` is available on the server.
 * - If you need this value on the client, prefer setting `NEXT_PUBLIC_PAGE_RENDERING_SERVICE_URL`.
 */
export const BASE_URL: string = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_PAGE_RENDERING_SERVICE_URL ??
    process.env.PAGE_RENDERING_SERVICE_URL ??
    "",
)

export function getBaseURL(): string {
  if (BASE_URL) return BASE_URL
  if (typeof window !== "undefined") return normalizeBaseUrl(window.location.origin)
  return ""
}

