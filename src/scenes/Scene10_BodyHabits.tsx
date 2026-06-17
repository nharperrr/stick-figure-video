import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { RoomScene } from "../components/RoomScene";
import {
  StickFigure,
  POSES,
  Pose,
  walkCyclePose,
  getFigurePoints,
} from "../components/StickFigure";
import { activeBeatIndex } from "../utils/poseSequence";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 10 - BODY HABITS (3:20-3:45)
// Four quick beats: walk, lift a dumbbell overhead, eat, turn off the phone
// and lie down to sleep. Posture (StickFigure.postureBend) improves subtly
// and continuously across all four beats - this is the scene's main visual
// throughline, not any single action.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const BEAT_LENGTH = 187;
const BEAT_COUNT = 4;
const DISSOLVE = 10;

function beatOpacity(localFrame: number) {
  const fadeIn = interpolate(localFrame, [0, DISSOLVE], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(localFrame, [BEAT_LENGTH - DISSOLVE, BEAT_LENGTH], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(fadeIn, fadeOut);
}

export const Scene10_BodyHabits: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const beatIdx = activeBeatIndex(frame, BEAT_LENGTH, BEAT_COUNT);
  const localFrame = frame - beatIdx * BEAT_LENGTH;
  const opacity = beatOpacity(localFrame);
  const centerX = width * 0.46;

  // Posture improves continuously across the whole scene, independent of
  // which beat is active.
  const postureBend = interpolate(frame, [0, 748], [0.25, 0.12], {
    extrapolateRight: "clamp",
  });

  let pose: Pose;
  let extras: React.ReactNode = null;
  let lightLevel = 0.5;

  if (beatIdx === 0) {
    pose = { ...walkCyclePose(localFrame * 0.25, postureBend) };
  } else if (beatIdx === 1) {
    pose = { ...POSES.overheadLift, postureBend };
    const pts = getFigurePoints(pose, { x: centerX, y: floorY });
    extras = (
      <line
        x1={pts.handL.x}
        y1={pts.handL.y}
        x2={pts.handR.x}
        y2={pts.handR.y}
        stroke={palette.figureStroke}
        strokeWidth={6}
        strokeLinecap="round"
      />
    );
  } else if (beatIdx === 2) {
    pose = { ...POSES.eatingSeated, postureBend };
    extras = (
      <ellipse cx={centerX - 10} cy={floorY - 50} rx={20} ry={8} fill="none" stroke={palette.figureStroke} strokeWidth={3} />
    );
  } else {
    pose = { ...POSES.lyingDown, postureBend: Math.min(postureBend, 0.12) };
    lightLevel = 0.18; // room dims for sleep
  }

  return (
    <g opacity={opacity}>
      <RoomScene
        width={width}
        height={height}
        palette={palette}
        clutterLevel={0.5}
        lightLevel={lightLevel}
        curtainsOpen={0.5}
        frame={frame}
      />
      <StickFigure pose={pose} position={{ x: centerX, y: floorY }} stroke={palette.figureStroke} />
      {extras}
    </g>
  );
};

export default Scene10_BodyHabits;
