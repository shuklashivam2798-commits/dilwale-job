import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

interface SubtitleProps {
  text: string | null | undefined;
  /** Fade in only once the Hinglish line has finished typing (defaults to always visible). */
  visible?: boolean;
  className?: string;
  "data-testid"?: string;
}

/** Movie-style English subtitle shown under a Hinglish dialogue line. */
export function Subtitle({ text, visible = true, className, ...rest }: SubtitleProps): ReactElement | null {
  if (!text) return null;
  return (
    <p
      lang="en"
      className={cn("mt-2 text-sm italic leading-snug text-violet-300 transition-opacity duration-300", visible ? "opacity-100" : "opacity-0", className)}
      data-testid={rest["data-testid"]}
    >
      {text}
    </p>
  );
}
