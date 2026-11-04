import type { ReactElement } from "react";
import { ArrowLeft, ArrowRight, Award, Lock, Sparkles as SparklesIcon } from "lucide-react";
import type { Arena } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Shared by both journeys' arena screens (Papa's question arenas and Shivam's monster battles).

export type SpotlightState = "locked" | "unlocked" | "earned";

export function spotlightState(sealEarned: boolean, unlocked: boolean): SpotlightState {
  if (sealEarned) return "earned";
  return unlocked ? "unlocked" : "locked";
}

const SPOTLIGHT_UI: Record<SpotlightState, { panel: string; icon: ReactElement; button: string }> = {
  locked: { panel: "border-violet-700/50 bg-panel/60", icon: <Lock className="size-8 shrink-0 text-violet-500" />, button: "Open Proof Spotlight" },
  unlocked: {
    panel: "border-gold/70 bg-panel",
    icon: <SparklesIcon className="size-8 shrink-0 animate-twinkle text-gold" />,
    button: "Open Proof Spotlight",
  },
  earned: { panel: "border-gold bg-gold/10", icon: <Award className="size-8 shrink-0 text-gold" />, button: "View Spotlight" },
};

interface SpotlightPanelProps {
  arena: Arena;
  state: SpotlightState;
  /** What unlocks the spotlight on this journey. */
  lockedHint: string;
  footnote: string;
  onOpen: () => void;
}

export function SpotlightPanel({ arena, state, lockedHint, footnote, onOpen }: SpotlightPanelProps): ReactElement {
  const ui = SPOTLIGHT_UI[state];
  const status: Record<SpotlightState, string> = {
    locked: lockedHint,
    unlocked: "Spotlight unlocked. Open it to earn the seal.",
    earned: `${arena.badge} earned — arena cleared!`,
  };
  return (
    <section
      className={cn("mt-8 grid items-center gap-4 rounded-sm border-2 p-5 sm:grid-cols-[1fr_auto]", ui.panel)}
      data-testid="arena-spotlight-panel"
      data-state={state}
    >
      <div className="flex items-start gap-3">
        {ui.icon}
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-gold">Proof Spotlight · {arena.badge}</p>
          <p className="mt-1 font-heading text-lg font-bold text-white" data-testid="arena-spotlight-status">
            {status[state]}
          </p>
          <p className="mt-0.5 text-xs text-violet-300">{footnote}</p>
        </div>
      </div>
      <Button
        disabled={state === "locked"}
        onClick={onOpen}
        className="h-11 rounded-sm px-5 font-heading font-bold uppercase shadow-[4px_4px_0_#7C2D12] disabled:shadow-none"
        data-testid="arena-open-spotlight-button"
      >
        <SparklesIcon className="size-4" /> {ui.button}
      </Button>
    </section>
  );
}

export function BackButton({ onClick }: { onClick: () => void }): ReactElement {
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

export function ArenaFallback({ loading, onBack }: { loading: boolean; onBack: () => void }): ReactElement {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8" data-testid="arena-screen">
      <BackButton onClick={onBack} />
      {loading ? (
        <div className="mt-6 h-64 animate-pulse rounded-sm bg-panel" />
      ) : (
        <p className="mt-6 rounded-sm border border-violet-500/30 bg-panel p-6 text-sm text-violet-200" data-testid="arena-unavailable">
          This arena is backstage right now. Head back to the arena map and try again.
        </p>
      )}
    </main>
  );
}

interface ArenaNavProps {
  arenas: Arena[];
  current: Arena;
  onEnter: (arenaId: string) => void;
  onBack: () => void;
  /** Shown instead of "Arena map" on the last arena once the finale is unlocked. */
  onFinale?: () => void;
}

export function ArenaNav({ arenas, current, onEnter, onBack, onFinale }: ArenaNavProps): ReactElement {
  const index = arenas.indexOf(current);
  const prev = arenas[index - 1];
  const next = arenas[index + 1];
  return (
    <div className="mt-8 flex flex-wrap justify-between gap-3">
      {prev ? <ArenaNavButton direction="prev" arena={prev} onClick={() => onEnter(prev.id)} /> : <span />}
      <div className="flex flex-wrap gap-3">
        {onFinale && (
          <Button onClick={onFinale} className="h-11 rounded-sm bg-magenta px-5 font-heading font-bold uppercase text-white shadow-[4px_4px_0_#4C0519] hover:bg-pink-400" data-testid="arena-finale-button">
            Meet Miss Growth <ArrowRight className="size-4" />
          </Button>
        )}
        {next ? (
          <ArenaNavButton direction="next" arena={next} onClick={() => onEnter(next.id)} />
        ) : (
          <Button
            variant="outline"
            onClick={onBack}
            className="h-11 rounded-sm border-gold/60 bg-transparent px-5 font-heading font-bold uppercase text-gold hover:bg-gold/10"
            data-testid="arena-finish-button"
          >
            Arena map <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function ArenaNavButton({ direction, arena, onClick }: { direction: "prev" | "next"; arena: Arena; onClick: () => void }): ReactElement {
  const isNext = direction === "next";
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="h-11 rounded-sm border-violet-400/50 bg-transparent px-5 font-heading font-bold uppercase text-violet-100 hover:bg-violet-900/50"
      data-testid={`arena-${direction}-button`}
    >
      {!isNext && <ArrowLeft className="size-4" />}
      {isNext && "Next: "}
      {arena.title}
      {isNext && <ArrowRight className="size-4" />}
    </Button>
  );
}
