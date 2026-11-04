import { useMemo, type ReactElement } from "react";
import { motion, type TargetAndTransition, type Transition } from "motion/react";
import { PAPA_MAX_POINTS, PAPA_STAGES, papaImpression, type AttackOutcome } from "@/lib/gameEngine";
import { PAPA_STAGE_COPY } from "@/lib/script";
import { cn } from "@/lib/utils";
import { PapaSprite } from "@/components/game/Sprites";

const BAR_TRANSITION: Transition = { duration: 0.6, ease: "easeOut" };

/** Papa's Skeptical → Impressed meter, driven purely by resolved attack outcomes. */
export function PapaMoodMeter({ outcomes, className }: { outcomes: Record<string, AttackOutcome>; className?: string }): ReactElement {
  const { points, stage } = papaImpression(outcomes);
  const copy = PAPA_STAGE_COPY[stage];
  const stageIndex = PAPA_STAGES.indexOf(stage);
  const percent = Math.min(100, (points / PAPA_MAX_POINTS) * 100);
  const barAnimate = useMemo<TargetAndTransition>(() => ({ width: `${percent}%` }), [percent]);

  return (
    <div
      className={cn("flex items-center gap-4 rounded-sm border-2 border-papa/50 bg-[#220D1A]/90 p-4 shadow-[5px_5px_0_rgba(0,0,0,0.5)]", className)}
      data-testid="papa-mood-meter"
      data-stage={stage}
    >
      <div className="h-24 w-16 shrink-0">
        <PapaSprite mood={copy.mood} className="h-full w-full" data-testid="papa-mood-sprite" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-papa">Papa's mood</p>
        <p className="font-heading text-xl font-black uppercase leading-tight text-white" data-testid="papa-mood-label">
          {copy.label}
        </p>
        <div className="mt-2 flex gap-1" aria-label={`Mood ${stageIndex + 1} of ${PAPA_STAGES.length}`}>
          {PAPA_STAGES.map((s, i) => (
            <span key={s} className={cn("h-2 flex-1 transition-colors duration-500", i <= stageIndex ? "bg-papa" : "bg-rose-950")} />
          ))}
        </div>
        <div className="mt-1 h-1 w-full bg-rose-950/60">
          <motion.div className="h-full bg-gold" initial={false} animate={barAnimate} transition={BAR_TRANSITION} />
        </div>
        <p className="mt-2 text-sm italic leading-snug text-rose-100" data-testid="papa-mood-line">
          “{copy.line}”
        </p>
      </div>
    </div>
  );
}
