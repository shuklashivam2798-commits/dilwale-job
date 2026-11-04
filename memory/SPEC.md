# Dilwale Job Le Jayenge — living spec

Bollywood-inspired 16-bit recruitment RPG for Shivam's Wispr Flow India growth-team application.
Source of truth: `memory/source/master.md` (master spec v3.0) + `backend/data/engine.json` (CV-confirmed attack engine, copy of `memory/source/engine.json`).
Characters: **Shivam** (hero/candidate), **Recruiter Papa** (skeptical father), **Miss Growth** (dream role, final decision-maker). User confirmed the name "Miss Growth".

## Built so far (Step 1 — foundation)
- **Title screen** → "Start the Story" → **Opening cinematic** (4 beats, typewriter, auto-advance ~19s, Next / Replay / Skip Intro, Space/Enter advance, Esc skip, freeze frame) → **Choose your path** screen.
- Path buttons: "Become Recruiter Papa — Test the Boy" (Father's Journey, Question Attacks) and "Become Shivam — Fight for the Role" (Shivam's Journey, Strategy Card Battles).
- **Journey hub** (placeholder per path): rule text from JSON, stats (hearts, seals, resolved, journal), 3 locked arena cards from `/api/game` (Father: attack IDs/names; Shivam: hero_problem), Miss Growth finale teaser (locked), switch journey, restart journey.
- **HUD**: hearts, Resume Power Vault drawer (21 cards, filter by achievement type, tap to expand), Learning Journal drawer (per journey, empty state), mute toggle (default muted, Web Audio blips only on user action), menu (replay intro, choose path, switch journey, restart journey, restart whole game with confirm dialog).
- **Comeback dialog** "Hero abhi haara nahi hai!" wired to engine (fires when hearts would reach 0).

## User decisions
- Do NOT show the 4 optional origin/cast intro cards anywhere — the recruiter experience must start fast; Shivam's story is discovered through gameplay. (`optional_origin_cards` stays in the API data only.)
- Build order: foundation (done) → Father's Arenas → Monster Battles → Miss Growth's Finale, one step at a time.

## Phase 2 — Father's Journey (built, fully playable)
- Hub → "Enter Arena" (all 3 arenas open, any order) → ArenaScreen: situation, Papa Mood Meter, 3 attack cards (Launch / Replay Attack).
- AttackBattle (full-screen overlay): Papa (angry) types the exact JSON question → "?" projectile hits Shivam → "Scanning Shivam's Resume Powers..." sweeps all 21 vault tiles → locks on `proof.related_powers` (or none) → result. "Skip to answer" jumps straight to result.
- Result: Proven = "Shivam used Resume Raksha!" + "Shivam used [power] from his resume!" + answer + Actual achievement (evidence). Partial (O2) = same + "What this experience proves" vs "What it does not mean". Learning (G3, I3, O3) = "Resume Power Not Found" + limitation + honest transferable skills + Infinite Learner plan (JSON `learning`). Papa reaction = exact JSON `papa` line + face change.
- Buttons: Show Me Proof (personal contribution, key decisions, metric tiles, matching vault cards, source), Not Convinced Yet (precise boundary, supports/not-claimed, next experiment), Continue (back to arena).
- Arena completion: ≥1 attack resolved unlocks Proof Spotlight (arena `core_proof` + `spotlight_powers` vault cards); opening it earns the seal (Experimentation/Insight/Ownership). 3 seals → finale teaser says unlocked for next chapter.
- Papa mood: points proven 2 / partial 2 / learning 1 (max 15). Stages skeptical (0+), curious (2+), warming (6+), impressed (11+). PapaSprite moods: skeptical, angry, curious, pleased, impressed.
- Learning outcomes (G3, I3, O3) dispatch LOSE_HEART keyed by attack id (once per unique attack, repeats never drain) + journal entry {title "ID · name", note JSON `learning`}.
- `backend/data/engine.json` = user's JSON + derived fields only: English subtitle fields (`papa_en`, `finale.*_en`), `father_attacks[].proof` {contribution, decisions, metrics, related_powers, supports, not_claimed, transferable} (every line lifted from that attack's answer/evidence/limitation) and `arenas[].spotlight_powers`. Original untouched in memory/source/engine.json.

## Phase 3 — Hearts, Shivam's Journey, Finale (built)
- Hearts: start 3. Father learning attack or Shivam weak card → −1 once per unique key (`G3` / `growth:grow_blind`), journal note added. Reaching 0 → ComebackDialog "Hero abhi haara nahi hai!", hearts restored to 1, journal + losses kept (never softlocks).
- Shivam's Journey (`components/game/shivam/MonsterBattle.tsx`): per arena, business problem (`hero_problem`) + 3 strategy cards (`hero_moves`). Weak card: reaction + learning, heart once, "Try another card". Strong card: RESOLVE arena id, "Critical hit!", monster HP → 0, resume powers (spotlight_powers, TCS-first), then the same Proof Spotlight → seal.
- Shared arena UI in `components/game/ArenaParts.tsx` (SpotlightPanel, ArenaNav with "Meet Miss Growth", BackButton, ArenaFallback).
- Finale (phase "finale", `components/game/finale/FinaleScreen.tsx`): OPEN_FINALE only when the journey has 3 spotlights viewed. Steps: Papa setup line → Miss Growth entry → JSON question + 3 audience cards (Content Creators / Students / Startup Founders) → detail (hypothesis, controlled pilot, measure, risk + "untested hypothesis" caveat) → Lock in (CHOOSE_FINALE) → ending: Papa + Miss Growth ending lines, confetti, "RISHTA SHORTLISTED!", tagline, fictional disclaimer, Replay as the Other Character, Try another audience, Learning Journal. Personal link buttons render only for real URLs (currently none).
- Entry points to finale: hub finale card "Meet Miss Growth", arena nav button, spotlight dialog button (once 3 seals).

## English subtitles (built)
- Every Hinglish spoken line shows an italic English subtitle beneath it (shared `components/game/Subtitle.tsx`): cinematic beats (`CINEMATIC[].subtitle`), Papa mood-meter lines (`PAPA_STAGE_COPY[].subtitle`), the 9 Papa reaction lines (`father_attacks[].papa_en`), and finale dialogue (`finale.setup_en`, `daughter_entry_en`, `ending_papa_en`, `ending_daughter_en`). Finale typewriter lines fade their subtitle in once typing finishes.
- User decision: only spoken dialogue is translated — titles/buttons (e.g. "Hero abhi haara nahi hai!", "Notebook abhi khaali hai.") stay Hinglish.

## Planned next steps (NOT built yet)
Behind the Build voice slots (hero_moves, setbacks, retry, seals), Miss Growth finale (3 audience choices, RISHTA SHORTLISTED + fictional disclaimer), Behind the Build voice slots, personal links.

## Architecture
- Backend: `GET /api/game` (full GameEngine), `GET /api/game/attacks/{id}` (404 if unknown), `GET /api/game/arenas/{id}`, `GET /api/game/powers`. Models `backend/models/game.py` ↔ TS `frontend/src/lib/types.ts`. No DB use, no auth.
- `personal_links` in engine.json hold placeholders; backend returns `null` for anything not an http(s) URL → UI hides the buttons. Edit engine.json to add real URLs.
- Game state: pure reducer `frontend/src/lib/gameEngine.ts`; persisted by `lib/storage.ts` to localStorage key `dilwale-job-le-jayenge:v1`, in-memory fallback if storage unavailable. Provider `lib/game-store.tsx` (GameProvider only), context `lib/game-context.ts`, hook `hooks/useGame.ts`. Timed sequences live in hooks: `hooks/useCinematicSequence.ts` (beats, auto-advance, freeze, keyboard) and `hooks/useAttackSequence.ts` (launch → flight → scan → result; `toResult` records the outcome + plays sfx exactly once, also from "Skip to answer"). Dev-only `console.warn` in storage/sfx catch blocks.
- State: `phase` (title|intro|select|journey|finale), `journey`, `activeArena`, `introSeen`, `muted`, `progress.{father,shivam}` each with hearts (start 3), heartLossKeys (dedupe — same key never costs twice), resolvedKeys, attackOutcomes{id→proven|partial|learning}, spotlightsViewed, badges, journal[], comebacks, comebackPending, finaleChoice.
- Single route `*` → `pages/Game.tsx`; screens are phases (survive refresh).

## Auth
None. No accounts.
