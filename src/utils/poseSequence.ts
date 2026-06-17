import { Pose, interpolatePose } from "../components/StickFigure";

// ---------------------------------------------------------------------------
// POSE SEQUENCE HELPER
// ---------------------------------------------------------------------------
// Many scenes hold a series of named poses back-to-back (e.g. makeBed ->
// pickUpTrash -> openCurtains). This helper picks the right pose for the
// current local frame and eases smoothly into each new pose for the first
// `transitionFrames` of its beat, then holds it.
//
// TO CHANGE BEAT TIMING: pass a different `beatLength` (frames per beat) or
// an explicit `beatLengths` array if beats should be uneven.
// ---------------------------------------------------------------------------

export function poseSequence(
  frame: number,
  poses: Pose[],
  beatLength: number | number[],
  transitionFrames = 20
): Pose {
  const lengths: number[] = Array.isArray(beatLength)
    ? beatLength
    : poses.map(() => beatLength);

  let cursor = 0;
  let idx = 0;
  for (let i = 0; i < poses.length; i++) {
    if (frame < cursor + lengths[i] || i === poses.length - 1) {
      idx = i;
      break;
    }
    cursor += lengths[i];
  }

  const localFrame = frame - cursor;

  if (idx === 0 || localFrame >= transitionFrames) {
    return poses[idx];
  }
  const t = Math.max(0, Math.min(1, localFrame / transitionFrames));
  return interpolatePose(poses[idx - 1], poses[idx], t);
}

/** Returns the 0-based index of the currently active beat. */
export function activeBeatIndex(
  frame: number,
  beatLength: number | number[],
  beatCount: number
): number {
  const lengths: number[] = Array.isArray(beatLength)
    ? beatLength
    : Array.from({ length: beatCount }, () => beatLength);
  let cursor = 0;
  for (let i = 0; i < beatCount; i++) {
    if (frame < cursor + lengths[i] || i === beatCount - 1) return i;
    cursor += lengths[i];
  }
  return beatCount - 1;
}
