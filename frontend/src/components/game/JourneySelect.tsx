import { motion } from "motion/react";
import { Check, RotateCcw, Swords, HelpCircle } from "lucide-react";
import { useGame } from "@/hooks/useGame";
import type { JourneyId, JourneyProgress } from "@/lib/gameEngine";
import { JOURNEYS } from "@/lib/script";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MissGrowthSprite, PapaSprite, ShivamSprite } from "@/components/game/Sprites";
import { Sparkles } from "@/components/game/StageFx";

const CARD_THEME: Record<JourneyId, { surface: string; border: string; accent: string; badge: string; cta: string }> = {
  father: {
    surface: "bg-[#220D1A]",
    border: "border-[#BE185D]",
    accent: "text-papa",
    badge: "bg-[#9F1239] text-rose-100",
    cta: "bg-papa text-white hover:bg-rose-400 shadow-[4px_4px_0_#4C0519]",
  },
  shivam: {
    surface: "bg-[#0E1A38]",
    border: "border-[#2563EB]",
    accent: "text-hero",
    badge: "bg-[#1E40AF] text-sky-100",
    cta: "bg-hero text-night hover:bg-sky-300 shadow-[4px_4px_0_#172554]",
  },
};

function startedLabel(p: JourneyProgress): string | null {
  const touched = p.resolvedKeys.length + p.heartLossKeys.length + p.spotlightsViewed.length + p.journal.length;
  if (!touched) return null;
  return `In progress · ${p.badges.length}/3 seals · ${p.hearts} hearts`;
}

function PathCard({ journey, index }: { journey: JourneyId; index: number }) {
  const { state, dispatch, sfx } = useGame();
  const copy = JOURNEYS[journey];
  const theme = CARD_THEME[journey];
  const started = startedLabel(state.progress[journey]);
  const choose = () => {
    sfx("confirm");
    dispatch({ type: "SELECT_JOURNEY", journey });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.12, ease: "easeOut" }}
      whileHover={{ y: -6 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-sm border-[3px] p-5 shadow-[8px_8px_0_rgba(0,0,0,0.55)] sm:p-6",
        theme.surface,
        theme.border,
      )}
      data-testid={`journey-card-${journey}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn("rounded-sm px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest", theme.badge)}>
          {copy.badge}
        </span>
        {started && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-gold-soft" data-testid={`journey-card-${journey}-progress`}>
            {started}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end gap-4">
        <div className="h-36 w-24 shrink-0 sm:h-44 sm:w-28">
          {journey === "father" ? <PapaSprite className="h-full w-full" /> : <ShivamSprite className="h-full w-full" />}
        </div>
        <div className="pb-2">
          <p className={cn("font-mono text-[11px] font-semibold uppercase tracking-widest", theme.accent)}>
            Play as {copy.playAs}
          </p>
          <h3 className="mt-1 font-heading text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-4xl">
            {copy.title}
          </h3>
          <p className="mt-2 flex items-center gap-1.5 font-heading text-base font-bold text-white/90">
            {journey === "father" ? <HelpCircle className={cn("size-4", theme.accent)} /> : <Swords className={cn("size-4", theme.accent)} />}
            {copy.mechanic}
          </p>
        </div>
      </div>

      <p className="mt-4 text-base leading-relaxed text-white/85">{copy.pitch}</p>
      <ul className="mt-4 space-y-2">
        {copy.bullets.map((b) => (
          <li key={b} className="flex gap-2 text-sm text-white/80">
            <Check className={cn("mt-0.5 size-4 shrink-0", theme.accent)} />
            {b}
          </li>
        ))}
      </ul>

      <Button
        onClick={choose}
        className={cn(
          "mt-6 h-auto min-h-12 whitespace-normal rounded-sm px-4 py-3 text-left font-heading text-base font-bold uppercase leading-tight tracking-wide transition-[transform,box-shadow,background-color] duration-150 hover:-translate-y-0.5 active:translate-y-0.5",
          theme.cta,
        )}
        data-testid={`journey-select-${journey}-button`}
      >
        {copy.cta}
      </Button>
    </motion.article>
  );
}

export function JourneySelect() {
  const { dispatch, sfx } = useGame();
  return (
    <main className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-8" data-testid="journey-select-screen">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-magenta">Freeze frame → Battle arena</p>
          <h2 className="mt-2 font-heading text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-6xl">
            Choose your <span className="text-glow-gold text-gold">path</span>
          </h2>
          <p className="mt-3 max-w-lg text-base text-violet-200">
            Same boy. Same CV. Two ways to put him to the test — and both end at Miss Growth's door.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            sfx("select");
            dispatch({ type: "START_INTRO" });
          }}
          className="h-10 rounded-sm border-violet-400/50 bg-transparent font-mono text-[11px] font-semibold uppercase tracking-widest text-violet-100 hover:bg-violet-900/50"
          data-testid="journey-replay-intro-button"
        >
          <RotateCcw className="size-3.5" /> Replay Intro
        </Button>
      </div>

      <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[1fr_200px_1fr]">
        <PathCard journey="father" index={0} />

        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative order-first flex items-center gap-4 overflow-hidden rounded-sm border border-gold/30 bg-panel/60 p-4 lg:order-none lg:flex-col lg:justify-center lg:border-0 lg:bg-transparent"
          data-testid="journey-miss-growth-panel"
        >
          <Sparkles count={8} />
          <div className="h-28 w-20 shrink-0 lg:h-56 lg:w-40">
            <MissGrowthSprite className="h-full w-full" />
          </div>
          <div className="lg:text-center">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-gold">The prize</p>
            <p className="font-heading text-lg font-black uppercase text-white">Miss Growth</p>
            <p className="mt-1 text-xs leading-relaxed text-violet-200">
              She is watching. A surprise challenge waits at the end of either path.
            </p>
          </div>
        </motion.aside>

        <PathCard journey="shivam" index={1} />
      </div>
    </main>
  );
}
