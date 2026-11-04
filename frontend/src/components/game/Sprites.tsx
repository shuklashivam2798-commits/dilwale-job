import { useId } from "react";
import { cn } from "@/lib/utils";

// Original hand-built SVG sprites (no real-person likeness). viewBox 120×180 for all three
// so they line up on the same stage floor.

interface SpriteProps {
  className?: string;
  /** Adds the idle bob/aura animations (respects reduced motion via CSS). */
  animated?: boolean;
  "data-testid"?: string;
}

const useSvgId = () => useId().replace(/[^a-zA-Z0-9]/g, "");

export function ShivamSprite({ className, animated = true, ...rest }: SpriteProps) {
  const id = useSvgId();
  return (
    <svg
      viewBox="0 0 120 180"
      role="img"
      aria-label="Shivam, the hero, holding a glowing strategy card"
      className={cn("overflow-visible", animated && "animate-idle-bob", className)}
      data-testid={rest["data-testid"]}
    >
      <defs>
        <linearGradient id={`${id}j`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor="#FDE047" stopOpacity="0.9" />
          <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="174" rx="30" ry="5" fill="#000" opacity="0.4" />
      {/* legs + shoes */}
      <rect x="45" y="120" width="13" height="46" fill="#1E293B" />
      <rect x="62" y="120" width="13" height="46" fill="#334155" />
      <rect x="41" y="162" width="19" height="8" rx="2" fill="#0F172A" />
      <rect x="60" y="162" width="19" height="8" rx="2" fill="#0F172A" />
      <rect x="41" y="168" width="19" height="2" fill="#F8FAFC" />
      <rect x="60" y="168" width="19" height="2" fill="#F8FAFC" />
      {/* tee */}
      <rect x="42" y="72" width="36" height="52" rx="6" fill="#F8FAFC" />
      <path d="M57 92 l3 -6 l3 6 l-3 6 Z" fill="#F59E0B" />
      {/* jacket */}
      <path d="M38 74 L54 71 L51 127 L35 124 Z" fill={`url(#${id}j)`} />
      <path d="M82 74 L66 71 L69 127 L85 124 Z" fill={`url(#${id}j)`} />
      <path d="M54 71 L50 84 L46 76 Z" fill="#F59E0B" />
      <path d="M66 71 L70 84 L74 76 Z" fill="#F59E0B" />
      {/* lower arm at side */}
      <path d="M38 76 L28 104 L36 108 L46 82 Z" fill="#1D4ED8" />
      <circle cx="31" cy="108" r="5" fill="#F3C6A5" />
      {/* outstretched arm with strategy card */}
      <path d="M80 76 L104 64 L108 72 L84 88 Z" fill="#2563EB" />
      <circle cx="108" cy="67" r="5" fill="#F3C6A5" />
      <circle cx="110" cy="56" r="18" fill={`url(#${id}g)`} className={animated ? "animate-aura" : undefined} />
      <g transform="rotate(14 110 56)">
        <rect x="102" y="44" width="16" height="22" rx="2" fill="#FBBF24" stroke="#7C2D12" strokeWidth="1.5" />
        <path d="M105 60 L108 55 L111 57 L115 49" stroke="#7C2D12" strokeWidth="1.8" fill="none" />
      </g>
      {/* neck + head */}
      <rect x="54" y="60" width="12" height="13" fill="#DDA784" />
      <rect x="44" y="26" width="32" height="38" rx="12" fill="#F3C6A5" />
      <circle cx="44" cy="46" r="4" fill="#DDA784" />
      <circle cx="76" cy="46" r="4" fill="#DDA784" />
      {/* windswept hero hair */}
      <path
        d="M41 40 C38 22 52 11 66 13 C80 14 89 22 83 33 L88 31 C85 40 80 37 77 34 C70 29 58 31 46 41 Z"
        fill="#1E1B2E"
      />
      <path d="M52 20 C60 15 72 16 78 22" stroke="#8B5CF6" strokeWidth="2" fill="none" opacity="0.8" />
      {/* brows, glasses, eyes */}
      <path d="M49 39 L58 37.5" stroke="#1E1B2E" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M63 37.5 L72 39" stroke="#1E1B2E" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="48.5" y="41" width="11" height="8" rx="2.5" fill="#FFFFFF" fillOpacity="0.12" stroke="#F59E0B" strokeWidth="1.6" />
      <rect x="61.5" y="41" width="11" height="8" rx="2.5" fill="#FFFFFF" fillOpacity="0.12" stroke="#F59E0B" strokeWidth="1.6" />
      <path d="M59.5 44 L61.5 44" stroke="#F59E0B" strokeWidth="1.6" />
      <rect x="52" y="43.5" width="4" height="3.5" fill="#1E1B2E" />
      <rect x="65" y="43.5" width="4" height="3.5" fill="#1E1B2E" />
      <rect x="53" y="43.5" width="1.4" height="1.4" fill="#FFF" />
      <rect x="66" y="43.5" width="1.4" height="1.4" fill="#FFF" />
      {/* nose + confident smirk */}
      <path d="M60 48 L58.5 53 L61 53" stroke="#C98D6B" strokeWidth="1.3" fill="none" />
      <path d="M55 56.5 Q61 60.5 68 54.5" stroke="#7C2D12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export type PapaMood = "skeptical" | "angry" | "curious" | "pleased" | "impressed";

interface PapaSpriteProps extends SpriteProps {
  mood?: PapaMood;
}

const PAPA_LABEL: Record<PapaMood, string> = {
  skeptical: "Recruiter Papa, pointing sternly, holding a stack of resumes",
  angry: "Recruiter Papa, furious, launching a question attack",
  curious: "Recruiter Papa, one eyebrow raised, curious",
  pleased: "Recruiter Papa, warming up with a small smile",
  impressed: "Recruiter Papa, beaming with a thumbs up, impressed",
};

export function PapaSprite({ className, animated = true, mood = "skeptical", ...rest }: PapaSpriteProps) {
  const id = useSvgId();
  const face = mood === "angry" ? "#F0A08A" : "#E8B298";
  const pointing = mood === "skeptical" || mood === "angry";
  return (
    <svg
      viewBox="0 0 120 180"
      role="img"
      aria-label={PAPA_LABEL[mood]}
      className={cn("overflow-visible", animated && "animate-idle-bob", className)}
      data-testid={rest["data-testid"]}
      data-mood={mood}
    >
      <defs>
        <linearGradient id={`${id}c`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#BE185D" />
          <stop offset="1" stopColor="#831843" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="174" rx="32" ry="5" fill="#000" opacity="0.4" />
      {/* churidar + mojari */}
      <rect x="46" y="128" width="12" height="38" fill="#F1F5F9" />
      <rect x="62" y="128" width="12" height="38" fill="#E2E8F0" />
      <path d="M40 166 Q48 160 59 164 L59 170 L40 170 Z" fill="#FBBF24" />
      <path d="M61 164 Q72 160 80 166 L80 170 L61 170 Z" fill="#FBBF24" />
      {/* bandhgala */}
      <path d="M35 74 Q60 64 85 74 L89 138 L31 138 Z" fill={`url(#${id}c)`} />
      <path d="M60 72 L60 138" stroke="#FBBF24" strokeWidth="1.5" />
      {[84, 94, 104, 114, 124].map((y) => (
        <circle key={y} cx="60" cy={y} r="2" fill="#FBBF24" />
      ))}
      <path d="M68 84 L76 84 L72 90 Z" fill="#FBBF24" />
      <rect x="49" y="63" width="22" height="9" rx="2" fill="#831843" stroke="#FBBF24" strokeWidth="1.5" />
      {/* resume stack arm */}
      <path d="M38 76 L24 102 L33 107 L46 84 Z" fill="#9D174D" />
      <g transform="rotate(-8 18 100)">
        <rect x="6" y="92" width="22" height="26" fill="#E5E7EB" stroke="#9CA3AF" />
        <rect x="9" y="89" width="22" height="26" fill="#F9FAFB" stroke="#9CA3AF" />
        <rect x="12" y="95" width="14" height="2" fill="#9CA3AF" />
        <rect x="12" y="100" width="12" height="2" fill="#9CA3AF" />
        <rect x="11" y="106" width="18" height="6" fill="none" stroke="#DC2626" strokeWidth="1.5" transform="rotate(-10 20 109)" />
      </g>
      <circle cx="28" cy="104" r="5" fill="#E8B298" />
      {/* right arm: pointing (skeptical/angry), at side (curious/pleased), thumbs up (impressed) */}
      {pointing && (
        <g
          className={animated ? "animate-finger-wag" : undefined}
          style={{ transformOrigin: "84px 78px", animationDuration: mood === "angry" ? "0.45s" : undefined }}
        >
          <path d="M80 74 L96 44 L105 48 L90 82 Z" fill="#9D174D" />
          <circle cx="100" cy="42" r="5.5" fill="#E8B298" />
          <rect x="98" y="26" width="4.5" height="14" rx="2.2" fill="#E8B298" />
        </g>
      )}
      {(mood === "curious" || mood === "pleased") && (
        <g>
          <path d="M82 76 L95 102 L87 107 L74 84 Z" fill="#9D174D" />
          <circle cx="92" cy="106" r="5" fill="#E8B298" />
        </g>
      )}
      {mood === "impressed" && (
        <g>
          <path d="M80 74 L96 46 L105 50 L90 82 Z" fill="#9D174D" />
          <rect x="94" y="37" width="12" height="10" rx="3" fill="#E8B298" />
          <rect x="95.5" y="27" width="4.8" height="12" rx="2.3" fill="#E8B298" />
          <path d="M108 22 l2 4 l4 1 l-4 1 l-2 4 l-2 -4 l-4 -1 l4 -1 Z" fill="#FDE047" />
          <path d="M22 30 l1.5 3 l3 1 l-3 1 l-1.5 3 l-1.5 -3 l-3 -1 l3 -1 Z" fill="#FDE047" />
        </g>
      )}
      {/* head */}
      <rect x="54" y="58" width="12" height="8" fill="#CD8E70" />
      <rect x="42" y="22" width="36" height="42" rx="14" fill={face} />
      <path d="M42 46 C38 30 42 24 47 24 L47 44 Z" fill="#6B7280" />
      <path d="M78 46 C82 30 78 24 73 24 L73 44 Z" fill="#6B7280" />
      <ellipse cx="60" cy="26" rx="10" ry="3" fill="#FFF" opacity="0.25" />
      <rect x="58.8" y="29" width="2.4" height="7" rx="1" fill="#DC2626" />
      {mood === "angry" && <path d="M71 27 l5 5 M76 27 l-5 5" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" />}
      {/* brows */}
      {mood === "skeptical" && (
        <>
          <path d="M46 37 L57 41" stroke="#4B5563" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M74 37 L63 41" stroke="#4B5563" strokeWidth="3.6" strokeLinecap="round" />
        </>
      )}
      {mood === "angry" && (
        <>
          <path d="M45 34 L58 42" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
          <path d="M75 34 L62 42" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {mood === "curious" && (
        <>
          <path d="M46 37 Q51 32 57 36" stroke="#4B5563" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <path d="M63 40 L74 40" stroke="#4B5563" strokeWidth="3.4" strokeLinecap="round" />
        </>
      )}
      {(mood === "pleased" || mood === "impressed") && (
        <>
          <path d="M46 38 Q51 34 57 37" stroke="#4B5563" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          <path d="M63 37 Q69 34 74 38" stroke="#4B5563" strokeWidth="3.2" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* round glasses + eyes */}
      <circle cx="53" cy="46" r="5.5" fill="#FFF" fillOpacity="0.15" stroke="#D1D5DB" strokeWidth="1.6" />
      <circle cx="67" cy="46" r="5.5" fill="#FFF" fillOpacity="0.15" stroke="#D1D5DB" strokeWidth="1.6" />
      <path d="M58.5 46 L61.5 46" stroke="#D1D5DB" strokeWidth="1.6" />
      {mood === "impressed" ? (
        <>
          <path d="M50.5 47.5 Q53 44 55.5 47.5" stroke="#1F2937" strokeWidth="1.6" fill="none" />
          <path d="M64.5 47.5 Q67 44 69.5 47.5" stroke="#1F2937" strokeWidth="1.6" fill="none" />
        </>
      ) : (
        <>
          <rect x="51.5" y={mood === "curious" ? 44 : 45} width="3" height={mood === "angry" ? 2 : 3} fill="#1F2937" />
          <rect x="65.5" y="45" width="3" height={mood === "angry" ? 2 : 3} fill="#1F2937" />
        </>
      )}
      {(mood === "pleased" || mood === "impressed") && (
        <>
          <circle cx="48" cy="53" r="2.5" fill="#F472B6" opacity="0.45" />
          <circle cx="72" cy="53" r="2.5" fill="#F472B6" opacity="0.45" />
        </>
      )}
      {/* the mustache of judgement */}
      <path
        d={
          mood === "impressed" || mood === "pleased"
            ? "M45 54 Q52 49 60 53.5 Q68 49 75 54 Q70 58 60 56.5 Q50 58 45 54 Z"
            : "M45 56 Q52 49 60 54.5 Q68 49 75 56 Q70 59.5 60 57.5 Q50 59.5 45 56 Z"
        }
        fill="#6B7280"
      />
      {mood === "skeptical" && <path d="M55 62 Q60 59.5 65 62" stroke="#7C2D12" strokeWidth="1.6" fill="none" strokeLinecap="round" />}
      {mood === "angry" && <ellipse cx="60" cy="61.5" rx="4" ry="2.6" fill="#7C2D12" />}
      {mood === "curious" && <path d="M56 61.5 L64 61" stroke="#7C2D12" strokeWidth="1.6" strokeLinecap="round" />}
      {mood === "pleased" && <path d="M55 59.5 Q60 62.5 65 59.5" stroke="#7C2D12" strokeWidth="1.6" fill="none" strokeLinecap="round" />}
      {mood === "impressed" && <path d="M53.5 58.5 Q60 65 66.5 58.5 Z" fill="#7C2D12" />}
    </svg>
  );
}

export function MissGrowthSprite({ className, animated = true, ...rest }: SpriteProps) {
  const id = useSvgId();
  return (
    <svg
      viewBox="0 0 120 180"
      role="img"
      aria-label="Miss Growth, the dream role, holding a glowing growth orb"
      className={cn("overflow-visible", className)}
      data-testid={rest["data-testid"]}
    >
      <defs>
        <radialGradient id={`${id}a`}>
          <stop offset="0" stopColor="#FDE047" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#F59E0B" stopOpacity="0.18" />
          <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}s`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#EC4899" />
          <stop offset="1" stopColor="#9D174D" />
        </linearGradient>
        <radialGradient id={`${id}o`} cx="0.35" cy="0.35">
          <stop offset="0" stopColor="#E0F2FE" />
          <stop offset="0.5" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
      <circle
        cx="60"
        cy="92"
        r="64"
        fill={`url(#${id}a)`}
        className={animated ? "animate-aura" : undefined}
        style={{ transformOrigin: "60px 92px" }}
      />
      <g className={animated ? "animate-idle-bob" : undefined}>
        <ellipse cx="60" cy="174" rx="36" ry="5" fill="#000" opacity="0.35" />
        {/* long hair behind */}
        <path d="M41 36 C38 14 82 14 79 36 L82 98 L72 98 L72 42 L48 42 L48 98 L38 98 Z" fill="#1E1B2E" />
        {/* lehenga */}
        <path d="M40 100 L80 100 L100 170 L20 170 Z" fill={`url(#${id}s)`} />
        <path d="M22 162 L98 162 L100 170 L20 170 Z" fill="#F59E0B" />
        {[34, 48, 60, 72, 86].map((x, i) => (
          <circle key={x} cx={x} cy={i % 2 ? 132 : 146} r="1.8" fill="#FDE047" />
        ))}
        {/* choli */}
        <rect x="45" y="70" width="30" height="32" rx="8" fill="#8B5CF6" />
        <path d="M45 98 L75 98" stroke="#FBBF24" strokeWidth="2" />
        {/* dupatta with a growth chart woven in */}
        <path d="M46 72 C30 92 24 122 30 156 L39 156 C36 126 42 98 58 80 Z" fill="#EC4899" opacity="0.85" />
        <polyline points="31,146 35,138 39,141 44,120 49,104" fill="none" stroke="#34D399" strokeWidth="2" />
        {/* hand on hip */}
        <path d="M45 76 L38 94 L46 100 L50 86 Z" fill="#F3C6A5" />
        {/* orb arm */}
        <path d="M74 76 L92 86 L89 92 L72 84 Z" fill="#F3C6A5" />
        <circle cx="96" cy="78" r="12" fill={`url(#${id}o)`} stroke="#FDE047" strokeWidth="1.2" />
        <polyline points="88,84 92,83.5 96,81 101,70" fill="none" stroke="#34D399" strokeWidth="2.2" strokeLinecap="round" />
        {/* head */}
        <rect x="55" y="58" width="10" height="13" fill="#DDA784" />
        <rect x="46" y="24" width="28" height="36" rx="12" fill="#F3C6A5" />
        <path d="M46 36 C48 22 72 22 74 36 C66 30 54 30 46 36 Z" fill="#1E1B2E" />
        <path d="M60 22 L60 30" stroke="#FBBF24" strokeWidth="1.5" />
        <circle cx="60" cy="31" r="2" fill="#FBBF24" />
        <circle cx="60" cy="38" r="1.6" fill="#DC2626" />
        <circle cx="46" cy="50" r="2.4" fill="#FBBF24" />
        <circle cx="74" cy="50" r="2.4" fill="#FBBF24" />
        {/* eyes with lashes + smile */}
        <path d="M50 43 Q53.5 40.5 57 43" stroke="#1E1B2E" strokeWidth="1.6" fill="none" />
        <path d="M63 43 Q66.5 40.5 70 43" stroke="#1E1B2E" strokeWidth="1.6" fill="none" />
        <rect x="52" y="44" width="3.5" height="3" rx="1" fill="#1E1B2E" />
        <rect x="65" y="44" width="3.5" height="3" rx="1" fill="#1E1B2E" />
        <path d="M55 53 Q60 57 65 53" stroke="#BE185D" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="51" cy="51" r="2" fill="#F472B6" opacity="0.5" />
        <circle cx="69" cy="51" r="2" fill="#F472B6" opacity="0.5" />
      </g>
    </svg>
  );
}

export type MonsterKind = "growth" | "insight" | "ownership";

/** Locked-arena silhouettes for the three monsters (full battle sprites land with the arenas). */
export function MonsterSilhouette({ kind, className }: { kind: MonsterKind; className?: string }) {
  const label = { growth: "The Budget Beast", insight: "The Invisible Audience", ownership: "The AI Fog King" }[kind];
  return (
    <svg viewBox="0 0 100 100" role="img" aria-label={`${label} silhouette`} className={cn("overflow-visible", className)}>
      {kind === "growth" && (
        <g>
          <path d="M14 78 C10 40 30 18 50 18 C70 18 90 40 86 78 Z" fill="currentColor" />
          <path d="M28 26 L22 10 L36 20 Z M72 26 L78 10 L64 20 Z" fill="currentColor" />
          <text x="50" y="58" textAnchor="middle" fontSize="26" fontWeight="800" fill="#0D0714">₹</text>
          <path d="M30 78 L34 70 L38 78 M62 78 L66 70 L70 78" stroke="#0D0714" strokeWidth="2" fill="none" />
        </g>
      )}
      {kind === "insight" && (
        <g>
          <path
            d="M22 84 L22 44 C22 24 36 14 50 14 C64 14 78 24 78 44 L78 84 L70 76 L62 84 L54 76 L46 84 L38 76 L30 84 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="5 4"
          />
          <circle cx="40" cy="44" r="4" fill="currentColor" />
          <circle cx="60" cy="44" r="4" fill="currentColor" />
        </g>
      )}
      {kind === "ownership" && (
        <g>
          <path d="M14 70 C4 70 4 54 16 54 C14 40 32 34 40 44 C44 30 66 30 68 44 C78 38 94 46 88 60 C98 62 96 76 86 76 L18 76 C14 76 12 72 14 70 Z" fill="currentColor" />
          <path d="M34 34 L38 20 L46 30 L50 16 L54 30 L62 20 L66 34 Z" fill="#F59E0B" />
          <rect x="38" y="56" width="6" height="4" fill="#0D0714" />
          <rect x="56" y="56" width="6" height="4" fill="#0D0714" />
        </g>
      )}
    </svg>
  );
}
