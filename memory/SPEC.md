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

## Planned next steps (NOT built yet)
Father arenas (9 question attacks, Scanning Resume Powers, Proven/Partial/Learning, Show Me Proof / Not Convinced Yet / Continue, spotlights), Shivam monster battles (hero_moves, setbacks, retry, seals), Miss Growth finale (3 audience choices, RISHTA SHORTLISTED + fictional disclaimer), Behind the Build voice slots, personal links.

## Architecture
- Backend: `GET /api/game` (full GameEngine), `GET /api/game/attacks/{id}` (404 if unknown), `GET /api/game/arenas/{id}`, `GET /api/game/powers`. Models `backend/models/game.py` ↔ TS `frontend/src/lib/types.ts`. No DB use, no auth.
- `personal_links` in engine.json hold placeholders; backend returns `null` for anything not an http(s) URL → UI hides the buttons. Edit engine.json to add real URLs.
- Game state: pure reducer `frontend/src/lib/gameEngine.ts`; persisted by `lib/storage.ts` to localStorage key `dilwale-job-le-jayenge:v1`, in-memory fallback if storage unavailable. Provider `lib/game-store.tsx`.
- State: `phase` (title|intro|select|journey), `journey`, `introSeen`, `muted`, `progress.{father,shivam}` each with hearts (start 3), heartLossKeys (dedupe — same key never costs twice), resolvedKeys, spotlightsViewed, badges, journal[], comebacks, comebackPending, finaleChoice.
- Single route `*` → `pages/Game.tsx`; screens are phases (survive refresh).

## Auth
None. No accounts.
