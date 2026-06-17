import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { SunriseEnding } from "../components/SunriseEnding";
import { StickFigure, POSES, walkCyclePose, interpolatePose } from "../components/StickFigure";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 21 - SUNRISE FINAL (7:45-8:00)
// The closing image. The character walks forward as the sun rises, a faded
// "ghost" of the original Scene01 posture trails behind and dissolves, and
// the character settles into a final, still, upright pose. NO fade to
// black at the end - this scene must end on the image itself (captions,
// voiceover, and music will be layered on top later in CapCut).
// ---------------------------------------------------------------------------
// TO CHANGE WHEN THE FIGURE SETTLES INTO ITS FINAL POSE: edit SETTLE_FRAME.
// TO CHANGE THE GHOST'S FADE-OUT POINT: edit GHOST_FADE_END.
// ---------------------------------------------------------------------------

const GHOST_FADE_END = 315; // ghost is fully gone by 70% through the scene (450 * 0.7)
const SETTLE_FRAME = 390; // last 60 frames: transition into + hold the final pose
const HOLD_START = 420; // last 30 frames: a completely still hold, no motion at all

export const Scene21_SunriseFinal: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const groundY = height * 0.9;
  const mainX = width * 0.5;

  // Sun climbs steadily across the entire scene.
  const riseProgress = interpolate(frame, [0, 450], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Main figure: walking-in-place toward the sunrise, low postureBend (the
  // most upright walk in the whole video), then easing into a final,
  // perfectly still standing pose for the last beat of the video.
  const walkFrame = Math.min(frame, SETTLE_FRAME); // freeze the walk phase once settling begins
  const walkPose = walkCyclePose(walkFrame * 0.14, 0.05);
  const settleT = interpolate(frame, [SETTLE_FRAME, HOLD_START], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const mainPose =
    frame < HOLD_START
      ? interpolatePose(walkPose, POSES.standingTallFinal, settleT)
      : POSES.standingTallFinal; // true still hold for the final 30 frames

  // Ghost of the original Scene01 self: a heavily hunched walk, trailing
  // just behind and below the main figure, fading out well before the end.
  const ghostOpacity = interpolate(frame, [0, GHOST_FADE_END], [0.25, 0], {
    extrapolateRight: "clamp",
  });
  const ghostPose = walkCyclePose(frame * 0.1, POSES.slumpedFloor.postureBend);

  return (
    <>
      <SunriseEnding width={width} height={height} riseProgress={riseProgress} />

      {ghostOpacity > 0.01 && (
        <StickFigure
          pose={ghostPose}
          position={{ x: mainX - 60, y: groundY + 4 }}
          scale={0.96}
          stroke={palette.figureStroke}
          opacity={ghostOpacity}
        />
      )}

      <StickFigure pose={mainPose} position={{ x: mainX, y: groundY }} stroke={palette.figureStroke} />
    </>
  );
};

export default Scene21_SunriseFinal;
