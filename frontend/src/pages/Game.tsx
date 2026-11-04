import { useEffect, useState } from "react";
import { GameProvider, useGame } from "@/lib/game-store";
import { Cinematic } from "@/components/game/Cinematic";
import { ArenaScreen } from "@/components/game/father/ArenaScreen";
import { ComebackDialog, RestartDialog, type RestartScope } from "@/components/game/GameDialogs";
import { Hud } from "@/components/game/Hud";
import { JournalDrawer } from "@/components/game/JournalDrawer";
import { JourneyHub } from "@/components/game/JourneyHub";
import { JourneySelect } from "@/components/game/JourneySelect";
import { TitleScreen } from "@/components/game/TitleScreen";
import { VaultDrawer } from "@/components/game/VaultDrawer";

export default function Game() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}

function GameShell() {
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
        {state.phase === "select" ? (
          <JourneySelect />
        ) : state.journey === "father" && state.activeArena ? (
          <ArenaScreen />
        ) : (
          <JourneyHub onRestart={setRestart} />
        )}
      </div>
      <VaultDrawer open={vaultOpen} onOpenChange={setVaultOpen} />
      <JournalDrawer open={journalOpen} onOpenChange={setJournalOpen} />
      <RestartDialog scope={restart} onClose={() => setRestart(null)} />
      <ComebackDialog />
    </div>
  );
}
