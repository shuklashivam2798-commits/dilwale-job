// Main-menu background loop (title + journey select only). Web Audio for a gapless loop and smooth gain fades.
// Every failure path (no AudioContext, fetch/decode error) leaves the game silent but fully playable.
const SRC = "/audio/menu-loop.mp3";
const VOLUME = 0.25;
const FADE_S = 0.8;

type MusicStatus = "off" | "on" | "unavailable";

let ctx: AudioContext | null = null;
let track: Promise<AudioBuffer | null> | null = null;
let voice: { src: AudioBufferSourceNode; gain: GainNode; buffer: AudioBuffer } | null = null;
let wanted = false;
let startedAt = 0;
let offset = 0;

function setStatus(status: MusicStatus): void {
  document.documentElement.dataset.menuMusic = status;
}

function context(): AudioContext {
  ctx ??= new AudioContext();
  return ctx;
}

function loadTrack(c: AudioContext): Promise<AudioBuffer | null> {
  track ??= fetch(SRC)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.arrayBuffer();
    })
    .then((bytes) => c.decodeAudioData(bytes))
    .catch((error: unknown) => {
      console.warn("Menu music unavailable; continuing without it.", error);
      setStatus("unavailable");
      return null;
    });
  return track;
}

function rampTo(gain: GainNode, value: number): void {
  const now = context().currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(value, now + FADE_S);
}

async function start(): Promise<void> {
  const c = context();
  if (c.state === "suspended") await c.resume();
  const buffer = await loadTrack(c);
  if (!buffer || !wanted) return;
  if (voice) {
    rampTo(voice.gain, VOLUME);
    return;
  }
  const gain = c.createGain();
  gain.gain.value = 0;
  gain.connect(c.destination);
  const src = c.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  src.connect(gain);
  src.start(0, offset);
  startedAt = c.currentTime - offset;
  voice = { src, gain, buffer };
  rampTo(gain, VOLUME);
  setStatus("on");
}

function stop(): void {
  if (!voice || !ctx) return;
  const { src, gain, buffer } = voice;
  voice = null;
  offset = (ctx.currentTime + FADE_S - startedAt) % buffer.duration; // resume from here next time
  rampTo(gain, 0);
  src.stop(ctx.currentTime + FADE_S);
  setStatus("off");
}

/** Create/resume the AudioContext inside the player's first gesture (browser autoplay rule). */
export function unlockMenuMusic(): void {
  try {
    void context().resume();
  } catch (error) {
    console.warn("Audio unavailable; continuing without menu music.", error);
  }
}

/** Fade the menu loop in (on) or out (off). Safe to call repeatedly. */
export function setMenuMusic(on: boolean): void {
  wanted = on;
  try {
    if (!on) {
      stop();
      return;
    }
    start().catch((error: unknown) => console.warn("Menu music could not start; continuing without it.", error));
  } catch (error) {
    console.warn("Audio unavailable; continuing without menu music.", error);
  }
}
