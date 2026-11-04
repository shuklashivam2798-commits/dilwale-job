// Tiny Web Audio chiptune blips. Only ever called from a user gesture, and only when unmuted.
export type SfxKind = "select" | "confirm" | "thud" | "sparkle" | "heart";

const PATTERNS: Record<SfxKind, Array<[freq: number, dur: number]>> = {
  select: [[660, 0.05]],
  confirm: [[523, 0.07], [784, 0.11]],
  thud: [[140, 0.08], [98, 0.16]],
  sparkle: [[988, 0.05], [1319, 0.05], [1760, 0.09]],
  heart: [[392, 0.1], [262, 0.18]],
};

let ctx: AudioContext | null = null;

export function playSfx(kind: SfxKind): void {
  try {
    ctx ??= new AudioContext();
    let t = ctx.currentTime;
    for (const [freq, dur] of PATTERNS[kind]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.045, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur;
    }
  } catch {
    /* audio unavailable — silently skip */
  }
}
