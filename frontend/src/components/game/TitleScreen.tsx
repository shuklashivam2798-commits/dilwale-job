import type { ReactElement } from "react";
import { motion, type TargetAndTransition, type Transition } from "motion/react";
import { Play, FastForward, ArrowRight } from "lucide-react";
import { useGame } from "@/hooks/useGame";
import { JOURNEYS } from "@/lib/script";
import { Button } from "@/components/ui/button";
import { MuteToggle } from "@/components/game/HudBits";
import { MissGrowthSprite, PapaSprite, ShivamSprite } from "@/components/game/Sprites";
import { Sparkles } from "@/components/game/StageFx";

// Static motion configs.
const COPY_INITIAL: TargetAndTransition = { opacity: 0, y: 24 };
const COPY_ANIMATE: TargetAndTransition = { opacity: 1, y: 0 };
const COPY_TRANSITION: Transition = { duration: 0.6, ease: "easeOut" };
const STAGE_INITIAL: TargetAndTransition = { opacity: 0, scale: 0.96 };
const STAGE_ANIMATE: TargetAndTransition = { opacity: 1, scale: 1 };
const STAGE_TRANSITION: Transition = { duration: 0.7, delay: 0.15, ease: "easeOut" };

const PRIMARY_CTA =
  "h-12 rounded-sm px-6 font-heading text-base font-bold uppercase tracking-wide shadow-[4px_4px_0_#7C2D12] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#7C2D12] active:translate-y-0.5 active:shadow-[2px_2px_0_#7C2D12]";

export function TitleScreen(): ReactElement {
  return (
    <main className="relative min-h-dvh overflow-hidden" data-testid="title-screen">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(139,92,246,0.35),transparent_55%),radial-gradient(ellipse_at_85%_70%,rgba(236,72,153,0.28),transparent_55%),radial-gradient(ellipse_at_60%_10%,rgba(245,158,11,0.18),transparent_45%)]"
      />
      <div aria-hidden className="scanlines absolute inset-0" />
      <Sparkles count={18} />
      <div className="absolute right-4 top-4 z-20 sm:right-8 sm:top-6">
        <MuteToggle />
      </div>

      <div className="relative z-10 mx-auto grid min-h-dvh max-w-7xl items-center gap-10 px-5 py-20 sm:px-10 lg:grid-cols-[1.05fr_1fr]">
        <motion.section initial={COPY_INITIAL} animate={COPY_ANIMATE} transition={COPY_TRANSITION} className="max-w-xl">
          <p className="mb-5 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-magenta">An original 16-bit Bollywood RPG</p>
          <TitleMarquee />
          <p className="mt-7 font-heading text-xl font-bold italic text-gold-soft sm:text-2xl" data-testid="game-tagline">
            A finite challenge. An infinite learner.
          </p>
          <p className="mt-3 max-w-md text-base leading-relaxed text-violet-200">
            Shivam wants his dream growth role. Recruiter Papa wants proof. And Miss Growth? She makes the final decision.
          </p>
          <TitleActions />
          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-violet-300/80">Sound is off by default · Enter to start</p>
        </motion.section>
        <CastStage />
      </div>

      <footer className="absolute inset-x-0 bottom-0 z-10 px-5 pb-4 sm:px-10">
        <p className="max-w-7xl font-mono text-[10px] uppercase tracking-widest text-violet-300/70" data-testid="title-disclaimer">
          A fictional game made for a Wispr Flow India growth team application · Not a real hiring decision
        </p>
      </footer>
    </main>
  );
}

function MarqueeBulbs({ offset = 0 }: { offset?: number }): ReactElement {
  return (
    <div aria-hidden className="flex justify-between px-1">
      {Array.from({ length: 14 }, (_, i) => (
        <span
          key={i}
          className="size-2 animate-bulbs rounded-full bg-gold-soft shadow-[0_0_8px_#FDE047]"
          style={{ animationDelay: `${((i + offset) % 2) * 0.6}s` }}
        />
      ))}
    </div>
  );
}

function TitleMarquee(): ReactElement {
  return (
    <div className="pixel-frame relative inline-block rounded-sm bg-panel/90 px-6 py-4 sm:px-8">
      <MarqueeBulbs />
      <h1 className="my-3 font-heading text-5xl font-black uppercase leading-[0.88] tracking-tight text-white sm:text-7xl" data-testid="game-title">
        Dilwale
        <br />
        <span className="text-glow-gold text-gold">Job</span> Le
        <br />
        <span className="text-glow-magenta text-magenta">Jayenge</span>
      </h1>
      <MarqueeBulbs offset={1} />
    </div>
  );
}

function TitleActions(): ReactElement {
  const { state, dispatch, sfx } = useGame();
  const savedJourney = state.journey;
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <Button
        autoFocus
        size="lg"
        onClick={() => {
          sfx("confirm");
          dispatch({ type: "START_INTRO" });
        }}
        className={PRIMARY_CTA}
        data-testid="title-start-button"
      >
        <Play className="size-4 fill-current" /> Start the Story
      </Button>
      {state.introSeen && (
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            sfx("select");
            dispatch({ type: "GO_SELECT" });
          }}
          className="h-12 rounded-sm border-violet-400/50 bg-transparent px-5 font-heading font-bold uppercase tracking-wide text-violet-100 hover:bg-violet-900/50"
          data-testid="title-skip-to-select-button"
        >
          <FastForward className="size-4" /> Choose Path
        </Button>
      )}
      {savedJourney && (
        <Button
          variant="ghost"
          size="lg"
          onClick={() => {
            sfx("confirm");
            dispatch({ type: "SELECT_JOURNEY", journey: savedJourney });
          }}
          className="h-12 rounded-sm px-4 font-heading font-bold uppercase tracking-wide text-gold hover:bg-gold/10 hover:text-gold-soft"
          data-testid="title-continue-journey-button"
        >
          Continue {JOURNEYS[savedJourney].title} <ArrowRight className="size-4" />
        </Button>
      )}
    </div>
  );
}

function CastStage(): ReactElement {
  return (
    <motion.div
      initial={STAGE_INITIAL}
      animate={STAGE_ANIMATE}
      transition={STAGE_TRANSITION}
      className="relative mx-auto h-[340px] w-full max-w-[520px] sm:h-[440px]"
      aria-label="Cast: Recruiter Papa, Miss Growth and Shivam"
    >
      <div className="stage-floor absolute inset-x-0 bottom-0 h-24 rounded-sm" />
      <div className="absolute bottom-6 left-1/2 h-[78%] w-[42%] -translate-x-1/2">
        <MissGrowthSprite className="h-full w-full" data-testid="title-sprite-miss-growth" />
      </div>
      <div className="absolute bottom-4 left-0 h-[66%] w-[36%]">
        <PapaSprite className="h-full w-full" data-testid="title-sprite-papa" />
      </div>
      <div className="absolute bottom-4 right-0 h-[66%] w-[36%]">
        <ShivamSprite className="h-full w-full" data-testid="title-sprite-shivam" />
      </div>
      <CastPlate className="left-0" name="Recruiter Papa" tone="text-papa" />
      <CastPlate className="left-1/2 -translate-x-1/2" name="Miss Growth" tone="text-gold-soft" />
      <CastPlate className="right-0" name="Shivam" tone="text-hero" />
    </motion.div>
  );
}

function CastPlate({ name, tone, className }: { name: string; tone: string; className: string }): ReactElement {
  return (
    <span
      className={`absolute -bottom-3 ${className} rounded-sm border border-violet-500/40 bg-night/90 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest ${tone}`}
    >
      {name}
    </span>
  );
}
