import { Heart, Volume2, VolumeX } from "lucide-react";
import { useGame } from "@/lib/game-store";
import { STARTING_HEARTS } from "@/lib/gameEngine";
import { cn } from "@/lib/utils";

export function HeartsMeter({ hearts, className }: { hearts: number; className?: string }) {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={`${hearts} of ${STARTING_HEARTS} hearts`}
      data-testid="hud-health-hearts"
      data-hearts={hearts}
    >
      {Array.from({ length: STARTING_HEARTS }, (_, i) => {
        const full = i < hearts;
        return (
          <Heart
            key={i}
            className={cn(
              "size-5 transition-[transform,opacity] duration-300",
              full ? "animate-heart-beat fill-papa text-papa" : "fill-transparent text-slate-500 opacity-60",
            )}
            style={{ animationDelay: `${i * 0.18}s` }}
            strokeWidth={2.5}
          />
        );
      })}
    </div>
  );
}

export function MuteToggle({ className }: { className?: string }) {
  const { state, dispatch, sfx } = useGame();
  return (
    <button
      type="button"
      onClick={() => {
        dispatch({ type: "TOGGLE_MUTE" });
        if (state.muted) window.setTimeout(() => sfx("select"), 0);
      }}
      aria-pressed={!state.muted}
      aria-label={state.muted ? "Sound off — turn on chiptune effects" : "Sound on — mute"}
      className={cn(
        "pixel-frame-sm inline-flex h-9 items-center gap-1.5 rounded-sm bg-panel px-2.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-violet-200 transition-[background-color,color,transform] duration-200 hover:bg-violet-900/60 hover:text-white active:translate-y-px",
        className,
      )}
      data-testid="hud-audio-toggle"
    >
      {state.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4 text-gold" />}
      <span className="hidden sm:inline">{state.muted ? "Muted" : "Sound"}</span>
    </button>
  );
}
