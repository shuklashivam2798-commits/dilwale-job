// Static story copy for the opening cinematic + journey select (from the master spec §2/§3).
// Lives in the bundle so the intro plays even when the backend is unavailable.
import type { JourneyId } from "@/lib/gameEngine";

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
      "Strong moves unlock proof spotlights and seals",
    ],
  },
};

export const OTHER_JOURNEY: Record<JourneyId, JourneyId> = { father: "shivam", shivam: "father" };
