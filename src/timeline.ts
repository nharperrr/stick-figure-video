import timelineData from "../timeline.json";

// ---------------------------------------------------------------------------
// TIMELINE LOADER
// ---------------------------------------------------------------------------
// This file turns the human-edited timeline.json into typed, frame-accurate
// data that the rest of the app uses. If you only want to RETIME the video,
// edit timeline.json, not this file.
// ---------------------------------------------------------------------------

export interface SceneDefinition {
  id: string;
  order: number;
  startSeconds: number;
  endSeconds: number;
  startFrame: number;
  endFrame: number;
  durationInFrames: number;
  component: string;
  moodRange: [number, number];
  voReference: string;
  visualDescription: string;
  animationCues: string[];
}

export const FPS = timelineData.fps;

export const SCENES: SceneDefinition[] = timelineData.scenes
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((scene) => {
    const startFrame = Math.round(scene.startSeconds * FPS);
    const endFrame = Math.round(scene.endSeconds * FPS);
    return {
      ...scene,
      moodRange: scene.moodRange as [number, number],
      startFrame,
      endFrame,
      durationInFrames: endFrame - startFrame,
    };
  });

export const TOTAL_DURATION_IN_FRAMES = SCENES[SCENES.length - 1].endFrame;

export const DEFAULT_TRANSITION_FRAMES =
  timelineData.transitions.default.durationFrames;

/**
 * Sanity-checks the timeline at module load time so a typo in timeline.json
 * (a gap, an overlap, an out-of-order scene) fails loudly in the terminal
 * instead of silently producing a broken video.
 */
function assertTimelineIntegrity() {
  for (let i = 0; i < SCENES.length; i++) {
    const scene = SCENES[i];
    if (scene.endFrame <= scene.startFrame) {
      throw new Error(
        `[timeline.ts] Scene "${scene.id}" has zero or negative duration.`
      );
    }
    if (i > 0) {
      const prev = SCENES[i - 1];
      if (scene.startFrame !== prev.endFrame) {
        throw new Error(
          `[timeline.ts] Gap or overlap between "${prev.id}" (ends ${prev.endFrame}) ` +
            `and "${scene.id}" (starts ${scene.startFrame}). Scenes must be contiguous.`
        );
      }
    }
  }
}

assertTimelineIntegrity();

/**
 * Given an absolute frame number in the full video, returns the mood
 * progress (0 = bleakest/grayest, 1 = brightest/most hopeful), smoothly
 * interpolated across ALL scene moodRange breakpoints - not just the
 * current scene - so the color grade never jumps at a hard cut.
 */
export function getMoodProgressAtFrame(frame: number): number {
  // Build a flat list of breakpoints: [frame, mood] pairs.
  const breakpoints: Array<[number, number]> = [];
  SCENES.forEach((scene) => {
    breakpoints.push([scene.startFrame, scene.moodRange[0]]);
    breakpoints.push([scene.endFrame, scene.moodRange[1]]);
  });

  if (frame <= breakpoints[0][0]) return breakpoints[0][1];
  const last = breakpoints[breakpoints.length - 1];
  if (frame >= last[0]) return last[1];

  for (let i = 0; i < breakpoints.length - 1; i++) {
    const [f0, m0] = breakpoints[i];
    const [f1, m1] = breakpoints[i + 1];
    if (frame >= f0 && frame <= f1) {
      if (f1 === f0) return m1;
      const t = (frame - f0) / (f1 - f0);
      return m0 + (m1 - m0) * t;
    }
  }
  return last[1];
}

export function getSceneById(id: string): SceneDefinition {
  const scene = SCENES.find((s) => s.id === id);
  if (!scene) {
    throw new Error(`[timeline.ts] No scene found with id "${id}"`);
  }
  return scene;
}
