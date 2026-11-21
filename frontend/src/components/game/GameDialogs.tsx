import { HeartPulse } from "lucide-react";
import { useGame } from "@/hooks/useGame";
import { JOURNEYS } from "@/lib/script";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export type RestartScope = "journey" | "all";

export function RestartDialog({ scope, onClose }: { scope: RestartScope | null; onClose: () => void }) {
  const { state, dispatch, sfx } = useGame();
  const journeyTitle = state.journey ? JOURNEYS[state.journey].title : "";
  const confirm = () => {
    sfx("thud");
    if (scope === "journey" && state.journey) dispatch({ type: "RESET_JOURNEY", journey: state.journey });
    if (scope === "all") dispatch({ type: "RESET_ALL" });
    onClose();
  };

  return (
    <Dialog open={scope !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-sm border-2 border-gold/60 bg-panel" data-testid="restart-dialog">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-black uppercase text-white">
            {scope === "all" ? "Reset the entire game?" : `Restart ${journeyTitle}?`}
          </DialogTitle>
          <DialogDescription className="text-violet-200">
            {scope === "all"
              ? "Everything starts fresh, like a first visit: both journeys, hearts, seals, journals and the opening scene. Your sound setting is kept."
              : "This journey goes back to 3 hearts, no seals and an empty journal. The other journey is untouched."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded-sm" data-testid="restart-cancel-button">
            Keep playing
          </Button>
          <Button variant="destructive" onClick={confirm} className="rounded-sm" data-testid="restart-confirm-button">
            {scope === "all" ? "Yes, reset everything" : "Yes, restart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Infinite Learner comeback — shown whenever hearts would hit zero (engine restores one). */
export function ComebackDialog() {
  const { progress, dispatch, sfx } = useGame();
  const open = Boolean(progress?.comebackPending);
  const ack = () => {
    sfx("heart");
    dispatch({ type: "ACK_COMEBACK" });
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && ack()}>
      <DialogContent className="rounded-sm border-2 border-magenta bg-panel text-center" data-testid="comeback-dialog">
        <DialogHeader className="items-center">
          <HeartPulse className="size-12 animate-heart-beat text-papa" />
          <DialogTitle className="text-glow-magenta font-heading text-3xl font-black uppercase text-white">Hero abhi haara nahi hai!</DialogTitle>
          <DialogDescription className="text-violet-200">
            Infinite Learner mode: one heart restored. Every note in the Learning Journal stays — the gaps are still gaps, and now
            there is a plan for each.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={ack} className="rounded-sm font-heading font-bold uppercase" data-testid="comeback-continue-button">
            Continue the fight
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
