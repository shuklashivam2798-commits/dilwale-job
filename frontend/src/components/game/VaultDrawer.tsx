import { useMemo, useState } from "react";
import { Gem } from "lucide-react";
import { useGameData } from "@/hooks/useGameData";
import type { ResumePower } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// Colour per achievement type exactly as written in the CV-confirmed JSON.
const TYPE_STYLE: Record<string, string> = {
  Achieved: "border-emerald-500 bg-emerald-950 text-emerald-300",
  "Research and strategy": "border-blue-500 bg-blue-950 text-blue-300",
  "Analysis and strategy": "border-cyan-500 bg-cyan-950 text-cyan-300",
  "Plan and future target": "border-amber-500 bg-amber-950 text-amber-300",
  "Project built and tested": "border-pink-500 bg-pink-950 text-pink-300",
  "Shipped MVP, modeled business case": "border-purple-500 bg-purple-950 text-purple-300",
};
const typeStyle = (t: string) => TYPE_STYLE[t] ?? "border-violet-500 bg-violet-950 text-violet-300";
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function VaultDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data, isError, isPending } = useGameData();
  const powers = isError ? [] : (data?.resume_power_vault ?? []);
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const types = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of powers) counts.set(p.achievement_type, (counts.get(p.achievement_type) ?? 0) + 1);
    return [...counts.entries()];
  }, [powers]);
  const visible = filter === "all" ? powers : powers.filter((p) => p.achievement_type === filter);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 border-l-2 border-gold/50 bg-[#120B24] p-0 sm:max-w-xl" data-testid="vault-drawer">
        <SheetHeader className="border-b border-violet-500/30 px-5 pb-4 pt-5">
          <SheetTitle className="flex items-center gap-2 font-heading text-2xl font-black uppercase tracking-tight text-white">
            <Gem className="size-5 text-gold" /> Resume Power Vault
          </SheetTitle>
          <SheetDescription className="text-sm text-violet-200">
            {powers.length ? `${powers.length} powers` : "Powers"} from Shivam's latest CV. Each card shows what kind of result it is.
          </SheetDescription>
          {types.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by result type">
              <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label={`All · ${powers.length}`} testId="vault-filter-all" />
              {types.map(([t, n]) => (
                <FilterPill key={t} active={filter === t} onClick={() => setFilter(t)} label={`${t} · ${n}`} testId={`vault-filter-${slug(t)}`} />
              ))}
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isPending && !isError ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-sm bg-[#1E1338]" />
              ))}
            </div>
          ) : powers.length === 0 ? (
            <p className="rounded-sm border border-violet-500/30 p-5 text-sm text-violet-200" data-testid="vault-unavailable">
              The vault is locked backstage right now. Try again in a moment.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2" data-testid="vault-card-list">
              {visible.map((p) => (
                <PowerCard key={p.id} power={p} expanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function FilterPill({ active, onClick, label, testId }: { active: boolean; onClick: () => void; label: string; testId: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-sm border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider transition-[background-color,color,border-color] duration-150",
        active ? "border-gold bg-gold text-night" : "border-violet-500/40 text-violet-200 hover:border-gold/70 hover:text-white",
      )}
      data-testid={testId}
    >
      {label}
    </button>
  );
}

function PowerCard({ power, expanded, onToggle }: { power: ResumePower; expanded: boolean; onToggle: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "flex h-full w-full flex-col rounded-sm border-2 bg-[#1E1338] p-3.5 text-left transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-gold/70",
          expanded ? "border-gold shadow-[4px_4px_0_#7C2D12]" : "border-violet-700/50",
        )}
        data-testid={`vault-card-${power.id}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] font-semibold text-violet-400">{power.id}</span>
          <span className="truncate font-mono text-[10px] font-semibold uppercase tracking-wider text-gold-soft" data-testid={`vault-card-${power.id}-source`}>
            {power.source}
          </span>
        </div>
        <h4 className="mt-1.5 font-heading text-base font-bold leading-snug text-white">{power.label}</h4>
        <span
          className={cn("mt-2 self-start rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider", typeStyle(power.achievement_type))}
          data-testid={`vault-card-${power.id}-type`}
        >
          {power.achievement_type}
        </span>
        <p className={cn("mt-2 text-sm leading-relaxed text-violet-100", !expanded && "line-clamp-2")} data-testid={`vault-card-${power.id}-fact`}>
          {power.fact}
        </p>
        <span className="mt-2 font-mono text-[9px] uppercase tracking-widest text-violet-400">{expanded ? "Tap to fold" : "Tap to read"}</span>
      </button>
    </li>
  );
}
