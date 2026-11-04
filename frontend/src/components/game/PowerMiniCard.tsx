import type { ResumePower } from "@/lib/types";
import { typeStyle } from "@/lib/powerTypes";
import { cn } from "@/lib/utils";

/** Compact, read-only Resume Power card used inside proof panels and spotlights. */
export function PowerMiniCard({ power, className, testId }: { power: ResumePower; className?: string; testId?: string }) {
  return (
    <div
      className={cn("rounded-sm border-2 border-gold/60 bg-[#1E1338] p-3 shadow-[3px_3px_0_rgba(0,0,0,0.5)]", className)}
      data-testid={testId ?? `power-mini-${power.id}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold text-violet-400">{power.id}</span>
        <span className="truncate font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-soft">{power.source}</span>
      </div>
      <p className="mt-1 font-heading text-sm font-bold leading-snug text-white">{power.label}</p>
      <span className={cn("mt-1.5 inline-block rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider", typeStyle(power.achievement_type))}>
        {power.achievement_type}
      </span>
      <p className="mt-1.5 text-xs leading-relaxed text-violet-100">{power.fact}</p>
    </div>
  );
}
