/**
 * Cliente minimo del backend (apps/backend). Todo en la app tiene que
 * seguir funcionando si esto falla o no hay red -- por eso cada llamada
 * tiene timeout corto y quien la usa siempre trae un fallback local.
 *
 * `EXPO_PUBLIC_API_BASE_URL` se define en build time (.env o EAS secrets).
 * 10.0.2.2 es el loopback del host visto desde el emulador de Android.
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.0.2.2:8000";
const TIMEOUT_MS = 4000;

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export type RemoteWordEntry = { word: string; sign_asset_url: string | null };

export async function fetchDictionaryWords(): Promise<RemoteWordEntry[] | null> {
  try {
    return await fetchJson<RemoteWordEntry[]>("/dictionary/words");
  } catch {
    return null; // sin red o backend caido: quien llama usa su lista local
  }
}

export async function syncHistoryToBackend(
  deviceId: string,
  entries: { kind: string; text: string; at: string }[]
): Promise<boolean> {
  try {
    await fetchJson("/history/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId, entries }),
    });
    return true;
  } catch {
    return false;
  }
}
