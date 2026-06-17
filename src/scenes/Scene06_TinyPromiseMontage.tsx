import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { RoomScene } from "../components/RoomScene";
import {
  StickFigure,
  Pose,
  walkCyclePose,
  pushupArmsPose,
  typingPose,
  wipingDeskPose,
  talkingPose,
} from "../components/StickFigure";
import { activeBeatIndex } from "../utils/poseSequence";
import { SceneProps } from "./types";

// ---------------------------------------------------------------------------
// SCENE 06 - TINY PROMISE MONTAGE (1:40-2:05)
// Five small, almost-stupidly-small actions in quick succession: pushups,
// a walk, a job application, cleaning one corner, sending one message.
// Each beat lasts 150 frames (5s) with a quick dissolve between beats. One
// glowing dot accumulates per finished beat, foreshadowing CalendarBlocks.
// ---------------------------------------------------------------------------
// TO CHANGE BEAT LENGTH OR ORDER: edit BEAT_LENGTH / the beat array below.
// ---------------------------------------------------------------------------

const FLOOR_Y_RATIO = 0.82;
const BEAT_LENGTH = 150;
const BEAT_COUNT = 5;
const DISSOLVE = 8;

function beatOpacity(localFrame: number) {
  const fadeIn = interpolate(localFrame, [0, DISSOLVE], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    localFrame,
    [BEAT_LENGTH - DISSOLVE, BEAT_LENGTH],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return Math.min(fadeIn, fadeOut);
}

export const Scene06_TinyPromiseMontage: React.FC<SceneProps> = ({
  width,
  height,
  palette,
}) => {
  const frame = useCurrentFrame();
  const floorY = height * FLOOR_Y_RATIO;
  const beatIdx = activeBeatIndex(frame, BEAT_LENGTH, BEAT_COUNT);
  const localFrame = frame - beatIdx * BEAT_LENGTH;
  const opacity = beatOpacity(localFrame);
  const centerX = width * 0.5;

  let pose: Pose;
  let extras: React.ReactNode = null;

  switch (beatIdx) {
    case 0: {
      // Pushups: prone, repeating arm bend, anchored low near the floor.
      pose = pushupArmsPose(localFrame * 0.3);
      break;
    }
    case 1: {
      // Walk past a simple outdoor silhouette (a building block shape).
      pose = walkCyclePose(localFrame * 0.25, 0.16);
      extras = (
        <rect
          x={width * 0.78}
          y={height * 0.45}
          width={width * 0.1}
          height={height * 0.37}
          fill={palette.wallShadow}
          opacity={0.5}
        />
      );
      break;
    }
    case 2: {
      // Typing a job application on a laptop - a blank form icon nearby.
      pose = typingPose;
      extras = (
        <g>
          <rect
            x={centerX - 60}
            y={floorY - 70}
            width={120}
            height={14}
            rx={3}
            fill={palette.wallShadow}
          />
          <rect
            x={centerX + 50}
            y={floorY - 110}
            width={46}
            height={60}
            rx={4}
            fill="none"
            stroke={palette.figureStroke}
            strokeWidth={3}
            opacity={0.7}
          />
        </g>
      );
      break;
    }
    case 3: {
      // Wiping one desk corner clean.
      pose = wipingDeskPose;
      extras = (
        <rect
          x={centerX - 40}
          y={floorY - 26}
          width={150}
          height={16}
          rx={3}
          fill={palette.wallShadow}
        />
      );
      break;
    }
    case 4:
    default: {
      // Sending one honest message to another simple figure.
      pose = talkingPose;
      extras = (
        <g>
          <StickFigure
            pose={talkingPose}
            position={{ x: centerX + 160, y: floorY }}
            scale={0.95}
            stroke={palette.figureStroke}
            opacity={0.85}
            mirrored
          />
          <g transform={`translate(${centerX + 60}, ${floorY - 150})`}>
            <rect
              x={-26}
              y={-18}
              width={52}
              height={32}
              rx={10}
              fill="none"
              stroke={palette.figureStroke}
              strokeWidth={3}
            />
            <path d="M -4 14 L 4 14 L 0 24 Z" fill={palette.figureStroke} />
          </g>
        </g>
      );
      break;
    }
  }

  return (
    <g opacity={opacity}>
      <RoomScene
        width={width}
        height={height}
        palette={palette}
        clutterLevel={0.75}
        lightLevel={0.45}
        curtainsOpen={0.4}
        frame={frame}
      />

      <StickFigure pose={pose} position={{ x: centerX, y: floorY }} stroke={palette.figureStroke} />
      {extras}

      {/* accumulating glowing dots, one per completed beat */}
      <g>
        {Array.from({ length: BEAT_COUNT }).map((_, i) => {
          const lit = i < beatIdx || (i === beatIdx && localFrame > BEAT_LENGTH * 0.3);
          return (
            <circle
              key={i}
              cx={width * 0.38 + i * 36}
              cy={height * 0.93}
              r={8}
              fill={palette.accentWarm}
              opacity={lit ? 0.9 : 0.15}
            />
          );
        })}
      </g>
    </g>
  );
};

export default Scene06_TinyPromiseMontage;
