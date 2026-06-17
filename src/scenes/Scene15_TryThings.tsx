import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { RoomScene } from "../components/RoomScene";
import { StickFigure, POSES, Pose, pushupArmsPose, typingPose } from "../components/StickFigure";
import { activeBeatIndex } from "../utils/poseSequence";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 15 - TRY THINGS (5:20-5:45)
// Five quick activities in the same space: work, exercise, read, help
// someone, build something. You find yourself by doing, not by thinking.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const BEAT_LENGTH = 150;
const BEAT_COUNT = 5;
const DISSOLVE = 6;

function beatOpacity(localFrame: number) {
  const fadeIn = interpolate(localFrame, [0, DISSOLVE], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(localFrame, [BEAT_LENGTH - DISSOLVE, BEAT_LENGTH], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(fadeIn, fadeOut);
}

export const Scene15_TryThings: React.FC<SceneProps> = ({ width, height, palette }) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const beatIdx = activeBeatIndex(frame, BEAT_LENGTH, BEAT_COUNT);
  const localFrame = frame - beatIdx * BEAT_LENGTH;
  const opacity = beatOpacity(localFrame);
  const centerX = width * 0.46;

  let pose: Pose;
  let extras: React.ReactNode = null;

  switch (beatIdx) {
    case 0:
      pose = typingPose;
      extras = (
        <rect x={centerX - 50} y={floorY - 66} width={100} height={12} rx={3} fill={palette.wallShadow} />
      );
      break;
    case 1:
      pose = pushupArmsPose(localFrame * 0.3);
      break;
    case 2:
      pose = POSES.readingSeated;
      extras = (
        <rect x={centerX - 14} y={floorY - 96} width={32} height={24} fill="none" stroke={palette.figureStroke} strokeWidth={2.5} />
      );
      break;
    case 3:
      pose = POSES.helpingCarry;
      extras = (
        <StickFigure
          pose={POSES.helpingCarry}
          position={{ x: centerX + 90, y: floorY }}
          scale={0.92}
          stroke={palette.figureStroke}
          opacity={0.85}
          mirrored
        />
      );
      break;
    case 4:
    default:
      pose = POSES.stackingBlocks;
      extras = (
        <g>
          <rect x={centerX - 20} y={floorY - 18} width={26} height={18} rx={3} fill={palette.accentWarm} opacity={0.8} />
          <rect x={centerX - 16} y={floorY - 36} width={20} height={18} rx={3} fill={palette.accentWarm} opacity={0.65} />
        </g>
      );
      break;
  }

  return (
    <g opacity={opacity}>
      <RoomScene
        width={width}
        height={height}
        palette={palette}
        clutterLevel={0.4}
        lightLevel={0.55}
        curtainsOpen={0.6}
        frame={frame}
      />
      <StickFigure pose={pose} position={{ x: centerX, y: floorY }} stroke={palette.figureStroke} />
      {extras}
    </g>
  );
};

export default Scene15_TryThings;
