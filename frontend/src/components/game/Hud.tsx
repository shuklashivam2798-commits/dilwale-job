import type { ReactElement } from "react";
import { Gem, Menu, NotebookPen } from "lucide-react";
import { useGame } from "@/hooks/useGame";
import { JOURNEYS, OTHER_JOURNEY } from "@/lib/script";
import { useGameData } from "@/hooks/useGameData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HeartsMeter, MuteToggle } from "@/components/game/HudBits";

const hudButton =
  "pixel-frame-sm inline-flex h-9 items-center gap-1.5 rounded-sm bg-panel px-2.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-violet-100 transition-[background-color,color,transform] duration-200 hover:bg-violet-900/60 hover:text-white active:translate-y-px";

interface HudProps {
  onOpenVault: () => void;
  onOpenJournal: () => void;
  onRestart: (scope: "journey" | "all") => void;
}

export function Hud({ onOpenVault, onOpenJournal, onRestart }: HudProps): ReactElement {
  const { state, progress, dispatch, sfx } = useGame();
  const { data, isError } = useGameData();
  const vaultCount = isError ? 0 : (data?.resume_power_vault.length ?? 0);

  return (
    <header className="sticky top-0 z-40 border-b border-violet-500/30 bg-night/80 backdrop-blur-md" data-testid="game-hud">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-8">
        <button
          type="button"
          onClick={() => {
            sfx("select");
            dispatch({ type: "GO_TITLE" });
          }}
          className="font-heading text-sm font-black uppercase leading-none tracking-tight text-white transition-colors duration-150 hover:text-gold"
          data-testid="hud-title-button"
          aria-label="Back to title screen"
        >
          Dilwale <span className="text-gold">Job</span>
          <span className="hidden sm:inline"> Le Jayenge</span>
        </button>

        <div className="flex flex-1 items-center justify-center gap-3">
          {state.journey && progress ? (
            <>
              <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-widest text-violet-300 md:inline" data-testid="hud-journey-label">
                {JOURNEYS[state.journey].title}
              </span>
              <HeartsMeter hearts={progress.hearts} />
            </>
          ) : (
            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-violet-300" data-testid="hud-journey-label">
              Choose a path
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={hudButton}
            onClick={() => {
              sfx("sparkle");
              onOpenVault();
            }}
            data-testid="hud-resume-vault-button"
            aria-label="Open Resume Power Vault"
          >
            <Gem className="size-4 text-gold" />
            <span className="hidden sm:inline">Vault</span>
            {vaultCount > 0 && <span className="text-gold">{vaultCount}</span>}
          </button>
          <button
            type="button"
            className={hudButton}
            onClick={() => {
              sfx("select");
              onOpenJournal();
            }}
            data-testid="hud-learning-journal-button"
            aria-label="Open Learning Journal"
          >
            <NotebookPen className="size-4 text-magenta" />
            <span className="hidden sm:inline">Journal</span>
            <span className="text-magenta" data-testid="hud-journal-count">{progress?.journal.length ?? 0}</span>
          </button>
          <MuteToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className={hudButton} data-testid="hud-menu-button" aria-label="Game menu">
              <Menu className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              <DropdownMenuItem onClick={() => dispatch({ type: "START_INTRO" })} data-testid="hud-menu-replay-intro">
                Replay intro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => dispatch({ type: "GO_SELECT" })} data-testid="hud-menu-choose-path">
                Choose path
              </DropdownMenuItem>
              {state.journey && (
                <DropdownMenuItem
                  onClick={() => dispatch({ type: "SELECT_JOURNEY", journey: OTHER_JOURNEY[state.journey!] })}
                  data-testid="hud-menu-switch-journey"
                >
                  Switch to {JOURNEYS[OTHER_JOURNEY[state.journey]].title}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {state.journey && (
                <DropdownMenuItem onClick={() => onRestart("journey")} data-testid="hud-menu-restart-journey">
                  Restart this journey
                </DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onClick={() => onRestart("all")} data-testid="hud-menu-restart-all">
                Restart whole game
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
