import { interpolate, spring } from "remotion";
import type { AnimKind } from "./constants";

const OFFSET = 64;
const ENTER_FRAMES = 18;
const EXIT_FRAMES = 16;

type State = { opacity: number; x: number; y: number };

/** Contribution of the enter animation. `p` is 0→1 as the element settles. */
function enterState(kind: AnimKind, p: number): State {
  const away = 1 - p; // 1 at the start, 0 once settled
  switch (kind) {
    case "fade":
    case "fade-in":
      return { opacity: p, x: 0, y: 0 };
    case "slide-in":
      return { opacity: 1, x: -OFFSET * away, y: 0 };
    case "slide-up":
      return { opacity: 1, x: 0, y: OFFSET * away };
    case "slide-down":
      return { opacity: 1, x: 0, y: -OFFSET * away };
    default:
      return { opacity: 1, x: 0, y: 0 };
  }
}

/** Contribution of the exit animation. `p` is 0 (not leaving) → 1 (gone). */
function exitState(kind: AnimKind, p: number): State {
  switch (kind) {
    case "fade":
    case "fade-out":
      return { opacity: 1 - p, x: 0, y: 0 };
    case "slide-out":
      return { opacity: 1, x: OFFSET * p, y: 0 };
    case "slide-up":
      return { opacity: 1, x: 0, y: -OFFSET * p };
    case "slide-down":
      return { opacity: 1, x: 0, y: OFFSET * p };
    default:
      return { opacity: 1, x: 0, y: 0 };
  }
}

/**
 * Combined opacity + translation for one element within a scene, given its
 * independent enter and exit animation choices.
 */
export function animate({
  frame,
  fps,
  durationInFrames,
  enter,
  exit,
}: {
  frame: number;
  fps: number;
  durationInFrames: number;
  enter: AnimKind;
  exit: AnimKind;
}): State {
  const enterP = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: ENTER_FRAMES,
  });
  const exitP = interpolate(
    frame,
    [durationInFrames - EXIT_FRAMES, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const a = enterState(enter, enterP);
  const b = exitState(exit, exitP);
  return {
    opacity: Math.max(0, Math.min(a.opacity, b.opacity)),
    x: a.x + b.x,
    y: a.y + b.y,
  };
}
