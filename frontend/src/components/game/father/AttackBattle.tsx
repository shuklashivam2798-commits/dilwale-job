import { useMemo, useState, type ReactElement } from "react";
import { motion, useReducedMotion, type TargetAndTransition, type Transition } from "motion/react";
import { FastForward, NotebookPen, ShieldCheck, ShieldHalf, X } from "lucide-react";
import { papaImpression, type AttackOutcome } from "@/lib/gameEngine";
import { useGame } from "@/hooks/useGame";
import { REACTION_MOOD } from "@/lib/script";
import type { Arena, FatherAttack, ResumePower } from "@/lib/types";
import { useAttackSequence, type BattleStep } from "@/hooks/useAttackSequence";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PapaSprite, ShivamSprite, type PapaMood } from "@/components/game/Sprites";
import { Sparkles } from "@/components/game/StageFx";
import { Typewriter } from "@/components/game/Typewriter";
import { BattleResult } from "@/components/game/father/BattleResult";
import { ScanPanel } from "@/components/game/father/ScanPanel";

const ARENA_BG: Record<string, string> = {
  growth: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.35),transparent_60%),linear-gradient(to_bottom,#2A1306,#0D0714)]",
  insight: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.35),transparent_60%),linear-gradient(to_bottom,#06222A,#0D0714)]",
  ownership: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.45),transparent_60%),linear-gradient(to_bottom,#1B0B33,#0D0714)]",
};

/** Papa's face before the result; at the result he reacts per outcome (REACTION_MOOD). */
const STEP_MOOD: Record<Exclude<BattleStep, "result">, PapaMood> = { launch: "angry", flight: "angry", scan: "skeptical" };

// Static motion configs (hoisted so they are not recreated each render).
const TITLE_INITIAL: TargetAndTransition = { scale: 2.2, opacity: 0, rotate: -10 };
const TITLE_ANIMATE: TargetAndTransition = { scale: 1, opacity: 1, rotate: -4 };
const TITLE_TRANSITION: Transition = { type: "spring", stiffness: 300, damping: 16 };
const PROJECTILE_INITIAL: TargetAndTransition = { left: "26%", top: "40%", rotate: 0, scale: 0.6, opacity: 1 };
const PROJECTILE_FLYING: TargetAndTransition = { left: "70%", top: "48%", rotate: 720, scale: 1.25, opacity: 1 };
const PROJECTILE_LANDED: TargetAndTransition = { ...PROJECTILE_FLYING, opacity: 0 };
const PROJECTILE_TRANSITION: Transition = { duration: 0.85, ease: "easeIn" };
const IMPACT_INITIAL: TargetAndTransition = { scale: 0.4, opacity: 1 };
const IMPACT_ANIMATE: TargetAndTransition = { scale: 1.6, opacity: 0 };
const IMPACT_TRANSITION: Transition = { duration: 0.6 };
const BADGE_INITIAL: TargetAndTransition = { scale: 0, opacity: 0 };
const BADGE_ANIMATE: TargetAndTransition = { scale: 1, opacity: 1 };
const BADGE_TRANSITION: Transition = { type: "spring", stiffness: 260, damping: 14 };

interface AttackBattleProps {
  attack: FatherAttack;
  arena: Arena;
  vault: ResumePower[];
  onClose: () => void;
}

/** Full-screen attack sequence: Papa's question → "?" projectile → vault scan → deterministic JSON outcome. */
export function AttackBattle({ attack, arena, vault, onClose }: AttackBattleProps): ReactElement {
  const { progress, dispatch, sfx } = useGame();
  const reduceMotion = useReducedMotion() ?? false;
  const { step, hit, markTyped, toResult } = useAttackSequence({ attack, reduceMotion, dispatch, sfx });
  // Papa's mood before this attack resolves — lets the result announce a mood change.
  const [stageBefore] = useState(() => papaImpression(progress?.attackOutcomes ?? {}).stage);
  const matches = useMemo(
    () => attack.proof.related_powers.map((id) => vault.find((p) => p.id === id)).filter((p): p is ResumePower => Boolean(p)),
    [attack, vault],
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-night"
      role="dialog"
      aria-modal="true"
      aria-label={`Question attack ${attack.id}: ${attack.name}`}
      data-testid="battle-overlay"
      data-step={step}
    >
      <div aria-hidden className="scanlines pointer-events-none fixed inset-0" />
      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-8">
        <BattleTopBar attack={attack} arena={arena} showSkip={step !== "result"} onSkip={toResult} onClose={onClose} />
        <BattleStage attack={attack} arena={arena} step={step} hit={hit} reduceMotion={reduceMotion}>
          {step === "scan" && <ScanPanel vault={vault} matches={matches} reduceMotion={reduceMotion} onDone={toResult} />}
        </BattleStage>
        <div className="mt-6">
          {step === "result" ? (
            <BattleResult attack={attack} powers={matches} vaultSize={vault.length} stageBefore={stageBefore} onContinue={onClose} />
          ) : (
            <BattleDialogue attack={attack} scanning={step === "scan"} reduceMotion={reduceMotion} onTyped={markTyped} />
          )}
        </div>
      </div>
    </div>
  );
}

interface BattleTopBarProps {
  attack: FatherAttack;
  arena: Arena;
  showSkip: boolean;
  onSkip: () => void;
  onClose: () => void;
}

function BattleTopBar({ attack, arena, showSkip, onSkip, onClose }: BattleTopBarProps): ReactElement {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-papa">
        Arena 0{arena.number} · Attack {attack.id}
      </span>
      <span className="hidden font-mono text-[10px] uppercase tracking-widest text-violet-400 sm:inline">{attack.difficulty}</span>
      <div className="flex-1" />
      {showSkip && (
        <Button
          variant="outline"
          onClick={onSkip}
          className="h-9 rounded-sm border-gold/60 bg-night/60 font-mono text-[11px] font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-night"
          data-testid="battle-skip-button"
        >
          Skip to answer <FastForward className="size-3.5" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        aria-label="Back to the arena"
        className="size-9 rounded-sm text-violet-200 hover:bg-violet-900/60 hover:text-white"
        data-testid="battle-close-button"
      >
        <X className="size-5" />
      </Button>
    </div>
  );
}

interface BattleStageProps {
  attack: FatherAttack;
  arena: Arena;
  step: BattleStep;
  hit: boolean;
  reduceMotion: boolean;
  children?: ReactElement | false;
}

function BattleStage({ attack, arena, step, hit, reduceMotion, children }: BattleStageProps): ReactElement {
  const isResult = step === "result";
  const isAttacking = step === "launch" || step === "flight";
  const papaMood = isResult ? REACTION_MOOD[attack.outcome] : STEP_MOOD[step];

  return (
    <div
      className={cn(
        "relative mt-4 overflow-hidden rounded-sm border-2 border-violet-700/60 transition-[height] duration-500",
        isResult ? "h-[220px] sm:h-[250px]" : "h-[clamp(200px,46vh,430px)]",
      )}
      data-testid="battle-stage"
    >
      <div aria-hidden className={cn("absolute inset-0", ARENA_BG[arena.id] ?? ARENA_BG.ownership)} />
      <div aria-hidden className="stage-floor absolute inset-x-0 bottom-0 h-14" />
      {isResult && attack.outcome !== "learning" && <Sparkles count={12} />}

      <div className="absolute bottom-4 left-[6%] h-[78%] w-[28%] max-w-[210px]">
        <PapaSprite mood={papaMood} className="h-full w-full" data-testid="battle-papa-sprite" />
      </div>
      <div className={cn("absolute bottom-4 right-[6%] h-[74%] w-[26%] max-w-[200px]", hit && !isResult && "animate-shake")}>
        <ShivamSprite className="h-full w-full" data-testid="battle-shivam-sprite" />
        {isResult && <DefenseBadge outcome={attack.outcome} />}
      </div>

      {isAttacking && <AttackTitle name={attack.name} reduceMotion={reduceMotion} />}
      {step === "flight" && <Projectile hit={hit} />}
      {children}
    </div>
  );
}

function AttackTitle({ name, reduceMotion }: { name: string; reduceMotion: boolean }): ReactElement {
  return (
    <motion.div
      initial={reduceMotion ? false : TITLE_INITIAL}
      animate={TITLE_ANIMATE}
      transition={TITLE_TRANSITION}
      className="absolute left-1/2 top-[10%] -translate-x-1/2 text-center"
      data-testid="battle-attack-title"
    >
      <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-white">Question attack!</span>
      <span className="text-glow-magenta mt-1 block font-heading text-2xl font-black uppercase leading-none tracking-tight text-magenta sm:text-4xl">
        {name}
      </span>
    </motion.div>
  );
}

function Projectile({ hit }: { hit: boolean }): ReactElement {
  return (
    <>
      <motion.div
        aria-hidden
        initial={PROJECTILE_INITIAL}
        animate={hit ? PROJECTILE_LANDED : PROJECTILE_FLYING}
        transition={PROJECTILE_TRANSITION}
        className="absolute flex size-14 items-center justify-center rounded-full border-4 border-white bg-magenta font-heading text-3xl font-black text-white shadow-[0_0_30px_rgba(236,72,153,0.9)]"
        data-testid="battle-projectile"
      >
        ?
      </motion.div>
      {hit && (
        <motion.span
          aria-hidden
          initial={IMPACT_INITIAL}
          animate={IMPACT_ANIMATE}
          transition={IMPACT_TRANSITION}
          className="absolute right-[12%] top-[38%] font-heading text-4xl font-black uppercase text-gold-soft"
        >
          Dhishoom!
        </motion.span>
      )}
    </>
  );
}

interface BattleDialogueProps {
  attack: FatherAttack;
  scanning: boolean;
  reduceMotion: boolean;
  onTyped: () => void;
}

function BattleDialogue({ attack, scanning, reduceMotion, onTyped }: BattleDialogueProps): ReactElement {
  return (
    <section className="pixel-frame relative rounded-sm bg-dialog px-5 pb-5 pt-6 sm:px-7" aria-live="polite" data-testid="battle-dialogue-box">
      <span
        className={cn(
          "absolute -top-3 left-6 rounded-sm px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest shadow-[3px_3px_0_#0D0714]",
          scanning ? "bg-gold-soft text-night" : "bg-papa text-white",
        )}
      >
        {scanning ? "Resume Raksha" : "Recruiter Papa"}
      </span>
      {scanning ? (
        <p className="font-heading text-lg font-bold text-white sm:text-2xl" data-testid="battle-scanning-text">
          Scanning Shivam's Resume Powers...
        </p>
      ) : (
        <p className="font-heading text-lg font-bold leading-snug text-white sm:text-2xl">
          <Typewriter text={attack.question} complete={reduceMotion} speed={22} onDone={onTyped} data-testid="battle-question-text" />
        </p>
      )}
    </section>
  );
}

const DEFENSE_ICON: Record<AttackOutcome, ReactElement> = {
  proven: <ShieldCheck className="size-14 fill-emerald-500/30 text-emerald-300 drop-shadow-[0_0_14px_rgba(52,211,153,0.9)] sm:size-16" />,
  partial: <ShieldHalf className="size-14 fill-amber-500/30 text-amber-300 drop-shadow-[0_0_14px_rgba(251,191,36,0.9)] sm:size-16" />,
  learning: <NotebookPen className="size-12 text-rose-300 drop-shadow-[0_0_14px_rgba(244,63,94,0.8)] sm:size-14" />,
};

function DefenseBadge({ outcome }: { outcome: AttackOutcome }): ReactElement {
  return (
    <motion.div
      initial={BADGE_INITIAL}
      animate={BADGE_ANIMATE}
      transition={BADGE_TRANSITION}
      className="absolute -left-10 top-1/4 sm:-left-14"
      data-testid="battle-defense-badge"
    >
      {DEFENSE_ICON[outcome]}
    </motion.div>
  );
}
