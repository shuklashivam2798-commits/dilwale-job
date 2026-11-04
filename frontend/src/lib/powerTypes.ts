// Colour per achievement type exactly as written in the CV-confirmed JSON.
const TYPE_STYLE: Record<string, string> = {
  Achieved: "border-emerald-500 bg-emerald-950 text-emerald-300",
  "Research and strategy": "border-blue-500 bg-blue-950 text-blue-300",
  "Analysis and strategy": "border-cyan-500 bg-cyan-950 text-cyan-300",
  "Plan and future target": "border-amber-500 bg-amber-950 text-amber-300",
  "Project built and tested": "border-pink-500 bg-pink-950 text-pink-300",
  "Shipped MVP, modeled business case": "border-purple-500 bg-purple-950 text-purple-300",
};

export const typeStyle = (t: string) => TYPE_STYLE[t] ?? "border-violet-500 bg-violet-950 text-violet-300";
