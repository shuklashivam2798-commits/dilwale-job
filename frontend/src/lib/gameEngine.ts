// Pure, dependency-free game state machine. All persistence lives in lib/storage.ts;
// all UI reads/writes go through GameProvider (lib/game-store.tsx).
//
// Planned-but-not-yet-wired mechanics already have state + actions here so later steps
// only add screens: Resume Raksha (RESOLVE + spotlight), Infinite Learner (LOSE_HEART →
// comeback), Learning Journal (journal[]), seals (badges[]), Miss Growth finale (finaleChoice).

export type JourneyId = "father" | "shivam";
export type Phase = "title" | "intro" | "select" | "journey" | "finale";
export type AttackOutcome = "proven" | "partial" | "learning";

export const STARTING_HEARTS = 3;
export const STATE_VERSION = 1;
export const FINALE_SPOTLIGHTS = 3;

export interface JournalEntry {
  /** Unique key of the thing that produced the note (attack id, move id…) — dedupes entries. */
  key: string;
  title: string;
  note: string;
  at: number;
}

export interface JourneyProgress {
  hearts: number;
  /** Keys that already cost a heart — a repeated attack/move can never drain another. */
  heartLossKeys: string[];
  resolvedKeys: string[];
  /** Father's Journey: deterministic outcome per resolved attack id. Learning outcomes are
   *  kept here, ready for the Infinite Learner heart/journal phase. */
  attackOutcomes: Record<string, AttackOutcome>;
  spotlightsViewed: string[];
  badges: string[];
  journal: JournalEntry[];
  comebacks: number;
  comebackPending: boolean;
  finaleChoice: string | null;
}

export interface GameState {
  version: number;
  phase: Phase;
  journey: JourneyId | null;
  /** Arena currently open inside the journey (null = arena map). */
  activeArena: string | null;
  introSeen: boolean;
  muted: boolean;
  progress: Record<JourneyId, JourneyProgress>;
}

export type GameAction =
  | { type: "GO_TITLE" }
  | { type: "START_INTRO" }
  | { type: "FINISH_INTRO" }
  | { type: "GO_SELECT" }
  | { type: "SELECT_JOURNEY"; journey: JourneyId }
  | { type: "TOGGLE_MUTE" }
  | { type: "RESOLVE"; key: string }
  | { type: "RECORD_ATTACK"; key: string; outcome: AttackOutcome }
  | { type: "ENTER_ARENA"; arenaId: string }
  | { type: "LEAVE_ARENA" }
  | { type: "OPEN_FINALE" }
  | { type: "LOSE_HEART"; key: string; entry?: Omit<JournalEntry, "key" | "at"> }
  | { type: "ADD_JOURNAL"; key: string; title: string; note: string }
  | { type: "VIEW_SPOTLIGHT"; arenaId: string; badge?: string }
  | { type: "EARN_BADGE"; badge: string }
  | { type: "ACK_COMEBACK" }
  | { type: "CHOOSE_FINALE"; choiceId: string }
  | { type: "RESET_JOURNEY"; journey: JourneyId }
  | { type: "RESET_ALL" };

export function freshProgress(): JourneyProgress {
  return {
    hearts: STARTING_HEARTS,
    heartLossKeys: [],
    resolvedKeys: [],
    attackOutcomes: {},
    spotlightsViewed: [],
    badges: [],
    journal: [],
    comebacks: 0,
    comebackPending: false,
    finaleChoice: null,
  };
}

export function initialState(): GameState {
  return {
    version: STATE_VERSION,
    phase: "title",
    journey: null,
    activeArena: null,
    introSeen: false,
    muted: true, // never autoplay audio
    progress: { father: freshProgress(), shivam: freshProgress() },
  };
}

const addUnique = (list: string[], value: string) => (list.includes(value) ? list : [...list, value]);

function updateCurrent(state: GameState, fn: (p: JourneyProgress) => JourneyProgress): GameState {
  if (!state.journey) return state;
  const current = state.progress[state.journey];
  const next = fn(current);
  if (next === current) return state;
  return { ...state, progress: { ...state.progress, [state.journey]: next } };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "GO_TITLE":
      return { ...state, phase: "title" };
    case "START_INTRO":
      return { ...state, phase: "intro" };
    case "FINISH_INTRO":
      return { ...state, phase: "select", introSeen: true };
    case "GO_SELECT":
      return { ...state, phase: "select", activeArena: null };
    case "SELECT_JOURNEY":
      return { ...state, phase: "journey", journey: action.journey, activeArena: null, introSeen: true };
    case "ENTER_ARENA":
      return state.journey ? { ...state, activeArena: action.arenaId } : state;
    case "LEAVE_ARENA":
      return { ...state, activeArena: null };
    case "OPEN_FINALE":
      // Unlock rule: all three arena core-proof spotlights viewed (gaps may remain in the journal).
      if (!state.journey || state.progress[state.journey].spotlightsViewed.length < FINALE_SPOTLIGHTS) return state;
      return { ...state, phase: "finale", activeArena: null };
    case "TOGGLE_MUTE":
      return { ...state, muted: !state.muted };
    case "RESOLVE":
      return updateCurrent(state, (p) =>
        p.resolvedKeys.includes(action.key) ? p : { ...p, resolvedKeys: [...p.resolvedKeys, action.key] },
      );
    case "RECORD_ATTACK":
      return updateCurrent(state, (p) =>
        p.attackOutcomes[action.key] === action.outcome && p.resolvedKeys.includes(action.key)
          ? p
          : {
              ...p,
              resolvedKeys: addUnique(p.resolvedKeys, action.key),
              attackOutcomes: { ...p.attackOutcomes, [action.key]: action.outcome },
            },
      );
    case "LOSE_HEART":
      return updateCurrent(state, (p) => {
        if (p.heartLossKeys.includes(action.key)) return p; // idempotent per unique attack/move
        const journal = action.entry
          ? appendJournal(p.journal, { key: action.key, ...action.entry, at: Date.now() })
          : p.journal;
        const hearts = p.hearts - 1;
        const base = { ...p, heartLossKeys: [...p.heartLossKeys, action.key], journal };
        // Infinite Learner comeback: never softlock — restore one heart, keep journal + losses.
        return hearts <= 0
          ? { ...base, hearts: 1, comebacks: p.comebacks + 1, comebackPending: true }
          : { ...base, hearts };
      });
    case "ADD_JOURNAL":
      return updateCurrent(state, (p) => {
        const journal = appendJournal(p.journal, { key: action.key, title: action.title, note: action.note, at: Date.now() });
        return journal === p.journal ? p : { ...p, journal };
      });
    case "VIEW_SPOTLIGHT":
      return updateCurrent(state, (p) => {
        const badge = action.badge;
        const hasBadge = !badge || p.badges.includes(badge);
        if (p.spotlightsViewed.includes(action.arenaId) && hasBadge) return p;
        return {
          ...p,
          spotlightsViewed: addUnique(p.spotlightsViewed, action.arenaId),
          badges: badge ? addUnique(p.badges, badge) : p.badges,
        };
      });
    case "EARN_BADGE":
      return updateCurrent(state, (p) => (p.badges.includes(action.badge) ? p : { ...p, badges: [...p.badges, action.badge] }));
    case "ACK_COMEBACK":
      return updateCurrent(state, (p) => (p.comebackPending ? { ...p, comebackPending: false } : p));
    case "CHOOSE_FINALE":
      return updateCurrent(state, (p) => ({ ...p, finaleChoice: action.choiceId }));
    case "RESET_JOURNEY":
      return {
        ...state,
        activeArena: state.journey === action.journey ? null : state.activeArena,
        progress: { ...state.progress, [action.journey]: freshProgress() },
      };
    case "RESET_ALL":
      return { ...initialState(), muted: state.muted };
    default:
      return state;
  }
}

function appendJournal(journal: JournalEntry[], entry: JournalEntry): JournalEntry[] {
  return journal.some((e) => e.key === entry.key) ? journal : [...journal, entry];
}

/** Coerce anything read from storage into a valid state (bad/old data → fresh defaults). */
export function hydrateState(raw: unknown): GameState {
  const base = initialState();
  if (!raw || typeof raw !== "object") return base;
  const r = raw as Partial<GameState>;
  if (r.version !== STATE_VERSION) return base;
  const phases: Phase[] = ["title", "intro", "select", "journey", "finale"];
  const journey = r.journey === "father" || r.journey === "shivam" ? r.journey : null;
  let phase: Phase = phases.includes(r.phase as Phase) ? (r.phase as Phase) : "title";
  if ((phase === "journey" || phase === "finale") && !journey) phase = "select";
  return {
    version: STATE_VERSION,
    phase,
    journey,
    activeArena: journey && typeof r.activeArena === "string" ? r.activeArena : null,
    introSeen: Boolean(r.introSeen),
    muted: r.muted !== false,
    progress: {
      father: hydrateProgress(r.progress?.father),
      shivam: hydrateProgress(r.progress?.shivam),
    },
  };
}

function hydrateProgress(raw: unknown): JourneyProgress {
  const base = freshProgress();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<JourneyProgress>;
  const strings = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  const hearts = typeof p.hearts === "number" && p.hearts >= 1 && p.hearts <= STARTING_HEARTS ? Math.floor(p.hearts) : base.hearts;
  return {
    hearts,
    heartLossKeys: strings(p.heartLossKeys),
    resolvedKeys: strings(p.resolvedKeys),
    attackOutcomes: hydrateOutcomes(p.attackOutcomes),
    spotlightsViewed: strings(p.spotlightsViewed),
    badges: strings(p.badges),
    journal: Array.isArray(p.journal)
      ? p.journal.filter(
          (e): e is JournalEntry =>
            !!e && typeof e === "object" && typeof e.key === "string" && typeof e.note === "string" && typeof e.title === "string",
        )
      : [],
    comebacks: typeof p.comebacks === "number" ? p.comebacks : 0,
    comebackPending: Boolean(p.comebackPending),
    finaleChoice: typeof p.finaleChoice === "string" ? p.finaleChoice : null,
  };
}

const OUTCOMES: AttackOutcome[] = ["proven", "partial", "learning"];

function hydrateOutcomes(raw: unknown): Record<string, AttackOutcome> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, AttackOutcome> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (OUTCOMES.includes(v as AttackOutcome)) out[k] = v as AttackOutcome;
  }
  return out;
}

// ---- Papa's mood: Skeptical → Impressed, driven only by resolved attack outcomes ----
export type PapaStage = "skeptical" | "curious" | "warming" | "impressed";
export const PAPA_STAGES: PapaStage[] = ["skeptical", "curious", "warming", "impressed"];
/** Proven/partial defenses impress Papa most; an honest "not on my CV" still earns respect. */
const OUTCOME_POINTS: Record<AttackOutcome, number> = { proven: 2, partial: 2, learning: 1 };
const STAGE_THRESHOLDS: Array<[PapaStage, number]> = [
  ["impressed", 11],
  ["warming", 6],
  ["curious", 2],
  ["skeptical", 0],
];
/** 5 proven + 1 partial + 3 learning in the engine = 15 points when all nine are resolved. */
export const PAPA_MAX_POINTS = 15;

export function papaImpression(outcomes: Record<string, AttackOutcome>): { points: number; stage: PapaStage } {
  const points = Object.values(outcomes).reduce((sum, o) => sum + OUTCOME_POINTS[o], 0);
  const stage = STAGE_THRESHOLDS.find(([, min]) => points >= min)?.[0] ?? "skeptical";
  return { points, stage };
}
