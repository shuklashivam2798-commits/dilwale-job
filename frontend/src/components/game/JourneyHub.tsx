import type { ReactElement } from "react";
import { motion, type TargetAndTransition, type Transition, type Variants } from "motion/react";
import { ArrowLeft, ArrowRight, Award, Lock, Repeat, RotateCcw, Sparkle } from "lucide-react";
import { useGame } from "@/hooks/useGame";
import { papaImpression, type AttackOutcome, type JourneyId, type JourneyProgress } from "@/lib/gameEngine";
import { JOURNEYS, OTHER_JOURNEY, OUTCOME_COPY, PAPA_STAGE_COPY } from "@/lib/script";
import type { Arena, FatherAttack, GameEngine } from "@/lib/types";
import { useGameData } from "@/hooks/useGameData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeartsMeter } from "@/components/game/HudBits";
import { MissGrowthSprite, MonsterSilhouette, PapaSprite, ShivamSprite, type MonsterKind } from "@/components/game/Sprites";
import { PapaMoodMeter } from "@/components/game/father/PapaMoodMeter";

const ARENA_TINT: Record<string, string> = {
  growth: "text-amber-400",
  insight: "text-cyan-400",
  ownership: "text-violet-400",
};
const ARENA_OFFSET = ["md:mt-0", "md:mt-14", "md:mt-6"];

const CHAPTER_NOTE: Record<JourneyId, string> = {
  father: "Pick any arena. Resolve at least one question attack, then open its Proof Spotlight to earn the seal. Progress is saved on this device.",
  shivam: "Pick any monster. Weak strategy cards cost a heart once each and let you retry; the strong card unlocks the Proof Spotlight and seal.",
};

// Static motion configs.
const ARENA_CARD: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: 0.1 + i * 0.1 } }),
};
const TEASER_INITIAL: TargetAndTransition = { opacity: 0, y: 20 };
const TEASER_ANIMATE: TargetAndTransition = { opacity: 1, y: 0 };
const TEASER_TRANSITION: Transition = { delay: 0.35 };

interface JourneyHubProps {
  onRestart: (scope: "journey") => void;
}

/** Arena map for the chosen journey: header, stats, arenas, finale teaser, switch/restart. */
export function JourneyHub({ onRestart }: JourneyHubProps): ReactElement | null {
  const { state, progress, dispatch, sfx } = useGame();
  const { data, isError, isPending } = useGameData();
  const journey = state.journey;
  if (!journey || !progress) return null;
  const engine = isError ? undefined : data;

  const goBack = () => {
    sfx("select");
    dispatch({ type: "GO_SELECT" });
  };
  const enterArena = (arenaId: string) => {
    sfx("confirm");
    dispatch({ type: "ENTER_ARENA", arenaId });
  };
  const openFinale = () => {
    sfx("confirm");
    dispatch({ type: "OPEN_FINALE" });
  };

  return (
    <main className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-8" data-testid="journey-hub-screen" data-journey={journey}>
      <Button
        variant="ghost"
        onClick={goBack}
        className="-ml-2 h-9 rounded-sm font-mono text-[11px] font-semibold uppercase tracking-widest text-violet-200 hover:bg-violet-900/50 hover:text-white"
        data-testid="journey-hub-back-button"
      >
        <ArrowLeft className="size-4" /> All paths
      </Button>
      <HubHeader journey={journey} progress={progress} />
      <StatsRow journey={journey} progress={progress} engine={engine} />
      {journey === "father" && <PapaMoodMeter outcomes={progress.attackOutcomes} className="mt-4 max-w-xl" />}
      <div className="mt-8 flex items-center gap-3 rounded-sm border border-gold/40 bg-gold/10 px-4 py-3" data-testid="journey-hub-chapter-note">
        <Award className="size-4 shrink-0 text-gold" />
        <p className="text-sm text-gold-soft">{CHAPTER_NOTE[journey]}</p>
      </div>
      <ArenaMap engine={engine} loading={isPending && !engine} journey={journey} progress={progress} onEnter={enterArena} />
      <FinaleTeaser spotlights={progress.spotlightsViewed.length} shortlisted={progress.finaleChoice !== null} onOpen={openFinale} />
      <HubActions journey={journey} onRestart={() => onRestart("journey")} />
    </main>
  );
}

function HubHeader({ journey, progress }: { journey: JourneyId; progress: JourneyProgress }): ReactElement {
  const copy = JOURNEYS[journey];
  const papaMood = PAPA_STAGE_COPY[papaImpression(progress.attackOutcomes).stage].mood;
  return (
    <section className="mt-4 grid gap-6 md:grid-cols-[auto_1fr] md:items-end">
      <div className="h-40 w-28 sm:h-48 sm:w-32">
        {journey === "father" ? <PapaSprite mood={papaMood} className="h-full w-full" /> : <ShivamSprite className="h-full w-full" />}
      </div>
      <div>
        <p className={cn("font-mono text-xs font-semibold uppercase tracking-[0.3em]", journey === "father" ? "text-papa" : "text-hero")}>
          {copy.badge} · Playing as {copy.playAs}
        </p>
        <h2 className="mt-2 font-heading text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl" data-testid="journey-hub-title">
          {copy.title}
        </h2>
        <p className="mt-2 font-heading text-lg font-bold text-gold-soft">{copy.mechanic}</p>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-violet-200" data-testid="journey-hub-rule">
          {copy.pitch}
        </p>
      </div>
    </section>
  );
}

function StatsRow({ journey, progress, engine }: { journey: JourneyId; progress: JourneyProgress; engine?: GameEngine }): ReactElement {
  const totalAttacks = engine?.game_rules.attack_count ?? 9;
  const resolvedStat =
    journey === "father"
      ? { id: "attacks", label: "Attacks resolved", value: `${progress.resolvedKeys.length}/${totalAttacks}` }
      : { id: "battles", label: "Battles won", value: `${progress.resolvedKeys.length}/3` };
  const stats = [
    { id: "hearts", label: "Hearts", value: <HeartsMeter hearts={progress.hearts} /> },
    { id: "seals", label: "Proof seals", value: `${progress.badges.length}/3` },
    resolvedStat,
    { id: "journal", label: "Journal notes", value: String(progress.journal.length) },
  ];
  return (
    <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.id} className="rounded-sm border border-violet-500/30 bg-panel/80 px-4 py-3" data-testid={`journey-stat-${s.id}`}>
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-widest text-violet-300">{s.label}</dt>
          <dd className="mt-1 font-heading text-2xl font-black text-white">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

interface ArenaMapProps {
  engine?: GameEngine;
  loading: boolean;
  journey: JourneyId;
  progress: JourneyProgress;
  onEnter?: (arenaId: string) => void;
}

function ArenaMap({ engine, loading, journey, progress, onEnter }: ArenaMapProps): ReactElement {
  return (
    <section className="relative mt-8" aria-label="Arena map">
      <div aria-hidden className="absolute left-[10%] right-[10%] top-1/2 hidden border-t-2 border-dashed border-violet-500/40 md:block" />
      <div className="relative grid gap-5 md:grid-cols-3">
        <ArenaMapContent engine={engine} loading={loading} journey={journey} progress={progress} onEnter={onEnter} />
      </div>
    </section>
  );
}

function ArenaMapContent({ engine, loading, journey, progress, onEnter }: ArenaMapProps): ReactElement {
  if (loading) {
    return (
      <>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-80 animate-pulse rounded-sm bg-panel" data-testid="arena-card-skeleton" />
        ))}
      </>
    );
  }
  if (!engine) {
    return (
      <p className="rounded-sm border border-violet-500/30 bg-panel p-6 text-sm text-violet-200 md:col-span-3" data-testid="arena-data-unavailable">
        Arena intel is backstage right now. The gates will still open in the next chapter.
      </p>
    );
  }
  return (
    <>
      {engine.arenas.map((arena, i) => (
        <ArenaCard
          key={arena.id}
          arena={arena}
          index={i}
          journey={journey}
          attacks={engine.father_attacks.filter((a) => a.arena === arena.id)}
          earned={progress.badges.includes(arena.badge)}
          won={progress.resolvedKeys.includes(arena.id)}
          outcomes={progress.attackOutcomes}
          onEnter={onEnter ? () => onEnter(arena.id) : undefined}
        />
      ))}
    </>
  );
}

interface ArenaCardProps {
  arena: Arena;
  index: number;
  journey: JourneyId;
  attacks: FatherAttack[];
  earned: boolean;
  /** Shivam's Journey: monster defeated. */
  won: boolean;
  outcomes: Record<string, AttackOutcome>;
  /** Present when the arena is playable on this journey. */
  onEnter?: () => void;
}

function ArenaCard({ arena, index, journey, attacks, earned, won, outcomes, onEnter }: ArenaCardProps): ReactElement {
  const tint = ARENA_TINT[arena.id] ?? "text-violet-400";
  return (
    <motion.article
      variants={ARENA_CARD}
      custom={index}
      initial="hidden"
      animate="shown"
      className={cn(
        "relative flex flex-col rounded-sm border-2 border-[#4B5563] bg-[#150F28] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.5)] transition-[border-color] duration-200 hover:border-gold/70",
        ARENA_OFFSET[index],
      )}
      data-testid={`arena-card-${arena.id}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-violet-300">Arena 0{arena.number}</span>
        <ArenaStatusChip arenaId={arena.id} playable={Boolean(onEnter)} label={arenaStatusLabel(journey, earned, won, attacks.filter((a) => outcomes[a.id]).length, attacks.length)} />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <MonsterSilhouette kind={arena.id as MonsterKind} className={cn("size-16 shrink-0 opacity-70 animate-float-slow", tint)} />
        <div>
          <h3 className="font-heading text-xl font-black uppercase leading-tight tracking-tight text-white">{arena.title}</h3>
          <p className={cn("font-heading text-sm font-bold", tint)}>{arena.monster}</p>
        </div>
      </div>
      <p className="mt-3 text-xs uppercase tracking-wide text-violet-300/80">{arena.theme}</p>
      {journey === "father" ? <FatherAttackList attacks={attacks} outcomes={outcomes} /> : <HeroProblem problem={arena.hero_problem} />}
      <div className="mt-auto flex items-center gap-2 pt-5" data-testid={`arena-card-${arena.id}-seal`}>
        {earned ? <Award className="size-4 text-gold" /> : <Sparkle className="size-4 text-violet-500" />}
        <span className={cn("font-mono text-[11px] font-semibold uppercase tracking-widest", earned ? "text-gold" : "text-violet-400")}>
          {arena.badge} · {earned ? "Earned" : "Locked"}
        </span>
      </div>
      {onEnter && (
        <Button
          onClick={onEnter}
          className="mt-4 h-11 w-full rounded-sm bg-papa font-heading font-bold uppercase text-white shadow-[4px_4px_0_#4C0519] hover:bg-rose-400"
          data-testid={`arena-enter-${arena.id}`}
        >
          {earned ? "Revisit Arena" : "Enter Arena"} <ArrowRight className="size-4" />
        </Button>
      )}
    </motion.article>
  );
}

interface ArenaStatusChipProps {
  arenaId: string;
  playable: boolean;
  label: string;
}

function arenaStatusLabel(journey: JourneyId, earned: boolean, won: boolean, answered: number, total: number): string {
  if (earned) return "Cleared";
  if (journey === "shivam") return won ? "Monster defeated" : "Open";
  if (answered) return `${answered}/${total} answered`;
  return "Open";
}

function ArenaStatusChip({ arenaId, playable, label }: ArenaStatusChipProps): ReactElement {
  if (!playable) {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-night px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-gold" data-testid={`arena-card-${arenaId}-lock`}>
        <Lock className="size-3" /> Next chapter
      </span>
    );
  }
  return (
    <span className="rounded-sm bg-night px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-gold" data-testid={`arena-card-${arenaId}-status`}>
      {label}
    </span>
  );
}

function FatherAttackList({ attacks, outcomes }: { attacks: FatherAttack[]; outcomes: Record<string, AttackOutcome> }): ReactElement {
  return (
    <ul className="mt-4 space-y-2" aria-label="Question attacks in this arena">
      {attacks.map((a) => {
        const outcome = outcomes[a.id];
        return (
          <li key={a.id} className="flex items-center gap-2 rounded-sm bg-night/60 px-2.5 py-2 text-sm text-white/85" data-testid={`arena-attack-${a.id}`}>
            <span className="font-mono text-[10px] font-semibold text-papa">{a.id}</span>
            <span className="flex-1 leading-snug">{a.name}</span>
            {outcome ? (
              <span className={cn("rounded-sm border px-1.5 font-mono text-[9px] font-semibold uppercase tracking-wider", OUTCOME_COPY[outcome].tone)}>
                {OUTCOME_COPY[outcome].label}
              </span>
            ) : (
              <span className="font-mono text-[9px] uppercase tracking-wider text-violet-400">{a.difficulty}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function HeroProblem({ problem }: { problem: string }): ReactElement {
  return (
    <div className="mt-4 rounded-sm bg-night/60 p-3">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-hero">The problem</p>
      <p className="mt-1 text-sm leading-relaxed text-white/85">{problem}</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-violet-400">3 strategy cards · 1 strong move</p>
    </div>
  );
}

function FinaleTeaser({ spotlights, shortlisted, onOpen }: { spotlights: number; shortlisted: boolean; onOpen: () => void }): ReactElement {
  const unlocked = spotlights >= 3;
  return (
    <motion.section
      initial={TEASER_INITIAL}
      animate={TEASER_ANIMATE}
      transition={TEASER_TRANSITION}
      className="relative mt-10 grid items-center gap-5 overflow-hidden rounded-sm border-2 border-gold/50 bg-[linear-gradient(110deg,#2A0F3D,#1A102F_60%,#3B1530)] p-5 sm:grid-cols-[auto_1fr_auto] sm:p-6"
      data-testid="finale-teaser-card"
    >
      <div className={cn("h-32 w-24", !unlocked && "opacity-70 grayscale-[0.4]")}>
        <MissGrowthSprite className="h-full w-full" />
      </div>
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-gold">Grand Finale</p>
        <h3 className="mt-1 font-heading text-2xl font-black uppercase tracking-tight text-white">Miss Growth's surprise challenge</h3>
        <p className="mt-2 text-sm text-violet-200" data-testid="finale-teaser-text">
          {unlocked
            ? shortlisted
              ? "Rishta shortlisted! Replay the finale or try a different first audience anytime."
              : "All three proof seals earned! Miss Growth is ready with her surprise challenge."
            : "Unlocks after all three proof spotlights. Papa may test the past — but the final decision is hers."}
        </p>
      </div>
      <div className="flex flex-col items-start gap-3 sm:items-end">
        <span className="flex items-center gap-2 font-mono text-sm font-semibold text-gold-soft" data-testid="finale-teaser-seals">
          <Award className="size-5" /> {spotlights}/3
        </span>
        {unlocked && (
          <Button onClick={onOpen} className="h-11 rounded-sm bg-magenta px-5 font-heading font-bold uppercase text-white shadow-[4px_4px_0_#4C0519] hover:bg-pink-400" data-testid="finale-open-button">
            Meet Miss Growth <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </motion.section>
  );
}

function HubActions({ journey, onRestart }: { journey: JourneyId; onRestart: () => void }): ReactElement {
  const { dispatch, sfx } = useGame();
  const other = OTHER_JOURNEY[journey];
  return (
    <div className="mt-10 flex flex-wrap gap-3">
      <Button
        onClick={() => {
          sfx("confirm");
          dispatch({ type: "SELECT_JOURNEY", journey: other });
        }}
        className="h-11 rounded-sm px-5 font-heading font-bold uppercase shadow-[4px_4px_0_#7C2D12]"
        data-testid="journey-hub-switch-button"
      >
        <Repeat className="size-4" /> Switch to {JOURNEYS[other].title}
      </Button>
      <Button
        variant="outline"
        onClick={onRestart}
        className="h-11 rounded-sm border-violet-400/50 bg-transparent px-5 font-heading font-bold uppercase text-violet-100 hover:bg-violet-900/50"
        data-testid="journey-hub-restart-button"
      >
        <RotateCcw className="size-4" /> Restart this journey
      </Button>
    </div>
  );
}
