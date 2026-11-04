// Static story copy for the opening cinematic + journey select (from the master spec §2/§3).
// Lives in the bundle so the intro plays even when the backend is unavailable.
import type { AttackOutcome, JourneyId, PapaStage } from "@/lib/gameEngine";
import type { PapaMood } from "@/components/game/Sprites";
import type { SpotlightState } from "@/components/game/ArenaParts";
import type { Arena } from "@/lib/types";

export type SceneId = "papa-resumes" | "hero-cross" | "thehro" | "demo";

export interface CinematicBeat {
  id: SceneId;
  speaker: string;
  speakerTone: "papa" | "hero" | "narrator";
  line: string;
  subtitle: string;
}

export const CINEMATIC: CinematicBeat[] = [
  {
    id: "papa-resumes",
    speaker: "Recruiter Papa",
    speakerTone: "papa",
    line: "Ek dream job. Do hazaar applications. Aur ek recruiter… jo resumes dekh dekh kar thak chuka tha!",
    subtitle: "One dream job. Two thousand applications. And one recruiter… tired of reading resume after resume.",
  },
  {
    id: "hero-cross",
    speaker: "Narrator",
    speakerTone: "narrator",
    line: "Par ek ladka tha… jise PDF bhejna manzoor nahi tha!",
    subtitle: "But there was one boy… who refused to just send a PDF.",
  },
  {
    id: "thehro",
    speaker: "Recruiter Papa",
    speakerTone: "papa",
    line: "THEHRO! Meri beti ke liye hazaaron rishte aaye hain. Tum mein aisa kya khaas hai?",
    subtitle: "STOP! Thousands of proposals have come for my daughter. What is so special about you?",
  },
  {
    id: "demo",
    speaker: "Shivam",
    speakerTone: "hero",
    line: "Uncle ji, resume nahi… demo lekar aaya hoon!",
    subtitle: "Uncle ji, I didn't bring a resume… I brought a demo!",
  },
];

export interface JourneyCopy {
  id: JourneyId;
  badge: string;
  title: string;
  mechanic: string;
  cta: string;
  playAs: string;
  pitch: string;
  bullets: string[];
}

export const JOURNEYS: Record<JourneyId, JourneyCopy> = {
  father: {
    id: "father",
    badge: "Skeptic Mode",
    title: "Father's Journey",
    mechanic: "Question Attacks",
    cta: "Become Recruiter Papa — Test the Boy",
    playAs: "Recruiter Papa",
    pitch: "Fire hard questions at Shivam. He answers only with what his resume can prove — or admits the gap.",
    bullets: [
      "9 question attacks across 3 arenas",
      "Scanning Shivam's Resume Powers… Proven · Partial · Learning",
      "Show Me Proof or stay Not Convinced Yet",
    ],
  },
  shivam: {
    id: "shivam",
    badge: "Challenger Mode",
    title: "Shivam's Journey",
    mechanic: "Strategy Card Battles",
    cta: "Become Shivam — Fight for the Role",
    playAs: "Shivam",
    pitch: "Battle three growth monsters with real business problems. Pick the right strategy card to earn each seal.",
    bullets: [
      "3 monster battles: Budget Beast, Invisible Audience, AI Fog King",
      "3 strategy cards per battle — one strong, two funny setbacks",
      "Strong moves unlock real-world stories and seals",
    ],
  },
};

export const OTHER_JOURNEY: Record<JourneyId, JourneyId> = { father: "shivam", shivam: "father" };

// ---- Arena spotlight copy: same feature + same Resume Power data, framed for the player's role ----
export interface SpotlightCopy {
  id: JourneyId;
  kicker: string;
  stageLabel: string;
  headline: (arena: Arena, state: SpotlightState) => string;
  detail: (arena: Arena, state: SpotlightState) => string;
  button: (state: SpotlightState) => string;
  title: (arena: Arena) => string;
  description: (arena: Arena) => string;
  challengeLabel: string;
  itemLabel: string;
  skillLabel: string | null;
  actionLabel: string;
  resultLabel: string;
}

const CLAIMS_HEADLINE = "Claims are easy. Where's the proof?";
const DEBRIEF_LINE = "Discover how Shivam used these same skills to solve real-world growth challenges.";

export const SPOTLIGHT_COPY: Record<JourneyId, SpotlightCopy> = {
  father: {
    id: "father",
    kicker: "Papa's Proof Inspection",
    stageLabel: "Arena",
    headline: () => CLAIMS_HEADLINE,
    detail: (arena, state) =>
      ({
        locked: "Resolve at least one question attack to unlock the inspection.",
        unlocked: "Inspection unlocked. Inspect the evidence to earn the seal.",
        earned: `${arena.badge} earned — arena cleared!`,
      })[state],
    button: () => "Inspect Shivam's Evidence",
    title: () => CLAIMS_HEADLINE,
    description: (arena) => `${arena.title} · ${arena.theme}`,
    challengeLabel: "Challenge",
    itemLabel: "Evidence",
    skillLabel: null,
    actionLabel: "Action",
    resultLabel: "Measurable result",
  },
  shivam: {
    id: "shivam",
    kicker: "Victory Debrief",
    stageLabel: "Battle",
    headline: (arena, state) => (state === "locked" ? `${arena.monster} still stands.` : `${arena.monster} Defeated!`),
    detail: (arena, state) =>
      ({
        locked: "Play the strong strategy card to unlock the real-world story.",
        unlocked: DEBRIEF_LINE,
        earned: `${arena.badge} earned — real-world story unlocked!`,
      })[state],
    button: (state) => (state === "earned" ? "View Real-World Story" : "Unlock Real-World Story"),
    title: (arena) => `${arena.monster} Defeated!`,
    description: () => DEBRIEF_LINE,
    challengeLabel: "Real-world challenge",
    itemLabel: "Achievement unlocked",
    skillLabel: "Skill activated",
    actionLabel: "Action he took",
    resultLabel: "Measurable impact",
  },
};

// ---- Father's Journey flavour copy (Papa's personality only — never CV facts) ----
export const PAPA_STAGE_COPY: Record<PapaStage, { label: string; line: string; subtitle: string; mood: PapaMood }> = {
  skeptical: {
    label: "Skeptical",
    line: "Resume toh sab ke paas hota hai, beta. Proof kahan hai?",
    subtitle: "Everyone has a resume, son. Where's the proof?",
    mood: "skeptical",
  },
  curious: { label: "Curious", line: "Hmm… ladka kuch toh jaanta hai.", subtitle: "Hmm… the boy does know a thing or two.", mood: "curious" },
  warming: {
    label: "Warming Up",
    line: "Accha! Har jawaab ke saath number aur scope bhi?",
    subtitle: "Oh! Numbers and scope with every single answer?",
    mood: "pleased",
  },
  impressed: { label: "Impressed", line: "Beta, ab toh Papa bhi fan ho gaye!", subtitle: "Son, now even Papa has become a fan!", mood: "impressed" },
};

/** Papa's face while delivering his JSON reaction line, per outcome. */
export const REACTION_MOOD: Record<AttackOutcome, PapaMood> = {
  proven: "impressed",
  partial: "impressed",
  learning: "curious",
};

export const OUTCOME_COPY: Record<AttackOutcome, { label: string; chip: string; tone: string }> = {
  proven: { label: "Proven", chip: "Full defense · no heart lost", tone: "border-emerald-400 bg-emerald-950 text-emerald-300" },
  partial: { label: "Partial", chip: "Real power, narrower claim · no heart lost", tone: "border-amber-400 bg-amber-950 text-amber-300" },
  learning: { label: "Learning", chip: "Shivam noted it down! · −1 heart, once", tone: "border-rose-400 bg-rose-950 text-rose-300" },
};
