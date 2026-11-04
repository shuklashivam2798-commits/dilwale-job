import type { ReactElement } from "react";
import { motion, type TargetAndTransition, type Transition, type Variants } from "motion/react";
import { Award, Sparkles as SparklesIcon } from "lucide-react";
import type { Arena, ResumePower } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PowerMiniCard } from "@/components/game/PowerMiniCard";

// Static motion configs: proof items stagger by index via `custom`.
const PROOF_ITEM: Variants = {
  hidden: { opacity: 0, x: -16 },
  shown: (i: number) => ({ opacity: 1, x: 0, transition: { delay: 0.1 + i * 0.12 } }),
};
const SEAL_INITIAL: TargetAndTransition = { scale: 1.6, opacity: 0, rotate: -12 };
const SEAL_ANIMATE: TargetAndTransition = { scale: 1, opacity: 1, rotate: -4 };
const SEAL_TRANSITION: Transition = { delay: 0.5, type: "spring", stiffness: 260, damping: 14 };

/** Split the arena's core_proof sentence into its three spotlight items. */
const splitProof = (coreProof: string): string[] =>
  coreProof
    .split(/;\s*/)
    .map((p) => p.trim().replace(/\.$/, ""))
    .filter(Boolean);

interface SpotlightDialogProps {
  arena: Arena;
  powers: ResumePower[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present once all three seals are earned: offers the jump to Miss Growth's finale. */
  onFinale?: () => void;
}

/** The arena's mandatory core-proof spotlight. Opening it (handled by the caller) earns the seal. */
export function SpotlightDialog({ arena, powers, open, onOpenChange, onFinale }: SpotlightDialogProps): ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-sm border-2 border-gold bg-panel sm:max-w-2xl" data-testid="spotlight-dialog">
        <DialogHeader>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">Proof Spotlight · Arena 0{arena.number}</p>
          <DialogTitle className="font-heading text-2xl font-black uppercase tracking-tight text-white">{arena.title}</DialogTitle>
          <DialogDescription className="text-violet-200">{arena.theme}</DialogDescription>
        </DialogHeader>

        <ol className="space-y-2.5" data-testid="spotlight-proof-list">
          {splitProof(arena.core_proof).map((p, i) => (
            <motion.li
              key={p}
              variants={PROOF_ITEM}
              custom={i}
              initial="hidden"
              animate="shown"
              className="flex gap-3 rounded-sm border border-gold/30 bg-night/70 p-3"
            >
              <SparklesIcon className="mt-0.5 size-4 shrink-0 text-gold" />
              <span className="text-sm leading-relaxed text-white">{p}</span>
            </motion.li>
          ))}
        </ol>

        {powers.length > 0 && (
          <div>
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-violet-300">From the Resume Power Vault</p>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {powers.map((p) => (
                <PowerMiniCard key={p.id} power={p} testId={`spotlight-power-${p.id}`} />
              ))}
            </div>
          </div>
        )}

        <motion.div
          initial={SEAL_INITIAL}
          animate={SEAL_ANIMATE}
          transition={SEAL_TRANSITION}
          className="mx-auto flex items-center gap-2 border-4 border-gold bg-night px-4 py-2 shadow-[5px_5px_0_#7C2D12]"
          data-testid="spotlight-seal-earned"
        >
          <Award className="size-6 text-gold" />
          <span className="font-heading text-lg font-black uppercase tracking-tight text-gold">{arena.badge} earned!</span>
        </motion.div>

        <DialogFooter>
          {onFinale && (
            <Button
              onClick={() => {
                onOpenChange(false);
                onFinale();
              }}
              className="rounded-sm bg-magenta font-heading font-bold uppercase text-white hover:bg-pink-400"
              data-testid="spotlight-finale-button"
            >
              All 3 seals! Meet Miss Growth
            </Button>
          )}
          <Button
            variant={onFinale ? "outline" : "default"}
            onClick={() => onOpenChange(false)}
            className="rounded-sm font-heading font-bold uppercase"
            data-testid="spotlight-close-button"
          >
            Back to the arena
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
