import { NotebookPen } from "lucide-react";
import { useGame } from "@/hooks/useGame";
import { JOURNEYS } from "@/lib/script";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function JournalDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { state, progress } = useGame();
  const entries = progress?.journal ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full gap-0 border-r-2 border-gold/50 bg-[#120B24] p-0 sm:max-w-md" data-testid="journal-drawer">
        <SheetHeader className="border-b border-violet-500/30 px-5 pb-4 pt-5">
          <SheetTitle className="flex items-center gap-2 font-heading text-2xl font-black uppercase tracking-tight text-white">
            <NotebookPen className="size-5 text-gold" /> Learning Journal
          </SheetTitle>
          <SheetDescription className="text-sm text-violet-200">
            {state.journey
              ? `${JOURNEYS[state.journey].title} · Every gap becomes a specific next step. "Shivam noted it down!"`
              : "Choose a path first — each journey keeps its own notebook."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="notebook-paper min-h-full rounded-sm py-5 pl-12 pr-5 text-slate-800 shadow-[6px_6px_0_rgba(0,0,0,0.5)]">
            {entries.length === 0 ? (
              <div data-testid="journal-empty-state">
                <p className="font-heading text-lg font-bold leading-7">Notebook abhi khaali hai.</p>
                <p className="text-sm leading-7">
                  When a question has no matching resume power, or a strategy card backfires, Shivam writes the learning plan here — and
                  it stays here, even after a comeback.
                </p>
              </div>
            ) : (
              <ol className="space-y-4" data-testid="journal-entry-list">
                {entries.map((e, i) => (
                  <li key={e.key} data-testid={`journal-entry-${e.key}`}>
                    <p className="font-mono text-[11px] font-semibold uppercase leading-7 tracking-widest text-rose-600">
                      #{i + 1} · {e.title}
                    </p>
                    <p className="text-sm leading-7">{e.note}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
