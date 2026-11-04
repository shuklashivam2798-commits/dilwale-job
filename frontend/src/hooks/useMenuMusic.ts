import { useEffect, useState } from "react";
import type { Phase } from "@/lib/gameEngine";
import { setMenuMusic, unlockMenuMusic } from "@/lib/menuMusic";

const MENU_PHASES: ReadonlySet<Phase> = new Set<Phase>(["title", "select"]);
const GESTURES = ["pointerdown", "keydown"] as const;

/** Plays the menu loop on the title + journey-select screens once the player has interacted, honouring mute. */
export function useMenuMusic(phase: Phase, muted: boolean): void {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const unlock = () => {
      unlockMenuMusic();
      setUnlocked(true);
    };
    for (const g of GESTURES) window.addEventListener(g, unlock, { once: true, capture: true });
    return () => {
      for (const g of GESTURES) window.removeEventListener(g, unlock, { capture: true });
    };
  }, []);

  useEffect(() => {
    setMenuMusic(unlocked && !muted && MENU_PHASES.has(phase));
  }, [unlocked, muted, phase]);
}
