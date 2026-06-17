import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, POSES, Pose } from "../components/StickFigure";
import { poseSequence, activeBeatIndex } from "../utils/poseSequence";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 05 - FIRST PROOF (1:15-1:40)
// Three tiny actions, back to back: make the bed, pick up one piece of
// trash, open the curtains. The room becomes only slightly cleaner and
// brighter - the point is the action, not a dramatic transformation yet.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const BEAT_LENGTH = 250; // 3 beats x 250 frames = 750 frames (25s)

const BEATS: Pose[] = [POSES.makeBed, POSES.pickUpTrash, POSES.openCurtains];
// Roughly where in the room each beat happens (bed, floor clutter, window).
const BEAT_X = [0.34, 0.5, 0.74];

export const Scene05_FirstProof: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const duration = 750;

  const pose = poseSequence(frame, BEATS, BEAT_LENGTH, 30);
  const beatIdx = activeBeatIndex(frame, BEAT_LENGTH, BEATS.length);
  const localFrame = frame - beatIdx * BEAT_LENGTH;
  const prevX = width * BEAT_X[Math.max(0, beatIdx - 1)];
  const targetX = width * BEAT_X[beatIdx];
  const xT = beatIdx === 0 ? 1 : interpolate(localFrame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const figureX = beatIdx === 0 ? targetX : prevX + (targetX - prevX) * xT;

  const clutterLevel = interpolate(frame, [0, duration], [1, 0.8], {
    extrapolateRight: "clamp",
  });
  const lightLevel = interpolate(frame, [0, duration], [0.3, 0.45], {
    extrapolateRight: "clamp",
  });
  const curtainsOpen = interpolate(frame, [500, 700], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <RoomScene
      width={width}
      height={height}
      palette={palette}
      clutterLevel={clutterLevel}
      lightLevel={lightLevel}
      curtainsOpen={curtainsOpen}
      frame={frame}
    >
      <StickFigure
        pose={pose}
        position={{ x: figureX, y: floorY }}
        stroke={palette.figureStroke}
      />
    </RoomScene>
  );
};

export default Scene05_FirstProof;
