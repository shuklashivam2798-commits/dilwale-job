import { useCallback, useState, type ReactElement } from "react";
import { motion, type TargetAndTransition, type Transition } from "motion/react";
import { ChevronRight, ExternalLink, FlaskConical, Gauge, NotebookPen, Repeat, RotateCcw, ShieldAlert, Target, Users } from "lucide-react";
import { useGame } from "@/hooks/useGame";
import { useGameData } from "@/hooks/useGameData";
import { JOURNEYS, OTHER_JOURNEY } from "@/lib/script";
import type { Finale, FinaleChoice, GameEngine, PersonalLinks } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MissGrowthSprite, PapaSprite, ShivamSprite, type PapaMood } from "@/components/game/Sprites";
import { Confetti, Sparkles } from "@/components/game/StageFx";
import { Subtitle } from "@/components/game/Subtitle";
import { Typewriter } from "@/components/game/Typewriter";

type FinaleStep = "setup" | "daughter" | "question" | "choice" | "ending";

const STAMP_INITIAL: TargetAndTransition = { scale: 2.4, opacity: 0, rotate: -16 };
const STAMP_ANIMATE: TargetAndTransition = { scale: 1, opacity: 1, rotate: -4 };
const STAMP_TRANSITION: Transition = { type: "spring", stiffness: 220, damping: 13, delay: 0.3 };
const RISE_INITIAL: TargetAndTransition = { opacity: 0, y: 16 };
const RISE_ANIMATE: TargetAndTransition = { opacity: 1, y: 0 };

/** Text inside the outermost single quotes of a JSON line like "Papa: '...'" (whole string if none). */
function quoteOf(line: string): string {
  const start = line.indexOf("'");
  const end = line.lastIndexOf("'");
  return start >= 0 && end > start ? line.slice(start + 1, end) : line;
}

/** "RISHTA SHORTLISTED! — Fictional game achievement, ... decision. A finite..." → headline + disclaimer sentence. */
function splitEnding(endingScreen: string): { headline: string; disclaimer: string } {
  const [headline, rest = ""] = endingScreen.split(" — ");
  const disclaimer = rest.split(". ")[0];
  return { headline, disclaimer: disclaimer ? `${disclaimer.replace(/\.$/, "")}.` : "" };
}

const PAPA_MOOD: Record<FinaleStep, PapaMood> = {
  setup: "pleased",
  daughter: "curious",
  question: "curious",
  choice: "curious",
  ending: "impressed",
};

/** Miss Growth's surprise final challenge + the Bollywood ending. Reached from either journey. */
export function FinaleScreen({ onOpenJournal }: { onOpenJournal: () => void }): ReactElement {
  const { state, progress, dispatch, sfx } = useGame();
  const { data: engine } = useGameData();
  const [step, setStep] = useState<FinaleStep>(progress?.finaleChoice ? "ending" : "setup");
  const [selected, setSelected] = useState<string | null>(progress?.finaleChoice ?? null);

  if (!engine || !progress || !state.journey) {
    return <main className="mx-auto mt-10 h-64 max-w-5xl animate-pulse rounded-sm bg-panel" data-testid="finale-screen" />;
  }
  const finale = engine.finale;
  const choice = finale.choices.find((c) => c.id === selected) ?? null;
  const go = (next: FinaleStep) => {
    sfx("select");
    setStep(next);
  };
  const pick = (c: FinaleChoice) => {
    sfx("select");
    setSelected(c.id);
    setStep("choice");
  };
  const lockIn = () => {
    if (!choice) return;
    sfx("sparkle");
    dispatch({ type: "CHOOSE_FINALE", choiceId: choice.id });
    setStep("ending");
  };

  return (
    <main className="relative mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-8" data-testid="finale-screen" data-step={step}>
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-magenta">Grand Finale · {JOURNEYS[state.journey].title}</p>
      <h2 className="mt-2 font-heading text-4xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl">
        Miss Growth's <span className="text-glow-gold text-gold">surprise challenge</span>
      </h2>
      <FinaleStage step={step} />
      <div className="mt-6">
        <FinaleStepView
          step={step}
          finale={finale}
          choice={choice}
          engine={engine}
          journalCount={progress.journal.length}
          onNext={go}
          onPick={pick}
          onLockIn={lockIn}
          onOpenJournal={onOpenJournal}
          onReplayOther={() => {
            sfx("confirm");
            dispatch({ type: "SELECT_JOURNEY", journey: OTHER_JOURNEY[state.journey!] });
          }}
          otherTitle={JOURNEYS[OTHER_JOURNEY[state.journey]].title}
        />
      </div>
    </main>
  );
}

function FinaleStage({ step }: { step: FinaleStep }): ReactElement {
  const ending = step === "ending";
  return (
    <div className="relative mt-6 h-[clamp(240px,40vh,380px)] overflow-hidden rounded-sm border-2 border-gold/60" data-testid="finale-stage">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(245,158,11,0.4),transparent_60%),linear-gradient(to_bottom,#2A0F3D,#0D0714)]" />
      <div aria-hidden className="stage-floor absolute inset-x-0 bottom-0 h-14" />
      <Sparkles count={ending ? 20 : 10} />
      {ending && <Confetti />}
      <div className="absolute bottom-4 left-[5%] h-[66%] w-[24%] max-w-[170px]">
        <PapaSprite mood={PAPA_MOOD[step]} className="h-full w-full" data-testid="finale-papa-sprite" />
      </div>
      <div className="absolute bottom-5 left-1/2 h-[86%] w-[34%] max-w-[250px] -translate-x-1/2">
        <MissGrowthSprite className="h-full w-full" data-testid="finale-miss-growth-sprite" />
      </div>
      <div className="absolute bottom-4 right-[5%] h-[66%] w-[24%] max-w-[170px]">
        <ShivamSprite className="h-full w-full" data-testid="finale-shivam-sprite" />
      </div>
    </div>
  );
}

interface FinaleStepViewProps {
  step: FinaleStep;
  finale: Finale;
  choice: FinaleChoice | null;
  engine: GameEngine;
  journalCount: number;
  onNext: (step: FinaleStep) => void;
  onPick: (choice: FinaleChoice) => void;
  onLockIn: () => void;
  onOpenJournal: () => void;
  onReplayOther: () => void;
  otherTitle: string;
}

function FinaleStepView(props: FinaleStepViewProps): ReactElement {
  const { step, finale, choice, onNext, onPick } = props;
  switch (step) {
    case "setup":
      return (
        <DialogueLine
          key="setup"
          speaker="Recruiter Papa"
          tone="bg-papa text-white"
          line={quoteOf(finale.setup)}
          subtitle={finale.setup_en}
          cta="Continue"
          onNext={() => onNext("daughter")}
        />
      );
    case "daughter":
      return (
        <DialogueLine
          key="daughter"
          speaker="Miss Growth"
          tone="bg-magenta text-white"
          line={quoteOf(finale.daughter_entry)}
          subtitle={finale.daughter_entry_en}
          cta="Hear her challenge"
          onNext={() => onNext("question")}
        />
      );
    case "question":
      return <QuestionView finale={finale} onPick={onPick} />;
    case "choice":
      return choice ? <ChoiceView choice={choice} onLockIn={props.onLockIn} onBack={() => onNext("question")} /> : <QuestionView finale={finale} onPick={onPick} />;
    case "ending":
      return <EndingView {...props} />;
  }
}

interface DialogueLineProps {
  speaker: string;
  tone: string;
  line: string;
  subtitle: string | null;
  cta: string;
  onNext: () => void;
}

function DialogueLine({ speaker, tone, line, subtitle, cta, onNext }: DialogueLineProps): ReactElement {
  const [typed, setTyped] = useState(false);
  const markTyped = useCallback(() => setTyped(true), []);
  return (
    <section className="pixel-frame relative rounded-sm bg-dialog px-5 pb-5 pt-6 sm:px-7" aria-live="polite" data-testid="finale-dialogue">
      <span className={cn("absolute -top-3 left-6 rounded-sm px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest shadow-[3px_3px_0_#0D0714]", tone)} data-testid="finale-speaker">
        {speaker}
      </span>
      <p className="font-heading text-lg font-bold leading-snug text-white sm:text-2xl">
        <Typewriter key={line} text={line} complete={false} onDone={markTyped} speed={20} data-testid="finale-line" />
      </p>
      <Subtitle text={subtitle} visible={typed} data-testid="finale-line-subtitle" />
      <div className="mt-4 flex justify-end">
        <Button onClick={onNext} className="h-10 rounded-sm px-4 font-heading font-bold uppercase shadow-[3px_3px_0_#7C2D12]" data-testid="finale-next-button">
          {cta} <ChevronRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}

const CHOICE_ICON: Record<string, ReactElement> = {
  creators: <Users className="size-6 text-magenta" />,
  students: <NotebookPen className="size-6 text-cyanx" />,
  founders: <Target className="size-6 text-gold" />,
};

function QuestionView({ finale, onPick }: { finale: Finale; onPick: (c: FinaleChoice) => void }): ReactElement {
  return (
    <section data-testid="finale-question">
      <div className="pixel-frame relative rounded-sm bg-dialog px-5 pb-5 pt-6 sm:px-7">
        <span className="absolute -top-3 left-6 rounded-sm bg-magenta px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-widest text-white shadow-[3px_3px_0_#0D0714]">
          Miss Growth
        </span>
        <p className="font-heading text-lg font-bold leading-snug text-white sm:text-2xl" data-testid="finale-question-text">
          {finale.question}
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {finale.choices.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c)}
            className="flex flex-col rounded-sm border-[3px] border-magenta/70 bg-[#2A0F3D] p-5 text-left shadow-[6px_6px_0_rgba(0,0,0,0.55)] transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-gold"
            data-testid={`finale-choice-${c.id}`}
          >
            {CHOICE_ICON[c.id] ?? <Users className="size-6 text-magenta" />}
            <span className="mt-3 font-heading text-xl font-black uppercase tracking-tight text-white">{c.label}</span>
            <span className="mt-2 text-sm leading-relaxed text-violet-100">{c.hypothesis}</span>
            <span className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-widest text-gold">Test this audience first →</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ChoiceView({ choice, onLockIn, onBack }: { choice: FinaleChoice; onLockIn: () => void; onBack: () => void }): ReactElement {
  const tiles = [
    { id: "hypothesis", label: "Hypothesis", value: choice.hypothesis, icon: <FlaskConical className="size-4 text-magenta" /> },
    { id: "pilot", label: "Controlled pilot", value: choice.pilot, icon: <Target className="size-4 text-gold" /> },
    { id: "measure", label: "Activation, retention & cost metrics", value: choice.measure, icon: <Gauge className="size-4 text-cyanx" /> },
    { id: "risk", label: "Risk to watch", value: choice.risk, icon: <ShieldAlert className="size-4 text-papa" /> },
  ];
  return (
    <motion.section initial={RISE_INITIAL} animate={RISE_ANIMATE} className="rounded-sm border-2 border-gold/60 bg-panel p-5 sm:p-6" data-testid="finale-choice-detail" data-choice={choice.id}>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">Shivam's first experiment</p>
      <h3 className="mt-1 font-heading text-3xl font-black uppercase tracking-tight text-white">{choice.label}</h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {tiles.map((t) => (
          <div key={t.id} className="rounded-sm border border-violet-500/30 bg-night/70 p-4" data-testid={`finale-choice-${t.id}`}>
            <dt className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-violet-300">
              {t.icon} {t.label}
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-white">{t.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs italic text-violet-300" data-testid="finale-choice-caveat">
        An untested hypothesis to learn from quickly — not a validated Wispr Flow result.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={onLockIn} className="h-11 rounded-sm bg-magenta px-5 font-heading font-bold uppercase text-white shadow-[4px_4px_0_#4C0519] hover:bg-pink-400" data-testid="finale-lock-in-button">
          Lock in this experiment
        </Button>
        <Button variant="outline" onClick={onBack} className="h-11 rounded-sm border-violet-400/50 bg-transparent px-5 font-heading font-bold uppercase text-violet-100 hover:bg-violet-900/50" data-testid="finale-pick-another-button">
          Pick another audience
        </Button>
      </div>
    </motion.section>
  );
}

const LINK_LABELS: Array<[keyof PersonalLinks, string]> = [
  ["cv_url", "View Latest CV"],
  ["linkedin_url", "Connect on LinkedIn"],
  ["contact_url", "Get in Touch"],
];

function EndingView({ finale, choice, engine, journalCount, onNext, onOpenJournal, onReplayOther, otherTitle }: FinaleStepViewProps): ReactElement {
  const { headline, disclaimer } = splitEnding(finale.ending_screen);
  const links = LINK_LABELS.filter(([key]) => Boolean(engine.personal_links[key]));
  return (
    <section className="space-y-5" data-testid="finale-ending">
      <div className="relative rounded-sm border-2 border-papa/70 bg-[#220D1A] px-5 pb-4 pt-6">
        <span className="absolute -top-3 left-5 rounded-sm bg-papa px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white">Recruiter Papa</span>
        <p className="font-heading text-lg font-bold text-white" data-testid="finale-ending-papa">“{quoteOf(finale.ending_papa)}”</p>
        <Subtitle text={finale.ending_papa_en} className="text-rose-200/80" data-testid="finale-ending-papa-subtitle" />
      </div>
      <div className="relative rounded-sm border-2 border-magenta/70 bg-[#2A0F3D] px-5 pb-4 pt-6">
        <span className="absolute -top-3 left-5 rounded-sm bg-magenta px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-white">Miss Growth</span>
        <p className="font-heading text-xl font-bold text-white" data-testid="finale-ending-daughter">“{quoteOf(finale.ending_daughter)}”</p>
        <Subtitle text={finale.ending_daughter_en} data-testid="finale-ending-daughter-subtitle" />
      </div>

      <div className="flex flex-col items-center py-4 text-center">
        <motion.p
          initial={STAMP_INITIAL}
          animate={STAMP_ANIMATE}
          transition={STAMP_TRANSITION}
          className="text-glow-gold border-[5px] border-gold bg-night px-6 py-3 font-heading text-4xl font-black uppercase tracking-tight text-gold shadow-[8px_8px_0_#7C2D12] sm:text-6xl"
          data-testid="finale-rishta-shortlisted"
        >
          {headline}
        </motion.p>
        <p className="mt-6 font-heading text-xl font-bold italic text-gold-soft sm:text-2xl" data-testid="finale-tagline">
          A finite challenge. An infinite learner.
        </p>
        {choice && (
          <p className="mt-2 text-sm text-violet-200" data-testid="finale-chosen-audience">
            First experiment locked in: <span className="font-semibold text-white">{choice.label}</span>
          </p>
        )}
        <p className="mt-3 max-w-md font-mono text-[10px] uppercase tracking-widest text-violet-300" data-testid="finale-disclaimer">
          {disclaimer}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onReplayOther} className="h-11 rounded-sm px-5 font-heading font-bold uppercase shadow-[4px_4px_0_#7C2D12]" data-testid="finale-replay-other-button">
          <Repeat className="size-4" /> Replay as the Other Character ({otherTitle})
        </Button>
        <Button variant="outline" onClick={() => onNext("question")} className="h-11 rounded-sm border-violet-400/50 bg-transparent px-5 font-heading font-bold uppercase text-violet-100 hover:bg-violet-900/50" data-testid="finale-try-another-audience-button">
          <RotateCcw className="size-4" /> Try another audience
        </Button>
        <Button variant="ghost" onClick={onOpenJournal} className="h-11 rounded-sm px-5 font-heading font-bold uppercase text-magenta hover:bg-magenta/10" data-testid="finale-open-journal-button">
          <NotebookPen className="size-4" /> Learning Journal ({journalCount})
        </Button>
        {links.map(([key, label]) => (
          <Button key={key} variant="outline" className="h-11 rounded-sm border-gold/60 bg-transparent px-5 font-heading font-bold uppercase text-gold hover:bg-gold/10" data-testid={`finale-link-${key}`} render={<a href={engine.personal_links[key] ?? undefined} target="_blank" rel="noreferrer" />}>
            {label} <ExternalLink className="size-4" />
          </Button>
        ))}
      </div>
    </section>
  );
}
