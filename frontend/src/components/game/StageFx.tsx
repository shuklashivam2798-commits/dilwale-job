import { useMemo, type CSSProperties } from "react";

/** Decorative flying-CV particles. Deterministic layout (no Math.random on render). */
export function FlyingResumes({ count = 12, reverse = false }: { count?: number; reverse?: boolean }) {
  const papers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const seed = (i * 37) % 100;
        return {
          i,
          top: 8 + ((i * 53) % 70),
          dur: 6 + (seed % 5),
          delay: -((i * 1.3) % 7),
          dx: reverse ? "-115vw" : "115vw",
          dy: `${((i % 5) - 2) * 9}vh`,
          r0: `${(seed % 40) - 20}deg`,
          r1: `${(seed % 2 ? 1 : -1) * (180 + seed * 3)}deg`,
          rejected: i % 3 === 0,
        };
      }),
    [count, reverse],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {papers.map((p) => (
        <div
          key={p.i}
          className="resume-particle absolute h-11 w-8 rounded-[2px] border border-slate-300 bg-slate-50 shadow-[3px_3px_0_rgba(0,0,0,0.45)]"
          style={
            {
              top: `${p.top}%`,
              [reverse ? "right" : "left"]: "-60px",
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
              "--dx": p.dx,
              "--dy": p.dy,
              "--r0": p.r0,
              "--r1": p.r1,
            } as CSSProperties
          }
        >
          <div className="mx-1 mt-1.5 h-[2px] bg-slate-400" />
          <div className="mx-1 mt-1 h-[2px] w-4 bg-slate-300" />
          <div className="mx-1 mt-1 h-[2px] bg-slate-300" />
          {p.rejected && (
            <div className="absolute inset-x-0.5 top-5 -rotate-12 border border-red-600 text-center font-mono text-[5px] font-semibold leading-tight text-red-600">
              PDF
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Twinkling gold sparkles for the stage backdrop. */
export function Sparkles({ count = 14 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="absolute size-1.5 animate-twinkle bg-gold-soft"
          style={{
            top: `${(i * 41) % 60}%`,
            left: `${(i * 67) % 100}%`,
            animationDelay: `${(i % 6) * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}
