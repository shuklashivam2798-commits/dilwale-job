import { useContext } from "react";
import { GameContext, type GameContextValue } from "@/lib/game-context";

/** Game state + dispatch + sfx. Must be used inside <GameProvider>. */
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
