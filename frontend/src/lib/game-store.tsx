import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { gameReducer, hydrateState, type GameAction, type GameState, type JourneyProgress } from "@/lib/gameEngine";
import { loadSaved, saveState, storageMode } from "@/lib/storage";
import { playSfx, type SfxKind } from "@/lib/sfx";

interface GameContextValue {
  state: GameState;
  dispatch: (action: GameAction) => void;
  /** Current journey's progress, or null before a path is chosen. */
  progress: JourneyProgress | null;
  sfx: (kind: SfxKind) => void;
  storageMode: "local" | "memory";
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => hydrateState(loadSaved()));

  useEffect(() => {
    saveState(state);
  }, [state]);

  const sfx = useCallback(
    (kind: SfxKind) => {
      if (!state.muted) playSfx(kind);
    },
    [state.muted],
  );

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      dispatch,
      progress: state.journey ? state.progress[state.journey] : null,
      sfx,
      storageMode,
    }),
    [state, sfx],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
