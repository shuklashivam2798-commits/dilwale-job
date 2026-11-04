import { useCallback, useEffect, useMemo, useReducer, type ReactElement, type ReactNode } from "react";
import { GameContext, type GameContextValue } from "@/lib/game-context";
import { gameReducer, hydrateState } from "@/lib/gameEngine";
import { loadSaved, saveState, storageMode } from "@/lib/storage";
import { playSfx, type SfxKind } from "@/lib/sfx";
import { useMenuMusic } from "@/hooks/useMenuMusic";

export function GameProvider({ children }: { children: ReactNode }): ReactElement {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => hydrateState(loadSaved()));

  useEffect(() => {
    saveState(state);
  }, [state]);

  useMenuMusic(state.phase, state.muted);

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
