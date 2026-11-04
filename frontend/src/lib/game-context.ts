import { createContext } from "react";
import type { GameAction, GameState, JourneyProgress } from "@/lib/gameEngine";
import type { SfxKind } from "@/lib/sfx";

export interface GameContextValue {
  state: GameState;
  dispatch: (action: GameAction) => void;
  /** Current journey's progress, or null before a path is chosen. */
  progress: JourneyProgress | null;
  sfx: (kind: SfxKind) => void;
  storageMode: "local" | "memory";
}

export const GameContext = createContext<GameContextValue | null>(null);
