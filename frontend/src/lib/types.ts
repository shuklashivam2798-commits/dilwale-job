// Hand-written mirrors of backend/models/game.py — keep the pair in sync.

export type Outcome = "proven" | "partial" | "learning";

export interface Character {
  id: string;
  name: string;
  role: string;
}

export interface HeroMove {
  id: string;
  title: string;
  decision: string;
  correct: boolean;
  reaction: string;
  learning: string;
}

export interface Arena {
  id: string;
  number: number;
  title: string;
  monster: string;
  theme: string;
  core_proof: string;
  badge: string;
  hero_problem: string;
  hero_moves: HeroMove[];
  /** Vault ids backing core_proof. */
  spotlight_powers: string[];
}

export interface ProofMetric {
  label: string;
  value: string;
}

/** "Show Me Proof" breakdown — lifted from the attack's answer/evidence/limitation. */
export interface AttackProof {
  contribution: string | null;
  decisions: string[];
  metrics: ProofMetric[];
  related_powers: string[];
  supports: string[];
  not_claimed: string[];
  transferable: string[];
}

export interface FatherAttack {
  id: string;
  arena: string;
  name: string;
  difficulty: string;
  question: string;
  outcome: Outcome;
  power: string | null;
  answer: string;
  evidence: string | null;
  limitation: string;
  learning: string;
  papa: string;
  /** English subtitle for the Hinglish `papa` line. */
  papa_en: string | null;
  source: string;
  supporting_material_suggestion: string;
  proof: AttackProof;
}

export interface FinaleChoice {
  id: string;
  label: string;
  hypothesis: string;
  pilot: string;
  measure: string;
  risk: string;
}

export interface Finale {
  setup: string;
  daughter_entry: string;
  question: string;
  choices: FinaleChoice[];
  ending_papa: string;
  ending_daughter: string;
  ending_screen: string;
  /** English subtitles for the quoted Hinglish dialogue above. */
  setup_en: string | null;
  daughter_entry_en: string | null;
  ending_papa_en: string | null;
  ending_daughter_en: string | null;
}

export interface GameRules {
  starting_hearts: number;
  attack_count: number;
  attack_outcomes: Record<string, string>;
  repeat_attacks: string;
  arena_completion: string;
  father_path: string;
  shivam_path: string;
  zero_hearts: string;
  finale_unlock: string;
  ending: string;
  time_target: string;
  core_proof_requires_truthfulness: string;
  resume_vault: string;
}

/** Only real URLs are returned; null means "hide the button". */
export interface PersonalLinks {
  cv_url: string | null;
  linkedin_url: string | null;
  contact_url: string | null;
}

export interface VoiceProof {
  status: string;
  instructions: string;
}

export interface OriginCard {
  title: string;
  text: string;
}

export interface ResumePower {
  id: string;
  label: string;
  source: string;
  achievement_type: string;
  fact: string;
  /** Spotlight story split of `fact` (same CV fact) — read by both journeys. */
  action: string | null;
  impact: string | null;
  status: string;
  role: string;
}

export interface GameEngine {
  game_title: string;
  subtitle: string;
  game_version: string;
  source_disclaimer: string;
  characters: Character[];
  arenas: Arena[];
  father_attacks: FatherAttack[];
  finale: Finale;
  game_rules: GameRules;
  personal_links: PersonalLinks;
  voice_proof: VoiceProof;
  optional_origin_cards: OriginCard[];
  resume_source: string;
  resume_power_vault: ResumePower[];
  factual_integrity_guards: string[];
}
