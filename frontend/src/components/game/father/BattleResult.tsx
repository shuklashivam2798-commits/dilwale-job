import { useState, type ReactElement, type ReactNode } from "react";
import { AnimatePresence, motion, type TargetAndTransition, type Transition } from "motion/react";
import { ArrowRight, Check, FileSearch, NotebookPen, SearchX, ShieldCheck, ShieldHalf, X } from "lucide-react";
import { papaImpression, type AttackOutcome, type PapaStage } from "@/lib/gameEngine";
import { useGame } from "@/hooks/useGame";
import { OUTCOME_COPY, PAPA_STAGE_COPY } from "@/lib/script";
import type { FatherAttack, ResumePower } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PowerMiniCard } from "@/components/game/PowerMiniCard";

type Panel = "proof" | "scope";

// Static motion configs.
const BANNER_INITIAL: TargetAndTransition = { opacity: 0, scale: 0.92 };
const BANNER_ANIMATE: TargetAndTransition = { opacity: 1, scale: 1 };
const BANNER_TRANSITION: Transition = { type: "spring", stiffness: 240, damping: 18 };
const RISE_INITIAL: TargetAndTransition = { opacity: 0, y: 12 };
const RISE_ANIMATE: TargetAndTransition = { opacity: 1, y: 0 };
const REACTION_TRANSITION: Transition = { delay: 0.35 };
const PANEL_INITIAL: TargetAndTransition = { opacity: 0, y: 10 };
const PANEL_ANIMATE: TargetAndTransition = { opacity: 1, y: 0 };
const PANEL_EXIT: TargetAndTransition = { opacity: 0, y: 10 };
const NOTEBOOK_INITIAL: TargetAndTransition = { opacity: 0, rotate: -8, scale: 0.85 };
const NOTEBOOK_ANIMATE: TargetAndTransition = { opacity: 1, rotate: 0, scale: 1 };
const NOTEBOOK_TRANSITION: Transition = { type: "spring", stiffness: 220, damping: 16, delay: 0.25 };

interface OutcomeTheme {
  banner: string;
  icon: ReactElement;
  kicker: (vaultSize: number) => string;
}

const OUTCOME_THEME: Record<AttackOutcome, OutcomeTheme> = {
  proven: {
    banner: "border-emerald-400 bg-[#0A2A1E]",
    icon: <ShieldCheck className="size-9 text-emerald-300" />,
    kicker: () => "Shivam used Resume Raksha!",
  },
  partial: {
    banner: "border-amber-400 bg-[#2A1A08]",
    icon: <ShieldHalf className="size-9 text-amber-300" />,
    kicker: () => "Shivam used Resume Raksha! · Partial block",
  },
  learning: {
    banner: "border-rose-400 bg-[#2A0E1C]",
    icon: <SearchX className="size-9 text-rose-300" />,
    kicker: (vaultSize) => `Vault scanned · 0 of ${vaultSize} powers match`,
  },
};

interface BattleResultProps {
  attack: FatherAttack;
  powers: ResumePower[];
  vaultSize: number;
  stageBefore: PapaStage;
  onContinue: () => void;
}

/** Deterministic result view: banner, Shivam's answer, outcome evidence, Papa's reaction, proof/scope panels. */
export function BattleResult({ attack, powers, vaultSize, stageBefore, onContinue }: BattleResultProps): ReactElement {
  const { progress, sfx } = useGame();
  const [panel, setPanel] = useState<Panel | null>(null);
  const stageAfter = papaImpression(progress?.attackOutcomes ?? {}).stage;
  const toggle = (p: Panel) => {
    sfx("select");
    setPanel((cur) => (cur === p ? null : p));
  };

  return (
    <div className="space-y-6" data-testid="battle-result" data-outcome={attack.outcome}>
      <OutcomeBanner attack={attack} vaultSize={vaultSize} />
      <p className="border-l-4 border-papa pl-4 text-sm italic text-rose-100" data-testid="battle-question-recap">
        <span className="font-mono text-[10px] font-semibold not-italic uppercase tracking-widest text-papa">Papa asked · </span>“{attack.question}”
      </p>
      <section className="relative rounded-sm border-2 border-hero/70 bg-[#0E1A38] px-5 pb-4 pt-6" data-testid="battle-shivam-answer">
        <Plate tone="bg-hero text-night">Shivam</Plate>
        <p className="text-base leading-relaxed text-white sm:text-lg">{attack.answer}</p>
      </section>
      <OutcomeEvidence attack={attack} powers={powers} />
      <PapaReaction line={attack.papa} stageBefore={stageBefore} stageAfter={stageAfter} />
      <ResultActions panel={panel} onToggle={toggle} onContinue={onContinue} />
      <AnimatePresence mode="wait">
        {panel && (
          <motion.div key={panel} initial={PANEL_INITIAL} animate={PANEL_ANIMATE} exit={PANEL_EXIT}>
            {panel === "proof" ? <ProofPanel attack={attack} powers={powers} vaultSize={vaultSize} /> : <ScopePanel attack={attack} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Plate({ children, tone }: { children: ReactNode; tone: string }): ReactElement {
  return (
    <span className={cn("absolute -top-3 left-5 rounded-sm px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest shadow-[3px_3px_0_#0D0714]", tone)}>
      {children}
    </span>
  );
}

function OutcomeBanner({ attack, vaultSize }: { attack: FatherAttack; vaultSize: number }): ReactElement {
  const theme = OUTCOME_THEME[attack.outcome];
  const copy = OUTCOME_COPY[attack.outcome];
  return (
    <motion.section
      initial={BANNER_INITIAL}
      animate={BANNER_ANIMATE}
      transition={BANNER_TRANSITION}
      className={cn("relative overflow-hidden rounded-sm border-[3px] p-5 shadow-[6px_6px_0_rgba(0,0,0,0.55)]", theme.banner)}
      data-testid="battle-outcome-banner"
    >
      <div className="flex flex-wrap items-center gap-3">
        {theme.icon}
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80" data-testid="battle-outcome-kicker">
            {theme.kicker(vaultSize)}
          </p>
          <h3 className="mt-1 font-heading text-2xl font-black uppercase leading-tight tracking-tight text-white sm:text-3xl" data-testid="battle-power-used">
            {attack.power ? `Shivam used ${attack.power} from his resume!` : "Resume Power Not Found"}
          </h3>
        </div>
        <span className={cn("rounded-sm border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest", copy.tone)} data-testid="battle-outcome-chip">
          {copy.label} · {copy.chip}
        </span>
      </div>
    </motion.section>
  );
}

function OutcomeEvidence({ attack, powers }: { attack: FatherAttack; powers: ResumePower[] }): ReactElement | null {
  switch (attack.outcome) {
    case "proven":
      return <ProvenEvidence attack={attack} powers={powers} />;
    case "partial":
      return <PartialEvidence attack={attack} />;
    case "learning":
      return <LearningEvidence attack={attack} />;
    default:
      return null;
  }
}

function ProvenEvidence({ attack, powers }: { attack: FatherAttack; powers: ResumePower[] }): ReactElement | null {
  if (!attack.evidence) return null;
  return (
    <section className="relative rounded-sm border-2 border-emerald-500/60 bg-emerald-950/40 px-5 pb-4 pt-6" data-testid="battle-evidence">
      <Plate tone="bg-emerald-400 text-night">Actual achievement</Plate>
      <p className="font-heading text-base font-bold leading-relaxed text-emerald-100">{attack.evidence}</p>
      {powers.length > 0 && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-emerald-300">
          Vault match: {powers.map((p) => `${p.id} ${p.label}`).join(" · ")}
        </p>
      )}
    </section>
  );
}

function PartialEvidence({ attack }: { attack: FatherAttack }): ReactElement {
  return (
    <section className="space-y-3" data-testid="battle-partial-breakdown">
      {attack.evidence && (
        <div className="relative rounded-sm border-2 border-amber-500/60 bg-amber-950/30 px-5 pb-4 pt-6" data-testid="battle-evidence">
          <Plate tone="bg-amber-400 text-night">Actual achievement</Plate>
          <p className="font-heading text-base font-bold leading-relaxed text-amber-100">{attack.evidence}</p>
        </div>
      )}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-sm border-2 border-emerald-500/60 bg-emerald-950/40 p-4" data-testid="battle-partial-supports">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-300">What this experience proves</p>
          <CheckList items={attack.proof.supports} kind="yes" className="mt-2 space-y-2 text-white" />
        </div>
        <div className="rounded-sm border-2 border-rose-500/60 bg-rose-950/40 p-4" data-testid="battle-partial-not-claimed">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-rose-300">What it does not mean</p>
          <CheckList items={attack.proof.not_claimed} kind="no" className="mt-2 space-y-2 text-white" />
        </div>
      </div>
    </section>
  );
}

function LearningEvidence({ attack }: { attack: FatherAttack }): ReactElement {
  return (
    <section className="space-y-3" data-testid="battle-not-found">
      <div className="relative rounded-sm border-2 border-rose-500/60 bg-rose-950/30 px-5 pb-4 pt-6">
        <Plate tone="bg-rose-400 text-night">Resume power not found</Plate>
        <p className="text-sm leading-relaxed text-rose-100" data-testid="battle-limitation">{attack.limitation}</p>
      </div>
      <div className="rounded-sm border border-violet-500/40 bg-panel p-4" data-testid="battle-transferable">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-violet-300">Honest transferable skills</p>
        <SkillChips skills={attack.proof.transferable} />
      </div>
      <motion.div
        initial={NOTEBOOK_INITIAL}
        animate={NOTEBOOK_ANIMATE}
        transition={NOTEBOOK_TRANSITION}
        className="notebook-paper rounded-sm py-3 pl-12 pr-4 text-slate-800 shadow-[5px_5px_0_rgba(0,0,0,0.5)]"
        data-testid="battle-learning-plan"
      >
        <p className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase leading-7 tracking-widest text-rose-600">
          <NotebookPen className="size-4" /> Infinite Learner plan · saved to the Learning Journal
        </p>
        <p className="text-sm leading-7">{attack.learning}</p>
      </motion.div>
    </section>
  );
}

function CheckList({ items, kind, className }: { items: string[]; kind: "yes" | "no"; className?: string }): ReactElement {
  const Icon = kind === "yes" ? Check : X;
  const iconTone = kind === "yes" ? "text-emerald-300" : "text-rose-300";
  return (
    <ul className={className}>
      {items.map((s) => (
        <li key={s} className="flex gap-2 text-sm leading-relaxed">
          <Icon className={cn("mt-0.5 size-4 shrink-0", iconTone)} /> {s}
        </li>
      ))}
    </ul>
  );
}

function SkillChips({ skills }: { skills: string[] }): ReactElement {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {skills.map((t) => (
        <span key={t} className="rounded-sm border border-hero/50 bg-[#0E1A38] px-2 py-1 text-xs text-sky-100">
          {t}
        </span>
      ))}
    </div>
  );
}

function PapaReaction({ line, stageBefore, stageAfter }: { line: string; stageBefore: PapaStage; stageAfter: PapaStage }): ReactElement {
  const moodText =
    stageAfter !== stageBefore
      ? `Papa's mood up: ${PAPA_STAGE_COPY[stageBefore].label} → ${PAPA_STAGE_COPY[stageAfter].label}`
      : `Papa's mood: ${PAPA_STAGE_COPY[stageAfter].label}`;
  return (
    <motion.section
      initial={RISE_INITIAL}
      animate={RISE_ANIMATE}
      transition={REACTION_TRANSITION}
      className="relative rounded-sm border-2 border-papa/70 bg-[#220D1A] px-5 pb-4 pt-6"
      data-testid="battle-papa-reaction"
    >
      <Plate tone="bg-papa text-white">Recruiter Papa</Plate>
      <p className="font-heading text-lg font-bold leading-snug text-white sm:text-xl">“{line}”</p>
      <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-rose-300" data-testid="battle-papa-mood">
        {moodText}
      </p>
    </motion.section>
  );
}

function ResultActions({ panel, onToggle, onContinue }: { panel: Panel | null; onToggle: (p: Panel) => void; onContinue: () => void }): ReactElement {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() => onToggle("proof")}
        aria-expanded={panel === "proof"}
        className={cn("h-11 rounded-sm px-5 font-heading font-bold uppercase shadow-[4px_4px_0_#7C2D12]", panel === "proof" && "ring-2 ring-gold-soft")}
        data-testid="battle-show-proof-button"
      >
        <FileSearch className="size-4" /> Show Me Proof
      </Button>
      <Button
        variant="outline"
        onClick={() => onToggle("scope")}
        aria-expanded={panel === "scope"}
        className={cn(
          "h-11 rounded-sm border-papa/70 bg-transparent px-5 font-heading font-bold uppercase text-rose-100 hover:bg-papa/20",
          panel === "scope" && "bg-papa/20",
        )}
        data-testid="battle-not-convinced-button"
      >
        Not Convinced Yet
      </Button>
      <Button
        variant="ghost"
        onClick={onContinue}
        className="h-11 rounded-sm px-5 font-heading font-bold uppercase text-violet-100 hover:bg-violet-900/50"
        data-testid="battle-continue-button"
      >
        Continue <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

function ProofPanel({ attack, powers, vaultSize }: { attack: FatherAttack; powers: ResumePower[]; vaultSize: number }): ReactElement {
  return (
    <section className="space-y-4 rounded-sm border-2 border-gold/60 bg-[#1A102F] p-5" data-testid="battle-proof-panel">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">Show Me Proof · {attack.id}</p>
      {attack.outcome === "learning" ? <NoMatchProof attack={attack} vaultSize={vaultSize} /> : <MatchedProof attack={attack} powers={powers} />}
      <p className="font-mono text-[10px] uppercase tracking-widest text-violet-400" data-testid="proof-source">
        Source · {attack.source}
      </p>
    </section>
  );
}

function NoMatchProof({ attack, vaultSize }: { attack: FatherAttack; vaultSize: number }): ReactElement {
  return (
    <div className="rounded-sm border border-rose-500/40 bg-rose-950/30 p-4" data-testid="proof-no-match">
      <p className="font-heading text-lg font-bold text-white">0 of {vaultSize} resume powers match this question.</p>
      <p className="mt-1 text-sm text-rose-100">No matching proof is shown, because none is listed. What Shivam can honestly bring instead:</p>
      <SkillChips skills={attack.proof.transferable} />
    </div>
  );
}

function MatchedProof({ attack, powers }: { attack: FatherAttack; powers: ResumePower[] }): ReactElement {
  const { proof } = attack;
  return (
    <>
      {proof.contribution && (
        <div data-testid="proof-contribution">
          <SectionLabel>Shivam's personal contribution</SectionLabel>
          <p className="mt-1 text-base leading-relaxed text-white">{proof.contribution}</p>
        </div>
      )}
      {proof.decisions.length > 0 && (
        <div data-testid="proof-decisions">
          <SectionLabel>Key decisions</SectionLabel>
          <ul className="mt-2 space-y-1.5">
            {proof.decisions.map((d, i) => (
              <li key={d} className="flex gap-2.5 text-sm leading-relaxed text-white">
                <span className="font-mono text-xs font-semibold text-gold">0{i + 1}</span> {d}
              </li>
            ))}
          </ul>
        </div>
      )}
      {proof.metrics.length > 0 && (
        <div data-testid="proof-metrics">
          <SectionLabel>Metrics</SectionLabel>
          <dl className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {proof.metrics.map((m) => (
              <div key={m.label} className="rounded-sm border border-gold/40 bg-night/70 p-3">
                <dt className="text-[11px] leading-snug text-violet-200">{m.label}</dt>
                <dd className="mt-1 font-heading text-lg font-black leading-tight text-gold-soft">{m.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {powers.length > 0 && (
        <div data-testid="proof-vault-powers">
          <SectionLabel>Matching Resume Powers</SectionLabel>
          <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
            {powers.map((p) => (
              <PowerMiniCard key={p.id} power={p} testId={`proof-power-${p.id}`} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function SectionLabel({ children }: { children: ReactNode }): ReactElement {
  return <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-violet-300">{children}</p>;
}

function ScopePanel({ attack }: { attack: FatherAttack }): ReactElement {
  const { proof } = attack;
  const showClaims = attack.outcome !== "learning" && (proof.supports.length > 0 || proof.not_claimed.length > 0);
  return (
    <section className="space-y-4 rounded-sm border-2 border-papa/60 bg-[#220D1A] p-5" data-testid="battle-scope-panel">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-papa">Not convinced yet? The exact scope</p>
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-rose-300">Precise boundary</p>
        <p className="mt-1 text-base leading-relaxed text-white" data-testid="scope-limitation">{attack.limitation}</p>
      </div>
      {showClaims && (
        <div className="grid gap-3 md:grid-cols-2">
          <div data-testid="scope-supports">
            <CheckList items={proof.supports} kind="yes" className="space-y-1.5 text-emerald-100" />
          </div>
          <div data-testid="scope-not-claimed">
            <CheckList items={proof.not_claimed} kind="no" className="space-y-1.5 text-rose-100" />
          </div>
        </div>
      )}
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-gold">
          {attack.outcome === "learning" ? "Learning plan" : "Next experiment"}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-gold-soft" data-testid="scope-learning">{attack.learning}</p>
      </div>
    </section>
  );
}
