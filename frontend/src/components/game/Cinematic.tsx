import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronRight, RotateCcw, SkipForward } from "lucide-react";
import { useGame } from "@/lib/game-store";
import { CINEMATIC, type SceneId } from "@/lib/script";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MuteToggle } from "@/components/game/HudBits";
import { MissGrowthSprite, PapaSprite, ShivamSprite } from "@/components/game/Sprites";
import { FlyingResumes, Sparkles } from "@/components/game/StageFx";
import { Typewriter } from "@/components/game/Typewriter";

const AUTO_ADVANCE_MS = 2300;
const FREEZE_HOLD_MS = 2800;

const TONE_STYLES = {
  papa: "bg-papa text-white",
  hero: "bg-hero text-night",
  narrator: "bg-gold-soft text-night",
} as const;

export function Cinematic() {
  const { dispatch, sfx } = useGame();
  const reduceMotion = useReducedMotion() ?? false;
  const [beat, setBeat] = useState(0);
  const [typed, setTyped] = useState(false);
  const [forced, setForced] = useState(false);
  const [freeze, setFreeze] = useState(false);
  const [run, setRun] = useState(0);
  const current = CINEMATIC[beat];
  const isLast = beat === CINEMATIC.length - 1;

  const finish = useCallback(() => {
    sfx("confirm");
    dispatch({ type: "FINISH_INTRO" });
  }, [dispatch, sfx]);

  const advance = useCallback(() => {
    if (freeze) return finish();
    if (!typed) return setForced(true);
    sfx("select");
    if (!isLast) {
      setBeat((b) => b + 1);
      setTyped(false);
      setForced(false);
    } else {
      setFreeze(true);
    }
  }, [freeze, typed, isLast, finish, sfx]);

  const replay = () => {
    sfx("select");
    setBeat(0);
    setTyped(false);
    setForced(false);
    setFreeze(false);
    setRun((r) => r + 1);
  };

  // Auto-advance after each line finishes typing; the freeze frame then rolls into path select.
  useEffect(() => {
    if (!typed || freeze) return;
    const t = window.setTimeout(advance, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(t);
  }, [typed, freeze, advance]);

  useEffect(() => {
    if (!freeze) return;
    const t = window.setTimeout(finish, FREEZE_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [freeze, finish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLButtonElement) return; // the focused button handles its own Enter/Space
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        advance();
      } else if (e.key === "Escape") {
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, finish]);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-night" data-testid="cinematic-screen">
      {/* top controls */}
      <div className="relative z-30 flex items-center gap-3 px-4 pt-4 sm:px-8 sm:pt-6">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-magenta">Opening Cinematic</span>
        <div className="flex flex-1 gap-1.5" aria-label={`Scene ${beat + 1} of ${CINEMATIC.length}`} data-testid="cinematic-progress">
          {CINEMATIC.map((b, i) => (
            <span
              key={b.id}
              className={cn(
                "h-1.5 max-w-16 flex-1 rounded-none transition-colors duration-300",
                i < beat || freeze ? "bg-gold" : i === beat ? "bg-gold-soft" : "bg-violet-900",
              )}
            />
          ))}
        </div>
        <MuteToggle />
        <Button
          variant="outline"
          onClick={finish}
          className="h-9 rounded-sm border-gold/60 bg-night/60 font-mono text-[11px] font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-night"
          data-testid="cinematic-skip-button"
        >
          Skip Intro <SkipForward className="size-3.5" />
        </Button>
      </div>

      {/* stage */}
      <div
        className={cn(
          "relative mx-4 mt-4 flex-1 overflow-hidden rounded-sm border-2 border-violet-700/60 transition-[filter] duration-700 sm:mx-8",
          freeze && "grayscale-[0.55] sepia-[0.35]",
        )}
        data-testid="cinematic-stage"
        data-scene={current.id}
      >
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.45),transparent_60%),linear-gradient(to_bottom,#1B0B33,#0D0714)]" />
        <div aria-hidden className="scanlines absolute inset-0" />
        <div aria-hidden className="stage-floor absolute inset-x-0 bottom-0 h-16" />
        <AnimatePresence mode="sync">
          <motion.div
            key={`${run}-${current.id}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.45 }}
          >
            <Scene id={current.id} reduceMotion={reduceMotion} />
          </motion.div>
        </AnimatePresence>

        {freeze && (
          <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-night/30"
            data-testid="cinematic-freeze-frame"
          >
            <span className="-rotate-6 border-4 border-gold bg-night px-5 py-2 font-heading text-3xl font-black uppercase tracking-tight text-gold shadow-[6px_6px_0_#7C2D12] sm:text-5xl">
              Freeze Frame!
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-white">Battle arena loading…</span>
            <Button
              onClick={finish}
              className="mt-2 h-11 rounded-sm px-5 font-heading font-bold uppercase shadow-[4px_4px_0_#7C2D12]"
              data-testid="cinematic-enter-arena-button"
            >
              Enter the Arena <ChevronRight className="size-4" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* dialogue box */}
      <section
        className="relative z-30 mx-4 mb-4 mt-4 sm:mx-8 sm:mb-6"
        aria-live="polite"
        data-testid="cinematic-dialogue-box"
      >
        <div className="pixel-frame rounded-sm bg-dialog px-5 pb-4 pt-6 sm:px-7">
          <span
            className={cn(
              "absolute -top-3 left-6 rounded-sm px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest shadow-[3px_3px_0_#0D0714]",
              TONE_STYLES[current.speakerTone],
            )}
            data-testid="cinematic-speaker-name"
          >
            {current.speaker}
          </span>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-h-[5.5rem] flex-1">
              <p className="font-heading text-lg font-bold leading-snug text-white sm:text-2xl">
                <Typewriter
                  key={`${run}-${beat}`}
                  text={current.line}
                  complete={forced || reduceMotion}
                  onDone={() => setTyped(true)}
                  data-testid="cinematic-dialogue-line"
                />
              </p>
              <p
                className={cn(
                  "mt-2 text-sm italic text-violet-300 transition-opacity duration-300",
                  typed ? "opacity-100" : "opacity-0",
                )}
                data-testid="cinematic-dialogue-subtitle"
              >
                {current.subtitle}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                onClick={replay}
                className="h-10 rounded-sm font-mono text-[11px] font-semibold uppercase tracking-widest text-violet-200 hover:bg-violet-900/60 hover:text-white"
                data-testid="cinematic-replay-button"
              >
                <RotateCcw className="size-3.5" /> Replay
              </Button>
              <Button
                onClick={advance}
                className="h-10 rounded-sm px-4 font-heading font-bold uppercase shadow-[3px_3px_0_#7C2D12] transition-transform duration-150 active:translate-y-px"
                data-testid="cinematic-next-button"
              >
                {freeze ? "Choose Path" : !typed ? "Show Line" : isLast ? "Freeze!" : "Next"}
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          <p className="mt-3 hidden font-mono text-[10px] uppercase tracking-widest text-violet-400 sm:block">
            Space / Enter — continue · Esc — skip
          </p>
        </div>
      </section>
    </main>
  );
}

const spriteBox = "absolute bottom-6";

function Scene({ id, reduceMotion }: { id: SceneId; reduceMotion: boolean }) {
  const slide = (from: number) =>
    reduceMotion ? {} : { initial: { x: from, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 0.8, ease: "easeOut" as const } };

  switch (id) {
    case "papa-resumes":
      return (
        <>
          <FlyingResumes count={18} />
          <span className="absolute left-5 top-5 -rotate-3 border-2 border-papa bg-night/80 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-papa sm:text-sm">
            2,000 applications
          </span>
          <motion.div {...slide(0)} className={`${spriteBox} left-1/2 h-[72%] w-[38%] max-w-[280px] -translate-x-1/2`}>
            <PapaSprite className="h-full w-full" data-testid="scene-sprite-papa" />
          </motion.div>
        </>
      );
    case "hero-cross":
      return (
        <>
          <FlyingResumes count={12} reverse />
          <Sparkles count={10} />
          <motion.div {...slide(-160)} className={`${spriteBox} left-[6%] h-[66%] w-[32%] max-w-[230px]`}>
            <ShivamSprite className="h-full w-full" data-testid="scene-sprite-shivam" />
          </motion.div>
          <div aria-hidden className="absolute bottom-16 left-[34%] right-[34%] border-t-2 border-dashed border-gold/60" />
          <div className={`${spriteBox} right-[6%] h-[72%] w-[34%] max-w-[250px]`}>
            <MissGrowthSprite className="h-full w-full" data-testid="scene-sprite-miss-growth" />
          </div>
        </>
      );
    case "thehro":
      return (
        <>
          <div aria-hidden className="absolute inset-0 z-10 animate-strobe bg-white" />
          <span
            aria-hidden
            className="text-glow-magenta absolute left-1/2 top-[12%] -translate-x-1/2 -rotate-6 font-heading text-6xl font-black uppercase tracking-tighter text-magenta sm:text-8xl"
          >
            Thehro!
          </span>
          <div className={`${spriteBox} left-[8%] h-[52%] w-[26%] max-w-[180px] opacity-80`}>
            <ShivamSprite className="h-full w-full" animated={false} />
          </div>
          <div className={`${spriteBox} right-[10%] h-[76%] w-[38%] max-w-[290px] animate-shake`}>
            <PapaSprite className="h-full w-full" data-testid="scene-sprite-papa" />
          </div>
        </>
      );
    case "demo":
      return (
        <>
          <Sparkles count={16} />
          <div className={`${spriteBox} left-[4%] h-[50%] w-[24%] max-w-[170px]`}>
            <PapaSprite className="h-full w-full" animated={false} />
            <span className="absolute -top-6 right-0 rounded-full border-2 border-white bg-night px-2.5 font-heading text-lg font-black text-white">
              ?
            </span>
          </div>
          <motion.div
            {...(reduceMotion ? {} : { initial: { scale: 0.9 }, animate: { scale: 1 }, transition: { duration: 0.5 } })}
            className={`${spriteBox} left-1/2 h-[74%] w-[36%] max-w-[270px] -translate-x-1/2`}
          >
            <ShivamSprite className="h-full w-full" data-testid="scene-sprite-shivam" />
          </motion.div>
          <div className={`${spriteBox} right-[4%] h-[62%] w-[28%] max-w-[200px]`}>
            <MissGrowthSprite className="h-full w-full" />
          </div>
        </>
      );
  }
}
