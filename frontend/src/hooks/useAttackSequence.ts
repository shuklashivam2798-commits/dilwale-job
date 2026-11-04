import { useCallback, useEffect, useRef, useState } from "react";
import type { AttackOutcome, GameAction } from "@/lib/gameEngine";
import type { SfxKind } from "@/lib/sfx";
import type { FatherAttack } from "@/lib/types";

export type BattleStep = "launch" | "flight" | "scan" | "result";

const LAUNCH_HOLD_MS = 650;
const REDUCED_LAUNCH_HOLD_MS = 900;
const PROJECTILE_LAND_MS = 850;
const FLIGHT_MS = 1500;

const OUTCOME_SFX: Record<AttackOutcome, SfxKind> = { proven: "sparkle", partial: "confirm", learning: "heart" };

interface AttackSequenceOptions {
  attack: FatherAttack;
  reduceMotion: boolean;
  dispatch: (action: GameAction) => void;
  sfx: (kind: SfxKind) => void;
}

export interface AttackSequence {
  step: BattleStep;
  /** True once the "?" projectile has landed on Shivam. */
  hit: boolean;
  /** Call when Papa's question has finished typing. */
  markTyped: () => void;
  /** Jump to (or arrive at) the result. Records the JSON outcome exactly once. */
  toResult: () => void;
}

/** Drives one question attack: launch → projectile flight → vault scan → result. */
export function useAttackSequence({ attack, reduceMotion, dispatch, sfx }: AttackSequenceOptions): AttackSequence {
  const [step, setStep] = useState<BattleStep>("launch");
  const [typed, setTyped] = useState(false);
  const [hit, setHit] = useState(false);
  const resolvedRef = useRef(false);

  // Resolving is an event, not an effect: whether reached by the scan finishing or by
  // "Skip to answer", the deterministic outcome is recorded and its sound plays once.
  const toResult = useCallback(() => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    dispatch({ type: "RECORD_ATTACK", key: attack.id, outcome: attack.outcome });
    if (attack.outcome === "learning") {
      // Infinite Learner: one heart per unique attack id (reducer ignores repeats) + a journal note.
      dispatch({ type: "LOSE_HEART", key: attack.id, entry: { title: `${attack.id} · ${attack.name}`, note: attack.learning } });
    }
    sfx(OUTCOME_SFX[attack.outcome]);
    setStep("result");
  }, [attack.id, attack.outcome, dispatch, sfx]);

  const markTyped = useCallback(() => setTyped(true), []);

  // launch → flight (reduced motion skips the projectile and goes straight to the scan)
  useEffect(() => {
    if (step !== "launch" || !typed) return;
    const timer = window.setTimeout(
      () => {
        sfx("thud");
        setStep(reduceMotion ? "scan" : "flight");
      },
      reduceMotion ? REDUCED_LAUNCH_HOLD_MS : LAUNCH_HOLD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [step, typed, reduceMotion, sfx]);

  // flight: projectile lands on Shivam, then the vault scan begins
  useEffect(() => {
    if (step !== "flight") return;
    const landTimer = window.setTimeout(() => setHit(true), PROJECTILE_LAND_MS);
    const scanTimer = window.setTimeout(() => setStep("scan"), FLIGHT_MS);
    return () => {
      window.clearTimeout(landTimer);
      window.clearTimeout(scanTimer);
    };
  }, [step]);

  return { step, hit, markTyped, toResult };
}
