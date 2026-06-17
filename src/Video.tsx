import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SCENES, getMoodProgressAtFrame, DEFAULT_TRANSITION_FRAMES } from "./timeline";
import { getPalette } from "./utils/colors";
import { sceneComponents } from "./scenes";

// ---------------------------------------------------------------------------
// VIDEO - the single Composition root.
// ---------------------------------------------------------------------------
// This file does three jobs:
//   1. Computes the current color palette once per absolute frame, from the
//      continuous mood curve (see src/timeline.ts), and hands it down to
//      whichever scene is currently mounted.
//   2. Mounts every scene from SCENES inside its own <Sequence>, so each
//      scene's internal useCurrentFrame() is local to that scene (0 at the
//      scene's first frame) - scenes never need to know their absolute
//      position in the full 8-minute timeline.
//   3. Crossfades between scenes with a simple opacity wrapper, skipping the
//      fade-in on the very first scene and the fade-out on the very last
//      scene (Scene21 must end on the image, not on black - see its file
//      for why).
//
// TO RETIME THE WHOLE VIDEO: edit timeline.json, not this file.
// TO CHANGE THE CROSSFADE LENGTH: edit transitions.default.durationFrames
// in timeline.json (read here as DEFAULT_TRANSITION_FRAMES).
// ---------------------------------------------------------------------------

interface SceneFadeWrapperProps {
  durationInFrames: number;
  transitionFrames: number;
  skipFadeIn?: boolean;
  skipFadeOut?: boolean;
  children: React.ReactNode;
}

const SceneFadeWrapper: React.FC<SceneFadeWrapperProps> = ({
  durationInFrames,
  transitionFrames,
  skipFadeIn = false,
  skipFadeOut = false,
  children,
}) => {
  // This useCurrentFrame() is LOCAL to the enclosing <Sequence> (0 at the
  // scene's first frame), which is exactly what a fade-in/fade-out needs.
  const localFrame = useCurrentFrame();

  const fadeIn = skipFadeIn
    ? 1
    : interpolate(localFrame, [0, transitionFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });

  const fadeOut = skipFadeOut
    ? 1
    : interpolate(
        localFrame,
        [durationInFrames - transitionFrames, durationInFrames],
        [1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

  const opacity = Math.min(fadeIn, fadeOut);

  return <g opacity={opacity}>{children}</g>;
};

export const Video: React.FC = () => {
  // This useCurrentFrame() IS absolute, since Video itself is the
  // Composition root (not nested in a <Sequence>) - exactly what the
  // global mood/color grade needs.
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const palette = getPalette(getMoodProgressAtFrame(frame));

  return (
    <AbsoluteFill style={{ backgroundColor: palette.sky }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        {SCENES.map((scene) => {
          const Component = sceneComponents[scene.component];
          if (!Component) {
            // Fails loudly during development rather than silently
            // skipping a scene if timeline.json and scenes/index.ts ever
            // drift out of sync.
            throw new Error(
              `[Video.tsx] No component registered for "${scene.component}" (scene "${scene.id}"). Check src/scenes/index.ts.`
            );
          }

          return (
            <Sequence
              key={scene.id}
              from={scene.startFrame}
              durationInFrames={scene.durationInFrames}
              layout="none"
            >
              <SceneFadeWrapper
                durationInFrames={scene.durationInFrames}
                transitionFrames={DEFAULT_TRANSITION_FRAMES}
                skipFadeIn={scene.order === 1}
                skipFadeOut={scene.order === SCENES.length}
              >
                <Component width={width} height={height} palette={palette} />
              </SceneFadeWrapper>
            </Sequence>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

export default Video;
