import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Award, Flame, Lock, Sparkles as SparklesIcon, Swords } from "lucide-react";
import { useGame } from "@/lib/game-store";
import { OUTCOME_COPY } from "@/lib/script";
import type { Arena, FatherAttack } from "@/lib/types";
import { useGameData } from "@/hooks/useGameData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MonsterSilhouette, type MonsterKind } from "@/components/game/Sprites";
import { AttackBattle } from "@/components/game/father/AttackBattle";
import { PapaMoodMeter } from "@/components/game/father/PapaMoodMeter";
import { SpotlightDialog } from "@/components/game/father/SpotlightDialog";

const TINT: Record<string, string> = { growth: "text-amber-400", insight: "text-cyan-400", ownership: "text-violet-400" };

/** Father's Journey arena: three selectable question attacks + the arena's proof spotlight/seal. */
export function ArenaScreen() {
  const { state, progress, dispatch, sfx } = useGame();
  const { data: engine, isPending, isError } = useGameData();
  const [battle, setBattle] = useState<FatherAttack | null>(null);
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  const back = () => {
    sfx("select");
    dispatch({ type: "LEAVE_ARENA" });
  };

  const arena = engine?.arenas.find((a) => a.id === state.activeArena);
  if (!progress) return null;
  if (!engine || !arena) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8" data-testid="arena-screen">
        <BackButton onClick={back} />
        {isPending && !isError ? (
          <div className="mt-6 h-64 animate-pulse rounded-sm bg-panel" />
        ) : (
          <p className="mt-6 rounded-sm border border-violet-500/30 bg-panel p-6 text-sm text-violet-200" data-testid="arena-unavailable">
            This arena is backstage right now. Head back to the arena map and try again.
          </p>
        )}
      </main>
    );
  }

  const attacks = engine.father_attacks.filter((a) => a.arena === arena.id);
  const resolvedHere = attacks.filter((a) => progress.attackOutcomes[a.id]);
  const spotlightUnlocked = resolvedHere.length > 0;
  const sealEarned = progress.badges.includes(arena.badge);
  const index = engine.arenas.indexOf(arena);
  const prev = engine.arenas[index - 1];
  const next = engine.arenas[index + 1];
  const spotlightPowers = arena.spotlight_powers
    .map((id) => engine.resume_power_vault.find((p) => p.id === id))
    .filter((p) => p !== undefined);

  const openSpotlight = () => {
    sfx("sparkle");
    dispatch({ type: "VIEW_SPOTLIGHT", arenaId: arena.id, badge: arena.badge });
    setSpotlightOpen(true);
  };

  return (
    <main className="relative mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-8" data-testid="arena-screen" data-arena={arena.id}>
      <BackButton onClick={back} />

      {/* header */}
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
        <PapaMoodMeter outcomes={progress.attackOutcomes} />
      </section>

      {/* attack cards */}
      <section className="mt-8 grid gap-5 md:grid-cols-3" aria-label="Question attacks">
        {attacks.map((attack, i) => (
          <AttackCard
            key={attack.id}
            attack={attack}
            index={i}
            outcome={progress.attackOutcomes[attack.id]}
            onLaunch={() => {
              sfx("thud");
              setBattle(attack);
            }}
          />
        ))}
      </section>

      {/* spotlight + seal */}
      <section
        className={cn(
          "mt-8 grid items-center gap-4 rounded-sm border-2 p-5 sm:grid-cols-[1fr_auto]",
          sealEarned ? "border-gold bg-gold/10" : spotlightUnlocked ? "border-gold/70 bg-panel" : "border-violet-700/50 bg-panel/60",
        )}
        data-testid="arena-spotlight-panel"
        data-state={sealEarned ? "earned" : spotlightUnlocked ? "unlocked" : "locked"}
      >
        <div className="flex items-start gap-3">
          {sealEarned ? <Award className="size-8 shrink-0 text-gold" /> : spotlightUnlocked ? <SparklesIcon className="size-8 shrink-0 animate-twinkle text-gold" /> : <Lock className="size-8 shrink-0 text-violet-500" />}
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-gold">Proof Spotlight · {arena.badge}</p>
            <p className="mt-1 font-heading text-lg font-bold text-white" data-testid="arena-spotlight-status">
              {sealEarned
                ? `${arena.badge} earned — arena cleared!`
                : spotlightUnlocked
                  ? "Spotlight unlocked. Open it to earn the seal."
                  : "Resolve at least one question attack to unlock the spotlight."}
            </p>
            <p className="mt-0.5 text-xs text-violet-300">
              {resolvedHere.length}/{attacks.length} attacks answered here · every attack stays replayable.
            </p>
          </div>
        </div>
        <Button
          disabled={!spotlightUnlocked}
          onClick={openSpotlight}
          className="h-11 rounded-sm px-5 font-heading font-bold uppercase shadow-[4px_4px_0_#7C2D12] disabled:shadow-none"
          data-testid="arena-open-spotlight-button"
        >
          <SparklesIcon className="size-4" /> {sealEarned ? "View Spotlight" : "Open Proof Spotlight"}
        </Button>
      </section>

      {/* arena nav */}
      <div className="mt-8 flex flex-wrap justify-between gap-3">
        {prev ? (
          <ArenaNavButton direction="prev" arena={prev} onClick={() => dispatch({ type: "ENTER_ARENA", arenaId: prev.id })} />
        ) : (
          <span />
        )}
        {next ? (
          <ArenaNavButton direction="next" arena={next} onClick={() => dispatch({ type: "ENTER_ARENA", arenaId: next.id })} />
        ) : (
          <Button
            variant="outline"
            onClick={back}
            className="h-11 rounded-sm border-gold/60 bg-transparent px-5 font-heading font-bold uppercase text-gold hover:bg-gold/10"
            data-testid="arena-finish-button"
          >
            Arena map <ArrowRight className="size-4" />
          </Button>
        )}
      </div>

      {battle && (
        <AttackBattle
          key={battle.id}
          attack={battle}
          arena={arena}
          vault={engine.resume_power_vault}
          onClose={() => {
            sfx("select");
            setBattle(null);
          }}
        />
      )}
      <SpotlightDialog arena={arena} powers={spotlightPowers} open={spotlightOpen} onOpenChange={setSpotlightOpen} />
    </main>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="-ml-2 h-9 rounded-sm font-mono text-[11px] font-semibold uppercase tracking-widest text-violet-200 hover:bg-violet-900/50 hover:text-white"
      data-testid="arena-back-button"
    >
      <ArrowLeft className="size-4" /> Arena map
    </Button>
  );
}

function ArenaNavButton({ direction, arena, onClick }: { direction: "prev" | "next"; arena: Arena; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="h-11 rounded-sm border-violet-400/50 bg-transparent px-5 font-heading font-bold uppercase text-violet-100 hover:bg-violet-900/50"
      data-testid={`arena-${direction}-button`}
    >
      {direction === "prev" && <ArrowLeft className="size-4" />}
      {direction === "prev" ? "" : "Next: "}
      {arena.title}
      {direction === "next" && <ArrowRight className="size-4" />}
    </Button>
  );
}

interface AttackCardProps {
  attack: FatherAttack;
  index: number;
  outcome?: FatherAttack["outcome"];
  onLaunch: () => void;
}

function AttackCard({ attack, index, outcome, onLaunch }: AttackCardProps) {
  const flames = attack.difficulty === "Very Hard" ? 3 : 2;
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 + index * 0.08 }}
      whileHover={{ y: -4 }}
      className={cn(
        "flex flex-col rounded-sm border-[3px] bg-[#220D1A] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.55)]",
        outcome ? "border-papa/50" : "border-papa",
      )}
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
