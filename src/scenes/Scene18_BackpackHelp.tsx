import React from "react";
import { useCurrentFrame, interpolate, spring } from "remotion";
import { RoomScene } from "../components/RoomScene";
import {
  StickFigure,
  POSES,
  walkCyclePose,
  interpolatePose,
  getFigurePoints,
} from "../components/StickFigure";
import { FPS } from "../timeline";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 18 - BACKPACK HELP (6:30-6:55)
// The character trudges under an oversized, visibly heavy backpack. A second
// figure walks in and takes hold of one strap - the load doesn't disappear,
// but it gets lighter, and posture eases. Visual stand-in for "ask for help."
// ---------------------------------------------------------------------------
// TO CHANGE WHEN THE HELPER ARRIVES: edit HELPER_ARRIVE_FRAME below.
// TO CHANGE HOW HEAVY THE PACK LOOKS: edit the postureBend / backpack scale
// range in mainPostureBend / backpackScale.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const HELPER_START_FRAME = 280; // helper enters the frame
const HELPER_ARRIVE_FRAME = 480; // helper reaches the strap and grabs it

export const Scene18_BackpackHelp: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const mainX = width * 0.42;

  // Posture eases (postureBend drops) once the helper has grabbed the strap.
  // A soft spring rather than a hard cut, since relief arrives gradually.
  const easeSpring = spring({
    frame: frame - HELPER_ARRIVE_FRAME,
    fps: FPS,
    config: { damping: 16 },
  });
  const mainPostureBend = interpolate(
    Math.max(0, Math.min(1, easeSpring)),
    [0, 1],
    [0.3, 0.15]
  );

  // The backpack's visual weight is tied directly to the same postureBend
  // value - a heavier-looking pack for a more hunched figure, and a lighter
  // one once it's shared. This keeps the two reads (body + prop) in sync
  // without two separate animation curves to keep aligned.
  const backpackScale = interpolate(mainPostureBend, [0.15, 0.3], [0.85, 1]);

  // Main figure: a slow, heavy trudge-in-place the whole scene. The walk
  // phase keeps advancing throughout (so it never looks "stuck"), while
  // postureBend (passed into the same pose generator) is what visibly
  // changes once help arrives.
  const mainPose = walkCyclePose(frame * 0.1, mainPostureBend);

  // Helper figure: walks in from off-screen right, then settles into the
  // "liftingStrap" pose once it arrives at the main character's side.
  const helperWalkInT = interpolate(
    frame,
    [HELPER_START_FRAME, HELPER_ARRIVE_FRAME],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const helperX = interpolate(
    helperWalkInT,
    [0, 1],
    [width * 1.15, mainX + 86]
  );
  const liftTransitionT = interpolate(
    frame,
    [HELPER_ARRIVE_FRAME, HELPER_ARRIVE_FRAME + 40],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const helperWalkPose = walkCyclePose(frame * 0.22, 0.1);
  const helperPose =
    frame < HELPER_ARRIVE_FRAME
      ? helperWalkPose
      : interpolatePose(helperWalkPose, POSES.liftingStrap, liftTransitionT);

  const helperOpacity = interpolate(frame, [HELPER_START_FRAME, HELPER_START_FRAME + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Backpack is anchored to the midpoint of the spine (between hip and
  // neck) so it stays attached to the back through every frame of the
  // trudge cycle, including the subtle bob from postureBend.
  const mainPts = getFigurePoints(mainPose, { x: mainX, y: floorY }, 1);
  const backMidX = (mainPts.hip.x + mainPts.neck.x) / 2;
  const backMidY = (mainPts.hip.y + mainPts.neck.y) / 2;
  const backpackW = 64 * backpackScale;
  const backpackH = 86 * backpackScale;

  const lightLevel = interpolate(frame, [0, 750], [0.5, 0.6], {
    extrapolateRight: "clamp",
  });

  return (
    <RoomScene
      width={width}
      height={height}
      palette={palette}
      clutterLevel={0.3}
      lightLevel={lightLevel}
      curtainsOpen={0.65}
      frame={frame}
    >
      {/* backpack body, drawn behind the figure so the torso/legs read as
          in front of the pack */}
      <rect
        x={backMidX - backpackW / 2 - 4}
        y={backMidY - backpackH * 0.55}
        width={backpackW}
        height={backpackH}
        rx={10}
        fill={palette.wallShadow}
        stroke={palette.figureStroke}
        strokeWidth={2.5}
        opacity={0.9}
      />

      <StickFigure pose={mainPose} position={{ x: mainX, y: floorY }} stroke={palette.figureStroke} />

      {/* shoulder straps, drawn on top of the figure so they read as
          wrapping over the shoulders */}
      <line
        x1={mainPts.neck.x - 6}
        y1={mainPts.neck.y - 2}
        x2={backMidX - backpackW / 2}
        y2={backMidY - backpackH * 0.35}
        stroke={palette.figureStroke}
        strokeWidth={3}
        opacity={0.85}
      />
      <line
        x1={mainPts.neck.x + 6}
        y1={mainPts.neck.y - 2}
        x2={backMidX + backpackW / 2}
        y2={backMidY - backpackH * 0.35}
        stroke={palette.figureStroke}
        strokeWidth={3}
        opacity={0.85}
      />

      <StickFigure
        pose={helperPose}
        position={{ x: helperX, y: floorY }}
        scale={0.92}
        stroke={palette.figureStroke}
        opacity={helperOpacity}
        mirrored
      />
    </RoomScene>
  );
};

export default Scene18_BackpackHelp;
