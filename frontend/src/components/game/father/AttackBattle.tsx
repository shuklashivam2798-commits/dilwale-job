import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FastForward, NotebookPen, ShieldCheck, ShieldHalf, X } from "lucide-react";
import { papaImpression } from "@/lib/gameEngine";
import { useGame } from "@/lib/game-store";
import { REACTION_MOOD } from "@/lib/script";
import type { Arena, FatherAttack, ResumePower } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PapaSprite, ShivamSprite, type PapaMood } from "@/components/game/Sprites";
import { Sparkles } from "@/components/game/StageFx";
import { Typewriter } from "@/components/game/Typewriter";
import { BattleResult } from "@/components/game/father/BattleResult";

type Step = "launch" | "flight" | "scan" | "result";

const ARENA_BG: Record<string, string> = {
  growth: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.35),transparent_60%),linear-gradient(to_bottom,#2A1306,#0D0714)]",
  insight: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(6,182,212,0.35),transparent_60%),linear-gradient(to_bottom,#06222A,#0D0714)]",
  ownership: "bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.45),transparent_60%),linear-gradient(to_bottom,#1B0B33,#0D0714)]",
};

interface AttackBattleProps {
  attack: FatherAttack;
  arena: Arena;
  vault: ResumePower[];
  onClose: () => void;
}

/** Full-screen attack sequence: Papa's question → "?" projectile → vault scan → deterministic JSON outcome. */
export function AttackBattle({ attack, arena, vault, onClose }: AttackBattleProps) {
  const { progress, dispatch, sfx } = useGame();
  const reduceMotion = useReducedMotion() ?? false;
  const [step, setStep] = useState<Step>("launch");
  const [typed, setTyped] = useState(false);
  const [hit, setHit] = useState(false);
  // Papa's mood before this attack resolves — lets the result announce a mood change.
  const [stageBefore] = useState(() => papaImpression(progress?.attackOutcomes ?? {}).stage);
  const matches = useMemo(
    () => attack.proof.related_powers.map((id) => vault.find((p) => p.id === id)).filter((p): p is ResumePower => Boolean(p)),
    [attack, vault],
  );

  const toResult = useCallback(() => setStep("result"), []);

  // launch → flight (or straight to scan with reduced motion)
  useEffect(() => {
    if (step !== "launch" || !typed) return;
    const t = window.setTimeout(() => {
      sfx("thud");
      setStep(reduceMotion ? "scan" : "flight");
    }, reduceMotion ? 900 : 650);
    return () => window.clearTimeout(t);
  }, [step, typed, reduceMotion, sfx]);

  // flight: projectile lands on Shivam, then the scan begins
  useEffect(() => {
    if (step !== "flight") return;
    const land = window.setTimeout(() => setHit(true), 850);
    const next = window.setTimeout(() => setStep("scan"), 1500);
    return () => {
      window.clearTimeout(land);
      window.clearTimeout(next);
    };
  }, [step]);

  // result: record the deterministic outcome exactly once per visit (reducer is idempotent too)
  useEffect(() => {
    if (step !== "result") return;
    dispatch({ type: "RECORD_ATTACK", key: attack.id, outcome: attack.outcome });
    sfx(attack.outcome === "learning" ? "heart" : attack.outcome === "partial" ? "confirm" : "sparkle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const papaMood: PapaMood =
    step === "launch" || step === "flight" ? "angry" : step === "scan" ? "skeptical" : REACTION_MOOD[attack.outcome];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night" role="dialog" aria-modal="true" aria-label={`Question attack ${attack.id}: ${attack.name}`} data-testid="battle-overlay" data-step={step}>
      <div aria-hidden className="scanlines pointer-events-none fixed inset-0" />
      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-4 sm:px-8">
        {/* top bar */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-papa">
            Arena 0{arena.number} · Attack {attack.id}
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-violet-400 sm:inline">{attack.difficulty}</span>
          <div className="flex-1" />
          {step !== "result" && (
            <Button
              variant="outline"
              onClick={toResult}
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

        {/* stage */}
        <div
          className={cn(
            "relative mt-4 overflow-hidden rounded-sm border-2 border-violet-700/60 transition-[height] duration-500",
            step === "result" ? "h-[220px] sm:h-[250px]" : "h-[clamp(280px,46vh,430px)]",
          )}
          data-testid="battle-stage"
        >
          <div aria-hidden className={cn("absolute inset-0", ARENA_BG[arena.id] ?? ARENA_BG.ownership)} />
          <div aria-hidden className="stage-floor absolute inset-x-0 bottom-0 h-14" />
          {step === "result" && attack.outcome !== "learning" && <Sparkles count={12} />}

          <div className="absolute bottom-4 left-[6%] h-[78%] w-[28%] max-w-[210px]">
            <PapaSprite mood={papaMood} className="h-full w-full" data-testid="battle-papa-sprite" />
          </div>

          <div className={cn("absolute bottom-4 right-[6%] h-[74%] w-[26%] max-w-[200px]", hit && step !== "result" && "animate-shake")}>
            <ShivamSprite className="h-full w-full" data-testid="battle-shivam-sprite" />
            {step === "result" && <DefenseBadge outcome={attack.outcome} />}
          </div>

          {/* attack title slam */}
          {(step === "launch" || step === "flight") && (
            <motion.div
              initial={reduceMotion ? false : { scale: 2.2, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 16 }}
              className="absolute left-1/2 top-[10%] -translate-x-1/2 text-center"
              data-testid="battle-attack-title"
            >
              <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-white">Question attack!</span>
              <span className="text-glow-magenta mt-1 block font-heading text-2xl font-black uppercase leading-none tracking-tight text-magenta sm:text-4xl">
                {attack.name}
              </span>
            </motion.div>
          )}

          {/* "?" projectile */}
          {step === "flight" && (
            <motion.div
              aria-hidden
              initial={{ left: "26%", top: "40%", rotate: 0, scale: 0.6, opacity: 1 }}
              animate={{ left: "70%", top: "48%", rotate: 720, scale: 1.25, opacity: hit ? 0 : 1 }}
              transition={{ duration: 0.85, ease: "easeIn" }}
              className="absolute flex size-14 items-center justify-center rounded-full border-4 border-white bg-magenta font-heading text-3xl font-black text-white shadow-[0_0_30px_rgba(236,72,153,0.9)]"
              data-testid="battle-projectile"
            >
              ?
            </motion.div>
          )}
          {hit && step === "flight" && (
            <motion.span
              initial={{ scale: 0.4, opacity: 1 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute right-[12%] top-[38%] font-heading text-4xl font-black uppercase text-gold-soft"
              aria-hidden
            >
              Dhishoom!
            </motion.span>
          )}

          {step === "scan" && <ScanPanel vault={vault} matches={matches} reduceMotion={reduceMotion} onDone={toResult} />}
        </div>

        {/* dialogue / result */}
        <div className="mt-6">
          {step === "result" ? (
            <BattleResult attack={attack} powers={matches} vaultSize={vault.length} stageBefore={stageBefore} onContinue={onClose} />
          ) : (
            <section className="pixel-frame relative rounded-sm bg-dialog px-5 pb-5 pt-6 sm:px-7" aria-live="polite" data-testid="battle-dialogue-box">
              <span
                className={cn(
                  "absolute -top-3 left-6 rounded-sm px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest shadow-[3px_3px_0_#0D0714]",
                  step === "scan" ? "bg-gold-soft text-night" : "bg-papa text-white",
                )}
              >
                {step === "scan" ? "Resume Raksha" : "Recruiter Papa"}
              </span>
              {step === "scan" ? (
                <p className="font-heading text-lg font-bold text-white sm:text-2xl" data-testid="battle-scanning-text">
                  Scanning Shivam's Resume Powers...
                </p>
              ) : (
                <p className="font-heading text-lg font-bold leading-snug text-white sm:text-2xl">
                  <Typewriter text={attack.question} complete={reduceMotion} speed={22} onDone={() => setTyped(true)} data-testid="battle-question-text" />
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function DefenseBadge({ outcome }: { outcome: FatherAttack["outcome"] }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 14 }}
      className="absolute -left-10 top-1/4 sm:-left-14"
      data-testid="battle-defense-badge"
    >
      {outcome === "proven" && <ShieldCheck className="size-14 fill-emerald-500/30 text-emerald-300 drop-shadow-[0_0_14px_rgba(52,211,153,0.9)] sm:size-16" />}
      {outcome === "partial" && <ShieldHalf className="size-14 fill-amber-500/30 text-amber-300 drop-shadow-[0_0_14px_rgba(251,191,36,0.9)] sm:size-16" />}
      {outcome === "learning" && <NotebookPen className="size-12 text-rose-300 drop-shadow-[0_0_14px_rgba(244,63,94,0.8)] sm:size-14" />}
    </motion.div>
  );
}

interface ScanPanelProps {
  vault: ResumePower[];
  matches: ResumePower[];
  reduceMotion: boolean;
  onDone: () => void;
}

/** Sweeps all 21 vault powers one by one, then locks onto the JSON-defined matches (or none). */
function ScanPanel({ vault, matches, reduceMotion, onDone }: ScanPanelProps) {
  const total = vault.length;
  const [cursor, setCursor] = useState(reduceMotion ? total : 0);
  const finished = cursor >= total;
  const matchIds = new Set(matches.map((m) => m.id));

  useEffect(() => {
    if (finished) return;
    const t = window.setInterval(() => setCursor((c) => Math.min(c + 1, total)), 70);
    return () => window.clearInterval(t);
  }, [finished, total]);

  useEffect(() => {
    if (!finished) return;
    const t = window.setTimeout(onDone, reduceMotion ? 500 : 1300);
    return () => window.clearTimeout(t);
  }, [finished, onDone, reduceMotion]);

  const current = vault[Math.min(cursor, total - 1)];

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
                isMatch
                  ? "border-gold bg-gold text-night shadow-[0_0_14px_rgba(253,224,71,0.9)]"
                  : !finished && i === cursor
                    ? "border-white bg-violet-600 text-white"
                    : finished && matches.length === 0
                      ? "border-rose-900 bg-rose-950/60 text-rose-400/70"
                      : i < cursor
                        ? "border-violet-800 bg-violet-950 text-violet-400"
                        : "border-violet-900 bg-night text-violet-700",
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
        {!finished ? (
          <span className="text-violet-200">
            Scanning {current?.id} · {current?.label}…
          </span>
        ) : matches.length > 0 ? (
          <span className="text-gold-soft">Match found: {matches.map((m) => m.label).join(" + ")}</span>
        ) : (
          <span className="text-rose-300">Resume power not found</span>
        )}
      </p>
    </div>
  );
}
