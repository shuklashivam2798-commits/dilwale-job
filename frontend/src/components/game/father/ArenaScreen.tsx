import { useState, type ReactElement } from "react";
import { motion, type TargetAndTransition, type Variants } from "motion/react";
import { Flame, Swords } from "lucide-react";
import type { AttackOutcome } from "@/lib/gameEngine";
import { useGame } from "@/hooks/useGame";
import { OUTCOME_COPY, SPOTLIGHT_COPY } from "@/lib/script";
import type { Arena, FatherAttack, GameEngine, ResumePower } from "@/lib/types";
import { useGameData } from "@/hooks/useGameData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MonsterSilhouette, type MonsterKind } from "@/components/game/Sprites";
import { ArenaFallback, ArenaNav, BackButton, SpotlightPanel, spotlightState } from "@/components/game/ArenaParts";
import { AttackBattle } from "@/components/game/father/AttackBattle";
import { PapaMoodMeter } from "@/components/game/father/PapaMoodMeter";
import { SpotlightDialog } from "@/components/game/father/SpotlightDialog";

const TINT: Record<string, string> = { growth: "text-amber-400", insight: "text-cyan-400", ownership: "text-violet-400" };

const ATTACK_CARD: Variants = {
  hidden: { opacity: 0, y: 24 },
  shown: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.05 + i * 0.08 } }),
};
const CARD_HOVER: TargetAndTransition = { y: -4 };

/** Father's Journey arena: three selectable question attacks + the arena's proof spotlight/seal. */
export function ArenaScreen(): ReactElement | null {
  const { state, progress, dispatch, sfx } = useGame();
  const { data: engine, isPending, isError } = useGameData();
  const back = () => {
    sfx("select");
    dispatch({ type: "LEAVE_ARENA" });
  };

  const arena = engine?.arenas.find((a) => a.id === state.activeArena);
  if (!progress) return null;
  if (!engine || !arena) return <ArenaFallback loading={isPending && !isError} onBack={back} />;
  return <ArenaContent engine={engine} arena={arena} outcomes={progress.attackOutcomes} badges={progress.badges} onBack={back} />;
}

interface ArenaContentProps {
  engine: GameEngine;
  arena: Arena;
  outcomes: Record<string, AttackOutcome>;
  badges: string[];
  onBack: () => void;
}

function ArenaContent({ engine, arena, outcomes, badges, onBack }: ArenaContentProps): ReactElement {
  const { progress, dispatch, sfx } = useGame();
  const finaleReady = (progress?.spotlightsViewed.length ?? 0) >= 3;
  const openFinale = () => {
    sfx("confirm");
    dispatch({ type: "OPEN_FINALE" });
  };
  const [battle, setBattle] = useState<FatherAttack | null>(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  const attacks = engine.father_attacks.filter((a) => a.arena === arena.id);
  const resolvedCount = attacks.filter((a) => outcomes[a.id]).length;
  const spotlightPowers = arena.spotlight_powers
    .map((id) => engine.resume_power_vault.find((p) => p.id === id))
    .filter((p): p is ResumePower => p !== undefined);

  const openSpotlight = () => {
    sfx("sparkle");
    dispatch({ type: "VIEW_SPOTLIGHT", arenaId: arena.id, badge: arena.badge });
    setSpotlightOpen(true);
  };
  const launch = (attack: FatherAttack) => {
    sfx("thud");
    setBattle(attack);
  };
  const closeBattle = () => {
    sfx("select");
    setBattle(null);
  };

  return (
    <main className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-8" data-testid="arena-screen" data-arena={arena.id}>
      <BackButton onClick={onBack} />
      <ArenaHeader arena={arena} outcomes={outcomes} />
      <section className="mt-8 grid gap-5 md:grid-cols-3" aria-label="Question attacks">
        {attacks.map((attack, i) => (
          <AttackCard key={attack.id} attack={attack} index={i} outcome={outcomes[attack.id]} onLaunch={() => launch(attack)} />
        ))}
      </section>
      <SpotlightPanel
        arena={arena}
        state={spotlightState(badges.includes(arena.badge), resolvedCount > 0)}
        copy={SPOTLIGHT_COPY.father}
        footnote={`${resolvedCount}/${attacks.length} attacks answered here · every attack stays replayable.`}
        onOpen={openSpotlight}
      />
      <ArenaNav arenas={engine.arenas} current={arena} onEnter={(arenaId) => dispatch({ type: "ENTER_ARENA", arenaId })} onBack={onBack} onFinale={finaleReady ? openFinale : undefined} />

      {battle && <AttackBattle key={battle.id} attack={battle} arena={arena} vault={engine.resume_power_vault} onClose={closeBattle} />}
      <SpotlightDialog
        arena={arena}
        powers={spotlightPowers}
        copy={SPOTLIGHT_COPY.father}
        open={spotlightOpen}
        onOpenChange={setSpotlightOpen}
        onFinale={finaleReady ? openFinale : undefined}
      />
    </main>
  );
}

function ArenaHeader({ arena, outcomes }: { arena: Arena; outcomes: Record<string, AttackOutcome> }): ReactElement {
  return (
    <section className="mt-4 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-papa">Father's Journey · Arena 0{arena.number}</p>
        <div className="mt-2 flex items-center gap-4">
          <MonsterSilhouette kind={arena.id as MonsterKind} className={cn("size-16 shrink-0 animate-float-slow sm:size-20", TINT[arena.id])} />
          <div>
            <h2 className="font-heading text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl" data-testid="arena-title">
              {arena.title}
            </h2>
            <p className={cn("mt-1 font-heading text-lg font-bold", TINT[arena.id])}>{arena.monster}</p>
          </div>
        </div>
        <p className="mt-3 text-xs uppercase tracking-wide text-violet-300/80">{arena.theme}</p>
        <div className="mt-4 max-w-2xl rounded-sm border-l-4 border-gold bg-panel/70 px-4 py-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-gold">The situation</p>
          <p className="mt-1 text-sm leading-relaxed text-white/90">{arena.hero_problem}</p>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-violet-200">
          Pick a question attack. Papa fires it, Shivam scans his Resume Power Vault — and defends only with what his CV can prove.
        </p>
      </div>
      <PapaMoodMeter outcomes={outcomes} />
    </section>
  );
}

interface AttackCardProps {
  attack: FatherAttack;
  index: number;
  outcome?: AttackOutcome;
  onLaunch: () => void;
}

function AttackCard({ attack, index, outcome, onLaunch }: AttackCardProps): ReactElement {
  const flames = attack.difficulty === "Very Hard" ? 3 : 2;
  return (
    <motion.article
      variants={ATTACK_CARD}
      custom={index}
      initial="hidden"
      animate="shown"
      whileHover={CARD_HOVER}
      className={cn("flex flex-col rounded-sm border-[3px] bg-[#220D1A] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.55)]", outcome ? "border-papa/50" : "border-papa")}
      data-testid={`attack-card-${attack.id}`}
      data-outcome={outcome ?? "unanswered"}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-sm bg-papa px-2 py-0.5 font-mono text-[11px] font-semibold text-white">{attack.id}</span>
        <span className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-rose-300" aria-label={`Difficulty: ${attack.difficulty}`}>
          {Array.from({ length: flames }, (_, i) => (
            <Flame key={i} className="size-3.5 fill-papa text-papa" />
          ))}
          {attack.difficulty}
        </span>
      </div>
      <h3 className="mt-3 font-heading text-xl font-black uppercase leading-tight tracking-tight text-white">{attack.name}</h3>
      <p className="mt-2 line-clamp-4 text-sm italic leading-relaxed text-rose-100/90">“{attack.question}”</p>
      <div className="mt-auto pt-5">
        <div className="mb-3 min-h-6">
          {outcome ? (
            <span className={cn("rounded-sm border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest", OUTCOME_COPY[outcome].tone)} data-testid={`attack-card-${attack.id}-outcome`}>
              {OUTCOME_COPY[outcome].label}
            </span>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-widest text-violet-400">Not yet fired</span>
          )}
        </div>
        <Button
          onClick={onLaunch}
          className="h-11 w-full rounded-sm bg-papa font-heading font-bold uppercase text-white shadow-[4px_4px_0_#4C0519] transition-[transform,background-color] duration-150 hover:-translate-y-0.5 hover:bg-rose-400 active:translate-y-0.5"
          data-testid={`attack-launch-${attack.id}`}
        >
          <Swords className="size-4" /> {outcome ? "Replay Attack" : "Launch Attack"}
        </Button>
      </div>
    </motion.article>
  );
}
