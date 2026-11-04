"""Pydantic mirrors of backend/data/engine.json — keep in sync with frontend/src/lib/types.ts."""

from typing import Literal, Optional

from pydantic import BaseModel, Field

Outcome = Literal["proven", "partial", "learning"]


class Character(BaseModel):
    id: str
    name: str
    role: str


class HeroMove(BaseModel):
    id: str
    title: str
    decision: str
    correct: bool
    reaction: str
    learning: str


class Arena(BaseModel):
    id: str
    number: int
    title: str
    monster: str
    theme: str
    core_proof: str
    badge: str
    hero_problem: str
    hero_moves: list[HeroMove]
    spotlight_powers: list[str] = []  # vault ids backing core_proof (curated link, no new facts)


class ProofMetric(BaseModel):
    label: str
    value: str


class AttackProof(BaseModel):
    """'Show Me Proof' breakdown — every line is lifted from the attack's answer/evidence/limitation."""

    contribution: Optional[str] = None
    decisions: list[str] = []
    metrics: list[ProofMetric] = []
    related_powers: list[str] = []
    supports: list[str] = []
    not_claimed: list[str] = []
    transferable: list[str] = []


class FatherAttack(BaseModel):
    id: str
    arena: str
    name: str
    difficulty: str
    question: str
    outcome: Outcome
    power: Optional[str] = None
    answer: str
    evidence: Optional[str] = None
    limitation: str
    learning: str
    papa: str
    papa_en: Optional[str] = None  # English subtitle for the Hinglish `papa` line
    source: str
    supporting_material_suggestion: str
    proof: AttackProof = AttackProof()


class FinaleChoice(BaseModel):
    id: str
    label: str
    hypothesis: str
    pilot: str
    measure: str
    risk: str


class Finale(BaseModel):
    setup: str
    daughter_entry: str
    question: str
    choices: list[FinaleChoice]
    ending_papa: str
    ending_daughter: str
    ending_screen: str
    # English subtitles for the quoted Hinglish dialogue above.
    setup_en: Optional[str] = None
    daughter_entry_en: Optional[str] = None
    ending_papa_en: Optional[str] = None
    ending_daughter_en: Optional[str] = None


class GameRules(BaseModel):
    starting_hearts: int
    attack_count: int
    attack_outcomes: dict[str, str]
    repeat_attacks: str
    arena_completion: str
    father_path: str
    shivam_path: str
    zero_hearts: str
    finale_unlock: str
    ending: str
    time_target: str
    core_proof_requires_truthfulness: str
    resume_vault: str


class PersonalLinks(BaseModel):
    """Only real http(s) URLs survive loading; placeholders become None so the UI hides them."""

    cv_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    contact_url: Optional[str] = None


class VoiceProof(BaseModel):
    status: str
    instructions: str


class OriginCard(BaseModel):
    title: str
    text: str = Field(validation_alias="copy")  # "copy" would shadow BaseModel.copy


class ResumePower(BaseModel):
    id: str
    label: str
    source: str
    achievement_type: str
    fact: str
    # Spotlight story split of `fact` (same CV fact, no new claims) — read by both journeys.
    action: Optional[str] = None
    impact: Optional[str] = None
    status: str
    role: str


class GameEngine(BaseModel):
    game_title: str
    subtitle: str
    game_version: str
    source_disclaimer: str
    characters: list[Character]
    arenas: list[Arena]
    father_attacks: list[FatherAttack]
    finale: Finale
    game_rules: GameRules
    personal_links: PersonalLinks
    voice_proof: VoiceProof
    optional_origin_cards: list[OriginCard]
    resume_source: str
    resume_power_vault: list[ResumePower]
    factual_integrity_guards: list[str]
