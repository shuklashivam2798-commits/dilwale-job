// Safe persistence: localStorage when available, otherwise a module-level in-memory copy
// (private mode / blocked storage / quota errors never crash the game).
const KEY = "dilwale-job-le-jayenge:v1";

/** Development-only diagnostics; players never see storage noise in production. */
function warnDev(message: string, error: unknown): void {
  if (import.meta.env.DEV) console.warn(`[storage] ${message}`, error);
}

function probeLocalStorage(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = "__dilwale_probe__";
    s.setItem(probe, probe);
    s.removeItem(probe);
    return s;
  } catch (error) {
    warnDev("localStorage unavailable — using in-memory state for this session", error);
    return null;
  }
}

const backend = typeof window === "undefined" ? null : probeLocalStorage();
let memory: string | null = null;

export const storageMode: "local" | "memory" = backend ? "local" : "memory";

export function loadSaved(): unknown {
  try {
    const text = backend ? backend.getItem(KEY) : memory;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    warnDev("saved game unreadable — starting fresh", error);
    return null;
  }
}

export function saveState(value: unknown): void {
  const text = JSON.stringify(value);
  memory = text;
  if (!backend) return;
  try {
    backend.setItem(KEY, text);
  } catch (error) {
    // quota or revoked access — the in-memory copy keeps the session alive
    warnDev("could not write to localStorage — progress kept in memory only", error);
  }
}
