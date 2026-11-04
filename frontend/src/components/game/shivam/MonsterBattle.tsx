import { useEffect, useState, type ReactElement } from "react";
import { motion, useReducedMotion, type TargetAndTransition, type Transition } from "motion/react";
import { Check, RotateCcw, Swords, Zap } from "lucide-react";
import type { JourneyProgress } from "@/lib/gameEngine";
import { useGame } from "@/hooks/useGame";
import type { Arena, GameEngine, HeroMove, ResumePower } from "@/lib/types";
import { useGameData } from "@/hooks/useGameData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MonsterSilhouette, ShivamSprite, type MonsterKind } from "@/components/game/Sprites";
import { Sparkles } from "@/components/game/StageFx";
import { ArenaFallback, ArenaNav, BackButton, SpotlightPanel, spotlightState } from "@/components/game/ArenaParts";
import { SpotlightDialog } from "@/components/game/father/SpotlightDialog";

const CAST_MS = 900;
const TINT: Record<string, string> = { growth: "text-amber-400", insight: "text-cyan-400", ownership: "text-violet-400" };

type MonsterState = "idle" | "growing" | "defeated";

const MONSTER_MOTION: Record<MonsterState, TargetAndTransition> = {
  idle: { scale: 1, rotate: 0, opacity: 1, filter: "grayscale(0)" },
  growing: { scale: 1.25, rotate: -4, opacity: 1, filter: "grayscale(0)" },
  defeated: { scale: 0.78, rotate: 14, opacity: 0.35, filter: "grayscale(1)" },
};
const MONSTER_TRANSITION: Transition = { type: "spring", stiffness: 180, damping: 14 };
const CARD_FLY_INITIAL: TargetAndTransition = { left: "22%", top: "45%", rotate: 0, scale: 0.7, opacity: 1 };
const CARD_FLY_ANIMATE: TargetAndTransition = { left: "68%", top: "38%", rotate: 540, scale: 1.2, opacity: 0.9 };
const CARD_FLY_TRANSITION: Transition = { duration: CAST_MS / 1000 - 0.1, ease: "easeIn" };
const RESULT_INITIAL: TargetAndTransition = { opacity: 0, y: 14 };
const RESULT_ANIMATE: TargetAndTransition = { opacity: 1, y: 0 };

const moveKey = (arena: Arena, move: HeroMove) => `${arena.id}:${move.id}`;

/** Shivam's Journey: one monster battle per arena using the JSON hero_moves (outcomes predetermined). */
export function MonsterBattle(): ReactElement | null {
  const { state, progress, dispatch, sfx } = useGame();
  const { data: engine, isPending, isError } = useGameData();
  const back = () => {
    sfx("select");
    dispatch({ type: "LEAVE_ARENA" });
  };
  const arena = engine?.arenas.find((a) => a.id === state.activeArena);
  if (!progress) return null;
  if (!engine || !arena) return <ArenaFallback loading={isPending && !isError} onBack={back} />;
  return <MonsterArena key={arena.id} engine={engine} arena={arena} progress={progress} onBack={back} />;
}

interface MonsterArenaProps {
  engine: GameEngine;
  arena: Arena;
  progress: JourneyProgress;
  onBack: () => void;
}

function MonsterArena({ engine, arena, progress, onBack }: MonsterArenaProps): ReactElement {
  const { dispatch, sfx } = useGame();
  const reduceMotion = useReducedMotion() ?? false;
  const [picked, setPicked] = useState<HeroMove | null>(null);
  const [casting, setCasting] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const won = progress.resolvedKeys.includes(arena.id);
  const finaleReady = progress.spotlightsViewed.length >= 3;
  const powers = arena.spotlight_powers
    .map((id) => engine.resume_power_vault.find((p) => p.id === id))
    .filter((p): p is ResumePower => p !== undefined);

  useEffect(() => {
    if (!casting) return;
    const timer = window.setTimeout(() => setCasting(false), CAST_MS);
    return () => window.clearTimeout(timer);
  }, [casting]);

  const play = (move: HeroMove) => {
    setPicked(move);
    setCasting(!reduceMotion);
    if (move.correct) {
      dispatch({ type: "RESOLVE", key: arena.id });
      sfx("sparkle");
    } else {
      // Weak move: one heart once per distinct move (reducer dedupes) + a journal note; retry allowed.
      dispatch({ type: "LOSE_HEART", key: moveKey(arena, move), entry: { title: `${arena.monster} · ${move.title}`, note: move.learning } });
      sfx("heart");
    }
  };
  const openSpotlight = () => {
    sfx("sparkle");
    dispatch({ type: "VIEW_SPOTLIGHT", arenaId: arena.id, badge: arena.badge });
    setSpotlightOpen(true);
  };
  const openFinale = () => {
    sfx("confirm");
    dispatch({ type: "OPEN_FINALE" });
  };

  const showResult = picked && !casting;
  let monsterState: MonsterState = won ? "defeated" : "idle";
  if (showResult && !picked.correct) monsterState = "growing";

  return (
    <main className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-8" data-testid="monster-battle-screen" data-arena={arena.id}>
      <BackButton onClick={onBack} />
      <BattleHeader arena={arena} />
      <MonsterStage arena={arena} monsterState={monsterState} casting={casting} hp={won ? 0 : 100} lastMove={showResult ? picked : null} />
      {showResult && <MoveResult move={picked} powers={powers} onRetry={() => setPicked(null)} />}

      <section className="mt-8" aria-label="Strategy cards">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-hero">Choose Shivam's strategy card</p>
        <div className="mt-3 grid gap-5 md:grid-cols-3">
          {arena.hero_moves.map((move) => (
            <StrategyCard
              key={move.id}
              move={move}
              tried={progress.heartLossKeys.includes(moveKey(arena, move))}
              won={won}
              disabled={casting}
              onPlay={() => play(move)}
            />
          ))}
        </div>
      </section>

      <SpotlightPanel
        arena={arena}
        state={spotlightState(progress.badges.includes(arena.badge), won)}
        lockedHint="Play the strong strategy card to unlock the spotlight."
        footnote={won ? "Monster defeated · every card stays replayable." : "Weak cards cost a heart once each — then retry."}
        onOpen={openSpotlight}
      />
      <ArenaNav
        arenas={engine.arenas}
        current={arena}
        onEnter={(arenaId) => dispatch({ type: "ENTER_ARENA", arenaId })}
        onBack={onBack}
        onFinale={finaleReady ? openFinale : undefined}
      />
      <SpotlightDialog arena={arena} powers={powers} open={spotlightOpen} onOpenChange={setSpotlightOpen} onFinale={finaleReady ? openFinale : undefined} />
    </main>
  );
}

function BattleHeader({ arena }: { arena: Arena }): ReactElement {
  return (
    <section className="mt-4">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-hero">Shivam's Journey · Battle 0{arena.number}</p>
      <h2 className="mt-2 font-heading text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl" data-testid="monster-battle-title">
        {arena.title}
      </h2>
      <p className={cn("mt-1 font-heading text-lg font-bold", TINT[arena.id])}>{arena.monster}</p>
      <p className="mt-2 text-xs uppercase tracking-wide text-violet-300/80">{arena.theme}</p>
      <div className="mt-4 max-w-3xl rounded-sm border-l-4 border-hero bg-panel/70 px-4 py-3" data-testid="monster-battle-problem">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-hero">The business problem</p>
        <p className="mt-1 text-sm leading-relaxed text-white/90">{arena.hero_problem}</p>
      </div>
    </section>
  );
}

interface MonsterStageProps {
  arena: Arena;
  monsterState: MonsterState;
  casting: boolean;
  hp: number;
  lastMove: HeroMove | null;
}

function MonsterStage({ arena, monsterState, casting, hp, lastMove }: MonsterStageProps): ReactElement {
  return (
    <div className="relative mt-6 h-[clamp(240px,38vh,360px)] overflow-hidden rounded-sm border-2 border-violet-700/60" data-testid="monster-stage" data-monster={monsterState}>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_10%,rgba(56,189,248,0.3),transparent_60%),linear-gradient(to_bottom,#0E1A38,#0D0714)]" />
      <div aria-hidden className="stage-floor absolute inset-x-0 bottom-0 h-14" />
      {monsterState === "defeated" && <Sparkles count={12} />}

      <div className={cn("absolute bottom-4 left-[8%] h-[80%] w-[26%] max-w-[190px]", lastMove && !lastMove.correct && "animate-shake")}>
        <ShivamSprite className="h-full w-full" data-testid="monster-shivam-sprite" />
      </div>

      <div className="absolute bottom-8 right-[8%] w-[34%] max-w-[240px]">
        <div className="mb-2" data-testid="monster-hp">
          <div className="flex justify-between font-mono text-[10px] font-semibold uppercase tracking-widest text-white">
            <span>{arena.monster}</span>
            <span>{hp} HP</span>
          </div>
          <div className="mt-1 h-2 w-full bg-night/80">
            <div className="h-full bg-papa transition-[width] duration-700" style={{ width: `${hp}%` }} />
          </div>
        </div>
        <motion.div animate={MONSTER_MOTION[monsterState]} transition={MONSTER_TRANSITION}>
          <MonsterSilhouette kind={arena.id as MonsterKind} className={cn("aspect-square w-full animate-float-slow", TINT[arena.id])} />
        </motion.div>
      </div>

      {casting && (
        <motion.div
          aria-hidden
          initial={CARD_FLY_INITIAL}
          animate={CARD_FLY_ANIMATE}
          transition={CARD_FLY_TRANSITION}
          className="absolute h-14 w-10 rounded-sm border-2 border-[#7C2D12] bg-gold shadow-[0_0_24px_rgba(253,224,71,0.9)]"
          data-testid="monster-card-projectile"
        />
      )}
      {lastMove && (
        <span
          className={cn(
            "absolute left-1/2 top-[10%] -translate-x-1/2 -rotate-3 font-heading text-3xl font-black uppercase sm:text-5xl",
            lastMove.correct ? "text-glow-gold text-gold" : "text-glow-magenta text-magenta",
          )}
          data-testid="monster-stage-callout"
        >
          {lastMove.correct ? "Critical hit!" : "Setback!"}
        </span>
      )}
    </div>
  );
}

function MoveResult({ move, powers, onRetry }: { move: HeroMove; powers: ResumePower[]; onRetry: () => void }): ReactElement {
  const tone = move.correct ? "border-emerald-400 bg-[#0A2A1E]" : "border-rose-400 bg-[#2A0E1C]";
  return (
    <motion.section
      initial={RESULT_INITIAL}
      animate={RESULT_ANIMATE}
      className={cn("mt-6 space-y-3 rounded-sm border-[3px] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.55)]", tone)}
      data-testid="monster-move-result"
      data-correct={move.correct}
    >
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">
        {move.correct ? "Strong move" : "Weak move · −1 heart, once per card"}
      </p>
      <h3 className="font-heading text-2xl font-black uppercase leading-tight text-white">{move.title}</h3>
      <p className="text-base leading-relaxed text-white" data-testid="monster-move-reaction">
        {move.reaction}
      </p>
      <div className={cn("rounded-sm p-3", move.correct ? "bg-emerald-950/50" : "notebook-paper pl-12 text-slate-800")} data-testid="monster-move-learning">
        <p className={cn("font-mono text-[10px] font-semibold uppercase tracking-widest", move.correct ? "text-emerald-300" : "text-rose-600")}>
          {move.correct ? "Shivam's playbook" : "Shivam noted it down! · saved to the Learning Journal"}
        </p>
        <p className="mt-1 text-sm leading-relaxed">{move.learning}</p>
      </div>
      {move.correct ? (
        <div data-testid="monster-move-powers">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-gold">Resume powers behind this move</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {powers.map((p) => (
              <span key={p.id} className="rounded-sm border border-gold/50 bg-night/70 px-2 py-1 text-xs text-gold-soft">
                {p.label} · {p.source}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-emerald-100">Monster defeated! Open the Proof Spotlight below to earn the seal.</p>
        </div>
      ) : (
        <Button onClick={onRetry} className="h-10 rounded-sm font-heading font-bold uppercase" data-testid="monster-retry-button">
          <RotateCcw className="size-4" /> Try another card
        </Button>
      )}
    </motion.section>
  );
}

interface StrategyCardProps {
  move: HeroMove;
  tried: boolean;
  won: boolean;
  disabled: boolean;
  onPlay: () => void;
}

function StrategyCard({ move, tried, won, disabled, onPlay }: StrategyCardProps): ReactElement {
  const winning = won && move.correct;
  return (
    <article
      className={cn(
        "flex flex-col rounded-sm border-[3px] bg-[#0E1A38] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.55)] transition-[border-color,transform] duration-200 hover:-translate-y-1",
        winning ? "border-gold" : "border-hero/70",
      )}
      data-testid={`move-card-${move.id}`}
    >
      <div className="flex items-center justify-between">
        <Zap className="size-5 text-gold" />
        {winning && (
          <span className="inline-flex items-center gap-1 rounded-sm border border-gold bg-night px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-gold">
            <Check className="size-3" /> Winning move
          </span>
        )}
        {tried && (
          <span className="rounded-sm border border-rose-400 bg-rose-950 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-rose-300" data-testid={`move-card-${move.id}-setback`}>
            Setback · noted
          </span>
        )}
      </div>
      <h3 className="mt-3 font-heading text-xl font-black uppercase leading-tight tracking-tight text-white">{move.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-sky-100/90">{move.decision}</p>
      <Button
        onClick={onPlay}
        disabled={disabled}
        className="mt-5 h-11 w-full rounded-sm bg-hero font-heading font-bold uppercase text-night shadow-[4px_4px_0_#172554] hover:bg-sky-300"
        data-testid={`move-play-${move.id}`}
      >
        <Swords className="size-4" /> Play this card
      </Button>
    </article>
  );
}
