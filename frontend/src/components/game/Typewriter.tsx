import { useEffect, useRef, useState } from "react";

interface TypewriterProps {
  text: string;
  /** Show full text immediately (user pressed Next, or reduced motion). */
  complete: boolean;
  onDone: () => void;
  speed?: number;
  className?: string;
  "data-testid"?: string;
}

/** Letter-by-letter reveal. Re-mount with a new `key` to restart. Screen readers get full text. */
export function Typewriter({ text, complete, onDone, speed = 26, className, ...rest }: TypewriterProps) {
  const [count, setCount] = useState(0);
  const shown = complete ? text.length : count;
  const done = shown >= text.length;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (complete) return;
    const timer = window.setInterval(() => setCount((c) => Math.min(c + 1, text.length)), speed);
    return () => window.clearInterval(timer);
  }, [complete, text, speed]);

  useEffect(() => {
    if (done) onDoneRef.current();
  }, [done]);

  return (
    <span className={className} data-testid={rest["data-testid"]}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, shown)}
        {!done && <span className="ml-0.5 inline-block h-[1em] w-2 translate-y-[2px] animate-caret bg-gold-soft" />}
      </span>
    </span>
  );
}
