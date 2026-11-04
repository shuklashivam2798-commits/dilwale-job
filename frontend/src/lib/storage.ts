// Safe persistence: localStorage when available, otherwise a module-level in-memory copy
// (private mode / blocked storage / quota errors never crash the game).
const KEY = "dilwale-job-le-jayenge:v1";

function probeLocalStorage(): Storage | null {
  try {
    const s = window.localStorage;
    const probe = "__dilwale_probe__";
    s.setItem(probe, probe);
    s.removeItem(probe);
    return s;
  } catch {
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
  } catch {
    return null;
  }
}

export function saveState(value: unknown): void {
  const text = JSON.stringify(value);
  memory = text;
  if (!backend) return;
  try {
    backend.setItem(KEY, text);
  } catch {
    /* quota or revoked access — the in-memory copy keeps the session alive */
  }
}
