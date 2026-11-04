import { useEffect, useState, type ReactElement } from "react";
import type { ResumePower } from "@/lib/types";
import { cn } from "@/lib/utils";

const SCAN_TICK_MS = 70;
const MATCH_HOLD_MS = 1300;
const REDUCED_MATCH_HOLD_MS = 500;

type TileState = "match" | "current" | "miss" | "scanned" | "pending";

const TILE_CLASS: Record<TileState, string> = {
  match: "border-gold bg-gold text-night shadow-[0_0_14px_rgba(253,224,71,0.9)]",
  current: "border-white bg-violet-600 text-white",
  miss: "border-rose-900 bg-rose-950/60 text-rose-400/70",
  scanned: "border-violet-800 bg-violet-950 text-violet-400",
  pending: "border-violet-900 bg-night text-violet-700",
};

function tileState(index: number, cursor: number, finished: boolean, isMatch: boolean, anyMatch: boolean): TileState {
  if (isMatch) return "match";
  if (!finished && index === cursor) return "current";
  if (finished && !anyMatch) return "miss";
  if (index < cursor) return "scanned";
  return "pending";
}

interface ScanPanelProps {
  vault: ResumePower[];
  matches: ResumePower[];
  reduceMotion: boolean;
  onDone: () => void;
}

/** Sweeps all 21 vault powers one by one, then locks onto the JSON-defined matches (or none). */
export function ScanPanel({ vault, matches, reduceMotion, onDone }: ScanPanelProps): ReactElement {
  const total = vault.length;
  const [cursor, setCursor] = useState(reduceMotion ? total : 0);
  const finished = cursor >= total;
  const matchIds = new Set(matches.map((m) => m.id));

  useEffect(() => {
    if (finished) return;
    const timer = window.setInterval(() => setCursor((c) => Math.min(c + 1, total)), SCAN_TICK_MS);
    return () => window.clearInterval(timer);
  }, [finished, total]);

  useEffect(() => {
    if (!finished) return;
    const timer = window.setTimeout(onDone, reduceMotion ? REDUCED_MATCH_HOLD_MS : MATCH_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [finished, onDone, reduceMotion]);

  return (
    <div className="absolute inset-x-3 top-3 z-10 rounded-sm border-2 border-gold/70 bg-night/90 p-3 backdrop-blur-sm sm:inset-x-[12%] sm:p-4" data-testid="battle-scan-panel">
      <div className="grid grid-cols-7 gap-1.5">
        {vault.map((p, i) => {
          const isMatch = finished && matchIds.has(p.id);
          return (
            <div
              key={p.id}
              title={p.label}
              className={cn(
                "flex h-8 items-center justify-center rounded-[2px] border font-mono text-[9px] font-semibold transition-[background-color,border-color,color,box-shadow] duration-150 sm:h-10 sm:text-[10px]",
                TILE_CLASS[tileState(i, cursor, finished, isMatch, matches.length > 0)],
              )}
              data-testid={`scan-tile-${p.id}`}
              data-match={isMatch || undefined}
            >
              {p.id}
            </div>
          );
        })}
      </div>
      <p className="mt-3 truncate font-mono text-[11px] font-semibold uppercase tracking-widest" data-testid="battle-scan-status">
        <ScanStatus current={vault[Math.min(cursor, total - 1)]} finished={finished} matches={matches} />
      </p>
    </div>
  );
}

function ScanStatus({ current, finished, matches }: { current?: ResumePower; finished: boolean; matches: ResumePower[] }): ReactElement {
  if (!finished) {
    return (
      <span className="text-violet-200">
        Scanning {current?.id} · {current?.label}…
      </span>
    );
  }
  if (matches.length > 0) {
    return <span className="text-gold-soft">Match found: {matches.map((m) => m.label).join(" + ")}</span>;
  }
  return <span className="text-rose-300">Resume power not found</span>;
}
