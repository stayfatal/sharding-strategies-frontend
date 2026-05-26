const LS_API_ORIGIN_KEY = "rip.apiOrigin";

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function normalizeOrigin(value: string | undefined): string {
  if (!value) return "";
  return trimSlash(value.trim());
}

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

function getApiOriginFromLocalStorage(): string {
  if (typeof window === "undefined") return "";
  const raw = window.localStorage.getItem(LS_API_ORIGIN_KEY);
  const origin = normalizeOrigin(raw ?? undefined);
  return isHttpUrl(origin) ? origin : "";
}

const envApiOrigin = normalizeOrigin(import.meta.env.VITE_API_ORIGIN as string | undefined);

/**
 * localStorage нужен для GitHub Pages (указать IP бэкенда без пересборки).
 * В `npm run dev` он перетягивает запросы с прокси Vite → localhost и ломает сценарий
 * «браузер = localhost». В dev игнорируем LS; IP для Tauri задаётся через VITE_* при сборке/tauri dev.
 */
const localStorageApiOrigin =
  import.meta.env.DEV ? "" : getApiOriginFromLocalStorage();

export const apiOrigin = localStorageApiOrigin || envApiOrigin;

export const apiBaseUrl = apiOrigin ? `${apiOrigin}/api` : "/api";

export const minioPublicBase =
  normalizeOrigin(import.meta.env.VITE_MINIO_PUBLIC_BASE as string | undefined) ||
  (import.meta.env.DEV ? "/object-media/test" : "http://localhost:9000/test");

export const runtimeConfigKeys = {
  apiOriginLocalStorage: LS_API_ORIGIN_KEY,
} as const;
