import type { ReactElement } from "react";
import { motion, type TargetAndTransition, type Transition, type Variants } from "motion/react";
import { Award, FileSearch, LockOpen } from "lucide-react";
import type { JourneyId } from "@/lib/gameEngine";
import { typeStyle } from "@/lib/powerTypes";
import type { SpotlightCopy } from "@/lib/script";
import type { Arena, ResumePower } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Static motion configs: story cards stagger by index via `custom`.
// Papa's inspection slides evidence in; Shivam's debrief "unlocks" each achievement with a gold flash.
const STORY_ITEM: Record<JourneyId, Variants> = {
  father: {
    hidden: { opacity: 0, x: -16 },
    shown: (i: number) => ({ opacity: 1, x: 0, transition: { delay: 0.1 + i * 0.12 } }),
  },
  shivam: {
    hidden: { opacity: 0, y: 14, scale: 0.96, boxShadow: "0 0 0px rgba(253,224,71,0)" },
    shown: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      boxShadow: ["0 0 0px rgba(253,224,71,0)", "0 0 28px rgba(253,224,71,0.55)", "0 0 0px rgba(253,224,71,0)"],
      transition: { delay: 0.15 + i * 0.18, duration: 0.9 },
    }),
  },
};
const STORY_ICON: Variants = {
  hidden: { scale: 0, rotate: -30 },
  shown: (i: number) => ({ scale: 1, rotate: 0, transition: { delay: 0.3 + i * 0.18, type: "spring", stiffness: 320, damping: 12 } }),
};
const ITEM_ICON: Record<JourneyId, ReactElement> = {
  father: <FileSearch className="size-4 text-gold" />,
  shivam: <LockOpen className="size-4 text-gold" />,
};
const SEAL_INITIAL: TargetAndTransition = { scale: 1.6, opacity: 0, rotate: -12 };
const SEAL_ANIMATE: TargetAndTransition = { scale: 1, opacity: 1, rotate: -4 };
const SEAL_TRANSITION: Transition = { delay: 0.5, type: "spring", stiffness: 260, damping: 14 };

interface SpotlightDialogProps {
  arena: Arena;
  powers: ResumePower[];
  /** Journey framing: Papa's Proof Inspection or Shivam's Victory Debrief. */
  copy: SpotlightCopy;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present once all three seals are earned: offers the jump to Miss Growth's finale. */
  onFinale?: () => void;
}

/** The arena's mandatory spotlight, told from the arena's Resume Powers. Opening it (handled by the caller) earns the seal. */
export function SpotlightDialog({ arena, powers, copy, open, onOpenChange, onFinale }: SpotlightDialogProps): ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto rounded-sm border-2 border-gold bg-panel sm:max-w-2xl"
        data-testid="spotlight-dialog"
        data-variant={copy.id}
      >
        <DialogHeader>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold" data-testid="spotlight-kicker">
            {copy.kicker} · {copy.stageLabel} 0{arena.number}
          </p>
          <DialogTitle className="font-heading text-2xl font-black uppercase tracking-tight text-white" data-testid="spotlight-title">
            {copy.title(arena)}
          </DialogTitle>
          <DialogDescription className="text-violet-200" data-testid="spotlight-description">
            {copy.description(arena)}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-sm border-l-4 border-gold bg-night/70 px-4 py-3" data-testid="spotlight-challenge">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-gold">{copy.challengeLabel}</p>
          <p className="mt-1 text-sm leading-relaxed text-white/90">{arena.hero_problem}</p>
        </div>

        <ol className="space-y-2.5" data-testid="spotlight-proof-list">
          {powers.map((p, i) => (
            <StoryCard key={p.id} power={p} index={i} copy={copy} />
          ))}
        </ol>

        <motion.div
          initial={SEAL_INITIAL}
          animate={SEAL_ANIMATE}
          transition={SEAL_TRANSITION}
          className="mx-auto flex items-center gap-2 border-4 border-gold bg-night px-4 py-2 shadow-[5px_5px_0_#7C2D12]"
          data-testid="spotlight-seal-earned"
        >
          <Award className="size-6 text-gold" />
          <span className="font-heading text-lg font-black uppercase tracking-tight text-gold">{arena.badge} earned!</span>
        </motion.div>

        <DialogFooter>
          {onFinale && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onFinale();
              }}
              className="rounded-sm bg-magenta font-heading font-bold uppercase text-white hover:bg-pink-400"
              data-testid="spotlight-finale-button"
            >
              All 3 seals! Meet Miss Growth
            </Button>
          )}
          <Button
            variant={onFinale ? "outline" : "default"}
            onClick={() => onOpenChange(false)}
            className="rounded-sm font-heading font-bold uppercase"
            data-testid="spotlight-close-button"
          >
            Back to the arena
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** One Resume Power as a story: skill → action → measurable result (falls back to the full fact). */
function StoryCard({ power, index, copy }: { power: ResumePower; index: number; copy: SpotlightCopy }): ReactElement {
  return (
    <motion.li
      variants={STORY_ITEM[copy.id]}
      custom={index}
      initial="hidden"
      animate="shown"
      className="rounded-sm border border-gold/30 bg-night/70 p-3"
      data-testid={`spotlight-power-${power.id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <motion.span variants={STORY_ICON} custom={index} className="inline-flex">
          {ITEM_ICON[copy.id]}
        </motion.span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-gold">
          {copy.itemLabel} 0{index + 1} · {power.source}
        </span>
        <span className={cn("rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider", typeStyle(power.achievement_type))}>
          {power.achievement_type}
        </span>
      </div>
      <p className="mt-1.5 font-heading text-base font-bold leading-snug text-white" data-testid={`spotlight-power-${power.id}-skill`}>
        {copy.skillLabel && <span className="text-violet-300">{copy.skillLabel}: </span>}
        {power.label}
      </p>
      <dl className="mt-2 grid gap-2 sm:grid-cols-2">
        <StoryRow label={copy.actionLabel} text={power.action ?? power.fact} testId={`spotlight-power-${power.id}-action`} />
        {power.impact && <StoryRow label={copy.resultLabel} text={power.impact} highlight testId={`spotlight-power-${power.id}-impact`} />}
      </dl>
    </motion.li>
  );
}

function StoryRow({ label, text, highlight = false, testId }: { label: string; text: string; highlight?: boolean; testId: string }): ReactElement {
  return (
    <div className={cn("rounded-sm p-2", highlight ? "border border-emerald-500/40 bg-emerald-950/40" : "bg-panel/70")}>
      <dt className={cn("font-mono text-[9px] font-semibold uppercase tracking-widest", highlight ? "text-emerald-300" : "text-violet-300")}>{label}</dt>
      <dd className="mt-0.5 text-sm leading-relaxed text-white" data-testid={testId}>
        {text}
      </dd>
    </div>
  );
}
