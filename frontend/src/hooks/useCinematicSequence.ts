import { useCallback, useEffect, useState } from "react";
import { CINEMATIC } from "@/lib/script";
import type { SfxKind } from "@/lib/sfx";

const AUTO_ADVANCE_MS = 2300;
const FREEZE_HOLD_MS = 2800;

export interface CinematicSequence {
  beat: number;
  typed: boolean;
  /** The user asked to show the current line in full. */
  forced: boolean;
  freeze: boolean;
  /** Increments on Replay so typewriters and scenes remount. */
  run: number;
  isLast: boolean;
  advance: () => void;
  replay: () => void;
  finish: () => void;
  markTyped: () => void;
}

/** Beat-by-beat cinematic timing: typewriter → auto-advance → freeze frame → finish. Keyboard: Space/Enter, Esc. */
export function useCinematicSequence(onFinish: () => void, sfx: (kind: SfxKind) => void): CinematicSequence {
  const [beat, setBeat] = useState(0);
  const [typed, setTyped] = useState(false);
  const [forced, setForced] = useState(false);
  const [freeze, setFreeze] = useState(false);
  const [run, setRun] = useState(0);
  const isLast = beat === CINEMATIC.length - 1;

  const finish = useCallback(() => {
    sfx("confirm");
    onFinish();
  }, [onFinish, sfx]);

  const advance = useCallback(() => {
    if (freeze) return finish();
    if (!typed) return setForced(true);
    sfx("select");
    if (isLast) return setFreeze(true);
    setBeat((b) => b + 1);
    setTyped(false);
    setForced(false);
  }, [freeze, typed, isLast, finish, sfx]);

  const replay = useCallback(() => {
    sfx("select");
    setBeat(0);
    setTyped(false);
    setForced(false);
    setFreeze(false);
    setRun((r) => r + 1);
  }, [sfx]);

  const markTyped = useCallback(() => setTyped(true), []);

  // Auto-advance after each line finishes typing.
  useEffect(() => {
    if (!typed || freeze) return;
    const timer = window.setTimeout(advance, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [typed, freeze, advance]);

  // The freeze frame rolls into path select on its own.
  useEffect(() => {
    if (!freeze) return;
    const timer = window.setTimeout(finish, FREEZE_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [freeze, finish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLButtonElement) return; // a focused button handles its own Enter/Space
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        advance();
      } else if (e.key === "Escape") {
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, finish]);

  return { beat, typed, forced, freeze, run, isLast, advance, replay, finish, markTyped };
}
