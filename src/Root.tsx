import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { TOTAL_DURATION_IN_FRAMES, FPS } from "./timeline";

// ---------------------------------------------------------------------------
// ROOT - registers every Composition Remotion knows how to render.
// ---------------------------------------------------------------------------
// "MainVideo"          1920x1080 - the primary horizontal deliverable.
// "MainVideoVertical"  1080x1920 - same component, same timing, just a
//                       different canvas size. Every scene positions its
//                       content using fractions of `width`/`height` (passed
//                       down as props) rather than hardcoded pixel values,
//                       so the whole video re-flows to the taller, narrower
//                       canvas automatically - no per-scene vertical-safe-
//                       area logic needed.
//
// TO RENDER VERTICAL: `npm run render:vertical` (see package.json / README).
// TO CHANGE RESOLUTION: edit the width/height props below.
// TO CHANGE TOTAL LENGTH OR FPS: edit timeline.json (fps + the last scene's
// endSeconds) - both Compositions read durationInFrames/fps from there.
// ---------------------------------------------------------------------------

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MainVideo"
        component={Video}
        width={1920}
        height={1080}
        fps={FPS}
        durationInFrames={TOTAL_DURATION_IN_FRAMES}
      />
      <Composition
        id="MainVideoVertical"
        component={Video}
        width={1080}
        height={1920}
        fps={FPS}
        durationInFrames={TOTAL_DURATION_IN_FRAMES}
      />
    </>
  );
};

export default RemotionRoot;
