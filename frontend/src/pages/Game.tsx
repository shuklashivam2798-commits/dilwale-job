import { useEffect, useState, type ReactElement } from "react";
import { GameProvider } from "@/lib/game-store";
import { useGame } from "@/hooks/useGame";
import { Cinematic } from "@/components/game/Cinematic";
import { ArenaScreen } from "@/components/game/father/ArenaScreen";
import { FinaleScreen } from "@/components/game/finale/FinaleScreen";
import { MonsterBattle } from "@/components/game/shivam/MonsterBattle";
import { ComebackDialog, RestartDialog, type RestartScope } from "@/components/game/GameDialogs";
import { Hud } from "@/components/game/Hud";
import { JournalDrawer } from "@/components/game/JournalDrawer";
import { JourneyHub } from "@/components/game/JourneyHub";
import { JourneySelect } from "@/components/game/JourneySelect";
import { TitleScreen } from "@/components/game/TitleScreen";
import { VaultDrawer } from "@/components/game/VaultDrawer";

export default function Game(): ReactElement {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}

function GameShell(): ReactElement {
  const { state } = useGame();
  const [vaultOpen, setVaultOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [restart, setRestart] = useState<RestartScope | null>(null);

  // Every screen / journey change starts at the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [state.phase, state.journey, state.activeArena]);

  if (state.phase === "title") return <TitleScreen />;
  if (state.phase === "intro") return <Cinematic />;

  return (
    <div className="relative min-h-dvh overflow-x-hidden" data-testid="game-shell">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(139,92,246,0.25),transparent_50%),radial-gradient(ellipse_at_90%_100%,rgba(236,72,153,0.18),transparent_50%)]"
      />
      <div aria-hidden className="scanlines pointer-events-none fixed inset-0" />
      <Hud onOpenVault={() => setVaultOpen(true)} onOpenJournal={() => setJournalOpen(true)} onRestart={setRestart} />
      <div className="relative">
        <ShellContent onRestart={setRestart} onOpenJournal={() => setJournalOpen(true)} />
      </div>
      <VaultDrawer open={vaultOpen} onOpenChange={setVaultOpen} />
      <JournalDrawer open={journalOpen} onOpenChange={setJournalOpen} />
      <RestartDialog scope={restart} onClose={() => setRestart(null)} />
      <ComebackDialog />
    </div>
  );
}

/** Which screen the shell shows: path select, finale, an arena (per journey), or the arena map. */
function ShellContent({ onRestart, onOpenJournal }: { onRestart: (scope: RestartScope) => void; onOpenJournal: () => void }): ReactElement {
  const { state } = useGame();
  if (state.phase === "select") return <JourneySelect />;
  if (state.phase === "finale") return <FinaleScreen onOpenJournal={onOpenJournal} />;
  if (state.activeArena) return state.journey === "father" ? <ArenaScreen /> : <MonsterBattle />;
  return <JourneyHub onRestart={onRestart} />;
}
